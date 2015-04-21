var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var Link = require('./link');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function() {

    this.on('creating', function(model, attrs, options){
      //async doesn' doesn't work :(
      // bcrypt.genSalt(5, function(err, result){
      //   model.set('salt',result);
      //   bcrypt.hash(model.get('password'), result, function(){}, function(err, hash){
      //     model.set('password', hash);
      //   });
      // });
      //
      var salt = bcrypt.genSaltSync(5);
      var hash = bcrypt.hashSync(model.get('password'), salt);
      model.set('password', hash)
      model.set('salt', salt);
    });
  }, check: function(inputPass) {
    var salt = this.get('salt');
    var hash = bcrypt.hashSync(inputPass, salt);
    console.log("SALT --> " + salt);
    console.log("HAS --> " + hash);
    console.log("PASS HASH --> " + this.get('password'));
    return (hash === this.get('password'));
    //return bcrypt.compareSync(hash, this.get('password'));

  }, links: function() {
    return this.hasMany(Link);
  }

});



module.exports = User;







// var db = require('../config');
// var Click = require('./click');
// var crypto = require('crypto');

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   clicks: function() {
//     return this.hasMany(Click);
//   },
//   initialize: function(){
//     this.on('creating', function(model, attrs, options){
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

