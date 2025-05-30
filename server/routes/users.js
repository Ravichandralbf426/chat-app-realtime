const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /users – Register a new user
router.post('/', async (req, res) => {
  try {
    const { username } = req.body;
    const user = new User({ username });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user', details: err });
  }
});

module.exports = router;
