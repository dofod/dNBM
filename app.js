/**
 * Created by Saurabh on 24/06/2015.
 */

zmq = require('zmq');

function Peer(ip){
    this.ip = ip;
    console.log(ip)
    this.socket = zmq.socket('req');
    this.socket.connect(ip);
    console.log('Connected to '+ip);
    this.onMessageRecieved = function(data){
        console.log('Peer recieved '+data.toString());
        //this.socket.send(data)
    }.bind(this);
    this.socket.on('message', this.onMessageRecieved);
    this.message = function(message){
        this.socket.send(message);
    }.bind(this);
}

var Application = function(ip){
    this.ip = ip;
    this.db = {};
    this.socket = zmq.socket('rep');
    this.socket.bind(ip, function(err) {
        if (err) throw err;
    });
    console.log('Application Bound to '+ip);
    this.onMessageRecieved = function(data){
        console.log('Application recieved '+data.toString());
        message = JSON.parse(data.toString());
        if(message.type == 'CONNECT'){
            if(message.repeat==true){
                message.repeat = false;
                for(var key in this.db){
                    if(this.db.hasOwnProperty(key)){
                        this.db[key].message(message);
                    }
                }
            }
            this.db[message.ip] = new Peer(message.ip);
            console.log('PEER_ADDED '+JSON.stringify(this.db[message.ip]));
            this.socket.send(JSON.stringify({status:'PEER_ADDED'}));
        }

    }.bind(this);
    this.socket.on('message', this.onMessageRecieved);
};

var app = new Application('tcp://*:9001');
if(process.argv.slice(2).length!=0){
    var ip = process.argv.slice(2)[0];
    var peer = new Peer(ip);
    peer.message(JSON.stringify({
        type:'CONNECT',
        ip:'tcp://192.168.1.100:9001',
        repeat:true
    }));
}

