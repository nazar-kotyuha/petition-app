const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const flash = require("connect-flash")

const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config();

app.use(express.urlencoded( {extended: true} ));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(expressLayouts);

app.use(cookieParser('PetitionsAppSecure'))
app.use(session({
    secret: "PetitionsAppSecure",
    saveUninitialized: true,
    resave: true
}));
app.use(flash());
app.use(fileUpload());

app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

const routes = require('./server/routes/petitionRoutes.js');
const authRoutes = require('./server/routes/authRoutes.js');
const { requireAuth, checkUser } = require('./server/middleware/authMiddleware');


app.get('*', checkUser);
app.use('/', routes);
app.use('/auth', authRoutes);

app.listen(port, () => console.log(`Listening to port ${port}`));
