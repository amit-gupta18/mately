import { Router } from 'express';
import { getUserSessions, getRoomSessions, getStats } from '../controllers/sessionController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getUserSessions);
router.get('/stats', getStats);
router.get('/room/:roomId', getRoomSessions);

export default router;
