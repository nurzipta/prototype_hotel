#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
// var urlAMQP = 'amqp://exvldeec:Bmy6Q-Nrnukol-Rz78bY6p6A4fPcUtTa@zebra.rmq.cloudamqp.com/exvldeec';
var urlAMQP = 'amqp://localhost';

amqp.connect(urlAMQP, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = 'hotel_search__request';
    var q = 'hotel_search__request';
    var msg = JSON.stringify({q: "Bandung", night: 1, date: "2017-01-27"});

    ch.assertExchange(ex, 'fanout', {durable: false});
    ch.publish(ex, q, new Buffer(msg));
    console.log(" [x] Sent %s", msg);
  });

  setTimeout(function() { conn.close(); process.exit(0) }, 500);
});