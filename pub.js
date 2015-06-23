zmq = require('zmq');

var socket = zmq.socket('pub');

socket.bind('tcp://127.0.0.1:9001', function(err) {
  if (err) throw err;
  console.log('bound!');  
  setInterval(function() {
    socket.send('data');
  }, 100);
});