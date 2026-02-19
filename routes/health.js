const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    app: 'JobHive',
    version: process.env.APP_VERSION || '1.0.0',
    queue: process.env.SQS_QUEUE_URL ? 'configured' : 'missing',
    jobs_table: process.env.DYNAMODB_JOBS_TABLE || 'missing',
    apps_table: process.env.DYNAMODB_APPS_TABLE || 'missing',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
