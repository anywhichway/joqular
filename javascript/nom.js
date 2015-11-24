(function(exports) {
	function NOMEvent(change,bubbles,cancelable,path) {
		path = (path ? path : "");
		Object.defineProperty(this,"change",{enumerable:true,value:change});
		Object.defineProperty(this,"bubbles",{enumerable:true,value:bubbles});
		Object.defineProperty(this,"cancelable",{enumerable:true,value:cancelable});
		Object.defineProperty(this,"path",{enumerable:true,value:path});
		this.prevent = false;
	}
	NOMEvent.prototype.preventDefault = function() {
		if(this.canceleable) {
			this.prevent = true;
		}
	}
	NOMEvent.prototype.stopImmediatePropagation = function() {
		this.stopImmediate = true;
	}
	NOMEvent.prototype.stopPropagation = function() {
		this.stop = true;
	}

	function NOMEnable(object,filter) {
		if(!object.__NOMhandlers__) {
			Object.defineProperty(object,"__NOMFilter__",{enumerable:false,configurable:false,writable:true,value:filter});
			Object.defineProperty(object,"__NOMhandlers__",{enumerable:false,configurable:false,writable:false,value:{}});
			Object.defineProperty(object,"__NOMcontainers__",{enumerable:false,configurable:true,writable:false,value:[]});
			Object.defineProperty(object,"addNOMEventListener",{enumerable:false,value:function(propertyOrEventName,eventNameOrHandler,handlerOrUndefined) {
				var me = this, hname, handler;
				if(arguments.length===2) {
					hname = "on"+propertyOrEventName;
					handler = eventNameOrHandler;
				} else {
					var hname = "on"+propertyOrEventName+eventNameOrHandler;
					handler = handlerOrUndefined;
				}
				if(!me.__NOMhandlers__[hname]) {
					me.__NOMhandlers__[hname] = function (ev) { return me.__NOMhandlers__[hname].handlers.every(function(handler) { handler(ev); return !ev.prevent; }); }
					me.__NOMhandlers__[hname].handlers = [];
				}
				if(me.__NOMhandlers__[hname].handlers.indexOf(handler)===-1) {
					me.__NOMhandlers__[hname].handlers.push(handler);
				}
			}});
			Object.defineProperty(object,"removeNOMEventListener",{enumerable:false,value:function(propertyOrEventName,eventNameOrHandler,handlerOrUndefined) {
				var me = this, hname, handler;
				if(arguments.length===2) {
					hname = "on"+propertyOrEventName;
					handler = eventNameOrHandler;
				} else {
					var hname = "on"+propertyOrEventName+eventNameOrHandler;
					handler = handlerOrUndefined;
				}
				if(handler.__NOMhandlers__[hname]) {
					var i = handler.__NOMhandlers__[hname].handlers.indexOf(handler);
					if(i>=0) {
						handler.__NOMhandlers__[hname].handlers.splice(i,1);
					}
				}
			}});
			Object.defineProperty(object,"NOMadd",{enumerable:false,value:function(change) {
				var me = this, value = change.object[change.name];
				//if(property==="__NOMcontainers__" || property.indexOf("_")===0) {
				//	return true;
				//}
				var ev = new NOMEvent(change,true,true);
				if(me.__NOMhandlers__.onadd) {
					me.__NOMhandlers__.onadd(ev);
				}
				if(value instanceof Object && !(value instanceof Function)) {
					//value = (value.__target__ ? value.__target__ : value);
					NOMEnable(value,filter);
					// should this also be put in observer?
					if(value.__NOMcontainers__.filter(function(item) { return item.property===change.name && item.object===me; }).length===0) {
						value.__NOMcontainers__.push({property:change.name,object:me});
					}
					if(!ev.prevent) {
						dispatch(value,ev);
					}
				} else if(!ev.prevent) {
					dispatch(me,ev);
				}
				return !ev.prevent;
			}});
			Object.defineProperty(object,"NOMupdate",{enumerable:false,value:function(change) {
				var me = this, value = change.object[change.name], oldvalue = change.oldValue;
				//if(property==="__NOMcontainers__" || property.indexOf("_")===0) {
				//	return true;
				//}
				var hname = "on"+change.name+"update";
				var ev = new NOMEvent(change,true,true);
				if(me.__NOMhandlers__[hname]) {
					if(me.__NOMhandlers__[hname](ev)) {
						delete me.__NOMhandlers__[hname];
					}
				}
				if(me.__NOMhandlers__.onupdate && !ev.prevent) {
					me.__NOMhandlers__.onupdate(ev);
				}
				if(oldvalue instanceof Object && !(oldvalue instanceof Function)) {
					var i;
					if(oldvalue.__NOMcontainers__.some(function(item,j) {
						if(item.property===change.name && item.object===me) {
							i = j;
							return true;
						}
						return false;
					})) {
						oldvalue.__NOMcontainers__.splice(i,1);
					}
				}
				if(value instanceof Object && !(value instanceof Function)) {
					//value = (value.__target__ ? value.__target__ : value);
					NOMenable(value,filter);
					// should this also be put in observer?
					if(value.__NOMcontainers__.filter(function(item) { return item.property===change.name && item.object===me; }).length===0) {
						value.__NOMcontainers__.push({property:change.name,object:me});
					}
					if(!ev.prevent) {
						dispatch(value,ev);
					}
				} else if(!ev.prevent) {
					dispatch(me,ev);
				}
				return !ev.prevent;
			}});
			Object.defineProperty(object,"NOMdelete",{enumerable:false,value:function(change) {
				var me = this, oldvalue = change.oldValue;
				var hname = "on"+change.name+"delete";
				var ev = new NOMEvent(change,true,true);
				if(me.__NOMhandlers__[hname]) {
					if(me.__NOMhandlers__[hname](ev)) {
						delete me.__NOMhandlers__[hname];
					}
				}
				if(me.__NOMhandlers__.ondelete && !ev.prevent) {
					me.__NOMhandlers__.ondelete(ev);
				}
				if(oldvalue instanceof Object && !(oldvalue instanceof Function)) {
					var i;
					if(oldvalue.__NOMcontainers__.some(function(item,j) {
						if(item.property===change.name && item.object===me) {
							i = j;
							return true;
						}
						return false;
					})) {
						oldvalue.__NOMcontainers__.splice(i,1);
					}
					if(!ev.prevent) {
						dispatch(value,ev);
					}
				} else if(!ev.prevent) {
					dispatch(me,ev);
				}
				return !ev.prevent;
			}});
			return NOMObserve(object);
		}
	}
	function observer(changeset) {
		changeset.forEach(function(change) {
			if(!change.object.__NOMfilter__ || change.object.__NOMfilter__(change.name)) {
				change.object["NOM"+change.type](change);
			}
		});
	}
	function NOMObserve(object) {
		return Object.observe(object,observer,["add","update","delete"]);
	}
	function NOMUnobserve(object) {
		return Object.unobserve(object,observer);
	}
	
	function dispatch(object,ev) {
		if(NOMTRACE) {
			console.log(ev);
		}
		if(object.__NOMcontainers__) {
			return object.__NOMcontainers__.every(function(item) {
				var newev = new NOMEvent(ev.change,ev.bubbles,ev.cancelable,item.property + (ev.path && ev.path.length>0 ? "/" + ev.path : ""));
				return dispatch(item.object,newev);
			})
		}
		return true;
	}
	NOMTRACE = 0;
	NOMEvent.trace = function(level) {
		NOMTRACE = (level===undefined ? 1 : level);
	}
	exports.NOM = {
		Event: NOMEvent,
		enable:NOMEnable,
		observe:NOMObserve,
		unobserve:NOMUnobserve
	}
})("undefined"!=typeof exports&&"undefined"!=typeof global?global:window);
