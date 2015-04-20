var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function() {

    this.on('creating', function(model, attrs, options){
      bcrypt.genSalt(5, function(err, result){
        model.set('salt',result);
        bcrypt.hash(model.get('password'), result, function(){}, function(err, hash){
          model.set('password', hash);
        });
      });
    });
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

