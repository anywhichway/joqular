//    node-require
//
//     Copyright (c) 2015, 2016 Simon Y. Blackwell, AnyWhichWay
//     MIT License - http://opensource.org/licenses/mit-license.php
(function() {
	var path = require('path');
	var fs = require('fs');
	function nexport(app,root,exports,options) {
		// expose a proxy for the node_modules directory
		app.get('/*', function(req, res, next){
			var file = path.basename(req.url);
			// only process requests for packages that have been exported
			if(exports.indexOf(file)>=0) {
				file = (file.indexOf(".js")===-1 ? "/node_modules/" : "") + file;
				var filepath = path.join(root, file);
				var packagepath = path.join(filepath,"package.json");
				fs.readFile(packagepath, 'utf8', function(err,data) { // read package and send main file
					var pkg = JSON.parse(data);
					// use the .client file if specified; otherwise use .main
					var filename = (pkg.client ? pkg.client : pkg.main);
					file = path.resolve(filepath,(filename.lastIndexOf(".js")===filename.length-3 ? filename : filename + ".js"));
					if(options && options.min) {
						// try to send minified version
						res.sendFile(file.replace(".js",".min.js"),null,function(err) {
							// if no minified version, send the regular version
							if(err) {
								if(err.code==="ENOENT") {
									res.sendFile(file,null,function(err) {
										if(err) {
											next(err);
										}
									});
								} else {
									next(err);
								}
							} 
						});
					} else {
						res.sendFile(file,null,function(err) {
							if(err) {
								next(err);
							}
						});
					}
				});
			} else {
				next();
			}
		});
	}
	module.exports.export = nexport;
}).call(this);