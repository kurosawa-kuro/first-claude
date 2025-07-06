import { UserArraySchema } from '../schemas/user.js';
import { getUsersFromDB } from '../services/userService.js';

export const getUsers = async (req, res) => {
  try {
    const users = await getUsersFromDB();
    
    // Validate data with Zod
    const validatedUsers = UserArraySchema.parse(users);
    
    res.status(200).json(validatedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    
    if (error.name === 'ZodError') {
      res.status(500).json({
        error: 'Data validation error',
        message: 'Invalid user data format'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch users'
      });
    }
  }
};