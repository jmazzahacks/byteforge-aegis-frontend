# ByteForge Aegis Frontend

Reference frontend implementation for ByteForge Aegis authentication flows. This provides ready-to-use pages for email verification, password reset, and email change confirmation that can be used immediately or customized for tenant-specific branding.

## Overview

This Next.js application serves as both:
1. **A turnkey solution** - Hosted auth pages that tenants can use immediately
2. **Example code** - Demonstrates best practices for integrating with byteforge-aegis-client-js

## Features

- **Email Verification** - Handles email verification tokens from registration
- **Password Reset** - Complete password reset flow with token validation
- **Email Change Confirmation** - Confirms email address changes
- **Site Customization** - Support for tenant branding via query parameters
- **Responsive UI** - Mobile-friendly with Tailwind CSS
- **TypeScript** - Full type safety throughout

## Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn
- ByteForge Aegis backend running

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Update .env.local with your API URL
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
npm run build
npm start
```

## Authentication Pages

### Email Verification

**URL**: `/verify-email`

Handles email verification for both self-registered users and admin-created users:
- **Self-registered users**: Auto-verifies (they already set their password during registration)
- **Admin-created users**: Prompts for password setup, then verifies

**Required Query Parameters**:
- `token` - Verification token from email

**Optional Query Parameters** (for customization):
- `siteName` - Display name for the site
- `logoUrl` - URL to site logo
- `primaryColor` - Primary brand color (hex)
- `backgroundColor` - Background color (hex)

**Example**:
```
http://localhost:3000/verify-email?token=abc123&siteName=My%20App&logoUrl=https://example.com/logo.png
```

### Password Reset

**URL**: `/reset-password`

**Required Query Parameters**:
- `token` - Password reset token from email
- `site_id` - Tenant site ID

**Optional Query Parameters**: Same customization options as above

**Example**:
```
http://localhost:3000/reset-password?token=def456&site_id=site_xyz
```

### Email Change Confirmation

**URL**: `/confirm-email-change`

**Required Query Parameters**:
- `token` - Email change confirmation token
- `site_id` - Tenant site ID

**Optional Query Parameters**: Same customization options as above

**Example**:
```
http://localhost:3000/confirm-email-change?token=ghi789&site_id=site_xyz
```

## Customization

### Query Parameters

Customize the appearance of auth pages by adding query parameters to the URLs in your email templates:

```
?siteName=Your%20App%20Name
&logoUrl=https://yourdomain.com/logo.png
&primaryColor=%23007bff
&backgroundColor=%23f8f9fa
```

### Styling

The frontend uses Tailwind CSS. Customize styles by:

1. Editing `tailwind.config.ts` for theme customization
2. Modifying `app/globals.css` for global styles
3. Updating component styles in `components/` directory

### Custom Branding

For more advanced customization, fork this repository and:

1. Modify components in `components/` directory
2. Update layouts in `app/layout.tsx`
3. Customize email template URLs in backend to point to your hosted frontend

## Project Structure

```
byteforge-aegis-frontend/
├── app/                           # Next.js app directory
│   ├── confirm-email-change/      # Email change confirmation page
│   ├── reset-password/            # Password reset page
│   ├── verify-email/              # Email verification page
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── components/                    # Reusable components
│   ├── AuthCard.tsx               # Auth page container
│   └── StatusMessage.tsx          # Status feedback component
├── lib/                           # Utility libraries
│   └── authClient.ts              # Auth client initialization
├── utils/                         # Utility functions
│   └── customization.ts           # Site customization helpers
├── .env.example                   # Environment variables template
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies
├── tailwind.config.ts             # Tailwind configuration
└── tsconfig.json                  # TypeScript configuration
```

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production, set this to your ByteForge Aegis backend URL.

### Backend Integration

Update your ByteForge Aegis backend email templates to use these frontend URLs:

```python
# In your backend email_service.py or similar
frontend_url = "https://auth.yourdomain.com"  # Your hosted frontend

verification_url = f"{frontend_url}/verify-email?token={token}&site_id={site_id}"
reset_url = f"{frontend_url}/reset-password?token={token}&site_id={site_id}"
confirm_url = f"{frontend_url}/confirm-email-change?token={token}&site_id={site_id}"
```

## Deployment

For full deployment instructions including Docker Compose, nginx reverse proxy configuration, and admin bootstrapping, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Known Issues

- **Production build with Turbopack**: There's currently an issue with production builds using Turbopack and local package dependencies. Development mode works perfectly. For production, consider publishing the client-js package to npm or using webpack instead of Turbopack.

## Related Projects

- [byteforge-aegis](../byteforge-aegis) - Backend authentication service
- [byteforge-aegis-client-js](../byteforge-aegis-client-js) - JavaScript/TypeScript API client

## Development Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features and development tasks.

## License

MIT

## Author

Jason Byteforge <jason@mzmail.me>
