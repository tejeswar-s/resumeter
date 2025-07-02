const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const atsRouter = require('./routes/ats');
const auth = require('./routes/auth');

mongoose.connect('mongodb://127.0.0.1:27017/resumeter', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// TODO: Add file upload and ATS scoring routes here
app.use('/api/ats', atsRouter);
app.use('/api/auth', auth.router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});