import type { Server } from 'node:http';

import { app } from './app.js';
import { connectToDatabase, disconnectFromDatabase } from './config/database.js';
import { env } from './config/env.js';

let server: Server | undefined;
let isShuttingDown = false;

const closeHttpServer = async (): Promise<void> => {
  if (!server) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server?.close((error?: Error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

const shutdown = async (exitCode: number): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  try {
    await closeHttpServer();
    await disconnectFromDatabase();
  } catch {
    process.exit(1);
  }

  process.exit(exitCode);
};

const startServer = async (): Promise<void> => {
  try {
    await connectToDatabase();

    server = app.listen(env.PORT, () => {
      console.log(`EduConnect API listening on port ${env.PORT}.`);
    });
  } catch {
    console.error('Failed to start EduConnect API.');
    process.exit(1);
  }
};

process.on('unhandledRejection', () => {
  console.error('Unhandled promise rejection. Shutting down.');
  void shutdown(1);
});

process.on('uncaughtException', () => {
  console.error('Uncaught exception. Shutting down.');
  void shutdown(1);
});

process.on('SIGINT', () => {
  void shutdown(0);
});

process.on('SIGTERM', () => {
  void shutdown(0);
});

void startServer();
