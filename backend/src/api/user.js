import express from "express";
import { models } from '../database/index.js';
import { authenticateAndAuthorize, authenticate } from '../middlewares/auth.js';
// Debug logging
console.log("Initializing Users model");
const Users = models.Users;
console.log("Users model initialized:", !!Users);
const router = express.Router();
// Get user profile route : http://0.0.0.0:6000/api/v1/user/1 
router.get(
    "/:id", 
    authenticateAndAuthorize('id'),
    async (req, res) => { 
        try {
            console.log("Received request for user ID:", req.params.id);
            
            // Set headers to prevent caching
            res.set({
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            
            const user = await Users.findByPk(req.params.id, {
                include: [{
                    model: models.Profile,
                    as: 'profile'
                }, {
                    model: models.Polls,
                    as: 'polls'
                }]
            });
            console.log("Found user:", user);
            if (user) {
                return res.status(200).json({ 
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    profile: user.profile,
                    polls: user.polls
                });
            } else {
                return res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
);
// Update username route without ID in URL: http://0.0.0.0:6000/api/v1/user/update-username
router.put(
    "/:userId/update-username", 
    authenticateAndAuthorize('userId'),
    async (req, res) => {
        try {             
            const { username } = req.body;
            const userId = req.user.id;
            if (!username || username.trim() === '') {
                return res.status(400).json({ error: 'Username cannot be empty' });
            }
            // Check if username is already taken
            const existingUser = await Users.findOne({ where: { username } });
            if (existingUser && existingUser.id != userId) {
                return res.status(400).json({ error: 'Username already taken' });
            }
            // Update the username
            const user = await Users.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            user.username = username;
            await user.save();

            return res.status(200).json({ 
                message: 'Username updated successfully',
                username: user.username
            });
        } catch (error) {
            console.error("Error updating username:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
);

// Temporary testing route without authentication
router.put(
    "/test/update-username", 
    async (req, res) => {
        try {            
            console.log("Request body in test route:", req.body);
            const { username } = req.body;
            
            if (!username || username.trim() === '') {
                return res.status(400).json({ error: 'Username cannot be empty' });
            }
            
            return res.status(200).json({ 
                message: 'Username received successfully',
                username: username
            });
        } catch (error) {
            console.error("Error in test endpoint:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
);

export default router;