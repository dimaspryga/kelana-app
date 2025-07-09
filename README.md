# Kelana App

A modern travel and adventure booking platform built with Next.js.

## Features

- **Role-based Access Control**: Secure middleware ensures proper access based on user roles
- **Modern UI/UX**: Beautiful, responsive design with glassmorphism effects
- **Real-time Cart Management**: Seamless shopping cart experience
- **Admin Dashboard**: Comprehensive admin panel for managing content
- **User Authentication**: Secure login/register system

## Role-Based Access Control

The application implements strict role-based access control through middleware:

### Admin Routes (`/admin`, `/dashboard`, etc.)
- **Access**: Only users with `admin` role
- **Redirect**: Non-admin users are redirected to home page
- **Login Redirect**: Admin users are automatically redirected to `/dashboard` after login

### User Routes (`/cart`, `/profile`, etc.)
- **Access**: Only users with `user` role
- **Redirect**: Admin users trying to access user routes are redirected to `/dashboard`
- **Login Redirect**: Regular users are redirected to home page after login

### Public Routes (`/`, `/activity`, etc.)
- **Access**: Everyone (authenticated and non-authenticated users)
- **No Restrictions**: Free access to browse activities and content

### Authentication Routes (`/login`, `/register`)
- **Access**: Non-authenticated users
- **Redirect**: Already authenticated users are redirected based on their role

## Security Features

- **Token Verification**: All protected routes verify JWT tokens
- **Session Management**: Automatic session cleanup and token refresh
- **Route Protection**: Middleware prevents unauthorized access to protected routes
- **Security Headers**: XSS protection and other security headers

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Middleware Configuration

The middleware automatically handles:
- Route classification based on URL patterns
- Token verification and user role validation
- Automatic redirects based on user authentication status
- Cache management for performance optimization

## API Endpoints

- `/api/login` - User authentication
- `/api/register` - User registration
- `/api/verify` - Token verification (used by middleware)
- `/api/cart-*` - Cart management
- `/api/activities` - Activity management
- And more...

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Styling**: Tailwind CSS with custom components
- **Authentication**: JWT tokens with secure cookie storage
- **State Management**: React Context API
- **UI Components**: Custom components with shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
