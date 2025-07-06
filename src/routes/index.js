import express from 'express';
import userRoutes from './userRoutes.js';
import micropostRoutes from './micropostRoutes.js';
import { getAllMicropostsController, getMicropostByIdController } from '../controllers/micropostController.js';
import { validateRequest } from '../middlewares/validation.js';
import { MicropostQueryParamsSchema, MicropostIdParamsSchema } from '../schemas/micropost.js';
import { createEndpointLimiter } from '../middlewares/rateLimiting.js';

const router = express.Router();

// Rate limiter for micropost endpoints
const micropostLimiter = createEndpointLimiter({
  max: 50, // 50 requests per window for general micropost access
  message: {
    success: false,
    error: {
      code: 'MICROPOST_RATE_LIMIT_EXCEEDED',
      message: 'Too many micropost requests, please try again later.',
      timestamp: new Date().toISOString()
    }
  }
});

// Mount user routes
router.use('/users', userRoutes);

// Mount micropost routes (they include the /users prefix)
router.use('/users', micropostRoutes);

// Global micropost routes
// GET /microposts
router.get(
  '/microposts',
  micropostLimiter,
  validateRequest({ query: MicropostQueryParamsSchema }),
  getAllMicropostsController
);

// GET /microposts/:micropostId
router.get(
  '/microposts/:micropostId',
  micropostLimiter,
  validateRequest({ params: MicropostIdParamsSchema }),
  getMicropostByIdController
);

export default router;