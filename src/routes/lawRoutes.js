import express from 'express';
import { generateLawGuide } from '../controllers/lawController.js';

const router = express.Router();

// Route: POST /api/law-guide
router.post('/law-guide', generateLawGuide);

// Route: GET /api/law-guide (for simple GET testing)
router.get('/law-guide', (req, res) => {
  res.status(200).json({
    message: 'To search laws, please send a POST request with a JSON body containing "keyword", "userMessage", or "category".'
  });
});

export default router;
