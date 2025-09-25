# Email OTP Integration Setup Guide

## Overview

This guide explains how to set up and use the email OTP (One-Time Password) verification system in your E-Voting application.

## Features

- ✅ Email-based user registration with OTP verification
- ✅ Beautiful HTML email templates
- ✅ 5-minute OTP expiration
- ✅ Resend OTP functionality
- ✅ Automatic redirect to verification page
- ✅ Login protection for unverified users

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the `evoting-backend` directory with the following variables:

```env
# Database Configuration
DB_NAME=evoting_db
DB_USER=your_db_username
DB_PASS=your_db_password
DB_HOST=localhost

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (for OTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=5000
NODE_ENV=development

# Test Email (optional)
TEST_EMAIL=test@example.com
```

### 2. Gmail Setup (Recommended)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `EMAIL_PASS` in your .env file

### 3. Alternative Email Services

You can use other email services by modifying the transporter configuration in `services/emailService.js`:

```javascript
// For Outlook/Hotmail
const transporter = nodemailer.createTransporter({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// For custom SMTP
const transporter = nodemailer.createTransporter({
  host: "smtp.your-provider.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## API Endpoints

### Authentication Routes (`/api/auth/`)

#### 1. Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "aadhaarNumber": "123456789012",
  "phoneNumber": "+1234567890"
}
```

**Response:**

```json
{
  "message": "User registered. Please verify OTP sent to email.",
  "user": {
    "id": "user-uuid",
    "email": "john@example.com"
  }
}
```

#### 2. Verify Email OTP

```http
POST /api/auth/verify-email-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "voter"
  }
}
```

#### 3. Resend OTP

```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "message": "OTP resent successfully"
}
```

#### 4. Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success):**

```json
{
  "message": "Login successful",
  "token": "jwt-token",
  "userId": "user-uuid",
  "role": "voter",
  "name": "John Doe"
}
```

**Response (Unverified Email):**

```json
{
  "message": "Please verify your email via OTP",
  "requiresVerification": true,
  "email": "john@example.com"
}
```

## Frontend Flow

### 1. Registration Flow

1. User fills registration form
2. Form submits to `/api/auth/register`
3. User is redirected to `/verify-email` page
4. User enters OTP received via email
5. After verification, user is redirected to login

### 2. Login Flow

1. User enters credentials
2. If email not verified, user is redirected to verification page
3. If verified, user is logged in and redirected to dashboard

### 3. Verification Page Features

- 6-digit OTP input with auto-formatting
- 5-minute countdown timer
- Resend OTP functionality (after 1 minute)
- Beautiful UI with loading states
- Error handling and success messages

## Testing

### 1. Test Email OTP

Run the test script to verify email configuration:

```bash
cd evoting-backend
node test-email-otp.js
```

### 2. Manual Testing

1. Start the backend server: `npm run dev`
2. Start the frontend: `npm start`
3. Register a new user with a valid email
4. Check your email for the OTP
5. Enter the OTP in the verification page
6. Try logging in

## Troubleshooting

### Common Issues

#### 1. "Failed to send OTP email"

- Check EMAIL_USER and EMAIL_PASS in .env
- Verify Gmail App Password is correct
- Ensure 2FA is enabled on Gmail account

#### 2. "No OTP found for this email"

- OTP might have expired (5-minute limit)
- User might have already verified
- Try resending OTP

#### 3. "Invalid OTP"

- Check if OTP is entered correctly
- Ensure OTP hasn't expired
- Try resending a new OTP

#### 4. Database Issues

- Ensure database is running
- Check if User model has `isVerified` field
- Run database migrations if needed

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your .env file.

## Security Considerations

1. **OTP Expiration**: OTPs expire after 5 minutes
2. **Rate Limiting**: Consider adding rate limiting for OTP requests
3. **Email Validation**: Validate email format before sending OTP
4. **Cleanup**: Expired OTPs are automatically cleaned up
5. **HTTPS**: Use HTTPS in production for secure communication

## Customization

### Email Template

Modify the HTML template in `services/emailService.js` to match your brand.

### OTP Length/Expiry

Change OTP length in `utils/otpGenerator.js` and expiry time in `authController.js`.

### UI Styling

Customize the verification page styling in `src/pages/EmailVerification.jsx`.

## Production Deployment

1. Use a production email service (SendGrid, AWS SES, etc.)
2. Set up proper environment variables
3. Enable HTTPS
4. Configure rate limiting
5. Set up monitoring and logging
6. Test thoroughly before going live

## Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify your environment configuration
3. Test the email service independently
4. Check database connectivity
5. Review the API responses for specific error messages
