var thrift = require('thrift');
var Hotel = require('./hotel_types').Hotel;

module.exports = {
  init: function() {
  },
  encode: function(obj) {
    var transport = new thrift.TBufferedTransport();
    var protocol = new thrift.TCompactProtocol(transport);
    var User = new Hotel(obj);
    User.write(protocol);
    var outBuffers = transport.outBuffers;
    var outCount = transport.outCount;
    var result = new Buffer(outCount);
    var pos = 0;
    outBuffers.forEach(function(buf) {
      buf.copy(result, pos, 0);
      pos += buf.length;
    });
    return result;
  },
  decode: function(data) {
    var transport = new thrift.TBufferedTransport();
    var protocol = new thrift.TCompactProtocol(transport);
    data.copy(transport.inBuf, transport.writeCursor, 0);
    transport.writeCursor += data.length;
    var User = new Hotel();
    User.read(protocol);
    return User;
  },
};
