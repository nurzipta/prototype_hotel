var express = require('express')
var app = express()
var amqp = require('amqplib/callback_api');
var path = require('path');

// var amqpUrl = 'amqp://exvldeec:Bmy6Q-Nrnukol-Rz78bY6p6A4fPcUtTa@zebra.rmq.cloudamqp.com/exvldeec';
var amqpUrl = 'amqp://localhost';

var file_compressor = './compressor.js';

var codec = {};
codec.name = path.basename(file_compressor);
codec.impl = require(file_compressor);

app.get('/', function (req, res) {
  	var from = Date.now()
	param = {
		q: req.query.q
	}
	// publish
	// publish(amqpUrl, 'hotel_search__request', 'hotel_search__request', JSON.stringify(param))

	// consume
  	amqp.connect(amqpUrl, function(err, conn) {
		conn.createChannel(function(err, ch) {
			var msg = JSON.stringify(param)
			console.log(" [x] Sent %s", msg);
			ch.publish('hotel_search__request', 'hotel_search__request', new Buffer(msg));
			ch.consume('hotel_search__response', function(msg) {

				console.log("Consume ", param.q)

				msg = JSON.parse(msg.content);
				var result = [];

				if(msg.length > 0)
				{
					msg.forEach(function(v){
						v = new Buffer(v);
						result.push( codec.impl.decode(v) );
					})
				}

				conn.close();

				res.send(result)

				console.log(Date.now() - from + ' ms')

			}, {noAck: true});
		});

	});
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})

function publish(amqpUrl, ex, q, msg) {
	amqp.connect(amqpUrl, function(err, conn) {
		conn.createChannel(function(err, ch) {
			ch.assertExchange(ex, 'fanout', {durable: false});
			ch.publish(ex, q, new Buffer(msg));
			console.log(" [x] Sent %s", msg);
		});

		setTimeout(function() { conn.close(); }, 500);
	});
}