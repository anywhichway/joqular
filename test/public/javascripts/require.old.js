/*jshint node:false, -W082, -W017 */
/* BSD License
 RedistRedistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright
  notice, this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright
  notice, this list of conditions and the following disclaimer in the
  documentation and/or other materials provided with the distribution.

* Neither the name of require1k nor the
  names of its contributors may be used to endorse or promote products
  derived from this software without specific prior written permission.
  
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL STUART KNIGHTLEY BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

require1k.js on which this code is based:
Copyright (c) 2013, Stuart Knightley All rights reserved.

additions & enhancements to support node-require, relative paths, and eliminate eval
Copyright (c) 2015, Simon Y Blackwell, AnyWhichWay All rights reserved.

*/

R = (function (document, undefined) {
    // Each module has the following properties (shorted to one letter to aid compression)
    // - g: booleany, loadinG, truthy if this module has been requested for loading
    //      before. Used to prevent the same module being loaded twice
    // - l: string, Location, the url location of this module
    // - t: string, Text, the text content of the module
    // - e: booleany, Error, truthy if there was an error (probably a 404) loading the module
    // - n: module object, Next, instead of using this module, use the object
    //      pointed to by this property. Used for dependencies in other packages
    // - f: function, Factory, a function to use instead of eval'ing module.t
    // - exports, object, the exports of the module!
    var MODULES = {};

    // this variable is reused for a number of things to reduce the repetition
    // of strings. In the end is becomes "exports"
    var tmp = "createElement",
        baseElement = document[tmp]("base"),
        relativeElement = document[tmp]("a");
    document.head.appendChild(baseElement);


    // Loads the given module and all of it dependencies, recursively
    // - module         The module object
    // - callback       Called when everything has been loaded
    // - parentLocation Location of the parent directory to look in. Only given
    // for non-relative dependencies
    // - id             The name of the dependency. Only used for non-relative
    // dependencies
    function deepLoad(module, callback, parentLocation, id) {
        // If this module is already loading then don't proceed.
        // This is a bug.
        // If a module is requested but not loaded then the module isn't ready,
        // but we callback as if it is. Oh well, 1k!
        if (module.g) {
            return callback(module.e, module);
        }
        module.isClient = true;
        var location = module.g = module.l;

        var request = new XMLHttpRequest();
        request.onload = function (deps, count) {
            if (request.status == 200 || module.t) {
                // Should really use an object and then Object.keys to avoid
                // duplicate dependencies. But that costs bytes.
                deps = [];
                (module.t = module.t || request.response).replace(/(?:^|[^\w\$_.])require\s*\(\s*["']([^"']*)["']\s*\)/g, function (_, id) {
                    deps.push(id);
                });
                count = deps.length;
                function loaded() {
                    // We call loaded straight away below in case there
                    // are no dependencies. Putting this check first
                    // and the decrement after saves us an `if` for that
                    // special case
                    count-- || callback(undefined, module);
                }
                deps.map(function (dep) {
                    deepLoad(
                        resolveModuleOrGetExports(module.l, dep),
                        loaded,
                        // If it doesn't begin with a ".", then we're searching
                        // node_modules, so pass in the info to make this
                        // possible
                        dep[0] != "." ? location + "/../" : undefined,
                        dep
                    );
                });
                loaded();
            } else {
                // parentLocation is only given if we're searching in node_modules
                if (parentLocation) {
                    // Recurse up the tree trying to find the dependency
                    // (generating 404s on the way)
                    deepLoad(
                        module.n = resolveModuleOrGetExports(parentLocation += "../",  id),
                        callback,
                        parentLocation,
                        id
                    );
                } else {
                    module.e = request;
                    callback(request, module);
                }
            }
        };

        // If the module already has text because we're using a factory
        // function, then there's no need to load the file!
        if (module.t) {
            request.onload();
        } else {
            request.open("GET", location, true);
            request.send();
        }
    }

    // Save bytes by combining two functions
    // - resolveModule which resolves a given relative path against the given
    //   base, and returns an existing or new module object
    // - getExports which returns the existing exports or runs the factory to
    //   create the exports for a module
    function resolveModuleOrGetExports(baseOrModule, relative, resolved) {
        // This should really be after the relative check, but because we are
        // `throw`ing, it messes up the optimizations. If we are being called
        // as resolveModule then the string `base` won't have the `e` property,
        // so we're fine.
        if (baseOrModule.e) {
            throw baseOrModule.e;
        }

        // If 2 arguments are given, then we are resolving modules...
        if (relative) {
            baseElement.href = baseOrModule;
            // modified by AnyWhichWay to support relative paths Nov 2016
            if(relative.indexOf("..")===0) { // handle simple relative paths
            	var baseparts = baseOrModule.split("/"), relativeparts = relative.split("/");
            	baseparts.pop();
            	relativeparts.every(function(part) {
            		if(part=="..") {
            			baseparts.pop();
            			relativeparts.shift();
            			return true;
            		}
            	});
            	for(var i=baseparts.length-1;i>=0;i--) {
            		relativeparts.unshift(baseparts[i]);
            	}
            	relativeElement.href = relativeparts.join("/");
            	
            } else if(relative[0]==".") { // handle same directory
            	relativeElement.href = relative;
            }
            if(relative[0]==".") { // .. or .
            	resolved = (relativeElement.href.lastIndexOf(".js")===relativeElement.href.length-3 ? relativeElement.href : relativeElement.href + ".js");
            } else {
            	// modified by AnyWhichWay Nov 2015 to support node-export
            	// relativeElement.href = "./node_modules/" + relative;
            	resolved = relativeElement.href = "/node_modules/" + relative;
            	// If the relative url doesn't begin with a ".", then it's
                // in node_modules
                // relativeElement.href = relative[0] != "." ? "./node_modules/" + relative : relative;
            }
            baseElement.href = "";
            return (MODULES[resolved] = MODULES[resolved] || {l: resolved});
        }

        // ...otherwise we are getting the exports

        // Is this module is a redirect to another one?
        if (baseOrModule.n) {
            return resolveModuleOrGetExports(baseOrModule.n);
        }

        baseOrModule[tmp] ||
        	//globalEval("(function(require,"+tmp+",module){" + baseOrModule.t + "\n})//# sourceURL=" + baseOrModule.l)
        	// modified by AnyWhichWay Nov 2015 to eliminate eval
            (baseOrModule.f || new Function("return (function(require,"+tmp+",module){" + baseOrModule.t + "\n})//# sourceURL=" + baseOrModule.l)())(
                function require (id) {
                    return resolveModuleOrGetExports(resolveModuleOrGetExports(baseOrModule.l, id));
                }, // require
                baseOrModule[tmp] = {}, // exports
                baseOrModule // module
            );

        return baseOrModule[tmp];
    }

    function R(id, callback) {
        // If id has a `call` property it is a function, so make a module with
        // a factory
        deepLoad(id.call ? {l: "", t: "" + id, f: id} : resolveModuleOrGetExports("", id), function (err, module) {
            try {
                id = resolveModuleOrGetExports(module);
            } catch (_err) {
                err = _err
            }
            !callback || callback(err, id);
        });
    }

    var main = document.querySelector("script[data-main]");
    !main || R(main.dataset.main);
    tmp = "exports";

    return R;

}(document));
