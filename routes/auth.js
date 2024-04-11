import { Router } from 'express';
import { login, signUp, getUserInformation } from '../controllers/auth.js';
import { authenticateToken } from '../utils/helpers.js';

export const router = new Router();

router.post('/login', async (req, res) => login(req, res));

router.post('/signup', async (req, res) => signUp(req, res));

router.get('/me', authenticateToken, async (req, res) => getUserInformation(req, res));