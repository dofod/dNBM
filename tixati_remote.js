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

    this.startTransfer = function(){
        var postData = querystring.stringify({
            start:'start'
        });
        self.connection.request({
                path: self.transfers[0]+'/action',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                },
                postData:postData
            },
            function(res){
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    console.log('Response: ' + chunk);
                });

            });
        /*self.connection.on('end', function() {
            console.log('end');
        });*/
        //self.connection.write(postData);
        //self.connection.end();
    };

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
            self.startTransfer();
        });
        res.on('error', function (err) {
            console.log('Error loading');
        });
    });
}