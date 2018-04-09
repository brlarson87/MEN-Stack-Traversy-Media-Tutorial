const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);
var db = mongoose.connection;

// Check connection
db.once('open', () => {
  console.log('connected to mongodb');
});

// Check for db errors
db.on('error', (err) => {
  console.log(err);
});
// Init app
var app = express();

//Bring in model
var Article = require('./models/article');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// bodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

// Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator middleware
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg : msg,
      value : value
    }
  }
}));

// Passport config
require('./config/passport')(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
})

// Set Index route
app.get('/', (req, res) => {
  Article.find({}, (err, articles) => {
    if(err) {
      return console.log(err);
    }
    res.render('index', {
      title: 'Articles',
      articles: articles,
    });
  });
});

// Route Files
var articles = require('./routes/articles');
var users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

app.listen(3000, () => {
  console.log('Server up on port 3000');
});
