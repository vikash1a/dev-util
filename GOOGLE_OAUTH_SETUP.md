# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your Dev Utils application.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your Project ID

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required information (App name, User support email, Developer contact information)
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed
   - Save and continue

4. Create the OAuth client ID:
   - Application type: "Web application"
   - Name: "Dev Utils Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://vikash1a.github.io` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://vikash1a.github.io/dev-util` (for production)

5. Click "Create"
6. Copy the Client ID (you'll need this in the next step)

## Step 4: Configure the Application

### Option 1: Environment Variable (Recommended)

1. Create a `.env` file in the root directory of your project
2. Add the following line:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
   ```
3. Replace `your_client_id_here` with the Client ID from Step 3

### Option 2: Direct Configuration

1. Open `src/config.js`
2. Replace `"YOUR_GOOGLE_CLIENT_ID"` with your actual Client ID

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`
3. You should see a login page with a Google Sign-In button
4. Click the button and complete the OAuth flow
5. After successful authentication, you should see the main application with your profile in the navbar

## Troubleshooting

### Common Issues:

1. **"Invalid Client ID" error**
   - Make sure you've copied the Client ID correctly
   - Verify that the domain is added to authorized origins

2. **"Redirect URI mismatch" error**
   - Check that your domain is listed in authorized redirect URIs
   - For localhost development, use `http://localhost:3000`
   - For GitHub Pages, use `https://vikash1a.github.io/dev-util`

3. **"OAuth consent screen not configured" error**
   - Complete the OAuth consent screen configuration
   - Add your email as a test user if using external user type

4. **Environment variable not working**
   - Make sure the `.env` file is in the root directory
   - Restart your development server after adding the `.env` file
   - Variable name must start with `REACT_APP_`

## Security Notes

- Never commit your Client ID to version control
- Use environment variables for sensitive configuration
- Regularly rotate your OAuth credentials
- Monitor your OAuth usage in Google Cloud Console

## Production Deployment

When deploying to GitHub Pages:

1. Update the authorized origins in Google Cloud Console to include your production domain
2. Use environment variables or update the config file with your production Client ID
3. Test the OAuth flow on the production site

## Additional Features

The OAuth implementation includes:

- Automatic login state persistence
- User profile display in navbar
- Secure logout functionality
- Responsive design for mobile devices
- Loading states and error handling 