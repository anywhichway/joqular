var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var util = require('util');
var http = require('http');
var Proxy = require('chrome-proxy');
require('proxy-observe');
var JSON = require('./public/javascripts/json5-ex.js');
var generic = require('js-generics');
var Validator = require('jovial');
var NOM = require('nested-object-model');
require('./public/javascripts/es6-promise.min.js');
require('./public/javascripts/es6-collections.min.js');
require('joex');
Array = Array.extend();
Set = Set.extend();
Boolean = Boolean.extend();
Number = Number.extend();
String = String.extend();
Date = Date.extend();
var Time = require('about-time').Time;
var Duration = require('about-time').Duration;
var TimeSpan = require('about-time').TimeSpan;
var noderequire = require('node-require');
var uuid = require('node-uuid');
var faye = require('faye');
var routes = require('./routes/index');
var users = require('./routes/users');


var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/*faye.Logging.logLevel = 'debug';
faye.logger = function(msg) {
    console.log(msg)
} */

var LocalStorage = require('node-localstorage').LocalStorage;
var JOQULAR = require('./public/javascripts/joqular.js');
var db = JOQULAR.db("Test",{storage:new JOQULAR.Storage(new LocalStorage(path.join(__dirname, 'public/clientserver.db'),100 * 1024 *1024))});
function Entity(config) {
	for(var key in config) {
		this[key] = config[key];
	}
}
Entity = new JOQULAR.Entity(Entity,"Entity");
var EntityValidator = new Validator({testId:{required:true,type:"number"}});
var testobjects = db.collection("Entity"); // ,{schema:EntityValidator}
testobjects.stream(false);

function revive(data) {
	if(data instanceof Object  && data._id) {
		var instance, idparts = data._id.split("@");
		var kind = idparts[0];
		var ctor = eval("(typeof(" + kind + ")==='function' && " + kind + ".revive ? " + kind + " : undefined)");
		if(ctor) {
			instance = ctor.revive(data);
		} else {
			instance = {};
			var keys = Object.keys(data);
			keys.forEach(function(key) {
				instance[key] = revive(data[key]);
			});
		}
		instance._id = data._id;
		return instance;
	}
	return data;
}
var joqular = new faye.NodeAdapter({mount: '/joqular', timeout: 45});
var channelId = uuid.v4();
joqular.on('handshake', function(clientId) {
	console.log('Client connected', clientId);
});
joqular.on('subscribe', function(clientId,channel) {
	if(channel!=="/joqular" && channel.indexOf("/joqular/")===0) {
		console.log('Subscribed', clientId,channel);
	}
});
joqular.on('publish', function(clientId,channel,message) {
	var publication, result;
	if(message.source!=="server") {
		console.log("-->",channel, util.inspect(revive(JSON.parse(message)),null,5));
		var e = new Entity();
		e.setData(JSON.parse(message));
		var save = testobjects.save();
		// don't wait to respond
		publication = joqular.getClient().publish(channel, {source:"server", _id:uuid.v4(), timestamp: (new Date()).toString(), data:{results: [message]}});
		publication.then(function() { },function(err) { console.log(err); });
		save.then(function(err) {
			if(err) {
				console.log(err);
			}
			// add telling client there was an issue saving
		});
	}
});
app.use(function(req, res, next) {
  joqular.attach(req.socket.server);
  next();
});

noderequire.export(app,__dirname,["node-require","about-time","chrome-proxy","js-generics","proxy-observe","nested-object-model","jovial","joex","node-uuid","sessionstorage"],{min:true});
//app.use('/', routes);
app.use('/users', users);
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

