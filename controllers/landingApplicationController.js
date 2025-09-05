/**
 * Secure Landing Application Controller - PRODUCTION READY
 * Uses separate secure database connection and enhanced security measures
 */

const { getSecureLandingModel } = require('../models/SecureLandingApplication');
const transporter = require('../services/transporter');
const crypto = require('crypto');

// Rate limiting for form submissions
const submissionTracker = new Map();

const createLandingApplication = async (req, res) => {
    try {
        console.log('🔍 Starting application creation...');
        console.log('🔍 Request body:', req.body);
        
        // Get secure model instance
        const SecureLandingApplication = getSecureLandingModel();
        console.log('✅ SecureLandingApplication model retrieved');
        
        // Enhanced security validation
        const securityCheck = await performSecurityValidation(req);
        if (!securityCheck.valid) {
            console.log('❌ Security validation failed:', securityCheck.message);
            return res.status(400).json({
                success: false,
                message: securityCheck.message
            });
        }
        console.log('✅ Security validation passed');
        
        const applicationData = req.body;
        
        // Enhanced data validation and sanitization
        const validatedData = validateAndSanitizeData(applicationData);
        if (!validatedData.valid) {
            console.log('❌ Data validation failed:', validatedData.errors);
            return res.status(400).json({
                success: false,
                message: 'Invalid application data',
                errors: validatedData.errors
            });
        }
        console.log('✅ Data validation passed');
        
        // Add security and tracking fields
        const enrichedData = {
            ...validatedData.data,
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.get('user-agent') || 'unknown',
            sessionId: req.headers['x-landing-session'] || crypto.randomUUID(),
            referrer: req.get('referer'),
            dataProcessingConsent: true,
            marketingConsent: applicationData.marketingConsent || false
        };
        
        console.log('🔍 Enriched data:', enrichedData);
        console.log('🔍 Creating new application...');
        
        // Create application with audit trail
        const newApplication = new SecureLandingApplication(enrichedData);
        console.log('✅ Application object created');
        
        const savedApplication = await newApplication.save();
        console.log('✅ Application saved to database:', savedApplication._id);
        
        // Send notifications asynchronously (don't block response) - OPTIONAL
        if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false') {
            setImmediate(async () => {
                try {
                    await sendEnhancedEmailNotification(savedApplication);
                    await logApplicationMetrics(savedApplication);
                } catch (notificationError) {
                    console.error('Non-blocking notification error:', notificationError.message);
                    // Non-blocking - application still saved successfully
                }
            });
        } else {
            console.log('📧 Email notifications disabled - use admin dashboard to view applications');
            // Still log metrics for analytics
            setImmediate(async () => {
                try {
                    await logApplicationMetrics(savedApplication);
                } catch (error) {
                    console.error('Error logging metrics:', error.message);
                }
            });
        }
        
        // Return sanitized response (no sensitive data)
        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: {
                id: savedApplication._id,
                status: savedApplication.status,
                submittedAt: savedApplication.createdAt,
                trackingNumber: generateTrackingNumber(savedApplication._id)
            }
        });
        
    } catch (error) {
        console.error('Error creating secure landing application:', error);
        
        // Enhanced error response without exposing system details
        res.status(500).json({
            success: false,
            message: 'We apologize for the inconvenience. Your application could not be processed at this time. Please try again later or contact us directly.',
            errorCode: 'SLA_001',
            timestamp: new Date().toISOString()
        });
    }
};

// Enhanced security validation
const performSecurityValidation = async (req) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    
    // Rate limiting check
    const dailyLimit = process.env.MAX_FORM_SUBMISSIONS_PER_IP || 5;
    const today = new Date().toDateString();
    const submissionKey = `${clientIp}_${today}`;
    
    const currentCount = submissionTracker.get(submissionKey) || 0;
    if (currentCount >= dailyLimit) {
        return {
            valid: false,
            message: 'Daily submission limit reached. Please try again tomorrow or contact us directly.'
        };
    }
    
    // Update submission count
    submissionTracker.set(submissionKey, currentCount + 1);
    
    // Clean up old entries (keep only last 2 days)
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toDateString();
    for (const [key] of submissionTracker) {
        if (key.endsWith(twoDaysAgo)) {
            submissionTracker.delete(key);
        }
    }
    
    return { valid: true };
};

