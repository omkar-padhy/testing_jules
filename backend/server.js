const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Set up rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use(limiter);

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exams');

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);

app.get('/', (req, res) => {
  res.send('SEMS API is running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
