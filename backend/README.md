# Crypto Platform Backend

A comprehensive backend API for a cryptocurrency trading platform built with Node.js, TypeScript, Express, and MongoDB.

## Features

- **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-based access control (User, Admin)
  - Password reset functionality
  - Email verification

- **User Management**
  - User registration and login
  - Profile management
  - Password change
  - Account deactivation

- **Security**
  - Password hashing with bcrypt
  - Rate limiting
  - Input validation and sanitization
  - CORS protection
  - Security headers with Helmet

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Joi
- **Email**: Nodemailer
- **Security**: Helmet, express-rate-limit, express-validator

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. Clone the repository

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/change-password` - Change password
- `DELETE /api/user/account` - Deactivate account

## Environment Variables

