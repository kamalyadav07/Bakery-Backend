import express from 'express';
const router = express.Router();

// Example AI route
router.get('/', (req, res) => {
  res.send('AI route is working!');
});

export default router;
