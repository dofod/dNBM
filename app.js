/**
 * Created by Saurabh on 24/06/2015.
 */

var zmq = require('zmq');
var localIP = require('ip');
var APP_PORT = '9001';
var db = {};

function Peer(ip){
    var self = this;

    this.ip = ip;
    this.socket = zmq.socket('req');
    this.socket.connect(ip);
    console.log('Connected to '+ip);

    this.onMessageRecieved = function(data){
        console.log('Peer '+self.ip+' recieved '+data.toString());
        var message = JSON.parse(data.toString());
        if(message.type == 'STATUS'){
            if(message.status == 'PEER_ADDED'){
                for (var key in db) {
                    if (db.hasOwnProperty(key)) {
                        db[key].message(JSON.stringify({type:'GET_PEER_LIST'}));
                    }
                }
            }
        }
        if(message.type == 'PEER_LIST'){
            for(var i=0; i<message.peerList.length; i++){
                var ip = message.peerList[i];
                if(!db.hasOwnProperty(ip)){
                    db[ip] = new Peer(ip);
                    db[ip].message(JSON.stringify({
                        type:'CONNECT',
                        ip:'tcp://'+localIP.address()+':'+APP_PORT
                    }));
                }
            }
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
    this.socket = zmq.socket('rep');
    this.socket.bind(self.ip, function(err) {
        if (err) throw err;
    });
    console.log('Application Bound to '+ip);

    this.onMessageRecieved = function(data){
        console.log('Application '+self.ip+' recieved '+data.toString());
        var message = JSON.parse(data.toString());

        if(message.type == 'CONNECT'){
            db[message.ip] =  new Peer(message.ip);
            console.log('PEER_ADDED '+JSON.stringify(db[message.ip]));
            self.socket.send(JSON.stringify({
                type:'STATUS',
                status:'PEER_ADDED'
            }));
        }

        if(message.type == 'GET_PEER_LIST'){
            var peerList = [];
            for (var key in db) {
                if (db.hasOwnProperty(key)) {
                    peerList.push(key);
                }
            }
            self.socket.send(JSON.stringify({
                type:'PEER_LIST',
                peerList:peerList
            }));
        }

        if(message.type == 'APP'){
            if(message.app[0]!='.'&&message.app[1]!='/'){
                message.app = './'+message.app
            }
            var module = require(message.app);
            module(message.payload);
            
            if(!message.hasOwnProperty('repeat')||message.repeat==true){
                message['repeat'] = false;
                for (var key in db) {
                    if (db.hasOwnProperty(key) && key!='tcp://'+localIP.address()+':'+APP_PORT) {
                        db[key].message(JSON.stringify(message));
                    }
                }
            }
            
            self.socket.send(JSON.stringify({type:'STATUS', status:'OK'}))
        }

        console.log('Connected To:<---------');
        for(var key in db){
            if(db.hasOwnProperty(key)){
                console.log(key);
            }
        }
        console.log('--------->');

    };
    this.socket.on('message', this.onMessageRecieved);

    if(process.argv.slice(2).length!=0){
        var ip = process.argv.slice(2)[0];
        
    }
    else{
        var ip = 'tcp://'+localIP.address()+':'+APP_PORT
    }
    var peer = new Peer(ip);
    peer.message(JSON.stringify({
        type:'CONNECT',
        ip:'tcp://'+localIP.address()+':'+APP_PORT
    }));
    db[ip]=peer;
};

var app = new Application('tcp://*:'+APP_PORT);