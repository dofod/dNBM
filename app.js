/**
 * Created by Saurabh on 24/06/2015.
 */

var zmq = require('zmq');
var axon = require('axon');
var localIP = require('ip');
var APP_PORT = '9001';
function Peer(ip){
    var self = this;

    this.ip = ip;
    this.socket = zmq.socket('req');
    this.socket.connect(ip);
    console.log('Connected to '+ip);

    this.onMessageRecieved = function(data){
        console.log('Peer '+self.ip+' recieved '+data.toString());
        var message = JSON.parse(data.toString());
        if(message.type == 'PEER_ADDED'){
            self.message(JSON.stringify({
                type:'GET_PEER_LIST',
                ip:self.ip
            }));
        }
        //self.message(JSON.stringify({STATUS:'OK'}))
    };
    this.socket.on('message', this.onMessageRecieved);

    this.message = function(message){
        self.socket.send(message);
        console.log('Peer '+self.ip+' sent '+message);
    };
}

function Application(ip){
    self = this;
    this.ip = ip;
    this.db = {};
    this.socket = zmq.socket('rep');
    this.socket.bind(self.ip, function(err) {
        if (err) throw err;
    });
    console.log('Application Bound to '+ip);

    this.onMessageRecieved = function(data){
        console.log('Application '+self.ip+' recieved '+data.toString());
        var message = JSON.parse(data.toString());
        if(message.type == 'CONNECT'){
            self.db[message.ip] =  new Peer(message.ip);
            console.log('PEER_ADDED '+JSON.stringify(self.db[message.ip]));
            self.db[message.ip].message(JSON.stringify({
                type:'STATUS',
                status:'PEER_ADDED'
            }));
        }
        if(message.type == 'GET_PEER_LIST'){
            var peerList = [];
            for (var key in self.db) {
                if (self.db.hasOwnProperty(key)) {
                    peerList.push(key);
                }
            }
            self.db[message.ip].message(JSON.stringify({
                type:'PEER_LIST',
                peerList:peerList
            }));
        }
        if(message.type == 'PEER_LIST'){
            for(var ip in message.peerList){
                if(!self.db.hasOwnProperty(ip)){
                    self.db[ip] = new Peer(ip);
                    self.db[ip].message(JSON.stringify({
                        type:'CONNECT',
                        ip:'tcp://'+localIP.address()+':'+APP_PORT
                    }));
                }
            }
        }
        if(message.type == 'STATUS'){
            if(message.status == 'PEER_ADDED'){
                for (var key in self.db) {
                    if (self.db.hasOwnProperty(key)) {
                        self.db[key].message(JSON.stringify({type:'GET_PEER_LIST'}));
                    }
                }
            }
        }
        console.log('Connected To:<---------');
        for(var key in self.db){
            if(self.db.hasOwnProperty(key)){
                console.log(key);
            }
        }
        console.log('--------->');

    };
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
