const chokidar = require('chokidar');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Watch the folder you want to monitor (adjust the path as necessary)
const folderToWatch = 'C:/Documents/React Course/MySQL No Jest App/mysql-no-jest-app';

// Define the root of your repository relative to your local directory
const repoRoot = 'C:/Documents/React Course/MySQL No Jest App/mysql-no-jest-app';

// Initialize watcher
const watcher = chokidar.watch(folderToWatch, {
  ignored: /(^|[\/\\])(\..|node_modules)/, // Ignore dotfiles and node_modules folder
  persistent: true
});


// Define the webhook URL from Make.com
const webhookUrl = 'https://hook.us2.make.com/k8k5btyh4qfqydpdvriwd5fboe6ck0bs';

// Handle events when a file is added, changed, or deleted
watcher.on('add', path => handleFileChange(path, 'added'))
       .on('change', path => handleFileChange(path, 'changed'))
       .on('unlink', path => sendWebhook(path, 'removed'));  // No need to send content for deleted files

// Function to handle file changes
function handleFileChange(filePath, eventType) {
  // Read the file and convert it to Base64
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }

    const base64Content = data.toString('base64');

    // Send the Base64-encoded file content and other details to Make.com
    sendWebhook(filePath, eventType, base64Content);
  });
}

// Function to send webhook with file content
function sendWebhook(filePath, eventType, base64Content = null) {
  console.log(`File ${filePath} has been ${eventType}`);

  const relativeFilePath = path.relative(repoRoot, filePath);
  
  const file1 = relativeFilePath.replace(/\\/g, '\\\\');

  
  const payload = {
    file: relativeFilePath,
    file1,
    event: eventType,
    content: base64Content  // Include the Base64-encoded content if the file is added or changed
  };

  axios.post(webhookUrl, payload)
    .then(response => {
      console.log('Webhook sent successfully:', response.data);
    })
    .catch(error => {
      console.error('Error sending webhook:', error);
    });
}