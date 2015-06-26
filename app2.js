/**
 * Created by Saurabh on 24/06/2015.
 */

var zmq = require('zmq');
var localIP = require('ip');
var APP_PORT = '9003';
function Peer(ip){
    this.ip = ip;
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

function Application(ip){
    this.ip = ip;
    this.db = {};
    this.socket = zmq.socket('rep');
    this.socket.bind(ip, function(err) {
        if (err) throw err;
    });
    console.log('Application Bound to '+ip);

    this.onMessageRecieved = function(data){
        console.log('Application recieved '+data.toString());
        var message = JSON.parse(data.toString());
        if(message.type == 'CONNECT'){
            this.db[message.ip] =  new Peer(message.ip);
            console.log('PEER_ADDED '+JSON.stringify(this.db[message.ip]));
            this.db[message.ip].message(JSON.stringify({
                type:'STATUS',
                status:'PEER_ADDED'
            }));
        }
        if(message.type == 'GET_PEER_LIST'){
            var peerList = [];
            for (var key in this.db) {
                if (this.db.hasOwnProperty(key)) {
                    peerList.push(key);
                }
            }
            this.db[message.ip].message(JSON.stringify({
                type:'PEER_LIST',
                peerList:peerList
            }));
        }
        if(message.type == 'PEER_LIST'){
            for(var ip in message.peerList){
                if(!this.db.hasOwnProperty(ip)){
                    this.db[ip] = new Peer(ip);
                    this.db[ip].message(JSON.stringify({
                        type:'CONNECT',
                        ip:'tcp://'+localIP.address()+':'+APP_PORT
                    }));
                }
            }
        }
        if(message.type == 'STATUS'){
            if(message.status == 'PEER_ADDED'){
                for (var key in this.db) {
                    if (this.db.hasOwnProperty(key)) {
                        this.db[key].message(JSON.stringify({type:'GET_PEER_LIST'}));
                    }
                }
            }
        }
        console.log('Connected To:<---------');
        for(var key in this.db){
            if(this.db.hasOwnProperty(key)){
                console.log(key);
            }
        }
        console.log('--------->');

    }.bind(this);
    this.socket.on('message', this.onMessageRecieved);

    if(process.argv.slice(2).length!=0){
        var ip = process.argv.slice(2)[0];
        var peer = new Peer(ip);
        peer.message(JSON.stringify({
            type:'CONNECT',
            ip:'tcp://'+localIP.address()+':'+APP_PORT
        }));
        this.db[ip]=peer;
    }
};

var app = new Application('tcp://*:'+APP_PORT);
