#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var request = require('request');
var path = require('path');
// var amqpUrl = 'amqp://exvldeec:Bmy6Q-Nrnukol-Rz78bY6p6A4fPcUtTa@zebra.rmq.cloudamqp.com/exvldeec';
var amqpUrl = 'amqp://localhost';
var urlAPI = 'http://api.devel.tiket.com/search/hotel';

var file_compressor = './compressor.js';

var codec = {};
codec.name = path.basename(file_compressor);
codec.impl = require(file_compressor);

var param = {
	startdate	: '2017-01-27',
	enddate		: '2017-01-28',
	night		: 1, 
	room		: 1, 
	adult		: 2, 
	child		: 0, 
	output		: 'json', 
	token		: ''
	// token		: ''
};

amqp.connect(amqpUrl, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = 'hotel_search__request';
    var q_name = 'hotel_search__request';

    // ch.assertExchange(ex, 'fanout', {durable: true});

    // ch.assertQueue(q_name, {exclusive: true}, function(err, q) {
    //   console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
      // ch.bindQueue(q.queue, ex, q_name);

      // ch.consume(q.queue, function(msg){
      ch.consume(q_name, function(msg){
      	var queue = JSON.parse(msg.content);
		var label_req = "Request : ";

		console.log(label_req, queue.q)
	    // logTime('Consume ', from);

		if(queue.q !== '')
		{
		    param.q = queue.q;
	        var from = Date.now();
			request({
			    url: urlAPI,
			    qs: param,
			    method: 'GET',
			    headers: {}
			}, function(error, response, body){
			    body = JSON.parse(body);
			    if(error) {
			        console.log(error);
			    } else {

			    	logTime('End API Call', from);
			    	
			    	conn.createChannel(function(err, ch) {
					    var ex = 'hotel_search__response';
					    var q = 'hotel_search__response';
					    
					    // ch.assertExchange(ex, 'fanout', {durable: true});

					    var res = body.results.result;
					    var encodedData = [];

					    if(res.length > 0)
					    {
					    	from = Date.now();
					    	res.forEach(function(v){
					    		// console.log(v)
					    		var encoded = codec.impl.encode(v);
					    		encodedData.push( encoded );

					    		// console.log(codec.impl.decode(encoded))
					    	})
					    	logTime('Encoded ', from);
					    }

					    // console.log(encodedData)

					    from = Date.now();
					    ch.publish(ex, q, new Buffer(JSON.stringify(encodedData)));
					    logTime('Publish', from);

				  	});
			    }
			});
		}
      }, {noAck: true});
    // });
  });
});

function callback_consume(msg)
{
	console.log(msg)
	return false;
	var queue = JSON.parse(msg.content);
	var label_req = "Request : ";

	var from = Date.now();
	console.log(label_req, queue.q)

	if(queue.q !== '')
	{
	    param.q = queue.q;

		request({
		    url: urlAPI,
		    qs: param,
		    method: 'GET',
		    headers: {}
		}, function(error, response, body){
		    if(error) {
		        console.log(error);
		    } else {
		    	logTime('req', from);
	  			// publish_response(body, from);
	  			publish_response(queue.q, from);
		    }
		});
	}
}

function publish_response(msg, from)
{
	amqp.connect(amqpUrl, function(err, conn) {
	  conn.createChannel(function(err, ch) {
	    var ex = 'hotel_search__response';
	    var q = 'hotel_search__response';
	    
	    ch.assertExchange(ex, 'fanout', {durable: false});
	    ch.publish(ex, q, new Buffer(msg));

	    console.log(" [x] Sent Result");
	    logTime('pub', from);
	  });

	  setTimeout(function() { conn.close(); }, 1000);
	});
}

function logTime(act, from)
{
	console.log("Time "+ act +": " , (Date.now() - from) + ' ms');
}