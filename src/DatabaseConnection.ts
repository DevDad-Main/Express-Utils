import mongoose from "mongoose";

/**
 * Maximum number of connection retry attempts
 */
const MAX_RETRIES = 3;

/**
 * Interval between retry attempts in milliseconds
 */
const RETRY_INTERVAL = 5000; // 5 seconds

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
   * Exits the process if all retries fail.
   */
  private async handleConnectionError(): Promise<void> {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(
        `Retrying connection... Attempt ${this.retryCount} of ${MAX_RETRIES}`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return this.connect();
    } else {
      console.error(
        `Failed to connect to MongoDB after ${MAX_RETRIES} attempts`,
      );
      process.exit(1);
    }
  }

  /**
   * Handles disconnection events by attempting to reconnect if not already connected.
   */
  private handleDisconnection(): void {
    if (!this.isConnected) {
      console.log("Attempting to reconnect to MongoDB...");
      this.connect();
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
  } {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

// Create a singleton instance
const dbConnection = new DatabaseConnection();

// Export the connect function and the instance
export default dbConnection.connect.bind(dbConnection);
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection);
export { DatabaseConnection };