zmq = require('zmq')

function Peer(ip) {
	this.connection = zmq.socket('sub')
  	this.connection.connect(ip)
  	this.connection.subscribe('')
  	this.connection.on('message', this.onMessageRecieved)
}

Peer.prototype.onMessageRecieved = function(data){

	console.log(connection.identity)
	console.log(data.toString())
}
var peer = new Peer('tcp://127.0.0.1:9001')