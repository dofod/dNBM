/**
 * Created by Saurabh on 27/06/2015.
 */
var request = require('request');
var cheerio = require('cheerio');

var host = 'localhost';
var port = '8888';
var username = 'user';
var password = 'user';
/*
request(
    {
        url: url,
        headers : {
            //"Authorization" : auth,
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
        }
    }, function(error, response, html) {
    if (!error) {
        console.log(url);
        console.log(html);
        var $ = cheerio.load(html);
        console.log($('table[class=xferstable]').html());
    }
    else{
        console.log('Error loading page '+url);
    }
});
    */

var digest = require('http-digest-client').createDigestClient(username, password, false);
digest.request({
    host: host,
    path: '/transfers',
    port: port,
    method: 'GET'
}, function (res) {
    res.on('data', function (data) {
        var $ = cheerio.load(data.toString());
        $('.xferstable tr').each(function(day) {
            $(this).find('td').each(function() {
                console.log($(this).text());
            });
        });
    });
    res.on('error', function (err) {
        console.log('Error loading page '+url);
    });
});