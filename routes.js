const express = require('express');
const LandingApplicationController = require('./controllers/landingApplicationController');
const MortgageAdminController = require('./controllers/mortgageAdminController');
const SystemController = require('./controllers/systemController');
const authenticateMortgageAdmin = require('./middleware/mortgageAdminAuth');

const router = express.Router();

// System & Health
router.get('/api/system/info', SystemController.getSystemInfo);
router.get('/api/system/health', SystemController.healthCheck);
router.get('/api/system/backend-urls', SystemController.getBackendUrls);
router.get('/api/system/status', SystemController.getServiceStatus);

// Secure Landing Application (Get Mortgage flow)
router.post('/api/landing/application/create', LandingApplicationController.createLandingApplication);

// Mortgage Admin API
router.post('/api/mortgage-admin/login', MortgageAdminController.login);
router.get('/api/mortgage-admin/dashboard/stats', authenticateMortgageAdmin, MortgageAdminController.getDashboardStats);
router.get('/api/mortgage-admin/applications', authenticateMortgageAdmin, MortgageAdminController.getApplications);
router.get('/api/mortgage-admin/applications/:id', authenticateMortgageAdmin, MortgageAdminController.getApplicationById);
router.put('/api/mortgage-admin/applications/:id/status', authenticateMortgageAdmin, MortgageAdminController.updateApplicationStatus);
router.post('/api/mortgage-admin/applications/:id/notes', authenticateMortgageAdmin, MortgageAdminController.addApplicationNote);
router.post('/api/mortgage-admin/applications/bulk', authenticateMortgageAdmin, MortgageAdminController.bulkUpdateApplications);
router.get('/api/mortgage-admin/applications/export', authenticateMortgageAdmin, MortgageAdminController.exportApplications);
router.get('/api/mortgage-admin/applications/:id/audit', authenticateMortgageAdmin, MortgageAdminController.getApplicationAuditLog);

module.exports = router;
