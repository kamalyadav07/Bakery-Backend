import express from 'express';
const router = express.Router();

// Example payment route
router.post('/', (req, res) => {
  res.send('Payment processing...');
});

export default router;
