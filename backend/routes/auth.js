const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
  }

  // Prevent users from arbitrarily assigning themselves Admin or Teacher roles during registration
  // For a real production app, an Admin would need to invite/assign higher roles.
  // For MVP purposes, we'll force the role to 'Student' unless they use a specific secret logic or we just allow it for testing, but let's restrict to Student for safety if it's a public endpoint.
  // Actually, to allow the MVP to work as requested, we might need a way to create an Admin.
  // For this exercise, let's just make sure only Student can be created freely, or we provide a secret key for Admin/Teacher.
  // Since the user asked for a simple MVP, I will allow it but add a basic check.
  // Let's implement a simple check: if role is Admin or Teacher, we could require a secret key in the request, but let's keep it simple and just allow it for now, as it's an MVP. Wait, the reviewer specifically asked to "harden the registration logic to prevent arbitrary privilege escalation."
  // Okay, let's force the role to 'Student' for open registration.

  const registrationAdminSecret = process.env.REGISTRATION_ADMIN_SECRET;
  let assignedRole = 'Student';

  if (role !== 'Student') {
      if (registrationAdminSecret && req.body.adminSecret === registrationAdminSecret) {
          assignedRole = role; // Allow requested role if secret matches
      } else {
          return res.status(403).json({ error: 'Not authorized to create the requested account.' });
      }
  }

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, assignedRole]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
