const https = require('https');

exports.sendToFeishuWebhook = async (data, webhookUrl) => {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(webhookUrl);
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const postData = typeof data === 'string' ? data : JSON.stringify(data);
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(responseData);
            console.log('飞书webhook原始响应:', response);
            if (response.code === 0) {
              resolve(true);
            } else {
              reject(new Error(response.msg || responseData));
            }
          } catch (error) {
            reject(new Error(error.message));
          }
        });
      });
      req.on('error', (error) => {
        reject(new Error(error.message));
      });
      req.write(postData);
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}