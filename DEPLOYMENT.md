# Deployment Guide

## Overview
This guide covers deploying the EsportsConnect platform to production using Vercel.

## Prerequisites
- Vercel account
- GitHub repository
- Supabase project with production database
- Environment variables configured

## Environment Variables

### Required Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Analytics (if implemented)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Setting Environment Variables in Vercel
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with the appropriate value
4. Make sure to set them for Production, Preview, and Development environments

## Deployment Steps

### 1. Connect Repository
1. Log in to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js project

### 2. Configure Build Settings
The project is already configured with:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 3. Environment Variables Setup
Add the following environment variables in Vercel dashboard:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Deploy
1. Click "Deploy" in Vercel dashboard
2. Wait for the build to complete
3. Your app will be available at `https://your-project.vercel.app`

## Performance Optimizations

### Implemented Optimizations
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: WebP/AVIF format support
- **Bundle Optimization**: Package import optimization
- **Caching**: API response caching
- **Error Boundaries**: Graceful error handling
- **Security Headers**: XSS protection, content type sniffing prevention

### Monitoring
- Performance metrics tracking
- Core Web Vitals measurement
- Error logging and reporting
- Cache hit/miss ratios

## Database Setup

### 1. Production Database
Ensure your Supabase project has:
- All tables created (users, posts, teams, championships, etc.)
- Row Level Security (RLS) policies enabled
- Proper indexes for performance
- Database functions for complex queries

### 2. Run Database Scripts
Execute the following SQL scripts in your Supabase SQL editor:
- `setup-database-safe.sql`
- `setup-database-policies-safe.sql`
- `setup-database-indexes-safe.sql`

## Security Considerations

### Implemented Security Features
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Authentication**: Supabase Auth with OAuth providers
- **Data Protection**: RLS policies for data access control
- **Input Validation**: Form validation and sanitization
- **Error Handling**: Secure error messages without sensitive data

### Additional Security Measures
- Regular dependency updates
- Environment variable protection
- HTTPS enforcement
- Content Security Policy (CSP) headers

## Monitoring and Analytics

### Performance Monitoring
- Core Web Vitals tracking
- Page load time measurement
- Component render time monitoring
- API response time tracking

### Error Tracking
- Error boundary implementation
- Console error logging
- User error reporting
- Performance issue detection

## Troubleshooting

### Common Issues

#### Build Failures
- Check environment variables are set correctly
- Ensure all dependencies are in package.json
- Verify TypeScript compilation passes locally

#### Runtime Errors
- Check Supabase connection and credentials
- Verify database tables and policies are set up
- Check browser console for client-side errors

#### Performance Issues
- Monitor Core Web Vitals in production
- Check bundle size and loading times
- Optimize images and assets
- Review caching strategies

### Debug Mode
Enable debug mode by setting:
```bash
NODE_ENV=development
```

## Maintenance

### Regular Tasks
- Monitor performance metrics
- Update dependencies regularly
- Review and optimize database queries
- Check error logs and user feedback
- Update security policies as needed

### Scaling Considerations
- Database connection pooling
- CDN for static assets
- Caching strategies for high traffic
- Load balancing for multiple instances

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Review environment variable configuration
3. Verify database connectivity
4. Check browser console for errors

## Production Checklist

- [ ] Environment variables configured
- [ ] Database tables and policies set up
- [ ] Security headers implemented
- [ ] Performance optimizations enabled
- [ ] Error boundaries in place
- [ ] Monitoring and analytics configured
- [ ] SSL certificate active
- [ ] Domain configured (if using custom domain)
- [ ] Backup strategy implemented
- [ ] Documentation updated
