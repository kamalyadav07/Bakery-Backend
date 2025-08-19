import express from 'express';
const router = express.Router();

// Example order route
router.get('/', (req, res) => {
  res.send('Orders route');
});

export default router;
