/**
 * Created by Saurabh on 27/06/2015.
 */
request = require('request');
request.post(
    'http://localhost:8888/transfers/45a3b934783a7dcc/details/action',
    { form: { start: 'start' } },
    function (error, response, body) {
        console.log(response);
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
);