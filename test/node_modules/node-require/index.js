//    node-require
//
//     Copyright (c) 2015 Simon Y. Blackwell, AnyWhichWay
//     MIT License - http://opensource.org/licenses/mit-license.php
(function() {
	var path = require('path');
	var fs = require('fs');
	function nexport(app,root,exports) {
		app.get('/node_modules/*', function(req, res){
			var file = path.basename(req.url);
			console.log(file)
			if(exports.indexOf(file)>=0) {
				var filepath = path.join(root, req.url);
				var packagepath = path.join(filepath,"package.json");
				fs.readFile(packagepath, 'utf8', function(err,data) { // read package and send main file
					var pkg = JSON.parse(data);
					var filename = (pkg.browser ? pkg.browser : pkg.main);
					var file = path.resolve(filepath,(filename.lastIndexOf(".js")===filename.length-3 ? filename : filename + ".js"));
					res.sendFile(file);
				});
			} else {
				res.status(404).send('Not found');
			}
		});
	}
	module.exports.export = nexport;
}).call(this);