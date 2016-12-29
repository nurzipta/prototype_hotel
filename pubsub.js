var context = require('rabbit.js').createContext();
context.on('ready', function() {
  var pub = context.socket('PUB', {routing: 'topic'});
  var sub = context.socket('SUB', {routing: 'topic'});
  sub.pipe(process.stdout);
  sub.connect('topic', 'user.*', function() {
    pub.connect('topic', function() {
      pub.publish('user.create', JSON.stringify({username: "Fiver"}));
    });
  });
});
