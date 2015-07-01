/**
 * Created by Saurabh on 27/06/2015.
 */
var request = require('request');
var cheerio = require('cheerio');
var querystring = require('querystring');

remote = new TixatiRemote(
    '127.0.0.1',
    '8888',
    'user',
    'user'
);

function TixatiRemote(host, port, username, password){
    this.url = 'http://'+host+':'+port;
    this.connection = require('http-digest-client')(host, port, username, password, false);
    this.transfers = [];
    var self = this;
    this.printTransfers = function(){
        console.log(self.transfers);
    };

    this.startTransfer = function(path){
        var data = querystring.stringify({
            start:'start'
        });
        self.connection.request({
                path: path+'/action',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(data)
                },
                data:data
            },
            function(res){
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    //console.log('Response: ' + chunk);
                });
                res.on('end', function(){
                    console.log('end');
                });

            });
    };

    this.getTransfers = function(){
        this.connection.request({
                path: '/transfers',
                method: 'GET'
            },
            function (res) {
                res.setEncoding();
                var buffer="";
                res.on('data', function (data) {
                    buffer += data;
                });
                res.on('end', function(){
                    var $ = cheerio.load(buffer);
                    $('.xferstable tr td a').each(function() {
                        self.transfers.push($(this).attr('href'));
                    });
                    self.printTransfers();
                    self.startTransfer(self.transfers[1]);
                });
                res.on('error', function (err) {
                    console.log('Error loading');
                });
            }
        );
    };

}