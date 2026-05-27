import { Router } from 'express';
import { searchUser, updateProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/search', searchUser);
router.put('/profile', updateProfile);

export default router;
