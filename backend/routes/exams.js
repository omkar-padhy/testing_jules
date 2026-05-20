const express = require('express');
const pool = require('../db');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all exams (accessible by all authenticated users)
router.get('/', auth, async (req, res) => {
  try {
    const exams = await pool.query('SELECT * FROM exams');
    res.json(exams.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create an exam (Teacher and Admin only)
router.post('/', authorize(['Teacher', 'Admin']), async (req, res) => {
  const { title, description, questions } = req.body;

  if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Title and questions are required.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const examResult = await client.query(
      'INSERT INTO exams (title, description, teacher_id) VALUES ($1, $2, $3) RETURNING id',
      [title, description, req.user.id]
    );
    const examId = examResult.rows[0].id;

    for (let q of questions) {
      await client.query(
        'INSERT INTO questions (exam_id, text, options, correct_option) VALUES ($1, $2, $3, $4)',
        [examId, q.text, JSON.stringify(q.options), q.correct_option]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ id: examId, title, description });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Get a specific exam with questions (accessible by all authenticated users)
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const examResult = await pool.query('SELECT * FROM exams WHERE id = $1', [id]);
    if (examResult.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found.' });
    }

    const exam = examResult.rows[0];

    const questionsResult = await pool.query('SELECT * FROM questions WHERE exam_id = $1', [id]);

    // Do not return correct option if it is a student taking the exam
    const questions = questionsResult.rows.map(q => {
        if (req.user.role === 'Student') {
            return { id: q.id, text: q.text, options: q.options };
        }
        return q;
    });

    res.json({ ...exam, questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit exam (Student only)
router.post('/:id/submit', authorize(['Student']), async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body; // { questionId: selectedOptionIndex }

  // FIX: Validating payload so that answers must be a non-null object to prevent runtime errors
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return res.status(400).json({ error: 'Invalid answers format.' });
  }

  try {
    const questionsResult = await pool.query('SELECT * FROM questions WHERE exam_id = $1', [id]);
    const questions = questionsResult.rows;

    if (questions.length === 0) {
       return res.status(404).json({ error: 'Exam not found or has no questions.' });
    }

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_option) {
        score += 1;
      }
    });

    await pool.query(
      'INSERT INTO submissions (exam_id, student_id, score) VALUES ($1, $2, $3)',
      [id, req.user.id, score]
    );

    res.json({ score, total: questions.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
