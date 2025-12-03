import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import connectDB, { getDBStatus } from '../src/DatabaseConnection';

describe('DatabaseConnection', () => {
  let mongoServer: MongoMemoryServer;
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(async () => {
    // Save original environment
    originalEnv = { ...process.env };

    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
  });

  afterAll(async () => {
    // Restore original environment
    process.env = originalEnv;

    // Stop the server
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(() => {
    // Mock process.exit to prevent tests from exiting
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('Process exit called');
    });

    // Mock console methods to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should connect successfully to MongoDB', async () => {
    await expect(connectDB()).resolves.toBeUndefined();

    const status = getDBStatus();
    expect(status.isConnected).toBe(true);
    expect(status.readyState).toBe(1); // Connected
    expect(typeof status.host).toBe('string');
    expect(typeof status.name).toBe('string');
  });

  it('should return connection status', async () => {
    // After connecting (from previous test)
    const status = getDBStatus();
    expect(status).toHaveProperty('isConnected');
    expect(status).toHaveProperty('readyState');
    expect(status).toHaveProperty('host');
    expect(status).toHaveProperty('name');
    expect(typeof status.isConnected).toBe('boolean');
    expect(typeof status.readyState).toBe('number');
  });


});