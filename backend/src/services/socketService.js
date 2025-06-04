import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { models } from '../database/index.js';

let io = null;
const connectedUsers = new Map(); // userId -> socketId mapping
const pollRooms = new Map(); // pollId -> Set of userIds

const initialize = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.use(authenticateSocket);
    io.on('connection', handleConnection);

    console.log('WebSocket server initialized');
    return io;
};

const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await models.Users.findByPk(decoded.userId);
        
        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user.id;
        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Authentication error: Invalid token'));
    }
};

const handleConnection = (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    // Store connection
    connectedUsers.set(socket.userId, socket.id);

    // Join poll rooms for polls the user is following
    socket.on('join-poll', (pollId) => {
        joinPollRoom(socket, pollId);
    });

    socket.on('leave-poll', (pollId) => {
        leavePollRoom(socket, pollId);
    });

    // Handle poll viewing (for analytics)
    socket.on('view-poll', async (pollId) => {
        await trackPollView(pollId, socket.userId);
    });

    // Handle poll sharing
    socket.on('share-poll', async (data) => {
        await trackPollShare(data.pollId, data.source, socket.userId);
    });

    socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        connectedUsers.delete(socket.userId);
        
        // Remove from all poll rooms
        for (let [pollId, users] of pollRooms) {
            users.delete(socket.userId);
            if (users.size === 0) {
                pollRooms.delete(pollId);
            }
        }
    });
};

const joinPollRoom = (socket, pollId) => {
    const roomName = `poll-${pollId}`;
    socket.join(roomName);
    
    if (!pollRooms.has(pollId)) {
        pollRooms.set(pollId, new Set());
    }
    pollRooms.get(pollId).add(socket.userId);
    
    console.log(`User ${socket.userId} joined poll room ${pollId}`);
};

const leavePollRoom = (socket, pollId) => {
    const roomName = `poll-${pollId}`;
    socket.leave(roomName);
    
    if (pollRooms.has(pollId)) {
        pollRooms.get(pollId).delete(socket.userId);
        if (pollRooms.get(pollId).size === 0) {
            pollRooms.delete(pollId);
        }
    }
    
    console.log(`User ${socket.userId} left poll room ${pollId}`);
};

// Broadcast vote update to all users in poll room
const broadcastVoteUpdate = async (pollId, voteData) => {
    const roomName = `poll-${pollId}`;
    
    // Get updated poll data
    const poll = await models.Polls.findByPk(pollId, {
        include: [
            {
                model: models.Users,
                as: 'creator',
                attributes: ['id', 'username', 'name']
            }
        ]
    });

    if (poll) {
        io.to(roomName).emit('vote-update', {
            pollId,
            votesCountA: poll.votes_count_a,
            votesCountB: poll.votes_count_b,
            totalVotes: poll.votes_count_a + poll.votes_count_b,
            status: poll.status,
            voterInfo: voteData
        });

        console.log(`Broadcasted vote update for poll ${pollId} to room ${roomName}`);
    }
};

// Broadcast poll status change (e.g., closed)
const broadcastPollStatusChange = async (pollId, status) => {
    const roomName = `poll-${pollId}`;
    
    io.to(roomName).emit('poll-status-change', {
        pollId,
        status,
        timestamp: new Date()
    });

    console.log(`Broadcasted status change for poll ${pollId}: ${status}`);
};

// Broadcast new poll to interested users (based on filters)
const broadcastNewPoll = async (poll) => {
    // Implement logic to notify users based on their interests/filters
    io.emit('new-poll', {
        poll: poll,
        timestamp: new Date()
    });
};

// Send real-time reward notification
const notifyRewardEarned = async (userId, rewardData) => {
    const socketId = connectedUsers.get(userId);
    if (socketId) {
        io.to(socketId).emit('reward-earned', {
            amount: rewardData.amount,
            pollId: rewardData.pollId,
            description: rewardData.description,
            timestamp: new Date()
        });
    }
};

// Track poll views for analytics
const trackPollView = async (pollId, userId) => {
    try {
        // Update poll view count
        await models.Polls.increment('views_count', { where: { id: pollId } });
        
        // Update analytics
        const analytics = await models.PollAnalytics.findOne({ where: { poll_id: pollId } });
        if (analytics) {
            // Update bounce rate and engagement metrics
            // This would be more complex in a real implementation
            console.log(`Tracked view for poll ${pollId} by user ${userId}`);
        }
    } catch (error) {
        console.error('Error tracking poll view:', error);
    }
};

// Track poll shares for analytics
const trackPollShare = async (pollId, source, userId) => {
    try {
        // Update poll share count
        await models.Polls.increment('shares_count', { where: { id: pollId } });
        
        // Update analytics with share source
        const analytics = await models.PollAnalytics.findOne({ where: { poll_id: pollId } });
        if (analytics) {
            const shareData = analytics.share_sources || {};
            shareData[source] = (shareData[source] || 0) + 1;
            
            await analytics.update({
                share_sources: shareData,
                last_updated: new Date()
            });
        }
        
        console.log(`Tracked share for poll ${pollId} from ${source} by user ${userId}`);
    } catch (error) {
        console.error('Error tracking poll share:', error);
    }
};

// Get real-time statistics
const getRealtimeStats = () => {
    return {
        connectedUsers: connectedUsers.size,
        activePollRooms: pollRooms.size,
        totalViewers: Array.from(pollRooms.values()).reduce((sum, users) => sum + users.size, 0)
    };
};

export default {
    initialize,
    broadcastVoteUpdate,
    broadcastPollStatusChange,
    broadcastNewPoll,
    notifyRewardEarned,
    getRealtimeStats
}; 