import express from 'express';
import { register, login, getProfile, updateProfile, uploadAvatarImage } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, uploadAvatar.single('avatar'), uploadAvatarImage);

export default router;
