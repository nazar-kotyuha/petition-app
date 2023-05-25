const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * App Routes
 */

router.get('/signup', authController.signup);
router.get('/login', authController.login);
router.post('/signup', authController.signupOnPost);
router.post('/login', authController.loginOnPost);
router.get('/logout', authController.logout);

router.get('/me', authController.me);
router.get('/me/edit/:id', authController.editMe);
router.put('/me/edit/:id', authController.editMeOnPut);


module.exports = router;