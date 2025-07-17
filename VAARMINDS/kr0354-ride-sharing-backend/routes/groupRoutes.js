import express from 'express';
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  joinGroup,
  leaveGroup,
  sendGroupMessage,
  createGroupPoll,
  voteInGroupPoll,
  getNearbyGroups
} from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.route('/')
  .post(protect, createGroup)
  .get(protect, getGroups);

router.get('/nearby', protect, getNearbyGroups);

router.route('/:id')
  .get(protect, getGroupById)
  .put(protect, updateGroup);

router.post('/:id/join', protect, joinGroup);
router.post('/:id/leave', protect, leaveGroup);
router.post('/:id/chat', protect, sendGroupMessage);
router.post('/:id/polls', protect, createGroupPoll);
router.post('/:id/polls/:pollId/vote', protect, voteInGroupPoll);

export default router;
