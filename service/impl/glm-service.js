const https = require('https');
const { ZHIPUAI_CONFIG } = require('../../config');
const { assembleBillPrompt, cleanJsonContent } = require('../llm-utils');

class GlmService {
  async analyzeBillMessage(message) {
    return new Promise((resolve, reject) => {
      try {
        const postData = JSON.stringify({
          model: ZHIPUAI_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: '你是一个账单信息提取助手，能够从用户的文本中提取结构化的账单信息'
            },
            {
              role: 'user',
              content: assembleBillPrompt(message)
            }
          ],
          temperature: 0.7
        });
        const url = new URL(ZHIPUAI_CONFIG.apiUrl);
        const options = {
          hostname: url.hostname,
          port: 443,
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ZHIPUAI_CONFIG.token}`
          }
        };
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              console.log('智谱清言API原始响应:', response);
              if (response.error) {
                reject(new Error(response.error.message));
                return;
              }
              if (!response.choices || !response.choices[0] || !response.choices[0].message) {
                reject(new Error('智谱清言API返回格式错误'));
                return;
              }
              let content = response.choices[0].message.content;
              console.log('智谱清言API原始内容:', content);
              resolve(JSON.parse(cleanJsonContent(content)));
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
}

exports.GlmService = GlmService;