# Neon Mortgage Admin Dashboard

A modern, fully-featured SaaS dashboard for managing mortgage applications built with Next.js 14, TypeScript, and Shadcn/ui.

## 🚀 Features

### Core Features
- **Modern UI/UX**: Built with Shadcn/ui components and Tailwind CSS
- **Responsive Design**: Fully responsive across all device sizes
- **Real-time Dashboard**: Live statistics and KPI tracking
- **Advanced Filtering**: Search and filter applications by multiple criteria
- **Data Visualization**: Interactive charts and analytics using Recharts
- **Export Functionality**: CSV and PDF export capabilities
- **Audit Trail**: Complete audit log for all application changes

### Technical Features
- **Next.js 14**: Latest App Router with server components
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI components
- **Tanstack Query**: Powerful data fetching and caching
- **Zustand**: Lightweight state management

## 🏗️ Architecture

```
mortgage-admin/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Dashboard homepage
│   ├── applications/      # Applications management
│   ├── analytics/         # Analytics and reports
│   └── layout.tsx         # Root layout
├── components/
│   ├── layout/           # Layout components (sidebar, header)
│   └── ui/              # Shadcn/ui components
├── lib/
│   └── utils.ts         # Utility functions
└── public/              # Static assets
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB running on localhost:27017
- Main Express server running

### Development Setup

1. **Install Dependencies**
   ```bash
   cd mortgage-admin
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   The dashboard will be available at `http://localhost:3001`

3. **Access via Main Server**
   The dashboard is integrated with the main Express server and can be accessed at:
   `http://localhost:4013/mortgage-admin` (redirects to Next.js dev server in development)

## 📊 Dashboard Features

### 1. Main Dashboard
- **Real-time Statistics**: Total applications, approval rates, average loan amounts
- **Recent Applications**: Quick view of latest submissions
- **Trend Indicators**: Visual indicators showing performance changes
- **Quick Actions**: Direct access to common tasks

### 2. Applications Management
- **Comprehensive List View**: All applications with sorting and filtering
- **Advanced Search**: Search by name, email, phone, or application ID
- **Bulk Operations**: Perform actions on multiple applications
- **Status Management**: Update application statuses with audit trails
- **Export Options**: CSV and PDF export with custom filters

### 3. Analytics Dashboard
- **Monthly Trends**: Application volume and approval rate trends
- **Loan Distribution**: Breakdown by loan type (Purchase, Refinance, Investment)
- **Conversion Funnel**: Track application progress through stages
- **Performance Metrics**: KPIs and goal tracking
- **Interactive Charts**: Powered by Recharts for rich data visualization

### 4. Data Export
- **CSV Export**: Complete application data with custom date ranges
- **Filtered Exports**: Export based on status, loan type, or date range
- **Audit Logs**: Export audit trails for compliance

## 🔐 Security & Authentication

- **JWT-based Authentication**: Secure token-based authentication
- **Protected Routes**: All admin routes require authentication
- **Audit Trails**: Complete logging of all administrative actions
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against abuse

## 🔌 API Integration

The dashboard integrates with the following API endpoints:

```
POST /api/mortgage-admin/login              # Authentication
GET  /api/mortgage-admin/dashboard/stats    # Dashboard statistics
GET  /api/mortgage-admin/applications       # List applications
GET  /api/mortgage-admin/applications/:id   # Get application details
PUT  /api/mortgage-admin/applications/:id/status # Update status
POST /api/mortgage-admin/applications/bulk  # Bulk operations
GET  /api/mortgage-admin/applications/export # Export data
```

## 🎨 Design System

### Colors
- **Primary**: Blue to Purple gradient (`#3b82f6` to `#8b5cf6`)
- **Success**: Green (`#10b981`)
- **Warning**: Yellow (`#f59e0b`)
- **Error**: Red (`#ef4444`)
- **Neutral**: Gray scale

### Typography
- **Primary Font**: Inter (system font)
- **Headings**: Font weights 600-800
- **Body**: Font weight 400-500

### Components
All UI components are built using Shadcn/ui for consistency and accessibility:
- Buttons with multiple variants
- Form inputs with validation states
- Data tables with sorting and filtering
- Modal dialogs and sheets
- Toast notifications

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Production Configuration
The dashboard automatically switches between development and production modes:
- **Development**: Proxies requests to Next.js dev server (port 3001)
- **Production**: Serves built static files from the main Express server

### Environment Variables
Configure the following in your main server `.env`:
```
NODE_ENV=production
JWT_SECRET=your-jwt-secret
MONGODB_URI=mongodb://localhost:27017/neon-mortgage
LANDING_MONGODB_URI=mongodb://localhost:27017/neon-landing
```

## 📈 Performance Features

- **Code Splitting**: Automatic code splitting with Next.js
- **Lazy Loading**: Components and routes loaded on demand
- **Caching**: TanStack Query provides intelligent caching
- **Optimized Images**: Next.js Image component for optimized loading
- **Bundle Analysis**: Built-in bundle analyzer for optimization

## 🔧 Customization

### Adding New Pages
1. Create a new page in the `app/` directory
2. Add navigation link to `components/layout/sidebar.tsx`
3. Add any required API endpoints to the main server

### Custom Components
All components follow the Shadcn/ui pattern and can be easily customized by modifying the base components in `components/ui/`.

### Styling
The dashboard uses Tailwind CSS with a custom design system. Modify `tailwind.config.js` to customize colors, spacing, and other design tokens.

## 📱 Mobile Support

The dashboard is fully responsive and optimized for:
- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Collapsible sidebar with touch-optimized interactions
- **Mobile**: Bottom navigation with streamlined interface

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Ensure port 3001 is available for the Next.js dev server
   - Check that the main server is not using port 3001

2. **Database Connection**
   - Verify MongoDB is running and accessible
   - Check database connection strings in environment variables

3. **API Errors**
   - Ensure all API endpoints are properly configured in `routes.js`
   - Verify middleware authentication is working correctly

### Development Tools
- **TypeScript**: Full type checking with `npm run type-check`
- **ESLint**: Code linting with `npm run lint`
- **Hot Reload**: Automatic refresh during development

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new components
3. Add appropriate error handling
4. Update documentation for new features
5. Test thoroughly across different screen sizes

## 📄 License

This project is part of the Neon Mortgage application suite.