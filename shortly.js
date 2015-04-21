var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var app = express();

var sha256 = require('sha256');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(cookieParser('test'));
app.use(session());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.get('/',
function(req, res) {
  if(req.session.username){
    res.render('index');
  }else{
    res.render('login');
  }
});

app.get('/create',
function(req, res) {
  res.render('index');
});

app.get('/links',
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.get('/login',
function(req, res) {
  res.render('login');
});

app.post('/login',
function(req, res) {
  //handle that shit
  var username = req.body.username;
  var password = req.body.password;
  // regen the hash with salt

  //TODO
  // Users.reset().fetch().then(function(users) {
  //   users.forEach(function(user){console.log(user.attributes)});
  // });
  //
  new User({ username: username }).fetch().then(function(found) {
    console.log("*********************** > " + found);
    if (found) {
      var tempUser = new User(found.attributes);
      console.log(tempUser.check(password))
      if(tempUser.check(password)){

        req.session.regenerate(function(){
          req.session.username = username;
           console.log("******** > session USERNAME --> " + req.session.username);
            res.redirect('index');
        });




        }
      }
     else {
      console.log('login fail');

    }
  });

});

app.get('/signup',
function(req, res) {
  res.render('signup');


});

app.post('/signup',
function(req, res) {

  //handle that shit
  var username = req.body.username;

  new User({ username: username }).fetch().then(function(found) {
    if (found) {
      // res.send(200, found.attributes);
    } else {
      var user = new User({
        username: req.body.username,
        password: req.body.password
      });


      user.save().then(function(newUser) {
      Users.add(newUser);
      //res.send(200, newLink);
      //
  Users.reset().fetch().then(function(users) {
    users.forEach(function(user){console.log(user.attributes)});
  });
      });

    }
  });

});


/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
