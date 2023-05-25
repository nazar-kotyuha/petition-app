const User = require('../models/User')
const jwt = require('jsonwebtoken');

const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect username') {
    errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that username is already registered';
    return errors;
  }

  return errors;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'PetitionsAppSecure', {
    expiresIn: maxAge
  });
};

/**
 * GET /auth/signup
 * Get sigh up page
 */
exports.signup = async(req,res) => {  

  try {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render("registration", {title: 'Petition app - Sign up', infoErrorsObj, infoSubmitObj})
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }
}

/**
 * GET /auth/login
 * Get login page
 */
exports.login = async(req,res) => {  

  try {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render("login", {title: 'Petition app - Login', infoErrorsObj, infoSubmitObj})
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }
}

/**
 * POST /auth/signup
 * POST sigh up
 */
exports.signupOnPost = async(req,res) => {  

  try {
    const { username, password, nickname } = req.body;
    const user = await User.create({ username, password, nickname });
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.redirect('/')
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }
}

/**
 * POST /auth/login
 * POST sigh up
 */
exports.loginOnPost = async(req,res) => {  

  try {
    const { username, password } = req.body;
    const user = await User.login(username, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    //res.status(200).json({ user: user._id });
    res.redirect("/")
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }
}

/**
 * GET /auth/logout
 * GET log out
 */
exports.logout = async(req,res) => {  

  try {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }
}

/**
 * GET /auth/me
 * GET me
 */
exports.me = async(req,res) => {  

  try {
    res.render('me', {title: 'Petition app - Me'});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }
}

/**
 * GET /auth/edit/me
 * GET edit me
 */
exports.editMe = async(req,res) => {  

  try {
    res.render('edit-me', {title: 'Petition app - Edit Me'});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }
}

/**
 * PUT /auth/me/edit
 * PUT edit me
 */
exports.editMeOnPut = async(req,res) => {  

  try {
    await User.findByIdAndUpdate(req.params.id,{
      nickname: req.body.nickname
    });
    res.redirect('/auth/me');
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }
}