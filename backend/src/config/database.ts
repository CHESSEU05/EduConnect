import mongoose from "mongoose";

import { env } from "./env.js";

export const connectToDatabase = async (): Promise<void> => {
  try {
    const connection = await mongoose.connect(env.MONGODB_URI);

    console.log(
      `MongoDB connected successfully: ${connection.connection.host}`,
    );
  } catch (error: unknown) {
    console.error("MongoDB connection failed.");

    if (error instanceof Error) {
      console.error("Reason:", error.message);
      console.error(error.stack);
    } else {
      console.error("Unknown MongoDB error:", error);
    }

    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};