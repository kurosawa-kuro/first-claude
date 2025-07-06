import { getMicropostsByUserId, createMicropost } from '../services/micropostService.js';
import { getUserByIdFromDB } from '../services/userService.js';
import { MicropostParamsSchema, CreateMicropostSchema } from '../schemas/micropost.js';
import { handleAsyncError, NotFoundError, ValidationError } from '../utils/errors.js';

export const getUserMicroposts = handleAsyncError(async (req, res) => {
  // Get validated params (assumes validation middleware is used)
  const { userId } = req.validatedParams || req.params;
  
  // Check if user exists
  const user = await getUserByIdFromDB(parseInt(userId));
  if (!user) {
    throw new NotFoundError('User');
  }
  
  const userMicroposts = getMicropostsByUserId(parseInt(userId));
  
  res.status(200).json({
    success: true,
    data: userMicroposts,
    meta: {
      userId: parseInt(userId),
      count: userMicroposts.length,
      timestamp: new Date().toISOString()
    }
  });
});

export const createUserMicropost = handleAsyncError(async (req, res) => {
  // Get validated data (assumes validation middleware is used)
  const { userId } = req.validatedParams || req.params;
  const { content } = req.validatedBody || req.body;
  
  // Check if user exists
  const user = await getUserByIdFromDB(parseInt(userId));
  if (!user) {
    throw new NotFoundError('User');
  }
  
  const newMicropost = createMicropost(parseInt(userId), content);
  
  res.status(201).json({
    success: true,
    data: newMicropost,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});