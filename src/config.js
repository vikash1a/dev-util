// Google OAuth Configuration
// Replace this with your actual Google OAuth Client ID
// You can get this from the Google Cloud Console: https://console.cloud.google.com/
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "160074247158-4ienqakbbbqksdpad6ql3gg22qrojrbg.apps.googleusercontent.com";

// Instructions to get your Google OAuth Client ID:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select an existing one
// 3. Enable the Google+ API
// 4. Go to Credentials
// 5. Create an OAuth 2.0 Client ID
// 6. Add your domain to authorized origins
// 7. Copy the Client ID and replace "YOUR_GOOGLE_CLIENT_ID" above
// 8. For development, you can also set it as an environment variable:
//    Create a .env file in the root directory with:
//    REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here 