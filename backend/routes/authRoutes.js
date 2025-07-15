import express from 'express';
import {
    registerOwner,
    registerEmployee,
    loginOwner,
    loginEmployee,
    logout
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register-owner', registerOwner);
router.post('/register-employee', registerEmployee);
router.post('/login-owner', loginOwner);
router.post('/login-employee', loginEmployee);
router.post('/logout', logout);

export default router;
