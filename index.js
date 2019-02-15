(function() {
	"use strict";
	
//soundex from https://gist.github.com/shawndumas/1262659
	function soundex(a) {a=(a+"").toLowerCase().split("");var c=a.shift(),b="",d={a:"",e:"",i:"",o:"",u:"",b:1,f:1,p:1,v:1,c:2,g:2,j:2,k:2,q:2,s:2,x:2,z:2,d:3,t:3,l:4,m:5,n:5,r:6},b=c+a.map(function(a){return d[a]}).filter(function(a,b,e){return 0===b?a!==d[c]:a!==e[b-1]}).join("");return(b+"000").slice(0,4).toUpperCase()};

//from https://gist.github.com/lovasoa/3361645 + length==1 mod by AnyWhichWay
	function intersection(){
		if(arguments.length===0) return []; 
		if(arguments.length===1) return arguments[0].slice(); 
		var a,b,c,d,e,f,g=[],h={},i;
		i=arguments.length-1;
		d=arguments[0].length;
		c=0;
		for(a=0;a<=i;a++){
			e=arguments[a].length;
			if(e<d){c=a;d=e}
		}
		for(a=0;a<=i;a++){
			e=a===c?0:a||c;f=arguments[e].length;
			for(var j=0;j<f;j++){
				var k=arguments[e][j];
				if(h[k]===a-1){
					if(a===i){
						g.push(k);h[k]=0
					} else {
						h[k]=a
					}
				}
				else if(a===0){
					h[k]=0
				}
			}
		}
		return g;
	}
	
	function trigrams(tokens) {
		const grams = [],
			str = Array.isArray(tokens) ? tokens.join("") : tokens+"";
		for(let i=0;i<str.length-2;i++) {
			grams.push(str.substring(i,i+3));
		}
		return grams;
	}
	
	const STOPWORDS = {
			en: [
			  'a', 'about', 'after', 'ala', 'all', 'also', 'am', 'an', 'and', 'another', 'any', 'are', 
			  'around','as', 'at', 'be',
			  'because', 'been', 'before', 'being', 'between', 'both', 'but', 'by', 'came', 'can',
			  'come', 'could', 'did', 'do', 'each', 'for', 'from', 'get', 'got', 'has', 'had',
			  'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how', 'i', 'if', 'iff', 'in', 
			  'include', 'into',
			  'is', 'it', 'like', 'make', 'many', 'me', 'might', 'more', 'most', 'much', 'must',
			  'my', 'never', 'now', 'of', 'on', 'only', 'or', 'other', 'our', 'out', 'over',
			  'said', 'same', 'see', 'should', 'since', 'some', 'still', 'such', 'take', 'than',
			  'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those',
			  'through', 'to', 'too', 'under', 'up', 'very', 'was', 'way', 'we', 'well', 'were',
			  'what', 'where', 'which', 'while', 'who', 'with', 'would', 'you', 'your']
	};
	
//stemmer from https://github.com/words/stemmer MIT License, Titus Wormer
	/* Character code for `y`. */
	var CC_Y = 'y'.charCodeAt(0);

	/* Standard suffix manipulations. */
	var step2list = {
	  ational: 'ate',
	  tional: 'tion',
	  enci: 'ence',
	  anci: 'ance',
	  izer: 'ize',
	  bli: 'ble',
	  alli: 'al',
	  entli: 'ent',
	  eli: 'e',
	  ousli: 'ous',
	  ization: 'ize',
	  ation: 'ate',
	  ator: 'ate',
	  alism: 'al',
	  iveness: 'ive',
	  fulness: 'ful',
	  ousness: 'ous',
	  aliti: 'al',
	  iviti: 'ive',
	  biliti: 'ble',
	  logi: 'log'
	};

	var step3list = {
	  icate: 'ic',
	  ative: '',
	  alize: 'al',
	  iciti: 'ic',
	  ical: 'ic',
	  ful: '',
	  ness: ''
	};

	/* Consonant-vowel sequences. */
	var consonant = '[^aeiou]';
	var vowel = '[aeiouy]';
	var consonantSequence = '(' + consonant + '[^aeiouy]*)';
	var vowelSequence = '(' + vowel + '[aeiou]*)';

	var MEASURE_GT_0 = new RegExp(
	  '^' + consonantSequence + '?' + vowelSequence + consonantSequence
	);

	var MEASURE_EQ_1 = new RegExp(
	  '^' + consonantSequence + '?' + vowelSequence + consonantSequence +
	  vowelSequence + '?$'
	);

	var MEASURE_GT_1 = new RegExp(
	  '^' + consonantSequence + '?' +
	  '(' + vowelSequence + consonantSequence + '){2,}'
	);

	var VOWEL_IN_STEM = new RegExp(
	  '^' + consonantSequence + '?' + vowel
	);

	var CONSONANT_LIKE = new RegExp(
	  '^' + consonantSequence + vowel + '[^aeiouwxy]$'
	);

	/* Exception expressions. */
	var SUFFIX_LL = /ll$/;
	var SUFFIX_E = /^(.+?)e$/;
	var SUFFIX_Y = /^(.+?)y$/;
	var SUFFIX_ION = /^(.+?(s|t))(ion)$/;
	var SUFFIX_ED_OR_ING = /^(.+?)(ed|ing)$/;
	var SUFFIX_AT_OR_BL_OR_IZ = /(at|bl|iz)$/;
	var SUFFIX_EED = /^(.+?)eed$/;
	var SUFFIX_S = /^.+?[^s]s$/;
	var SUFFIX_SSES_OR_IES = /^.+?(ss|i)es$/;
	var SUFFIX_MULTI_CONSONANT_LIKE = /([^aeiouylsz])\1$/;
	var STEP_2 = new RegExp(
	  '^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|' +
	  'ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|' +
	  'biliti|logi)$'
	);
	var STEP_3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
	var STEP_4 = new RegExp(
	  '^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|' +
	  'iti|ous|ive|ize)$'
	);

	/* Stem `value`. */
	function stemmer(value) {
	  var firstCharacterWasLowerCaseY;
	  var match;

	  value = String(value).toLowerCase();

	  /* Exit early. */
	  if (value.length < 3) {
	    return value;
	  }

	  /* Detect initial `y`, make sure it never matches. */
	  if (value.charCodeAt(0) === CC_Y) {
	    firstCharacterWasLowerCaseY = true;
	    value = 'Y' + value.substr(1);
	  }

	  /* Step 1a. */
	  if (SUFFIX_SSES_OR_IES.test(value)) {
	    /* Remove last two characters. */
	    value = value.substr(0, value.length - 2);
	  } else if (SUFFIX_S.test(value)) {
	    /* Remove last character. */
	    value = value.substr(0, value.length - 1);
	  }

	  /* Step 1b. */
	  if (match = SUFFIX_EED.exec(value)) {
	    if (MEASURE_GT_0.test(match[1])) {
	      /* Remove last character. */
	      value = value.substr(0, value.length - 1);
	    }
	  } else if ((match = SUFFIX_ED_OR_ING.exec(value)) && VOWEL_IN_STEM.test(match[1])) {
	    value = match[1];

	    if (SUFFIX_AT_OR_BL_OR_IZ.test(value)) {
	      /* Append `e`. */
	      value += 'e';
	    } else if (SUFFIX_MULTI_CONSONANT_LIKE.test(value)) {
	      /* Remove last character. */
	      value = value.substr(0, value.length - 1);
	    } else if (CONSONANT_LIKE.test(value)) {
	      /* Append `e`. */
	      value += 'e';
	    }
	  }

	  /* Step 1c. */
	  if ((match = SUFFIX_Y.exec(value)) && VOWEL_IN_STEM.test(match[1])) {
	    /* Remove suffixing `y` and append `i`. */
	    value = match[1] + 'i';
	  }

	  /* Step 2. */
	  if ((match = STEP_2.exec(value)) && MEASURE_GT_0.test(match[1])) {
	    value = match[1] + step2list[match[2]];
	  }

	  /* Step 3. */
	  if ((match = STEP_3.exec(value)) && MEASURE_GT_0.test(match[1])) {
	    value = match[1] + step3list[match[2]];
	  }

	  /* Step 4. */
	  if (match = STEP_4.exec(value)) {
	    if (MEASURE_GT_1.test(match[1])) {
	      value = match[1];
	    }
	  } else if ((match = SUFFIX_ION.exec(value)) && MEASURE_GT_1.test(match[1])) {
	    value = match[1];
	  }

	  /* Step 5. */
	  if (
	    (match = SUFFIX_E.exec(value)) &&
	    (MEASURE_GT_1.test(match[1]) || (MEASURE_EQ_1.test(match[1]) && !CONSONANT_LIKE.test(match[1])))
	  ) {
	    value = match[1];
	  }

	  if (SUFFIX_LL.test(value) && MEASURE_GT_1.test(value)) {
	    value = value.substr(0, value.length - 1);
	  }

	  /* Turn initial `Y` back to `y`. */
	  if (firstCharacterWasLowerCaseY) {
	    value = 'y' + value.substr(1);
	  }

	  return value;
	}
	
	function tokenize(value) { return value.replace(/[<>"'\{\}\[\]\(\)\-\=\+\*\~\n\t\:\.\;\:\$\#\%\&\*\^\!\~\<\>\,\?\`\'\"]/g," ").toLowerCase().split(" "); }
	
	
	const CTORS = {
			Object,
			Array,
			Function,
			Map,
			Set,
			Date
		},
		FUNCTIONS = {},
		JOQULAR = {},
		UNDEFINED = ()=>undefined,
		addFunction = (f,name=f.name) => {
			if(!name || name==="anonymous") {
				throw new Error("JOQULAR.function: A function name must be provided");
			}
			if(typeof(f)!=="function") {
				throw new Error(`JOQULAR.function: ${f} is not a function`);
			}
			if(!name[0]==="$") {
				name = "$" + name;
			}
			FUNCTIONS[name] = f;
		},
		deepCopy = data => {
			const type = typeof(data);
			if(data && type==="object") {
				if(data instanceof Date) {
					return new Date(data.getTime());
				}
				const descriptors = Object.getOwnPropertyDescriptors(data);
				return Object.keys(descriptors).reduce((accum,key) => {
					const {enumerable,configurable,writable,get,set} = descriptors[key];
					if(!get && !set) {
						const value = deepCopy(data[key]);
						Object.defineProperty(accum,key,{enumerable,configurable,writable,value});
					}
					return accum;
				},Array.isArray(data) ? [] : Object.create(Object.getPrototypeOf(data)));
			}
			return data;
		},
		deepEqual = (a,b) => {
			const atype = typeof(a),
				btype = typeof(b);
			if(atype!==btype) return false;
			if((a && !b) || (!a && b)) return false;
			if(a && a.length!==b.length) return false;
			if(atype==="number" && isNaN(a) && isNaN(b)) return true;
			if(a && atype==="object") {
				if(a instanceof Date || b instanceof Date) {
					if(!(a instanceof Date)) return false;
					if(!(b instanceof Date)) return false;
					if(a.getTime()!==b.getTime()) return false;
					return true;
				}
				if(!Array.isArray(a) && Symbol.iterator in a) {
					if(Array.isArray(b) || !(Symbol.iterator in b)) {
						return false;
					}
					const aentries = [],
						bentries = [];
					a.forEach(item = aentries.push(item));
					b.forEach(item = bentries.push(item));
					return deepEqual(aentries,bentries);
				}
				const checked = {},
					akeys = Object.keys(a),
					bkeys = Object.keys(b);
				if(akeys.length!==bkeys.length) {
					return false;
				}
				if(!akeys.every((key) => {
					checked[key] = true;
					return deepEqual(a[key],b[key]);
				})) {
					return false;
				}
				if(!bkeys.every((key) => {
					if(checked[key]) {
						return true;
					}
					return deepEqual(a[key],b[key]);
				})) {
					return false;
				}
				return true;
			}
			return a===b;
		},
		deepFreeze = (object) => {
			if(object && typeof(object)==="object") {
				Object.keys(object).forEach(key => deepFreeze(object[key]));
				Object.freeze(object);
			}
		},
		deleteFunction = (name) => {
			if(!name || name==="anonymous") {
				throw new Error("JOQULAR.function: A function name must be provided");
			}
			if(FUNCTIONS[name]) {
				delete FUNCTIONS[name];
				return true;
			}
			return false;
		},
		register = (f,name=f.name) => {
			if(!name || name==="anonymous") {
				throw new Error("JOQULAR.register: A function name must be provided");
			}
			if(typeof(f)!=="function") {
				throw new Error(`JOQULAR.register: ${f} is not a function`);
			}
			CTORS[name] = f;
		},
		unregister = (name) => {
			if(!name || name==="anonymous") {
				throw new Error("JOQULAR.unregister: A function name must be provided");
			}
			if(CTORS[name]) {
				delete CTORS[name];
				return true;
			}
			return false;
		},
		extract = async (pattern,value) => {
			const extracted = {};
			if(queryaux(pattern,value,extracted)) {
				return extracted;
			}
		},
		query = async (pattern,...values) => {
			const results = [];
			for(const value of values) {
				const copy = deepCopy(value),
					queryed = await queryaux(pattern,copy,{});
				results.push(deepEqual(queryed,value) ? value : queryed);
			}
			return results;
		},
		queryaux = async (pattern,value,extracted,objectKey,object) => {
			if(pattern===null || pattern===value) return value;
			const ptype=typeof(pattern),
				vtype = typeof(value);
			if(pattern && ptype=="object") {
				for(const key in pattern) {
					if(key==="onError") {
						continue;
					}
					let pkey = key;
					if(key==="$_") {
						pkey = () => true;
					} else if(key.includes("=>")) {
						try {
							pkey = new Function("return " + key)();
							if(value==null || vtype!=="object") return;
						} catch(e) {
							; // ignore
						}
					} else if(key[0]==="/") {
						const i = key.lastIndexOf("/");
						if(i>0) {
							try {
								const regexp = new RegExp(key.substring(1,i),key.substring(i+1));
								pkey = (key) => {
									return regexp.test(key);
								};
							} catch(e) {
								;
							}
						}
					}
					const pkeytype = typeof(pkey),
						predicate =  FUNCTIONS[key] ? FUNCTIONS[key] : typeof(pattern[key])==="function" ? pattern[key] : undefined;
					if(pkeytype!=="function" && predicate) {
						if(typeof(pattern[key])==="function" && !FUNCTIONS[key]) {
							if(!(await predicate.call(value,value[key],predicate,key,value))) {
								return;
							}
							extracted[key] = value[key];
						} else {
							if(!(await predicate.call(object,value,pattern[key],objectKey,object))) {
								return;
							}
							if(value===undefined) {
								value = object[objectKey]; // predicate may have added value
							}
							if(objectKey) extracted[objectKey] = value;
						}
						continue;
					}
					if((!predicate || predicate.recurse) && value && typeof(value)==="object") {
						if(pkeytype==="function") {
							const keys = Object.keys(value).filter(key => pkey(key));
							if(keys.length===0) {
								return;
							}
							for(const vkey of keys) {
								if((await queryaux(pattern[key],value[vkey],extracted,vkey,value)===undefined)) {
									return;
								}
							}
						} else if((await queryaux(pattern[key],value[key],extracted,key,value)===undefined)) {
							return;
						}
					}
				}
				if(value && value._proxy) return value._proxy;
				return value;
			}
		},
		functions = {
				$(value,f,key) {
				return f(value,key,this);
			},
			async $and(a,tests,key) {
				const resolve = (a,pname,value) => FUNCTIONS[pname] ? FUNCTIONS[pname].call(this,a,value,key) : false;
				if(Array.isArray(tests)) {
					for(const test of tests) {
						for(const pname of Object.keys(test)) {
							if(!(await resolve(a,pname,test[pname]))) {
								return false;
							}
						}
					}
					return true;
				} else {
					for(const pname of Object.keys(tests)) {
						if(!(await resolve(a,pname,tests[pname]))) {
							return false;
						}
					}
					return true;
				}
			},
			$as(value,as,key) {
				this[as] = value;
				return true;
			},
			$avg(iterable,as,key) {
				if(Symbol.iterator in Object(iterable)) {
					let sum = 0,
						count = 0;
					for(let value of iterable) {
						if(!Array.isArray(iterable)) {
							value = value[1];
						}
						if(typeof(value)==="number") {
							sum += value;
							count++;
						}
					}
					this[as||key] = sum/count;
					return true;
				}
			},
			$avga(iterable,as,key) {
				if(Symbol.iterator in Object(iterable)) {
					let sum = 0,
						count = 0;
					for(let value of iterable) {
						if(!Array.isArray(iterable)) {
							value = value[1];
						}
						if(value==true) {
							value = 1;
						} else if(value==false) {
							value = 0;
						} else {
							value = parseFloat(value)
						}
						if(typeof(value)==="number" && !isNaN(value)) {
							sum += value;
							count++;
						}
					}
					this[as||key] = sum/count;
					return true;
				}
			},
			$between(value,[lo,hi,inclusive=true]) {
				if(value && typeof(value.between)==="function") {
					return value.between(lo,hi,inclusive);
				}
				if(inclusive) {
					return (value>=lo && value<=hi) || (value>=hi && value<=lo);
				}
				return (value>lo && value<hi) || (value>hi && value<lo);
			},
			$compute(value,f,key) {
				this[key] = typeof(f)==="function" ? f(value,key,this) : f;
				return true;
			},
			$count(iterable,as,key) {
				if(Symbol.iterator in Object(iterable)) {
					let count = 0;
					for(let value of iterable) {
						if(value!==undefined) count++;
					}
					this[as||key] = count;
					return true;
				}
			},
			$counta(iterable,as,key) {
				if(Symbol.iterator in Object(iterable)) {
					if(iterable.length!==undefined) {
						this[as||key] = iterable.length
					} else if(typeof(iterable.count)==="function") {
						this[as||key] = iterable.count();
					} else if(typeof(iterable.count)==="number") {
						this[as||key] = iterable.count;
					} else if(typeof(iterable.size)==="function") {
						this[as||key] = iterable.size();
					} else if(typeof(iterable.size)==="number") {
						this[as||key] = iterable.size;
					} else {
						let count = 0;
						for(let value of iterable) {
							count++;
						}
						this[as||key] = iterable.size();
					}
					return true;
				}
			},
			$default(value,dflt,key) {
				if(value===undefined) {
					this[key] = dflt;
				}
				return true;
			},
			$define(value,descriptor,key) {
				Object.defineProperty(this,key,Object.assign({},{value},descriptor));
				return true;
			},
			async $descendant(target,pattern,key) {
				if(JOQULAR.query(pattern,target,{},key,this)!==undefined) return true;
				if(!target || typeof(target)!=="object") return true;
				for(const key of Object.keys(target)) {
					if((await FUNCTIONS.$descendant.call(target,target[key],pattern,key))) {
						return true;
					}
				}
			},
			$disjoint(a,b) {
				return !this.$intersects(a,b);
			},
			$disjunction(a,b) {
				if(Array.isArray(a) && Array.isArray(b)) {
					this[b.as||key] = disjunction(a,b);
					return true;
				}
			},
			$echoes(a,b) { 
				return soundex(a)===soundex(b); 
			},
			$eeq(a,b) { 
				return a === b; 
			},
			$eq(a,b) {
				if(a && b && typeof(a)==="object" && typeof(b)==="object") {
					return deepEqual(a,b);
				}
				return a == b; 
			},
			async $every(iterable,f) {
				if(Symbol.iterator in Object(iterable)) {
					let key = 0;
					for(let value of iterable) {
						if(Array.isArray(iterable)) {
							if(!(await f(value,key,iterable))) {
								return false;
							}
						} else {
							if(!(await f(value[1],value[0],iterable))) {
								return false;
							}
						}
						key++;
					}
					return true;
				}
				return false;
			},
			async $extract(target,pattern,key) {
				const extracted = {};
				if((await JOQULAR.query(pattern,target,extracted,key,this))!==undefined) {
					this[key] = extracted;
				}
				return true;
			},
			$eq(a,b,depth,unordered) {
				return a==b;
				//deepEqual(test,value,depth,unordered);
			},
			$excludes(includer,value) {
				if(includer) {
					if(typeof(includer.excludes)==="function") {
						return includer.excludes(value);
					}
					if(typeof(includer.includes)==="function") {
						return !includer.includes(value);
					}
				}
			},
			$false() {
				return false;
			},
			$filter(filterable,spec,key) {
				let [f,as] = Array.isArray(spec) ? spec : [spec],
						result;
				if(filterable && typeof(filterable.filter)==="function") {
					result = filterable.filter((item) => f(item));
				} else {
					result = [];
				}
				this[as||key] = result;
				return true;
			},
			async $forDescendant(target,{pattern,f,depth=Infinity},key,seen=new Set()) {
				if(JOQULAR.query(pattern,target,{},key,this)!==undefined) {
					await f(target,key,this);
				}
				if(!target || typeof(target)!=="object" || depth===0 && !seen.has(target)) return true;
				seen.add(target);
				for(const key of Object.keys(target)) {
					await $forDescendant.call(target,target[key],{pattern,$,depth:depth-1},key,seen);
				}
				return true;
			},
			async $forEach(iterable,f,key) {
				if(Symbol.iterator in Object(iterable)) {
					let key = 0;
					for(let value of iterable) {
						if(Array.isArray(iterable)) {
							results.push(await f(value,key,iterable));
						} else {
							results.push(await f(value[1],value[0],iterable));
						}
						key++;
					}
					return true;
				}
				return false;
			},
			$freeze(value,deep,key) {
				if(value==null) {
					value = {};
				}
				if(value && typeof(value)==="object") {
					if(deep) {
						deepFreeze(value);
					} else {
						Object.freeze(value);
					}
				}
				return true;
			},
			$gt(a,b) {
				return a > b;
			},
			$gte(a,b) { 
				return a >= b; 
			},
			$gt(a,b) { 
				return a > b; 
			},
			$in(value,includer) {
				if(value && typeof(value.in)==="function") {
					return value.in(includer);
				}
				if(value && typeof(value.has)==="function") {
					return value.has(includer);
				}
				if(includer && typeof(includer.includes)==="function") {
					return includer.includes(value);
				}
				if(includer && typeof(includer.contains)==="function") {
					return includer.contains(value);
				}
				if(Symbol.iterator in Object(includer)) {
					for(let item of includer) {
							if(item[1]===value) return true;
					}
				}
			},
			$includes(includer,value) {
				return FUNCTIONS.$in(value,includer);
			},
			$instanceof(a,b) {
				b = typeof(b)==="string" ? CTORS[b] : b;
				return a && typeof(a)==="object" && b && typeof(b)==="function" && a instanceof b;
			},
			$intersects(a,b,key) {
				if(Array.isArray(a) && Array.isArray(b)) {
					this[b.as||key] = intersection(a,b);
					return true;
				}
			},
			$intersects(a,b) {
				return Array.isArray(a) && Array.isArray(b) && intersection(a,b).length>0;
			},
			$isAny(a,types=["boolean","function","number","object","string"]) {
				return types.includes(typeof(a));
			},
			async $isArray(value) { 
				return Array.isArray(value);
			},
			$isCreditCard(value) {
				//  Visa || Mastercard || American Express || Diners Club || Discover || JCB 
				return (/^(?:4[0-9]{12}(?:[0-9]{3})?|(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|3[47][0-9]{13}| 3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/m).test(value) && validateLuhn(value);
			},
			$isEmail(value) {
				return !/(\.{2}|-{2}|_{2})/.test(value) && /^[a-z0-9][a-z0-9-_\.]+@[a-z0-9][a-z0-9-]+[a-z0-9]\.[a-z]{2,10}(?:\.[a-z]{2,10})?$/i.test(value);
			},
			$isEven(value) {
				return value % 2 === 0;
			},
			$isFrozen(value) {
				const type = typeof(value);
				if(value && type==="object") {
					return Object.isFrozen(value);
				}
				return true;
			},
			$isIPAddress(value) {
				return (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/m).test(value);
			},
			$isNaN(value) { 
				return isNaN(value); 
			},
			$isOdd(value) {
				return value % 2 !== 0;
			},
			$isSSN(value) {
				return /^\d{3}-?\d{2}-?\d{4}$/.test(value);
			},
			$length(value,length) { 
				return a && (a.length===length || a.size===length); 
			},
			$lock(value,_,key) {
				try {
					Object.defineProperty(this,key,{enumerable:true,value});
				} catch(e) {
					;
				}
				return true;
			},
			$lt(a,b) { 
				return a < b; 
			},
			$lte(a,b) { 
				return a <= b; 
			},
			async $map(iterable,spec,key) {
				if(Symbol.iterator in Object(iterable)) {
					const results = [];
					let [f,as] = Array.isArray(spec) ? spec : [spec];
					let key = 0;
					for(let value of iterable) {
						if(Array.isArray(iterable)) {
							results.push(await f(value,key,iterable));
						} else {
							results.push(await f(value[1],value[0],iterable));
						}
						key++;
					}
					this[as||key] = results;
					return true;
				}
				return false;
			},
			$match(value,match,key) {
				if(value!=null) {
					const type = typeof(value);
					if(["boolean","number","string"].includes(type)) {
						value += "";
						if(typeof(match)==="string" && match[0]==="/") {
							const parts = match.split("/");
							if(parts.length===3) {
								try {
									match = new RegExp(parts[1],parts[2]);
								} catch(e) {
									;
								}
							}
						}
					}
					if(value.matches) {
						const matches = value.matches(match);
						if(matches && matches.length>0) {
							return true;
						}
					}
				}
			},
			$matches(value,match,key) {
				if(value!=null) {
					const type = typeof(value);
					let as;
					if(Array.isArray(match)) {
						as = match[1];
						match = match[0];
					}
					if(["boolean","number","string"].includes(type)) {
						value += "";
						if(typeof(match)==="string" && match[0]==="/") {
							const parts = match.split("/");
							if(parts.length===3) {
								try {
									match = new RegExp(parts[1],parts[2]);
								} catch(e) {
									;
								}
							}
						}
					}
					if(value.matches||value.match) {
						const matches = (value.matches||value.match)(match);
						if(matches) {
							this[as||key] = matches;
							return true;
						}
					}
				}
			},
			$max(iterable,as,key) {
				if(Symbol.iterator in Object(iterable)) {
					let max;
					for(let value of iterable) {
						if(!Array.isArray(iterable)) {
							value = value[1];
						}
						max = max===undefined || value > max ? value : max;
					}
					this[as||key] = max;
					return true;
				}
			},
			$maxa(iterable,as,key) {
				if(Symbol.iterator in Object(iterable)) {
					let max = -Infinity;
					for(let value of iterable) {
						if(!Array.isArray(iterable)) {
							value = value[1];
						}
						if(value==true) {
							value = 1;
						} else if(value==false) {
							value = 0;
						} else {
							value = parseFloat(value)
						}
						if(typeof(value)==="number" && !isNaN(value)) {
							max = value > max ? value : max;
						}
					}
					this[as||key] = max;
					return true;
				}
			},
			$min(iterable,as,key) {
				if(Symbol.iterator in Object(iterable)) {
					let min;
					for(let value of iterable) {
						if(!Array.isArray(iterable)) {
							value = value[1];
						}
						min = min===undefined || value < min ? value : min;
					}
					this[as||key] = min;
					return true;
				}
			},
			$mina(iterable,as,key) {
				if(Symbol.iterator in Object(iterable)) {
					let min = Infinity;
					for(let value of iterable) {
						if(!Array.isArray(iterable)) {
							value = value[1];
						}
						if(value==true) {
							value = 1;
						} else if(value==false) {
							value = 0;
						} else {
							value = parseFloat(value)
						}
						if(typeof(value)==="number" && !isNaN(value)) {
							min = value < min ? value : min;
						}
					}
					this[as||key] = min;
					return true;
				}
			},
			$neq(a,b) { 
				if(a && b && typeof(a)==="object" && typeof(b)==="object") {
					return !deepEqual(a,b);
				}
				return a != b; 
			},
			$neeq(a,b) { 
				return a !== b; 
			},
			$nin(value,includer) {
				return !FUNCTIONS.$in(includer,value);
			},
			async $not(a,tests,key) {
				const resolve = (a,pname,value) => FUNCTIONS[pname] ? FUNCTIONS[pname].call(this,a,value,key) : false,
					pnames = Object.keys(tests);
				for(const pname of pname) {
					if(!(await resolve(a,pname,tests[pname]))) {
						return false;
					}
				}
				return true;
			},
			$on(value,handlers={},key) {
				const onerror = handlers.onError;
				let currenthandlers = {};
				if(this._proxy) {
					currenthandlers = this._proxy.handlers;
				}
				let handler = currenthandlers[key];
				if(!handler) {
					handler = currenthandlers[key] = {get:[],set:[],delete:[]};
				}
				Object.keys(handler).forEach(key => {
					const f = handlers[key];
					if(f) {
						if(!handler[key].includes(f)) {
							handler[key].push(f);
							if(onerror) {
								Object.defineProperty(f,"onError",{value:onerror});
							}
						}
					}
				});
				if(value===undefined) {
					this[key] = UNDEFINED;
				}
				const proxy = new Proxy(this,{
					get(target,property) {
						let value = property==="handlers" ? currenthandlers : target[property];
						if(value===UNDEFINED) {
							value = undefined;
						}
						if(currenthandlers[property]) {
							currenthandlers[property].get.forEach((f) => {
								try {
									f(proxy,key,value);
								} catch(e) {
									if(f.onError) {
										f.onError(e,proxy,key,value);
									} else {
										throw(e);
									}
								}
							});
						}
						return value;
					},
					set(target,property,value) {
						const oldvalue = target[property]===UNDEFINED ? undefined : target[property];
						let error;
						if(currenthandlers[property]) {
							currenthandlers[property].set.forEach((f) => {
								try {
									f(proxy,key,value,oldvalue);
								} catch(e) {
									if(f.onError) {
										f.onError(e,proxy,key,value,oldvalue);
									} else {
										throw(e);
									}
								}
							});
						}
						if(error) {
							throw error;
						}
						target[property] = value;
						return true;
					},
					deleteProperty(target,property) {
						const value = target[property]===UNDEFINED ? undefined : target[property];
						if(currenthandlers[property]) {
							currenthandlers[property].delete.forEach((f) => {
								try {
									f(proxy,key,value);
								} catch(e) {
									if(f.onError) {
										f.onError(e,proxy,key,value);
									} else {
										throw(e);
									}
								}
							});
						}
						delete target[property];
					}
				});
				Object.defineProperty(this,"_proxy",{configurable:true,value:proxy});
				return true;
			},
			async $or(a,tests,key) {
				const resolve = (a,pname,value) => FUNCTIONS[pname] ? FUNCTIONS[pname].call(this,a,value,key) : false;
				if(Array.isArray(tests)) {
					for(const test of tests) {
						for(const pname of Object.keys(test)) {
							if((await resolve(a,pname,test[pname]))) {
								return true;
							}
						}
					}
				} else {
					for(const pname of Object.keys(tests)) {
						if((await resolve(a,pname,tests[pname]))) {
							return true;
						}
					}
				}
			},
			$outside(value,[lo,hi],key) {
				if(value) {
					if(typeof(value.outside)==="function") {
						return value.outside(lo,hi);
					}
					return !FUNCTIONS.$between(value,[lo,hi,true]);
				}
			},
			$readonly(value,_,key) {
				if(this[key]!==undefined || Object.getOwnPropertyDescriptor(this,key)) {
					try {
						this[key] = value; // setting to is existing value, so no harm
						return false;
					} catch(e) {
						return true;
					}
				}
			},
			async $redact(value,f,key) {
				if(typeof(f)==="function") {
					if(await f(value,key,this)) {
						delete this[key];
					}
				} else {
					delete this[key];
				}
				return true;
			},
			async $reduce(iterable,spec,key) {
				if(Symbol.iterator in Object(iterable)) {
					let [f,accum,as] = Array.isArray(spec) ? spec : [spec],
							key = 0;
					for(let value of iterable) {
						if(Array.isArray(iterable)) {
							if(accum===undefined && key===0) {
								accum = value;
							} else {
								accum = await f(accum,value,key,iterable);
							}
						} else {
							if(accum===undefined && key===0) {
								accum = value[0];
							} else {
								accum = await f(accum,value[1],value[0],iterable);
							}
						}
						key++;
					}
					this[as||key] = accum;
					return true;
				}
				return false;
			},
			$return(_,value,key) {
				if(value===undefined) {
					delete this[key];
				} else {
					this[key] = value;
				}
				return true;
			},
			$sample(iterable,spec,key) {
				// get count random items from an iterable
				if(Symbol.iterator in Object(iterable)) {
					let [pct,max=Infinity,as] = Array.isArray(spec) ? spec : [spec];
					const sample = [],
						indexes = [];
					let i = 0;
					for(const item of iterable) {
						i++;
						const rand = Math.random();
						if(rand<=pct) {
							if(Array.isArray(iterable)) {
								sample.push(item);
							} else {
								sample.push(item.value)
							}
							if(sample.length===max) break;
						}
					}
					const length = Math.min(max,Math.round(i * pct));
					this[as||key] = sample.slice(0,length);
					return true;
				}
				return false;
			},
			async $search(text,phrase) {
				if(text) {
					let language,
						stems,
						tris;
					if(Array.isArray(phrase)) {
						stems = phrase[1],
						tris = phrase[2],
						language = phrase[3],
						phrase = phrase[0]
					}
					if(typeof(tris)!=="number" || tris===0) {
						tris = 0.8;
					}
					if(typeof(language)!=="string") {
						language = "en";
					}
					const stops = STOPWORDS[language] || STOPWORDS.en;
					
					if(typeof(text)!=="string") {
						if(typeof(text.search)==="function") {
							return text.search(phrase,{stems,trigrams,language});
						}
						return false;
					}
					let tokens = tokenize(phrase),
						stemmed = tokens.map(token => stemmer(token)).filter(stem => !stops.includes(stem));
					if(!stems && stemmed.some(stem => text.includes(stem))) {
						return true;
					}
					if(!stems && !tris) {
						return false;
					}
					tokens = tokenize(text);
					if(stems) {
						const count = tokens.reduce((accum,token) => stemmed.some(stem => token.includes(stem)) ? accum += 1 : accum,0);
						if(count/tokens.length>=stems) {
							return true;
						}
					}
					if(tris) {
						const grams = trigrams(tokens.join("")),
							count = grams.reduce((accum,tri) => text.includes(tri) ? accum += 1 : accum,0);
						if((count/grams.length)>tris) {
							return true;
						}
					}
				}
			},
			async $some(iterable,f) {
				if(Symbol.iterator in Object(iterable)) {
					let key = 0;
					for(let value of iterable) {
						if(Array.isArray(iterable)) {
							if(await f(value,key,iterable)) {
								return true;
							}
						} else {
							if(await f(value[1],value[0],iterable)) {
								return true;
							}
						}
						key++;
					}
				}
				return false;
			},
			$sort(sortable,spec,key) {
				if(Array.isArray(sortable)) {
					sortable = sortable.slice();
					let [f,as] = Array.isArray(spec) ? spec : [spec],
							result;
						if(sortable && typeof(sortable.sort)==="function") {
							result = sortable.sort((a,b) => f(a,b));
						} else {
							result = [];
						}
						this[as||key] = result
						return true;
				}
			},
			$sum(iterable,as,key) {
				if(Symbol.iterator in Object(iterable)) {
					let sum = 0;
					for(let value of iterable) {
						if(!Array.isArray(iterable)) {
							value = value[1];
						}
						if(typeof(value)==="number") {
							sum =+ value;
						}
					}
					this[as||key] = sum;
					return true;
				}
			},
			$suma(iterable,as,key) {
				if(Symbol.iterator in Object(iterable)) {
					let sum = 0;
					for(let value of iterable) {
						if(!Array.isArray(iterable)) {
							value = value[1];
						}
						if(value==true) {
							value = 1;
						} else if(value==false) {
							value = 0;
						} else {
							value = parseFloat(value);
						}
						if(typeof(value)==="number" && !isNaN(value)) {
							sum =+ value;
						}
					}
					this[as||key] = sum;
					return true;
				}
			},
			$true() {
				return true;
			},
			$typeof(a,b) {
				return typeof(a)===b;
			},
			$valid(value,validations,key) {
				if(typeof(validations)==="function") {
					return validations(value,key,this);
				}
				for(const validationKey in Object.keys(validations)) {
					const validator = FUNCTIONS[validationKey];
					if(typeof(validator)==="function") {
						const valid = validator(this,validations[validationKey]);
						if(!valid) {
							const error = new TypeError(`failed validation ${validationKey} for ${this}`);
							if(typeof(validations.onError)==="function") {
								validations.onError(error,value,key,this);
							} else {
								throw(error);
							}
						}
					}
				}
				return true;
			},
			$xor(a,tests,key) {
				let found = 0;
				const resolve = (a,pname,value) => FUNCTIONS[pname] ? FUNCTIONS[pname].call(this,a,value,key) : false;
				if(Array.isArray(tests)) {
					for(const test of tests) {
						for(const pname in test) {
							if(resolve(a,pname,test[pname])) found++;
							if(found>1) return false;
						}
					}
				} else {
					for(const pname in tests) {
						if(resolve(a,pname,tests[pname])) found++;
						if(found>1) return false;
					}
				}
				return found===1;
			}
		};
		functions.$value = functions.$compute;
		functions.$type = functions.$typeof;
		functions.$text = functions.$search;
		functions.$regexp = functions.$matches;
		functions.$ne = functions.$neq;
		functions.$where = functions.$;
		
		for(const key of ["date","day","fullYear","hours","milliseconds","minutes","month","seconds","time","UTCDate","UTCDay","UTCFullYear","UTCHours","UTCSeconds","UTCMilliseconds","UTCMinutes","UTCMonth","year"]) {
			const fname = `get${key[0].toUpperCase()}${key.substring(1)}`;
			functions["$"+key] = 
				Function(`return function ${"$"+key}(a,b) {
						const atype = typeof(a),
							btype = typeof(b);
						if((atype==="number" && Math.abs(a)<8640000000000000) || atype==="string") {
							try { a = new Date(a); } catch(e) { return false; }
						}
						if((btype==="number" && Math.abs(b)<8640000000000000) || btype==="string") {
							try { b = new Date(a); } catch(e) { return false; }
						}
            if(typeof(a)==="object" && a instanceof Date && typeof(b)==="object" && b instanceof Date) return a.${fname}()===b.${fname}(); }`)();
		}
	
	Object.defineProperty(JOQULAR,"function",{value:addFunction});
	Object.defineProperty(JOQULAR,"undefine",{value:deleteFunction});
	Object.defineProperty(JOQULAR,"register",{value:register});
	Object.defineProperty(JOQULAR,"unregister",{value:unregister});
	Object.defineProperty(JOQULAR,"query",{value:query});
	Object.defineProperty(JOQULAR,"match",{value:query});
	Object.assign(FUNCTIONS,functions);
	
	if(typeof(module)!=="undefined") module.exports = JOQULAR;
	if(typeof(window)!=="undefined") window.JOQULAR = JOQULAR;
	
}).call(this);