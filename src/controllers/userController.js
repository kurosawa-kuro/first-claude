import { UserArraySchema, UserQueryParamsSchema, UserParamsSchema, UserListResponseSchema, UserDetailResponseSchema } from '../schemas/user.js';
import { getUsersFromDB, getUserByIdFromDB } from '../services/userService.js';
import { getMicropostsByUserId } from '../services/micropostService.js';
import { handleAsyncError, ValidationError, NotFoundError } from '../utils/errors.js';

export const getUsers = handleAsyncError(async (req, res) => {
  // Validate query parameters
  const { page, limit, sort, search } = UserQueryParamsSchema.parse(req.query);
  
  let users = await getUsersFromDB();
  
  // Search functionality
  if (search) {
    const searchLower = search.toLowerCase();
    users = users.filter(user => 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  }
  
  // Sorting
  users.sort((a, b) => {
    switch (sort) {
      case 'name_asc': return a.name.localeCompare(b.name);
      case 'name_desc': return b.name.localeCompare(a.name);
      case 'created_asc': return new Date(a.createdAt) - new Date(b.createdAt);
      case 'created_desc': return new Date(b.createdAt) - new Date(a.createdAt);
      default: return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });
  
  // Calculate pagination
  const total = users.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedUsers = users.slice(offset, offset + limit);
  
  // Add micropost counts to users
  const usersWithCounts = paginatedUsers.map(user => ({
    ...user,
    micropostCount: getMicropostsByUserId(user.id).length
  }));
  
  // Validate response data
  const validatedUsers = UserArraySchema.parse(usersWithCounts);
  
  const response = {
    data: validatedUsers,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
  
  res.status(200).json(response);
});

export const getUserById = handleAsyncError(async (req, res) => {
  // Validate path parameters
  const { userId } = UserParamsSchema.parse(req.params);
  
  const user = await getUserByIdFromDB(userId);
  if (!user) {
    throw new NotFoundError('User');
  }
  
  // Get recent microposts (max 5)
  const userMicroposts = getMicropostsByUserId(userId);
  const recentMicroposts = userMicroposts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(post => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt
    }));
  
  const userDetail = {
    ...user,
    micropostCount: userMicroposts.length,
    recentMicroposts
  };
  
  const response = {
    data: userDetail
  };
  
  res.status(200).json(response);
});