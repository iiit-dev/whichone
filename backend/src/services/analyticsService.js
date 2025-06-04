import { models } from '../database/index.js';
import { Op } from 'sequelize';

const AGE_GROUPS = {
    '18-25': [18, 25],
    '26-35': [26, 35],
    '36-45': [36, 45],
    '46-55': [46, 55],
    '56+': [56, 100]
};

// Update poll analytics after a vote
const updatePollAnalytics = async (pollId, userId, selectedOption) => {
    try {
        // Get voter demographic data
        const voter = await models.Users.findByPk(userId, {
            attributes: ['age', 'gender', 'country', 'location']
        });

        if (!voter) return;

        // Get or create analytics record
        let analytics = await models.PollAnalytics.findOne({
            where: { poll_id: pollId }
        });

        if (!analytics) {
            analytics = await models.PollAnalytics.create({
                poll_id: pollId,
                age_groups: {},
                gender_breakdown: {},
                location_breakdown: {},
                vote_timeline: {},
                share_sources: {}
            });
        }

        // Update demographic breakdowns
        await updateDemographicBreakdown(analytics, voter, selectedOption);
        await updateVoteTimeline(analytics, selectedOption);
        await updateEngagementMetrics(pollId, analytics);

    } catch (error) {
        console.error('Error updating poll analytics:', error);
    }
};

const updateDemographicBreakdown = async (analytics, voter, selectedOption) => {
    // Update age groups
    if (voter.age) {
        const ageGroup = getAgeGroup(voter.age);
        let ageGroups = analytics.age_groups || {};
        
        if (!ageGroups[ageGroup]) {
            ageGroups[ageGroup] = { A: 0, B: 0 };
        }
        ageGroups[ageGroup][selectedOption]++;
        
        analytics.age_groups = ageGroups;
    }

    // Update gender breakdown
    if (voter.gender) {
        let genderBreakdown = analytics.gender_breakdown || {};
        
        if (!genderBreakdown[voter.gender]) {
            genderBreakdown[voter.gender] = { A: 0, B: 0 };
        }
        genderBreakdown[voter.gender][selectedOption]++;
        
        analytics.gender_breakdown = genderBreakdown;
    }

    // Update location breakdown
    if (voter.country) {
        let locationBreakdown = analytics.location_breakdown || {};
        
        if (!locationBreakdown[voter.country]) {
            locationBreakdown[voter.country] = { A: 0, B: 0 };
        }
        locationBreakdown[voter.country][selectedOption]++;
        
        analytics.location_breakdown = locationBreakdown;
    }

    analytics.last_updated = new Date();
    await analytics.save();
};

const updateVoteTimeline = async (analytics, selectedOption) => {
    const currentHour = new Date().getHours();
    let voteTimeline = analytics.vote_timeline || {};
    
    if (!voteTimeline[currentHour]) {
        voteTimeline[currentHour] = { A: 0, B: 0, total: 0 };
    }
    
    voteTimeline[currentHour][selectedOption]++;
    voteTimeline[currentHour].total++;
    
    analytics.vote_timeline = voteTimeline;
    await analytics.save();
};

const updateEngagementMetrics = async (pollId, analytics) => {
    // Calculate engagement metrics
    const poll = await models.Polls.findByPk(pollId);
    if (!poll) return;

    const totalVotes = poll.votes_count_a + poll.votes_count_b;
    const totalViews = poll.views_count || 1;
    
    // Calculate bounce rate (views without votes)
    const bounceRate = ((totalViews - totalVotes) / totalViews * 100).toFixed(2);
    
    // Find peak voting hour
    const voteTimeline = analytics.vote_timeline || {};
    let peakHour = 0;
    let maxVotes = 0;
    
    for (const [hour, data] of Object.entries(voteTimeline)) {
        if (data.total > maxVotes) {
            maxVotes = data.total;
            peakHour = parseInt(hour);
        }
    }

    analytics.bounce_rate = bounceRate;
    analytics.peak_voting_hour = peakHour;
    await analytics.save();
};

