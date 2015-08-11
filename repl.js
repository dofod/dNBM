var readline = require('readline');
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}

var rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt('dNBM> ');
rl.prompt();

var sock = require('zmq').socket('req')
sock.connect('tcp://localhost:9001')

rl.on('line', function(line) {

    if (line === "exit") {
    	rl.close();
    }

    if (line.startsWith('tixati ')){
    	console.log('call tixati')
    	sock.send(JSON.stringify({type:'APP', payload:'Hello Plugin', app:'plugin1.js', target:'tcp://192.168.1.11:9003'}))
    }


    rl.prompt();
}).on('close',function(){
    process.exit(0);
});