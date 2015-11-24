(function(exports) {
	/*
	 * Returns a function that is built to choose and dispatch the best matching handler based on arguments.
	 * Argument selectors can be primitive type names or functions that return a true for the argument passed
	 * at runtime.
	 * 
	 * generic()
	 * 	.method("number",function(value) { console.log(value, " is a number.");})
	 * 	.method(function(o) { return o instanceof Object; },function(value) { console.log(value," is an Object"); });
	 * 
	 */
	function generic(defaultFunction) {
		// define the dispatch function
		var method = function() {
			var me = this, possible = [];
			var args = Array.prototype.slice.call(arguments);
			method.handlers.forEach(function(handler) {
				// handler matches if all its arg types or type checkers match args passed in and arg count is correct
				var f = handler[handler.length-1];
				if(typeof(f)==="number") {
					count = f;
					f = handler[handler.length-2];
				} else {
					count = f.length;
				}
				if((count===generic.VARGS || args.length===count) && args.every(function(arg,i) {
					return arg===undefined || i>count || (i>0 && count===generic.VARGS) || (handler[i] instanceof Function ? (count===generic.VARGS ? handler[i].call(me,args) : handler[i].call(me,arg)) : handler[i]===generic.VTYPE || handler[i]===typeof(arg));
				})) {
					possible.push(f);
				}
			});
			var thehandler = (possible[possible.length-1] ? possible[possible.length-1] : defaultFunction);
			if(typeof(thehandler)==="function") { // won't be a function if no default was provided and no handlers matched
				//var args = [thehandler].concat(arguments);
				//return Function.apply(args);
				return thehandler.apply(me,arguments);
			}
			// no matching handler, no return value
		}
		// create storage for handlers
		method.handlers = [];
		// add handlers
		method.method = function() {
			var args = Array.prototype.slice.call(arguments);
			// don't add handlers twice
			if(!method.handlers.some(function(handler,i) {
				if(args.length===handler.length) {
					if(args.every(function(arg,j) {
						return handler[j]===arg;
					})) {
						return handlers[i] = arguments;
					}
				}
			})) {
				var count, f = args[args.length-1];
				if(typeof(f)==="number") {
					count = f;
					f = args[args.length-2];
				} else {
					count = f.length;
				}
				if(count===generic.VARGS || f.length===count) { // make sure the number of type checks is the same as the number of arguments expected by function
					method.handlers.push(args);
				}
			}
			return method;
		}
		return method;
	}
	generic.VARGS = Infinity;
	generic.VTYPE = undefined;
	exports.generic = generic;
})("undefined"!=typeof exports&&"undefined"!=typeof global?global:window);