const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

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
