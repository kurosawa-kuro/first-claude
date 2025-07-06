import { getMicropostsByUserId, createMicropost } from '../services/micropostService.js';
import { getUserByIdFromDB } from '../services/userService.js';
import { MicropostParamsSchema, CreateMicropostSchema } from '../schemas/micropost.js';

export const getUserMicroposts = async (req, res) => {
  try {
    const paramsValidation = MicropostParamsSchema.safeParse(req.params);
    
    if (!paramsValidation.success) {
      return res.status(400).json({ 
        error: 'Invalid user ID',
        message: 'User ID must be a number' 
      });
    }
    
    const { userId } = paramsValidation.data;
    
    // Check if user exists
    const user = await getUserByIdFromDB(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${userId} does not exist`
      });
    }
    
    const userMicroposts = getMicropostsByUserId(userId);
    res.status(200).json(userMicroposts);
  } catch (error) {
    console.error('Error fetching user microposts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user microposts'
    });
  }
};

export const createUserMicropost = async (req, res) => {
  try {
    const paramsValidation = MicropostParamsSchema.safeParse(req.params);
    const bodyValidation = CreateMicropostSchema.safeParse(req.body);
    
    if (!paramsValidation.success) {
      return res.status(400).json({ 
        error: 'Invalid user ID',
        message: 'User ID must be a number' 
      });
    }
    
    if (!bodyValidation.success) {
      return res.status(400).json({ 
        error: 'Invalid content',
        message: bodyValidation.error.issues[0].message 
      });
    }
    
    const { userId } = paramsValidation.data;
    const { content } = bodyValidation.data;
    
    // Check if user exists
    const user = await getUserByIdFromDB(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${userId} does not exist`
      });
    }
    
    const newMicropost = createMicropost(userId, content);
    res.status(201).json(newMicropost);
  } catch (error) {
    console.error('Error creating user micropost:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create user micropost'
    });
  }
};