// Get comprehensive analytics for a poll
const getPollInsights = async (pollId, creatorId) => {
    try {
        // Verify creator ownership
        const poll = await models.Polls.findOne({
            where: { id: pollId, creator_id: creatorId },
            include: [
                {
                    model: models.PollAnalytics,
                    as: 'analytics'
                }
            ]
        });

        if (!poll) {
            throw new Error('Poll not found or access denied');
        }

        const analytics = poll.analytics;
        if (!analytics) {
            return getBasicInsights(poll);
        }

        // Get detailed vote information
        const votes = await models.Votes.findAll({
            where: { poll_id: pollId },
            include: [
                {
                    model: models.Users,
                    as: 'user',
                    attributes: ['age', 'gender', 'country', 'education_level', 'income_range']
                }
            ],
            order: [['created_at', 'ASC']]
        });

        return {
            poll: {
                id: poll.id,
                question: poll.question,
                totalVotes: poll.votes_count_a + poll.votes_count_b,
                totalViews: poll.views_count,
                totalShares: poll.shares_count,
                status: poll.status,
                isPaid: poll.is_paid,
                rewardPool: poll.reward_pool,
                createdAt: poll.created_at
            },
            demographics: {
                ageGroups: analytics.age_groups,
                genderBreakdown: analytics.gender_breakdown,
                locationBreakdown: analytics.location_breakdown
            },
            engagement: {
                bounceRate: analytics.bounce_rate,
                peakVotingHour: analytics.peak_voting_hour,
                voteTimeline: analytics.vote_timeline,
                avgTimeToVote: analytics.avg_time_to_vote
            },
            social: {
                shareSources: analytics.share_sources,
                viralCoefficient: analytics.viral_coefficient
            },
            trends: generateTrends(votes),
            recommendations: generateRecommendations(poll, analytics)
        };

    } catch (error) {
        throw error;
    }
};

// Get analytics for all polls by a creator
const getCreatorDashboard = async (creatorId) => {
    try {
        const polls = await models.Polls.findAll({
            where: { creator_id: creatorId },
            include: [
                {
                    model: models.PollAnalytics,
                    as: 'analytics'
                }
            ],
            order: [['created_at', 'DESC']]
        });

        const totalPolls = polls.length;
        const totalVotes = polls.reduce((sum, poll) => sum + poll.votes_count_a + poll.votes_count_b, 0);
        const totalViews = polls.reduce((sum, poll) => sum + (poll.views_count || 0), 0);
        const totalShares = polls.reduce((sum, poll) => sum + (poll.shares_count || 0), 0);
        const totalEarnings = polls.reduce((sum, poll) => sum + parseFloat(poll.poll_fee || 0), 0);

        // Aggregate demographics across all polls
        const aggregatedDemographics = aggregateDemographics(polls);

        return {
            summary: {
                totalPolls,
                totalVotes,
                totalViews,
                totalShares,
                totalEarnings,
                avgVotesPerPoll: (totalVotes / totalPolls).toFixed(1),
                avgViewsPerPoll: (totalViews / totalPolls).toFixed(1)
            },
            demographics: aggregatedDemographics,
            recentPolls: polls.slice(0, 5).map(poll => ({
                id: poll.id,
                question: poll.question,
                votes: poll.votes_count_a + poll.votes_count_b,
                views: poll.views_count,
                status: poll.status,
                createdAt: poll.created_at
            })),
            trends: generateCreatorTrends(polls)
        };

    } catch (error) {
        throw error;
    }
};

// Helper methods
const getAgeGroup = (age) => {
    for (const [group, range] of Object.entries(AGE_GROUPS)) {
        if (age >= range[0] && age <= range[1]) {
            return group;
        }
    }
    return 'Unknown';
};

const getBasicInsights = (poll) => {
    return {
        poll: {
            id: poll.id,
            question: poll.question,
            totalVotes: poll.votes_count_a + poll.votes_count_b,
            totalViews: poll.views_count || 0,
            totalShares: poll.shares_count || 0,
            status: poll.status,
            isPaid: poll.is_paid,
            createdAt: poll.created_at
        },
        demographics: {
            ageGroups: {},
            genderBreakdown: {},
            locationBreakdown: {}
        },
        engagement: {
            bounceRate: 0,
            peakVotingHour: 0,
            voteTimeline: {},
            avgTimeToVote: 0
        },
        social: {
            shareSources: {},
            viralCoefficient: 0
        },
        trends: [],
        recommendations: []
    };
};

