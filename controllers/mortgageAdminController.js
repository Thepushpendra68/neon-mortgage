const { getSecureLandingModel } = require('../models/SecureLandingApplication');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class MortgageAdminController {
  // Authentication
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // Simple admin authentication (can be enhanced with proper admin model)
      if (username === 'mortgage-admin' && password === 'admin123') {
        const token = jwt.sign(
          { userId: 'mortgage-admin', role: 'admin' },
          process.env.JWT_SECRET || 'mortgage-admin-secret',
          { expiresIn: '24h' }
        );

        res.json({
          success: true,
          data: {
            token,
            user: {
              id: 'mortgage-admin',
              username: 'mortgage-admin',
              role: 'admin',
              email: 'admin@neonmortgage.com'
            }
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }

  // Dashboard Statistics
  static async getDashboardStats(req, res) {
    try {
      const SecureLandingApplication = getSecureLandingModel();
      const totalApplications = await SecureLandingApplication.countDocuments();
      const newLeadApplications = await SecureLandingApplication.countDocuments({ status: 'New Lead' });
      const contactedApplications = await SecureLandingApplication.countDocuments({ status: 'Contacted' });
      const qualifiedApplications = await SecureLandingApplication.countDocuments({ status: 'Qualified' });
      const approvedApplications = await SecureLandingApplication.countDocuments({ status: 'Approved' });
      const rejectedApplications = await SecureLandingApplication.countDocuments({ status: 'Rejected' });
      const proposalSentApplications = await SecureLandingApplication.countDocuments({ status: 'Proposal Sent' });

      // Calculate application statistics by budget range (since loanAmount doesn't exist)
      const budgetRangeStats = await SecureLandingApplication.aggregate([
        {
          $group: {
            _id: "$budgetRange",
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // Recent applications (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentApplications = await SecureLandingApplication.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });

      // Monthly trend
      const monthlyStats = await SecureLandingApplication.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);

      res.json({
        success: true,
        data: {
          totalApplications,
          newLeadApplications,
          contactedApplications,
          qualifiedApplications,
          approvedApplications,
          rejectedApplications,
          proposalSentApplications,
          budgetRangeStats: budgetRangeStats,
          recentApplications,
          monthlyTrend: monthlyStats
        }
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  }

  // Get Applications with filtering and pagination
  static async getApplications(req, res) {
    try {
      const SecureLandingApplication = getSecureLandingModel();
      const {
        page = 1,
        limit = 10,
        status,
        loanType,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = {};
      
      if (status && status !== 'all') {
        filter.status = status;
      }
      
      if (loanType && loanType !== 'all') {
        filter.loanType = loanType;
      }
      
      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Get applications
      const applications = await SecureLandingApplication
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get total count
      const total = await SecureLandingApplication.countDocuments(filter);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNext = parseInt(page) < totalPages;
      const hasPrev = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          applications,
          pagination: {
            current: parseInt(page),
            total: totalPages,
            hasNext,
            hasPrev,
            totalRecords: total
          }
        }
      });
    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications'
      });
    }
  }

  // Get single application by ID
  static async getApplicationById(req, res) {
    try {
      const SecureLandingApplication = getSecureLandingModel();
      const { id } = req.params;
      
      const application = await SecureLandingApplication.findById(id).lean();
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Get application by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch application details'
      });
    }
  }

  // Update application status
  static async updateApplicationStatus(req, res) {
    try {
      const SecureLandingApplication = getSecureLandingModel();
      const { id } = req.params;
      const { status, notes } = req.body;
      
      const validStatuses = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Approved', 'Rejected', 'Archived'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const updateData = {
        status,
        lastUpdated: new Date()
      };

      // Add to audit log
      const auditEntry = {
        action: 'status_update',
        oldStatus: null, // Will be set below
        newStatus: status,
        notes: notes || '',
        updatedBy: req.user?.userId || 'admin',
        timestamp: new Date()
      };

      // Get current application to add old status to audit
      const currentApp = await SecureLandingApplication.findById(id);
      if (currentApp) {
        auditEntry.oldStatus = currentApp.status;
      }

      updateData.$push = { auditLog: auditEntry };

      const application = await SecureLandingApplication.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      res.json({
        success: true,
        data: application,
        message: 'Application status updated successfully'
      });
    } catch (error) {
      console.error('Update application status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application status'
      });
    }
  }

  // Add notes to application
  static async addApplicationNote(req, res) {
    try {
      const SecureLandingApplication = getSecureLandingModel();
      const { id } = req.params;
      const { note } = req.body;

      if (!note || note.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Note content is required'
        });
      }

      const noteEntry = {
        content: note.trim(),
        addedBy: req.user?.userId || 'admin',
        timestamp: new Date()
      };

      const application = await SecureLandingApplication.findByIdAndUpdate(
        id,
        { 
          $push: { notes: noteEntry },
          lastUpdated: new Date()
        },
        { new: true }
      );

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      res.json({
        success: true,
        data: application,
        message: 'Note added successfully'
      });
    } catch (error) {
      console.error('Add application note error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add note'
      });
    }
  }

  // Bulk update applications
  static async bulkUpdateApplications(req, res) {
    try {
      const SecureLandingApplication = getSecureLandingModel();
      const { applicationIds, action, status, notes } = req.body;

      if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Application IDs are required'
        });
      }

      let updateData = { lastUpdated: new Date() };
      let auditAction = '';

      switch (action) {
        case 'update_status':
          if (!status) {
            return res.status(400).json({
              success: false,
              message: 'Status is required for bulk status update'
            });
          }
          updateData.status = status;
          auditAction = 'bulk_status_update';
          break;
        
        case 'delete':
          auditAction = 'bulk_delete';
          break;
        
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid bulk action'
          });
      }

      if (action === 'delete') {
        const result = await SecureLandingApplication.deleteMany({
          _id: { $in: applicationIds }
        });

        res.json({
          success: true,
          message: `${result.deletedCount} applications deleted successfully`
        });
      } else {
        // Add audit entry for bulk update
        const auditEntry = {
          action: auditAction,
          newStatus: status,
          notes: notes || '',
          updatedBy: req.user?.userId || 'admin',
          timestamp: new Date()
        };

        updateData.$push = { auditLog: auditEntry };

        const result = await SecureLandingApplication.updateMany(
          { _id: { $in: applicationIds } },
          updateData
        );

        res.json({
          success: true,
          message: `${result.modifiedCount} applications updated successfully`
        });
      }
    } catch (error) {
      console.error('Bulk update applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Bulk operation failed'
      });
    }
  }

  // Export applications to CSV
  static async exportApplications(req, res) {
    try {
      const SecureLandingApplication = getSecureLandingModel();
      const { format = 'csv', status, loanType } = req.query;

      // Build filter
      const filter = {};
      if (status && status !== 'all') filter.status = status;
      if (loanType && loanType !== 'all') filter.loanType = loanType;

      const applications = await SecureLandingApplication.find(filter).lean();

      if (format === 'csv') {
        // Generate CSV content
        const headers = [
          'ID', 'Full Name', 'Email', 'Phone Number', 'Loan Type', 'Budget Range',
          'Property Type', 'Monthly Income', 'Employment Status', 'Status', 'Created At', 'Last Updated'
        ];
        
        let csvContent = headers.join(',') + '\n';
        
        applications.forEach(app => {
          const row = [
            app._id,
            `"${app.fullName || ''}"`,
            `"${app.email || ''}"`,
            `"${app.phoneNumber || ''}"`,
            `"${app.loanType || ''}"`,
            `"${app.budgetRange || app.investmentBudget || ''}"`,
            `"${app.propertyType || ''}"`,
            `"${app.monthlyIncome || ''}"`,
            `"${app.employmentStatus || ''}"`,
            `"${app.status || 'New Lead'}"`,
            `"${app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : ''}"`,
            `"${app.updatedAt ? new Date(app.updatedAt).toISOString().split('T')[0] : ''}"`
          ];
          csvContent += row.join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=mortgage-applications.csv');
        res.send(csvContent);
      } else {
        // Return JSON format
        res.json({
          success: true,
          data: applications,
          count: applications.length
        });
      }
    } catch (error) {
      console.error('Export applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Export failed'
      });
    }
  }

  // Get audit log for an application
  static async getApplicationAuditLog(req, res) {
    try {
      const SecureLandingApplication = getSecureLandingModel();
      const { id } = req.params;
      
      const application = await SecureLandingApplication
        .findById(id)
        .select('auditLog')
        .lean();

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      res.json({
        success: true,
        data: application.auditLog || []
      });
    } catch (error) {
      console.error('Get audit log error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit log'
      });
    }
  }
}

module.exports = MortgageAdminController;