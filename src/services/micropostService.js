// In-memory storage for microposts
let microposts = [
  { id: 1, userId: 1, content: 'First micropost for user 1', createdAt: new Date().toISOString() },
  { id: 2, userId: 1, content: 'Second micropost for user 1', createdAt: new Date().toISOString() },
  { id: 3, userId: 2, content: 'First micropost for user 2', createdAt: new Date().toISOString() }
];

let nextId = 4;

export const getMicropostsByUserId = (userId) => {
  return microposts.filter(post => post.userId === userId);
};

export const createMicropost = (userId, content) => {
  const newMicropost = {
    id: nextId++,
    userId: userId,
    content: content.trim(),
    createdAt: new Date().toISOString()
  };
  
  microposts.push(newMicropost);
  return newMicropost;
};

export const getAllMicroposts = () => {
  return microposts;
};

export const getMicropostById = (id) => {
  return microposts.find(post => post.id === id);
};

export const updateMicropost = (id, content) => {
  const index = microposts.findIndex(post => post.id === id);
  if (index === -1) {
    return null;
  }
  
  microposts[index] = {
    ...microposts[index],
    content: content.trim()
  };
  
  return microposts[index];
};

export const deleteMicropost = (id) => {
  const index = microposts.findIndex(post => post.id === id);
  if (index === -1) {
    return false;
  }
  
  microposts.splice(index, 1);
  return true;
};