const generateTrends = (votes) => {
    const trends = [];
    
    // Vote velocity trend
    if (votes.length > 1) {
        const timeSpan = new Date(votes[votes.length - 1].created_at) - new Date(votes[0].created_at);
        const hoursSpan = timeSpan / (1000 * 60 * 60);
        const votesPerHour = votes.length / hoursSpan;
        
        trends.push({
            type: 'velocity',
            description: `Average ${votesPerHour.toFixed(1)} votes per hour`,
            value: votesPerHour
        });
    }

    // Option preference trend
    const optionAVotes = votes.filter(v => v.selected_option === 'A').length;
    const optionBVotes = votes.filter(v => v.selected_option === 'B').length;
    const preference = optionAVotes > optionBVotes ? 'A' : 'B';
    const margin = Math.abs(optionAVotes - optionBVotes);
    
    trends.push({
        type: 'preference',
        description: `Option ${preference} leading by ${margin} votes`,
        value: margin
    });

    return trends;
};

const generateRecommendations = (poll, analytics) => {
    const recommendations = [];
    
    // Low engagement recommendation
    if (analytics.bounce_rate > 50) {
        recommendations.push({
            type: 'engagement',
            title: 'High Bounce Rate',
            description: 'Consider making your poll question more engaging or adding images',
            priority: 'high'
        });
    }

    // Share recommendation
    if ((poll.shares_count || 0) === 0) {
        recommendations.push({
            type: 'social',
            title: 'No Shares Yet',
            description: 'Share your poll on social media to increase visibility',
            priority: 'medium'
        });
    }

    // Paid poll recommendation
    if (!poll.is_paid && (poll.votes_count_a + poll.votes_count_b) > 8) {
        recommendations.push({
            type: 'monetization',
            title: 'Consider Paid Poll',
            description: 'Your poll is getting good engagement. Consider making your next poll paid for better rewards',
            priority: 'low'
        });
    }

    return recommendations;
};

const aggregateDemographics = (polls) => {
    const aggregated = {
        totalAgeGroups: {},
        totalGenderBreakdown: {},
        totalLocationBreakdown: {}
    };

    polls.forEach(poll => {
        if (poll.analytics) {
            // Aggregate age groups
            Object.entries(poll.analytics.age_groups || {}).forEach(([group, data]) => {
                if (!aggregated.totalAgeGroups[group]) {
                    aggregated.totalAgeGroups[group] = { A: 0, B: 0 };
                }
                aggregated.totalAgeGroups[group].A += data.A;
                aggregated.totalAgeGroups[group].B += data.B;
            });

            // Aggregate gender breakdown
            Object.entries(poll.analytics.gender_breakdown || {}).forEach(([gender, data]) => {
                if (!aggregated.totalGenderBreakdown[gender]) {
                    aggregated.totalGenderBreakdown[gender] = { A: 0, B: 0 };
                }
                aggregated.totalGenderBreakdown[gender].A += data.A;
                aggregated.totalGenderBreakdown[gender].B += data.B;
            });

            // Aggregate location breakdown
            Object.entries(poll.analytics.location_breakdown || {}).forEach(([location, data]) => {
                if (!aggregated.totalLocationBreakdown[location]) {
                    aggregated.totalLocationBreakdown[location] = { A: 0, B: 0 };
                }
                aggregated.totalLocationBreakdown[location].A += data.A;
                aggregated.totalLocationBreakdown[location].B += data.B;
            });
        }
    });

    return aggregated;
};

const generateCreatorTrends = (polls) => {
    const trends = [];
    
    if (polls.length > 1) {
        // Engagement trend over time
        const recentPolls = polls.slice(0, 5);
        const avgEngagement = recentPolls.reduce((sum, poll) => {
            const engagement = poll.views_count > 0 ? 
                ((poll.votes_count_a + poll.votes_count_b) / poll.views_count) * 100 : 0;
            return sum + engagement;
        }, 0) / recentPolls.length;

        trends.push({
            type: 'engagement',
            description: `Average ${avgEngagement.toFixed(1)}% engagement rate`,
            value: avgEngagement
        });
    }

    return trends;
};

export default {
    updatePollAnalytics,
    getPollInsights,
    getCreatorDashboard
}; 