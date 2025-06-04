import express from 'express';
import { models } from '../database/index.js';
import sequelize from '../database/index.js';
import { authenticate, extractUserId } from '../middlewares/auth.js';
import { Op } from 'sequelize';
import upload from '../middlewares/uploadMiddleware.js';
import walletService from '../services/walletService.js';
import analyticsService from '../services/analyticsService.js';
import socketService from '../services/socketService.js';

const router = express.Router();

// Get active polls matching user filters (for discovery)
router.get('/discover', authenticate, extractUserId, async (req, res) => {
    try {
        const { userId } = req;
        
        // First get poll IDs that the user has already voted on
        const votedPollIds = await models.Votes.findAll({
            where: { user_id: userId },
            attributes: ['poll_id'],
            raw: true
        });
        
        const excludeIds = votedPollIds.map(vote => vote.poll_id);
        
        // Get polls that are active, user hasn't voted on, and user didn't create
        const polls = await models.Polls.findAll({
            where: {
                status: 'ACTIVE',
                creator_id: {
                    [Op.ne]: userId  // Exclude polls created by the user
                },
                ...(excludeIds.length > 0 && {
                    id: {
                        [Op.notIn]: excludeIds
                    }
                })
            },
            include: [
                {
                    model: models.PollFilters,
                    as: 'filters'
                },
                {
                    model: models.Users,
                    as: 'creator',
                    attributes: ['id', 'username', 'name']
                }
            ],
            limit: 10,
            order: [['created_at', 'DESC']]
        });
         
        return res.status(200).json({ polls });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}); 

// Get a specific poll by ID
router.get('/:id', authenticate ,async (req, res) => {
    try {
        const { id } = req.params;
        
        const poll = await models.Polls.findByPk(id, {
            include: [
                {
                    model: models.PollFilters,
                    as: 'filters'
                },
                {
                    model: models.Users,
                    as: 'creator',
                    attributes: ['id', 'username', 'name']
                }
            ]
        });
        
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }
        
        return res.status(200).json({ poll });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new poll with optional image uploads and payment processing
router.post('/', authenticate, extractUserId, upload.fields([
    { name: 'option_a_url', maxCount: 1 },
    { name: 'option_b_url', maxCount: 1 }
]), async (req, res) => {
    try {
        const { userId } = req;
        const { 
            question, 
            option_a_text,
            option_b_text,
            max_votes, 
            time_limit,
            filters,
            is_paid,
            demographic_filters
        } = req.body;
        
        // Validate required fields
        if (!question || !option_a_text || !option_b_text) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const maxVotesNum = parseInt(max_votes) || 10;
        
        // Check if user can afford the poll if it's paid
        if (maxVotesNum > 10) {
            const canAfford = await walletService.canAffordPoll(userId, maxVotesNum);
            if (!canAfford) {
                const requiredFee = walletService.calculatePollFee(maxVotesNum);
                return res.status(400).json({ 
                    message: 'Insufficient wallet balance',
                    requiredFee,
                    currentBalance: (await walletService.getWalletBalance(userId)).balance
                });
            }
        }
        
        // Calculate expiration time if time_limit is provided
        let expires_at = null;
        if (time_limit) {
            expires_at = new Date();
            expires_at.setMinutes(expires_at.getMinutes() + time_limit);
        }
        
        // Handle image uploads if present
        let option_a_url = null;
        let option_b_url = null;
        
        if (req.files) {
            if (req.files.option_a_url && req.files.option_a_url[0]) {
                option_a_url = `${req.protocol}://${req.get('host')}/uploads/${req.files.option_a_url[0].filename}`;
            }
            
            if (req.files.option_b_url && req.files.option_b_url[0]) {
                option_b_url = `${req.protocol}://${req.get('host')}/uploads/${req.files.option_b_url[0].filename}`;
            }
        }
        
        // Create poll
        const poll = await models.Polls.create({
            creator_id: userId,
            question,
            option_a_text,
            option_b_text,
            option_a_url,
            option_b_url,
            max_votes: maxVotesNum,
            time_limit,
            expires_at,
            status: 'ACTIVE',
            is_paid: is_paid || false,
            demographic_filters: demographic_filters ? JSON.parse(demographic_filters) : null
        });
        
        // Process payment if poll is paid
        if (maxVotesNum > 10) {
            try {
                const paymentResult = await walletService.processPollPayment(userId, poll.id, maxVotesNum);
                if (!paymentResult.success) {
                    await poll.destroy();
                    return res.status(400).json({ message: 'Payment processing failed' });
                }
            } catch (paymentError) {
                await poll.destroy();
                return res.status(400).json({ message: paymentError.message });
            }
        }

        // Create filters if provided
        if (filters && filters.length > 0) {
            const poll_filters = filters.map(filter => ({
                poll_id: poll.id,
                filter_type: filter.type,
                filter_value: filter.value
            }));
            
            await models.PollFilters.bulkCreate(poll_filters);
        }

        // Create analytics record
        await models.PollAnalytics.create({
            poll_id: poll.id,
            age_groups: {},
            gender_breakdown: {},
            location_breakdown: {},
            vote_timeline: {},
            share_sources: {}
        });

        // Update user stats
        await models.Users.increment('total_polls_created', { where: { id: userId } });

        // Broadcast new poll to interested users
        await socketService.broadcastNewPoll(poll);
        
        return res.status(201).json({ 
            message: 'Poll created successfully',
            poll
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
 
// Vote on a poll with real-time updates and reward processing
router.post('/:id/vote', authenticate, extractUserId, async (req, res) => {
    try { 
        const { id } = req.params;
        const { userId } = req;
        const { selectedOption } = req.body;
        
        if (!selectedOption || !['A', 'B'].includes(selectedOption)) {
            return res.status(400).json({ message: 'Invalid selected option' });
        }
        
        // Check if poll exists and is active
        const poll = await models.Polls.findByPk(id);
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }
        
        if (poll.status !== 'ACTIVE') {
            return res.status(400).json({ message: 'Poll is closed' });
        }
        
        // Check if user already voted on this poll
        const existingVote = await models.Votes.findOne({
            where: {
                poll_id: id,
                user_id: userId
            }
        });
        
        if (existingVote) {
            return res.status(400).json({ message: 'User already voted on this poll' });
        }
        
        // Check if poll has reached max votes
        const totalVotes = poll.votes_count_a + poll.votes_count_b;
        if (totalVotes >= poll.max_votes) {
            await poll.update({ status: 'CLOSED' });
            return res.status(400).json({ message: 'Poll has reached maximum votes' });
        }
        
        // Check if poll has expired
        if (poll.expires_at && new Date() > new Date(poll.expires_at)) {
            await poll.update({ status: 'CLOSED' });
            return res.status(400).json({ message: 'Poll has expired' });
        }

        // Get user demographic data for analytics
        const user = await models.Users.findByPk(userId);
        const voteSequence = totalVotes + 1;
        
        // Create vote with demographic data and sequence
        await models.Votes.create({
            poll_id: id,
            user_id: userId,
            selected_option: selectedOption,
            vote_sequence: voteSequence,
            demographic_data: {
                age: user.age,
                gender: user.gender,
                country: user.country,
                location: user.location
            },
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });
        
        // Update poll vote count
        if (selectedOption === 'A') {
            await poll.update({ votes_count_a: poll.votes_count_a + 1 });
        } else {
            await poll.update({ votes_count_b: poll.votes_count_b + 1 });
        }

        // Update user stats
        await user.update({ 
            total_votes_cast: user.total_votes_cast + 1,
            last_active: new Date()
        });

        // Process voter reward if applicable
        let rewardEarned = 0;
        if (poll.is_paid) {
            try {
                const rewardResult = await walletService.processVoterReward(userId, id, voteSequence);
                if (rewardResult.success && rewardResult.reward > 0) {
                    rewardEarned = rewardResult.reward;
                    // Notify user of reward in real-time
                    await socketService.notifyRewardEarned(userId, {
                        amount: rewardEarned,
                        pollId: id,
                        description: `Reward for voting on poll: ${poll.question.substring(0, 30)}...`
                    });
                }
            } catch (rewardError) {
                console.error('Reward processing error:', rewardError);
                // Don't fail the vote, just log the error
            }
        }

        // Update analytics
        await analyticsService.updatePollAnalytics(id, userId, selectedOption);
        
        // Check if poll should be closed after this vote
        const newTotalVotes = selectedOption === 'A' 
            ? poll.votes_count_a + 1 + poll.votes_count_b 
            : poll.votes_count_a + poll.votes_count_b + 1;
            
        if (newTotalVotes >= poll.max_votes) {
            await poll.update({ status: 'CLOSED' });
            await socketService.broadcastPollStatusChange(id, 'CLOSED');
        }

        // Broadcast vote update in real-time
        await socketService.broadcastVoteUpdate(id, {
            userId,
            selectedOption,
            voteSequence,
            rewardEarned,
            totalVotes: newTotalVotes
        });
        
        return res.status(200).json({ 
            message: 'Vote recorded successfully',
            voteSequence,
            rewardEarned,
            updatedPoll: await models.Polls.findByPk(id)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Get polls created by the authenticated user
router.get('/user/created', authenticate, extractUserId, async (req, res) => {
    try {
        const { userId } = req;
        
        const polls = await models.Polls.findAll({
            where: {
                creator_id: userId
            },
            include: [
                {
                    model: models.PollFilters,
                    as: 'filters'
                }
            ],
            order: [['created_at', 'DESC']]
        });
        
        return res.status(200).json({ polls });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Get polls the authenticated user has voted on
router.get('/user/voted', authenticate, extractUserId, async (req, res) => {
    try {
        const { userId } = req;
        
        const votes = await models.Votes.findAll({
            where: {
                user_id: userId
            },
            include: [
                {
                    model: models.Polls,
                    as: 'poll',
                    include: [
                        {
                            model: models.Users,
                            as: 'creator',
                            attributes: ['id', 'username', 'name']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });
        
        return res.status(200).json({ 
            votes: votes.map(vote => ({
                ...vote.toJSON(),
                poll: vote.poll
            }))
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Close a poll (mark as CLOSED)
router.put('/:id/close', authenticate, extractUserId, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        
        const poll = await models.Polls.findByPk(id);
        
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }
        
        // Check if user is the creator of the poll
        if (poll.creator_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to close this poll' });
        }
        
        await poll.update({ status: 'CLOSED' });
        
        // Broadcast status change
        await socketService.broadcastPollStatusChange(id, 'CLOSED');
        
        return res.status(200).json({ 
            message: 'Poll closed successfully',
            poll
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Get poll analytics (for poll creators)
router.get('/:id/analytics', authenticate, extractUserId, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        
        const insights = await analyticsService.getPollInsights(id, userId);
        
        return res.status(200).json({ insights });
    } catch (error) {
        console.error(error);
        if (error.message.includes('access denied')) {
            return res.status(403).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Get creator dashboard with analytics
router.get('/creator/dashboard', authenticate, extractUserId, async (req, res) => {
    try {
        const { userId } = req;
        
        const dashboard = await analyticsService.getCreatorDashboard(userId);
        
        return res.status(200).json({ dashboard });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
