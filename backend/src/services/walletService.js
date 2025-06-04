import { models } from '../database/index.js';
import { Transaction } from 'sequelize';

const POLL_BASE_FEE = 5.00; // Base fee for polls > 10 responses
const POLL_FEE_PER_RESPONSE = 0.50; // Additional fee per expected response
const PLATFORM_COMMISSION = 0.10; // 10% platform commission

// Calculate poll fee based on max votes
const calculatePollFee = (maxVotes) => {
    if (maxVotes <= 10) {
        return 0; // Free for polls up to 10 votes
    }
    
    const extraResponses = maxVotes - 10;
    return POLL_BASE_FEE + (extraResponses * POLL_FEE_PER_RESPONSE);
};

// Calculate reward pool after platform commission
const calculateRewardPool = (pollFee) => {
    return pollFee * (1 - PLATFORM_COMMISSION);
};

// Process poll payment
const processPollPayment = async (userId, pollId, maxVotes) => {
    const transaction = await models.sequelize.transaction();
    
    try {
        const user = await models.Users.findByPk(userId, { transaction });
        const poll = await models.Polls.findByPk(pollId, { transaction });
        
        if (!user || !poll) {
            throw new Error('User or poll not found');
        }

        const pollFee = calculatePollFee(maxVotes);
        
        if (pollFee === 0) {
            await transaction.commit();
            return { success: true, fee: 0, rewardPool: 0 };
        }

        if (user.wallet_balance < pollFee) {
            throw new Error('Insufficient wallet balance');
        }

        const rewardPool = calculateRewardPool(pollFee);
        const rewardPerVoter = rewardPool / Math.min(maxVotes, poll.max_rewarded_voters);

        // Deduct from user wallet
        await user.update({
            wallet_balance: user.wallet_balance - pollFee
        }, { transaction });

        // Update poll with payment info
        await poll.update({
            is_paid: true,
            poll_fee: pollFee,
            reward_pool: rewardPool,
            reward_per_voter: rewardPerVoter
        }, { transaction });

        // Record transaction
        await models.WalletTransactions.create({
            user_id: userId,
            poll_id: pollId,
            transaction_type: 'POLL_PAYMENT',
            amount: -pollFee,
            balance_before: parseFloat(user.wallet_balance) + pollFee,
            balance_after: user.wallet_balance,
            description: `Payment for poll: ${poll.question.substring(0, 50)}...`,
            status: 'COMPLETED'
        }, { transaction });

        await transaction.commit();
        
        return {
            success: true,
            fee: pollFee,
            rewardPool: rewardPool,
            rewardPerVoter: rewardPerVoter
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// Process voter reward
const processVoterReward = async (userId, pollId, voteSequence) => {
    const transaction = await models.sequelize.transaction();
    
    try {
        const poll = await models.Polls.findByPk(pollId, { transaction });
        const user = await models.Users.findByPk(userId, { transaction });
        
        if (!poll || !user) {
            throw new Error('Poll or user not found');
        }

        // Check if poll is paid and has rewards
        if (!poll.is_paid || poll.reward_pool <= 0) {
            await transaction.commit();
            return { success: true, reward: 0 };
        }

        // Check if user is eligible for reward (within first N voters)
        if (voteSequence > poll.max_rewarded_voters) {
            await transaction.commit();
            return { success: true, reward: 0 };
        }

        const rewardAmount = poll.reward_per_voter;

        // Check if there's enough in reward pool
        if (rewardAmount > poll.reward_pool) {
            await transaction.commit();
            return { success: true, reward: 0 };
        }

        // Add to user wallet
        await user.update({
            wallet_balance: parseFloat(user.wallet_balance) + rewardAmount,
            total_earnings: parseFloat(user.total_earnings) + rewardAmount
        }, { transaction });

        // Deduct from poll reward pool
        await poll.update({
            reward_pool: parseFloat(poll.reward_pool) - rewardAmount
        }, { transaction });

        // Record transaction
        await models.WalletTransactions.create({
            user_id: userId,
            poll_id: pollId,
            transaction_type: 'VOTE_REWARD',
            amount: rewardAmount,
            balance_before: parseFloat(user.wallet_balance) - rewardAmount,
            balance_after: user.wallet_balance,
            description: `Reward for voting on poll: ${poll.question.substring(0, 50)}...`,
            status: 'COMPLETED'
        }, { transaction });

        // Update vote record with reward info
        await models.Votes.update({
            reward_earned: rewardAmount,
            reward_paid: true
        }, {
            where: { poll_id: pollId, user_id: userId },
            transaction
        });

        await transaction.commit();
        
        return {
            success: true,
            reward: rewardAmount
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// Add funds to wallet (simulation - in real app would integrate with payment gateway)
const addFunds = async (userId, amount, referenceId = null) => {
    const transaction = await models.sequelize.transaction();
    
    try {
        const user = await models.Users.findByPk(userId, { transaction });
        
        if (!user) {
            throw new Error('User not found');
        }

        const balanceBefore = user.wallet_balance;
        const balanceAfter = parseFloat(balanceBefore) + amount;

        await user.update({
            wallet_balance: balanceAfter
        }, { transaction });

        // Record transaction
        await models.WalletTransactions.create({
            user_id: userId,
            transaction_type: 'DEPOSIT',
            amount: amount,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            description: 'Wallet deposit',
            reference_id: referenceId,
            status: 'COMPLETED'
        }, { transaction });

        await transaction.commit();
        
        return {
            success: true,
            newBalance: balanceAfter
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// Withdraw funds from wallet
const withdrawFunds = async (userId, amount, withdrawalMethod = null) => {
    const transaction = await models.sequelize.transaction();
    
    try {
        const user = await models.Users.findByPk(userId, { transaction });
        
        if (!user) {
            throw new Error('User not found');
        }

        if (user.wallet_balance < amount) {
            throw new Error('Insufficient balance');
        }

        const balanceBefore = user.wallet_balance;
        const balanceAfter = parseFloat(balanceBefore) - amount;

        await user.update({
            wallet_balance: balanceAfter
        }, { transaction });

        // Record transaction
        await models.WalletTransactions.create({
            user_id: userId,
            transaction_type: 'WITHDRAWAL',
            amount: -amount,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            description: `Withdrawal via ${withdrawalMethod || 'default method'}`,
            status: 'PENDING' // Would be updated when withdrawal is processed
        }, { transaction });

        await transaction.commit();
        
        return {
            success: true,
            newBalance: balanceAfter
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// Get wallet history
const getWalletHistory = async (userId, limit = 20, offset = 0) => {
    try {
        const transactions = await models.WalletTransactions.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: models.Polls,
                    as: 'poll',
                    attributes: ['id', 'question']
                }
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        return transactions;
    } catch (error) {
        throw error;
    }
};

// Get wallet balance
const getWalletBalance = async (userId) => {
    try {
        const user = await models.Users.findByPk(userId, {
            attributes: ['id', 'wallet_balance', 'total_earnings']
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            balance: user.wallet_balance,
            totalEarnings: user.total_earnings
        };
    } catch (error) {
        throw error;
    }
};

// Check if user has sufficient funds for poll
const canAffordPoll = async (userId, maxVotes) => {
    try {
        const user = await models.Users.findByPk(userId, {
            attributes: ['wallet_balance']
        });

        if (!user) {
            return false;
        }

        const requiredAmount = calculatePollFee(maxVotes);
        return user.wallet_balance >= requiredAmount;
    } catch (error) {
        return false;
    }
};

export default {
    calculatePollFee,
    calculateRewardPool,
    processPollPayment,
    processVoterReward,
    addFunds,
    withdrawFunds,
    getWalletHistory,
    getWalletBalance,
    canAffordPoll
}; 