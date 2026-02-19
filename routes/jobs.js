const express = require('express');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand,
        GetCommand } = require('@aws-sdk/lib-dynamodb');
const router = express.Router();

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
}));

// GET all job listings
router.get('/', async (req, res) => {
  try {
    const result = await dynamo.send(new ScanCommand({
      TableName: process.env.DYNAMODB_JOBS_TABLE
    }));
    const items = (result.Items || []).sort((a, b) =>
      new Date(b.posted_at) - new Date(a.posted_at)
    );
    res.json({ success: true, total: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single job by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await dynamo.send(new GetCommand({
      TableName: process.env.DYNAMODB_JOBS_TABLE,
      Key: { id: req.params.id }
    }));
    if (!result.Item) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, data: result.Item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET application statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [jobsResult, appsResult] = await Promise.all([
      dynamo.send(new ScanCommand({ TableName: process.env.DYNAMODB_JOBS_TABLE })),
      dynamo.send(new ScanCommand({ TableName: process.env.DYNAMODB_APPS_TABLE }))
    ]);

    const jobs = jobsResult.Items || [];
    const apps = appsResult.Items || [];

    const byType = {};
    jobs.forEach(j => {
      byType[j.type] = (byType[j.type] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total_jobs: jobs.length,
        total_applications: apps.length,
        jobs_by_type: byType
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
