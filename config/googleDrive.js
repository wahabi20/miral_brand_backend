const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

let drive;

const serviceAccountPath = path.join(__dirname, 'google-service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: ['https://www.googleapis.com/auth/drive']
  });
  drive = google.drive({ version: 'v3', auth });
} else {
  console.warn('⚠️  Google Drive service account not found. Image upload will be disabled.');
  drive = null;
}

module.exports = drive;
