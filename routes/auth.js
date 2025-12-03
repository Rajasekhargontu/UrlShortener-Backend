import express from 'express';
import {body} from 'express-validator';
import {register,login} from '../controllers/authController.js';
const router=express.Router();
router.post('/register',[
    body('email','Invalid email').isEmail(),
    body('password','Password must be at least 8 characters').isLength({min:8})
],register);
router.post('/login',[
    body('email','Invalid email').isEmail(),
    body('password','Password is required').exists()
],login);
export default router;