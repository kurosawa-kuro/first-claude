import express from 'express';
import { getUserMicroposts, createUserMicropost } from '../controllers/micropostController.js';

const router = express.Router();

// GET /users/:userId/microposts
router.get('/:userId/microposts', getUserMicroposts);

// POST /users/:userId/microposts
router.post('/:userId/microposts', createUserMicropost);

export default router;