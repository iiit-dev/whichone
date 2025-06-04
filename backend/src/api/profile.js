import express from "express";
import { models } from '../database/index.js';
import { authenticate, authenticateAndAuthorize } from '../middlewares/auth.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Get user profile
router.get(
    "/profile",
    authenticate, 
    async (req, res) => {
        try {
            const userId = req.user.id;
            
            const profile = await models.Profile.findOne({
                where: { user_id: userId }
            });

            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            return res.status(200).json(profile);
        } catch (error) {
            console.error("Error fetching profile:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
);

// Update profile (including profile picture)
router.post(
    "/create-profile",
    authenticate,
    upload.single('profile_pic'),
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { bio, gender, website } = req.body;
            
            // Validate bio length
            if (bio && bio.length > 150) {
                return res.status(400).json({ error: 'Bio cannot exceed 150 characters' });
            }

            // Prepare update data
            const updateData = {
                bio: bio !== undefined ? bio : null,
                gender: gender !== undefined ? gender : null,
                website: website !== undefined ? website : null,
                updated_at: new Date(),
            };

            // If a new profile picture was uploaded, add it to update data
            if (req.file) {
                updateData.profile_pic = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            // Find existing profile or create new one
            const [profile, created] = await models.Profile.findOrCreate({
                where: { user_id: userId },
                defaults: updateData
            });

            // If profile already exists, update it
            if (!created) {
                await profile.update(updateData);
            }

            return res.status(created ? 201 : 200).json(profile);
        } catch (error) {
            console.error("Error updating profile:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
);

export default router;