// Enhanced data validation and sanitization
const validateAndSanitizeData = (data) => {
    const errors = [];
    const sanitized = {};
    
    // Required fields validation
    const requiredFields = ['loanType', 'isUAEResident', 'residencyStatus', 'fullName', 'email', 'phoneNumber'];
    
    for (const field of requiredFields) {
        if (!data[field]) {
            errors.push(`${field} is required`);
        } else {
            // Copy required fields to sanitized object
            sanitized[field] = data[field];
        }
    }
    
    // Email validation
    if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            errors.push('Invalid email format');
        } else {
            sanitized.email = data.email.toLowerCase().trim();
        }
    }
    
    // Phone validation
    if (data.phoneNumber) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
        if (!phoneRegex.test(data.phoneNumber)) {
            errors.push('Invalid phone number format');
        } else {
            sanitized.phoneNumber = data.phoneNumber.replace(/\s+/g, ' ').trim();
        }
    }
    
    // Name sanitization
    if (data.fullName) {
        sanitized.fullName = data.fullName.trim().substring(0, 100);
    }
    
    // Enum validations
    const enumFields = {
        loanType: ['new-purchase', 'refinance', 'investment'],
        residencyStatus: ['uae-resident', 'non-resident'],
        propertyStatus: ['browsing', 'looking', 'found'],
        propertyType: ['villa', 'apartment', 'townhouse', 'not-sure']
    };
    
    for (const [field, allowedValues] of Object.entries(enumFields)) {
        if (data[field] && !allowedValues.includes(data[field])) {
            errors.push(`Invalid value for ${field}`);
        } else if (data[field]) {
            sanitized[field] = data[field];
        }
    }
    
    // Boolean fields
    if (typeof data.isUAEResident === 'boolean') {
        sanitized.isUAEResident = data.isUAEResident;
    } else {
        errors.push('isUAEResident must be a boolean value');
    }
    
    // Copy other valid fields
    const otherFields = [
        'budgetRange', 'downPayment', 'monthlyIncome', 'employmentStatus',
        'contactMethod', 'bestTimeToCall', 'refinanceReason', 'currentRate',
        'remainingBalance', 'propertyValue', 'investmentBudget', 'investmentGoal',
        'investorExperience', 'investmentHorizon', 'investmentIncomeSource',
        'investmentFinancingStructure', 'investmentDownPayment'
    ];
    
    for (const field of otherFields) {
        if (data[field]) {
            sanitized[field] = data[field];
        }
    }
    
    console.log('🔍 Validation result:', { valid: errors.length === 0, errors, sanitizedData: sanitized });
    
    return {
        valid: errors.length === 0,
        errors,
        data: sanitized
    };
};

// Generate tracking number for user reference
const generateTrackingNumber = (applicationId) => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const suffix = applicationId.toString().slice(-4).toUpperCase();
    return `NM-${timestamp}-${suffix}`;
};

// Enhanced email notification
const sendEnhancedEmailNotification = async (application) => {
    try {
        const emailContent = generateEnhancedEmailContent(application);
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@neonmortgage.com',
            to: process.env.LANDING_NOTIFICATION_EMAIL || process.env.EMAIL_TO || 'info@neonmortgage.com',
            subject: `🏠 SECURE Landing Application - ${application.loanType.toUpperCase()} - ${application.fullName} [${application.currencyDisplayed}]`,
            html: emailContent,
            priority: application.budgetRange === 'above-5m' ? 'high' : 'normal'
        };
        
        await transporter.sendMail(mailOptions);
        
        // Log successful notification
        await application.addAuditEntry('notification_sent', {
            type: 'email',
            recipient: mailOptions.to,
            priority: mailOptions.priority
        });
        
        console.log('✅ Enhanced email notification sent successfully for application:', application._id);
        
    } catch (error) {
        console.error('❌ Error sending enhanced email notification:', error);
        
        // Log failed notification
        try {
            await application.addAuditEntry('notification_failed', {
                type: 'email',
                error: error.message
            });
        } catch (auditError) {
            console.error('Failed to log notification failure:', auditError);
        }
    }
};

