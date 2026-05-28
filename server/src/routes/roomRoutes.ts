import { Router } from 'express';
import {
  getRooms,
  createRoom,
  getRoom,
  updateRoom,
  deleteRoom,
  inviteUser,
  getRoomMessages,
} from '../controllers/roomController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getRooms);
router.post('/', createRoom);
router.get('/:id', getRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);
router.post('/:id/invite', inviteUser);
router.get('/:id/messages', getRoomMessages);

export default router;
