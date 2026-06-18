import express from 'express';
import { searchAllLawInfo } from '../controllers/lawController.js';

const router = express.Router();

// Routes for unified search (laws/articles, precedents, others)
router.post('/search', searchAllLawInfo);
router.get('/search', searchAllLawInfo);

export default router;