// Log application metrics for analytics
const logApplicationMetrics = async (application) => {
    try {
        console.log('📊 Application Metrics:', {
            id: application._id,
            loanType: application.loanType,
            currency: application.currencyDisplayed,
            residency: application.residencyStatus,
            budgetRange: application.budgetRange,
            source: application.source,
            timestamp: application.createdAt
        });
    } catch (error) {
        console.error('Error logging application metrics:', error);
    }
};

const generateEnhancedEmailContent = (application) => {
    const formatValue = (key, value) => {
        const displayMap = {
            loanType: {
                'new-purchase': 'New Purchase',
                'refinance': 'Refinance',
                'investment': 'Investment Property'
            },
            propertyStatus: {
                'browsing': 'Just browsing',
                'looking': 'Actively searching',
                'found': 'Found my home'
            },
            propertyType: {
                'villa': 'Villa',
                'apartment': 'Apartment',
                'townhouse': 'Townhouse',
                'not-sure': 'Not sure yet'
            },
            budgetRange: {
                'under-1m': 'Under AED 1M',
                '1m-2m': 'AED 1M - 2M',
                '2m-5m': 'AED 2M - 5M',
                'above-5m': 'Above AED 5M'
            },
            downPayment: {
                '10-percent': '10%',
                '20-25-percent': '20-25%',
                '30-plus-percent': '30% or more',
                'need-guidance': 'Need guidance'
            },
            monthlyIncome: {
                'under-15k': 'Under AED 15K',
                '15k-30k': 'AED 15K - 30K',
                '30k-50k': 'AED 30K - 50K',
                'above-50k': 'Above AED 50K'
            },
            employmentStatus: {
                'uae-resident-employee': 'UAE Resident Employee',
                'uae-national': 'UAE National',
                'expat-work-visa': 'Expat on work visa',
                'self-employed': 'Self-employed'
            },
            contactMethod: {
                'email': 'Email',
                'phone': 'Phone Call',
                'whatsapp': 'WhatsApp',
                'both': 'Email & Phone'
            },
            bestTimeToCall: {
                'morning': 'Morning (9AM - 12PM)',
                'afternoon': 'Afternoon (12PM - 5PM)',
                'evening': 'Evening (5PM - 8PM)',
                'anytime': 'Anytime'
            },
            // Investment specific formatting
            investmentGoal: {
                'rental-income': 'Rental income',
                'capital-appreciation': 'Capital appreciation',
                'both-returns': 'Both rental and appreciation',
                'short-term-flip': 'Short-term flip'
            },
            investorExperience: {
                'first-investment': 'First investment property',
                'own-1-2': 'Own 1-2 properties',
                'own-3-plus': 'Own 3+ properties',
                'professional-investor': 'Professional investor'
            },
            investmentHorizon: {
                'short-term': 'Short-term (1-3 years)',
                'mid-term': 'Mid-term (3-7 years)',
                'long-term': 'Long-term (7+ years)'
            },
            investmentIncomeSource: {
                'employment-salary': 'Employment salary',
                'business-income': 'Business income',
                'investment-returns': 'Investment returns',
                'multiple-sources': 'Multiple sources'
            },
            investmentFinancingStructure: {
                'traditional-mortgage': 'Traditional mortgage',
                'islamic-financing': 'Islamic financing (Sharia)',
                'developer-financing': 'Developer financing',
                'need-advice': 'Need advice'
            },
            investmentDownPayment: {
                '25-percent': '25%',
                '30-40-percent': '30-40%',
                '50-plus-percent': '50% or more',
                'need-financing-options': 'Need financing options'
            }
        };
        
        return displayMap[key]?.[value] || value;
    };

    return `
        <html>
        <head>
            <style>
                body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
                .header { background: #000; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .section { margin-bottom: 30px; }
                .section h3 { color: #000; border-bottom: 2px solid #000; padding-bottom: 5px; }
                .field { margin-bottom: 10px; }
                .field strong { color: #000; }
                .highlight { background: #f8f9fa; padding: 15px; border-left: 4px solid #000; margin: 15px 0; }
                .footer { background: #f8f9fa; padding: 15px; text-align: center; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>🏠 New Landing Page Application</h2>
                <p>Application ID: ${application._id}</p>
            </div>
            
            <div class="content">
                <div class="highlight">
                    <h3>📋 Quick Summary</h3>
                    <p><strong>Name:</strong> ${application.fullName}</p>
                    <p><strong>Email:</strong> ${application.email}</p>
                    <p><strong>Phone:</strong> ${application.phoneNumber}</p>
                    <p><strong>Loan Type:</strong> ${formatValue('loanType', application.loanType)}</p>
                    <p><strong>Budget Range:</strong> ${formatValue('budgetRange', application.budgetRange)}</p>
                </div>

                <div class="section">
                    <h3>🏡 Property Details</h3>
                    <div class="field"><strong>Property Status:</strong> ${formatValue('propertyStatus', application.propertyStatus)}</div>
                    <div class="field"><strong>Property Type:</strong> ${formatValue('propertyType', application.propertyType)}</div>
                    <div class="field"><strong>Budget Range:</strong> ${formatValue('budgetRange', application.budgetRange)}</div>
                    <div class="field"><strong>Down Payment:</strong> ${formatValue('downPayment', application.downPayment)}</div>
                </div>

                <div class="section">
                    <h3>💼 Financial Information</h3>
                    <div class="field"><strong>Monthly Income:</strong> ${formatValue('monthlyIncome', application.monthlyIncome)}</div>
                    <div class="field"><strong>Employment Status:</strong> ${formatValue('employmentStatus', application.employmentStatus)}</div>
                    ${application.loanType === 'investment' ? `
                    <div class="field"><strong>Investment Goal:</strong> ${formatValue('investmentGoal', application.investmentGoal)}</div>
                    <div class="field"><strong>Investor Experience:</strong> ${formatValue('investorExperience', application.investorExperience)}</div>
                    <div class="field"><strong>Investment Horizon:</strong> ${formatValue('investmentHorizon', application.investmentHorizon)}</div>
                    <div class="field"><strong>Income Source:</strong> ${formatValue('investmentIncomeSource', application.investmentIncomeSource)}</div>
                    <div class="field"><strong>Financing Structure:</strong> ${formatValue('investmentFinancingStructure', application.investmentFinancingStructure)}</div>
                    <div class="field"><strong>Investment Down Payment:</strong> ${formatValue('investmentDownPayment', application.investmentDownPayment)}</div>
                    ` : application.loanType === 'refinance' ? `
                    <div class="field"><strong>Refinance Reason:</strong> ${formatValue('refinanceReason', application.refinanceReason)}</div>
                    <div class="field"><strong>Current Rate:</strong> ${formatValue('currentRate', application.currentRate)}</div>
                    <div class="field"><strong>Remaining Balance:</strong> ${formatValue('remainingBalance', application.remainingBalance)}</div>
                    <div class="field"><strong>Property Value:</strong> ${formatValue('propertyValue', application.propertyValue)}</div>
                    ` : ''}
                </div>

                <div class="section">
                    <h3>📞 Contact Preferences</h3>
                    <div class="field"><strong>Full Name:</strong> ${application.fullName}</div>
                    <div class="field"><strong>Email:</strong> ${application.email}</div>
                    <div class="field"><strong>Phone Number:</strong> ${application.phoneNumber}</div>
                    <div class="field"><strong>Preferred Contact Method:</strong> ${formatValue('contactMethod', application.contactMethod)}</div>
                    <div class="field"><strong>Best Time to Call:</strong> ${formatValue('bestTimeToCall', application.bestTimeToCall)}</div>
                </div>

                <div class="section">
                    <h3>🔍 Technical Details</h3>
                    <div class="field"><strong>Submission Date:</strong> ${new Date(application.createdAt).toLocaleString()}</div>
                    <div class="field"><strong>Source:</strong> ${application.source}</div>
                    <div class="field"><strong>Status:</strong> ${application.status}</div>
                    <div class="field"><strong>IP Address:</strong> ${application.ipAddress || 'Not available'}</div>
                </div>
            </div>
            
            <div class="footer">
                <p>This application was submitted through the Neon Mortgage landing page.</p>
                <p>Please respond to the customer within 24 hours for best conversion rates.</p>
            </div>
        </body>
        </html>
    `;
};

module.exports = {
    createLandingApplication
};