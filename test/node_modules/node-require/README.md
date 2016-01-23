# node-require
An Express addin to export node modules to the client and a supporting CommonJS browser require.

[![Codacy Badge](https://api.codacy.com/project/badge/grade/8f017fdeac66463d98900b4df4fc4de7)](https://www.codacy.com/app/syblackwell/node-require)
[![Code Climate](https://codeclimate.com/github/anywhichway/node-require/badges/gpa.svg)](https://codeclimate.com/github/anywhichway/node-require)

# Install

npm install node-require

# Basic Use

In your Node Express app include the following code:

```
var noderequire = require('node-require');

// replace <package name>, ... with all package names you would like to export to the client
// <options> is an object, currently the only supported property is min:true
// if options.min===true, then a minified version of the package will be loaded if available
noderequire.export(app,__dirname,["<package name>",...][,<options>);

```

Add this line to the top of an HTML file into which you wish to load node modules on the client:

```
<script src="node-require"></script>
```

You can then require any of the modules you have exported using normal require syntax along with other Javascript code, e.g.

```
<script>
var pkgexport = require('<package name>'); // loads a package, the internals assume anything without a .js extension

for(var key in pkgexport) {
	console.log(pkgexport[key]);
};
</script>

```

For modules designed to create new global objects/constructors, i.e. those packaged with *browserify*, you can also load any exported modules using the script src attribute, e.g.

```
<script src='MyClass'></script>

<script>
for(var key in MyClass) {
	console.log(MyClass[key]);
};
</script>
```

# Advanced Use

If you add the key *client* to a modules *package.json* file, *node-modules* will use that path to find the file to deliver to the browser. In the case of isomorphic code, this could simply be a bundle created using *browserify*. In the case of non-isomorphic code, this could be the client code required to interact with the services provided by the module on the server. *node-modules* itself is the second type of code base.

# Internals

By convention modules do not have *.js* extensions. *node-require* uses this convention for handling requests. Anything without a *.js* extension is assumed to be a node module and the exports array provided in the *app.js* file is examined. If there is no match, the next Express route is called. If there is a match the module package file is used to resolve to a file name, specified by either *package.main* or *package.client*. If *node-require* is configured to load a minified file, the file name is adjusted to be \<file name\>.min.js and an attempt to send the file if made. If this fails, an attempt is made with an un-modified file name. If this fails, the next route is called with the error causing the failure.

# Philosophy

*node-require* was developed as an easy way to ensure that you are running the same version of Javascript code on the client and the server without having to implement a build process or manual steps to copy files.

*node-require* could be extended to kick-off on demand build or file generation processes. For example to fool bots trying to analyze a site a seeded minify/uglify library could be used to regenerate the client side code differently for each request.

# Updates (reverse chronological order)

2016-01-20 v0.0.10 Corrected reference to client code in package.json. 

2016-01-20 v0.0.9 Updated README documentation. Swapped in *Smoothie require.js* in place of modified *require1k.js* due to conflicts with *browserified* bundles. *Smoothie require.js* is also far easier to trace through if ever needed. Made modifications to more cleanly load module files from */<script/>* tags and better handle missing files. Added the options object for server side configuration.

2016-01-18 v0.0.8 Updated README documentation. Eliminated conflict with browserify by changing key in package.json to be *client:* instead of *browser:*.

2015-12-19 v0.0.7 Add client side console logging for errors

2015-12-19 v0.0.6 Now sends 404 Not Found if package is not exported

2015-12-13 v0.0.5 Codacy driven improvements

2015-11-29 v0.0.4 Initial public commit

# License

## Client Side Code - GNU

Copyright (C) 2013-2015 Flowy Apps GmbH <hello@flowyapps.com>

enhancements to support node-require
Copyright (c) 2016, Simon Y Blackwell, AnyWhichWay All rights reserved.

## Server Code - MIT