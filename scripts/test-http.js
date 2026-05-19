const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/account/5096/api/smartdoc/variables/6a0c1a3fb9f3a14df0c944c2',
  method: 'GET',
  headers: {
    // We might need authentication to hit this API...
    // Let's just bypass auth by writing an express route or calling the logic.
  }
};
