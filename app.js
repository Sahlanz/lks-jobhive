require('dotenv').config();
const express = require('express');
const path = require('path');
const healthRouter = require('./routes/health');
const jobsRouter = require('./routes/jobs');
const applyRouter = require('./routes/apply');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/health', healthRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/apply', applyRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/jobs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'jobs.html'));
});
app.get('/apply', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'apply.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`JobHive running on port ${PORT}`);
});
