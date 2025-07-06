import { UserArraySchema } from '../schemas/user.js';
import { getUsersFromDB } from '../services/userService.js';
import { handleAsyncError, ValidationError } from '../utils/errors.js';

export const getUsers = handleAsyncError(async (req, res) => {
  const users = await getUsersFromDB();
  
  // Validate data with Zod
  const validatedUsers = UserArraySchema.parse(users);
  
  res.status(200).json({
    success: true,
    data: validatedUsers,
    meta: {
      count: validatedUsers.length,
      timestamp: new Date().toISOString()
    }
  });
});