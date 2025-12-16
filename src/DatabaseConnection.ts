import mongoose from "mongoose";

/**
 * Maximum number of connection retry attempts
 * Can be overridden with DB_MAX_RETRIES environment variable
 */
const MAX_RETRIES = parseInt(process.env.DB_MAX_RETRIES || '10');

/**
 * Initial interval between retry attempts in milliseconds
 * Can be overridden with DB_RETRY_INTERVAL environment variable
 */
const INITIAL_RETRY_INTERVAL = parseInt(process.env.DB_RETRY_INTERVAL || '3000'); // 3 seconds

/**
 * Maximum retry interval (caps exponential backoff)
 */
const MAX_RETRY_INTERVAL = 30000; // 30 seconds

/**
 * Database connection class for MongoDB using Mongoose.
 * Provides automatic reconnection, retry logic, and connection status monitoring.
 */
class DatabaseConnection {
  private retryCount: number;
  private isConnected: boolean;

  /**
   * Creates a new DatabaseConnection instance.
   * Sets up event listeners for connection events and application termination signals.
   */
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;

    // Configure mongoose settings
    mongoose.set("strictQuery", true);

    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected successfully");
      this.isConnected = true;
    });

    mongoose.connection.on("error", (err: Error) => {
      console.error("❌ MongoDB connection error:", err);
      this.isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      this.isConnected = false;
      this.handleDisconnection();
    });

    // Handle application termination
    process.on("SIGINT", this.handleAppTermination.bind(this));
    process.on("SIGTERM", this.handleAppTermination.bind(this));
  }

  /**
   * Establishes a connection to MongoDB.
   * @throws {Error} If MONGO_URI is not defined in environment variables.
   */
  async connect(): Promise<void> {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("MongoDB URI is not defined in environment variables");
      }

      const connectionOptions: mongoose.ConnectOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4
      };

      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }

      await mongoose.connect(process.env.MONGO_URI, connectionOptions);
      this.retryCount = 0; // Reset retry count on successful connection
    } catch (error) {
      console.error("Failed to connect to MongoDB:", (error as Error).message);
      await this.handleConnectionError();
    }
  }

/**
 * Handles connection errors by retrying the connection up to MAX_RETRIES times.
 * Uses exponential backoff for retry intervals.
 */
  private async handleConnectionError(): Promise<void> {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      
      // Calculate exponential backoff with jitter
      const exponentialDelay = Math.min(
        INITIAL_RETRY_INTERVAL * Math.pow(2, this.retryCount - 1),
        MAX_RETRY_INTERVAL
      );
      const jitter = Math.random() * 1000; // Add up to 1 second of random jitter
      const delay = exponentialDelay + jitter;
      
      console.log(
        `Retrying connection... Attempt ${this.retryCount} of ${MAX_RETRIES} (waiting ${Math.round(delay)}ms)`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.connect();
    } else {
      console.error(
        `Failed to connect to MongoDB after ${MAX_RETRIES} attempts. Please check:`,
        `1. Docker container is running: docker ps`,
        `2. MongoDB is accessible: ${process.env.MONGO_URI}`,
        `3. Network connectivity between containers`,
        `4. Environment variables are correctly set`
      );
      
      // Only exit in production, allow recovery in development
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      } else {
        console.log('Development mode: keeping process alive for manual retry');
      }
    }
  }

/**
 * Handles disconnection events by attempting to reconnect if not already connected.
 * Resets retry count for fresh reconnection attempts.
 */
  private async handleDisconnection(): Promise<void> {
    if (!this.isConnected) {
      console.log("Attempting to reconnect to MongoDB...");
      this.retryCount = 0; // Reset retry count for reconnection attempts
      await this.connect();
    }
  }

  /**
   * Handles application termination by closing the database connection gracefully.
   */
  private async handleAppTermination(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    } catch (err) {
      console.error("Error during database disconnection:", err);
      process.exit(1);
    }
  }

/**
 * Gets the current connection status.
 * @returns An object containing connection status information.
 */
  getConnectionStatus(): {
    isConnected: boolean;
    readyState: number;
    host: string;
    name: string;
    retryCount: number;
  } {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      retryCount: this.retryCount,
    };
  }

  /**
   * Manually reset retry count and attempt reconnection
   * Useful for recovering from Docker container restarts
   */
  async resetAndRetry(): Promise<void> {
    console.log('Resetting connection state and retrying...');
    this.retryCount = 0;
    await this.connect();
  }
}

// Create a singleton instance
const dbConnection = new DatabaseConnection();

// Export the connect function and the instance
export default dbConnection.connect.bind(dbConnection);
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection);
export const resetDBConnection = dbConnection.resetAndRetry.bind(dbConnection);
export { DatabaseConnection };
