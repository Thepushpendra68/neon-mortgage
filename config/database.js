/**
 * Secure Database Configuration for Neon Mortgage
 * Separates landing page database from main application database
 * Production-ready with proper error handling and security
 */

const mongoose = require('mongoose');

class DatabaseManager {
  constructor() {
    this.mainConnection = null;
    this.landingConnection = null;
    this.isMainConnected = false;
    this.isLandingConnected = false;
  }

  /**
   * Connect to main application database
   */
  async connectMainDatabase() {
    if (this.isMainConnected) {
      console.log('✅ Main database already connected');
      return this.mainConnection;
    }

    try {
      const mainDbUri = process.env.MONGODB_URI || process.env.MONGODB_MAIN_URI || 'mongodb://localhost:27017/neon';
      
      this.mainConnection = await mongoose.createConnection(mainDbUri, {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
      });

      this.mainConnection.on('connected', () => {
        console.log('✅ Connected to Main Database:', mainDbUri.replace(/\/\/.*@/, '//***:***@'));
        this.isMainConnected = true;
      });

      this.mainConnection.on('error', (err) => {
        console.error('❌ Main Database connection error:', err.message);
        this.isMainConnected = false;
      });

      this.mainConnection.on('disconnected', () => {
        console.log('⚠️ Main Database disconnected');
        this.isMainConnected = false;
      });

      return this.mainConnection;
    } catch (error) {
      console.error('❌ Failed to connect to Main Database:', error.message);
      throw error;
    }
  }

  /**
   * Connect to separate landing page database (SECURE & ISOLATED)
   */
  async connectLandingDatabase() {
    if (this.isLandingConnected) {
      console.log('✅ Landing database already connected');
      return this.landingConnection;
    }

    try {
      // Separate database for landing pages with enhanced security
      const landingDbUri = process.env.LANDING_MONGODB_URI || process.env.MONGODB_LANDING_URI || 'mongodb://localhost:27017/neon_landing_secure';
      
      this.landingConnection = await mongoose.createConnection(landingDbUri, {
        maxPoolSize: 5, // Smaller pool for landing pages
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        // Enhanced security options
        ssl: process.env.NODE_ENV === 'production', // Enable SSL in production
        authSource: process.env.MONGODB_LANDING_AUTH_SOURCE || 'admin',
        retryWrites: true,
        w: 'majority' // Write concern for data safety
      });

      this.landingConnection.on('connected', () => {
        console.log('🎯 Connected to Landing Database (SECURE):', landingDbUri.replace(/\/\/.*@/, '//***:***@'));
        this.isLandingConnected = true;
      });

      this.landingConnection.on('error', (err) => {
        console.error('❌ Landing Database connection error:', err.message);
        this.isLandingConnected = false;
      });

      this.landingConnection.on('disconnected', () => {
        console.log('⚠️ Landing Database disconnected');
        this.isLandingConnected = false;
      });

      return this.landingConnection;
    } catch (error) {
      console.error('❌ Failed to connect to Landing Database:', error.message);
      throw error;
    }
  }

  /**
   * Connect to both databases
   */
  async connectAll() {
    try {
      console.log('🔄 Initializing database connections...');
      
      // Connect to both databases in parallel for faster startup
      const [mainConn, landingConn] = await Promise.all([
        this.connectMainDatabase(),
        this.connectLandingDatabase()
      ]);

      console.log('✅ All database connections established successfully');
      
      return {
        main: mainConn,
        landing: landingConn
      };
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Get main database connection
   */
  getMainConnection() {
    if (!this.isMainConnected) {
      throw new Error('Main database not connected. Call connectMainDatabase() first.');
    }
    return this.mainConnection;
  }

  /**
   * Get landing database connection (SECURE)
   */
  getLandingConnection() {
    if (!this.isLandingConnected) {
      throw new Error('Landing database not connected. Call connectLandingDatabase() first.');
    }
    return this.landingConnection;
  }

  /**
   * Close all database connections safely
   */
  async closeAll() {
    const closePromises = [];

    if (this.mainConnection) {
      closePromises.push(this.mainConnection.close());
    }

    if (this.landingConnection) {
      closePromises.push(this.landingConnection.close());
    }

    try {
      await Promise.all(closePromises);
      console.log('✅ All database connections closed safely');
      this.isMainConnected = false;
      this.isLandingConnected = false;
    } catch (error) {
      console.error('❌ Error closing database connections:', error.message);
    }
  }

  /**
   * Health check for all connections
   */
  getConnectionStatus() {
    return {
      main: {
        connected: this.isMainConnected,
        readyState: this.mainConnection?.readyState || 0
      },
      landing: {
        connected: this.isLandingConnected,
        readyState: this.landingConnection?.readyState || 0
      }
    };
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('🔄 Received SIGINT. Gracefully shutting down databases...');
  await dbManager.closeAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM. Gracefully shutting down databases...');
  await dbManager.closeAll();
  process.exit(0);
});

module.exports = dbManager;
