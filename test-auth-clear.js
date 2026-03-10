const { app } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(() => {
  const tokenPath = path.join(app.getPath('userData'), 'token.json');
  console.log('Token Path:', tokenPath);
  
  if (fs.existsSync(tokenPath)) {
      const tokenData = fs.readFileSync(tokenPath, 'utf8');
      console.log('Token Exists. Contents snippet:', tokenData.substring(0, 100) + '...');
      
      // Let's delete it to force re-auth
      fs.unlinkSync(tokenPath);
      console.log('Deleted token.json to force re-auth.');
  } else {
      console.log('Token does not exist at path.');
  }

  app.quit();
});
