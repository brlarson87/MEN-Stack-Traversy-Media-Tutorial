const express = require('express');
const router = express.Router();

//Bring in Article model
var Article = require('../models/article');
// User Model
var User = require('../models/user');


// Set Add article page
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_article', {
    title: 'Add Article'
  });
});

// Add Post request for add_article form
router.post('/add', (req, res) => {
  req.checkBody('title', 'Title is required').notEmpty();
  // req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  // get the errors
  var errors = req.validationErrors();

  if(errors) {
    res.render('add_article', {
      title: 'Add Article',
      errors: errors
    });
  } else {
      var article = new Article();
      article.title = req.body.title;
      article.author = req.user._id;
      article.body = req.body.body;

      article.save((err) => {
        if(err) {
          console.log(err);
          return;
        } else {
          req.flash('success', 'Article Added');
          res.redirect('/');
        }
      });
  }
});
// Load edit form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if(article.author != req.user._id) {
      req.flash('danger', 'Not authorized');
      res.redirect('/');
    } else {
      res.render('edit_article', {
        title: 'Edit Article',
        article: article
      });
    }
  });
});
//Update submit
router.post('/edit/:id', (req, res) => {
  var article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  var query = {_id: req.params.id};

  Article.update(query, article, (err) => {
    if(err) {
      console.log(err);
      return;
    } else {
      req.flash('success', 'Article Updated');
      res.redirect('/');
    }
  });
});
// Delete article route
router.delete('/:id', (req, res) => {
  if(!req.user._id) {
    res.status(500).send();
  }

  Article.findById(req.params.id, (err, article) => {
    if(article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.remove({_id: req.params.id}, (err) => {
        if(err) {
          console.log(err);
        }
        res.send('Success');
        });
      }
    });
  });


//Get single article
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render('article', {
        article: article,
        author: user.name
      });
    });
  });
});

// Access control
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
