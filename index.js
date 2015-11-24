var http = require('http');
var util = require('util');
var faye = require('faye');
var uuid = require('/javascript/uuid.js');

var bayeux = new faye.NodeAdapter({mount: '/joqular', timeout: 45});
var channelId = uuid.v4();


var server = http.createServer();
bayeux.attach(server);
bayeux.on('handshake', function(clientId) {
    console.log('Client connected', clientId);
});
bayeux.on('subscribe', function(clientId,channel) {
    if(channel!=="/joqular" && channel.indexOf("/joqular/")===0) {
    	console.log('Private channel', clientId,channel);
    }
});
bayeux.on('publish', function(clientId,channel,message) {
	var publication, result;
    if(message.source!=="server") {
        console.log("-->",channel, util.inspect(message,null,5));
    	publication = bayeux.getClient().publish(channel, {source:"server", _id:uuid.v4(), timestamp: (new Date()).toString(), data:{results: []}});
    	publication.then(function() { },function(err) { console.log(err); });
    }
});
server.listen(3000, function () {
	  var host = server.address().address;
	  var port = server.address().port;
	  console.log('Example app listening at http://%s:%s', host, port);
	});

 
