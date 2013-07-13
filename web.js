var fs = require('fs');
var express = require('express');

var responseWriter = function(httpResponse, bufferData){
			var data = bufferData.toString('utf-8');
			httpResponse.send(data);
		     }

var app = express.createServer(express.logger());



app.get('/', function(request, response) {
	var result = 'abiti';
	fs.readFile('index.html',function (err, data) {
				        if (err) throw err;
				        responseWriter(response, data);
				        }
	);
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
