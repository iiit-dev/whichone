import express from 'express';
import { authenticate, extractUserId } from '../middlewares/auth.js';
import walletService from '../services/walletService.js';

const router = express.Router();

// Get wallet balance and total earnings
router.get('/balance', authenticate, extractUserId, async (req, res) => {
    try {
        const { userId } = req;
        const balanceInfo = await walletService.getWalletBalance(userId);
        
        return res.status(200).json(balanceInfo);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Get wallet transaction history
router.get('/history', authenticate, extractUserId, async (req, res) => {
    try {
        const { userId } = req;
        const { limit = 20, offset = 0 } = req.query;
        
        const transactions = await walletService.getWalletHistory(userId, parseInt(limit), parseInt(offset));
        
        return res.status(200).json({ transactions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Add funds to wallet (simulation - in real app would integrate with payment gateway)
router.post('/deposit', authenticate, extractUserId, async (req, res) => {
    try {
        const { userId } = req;
        const { amount, payment_method = 'simulation' } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        if (amount > 1000) {
            return res.status(400).json({ message: 'Maximum deposit amount is $1000' });
        }
        
        const result = await walletService.addFunds(userId, parseFloat(amount), `deposit-${Date.now()}`);
        
        return res.status(200).json({
            message: 'Funds added successfully',
            ...result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Withdraw funds from wallet
router.post('/withdraw', authenticate, extractUserId, async (req, res) => {
    try {
        const { userId } = req;
        const { amount, withdrawal_method = 'bank_transfer' } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        if (amount < 5) {
            return res.status(400).json({ message: 'Minimum withdrawal amount is $5' });
        }
        
        const result = await walletService.withdrawFunds(userId, parseFloat(amount), withdrawal_method);
        
        return res.status(200).json({
            message: 'Withdrawal requested successfully',
            ...result
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'Insufficient balance') {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Calculate poll fee for a given number of votes
router.get('/poll-fee/:maxVotes', authenticate, extractUserId, async (req, res) => {
    try {
        const { maxVotes } = req.params;
        const maxVotesNum = parseInt(maxVotes);
        
        if (!maxVotesNum || maxVotesNum < 1) {
            return res.status(400).json({ message: 'Invalid max votes' });
        }
        
        const fee = walletService.calculatePollFee(maxVotesNum);
        const rewardPool = walletService.calculateRewardPool(fee);
        
        return res.status(200).json({
            maxVotes: maxVotesNum,
            pollFee: fee,
            rewardPool: rewardPool,
            isFree: fee === 0,
            breakdown: {
                baseFee: fee > 0 ? 5.00 : 0,
                perResponseFee: fee > 0 ? (maxVotesNum - 10) * 0.50 : 0,
                platformCommission: fee * 0.10,
                voterRewards: rewardPool
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Check if user can afford a poll
router.get('/can-afford/:maxVotes', authenticate, extractUserId, async (req, res) => {
    try {
        const { userId } = req;
        const { maxVotes } = req.params;
        const maxVotesNum = parseInt(maxVotes);
        
        if (!maxVotesNum || maxVotesNum < 1) {
            return res.status(400).json({ message: 'Invalid max votes' });
        }
        
        const canAfford = await walletService.canAffordPoll(userId, maxVotesNum);
        const requiredFee = walletService.calculatePollFee(maxVotesNum);
        const currentBalance = (await walletService.getWalletBalance(userId)).balance;
        
        return res.status(200).json({
            canAfford,
            requiredFee,
            currentBalance,
            shortfall: canAfford ? 0 : requiredFee - currentBalance
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router; 