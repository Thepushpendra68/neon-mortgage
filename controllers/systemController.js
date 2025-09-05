/**
 * System Controller for Simple Health Monitoring
 * Provides basic system health status with fixed ports
 */

// Simple port configuration - no more dynamic discovery
const FIXED_PORTS = {
  backend: process.env.BACKEND_PORT || 5000,
  frontend: process.env.FRONTEND_PORT || 3000,
  admin: process.env.ADMIN_PORT || 3002
};

let systemInfo = {
  startTime: new Date().toISOString(),
  version: '4.0.0-simplified',
  environment: process.env.NODE_ENV || 'development'
};

class SystemController {
  // Get system information with fixed ports
  static async getSystemInfo(req, res) {
    try {
      const response = {
        success: true,
        data: {
          backend: {
            port: FIXED_PORTS.backend,
            url: `http://localhost:${FIXED_PORTS.backend}`,
            apiBase: `http://localhost:${FIXED_PORTS.backend}/api`
          },
          frontend: {
            main: {
              port: FIXED_PORTS.frontend,
              url: `http://localhost:${FIXED_PORTS.frontend}`,
              description: 'Next.js main website'
            },
            mortgageAdmin: {
              port: FIXED_PORTS.admin,
              url: `http://localhost:${FIXED_PORTS.admin}`,
              description: 'Modern mortgage admin dashboard'
            },
            legacyAdmin: {
              url: `http://localhost:${FIXED_PORTS.backend}/admin`,
              description: 'Legacy admin interface (static)'
            }
          },
          system: {
            environment: systemInfo.environment,
            version: systemInfo.version,
            startTime: systemInfo.startTime,
            uptime: process.uptime(),
            nodeVersion: process.version
          }
        }
      };

      res.json(response);
    } catch (error) {
      console.error('System info error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve system information',
        error: error.message
      });
    }
  }

  // Health check endpoint
  static async healthCheck(req, res) {
    try {
      const health = {
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: systemInfo.environment,
          ports: {
            backend: FIXED_PORTS.backend,
            frontend: FIXED_PORTS.frontend,
            admin: FIXED_PORTS.admin
          },
          checks: {
            database: await SystemController.checkDatabaseHealth(),
            memory: SystemController.checkMemoryHealth()
          }
        }
      };

      res.json(health);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        message: 'Health check failed',
        error: error.message
      });
    }
  }

  // Check database connectivity
  static async checkDatabaseHealth() {
    try {
      const mongoose = require('mongoose');
      const mainDb = mongoose.connection.readyState === 1;
      
      // Check landing database if available
      let landingDb = false;
      try {
        const { getLandingConnection } = require('../config/database');
        const landingConnection = getLandingConnection();
        landingDb = landingConnection && landingConnection.readyState === 1;
      } catch (e) {
        // Landing DB might not be configured
      }

      return {
        main: mainDb ? 'connected' : 'disconnected',
        landing: landingDb ? 'connected' : 'disconnected',
        status: (mainDb && landingDb) ? 'healthy' : 'partial'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // Check memory usage
  static checkMemoryHealth() {
    const memUsage = process.memoryUsage();
    const totalMB = Math.round(memUsage.rss / 1024 / 1024);
    
    return {
      rss: `${totalMB}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      status: totalMB < 500 ? 'healthy' : 'warning'
    };
  }

  // Get available backend URLs for frontend discovery - simplified
  static async getBackendUrls(req, res) {
    try {
      const backendUrls = {
        recommended: `http://localhost:${FIXED_PORTS.backend}`,
        active: [`http://localhost:${FIXED_PORTS.backend}`],
        fallbacks: [] // No more fallbacks - fixed ports only
      };
      
      res.json({
        success: true,
        data: backendUrls
      });
    } catch (error) {
      console.error('Backend URLs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve backend URLs',
        error: error.message
      });
    }
  }

  // Get current service status - simplified
  static async getServiceStatus(req, res) {
    try {
      const services = {
        backend: {
          name: 'Backend API Server',
          port: FIXED_PORTS.backend,
          url: `http://localhost:${FIXED_PORTS.backend}`,
          status: 'running'
        },
        frontend: {
          name: 'Main Next.js App',
          port: FIXED_PORTS.frontend,
          url: `http://localhost:${FIXED_PORTS.frontend}`,
          status: 'expected'
        },
        admin: {
          name: 'Mortgage Admin Dashboard',
          port: FIXED_PORTS.admin,
          url: `http://localhost:${FIXED_PORTS.admin}`,
          status: 'expected'
        }
      };
      
      res.json({
        success: true,
        data: {
          services: services,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Service status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve service status',
        error: error.message
      });
    }
  }

  // Get the fixed ports configuration (for debugging)
  static getPortsConfig() {
    return FIXED_PORTS;
  }
}

module.exports = SystemController;