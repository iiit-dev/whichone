import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import { authenticate } from '../middlewares/auth.js';
const router = express.Router();

router.post('/', authenticate, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }
    const imagePath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ message: 'Image uploaded successfully', imagePath });
});

export default router;
 