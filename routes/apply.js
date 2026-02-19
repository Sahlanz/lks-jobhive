const express = require('express');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const sqs = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
});

// POST submit a job application
router.post('/', async (req, res) => {
  try {
    const { job_id, job_title, company, name, email, phone, cover_letter } = req.body;

    if (!job_id || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Job ID, full name, and email are required'
      });
    }

    const application = {
      id: uuidv4(),
      job_id,
      job_title: job_title || '',
      company: company || '',
      name,
      email,
      phone: phone || '',
      cover_letter: cover_letter || '',
      status: 'pending',
      applied_at: new Date().toISOString()
    };

    await sqs.send(new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: JSON.stringify(application)
    }));

    res.status(201).json({
      success: true,
      message: 'Your application has been submitted successfully',
      application_id: application.id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
