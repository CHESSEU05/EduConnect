import mongoose from 'mongoose';

import { env } from './env.js';

export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB connection established.');
  } catch {
    console.error('MongoDB connection failed.');
    throw new Error('Unable to connect to MongoDB.');
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
