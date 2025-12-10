// Netlify serverless function wrapper for Express app
const app = require('../../src/app');

exports.handler = async (event, context) => {
  const response = await new Promise((resolve, reject) => {
    app(event, context, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
  
  return response;
};
