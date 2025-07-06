import express from 'express';
import userRoutes from './userRoutes.js';
import micropostRoutes from './micropostRoutes.js';

const router = express.Router();

// Mount user routes
router.use('/users', userRoutes);

// Mount micropost routes (they include the /users prefix)
router.use('/users', micropostRoutes);

export default router;