import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import micropostRepository from '../repositories/micropostRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize lowdb
const dbFile = path.join(__dirname, '../../db/db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { users: [], microposts: [] });

// Read data from JSON file
await db.read();

export const getUsersFromDB = async () => {
  await db.read();
  return db.data.users || [];
};

export const getUserByIdFromDB = async (id) => {
  await db.read();
  return db.data.users.find(user => user.id === id);
};

export const createUserInDB = async (userData) => {
  await db.read();
  const newUser = {
    id: Math.max(...db.data.users.map(u => u.id), 0) + 1,
    ...userData,
    createdAt: new Date().toISOString()
  };
  
  db.data.users.push(newUser);
  await db.write();
  return newUser;
};