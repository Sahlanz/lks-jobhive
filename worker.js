require('dotenv').config();
const { SQSClient, ReceiveMessageCommand,
        DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const sqs = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
});

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
}));

async function processQueue() {
  try {
    const result = await sqs.send(new ReceiveMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 5
    }));

    if (result.Messages && result.Messages.length > 0) {
      for (const msg of result.Messages) {
        const application = JSON.parse(msg.Body);

        await dynamo.send(new PutCommand({
          TableName: process.env.DYNAMODB_APPS_TABLE,
          Item: application
        }));

        await sqs.send(new DeleteMessageCommand({
          QueueUrl: process.env.SQS_QUEUE_URL,
          ReceiptHandle: msg.ReceiptHandle
        }));

        console.log(`[Worker] Application ${application.id} saved to DynamoDB`);
      }
    }
  } catch (err) {
    console.error('[Worker] Error:', err.message);
  }

  setTimeout(processQueue, 5000);
}

console.log('[Worker] SQS Worker is running...');
processQueue();
