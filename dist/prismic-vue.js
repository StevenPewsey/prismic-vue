(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.PrismicVue = factory());
}(this, (function () { 'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	(function(self) {

	  if (self.fetch) {
	    return
	  }

	  var support = {
	    searchParams: 'URLSearchParams' in self,
	    iterable: 'Symbol' in self && 'iterator' in Symbol,
	    blob: 'FileReader' in self && 'Blob' in self && (function() {
	      try {
	        new Blob();
	        return true
	      } catch(e) {
	        return false
	      }
	    })(),
	    formData: 'FormData' in self,
	    arrayBuffer: 'ArrayBuffer' in self
	  };

	  if (support.arrayBuffer) {
	    var viewClasses = [
	      '[object Int8Array]',
	      '[object Uint8Array]',
	      '[object Uint8ClampedArray]',
	      '[object Int16Array]',
	      '[object Uint16Array]',
	      '[object Int32Array]',
	      '[object Uint32Array]',
	      '[object Float32Array]',
	      '[object Float64Array]'
	    ];

	    var isDataView = function(obj) {
	      return obj && DataView.prototype.isPrototypeOf(obj)
	    };

	    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
	      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
	    };
	  }

	  function normalizeName(name) {
	    if (typeof name !== 'string') {
	      name = String(name);
	    }
	    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	      throw new TypeError('Invalid character in header field name')
	    }
	    return name.toLowerCase()
	  }

	  function normalizeValue(value) {
	    if (typeof value !== 'string') {
	      value = String(value);
	    }
	    return value
	  }

	  // Build a destructive iterator for the value list
	  function iteratorFor(items) {
	    var iterator = {
	      next: function() {
	        var value = items.shift();
	        return {done: value === undefined, value: value}
	      }
	    };

	    if (support.iterable) {
	      iterator[Symbol.iterator] = function() {
	        return iterator
	      };
	    }

	    return iterator
	  }

	  function Headers(headers) {
	    this.map = {};

	    if (headers instanceof Headers) {
	      headers.forEach(function(value, name) {
	        this.append(name, value);
	      }, this);
	    } else if (Array.isArray(headers)) {
	      headers.forEach(function(header) {
	        this.append(header[0], header[1]);
	      }, this);
	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        this.append(name, headers[name]);
	      }, this);
	    }
	  }

	  Headers.prototype.append = function(name, value) {
	    name = normalizeName(name);
	    value = normalizeValue(value);
	    var oldValue = this.map[name];
	    this.map[name] = oldValue ? oldValue+','+value : value;
	  };

	  Headers.prototype['delete'] = function(name) {
	    delete this.map[normalizeName(name)];
	  };

	  Headers.prototype.get = function(name) {
	    name = normalizeName(name);
	    return this.has(name) ? this.map[name] : null
	  };

	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(normalizeName(name))
	  };

	  Headers.prototype.set = function(name, value) {
	    this.map[normalizeName(name)] = normalizeValue(value);
	  };

	  Headers.prototype.forEach = function(callback, thisArg) {
	    for (var name in this.map) {
	      if (this.map.hasOwnProperty(name)) {
	        callback.call(thisArg, this.map[name], name, this);
	      }
	    }
	  };

	  Headers.prototype.keys = function() {
	    var items = [];
	    this.forEach(function(value, name) { items.push(name); });
	    return iteratorFor(items)
	  };

	  Headers.prototype.values = function() {
	    var items = [];
	    this.forEach(function(value) { items.push(value); });
	    return iteratorFor(items)
	  };

	  Headers.prototype.entries = function() {
	    var items = [];
	    this.forEach(function(value, name) { items.push([name, value]); });
	    return iteratorFor(items)
	  };

	  if (support.iterable) {
	    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
	  }

	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true;
	  }

	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result);
	      };
	      reader.onerror = function() {
	        reject(reader.error);
	      };
	    })
	  }

	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader();
	    var promise = fileReaderReady(reader);
	    reader.readAsArrayBuffer(blob);
	    return promise
	  }

	  function readBlobAsText(blob) {
	    var reader = new FileReader();
	    var promise = fileReaderReady(reader);
	    reader.readAsText(blob);
	    return promise
	  }

	  function readArrayBufferAsText(buf) {
	    var view = new Uint8Array(buf);
	    var chars = new Array(view.length);

	    for (var i = 0; i < view.length; i++) {
	      chars[i] = String.fromCharCode(view[i]);
	    }
	    return chars.join('')
	  }

	  function bufferClone(buf) {
	    if (buf.slice) {
	      return buf.slice(0)
	    } else {
	      var view = new Uint8Array(buf.byteLength);
	      view.set(new Uint8Array(buf));
	      return view.buffer
	    }
	  }

	  function Body() {
	    this.bodyUsed = false;

	    this._initBody = function(body) {
	      this._bodyInit = body;
	      if (!body) {
	        this._bodyText = '';
	      } else if (typeof body === 'string') {
	        this._bodyText = body;
	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	        this._bodyBlob = body;
	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	        this._bodyFormData = body;
	      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	        this._bodyText = body.toString();
	      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
	        this._bodyArrayBuffer = bufferClone(body.buffer);
	        // IE 10-11 can't handle a DataView body.
	        this._bodyInit = new Blob([this._bodyArrayBuffer]);
	      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
	        this._bodyArrayBuffer = bufferClone(body);
	      } else {
	        throw new Error('unsupported BodyInit type')
	      }

	      if (!this.headers.get('content-type')) {
	        if (typeof body === 'string') {
	          this.headers.set('content-type', 'text/plain;charset=UTF-8');
	        } else if (this._bodyBlob && this._bodyBlob.type) {
	          this.headers.set('content-type', this._bodyBlob.type);
	        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	        }
	      }
	    };

	    if (support.blob) {
	      this.blob = function() {
	        var rejected = consumed(this);
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyArrayBuffer) {
	          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      };

	      this.arrayBuffer = function() {
	        if (this._bodyArrayBuffer) {
	          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
	        } else {
	          return this.blob().then(readBlobAsArrayBuffer)
	        }
	      };
	    }

	    this.text = function() {
	      var rejected = consumed(this);
	      if (rejected) {
	        return rejected
	      }

	      if (this._bodyBlob) {
	        return readBlobAsText(this._bodyBlob)
	      } else if (this._bodyArrayBuffer) {
	        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
	      } else if (this._bodyFormData) {
	        throw new Error('could not read FormData body as text')
	      } else {
	        return Promise.resolve(this._bodyText)
	      }
	    };

	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      };
	    }

	    this.json = function() {
	      return this.text().then(JSON.parse)
	    };

	    return this
	  }

	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase();
	    return (methods.indexOf(upcased) > -1) ? upcased : method
	  }

	  function Request(input, options) {
	    options = options || {};
	    var body = options.body;

	    if (input instanceof Request) {
	      if (input.bodyUsed) {
	        throw new TypeError('Already read')
	      }
	      this.url = input.url;
	      this.credentials = input.credentials;
	      if (!options.headers) {
	        this.headers = new Headers(input.headers);
	      }
	      this.method = input.method;
	      this.mode = input.mode;
	      if (!body && input._bodyInit != null) {
	        body = input._bodyInit;
	        input.bodyUsed = true;
	      }
	    } else {
	      this.url = String(input);
	    }

	    this.credentials = options.credentials || this.credentials || 'omit';
	    if (options.headers || !this.headers) {
	      this.headers = new Headers(options.headers);
	    }
	    this.method = normalizeMethod(options.method || this.method || 'GET');
	    this.mode = options.mode || this.mode || null;
	    this.referrer = null;

	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(body);
	  }

	  Request.prototype.clone = function() {
	    return new Request(this, { body: this._bodyInit })
	  };

	  function decode(body) {
	    var form = new FormData();
	    body.trim().split('&').forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=');
	        var name = split.shift().replace(/\+/g, ' ');
	        var value = split.join('=').replace(/\+/g, ' ');
	        form.append(decodeURIComponent(name), decodeURIComponent(value));
	      }
	    });
	    return form
	  }

	  function parseHeaders(rawHeaders) {
	    var headers = new Headers();
	    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
	    // https://tools.ietf.org/html/rfc7230#section-3.2
	    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
	    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
	      var parts = line.split(':');
	      var key = parts.shift().trim();
	      if (key) {
	        var value = parts.join(':').trim();
	        headers.append(key, value);
	      }
	    });
	    return headers
	  }

	  Body.call(Request.prototype);

	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {};
	    }

	    this.type = 'default';
	    this.status = options.status === undefined ? 200 : options.status;
	    this.ok = this.status >= 200 && this.status < 300;
	    this.statusText = 'statusText' in options ? options.statusText : 'OK';
	    this.headers = new Headers(options.headers);
	    this.url = options.url || '';
	    this._initBody(bodyInit);
	  }

	  Body.call(Response.prototype);

	  Response.prototype.clone = function() {
	    return new Response(this._bodyInit, {
	      status: this.status,
	      statusText: this.statusText,
	      headers: new Headers(this.headers),
	      url: this.url
	    })
	  };

	  Response.error = function() {
	    var response = new Response(null, {status: 0, statusText: ''});
	    response.type = 'error';
	    return response
	  };

	  var redirectStatuses = [301, 302, 303, 307, 308];

	  Response.redirect = function(url, status) {
	    if (redirectStatuses.indexOf(status) === -1) {
	      throw new RangeError('Invalid status code')
	    }

	    return new Response(null, {status: status, headers: {location: url}})
	  };

	  self.Headers = Headers;
	  self.Request = Request;
	  self.Response = Response;

	  self.fetch = function(input, init) {
	    return new Promise(function(resolve, reject) {
	      var request = new Request(input, init);
	      var xhr = new XMLHttpRequest();

	      xhr.onload = function() {
	        var options = {
	          status: xhr.status,
	          statusText: xhr.statusText,
	          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
	        };
	        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
	        var body = 'response' in xhr ? xhr.response : xhr.responseText;
	        resolve(new Response(body, options));
	      };

	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'));
	      };

	      xhr.ontimeout = function() {
	        reject(new TypeError('Network request failed'));
	      };

	      xhr.open(request.method, request.url, true);

	      if (request.credentials === 'include') {
	        xhr.withCredentials = true;
	      } else if (request.credentials === 'omit') {
	        xhr.withCredentials = false;
	      }

	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob';
	      }

	      request.headers.forEach(function(value, name) {
	        xhr.setRequestHeader(name, value);
	      });

	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
	    })
	  };
	  self.fetch.polyfill = true;
	})(typeof self !== 'undefined' ? self : undefined);

	// the whatwg-fetch polyfill installs the fetch() function
	// on the global object (window or self)
	//
	// Return that as the export for use in Webpack, Browserify etc.

	var globalObj = typeof self !== 'undefined' && self || commonjsGlobal;
	var fetchNpmBrowserify = globalObj.fetch.bind(globalObj);

	var prismicJavascript_min = createCommonjsModule(function (module, exports) {
	!function(t,e){module.exports=e(fetchNpmBrowserify);}(commonjsGlobal,function(t){return function(t){function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var n={};return e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:r});},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=5)}([function(t,e,n){function r(t){return "string"==typeof t?'"'+t+'"':t instanceof Array?"["+t.map(function(t){return r(t)}).join(",")+"]":"number"==typeof t?t:null}e.__esModule=!0;var o={at:"at",not:"not",missing:"missing",has:"has",any:"any",in:"in",fulltext:"fulltext",similar:"similar",numberGt:"number.gt",numberLt:"number.lt",numberInRange:"number.inRange",dateBefore:"date.before",dateAfter:"date.after",dateBetween:"date.between",dateDayOfMonth:"date.day-of-month",dateDayOfMonthAfter:"date.day-of-month-after",dateDayOfMonthBefore:"date.day-of-month-before",dateDayOfWeek:"date.day-of-week",dateDayOfWeekAfter:"date.day-of-week-after",dateDayOfWeekBefore:"date.day-of-week-before",dateMonth:"date.month",dateMonthBefore:"date.month-before",dateMonthAfter:"date.month-after",dateYear:"date.year",dateHour:"date.hour",dateHourBefore:"date.hour-before",dateHourAfter:"date.hour-after",GeopointNear:"geopoint.near"},i={near:function(t,e,n,r){return "["+o.GeopointNear+"("+t+", "+e+", "+n+", "+r+")]"}},u={before:function(t,e){return "["+o.dateBefore+"("+t+", "+e.getTime()+")]"},after:function(t,e){return "["+o.dateAfter+"("+t+", "+e.getTime()+")]"},between:function(t,e,n){return "["+o.dateBetween+"("+t+", "+e.getTime()+", "+n.getTime()+")]"},dayOfMonth:function(t,e){return "["+o.dateDayOfMonth+"("+t+", "+e+")]"},dayOfMonthAfter:function(t,e){return "["+o.dateDayOfMonthAfter+"("+t+", "+e+")]"},dayOfMonthBefore:function(t,e){return "["+o.dateDayOfMonthBefore+"("+t+", "+e+")]"},dayOfWeek:function(t,e){return "["+o.dateDayOfWeek+"("+t+", "+e+")]"},dayOfWeekAfter:function(t,e){return "["+o.dateDayOfWeekAfter+"("+t+", "+e+")]"},dayOfWeekBefore:function(t,e){return "["+o.dateDayOfWeekBefore+"("+t+", "+e+")]"},month:function(t,e){return "number"==typeof e?"["+o.dateMonth+"("+t+", "+e+")]":"["+o.dateMonth+"("+t+', "'+e+'")]'},monthBefore:function(t,e){return "number"==typeof e?"["+o.dateMonthBefore+"("+t+", "+e+")]":"["+o.dateMonthBefore+"("+t+', "'+e+'")]'},monthAfter:function(t,e){return "number"==typeof e?"["+o.dateMonthAfter+"("+t+", "+e+")]":"["+o.dateMonthAfter+"("+t+', "'+e+'")]'},year:function(t,e){return "["+o.dateYear+"("+t+", "+e+")]"},hour:function(t,e){return "["+o.dateHour+"("+t+", "+e+")]"},hourBefore:function(t,e){return "["+o.dateHourBefore+"("+t+", "+e+")]"},hourAfter:function(t,e){return "["+o.dateHourAfter+"("+t+", "+e+")]"}},a={gt:function(t,e){return "["+o.numberGt+"("+t+", "+e+")]"},lt:function(t,e){return "["+o.numberLt+"("+t+", "+e+")]"},inRange:function(t,e,n){return "["+o.numberInRange+"("+t+", "+e+", "+n+")]"}};e.default={at:function(t,e){return "["+o.at+"("+t+", "+r(e)+")]"},not:function(t,e){return "["+o.not+"("+t+", "+r(e)+")]"},missing:function(t){return "["+o.missing+"("+t+")]"},has:function(t){return "["+o.has+"("+t+")]"},any:function(t,e){return "["+o.any+"("+t+", "+r(e)+")]"},in:function(t,e){return "["+o.in+"("+t+", "+r(e)+")]"},fulltext:function(t,e){return "["+o.fulltext+"("+t+", "+r(e)+")]"},similar:function(t,e){return "["+o.similar+'("'+t+'", '+e+")]"},date:u,dateBefore:u.before,dateAfter:u.after,dateBetween:u.between,dayOfMonth:u.dayOfMonth,dayOfMonthAfter:u.dayOfMonthAfter,dayOfMonthBefore:u.dayOfMonthBefore,dayOfWeek:u.dayOfWeek,dayOfWeekAfter:u.dayOfWeekAfter,dayOfWeekBefore:u.dayOfWeekBefore,month:u.month,monthBefore:u.monthBefore,monthAfter:u.monthAfter,year:u.year,hour:u.hour,hourBefore:u.hourBefore,hourAfter:u.hourAfter,number:a,gt:a.gt,lt:a.lt,inRange:a.inRange,near:i.near,geopoint:i};},function(t,e,n){e.__esModule=!0;var r=function(){function t(t){this.data={},this.data=t;}return t.prototype.id=function(){return this.data.id},t.prototype.ref=function(){return this.data.ref},t.prototype.label=function(){return this.data.label},t}();e.Variation=r;var o=function(){function t(t){this.data={},this.data=t,this.variations=(t.variations||[]).map(function(t){return new r(t)});}return t.prototype.id=function(){return this.data.id},t.prototype.googleId=function(){return this.data.googleId},t.prototype.name=function(){return this.data.name},t}();e.Experiment=o;var i=function(){function t(t){t&&(this.drafts=(t.drafts||[]).map(function(t){return new o(t)}),this.running=(t.running||[]).map(function(t){return new o(t)}));}return t.prototype.current=function(){return this.running.length>0?this.running[0]:null},t.prototype.refFromCookie=function(t){if(!t||""===t.trim())return null;var e=t.trim().split(" ");if(e.length<2)return null;var n=e[0],r=parseInt(e[1],10),o=this.running.filter(function(t){return t.googleId()===n&&t.variations.length>r})[0];return o?o.variations[r].ref():null},t}();e.Experiments=i;},function(t,e,n){e.__esModule=!0;var r=function(){function t(t,e){this.id=t,this.api=e,this.fields={};}return t.prototype.set=function(t,e){return this.fields[t]=e,this},t.prototype.ref=function(t){return this.set("ref",t)},t.prototype.query=function(t){return this.set("q",t)},t.prototype.pageSize=function(t){return this.set("pageSize",t)},t.prototype.fetch=function(t){return this.set("fetch",t)},t.prototype.fetchLinks=function(t){return this.set("fetchLinks",t)},t.prototype.lang=function(t){return this.set("lang",t)},t.prototype.page=function(t){return this.set("page",t)},t.prototype.after=function(t){return this.set("after",t)},t.prototype.orderings=function(t){return this.set("orderings",t)},t.prototype.url=function(){var e=this;return this.api.get().then(function(n){return t.toSearchForm(e,n).url()})},t.prototype.submit=function(e){var n=this;return this.api.get().then(function(r){return t.toSearchForm(n,r).submit(e)})},t.toSearchForm=function(t,e){var n=e.form(t.id);if(n)return Object.keys(t.fields).reduce(function(e,n){var r=t.fields[n];return "q"===n?e.query(r):"pageSize"===n?e.pageSize(r):"fetch"===n?e.fetch(r):"fetchLinks"===n?e.fetchLinks(r):"lang"===n?e.lang(r):"page"===n?e.page(r):"after"===n?e.after(r):"orderings"===n?e.orderings(r):e.set(n,r)},n);throw new Error("Unable to access to form "+t.id)},t}();e.LazySearchForm=r;var o=function(){function t(t,e){this.httpClient=e,this.form=t,this.data={};for(var n in t.fields)t.fields[n].default&&(this.data[n]=[t.fields[n].default]);}return t.prototype.set=function(t,e){var n=this.form.fields[t];if(!n)throw new Error("Unknown field "+t);var r=""===e||void 0===e?null:e,o=this.data[t]||[];return o=n.multiple?r?o.concat([r]):o:r?[r]:o,this.data[t]=o,this},t.prototype.ref=function(t){return this.set("ref",t)},t.prototype.query=function(t){if("string"==typeof t)return this.query([t]);if(t instanceof Array)return this.set("q","["+t.join("")+"]");throw new Error("Invalid query : "+t)},t.prototype.pageSize=function(t){return this.set("pageSize",t)},t.prototype.fetch=function(t){var e=t instanceof Array?t.join(","):t;return this.set("fetch",e)},t.prototype.fetchLinks=function(t){var e=t instanceof Array?t.join(","):t;return this.set("fetchLinks",e)},t.prototype.lang=function(t){return this.set("lang",t)},t.prototype.page=function(t){return this.set("page",t)},t.prototype.after=function(t){return this.set("after",t)},t.prototype.orderings=function(t){return t?this.set("orderings","["+t.join(",")+"]"):this},t.prototype.url=function(){var t=this.form.action;if(this.data){var e=t.indexOf("?")>-1?"&":"?";for(var n in this.data)if(this.data.hasOwnProperty(n)){var r=this.data[n];if(r)for(var o=0;o<r.length;o++)t+=e+n+"="+encodeURIComponent(r[o]),e="&";}}return t},t.prototype.submit=function(t){return this.httpClient.cachedRequest(this.url()).then(function(e){return t&&t(null,e),e}).catch(function(e){throw t&&t(e),e})},t}();e.SearchForm=o;},function(t,e,n){e.__esModule=!0;var r=n(4),o=n(10),i=function(){function t(t,e){if(this.options=e||{},this.url=t,this.options.accessToken){var n="access_token="+this.options.accessToken;this.url+=(t.indexOf("?")>-1?"&":"?")+n;}this.apiDataTTL=this.options.apiDataTTL||5,this.httpClient=new o.default(this.options.requestHandler,this.options.apiCache,this.options.proxyAgent);}return t.prototype.get=function(t){var e=this;return this.httpClient.cachedRequest(this.url,{ttl:this.apiDataTTL}).then(function(n){var o=new r.default(n,e.httpClient,e.options);return t&&t(null,o),o}).catch(function(e){throw t&&t(e),e})},t}();e.default=i;},function(t,e,n){e.__esModule=!0;var r=n(1),o=n(2),i=n(0),u=n(9);e.PREVIEW_COOKIE="io.prismic.preview",e.EXPERIMENT_COOKIE="io.prismic.experiment";var a=function(){function t(t,e,n){this.data=t,this.masterRef=t.refs.filter(function(t){return t.isMasterRef})[0],this.experiments=new r.Experiments(t.experiments),this.bookmarks=t.bookmarks,this.httpClient=e,this.options=n,this.refs=t.refs,this.tags=t.tags,this.types=t.types;}return t.prototype.form=function(t){var e=this.data.forms[t];return e?new o.SearchForm(e,this.httpClient):null},t.prototype.everything=function(){var t=this.form("everything");if(!t)throw new Error("Missing everything form");return t},t.prototype.master=function(){return this.masterRef.ref},t.prototype.ref=function(t){var e=this.data.refs.filter(function(e){return e.label===t})[0];return e?e.ref:null},t.prototype.currentExperiment=function(){return this.experiments.current()},t.prototype.query=function(t,n,r){void 0===r&&(r=function(){});var o="function"==typeof n?{options:{},callback:n}:{options:n||{},callback:r},i=o.options,a=o.callback,f=this.everything();for(var s in i)f=f.set(s,i[s]);if(!i.ref){var c="";this.options.req?c=this.options.req.headers.cookie||"":"undefined"!=typeof window&&window.document&&(c=window.document.cookie||"");var h=u.default.parse(c),p=h[e.PREVIEW_COOKIE],l=this.experiments.refFromCookie(h[e.EXPERIMENT_COOKIE]);f=f.ref(p||l||this.masterRef.ref);}return t&&f.query(t),f.submit(a)},t.prototype.queryFirst=function(t,e,n){var r="function"==typeof e?{options:{},callback:e}:{options:e||{},callback:n||function(){}},o=r.options,i=r.callback;return o.page=1,o.pageSize=1,this.query(t,o).then(function(t){var e=t&&t.results&&t.results[0];return i(null,e),e}).catch(function(t){throw i(t),t})},t.prototype.getByID=function(t,e,n){var r=e||{};return r.lang||(r.lang="*"),this.queryFirst(i.default.at("document.id",t),r,n)},t.prototype.getByIDs=function(t,e,n){var r=e||{};return r.lang||(r.lang="*"),this.query(i.default.in("document.id",t),r,n)},t.prototype.getByUID=function(t,e,n,r){var o=n||{};return o.lang||(o.lang="*"),this.queryFirst(i.default.at("my."+t+".uid",e),o,r)},t.prototype.getSingle=function(t,e,n){var r=e||{};return this.queryFirst(i.default.at("document.type",t),r,n)},t.prototype.getBookmark=function(t,e,n){var r=this.data.bookmarks[t];return r?this.getByID(r,e,n):Promise.reject("Error retrieving bookmarked id")},t.prototype.previewSession=function(t,e,n,r){var o=this;return this.httpClient.request(t).then(function(i){return i.mainDocument?o.getByID(i.mainDocument,{ref:t}).then(function(t){if(t){var o=e(t);return r&&r(null,o),o}return r&&r(null,n),n}):(r&&r(null,n),Promise.resolve(n))}).catch(function(t){throw r&&r(t),t})},t}();e.default=a;},function(t,e,n){n(6),t.exports=n(7);},function(e,n){e.exports=t;},function(t,e,n){var r,o=n(0),i=n(1),u=n(8),a=n(3),f=n(4);!function(t){function e(t,e){return new u.DefaultClient(t,e)}function n(t,e){return u.DefaultClient.getApi(t,e)}function r(t,e){return n(t,e)}t.experimentCookie=f.EXPERIMENT_COOKIE,t.previewCookie=f.PREVIEW_COOKIE,t.Predicates=o.default,t.Experiments=i.Experiments,t.Api=a.default,t.client=e,t.getApi=n,t.api=r;}(r||(r={})),t.exports=r;},function(t,e,n){e.__esModule=!0;var r=n(2),o=n(3),i=function(){function t(t,e){this.api=new o.default(t,e);}return t.prototype.getApi=function(){return this.api.get()},t.prototype.everything=function(){return this.form("everything")},t.prototype.form=function(t){return new r.LazySearchForm(t,this.api)},t.prototype.query=function(t,e,n){return this.getApi().then(function(r){return r.query(t,e,n)})},t.prototype.queryFirst=function(t,e,n){return this.getApi().then(function(r){return r.queryFirst(t,e,n)})},t.prototype.getByID=function(t,e,n){return this.getApi().then(function(r){return r.getByID(t,e,n)})},t.prototype.getByIDs=function(t,e,n){return this.getApi().then(function(r){return r.getByIDs(t,e,n)})},t.prototype.getByUID=function(t,e,n,r){return this.getApi().then(function(o){return o.getByUID(t,e,n,r)})},t.prototype.getSingle=function(t,e,n){return this.getApi().then(function(r){return r.getSingle(t,e,n)})},t.prototype.getBookmark=function(t,e,n){return this.getApi().then(function(r){return r.getBookmark(t,e,n)})},t.prototype.previewSession=function(t,e,n,r){return this.getApi().then(function(o){return o.previewSession(t,e,n,r)})},t.getApi=function(t,e){return new o.default(t,e).get()},t}();e.DefaultClient=i;},function(t,e,n){function r(t,e){try{return e(t)}catch(e){return t}}function o(t,e){if("string"!=typeof t)throw new TypeError("argument str must be a string");var n={},o=e||{},u=o.decode||i;return t.split(/; */).forEach(function(t){var e=t.indexOf("=");if(!(e<0)){var o=t.substr(0,e).trim(),i=t.substr(++e,t.length).trim();'"'==i[0]&&(i=i.slice(1,-1)),void 0==n[o]&&(n[o]=r(i,u));}}),n}e.__esModule=!0;var i=decodeURIComponent;e.default={parse:o};},function(t,e,n){e.__esModule=!0;var r=n(11),o=n(13),i=function(){function t(t,e,n){this.requestHandler=t||new o.DefaultRequestHandler({proxyAgent:n}),this.cache=e||new r.DefaultApiCache;}return t.prototype.request=function(t,e){var n=this;return new Promise(function(r,o){n.requestHandler.request(t,function(t,n,i,u){t?(o(t),e&&e(t,null,i,u)):n&&(r(n),e&&e(null,n,i,u));});})},t.prototype.cachedRequest=function(t,e){var n=this,r=e||{},o=function(e){var o=r.cacheKey||t;n.cache.get(o,function(i,u){i||u?e(i,u):n.request(t,function(t,i,u,a){if(t)e(t,null);else{var f=a||r.ttl;f&&n.cache.set(o,i,f,e),e(null,i);}});});};return new Promise(function(t,e){o(function(n,r){n&&e(n),r&&t(r);});})},t}();e.default=i;},function(t,e,n){e.__esModule=!0;var r=n(12),o=function(){function t(t){void 0===t&&(t=1e3),this.lru=r.MakeLRUCache(t);}return t.prototype.isExpired=function(t){var e=this.lru.get(t,!1);return !!e&&0!==e.expiredIn&&e.expiredIn<Date.now()},t.prototype.get=function(t,e){var n=this.lru.get(t,!1);n&&!this.isExpired(t)?e(null,n.data):e&&e(null);},t.prototype.set=function(t,e,n,r){this.lru.remove(t),this.lru.put(t,{data:e,expiredIn:n?Date.now()+1e3*n:0}),r&&r(null);},t.prototype.remove=function(t,e){this.lru.remove(t),e&&e(null);},t.prototype.clear=function(t){this.lru.removeAll(),t&&t(null);},t}();e.DefaultApiCache=o;},function(t,e,n){function r(t){return new o(t)}function o(t){this.size=0,this.limit=t,this._keymap={};}e.__esModule=!0,e.MakeLRUCache=r,o.prototype.put=function(t,e){var n={key:t,value:e};if(this._keymap[t]=n,this.tail?(this.tail.newer=n,n.older=this.tail):this.head=n,this.tail=n,this.size===this.limit)return this.shift();this.size++;},o.prototype.shift=function(){var t=this.head;return t&&(this.head.newer?(this.head=this.head.newer,this.head.older=void 0):this.head=void 0,t.newer=t.older=void 0,delete this._keymap[t.key]),console.log("purging ",t.key),t},o.prototype.get=function(t,e){var n=this._keymap[t];if(void 0!==n)return n===this.tail?e?n:n.value:(n.newer&&(n===this.head&&(this.head=n.newer),n.newer.older=n.older),n.older&&(n.older.newer=n.newer),n.newer=void 0,n.older=this.tail,this.tail&&(this.tail.newer=n),this.tail=n,e?n:n.value)},o.prototype.find=function(t){return this._keymap[t]},o.prototype.set=function(t,e){var n,r=this.get(t,!0);return r?(n=r.value,r.value=e):(n=this.put(t,e))&&(n=n.value),n},o.prototype.remove=function(t){var e=this._keymap[t];if(e)return delete this._keymap[e.key],e.newer&&e.older?(e.older.newer=e.newer,e.newer.older=e.older):e.newer?(e.newer.older=void 0,this.head=e.newer):e.older?(e.older.newer=void 0,this.tail=e.older):this.head=this.tail=void 0,this.size--,e.value},o.prototype.removeAll=function(){this.head=this.tail=void 0,this.size=0,this._keymap={};},"function"==typeof Object.keys?o.prototype.keys=function(){return Object.keys(this._keymap)}:o.prototype.keys=function(){var t=[];for(var e in this._keymap)t.push(e);return t},o.prototype.forEach=function(t,e,n){var r;if(!0===e?(n=!0,e=void 0):"object"!=typeof e&&(e=this),n)for(r=this.tail;r;)t.call(e,r.key,r.value,this),r=r.older;else for(r=this.head;r;)t.call(e,r.key,r.value,this),r=r.newer;},o.prototype.toString=function(){for(var t="",e=this.head;e;)t+=String(e.key)+":"+e.value,(e=e.newer)&&(t+=" < ");return t};},function(t,e,n){function r(t,e,n){var r={headers:{Accept:"application/json"}};e&&e.proxyAgent&&(r.agent=e.proxyAgent),fetch(t,r).then(function(e){if(~~(e.status/100!=2)){var r=new Error("Unexpected status code ["+e.status+"] on URL "+t);throw r.status=e.status,r}return e.json().then(function(t){var r=e.headers.get("cache-control"),o=r?/max-age=(\d+)/.exec(r):null,i=o?parseInt(o[1],10):void 0;n(null,t,e,i);})}).catch(n);}function o(t){if(a.length>0&&u<i){u++;var e=a.shift();e&&r(e.url,t,function(n,r,i,a){u--,e.callback(n,r,i,a),o(t);});}}e.__esModule=!0;var i=20,u=0,a=[],f=function(){function t(t){this.options=t||{};}return t.prototype.request=function(t,e){a.push({url:t,callback:e}),o(this.options);},t}();e.DefaultRequestHandler=f;}])});
	});

	var prismic = unwrapExports(prismicJavascript_min);
	var prismicJavascript_min_1 = prismicJavascript_min.PrismicJS;

	//
	//
	//
	//

	var script = {
	  name: 'PrismicEditButton',
	  props: {
	    documentId: {
	      type: String,
	      required: true
	    }
	  },
	  computed: {
	    editButtonComponent: function editButtonComponent() {
	      if (!this.documentId) {
	        return null;
	      }

	      return {
	        template: '<div data-wio-id="' + this.documentId + '"/>'
	      };
	    }
	  },
	  watch: {
	    documentId: function documentId() {
	      if (window.PrismicToolbar) {
	        window.PrismicToolbar.setupEditButton();
	      } else {
	        console.error('If you want to add a Prismic Edit Button in your website, you need to have included the Prismic Toolbar script, please read the documentation at https://prismic.io/docs/vuejs/beyond-the-api/in-website-edit-button');
	      }
	    }
	  }
	};

	var __vue_script__ = script;

	/* template */
	var __vue_render__ = function __vue_render__() {
	  var _vm = this;
	  var _h = _vm.$createElement;
	  var _c = _vm._self._c || _h;
	  return _c(_vm.editButtonComponent, { tag: "component" });
	};
	var __vue_staticRenderFns__ = [];
	__vue_render__._withStripped = true;

	var __vue_template__ = typeof __vue_render__ !== 'undefined' ? { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ } : {};
	/* style */
	var __vue_inject_styles__ = undefined;
	/* scoped */
	var __vue_scope_id__ = undefined;
	/* module identifier */
	var __vue_module_identifier__ = undefined;
	/* functional template */
	var __vue_is_functional_template__ = false;
	/* component normalizer */
	function __vue_normalize__(template, style, script$$1, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
	  var component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

	  {
	    component.__file = "/Users/jbdebiasio/dev/prismic-vue/src/components/EditButton.vue";
	  }

	  if (!component.render) {
	    component.render = template.render;
	    component.staticRenderFns = template.staticRenderFns;
	    component._compiled = true;

	    if (functional) component.functional = true;
	  }

	  component._scopeId = scope;

	  return component;
	}
	/* style inject */
	function __vue_create_injector__() {
	  var head = document.head || document.getElementsByTagName('head')[0];
	  var styles = __vue_create_injector__.styles || (__vue_create_injector__.styles = {});
	  var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

	  return function addStyle(id, css) {
	    if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) return; // SSR styles are present.

	    var group = isOldIE ? css.media || 'default' : id;
	    var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

	    if (!style.ids.includes(id)) {
	      var code = css.source;
	      var index = style.ids.length;

	      style.ids.push(id);

	      if (isOldIE) {
	        style.element = style.element || document.querySelector('style[data-group=' + group + ']');
	      }

	      if (!style.element) {
	        var el = style.element = document.createElement('style');
	        el.type = 'text/css';

	        if (css.media) el.setAttribute('media', css.media);
	        if (isOldIE) {
	          el.setAttribute('data-group', group);
	          el.setAttribute('data-next-index', '0');
	        }

	        head.appendChild(el);
	      }

	      if (isOldIE) {
	        index = parseInt(style.element.getAttribute('data-next-index'));
	        style.element.setAttribute('data-next-index', index + 1);
	      }

	      if (style.element.styleSheet) {
	        style.parts.push(code);
	        style.element.styleSheet.cssText = style.parts.filter(Boolean).join('\n');
	      } else {
	        var textNode = document.createTextNode(code);
	        var nodes = style.element.childNodes;
	        if (nodes[index]) style.element.removeChild(nodes[index]);
	        if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
	      }
	    }
	  };
	}
	/* style inject SSR */

	var EditButton = __vue_normalize__(__vue_template__, __vue_inject_styles__, typeof __vue_script__ === 'undefined' ? {} : __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, typeof __vue_create_injector__ !== 'undefined' ? __vue_create_injector__ : function () {}, typeof __vue_create_injector_ssr__ !== 'undefined' ? __vue_create_injector_ssr__ : function () {});

	//
	//
	//
	//

	var script$1 = {
	  name: 'PrismicEmbed',
	  props: {
	    field: {
	      required: true
	    }
	  },
	  computed: {
	    EmbedComponent: function EmbedComponent() {
	      if (!this.field) {
	        return null;
	      }

	      var urlAttr = this.field.embed_url ? 'data-oembed="' + this.field.embed_url + '"' : '';
	      var typeAttr = this.field.type ? 'data-oembed-type="' + this.field.type + '"' : '';
	      var providerNameAttr = this.field.provider_name ? 'data-oembed-provider="' + this.field.provider_name + '"' : '';

	      return {
	        template: '\n          <div ' + urlAttr + ' ' + typeAttr + ' ' + providerNameAttr + '>\n            ' + this.field.html + '\n          </div>\n        '
	      };
	    }
	  }
	};

	var __vue_script__$1 = script$1;

	/* template */
	var __vue_render__$1 = function __vue_render__() {
	  var _vm = this;
	  var _h = _vm.$createElement;
	  var _c = _vm._self._c || _h;
	  return _c(_vm.EmbedComponent, { tag: "component" });
	};
	var __vue_staticRenderFns__$1 = [];
	__vue_render__$1._withStripped = true;

	var __vue_template__$1 = typeof __vue_render__$1 !== 'undefined' ? { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 } : {};
	/* style */
	var __vue_inject_styles__$1 = undefined;
	/* scoped */
	var __vue_scope_id__$1 = undefined;
	/* module identifier */
	var __vue_module_identifier__$1 = undefined;
	/* functional template */
	var __vue_is_functional_template__$1 = false;
	/* component normalizer */
	function __vue_normalize__$1(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
	  var component = (typeof script === 'function' ? script.options : script) || {};

	  {
	    component.__file = "/Users/jbdebiasio/dev/prismic-vue/src/components/Embed.vue";
	  }

	  if (!component.render) {
	    component.render = template.render;
	    component.staticRenderFns = template.staticRenderFns;
	    component._compiled = true;

	    if (functional) component.functional = true;
	  }

	  component._scopeId = scope;

	  return component;
	}
	/* style inject */
	function __vue_create_injector__$1() {
	  var head = document.head || document.getElementsByTagName('head')[0];
	  var styles = __vue_create_injector__$1.styles || (__vue_create_injector__$1.styles = {});
	  var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

	  return function addStyle(id, css) {
	    if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) return; // SSR styles are present.

	    var group = isOldIE ? css.media || 'default' : id;
	    var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

	    if (!style.ids.includes(id)) {
	      var code = css.source;
	      var index = style.ids.length;

	      style.ids.push(id);

	      if (isOldIE) {
	        style.element = style.element || document.querySelector('style[data-group=' + group + ']');
	      }

	      if (!style.element) {
	        var el = style.element = document.createElement('style');
	        el.type = 'text/css';

	        if (css.media) el.setAttribute('media', css.media);
	        if (isOldIE) {
	          el.setAttribute('data-group', group);
	          el.setAttribute('data-next-index', '0');
	        }

	        head.appendChild(el);
	      }

	      if (isOldIE) {
	        index = parseInt(style.element.getAttribute('data-next-index'));
	        style.element.setAttribute('data-next-index', index + 1);
	      }

	      if (style.element.styleSheet) {
	        style.parts.push(code);
	        style.element.styleSheet.cssText = style.parts.filter(Boolean).join('\n');
	      } else {
	        var textNode = document.createTextNode(code);
	        var nodes = style.element.childNodes;
	        if (nodes[index]) style.element.removeChild(nodes[index]);
	        if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
	      }
	    }
	  };
	}
	/* style inject SSR */

	var Embed = __vue_normalize__$1(__vue_template__$1, __vue_inject_styles__$1, typeof __vue_script__$1 === 'undefined' ? {} : __vue_script__$1, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, typeof __vue_create_injector__$1 !== 'undefined' ? __vue_create_injector__$1 : function () {}, typeof __vue_create_injector_ssr__ !== 'undefined' ? __vue_create_injector_ssr__ : function () {});

	//
	//
	//
	//

	var script$2 = {
	  name: 'PrismicImage',
	  props: {
	    field: {
	      required: true
	    }
	  },
	  computed: {
	    imageComponent: function imageComponent() {
	      if (!this.field) {
	        return null;
	      }

	      var altAttr = this.field.alt ? 'alt="' + this.field.alt + '"' : '';
	      var copyrightAttr = this.field.copyright ? 'copyright="' + this.field.copyright + '"' : '';

	      return {
	        template: '<img src="' + this.field.url + '" ' + altAttr + ' ' + copyrightAttr + '>'
	      };
	    }
	  }
	};

	var __vue_script__$2 = script$2;

	/* template */
	var __vue_render__$2 = function __vue_render__() {
	  var _vm = this;
	  var _h = _vm.$createElement;
	  var _c = _vm._self._c || _h;
	  return _c(_vm.imageComponent, { tag: "component" });
	};
	var __vue_staticRenderFns__$2 = [];
	__vue_render__$2._withStripped = true;

	var __vue_template__$2 = typeof __vue_render__$2 !== 'undefined' ? { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 } : {};
	/* style */
	var __vue_inject_styles__$2 = undefined;
	/* scoped */
	var __vue_scope_id__$2 = undefined;
	/* module identifier */
	var __vue_module_identifier__$2 = undefined;
	/* functional template */
	var __vue_is_functional_template__$2 = false;
	/* component normalizer */
	function __vue_normalize__$2(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
	  var component = (typeof script === 'function' ? script.options : script) || {};

	  {
	    component.__file = "/Users/jbdebiasio/dev/prismic-vue/src/components/Image.vue";
	  }

	  if (!component.render) {
	    component.render = template.render;
	    component.staticRenderFns = template.staticRenderFns;
	    component._compiled = true;

	    if (functional) component.functional = true;
	  }

	  component._scopeId = scope;

	  return component;
	}
	/* style inject */
	function __vue_create_injector__$2() {
	  var head = document.head || document.getElementsByTagName('head')[0];
	  var styles = __vue_create_injector__$2.styles || (__vue_create_injector__$2.styles = {});
	  var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

	  return function addStyle(id, css) {
	    if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) return; // SSR styles are present.

	    var group = isOldIE ? css.media || 'default' : id;
	    var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

	    if (!style.ids.includes(id)) {
	      var code = css.source;
	      var index = style.ids.length;

	      style.ids.push(id);

	      if (isOldIE) {
	        style.element = style.element || document.querySelector('style[data-group=' + group + ']');
	      }

	      if (!style.element) {
	        var el = style.element = document.createElement('style');
	        el.type = 'text/css';

	        if (css.media) el.setAttribute('media', css.media);
	        if (isOldIE) {
	          el.setAttribute('data-group', group);
	          el.setAttribute('data-next-index', '0');
	        }

	        head.appendChild(el);
	      }

	      if (isOldIE) {
	        index = parseInt(style.element.getAttribute('data-next-index'));
	        style.element.setAttribute('data-next-index', index + 1);
	      }

	      if (style.element.styleSheet) {
	        style.parts.push(code);
	        style.element.styleSheet.cssText = style.parts.filter(Boolean).join('\n');
	      } else {
	        var textNode = document.createTextNode(code);
	        var nodes = style.element.childNodes;
	        if (nodes[index]) style.element.removeChild(nodes[index]);
	        if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
	      }
	    }
	  };
	}
	/* style inject SSR */

	var Image = __vue_normalize__$2(__vue_template__$2, __vue_inject_styles__$2, typeof __vue_script__$2 === 'undefined' ? {} : __vue_script__$2, __vue_scope_id__$2, __vue_is_functional_template__$2, __vue_module_identifier__$2, typeof __vue_create_injector__$2 !== 'undefined' ? __vue_create_injector__$2 : function () {}, typeof __vue_create_injector_ssr__ !== 'undefined' ? __vue_create_injector_ssr__ : function () {});

	var prismicDom_min = createCommonjsModule(function (module, exports) {
	!function(t,n){module.exports=n();}(commonjsGlobal,function(){return function(t){function n(e){if(r[e])return r[e].exports;var a=r[e]={i:e,l:!1,exports:{}};return t[e].call(a.exports,a,a.exports,n),a.l=!0,a.exports}var r={};return n.m=t,n.c=r,n.i=function(t){return t},n.d=function(t,r,e){n.o(t,r)||Object.defineProperty(t,r,{configurable:!1,enumerable:!0,get:e});},n.n=function(t){var r=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(r,"a",r),r},n.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},n.p="",n(n.s=5)}([function(t,n,r){!function(n,r){t.exports=function(){return function(t){function n(e){if(r[e])return r[e].exports;var a=r[e]={i:e,l:!1,exports:{}};return t[e].call(a.exports,a,a.exports,n),a.l=!0,a.exports}var r={};return n.m=t,n.c=r,n.i=function(t){return t},n.d=function(t,r,e){n.o(t,r)||Object.defineProperty(t,r,{configurable:!1,enumerable:!0,get:e});},n.n=function(t){var r=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(r,"a",r),r},n.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},n.p="",n(n.s=3)}([function(t,n,r){function e(t){return t&&t.__esModule?t:{default:t}}var a=r(2),u=e(a),c=r(1),i=e(c);t.exports={Link:u.default,Date:i.default};},function(t,n,r){Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(t){if(!t)return null;var n=24==t.length?t.substring(0,22)+":"+t.substring(22,24):t;return new Date(n)};},function(t,n,r){Object.defineProperty(n,"__esModule",{value:!0}),n.default={url:function(t,n){return "Document"===t.link_type?n?n(t,t.isBroken):"":t.url}};},function(t,n,r){t.exports=r(0);}])}();}();},function(t,n,r){function e(t){return t&&t.__esModule?t:{default:t}}var a=r(0),u=e(a),c=r(2),i=e(c);t.exports={Date:u.default.Date,RichText:i.default,Link:u.default.Link};},function(t,n,r){function e(t){return t&&t.__esModule?t:{default:t}}function a(t,n,r,e,a){switch(n){case p.Elements.heading1:return c("h1",r,a);case p.Elements.heading2:return c("h2",r,a);case p.Elements.heading3:return c("h3",r,a);case p.Elements.heading4:return c("h4",r,a);case p.Elements.heading5:return c("h5",r,a);case p.Elements.heading6:return c("h6",r,a);case p.Elements.paragraph:return c("p",r,a);case p.Elements.preformatted:return i(r);case p.Elements.strong:return c("strong",r,a);case p.Elements.em:return c("em",r,a);case p.Elements.listItem:case p.Elements.oListItem:return c("li",r,a);case p.Elements.list:return c("ul",r,a);case p.Elements.oList:return c("ol",r,a);case p.Elements.image:return o(t,r);case p.Elements.embed:return s(r);case p.Elements.hyperlink:return f(t,r,a);case p.Elements.label:return l(r,a);case p.Elements.span:return v(e);default:return ""}}function u(t){return t.label?' class="'+t.label+'"':""}function c(t,n,r){return "<"+t+u(n)+">"+r.join("")+"</"+t+">"}function i(t){return "<pre"+u(t)+">"+(0, j.default)(t.text)+"</pre>"}function o(t,n){var r=n.linkTo?b.Link.url(n.linkTo,t):null,e=n.linkTo&&n.linkTo.target?'target="'+n.linkTo.target+'" rel="noopener"':"",a=[n.label||"","block-img"],u='<img src="'+n.url+'" alt="'+(n.alt||"")+'" copyright="'+(n.copyright||"")+'">';return '\n    <p class="'+a.join(" ")+'">\n      '+(r?"<a "+e+' href="'+r+'">'+u+"</a>":u)+"\n    </p>\n  "}function s(t){return '\n    <div data-oembed="'+t.oembed.embed_url+'"\n      data-oembed-type="'+t.oembed.type+'"\n      data-oembed-provider="'+t.oembed.provider_name+'"\n      '+u(t)+">\n          \n      "+t.oembed.html+"\n    </div>\n  "}function f(t,n,r){return "<a "+(n.data.target?'target="'+n.data.target+'" rel="noopener"':"")+' href="'+b.Link.url(n.data,t)+'">'+r.join("")+"</a>"}function l(t,n){return "<span "+u(t.data)+">"+n.join("")+"</span>"}function v(t){return t?(0, j.default)(t).replace(/\n/g,"<br />"):""}Object.defineProperty(n,"__esModule",{value:!0});var p=r(4),d=e(p),b=r(0),O=r(3),j=e(O);n.default={asText:function(t,n){return d.default.asText(t,n)},asHtml:function(t,n,r){return d.default.serialize(t,a.bind(null,n),r).join("")},Elements:p.Elements};},function(t,n,r){function e(t){var n=""+t,r=a.exec(n);if(!r)return n;var e,u="",c=0,i=0;for(c=r.index;c<n.length;c++){switch(n.charCodeAt(c)){case 34:e="&quot;";break;case 38:e="&amp;";break;case 39:e="&#39;";break;case 60:e="&lt;";break;case 62:e="&gt;";break;default:continue}i!==c&&(u+=n.substring(i,c)),i=c+1,u+=e;}return i!==c?u+n.substring(i,c):u}/*!
	 * escape-html
	 * Copyright(c) 2012-2013 TJ Holowaychuk
	 * Copyright(c) 2015 Andreas Lubbe
	 * Copyright(c) 2015 Tiancheng "Timothy" Gu
	 * MIT Licensed
	 */
	var a=/["'&<>]/;t.exports=e;},function(t,n,r){!function(n,r){t.exports=function(){return function(t){function n(e){if(r[e])return r[e].exports;var a=r[e]={i:e,l:!1,exports:{}};return t[e].call(a.exports,a,a.exports,n),a.l=!0,a.exports}var r={};return n.m=t,n.c=r,n.d=function(t,r,e){n.o(t,r)||Object.defineProperty(t,r,{configurable:!1,enumerable:!0,get:e});},n.n=function(t){var r=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(r,"a",r),r},n.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},n.p="",n(n.s=123)}([function(t,n,r){function e(t){return function n(r,e){switch(arguments.length){case 0:return n;case 1:return Object(u.a)(r)?n:Object(a.a)(function(n){return t(r,n)});default:return Object(u.a)(r)&&Object(u.a)(e)?n:Object(u.a)(r)?Object(a.a)(function(n){return t(n,e)}):Object(u.a)(e)?Object(a.a)(function(n){return t(r,n)}):t(r,e)}}}n.a=e;var a=r(1),u=r(27);},function(t,n,r){function e(t){return function n(r){return 0===arguments.length||Object(a.a)(r)?n:t.apply(this,arguments)}}n.a=e;var a=r(27);},function(t,n,r){function e(t){return function n(r,e,i){switch(arguments.length){case 0:return n;case 1:return Object(c.a)(r)?n:Object(u.a)(function(n,e){return t(r,n,e)});case 2:return Object(c.a)(r)&&Object(c.a)(e)?n:Object(c.a)(r)?Object(u.a)(function(n,r){return t(n,e,r)}):Object(c.a)(e)?Object(u.a)(function(n,e){return t(r,n,e)}):Object(a.a)(function(n){return t(r,e,n)});default:return Object(c.a)(r)&&Object(c.a)(e)&&Object(c.a)(i)?n:Object(c.a)(r)&&Object(c.a)(e)?Object(u.a)(function(n,r){return t(n,r,i)}):Object(c.a)(r)&&Object(c.a)(i)?Object(u.a)(function(n,r){return t(n,e,r)}):Object(c.a)(e)&&Object(c.a)(i)?Object(u.a)(function(n,e){return t(r,n,e)}):Object(c.a)(r)?Object(a.a)(function(n){return t(n,e,i)}):Object(c.a)(e)?Object(a.a)(function(n){return t(r,n,i)}):Object(c.a)(i)?Object(a.a)(function(n){return t(r,e,n)}):t(r,e,i)}}}n.a=e;var a=r(1),u=r(0),c=r(27);},function(t,n,r){function e(t,n,r){return function(){if(0===arguments.length)return r();var e=Array.prototype.slice.call(arguments,0),c=e.pop();if(!Object(a.a)(c)){for(var i=0;i<t.length;){if("function"==typeof c[t[i]])return c[t[i]].apply(c,e);i+=1;}if(Object(u.a)(c))return n.apply(null,e)(c)}return r.apply(this,arguments)}}n.a=e;var a=r(15),u=r(43);},function(t,n,r){n.a={init:function(){return this.xf["@@transducer/init"]()},result:function(t){return this.xf["@@transducer/result"](t)}};},function(t,n,r){var e=r(12),a=r(1),u=r(0),c=r(29),i=Object(u.a)(function(t,n){return 1===t?Object(a.a)(n):Object(e.a)(t,Object(c.a)(t,[],n))});n.a=i;},function(t,n,r){function e(t,n){return Object.prototype.hasOwnProperty.call(n,t)}n.a=e;},function(t,n,r){var e=r(0),a=r(3),u=r(30),c=r(8),i=r(134),o=r(5),s=r(13),f=Object(e.a)(Object(a.a)(["fantasy-land/map","map"],i.a,function(t,n){switch(Object.prototype.toString.call(n)){case"[object Function]":return Object(o.a)(n.length,function(){return t.call(this,n.apply(this,arguments))});case"[object Object]":return Object(c.a)(function(r,e){return r[e]=t(n[e]),r},{},Object(s.a)(n));default:return Object(u.a)(t,n)}}));n.a=f;},function(t,n,r){function e(t,n,r){for(var e=0,a=r.length;e<a;){if((n=t["@@transducer/step"](n,r[e]))&&n["@@transducer/reduced"]){n=n["@@transducer/value"];break}e+=1;}return t["@@transducer/result"](n)}function a(t,n,r){for(var e=r.next();!e.done;){if((n=t["@@transducer/step"](n,e.value))&&n["@@transducer/reduced"]){n=n["@@transducer/value"];break}e=r.next();}return t["@@transducer/result"](n)}function u(t,n,r,e){return t["@@transducer/result"](r[e](Object(s.a)(t["@@transducer/step"],t),n))}function c(t,n,r){if("function"==typeof t&&(t=Object(o.a)(t)),Object(i.a)(r))return e(t,n,r);if("function"==typeof r["fantasy-land/reduce"])return u(t,n,r,"fantasy-land/reduce");if(null!=r[f])return a(t,n,r[f]());if("function"==typeof r.next)return a(t,n,r);if("function"==typeof r.reduce)return u(t,n,r,"reduce");throw new TypeError("reduce: list must be array or iterable")}n.a=c;var i=r(31),o=r(66),s=r(67),f="undefined"!=typeof Symbol?Symbol.iterator:"@@iterator";},function(t,n,r){var e=r(0),a=r(157),u=Object(e.a)(function(t,n){return Object(a.a)(t,n,[],[])});n.a=u;},function(t,n,r){function e(t,n){t=t||[],n=n||[];var r,e=t.length,a=n.length,u=[];for(r=0;r<e;)u[u.length]=t[r],r+=1;for(r=0;r<a;)u[u.length]=n[r],r+=1;return u}n.a=e;},function(t,n,r){var e=r(23),a=r(2),u=Object(a.a)(Object(e.a)("slice",function(t,n,r){return Array.prototype.slice.call(r,t,n)}));n.a=u;},function(t,n,r){function e(t,n){switch(t){case 0:return function(){return n.apply(this,arguments)};case 1:return function(t){return n.apply(this,arguments)};case 2:return function(t,r){return n.apply(this,arguments)};case 3:return function(t,r,e){return n.apply(this,arguments)};case 4:return function(t,r,e,a){return n.apply(this,arguments)};case 5:return function(t,r,e,a,u){return n.apply(this,arguments)};case 6:return function(t,r,e,a,u,c){return n.apply(this,arguments)};case 7:return function(t,r,e,a,u,c,i){return n.apply(this,arguments)};case 8:return function(t,r,e,a,u,c,i,o){return n.apply(this,arguments)};case 9:return function(t,r,e,a,u,c,i,o,s){return n.apply(this,arguments)};case 10:return function(t,r,e,a,u,c,i,o,s,f){return n.apply(this,arguments)};default:throw new Error("First argument to _arity must be a non-negative integer no greater than ten")}}n.a=e;},function(t,n,r){var e=r(1),a=r(6),u=r(68),c=!{toString:null}.propertyIsEnumerable("toString"),i=["constructor","valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"],o=function(){return arguments.propertyIsEnumerable("length")}(),s=function(t,n){for(var r=0;r<t.length;){if(t[r]===n)return !0;r+=1;}return !1},f="function"!=typeof Object.keys||o?function(t){if(Object(t)!==t)return [];var n,r,e=[],f=o&&Object(u.a)(t);for(n in t)!Object(a.a)(n,t)||f&&"length"===n||(e[e.length]=n);if(c)for(r=i.length-1;r>=0;)n=i[r],Object(a.a)(n,t)&&!s(e,n)&&(e[e.length]=n),r-=1;return e}:function(t){return Object(t)!==t?[]:Object.keys(t)},l=Object(e.a)(f);n.a=l;},function(t,n,r){var e=r(2),a=r(8),u=Object(e.a)(a.a);n.a=u;},function(t,n,r){n.a=Array.isArray||function(t){return null!=t&&t.length>=0&&"[object Array]"===Object.prototype.toString.call(t)};},function(t,n,r){function e(t){return t&&t["@@transducer/reduced"]?t:{"@@transducer/value":t,"@@transducer/reduced":!0}}n.a=e;},function(t,n,r){var e=r(1),a=Object(e.a)(function(t){return function(){return t}});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return n>t?n:t});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){for(var r=n,e=0;e<t.length;){if(null==r)return;r=r[t[e]],e+=1;}return r});n.a=a;},function(t,n,r){function e(t,n){return Object(a.a)(n,t,0)>=0}n.a=e;var a=r(84);},function(t,n,r){var e=r(0),a=r(7),u=r(44),c=Object(e.a)(function(t,n){return Object(a.a)(Object(u.a)(t),n)});n.a=c;},function(t,n,r){function e(t){return "[object String]"===Object.prototype.toString.call(t)}n.a=e;},function(t,n,r){function e(t,n){return function(){var r=arguments.length;if(0===r)return n();var e=arguments[r-1];return Object(a.a)(e)||"function"!=typeof e[t]?n.apply(this,arguments):e[t].apply(e,Array.prototype.slice.call(arguments,0,r-1))}}n.a=e;var a=r(15);},function(t,n,r){var e=r(1),a=r(156),u=Object(e.a)(function(t){return Object(a.a)(t,[])});n.a=u;},function(t,n,r){var e=r(0),a=r(22),u=Object(e.a)(function(t,n){var r=t<0?n.length+t:t;return Object(a.a)(n)?n.charAt(r):n[r]});n.a=u;},function(t,n,r){var e=r(0),a=r(34),u=r(5),c=r(24),i=Object(e.a)(function(t,n){return Object(u.a)(t+1,function(){var r=arguments[t];if(null!=r&&Object(a.a)(r[n]))return r[n].apply(r,Array.prototype.slice.call(arguments,0,t));throw new TypeError(Object(c.a)(r)+' does not have a method named "'+n+'"')})});n.a=i;},function(t,n,r){function e(t){return null!=t&&"object"==typeof t&&!0===t["@@functional/placeholder"]}n.a=e;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return Number(t)+Number(n)});n.a=a;},function(t,n,r){function e(t,n,r){return function(){for(var c=[],i=0,o=t,s=0;s<n.length||i<arguments.length;){var f;s<n.length&&(!Object(u.a)(n[s])||i>=arguments.length)?f=n[s]:(f=arguments[i],i+=1),c[s]=f,Object(u.a)(f)||(o-=1),s+=1;}return o<=0?r.apply(this,c):Object(a.a)(o,e(t,c,r))}}n.a=e;var a=r(12),u=r(27);},function(t,n,r){function e(t,n){for(var r=0,e=n.length,a=Array(e);r<e;)a[r]=t(n[r]),r+=1;return a}n.a=e;},function(t,n,r){var e=r(1),a=r(15),u=r(22),c=Object(e.a)(function(t){return !!Object(a.a)(t)||!!t&&"object"==typeof t&&!Object(u.a)(t)&&(1===t.nodeType?!!t.length:0===t.length||t.length>0&&t.hasOwnProperty(0)&&t.hasOwnProperty(t.length-1))});n.a=c;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){var e={};for(var a in r)e[a]=r[a];return e[t]=n,e});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){switch(t){case 0:return function(){return n.call(this)};case 1:return function(t){return n.call(this,t)};case 2:return function(t,r){return n.call(this,t,r)};case 3:return function(t,r,e){return n.call(this,t,r,e)};case 4:return function(t,r,e,a){return n.call(this,t,r,e,a)};case 5:return function(t,r,e,a,u){return n.call(this,t,r,e,a,u)};case 6:return function(t,r,e,a,u,c){return n.call(this,t,r,e,a,u,c)};case 7:return function(t,r,e,a,u,c,i){return n.call(this,t,r,e,a,u,c,i)};case 8:return function(t,r,e,a,u,c,i,o){return n.call(this,t,r,e,a,u,c,i,o)};case 9:return function(t,r,e,a,u,c,i,o,s){return n.call(this,t,r,e,a,u,c,i,o,s)};case 10:return function(t,r,e,a,u,c,i,o,s,f){return n.call(this,t,r,e,a,u,c,i,o,s,f)};default:throw new Error("First argument to nAry must be a non-negative integer no greater than ten")}});n.a=a;},function(t,n,r){function e(t){return "[object Function]"===Object.prototype.toString.call(t)}n.a=e;},function(t,n,r){var e=r(1),a=r(76),u=Object(e.a)(function(t){return Object(a.a)(t.length,t)});n.a=u;},function(t,n,r){var e=r(1),a=r(22),u=Object(e.a)(function(t){return Object(a.a)(t)?t.split("").reverse().join(""):Array.prototype.slice.call(t,0).reverse()});n.a=u;},function(t,n,r){function e(t,n,r){for(var e=0,a=r.length;e<a;){if(t(n,r[e]))return !0;e+=1;}return !1}n.a=e;},function(t,n,r){var e=r(86),a=r(0),u=r(53),c=Object(a.a)(function(t,n){return Object(u.a)(Object(e.a)(t),n)});n.a=c;},function(t,n,r){var e=r(29),a=r(3),u=r(6),c=r(8),i=r(167),o=Object(e.a)(4,[],Object(a.a)([],i.a,function(t,n,r,e){return Object(c.a)(function(e,a){var c=r(a);return e[c]=t(Object(u.a)(c,e)?e[c]:n,a),e},{},e)}));n.a=o;},function(t,n,r){var e=r(1),a=r(5),u=Object(e.a)(function(t){return Object(a.a)(t.length,function(n,r){var e=Array.prototype.slice.call(arguments,0);return e[0]=r,e[1]=n,t.apply(this,e)})});n.a=u;},function(t,n,r){var e=r(0),a=r(7),u=Object(e.a)(function(t,n){return function(r){return function(e){return Object(a.a)(function(t){return n(t,e)},r(t(e)))}}});n.a=u;},function(t,n,r){var e=r(2),a=r(55),u=r(62),c=Object(e.a)(function t(n,r,e){return Object(u.a)(function(r,e,u){return Object(a.a)(e)&&Object(a.a)(u)?t(n,e,u):n(r,e,u)},r,e)});n.a=c;},function(t,n,r){function e(t){return "function"==typeof t["@@transducer/step"]}n.a=e;},function(t,n,r){var e=r(0),a=r(19),u=Object(e.a)(function(t,n){return Object(a.a)([t],n)});n.a=u;},function(t,n,r){var e=r(10),a=r(0),u=r(8),c=r(7),i=Object(a.a)(function(t,n){return "function"==typeof n["fantasy-land/ap"]?n["fantasy-land/ap"](t):"function"==typeof t.ap?t.ap(n):"function"==typeof t?function(r){return t(r)(n(r))}:Object(u.a)(function(t,r){return Object(e.a)(t,Object(c.a)(r,n))},[],t)});n.a=i;},function(t,n,r){n.a=Number.isInteger||function(t){return t<<0===t};},function(t,n,r){var e=r(1),a=r(5),u=Object(e.a)(function(t){return Object(a.a)(t.length,t)});n.a=u;},function(t,n,r){var e=r(0),a=r(3),u=r(77),c=r(146),i=r(7),o=Object(e.a)(Object(a.a)(["fantasy-land/chain","chain"],c.a,function(t,n){return "function"==typeof n?function(r){return t(n(r))(r)}:Object(u.a)(!1)(Object(i.a)(t,n))}));n.a=o;},function(t,n,r){var e=r(1),a=Object(e.a)(function(t){return null===t?"Null":void 0===t?"Undefined":Object.prototype.toString.call(t).slice(8,-1)});n.a=a;},function(t,n,r){function e(){if(0===arguments.length)throw new Error("compose requires at least one argument");return a.a.apply(this,Object(u.a)(arguments))}n.a=e;var a=r(81),u=r(36);},function(t,n,r){var e=r(23),a=r(1),u=r(11),c=Object(a.a)(Object(e.a)("tail",Object(u.a)(1,1/0)));n.a=c;},function(t,n,r){var e=r(0),a=r(15),u=r(34),c=r(22),i=r(24),o=Object(e.a)(function(t,n){if(Object(a.a)(t)){if(Object(a.a)(n))return t.concat(n);throw new TypeError(Object(i.a)(n)+" is not an array")}if(Object(c.a)(t)){if(Object(c.a)(n))return t+n;throw new TypeError(Object(i.a)(n)+" is not a string")}if(null!=t&&Object(u.a)(t["fantasy-land/concat"]))return t["fantasy-land/concat"](n);if(null!=t&&Object(u.a)(t.concat))return t.concat(n);throw new TypeError(Object(i.a)(t)+' does not have a method named "concat" or "fantasy-land/concat"')});n.a=o;},function(t,n,r){var e=r(0),a=r(3),u=r(54),c=r(55),i=r(8),o=r(162),s=r(13),f=Object(e.a)(Object(a.a)(["filter"],o.a,function(t,n){return Object(c.a)(n)?Object(i.a)(function(r,e){return t(n[e])&&(r[e]=n[e]),r},{},Object(s.a)(n)):Object(u.a)(t,n)}));n.a=f;},function(t,n,r){function e(t,n){for(var r=0,e=n.length,a=[];r<e;)t(n[r])&&(a[a.length]=n[r]),r+=1;return a}n.a=e;},function(t,n,r){function e(t){return "[object Object]"===Object.prototype.toString.call(t)}n.a=e;},function(t,n,r){var e=r(2),a=r(65),u=r(17),c=Object(e.a)(function(t,n,r){return Object(a.a)(Object(u.a)(n),t,r)});n.a=c;},function(t,n,r){var e=r(0),a=r(3),u=r(175),c=r(11),i=Object(e.a)(Object(a.a)(["take"],u.a,function(t,n){return Object(c.a)(0,t<0?1/0:t,n)}));n.a=i;},function(t,n,r){var e=r(1),a=r(59),u=Object(e.a)(a.a);n.a=u;},function(t,n,r){function e(t){return t}n.a=e;},function(t,n,r){var e=r(58),a=r(101),u=Object(a.a)(e.a);n.a=u;},function(t,n,r){var e=r(220);n.a="function"==typeof Object.assign?Object.assign:e.a;},function(t,n,r){var e=r(2),a=r(6),u=Object(e.a)(function(t,n,r){var e,u={};for(e in n)Object(a.a)(e,n)&&(u[e]=Object(a.a)(e,r)?t(e,n[e],r[e]):n[e]);for(e in r)Object(a.a)(e,r)&&!Object(a.a)(e,u)&&(u[e]=r[e]);return u});n.a=u;},function(t,n,r){n.__esModule=!0,n.NODE_TYPES={heading1:"heading1",heading2:"heading2",heading3:"heading3",heading4:"heading4",heading5:"heading5",heading6:"heading6",paragraph:"paragraph",preformatted:"preformatted",strong:"strong",em:"em",listItem:"list-item",oListItem:"o-list-item",list:"group-list-item",oList:"group-o-list-item",image:"image",embed:"embed",hyperlink:"hyperlink",label:"label",span:"span"},n.PRIORITIES=(e={},e[n.NODE_TYPES.heading1]=4,e[n.NODE_TYPES.heading2]=4,e[n.NODE_TYPES.heading3]=4,e[n.NODE_TYPES.heading4]=4,e[n.NODE_TYPES.heading5]=4,e[n.NODE_TYPES.heading6]=4,e[n.NODE_TYPES.paragraph]=3,e[n.NODE_TYPES.preformatted]=5,e[n.NODE_TYPES.strong]=6,e[n.NODE_TYPES.em]=6,e[n.NODE_TYPES.oList]=1,e[n.NODE_TYPES.list]=1,e[n.NODE_TYPES.listItem]=1,e[n.NODE_TYPES.oListItem]=1,e[n.NODE_TYPES.image]=1,e[n.NODE_TYPES.embed]=1,e[n.NODE_TYPES.hyperlink]=3,e[n.NODE_TYPES.label]=4,e[n.NODE_TYPES.span]=7,e);var e;},function(t,n,r){function e(t){return t.sort(function(t,n){if(t.isParentOf(n))return -1;if(n.isParentOf(t))return 1;var r=O.PRIORITIES[t.type]-O.PRIORITIES[n.type];return 0===r?t.text.length-n.text.length:r})}function a(t,n,r){return r.start<n.start?{inner:j.SpanNode.slice(r,n.start,r.end,t),outer:j.SpanNode.slice(r,r.start,n.start,t)}:r.end>n.end?{inner:j.SpanNode.slice(r,r.start,n.end,t),outer:j.SpanNode.slice(r,n.end,r.end,t)}:{inner:r}}function u(t,n){var r=n.others.reduce(function(r,e){var u=r.inner,c=r.outer,i=a(t,n.elected,e);return {inner:u.concat(i.inner),outer:i.outer?c.concat(i.outer):c}},{inner:[],outer:[]}),e=r.inner,u=r.outer;return [n.elected.setChildren(f(t,e,n.elected.boundaries()))].concat(l(t,u))}function c(t,n){return n.reduce(function(n,r){var e=p.last(n);if(e){if(e.some(function(t){return t.isParentOf(r)}))return p.init(n).concat([e.concat(r)]);var a=p.last(e);return a&&t(a,r)?p.init(n).concat([e.concat(r)]):n.concat([[r]])}return [[r]]},[])}function i(t){var n=function(t,n){return t.start-n.start},r=function(t,n){return t.end-n.end},e=p.sortWith([n,r],t);return c(function(t,n){return t.end>=n.start},e)}function o(t){if(0===t.length)throw new Error("Unable to elect node on empty list");var n=e(t);return {elected:n[0],others:n.slice(1)}}function s(t,n,r){return n.reduce(function(e,a,u){var c=[],i=0===u&&a.start>r.lower,o=u===n.length-1&&r.upper>a.end;if(i){var s=new j.TextNode(r.lower,a.start,t.slice(r.lower,a.start));c=c.concat(s);}else{var f=n[u-1];if(f&&a.start>f.end){var l=t.slice(f.end,a.start),s=new j.TextNode(f.end,a.start,l);c=c.concat(s);}}if(c=c.concat(a),o){var s=new j.TextNode(a.end,r.upper,t.slice(a.end,r.upper));c=c.concat(s);}return e.concat(c)},[])}function f(t,n,r){if(n.length>0)return s(t,l(t,n),r);var e=t.slice(r.lower,r.upper);return [new j.TextNode(r.lower,r.upper,e)]}function l(t,n){var r=p.sortBy(function(t){return t.start},n),e=i(r),a=e.map(o),c=p.flatten(a.map(function(n){return u(t,n)}));return p.sortBy(function(t){return t.start},c)}function v(t){var n=t.spans.map(function(n){var r=t.text.slice(n.start,n.end);return new j.SpanNode(n.start,n.end,n.type,r,[],n)}),r={lower:0,upper:t.text.length};return f(t.text,n,r)}n.__esModule=!0;var p=r(126),d=r(121),b=r(326),O=r(63),j=r(122),h=function(){function t(){}return t.fromRichText=function(t){return {key:d.default(),children:t.reduce(function(t,n,r){if(b.RichTextBlock.isEmbedBlock(n.type)||b.RichTextBlock.isImageBlock(n.type))return t.concat(new j.BlockNode(n.type,n));var e=v(n),a=t[t.length-1];if(b.RichTextBlock.isListItem(n.type)&&a&&a instanceof j.ListBlockNode){var u=new j.ListItemBlockNode(n,e),c=a.addChild(u);return p.init(t).concat(c)}if(b.RichTextBlock.isOrderedListItem(n.type)&&a&&a instanceof j.OrderedListBlockNode){var i=new j.OrderedListItemBlockNode(n,e),c=a.addChild(i);return p.init(t).concat(c)}if(b.RichTextBlock.isListItem(n.type)){var u=new j.ListItemBlockNode(n,e),o=new j.ListBlockNode(b.RichTextBlock.emptyList(),[u]);return t.concat(o)}if(b.RichTextBlock.isOrderedListItem(n.type)){var i=new j.OrderedListItemBlockNode(n,e),s=new j.OrderedListBlockNode(b.RichTextBlock.emptyOrderedList(),[i]);return t.concat(s)}return t.concat(new j.BlockNode(n.type,n,e))},[])}},t.NODE_TYPES=O.NODE_TYPES,t}();n.default=h;},function(t,n,r){var e=r(10),a=r(2),u=Object(a.a)(function(t,n,r){if(n>=r.length||n<-r.length)return r;var a=n<0?r.length:0,u=a+n,c=Object(e.a)(r);return c[u]=t(r[u]),c});n.a=u;},function(t,n,r){function e(t){return new a(t)}n.a=e;var a=function(){function t(t){this.f=t;}return t.prototype["@@transducer/init"]=function(){throw new Error("init not implemented on XWrap")},t.prototype["@@transducer/result"]=function(t){return t},t.prototype["@@transducer/step"]=function(t,n){return this.f(t,n)},t}();},function(t,n,r){var e=r(12),a=r(0),u=Object(a.a)(function(t,n){return Object(e.a)(t.length,function(){return t.apply(n,arguments)})});n.a=u;},function(t,n,r){var e=r(6),a=Object.prototype.toString,u=function(){return "[object Arguments]"===a.call(arguments)?function(t){return "[object Arguments]"===a.call(t)}:function(t){return Object(e.a)("callee",t)}};n.a=u;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return t&&n});n.a=a;},function(t,n,r){var e=r(0),a=r(3),u=r(71),c=Object(e.a)(Object(a.a)(["any"],u.a,function(t,n){for(var r=0;r<n.length;){if(t(n[r]))return !0;r+=1;}return !1}));n.a=c;},function(t,n,r){var e=r(0),a=r(16),u=r(4),c=function(){function t(t,n){this.xf=n,this.f=t,this.any=!1;}return t.prototype["@@transducer/init"]=u.a.init,t.prototype["@@transducer/result"]=function(t){return this.any||(t=this.xf["@@transducer/step"](t,!1)),this.xf["@@transducer/result"](t)},t.prototype["@@transducer/step"]=function(t,n){return this.f(n)&&(this.any=!0,t=Object(a.a)(this.xf["@@transducer/step"](t,!0))),t},t}(),i=Object(e.a)(function(t,n){return new c(t,n)});n.a=i;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return t.apply(this,n)});n.a=a;},function(t,n,r){var e=r(1),a=r(13),u=Object(e.a)(function(t){for(var n=Object(a.a)(t),r=n.length,e=[],u=0;u<r;)e[u]=t[n[u]],u+=1;return e});n.a=u;},function(t,n,r){var e=r(2),a=r(6),u=r(15),c=r(46),i=r(32),o=r(75),s=Object(e.a)(function t(n,r,e){if(0===n.length)return r;var s=n[0];if(n.length>1){var f=!Object(o.a)(e)&&Object(a.a)(s,e)?e[s]:Object(c.a)(n[1])?[]:{};r=t(Array.prototype.slice.call(n,1),r,f);}if(Object(c.a)(s)&&Object(u.a)(e)){var l=[].concat(e);return l[s]=r,l}return Object(i.a)(s,r,e)});n.a=s;},function(t,n,r){var e=r(1),a=Object(e.a)(function(t){return null==t});n.a=a;},function(t,n,r){var e=r(0),a=r(8),u=r(45),c=r(5),i=r(7),o=Object(e.a)(function(t,n){var r=Object(c.a)(t,n);return Object(c.a)(t,function(){return Object(a.a)(u.a,Object(i.a)(r,arguments[0]),Array.prototype.slice.call(arguments,1))})});n.a=o;},function(t,n,r){function e(t){return function n(r){for(var e,u,c,i=[],o=0,s=r.length;o<s;){if(Object(a.a)(r[o]))for(e=t?n(r[o]):r[o],c=0,u=e.length;c<u;)i[i.length]=e[c],c+=1;else i[i.length]=r[o];o+=1;}return i}}n.a=e;var a=r(31);},function(t,n,r){function e(t,n,r,c){var i=function(a){for(var u=n.length,i=0;i<u;){if(t===n[i])return r[i];i+=1;}n[i+1]=t,r[i+1]=a;for(var o in t)a[o]=c?e(t[o],n,r,!0):t[o];return a};switch(Object(u.a)(t)){case"Object":return i({});case"Array":return i([]);case"Date":return new Date(t.valueOf());case"RegExp":return Object(a.a)(t);default:return t}}n.a=e;var a=r(79),u=r(49);},function(t,n,r){function e(t){return new RegExp(t.source,(t.global?"g":"")+(t.ignoreCase?"i":"")+(t.multiline?"m":"")+(t.sticky?"y":"")+(t.unicode?"u":""))}n.a=e;},function(t,n,r){var e=r(1),a=Object(e.a)(function(t){return !t});n.a=a;},function(t,n,r){function e(){if(0===arguments.length)throw new Error("pipe requires at least one argument");return Object(a.a)(arguments[0].length,Object(c.a)(u.a,arguments[0],Object(i.a)(arguments)))}n.a=e;var a=r(12),u=r(153),c=r(14),i=r(51);},function(t,n,r){function e(){if(0===arguments.length)throw new Error("composeK requires at least one argument");var t=Array.prototype.slice.call(arguments),n=t.pop();return Object(u.a)(u.a.apply(this,Object(c.a)(a.a,t)),n)}n.a=e;var a=r(48),u=r(50),c=r(7);},function(t,n,r){function e(){if(0===arguments.length)throw new Error("pipeP requires at least one argument");return Object(a.a)(arguments[0].length,Object(c.a)(u.a,arguments[0],Object(i.a)(arguments)))}n.a=e;var a=r(12),u=r(155),c=r(14),i=r(51);},function(t,n,r){function e(t,n,r){var e,u;if("function"==typeof t.indexOf)switch(typeof n){case"number":if(0===n){for(e=1/n;r<t.length;){if(0===(u=t[r])&&1/u===e)return r;r+=1;}return -1}if(n!==n){for(;r<t.length;){if("number"==typeof(u=t[r])&&u!==u)return r;r+=1;}return -1}return t.indexOf(n,r);case"string":case"boolean":case"function":case"undefined":return t.indexOf(n,r);case"object":if(null===n)return t.indexOf(n,r)}for(;r<t.length;){if(Object(a.a)(t[r],n))return r;r+=1;}return -1}n.a=e;var a=r(9);},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return t===n?0!==t||1/t==1/n:t!==t&&n!==n});n.a=a;},function(t,n,r){function e(t){return function(){return !t.apply(this,arguments)}}n.a=e;},function(t,n,r){var e=r(0),a=r(47),u=r(33),c=Object(e.a)(function(t,n){if(t>10)throw new Error("Constructor with greater than ten arguments");return 0===t?function(){return new n}:Object(a.a)(Object(u.a)(t,function(t,r,e,a,u,c,i,o,s,f){switch(arguments.length){case 1:return new n(t);case 2:return new n(t,r);case 3:return new n(t,r,e);case 4:return new n(t,r,e,a);case 5:return new n(t,r,e,a,u);case 6:return new n(t,r,e,a,u,c);case 7:return new n(t,r,e,a,u,c,i);case 8:return new n(t,r,e,a,u,c,i,o);case 9:return new n(t,r,e,a,u,c,i,o,s);case 10:return new n(t,r,e,a,u,c,i,o,s,f)}}))});n.a=c;},function(t,n,r){var e=r(0),a=r(30),u=r(5),c=r(18),i=r(21),o=r(14),s=Object(e.a)(function(t,n){return Object(u.a)(Object(o.a)(c.a,0,Object(i.a)("length",n)),function(){var r=arguments,e=this;return t.apply(e,Object(a.a)(function(t){return t.apply(e,r)},n))})});n.a=s;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return null==n||n!==n?t:n});n.a=a;},function(t,n,r){var e=r(20),a=r(0),u=Object(a.a)(function(t,n){for(var r=[],a=0,u=t.length;a<u;)Object(e.a)(t[a],n)||Object(e.a)(t[a],r)||(r[r.length]=t[a]),a+=1;return r});n.a=u;},function(t,n,r){var e=r(37),a=r(2),u=Object(a.a)(function(t,n,r){for(var a=[],u=0,c=n.length;u<c;)Object(e.a)(t,n[u],r)||Object(e.a)(t,n[u],a)||a.push(n[u]),u+=1;return a});n.a=u;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){var r={};for(var e in n)r[e]=n[e];return delete r[t],r});n.a=a;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){var e=Array.prototype.slice.call(r,0);return e.splice(t,n),e});n.a=a;},function(t,n,r){var e=r(0),a=r(3),u=r(172),c=r(11),i=Object(e.a)(Object(a.a)(["drop"],u.a,function(t,n){return Object(c.a)(Math.max(0,t),1/0,n)}));n.a=i;},function(t,n,r){var e=r(0),a=r(4),u=function(){function t(t,n){this.xf=n,this.pred=t,this.lastValue=void 0,this.seenFirstValue=!1;}return t.prototype["@@transducer/init"]=a.a.init,t.prototype["@@transducer/result"]=a.a.result,t.prototype["@@transducer/step"]=function(t,n){var r=!1;return this.seenFirstValue?this.pred(this.lastValue,n)&&(r=!0):this.seenFirstValue=!0,this.lastValue=n,r?t:this.xf["@@transducer/step"](t,n)},t}(),c=Object(e.a)(function(t,n){return new u(t,n)});n.a=c;},function(t,n,r){var e=r(0),a=r(3),u=r(95),c=r(97),i=Object(e.a)(Object(a.a)([],u.a,function(t,n){var r=[],e=1,a=n.length;if(0!==a)for(r[0]=n[0];e<a;)t(Object(c.a)(r),n[e])||(r[r.length]=n[e]),e+=1;return r}));n.a=i;},function(t,n,r){var e=r(25),a=Object(e.a)(-1);n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return t||n});n.a=a;},function(t,n,r){var e=r(1),a=r(68),u=r(15),c=r(55),i=r(22),o=Object(e.a)(function(t){return null!=t&&"function"==typeof t["fantasy-land/empty"]?t["fantasy-land/empty"]():null!=t&&null!=t.constructor&&"function"==typeof t.constructor["fantasy-land/empty"]?t.constructor["fantasy-land/empty"]():null!=t&&"function"==typeof t.empty?t.empty():null!=t&&null!=t.constructor&&"function"==typeof t.constructor.empty?t.constructor.empty():Object(u.a)(t)?[]:Object(i.a)(t)?"":Object(c.a)(t)?{}:Object(a.a)(t)?function(){return arguments}():void 0});n.a=o;},function(t,n,r){var e=r(0),a=r(94),u=Object(e.a)(function(t,n){return Object(a.a)(t>=0?n.length-t:0,n)});n.a=u;},function(t,n,r){var e=r(216),a=r(0),u=Object(a.a)(function(t,n){for(var r,a,u=new e.a,c=[],i=0;i<n.length;)a=n[i],r=t(a),u.add(r)&&c.push(a),i+=1;return c});n.a=u;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){var r={};return r[t]=n,r});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return null!=n&&n.constructor===t||n instanceof t});n.a=a;},function(t,n,r){var e=r(1),a=r(88),u=Object(e.a)(function(t){return Object(a.a)(function(){return Array.prototype.slice.call(arguments,0)},t)});n.a=u;},function(t,n,r){var e=r(1),a=r(106),u=Object(e.a)(function(t){return null!=t&&Object(a.a)(t.length)?t.length:NaN});n.a=u;},function(t,n,r){function e(t){return "[object Number]"===Object.prototype.toString.call(t)}n.a=e;},function(t,n,r){var e=r(1),a=r(108),u=Object(e.a)(function(t){return Object(a.a)(t)/t.length});n.a=u;},function(t,n,r){var e=r(28),a=r(14),u=Object(a.a)(e.a,0);n.a=u;},function(t,n,r){var e=r(12),a=r(0),u=r(6),c=Object(a.a)(function(t,n){var r={};return Object(e.a)(n.length,function(){var e=t.apply(this,arguments);return Object(u.a)(e,r)||(r[e]=n.apply(this,arguments)),r[e]})});n.a=c;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return t*n});n.a=a;},function(t,n,r){var e=r(2),a=function(t){return {value:t,map:function(n){return a(n(t))}}},u=Object(e.a)(function(t,n,r){return t(function(t){return a(n(t))})(r).value});n.a=u;},function(t,n,r){function e(t){return Object(u.a)(function(n,r){return Object(a.a)(Math.max(0,n.length-r.length),function(){return n.apply(this,t(r,arguments))})})}n.a=e;var a=r(12),u=r(0);},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){for(var r={},e=0,a=t.length;e<a;){var u=t[e];r[u]=n[u],e+=1;}return r});n.a=a;},function(t,n,r){var e=r(10),a=r(0),u=Object(a.a)(function(t,n){return Object(e.a)([t],n)});n.a=u;},function(t,n,r){var e=r(0),a=r(5),u=Object(e.a)(function(t,n){return Object(a.a)(n.length,function(){for(var r=[],e=0;e<n.length;)r.push(n[e].call(this,arguments[e])),e+=1;return t.apply(this,r.concat(Array.prototype.slice.call(arguments,n.length)))})});n.a=u;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){for(var e=r.length-1;e>=0;)n=t(r[e],n),e-=1;return n});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){var r,e=Number(n),a=0;if(e<0||isNaN(e))throw new RangeError("n must be a non-negative number");for(r=new Array(e);a<e;)r[a]=t(a),a+=1;return r});n.a=a;},function(t,n,r){var e=r(0),a=r(45),u=r(7),c=r(114),i=r(116),o=Object(e.a)(function(t,n){return "function"==typeof n.sequence?n.sequence(t):Object(i.a)(function(t,n){return Object(a.a)(Object(u.a)(c.a,t),n)},t([]),n)});n.a=o;},function(t,n,r){var e=r(37),a=r(0),u=Object(a.a)(function(t,n){for(var r,a=0,u=n.length,c=[];a<u;)r=n[a],Object(e.a)(t,r,c)||(c[c.length]=r),a+=1;return c});n.a=u;},function(t,n,r){var e=r(0),a=r(6),u=Object(e.a)(function(t,n){for(var r in t)if(Object(a.a)(r,t)&&!t[r](n[r]))return !1;return !0});n.a=u;},function(t,n,r){function e(){var t=(new Date).getTime();return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(n){var r=(t+16*Math.random())%16|0;return t=Math.floor(t/16),("x"==n?r:3&r|8).toString(16)})}n.__esModule=!0,n.default=e;},function(t,n,r){var e=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,n){t.__proto__=n;}||function(t,n){for(var r in n)n.hasOwnProperty(r)&&(t[r]=n[r]);};return function(n,r){function e(){this.constructor=n;}t(n,r),n.prototype=null===r?Object.create(r):(e.prototype=r.prototype,new e);}}();n.__esModule=!0;var a=r(121),u=r(63),c=function(){function t(t,n,r){this.key=a.default(),this.type=t,this.element=n,this.children=r;}return t}();n.Node=c;var i=function(t){function n(n,r,e,a,u,c){var i=t.call(this,e,c,u)||this;return i.start=n,i.end=r,i.text=a,i.children=u,i}return e(n,t),n.prototype.boundaries=function(){return {lower:this.start,upper:this.end}},n.prototype.isParentOf=function(t){return this.start<=t.start&&this.end>=t.end},n.prototype.setChildren=function(t){return new n(this.start,this.end,this.type,this.text,t,this.element)},n.slice=function(t,r,e,a){return new n(r,e,t.type,a.slice(r,e),t.children,t.element)},n}(c);n.SpanNode=i;var o=function(t){function n(n,r,e){var a={type:u.NODE_TYPES.span,start:n,end:r,text:e};return t.call(this,n,r,u.NODE_TYPES.span,e,[],a)||this}return e(n,t),n}(i);n.TextNode=o;var s=function(t){function n(n,r,e){return void 0===e&&(e=[]),t.call(this,n,r,e)||this}return e(n,t),n}(c);n.BlockNode=s;var f=function(t){function n(n,r){return t.call(this,u.NODE_TYPES.listItem,n,r)||this}return e(n,t),n}(s);n.ListItemBlockNode=f;var l=function(t){function n(n,r){return t.call(this,u.NODE_TYPES.oListItem,n,r)||this}return e(n,t),n}(s);n.OrderedListItemBlockNode=l;var v=function(t){function n(n,r){return t.call(this,u.NODE_TYPES.oList,n,r)||this}return e(n,t),n.prototype.addChild=function(t){var r=this.children.concat(t);return new n(this.element,r)},n}(s);n.OrderedListBlockNode=v;var p=function(t){function n(n,r){return t.call(this,u.NODE_TYPES.list,n,r)||this}return e(n,t),n.prototype.addChild=function(t){var r=this.children.concat(t);return new n(this.element,r)},n}(s);n.ListBlockNode=p;},function(t,n,r){t.exports=r(124);},function(t,n,r){n.__esModule=!0;var e=r(125),a=r(64),u=r(327);t.exports={asText:e.default,asTree:a.default.fromRichText,serialize:u.default,Elements:a.default.NODE_TYPES};},function(t,n,r){function e(t,n){var r="string"==typeof n?n:" ";return t.map(function(t){return t.text}).join(r)}n.__esModule=!0,n.default=e;},function(t,n,r){Object.defineProperty(n,"__esModule",{value:!0});var e=r(127);r.d(n,"F",function(){return e.a});var a=r(128);r.d(n,"T",function(){return a.a});var u=r(129);r.d(n,"__",function(){return u.a});var c=r(28);r.d(n,"add",function(){return c.a});var i=r(130);r.d(n,"addIndex",function(){return i.a});var o=r(65);r.d(n,"adjust",function(){return o.a});var s=r(131);r.d(n,"all",function(){return s.a});var f=r(133);r.d(n,"allPass",function(){return f.a});var l=r(17);r.d(n,"always",function(){return l.a});var v=r(69);r.d(n,"and",function(){return v.a});var p=r(70);r.d(n,"any",function(){return p.a});var d=r(135);r.d(n,"anyPass",function(){return d.a});var b=r(45);r.d(n,"ap",function(){return b.a});var O=r(136);r.d(n,"aperture",function(){return O.a});var j=r(139);r.d(n,"append",function(){return j.a});var h=r(72);r.d(n,"apply",function(){return h.a});var y=r(140);r.d(n,"applySpec",function(){return y.a});var g=r(141);r.d(n,"applyTo",function(){return g.a});var m=r(142);r.d(n,"ascend",function(){return m.a});var x=r(32);r.d(n,"assoc",function(){return x.a});var w=r(74);r.d(n,"assocPath",function(){return w.a});var E=r(143);r.d(n,"binary",function(){return E.a});var _=r(67);r.d(n,"bind",function(){return _.a});var S=r(144);r.d(n,"both",function(){return S.a});var N=r(145);r.d(n,"call",function(){return N.a});var T=r(48);r.d(n,"chain",function(){return T.a});var P=r(149);r.d(n,"clamp",function(){return P.a});var k=r(150);r.d(n,"clone",function(){return k.a});var A=r(151);r.d(n,"comparator",function(){return A.a});var D=r(152);r.d(n,"complement",function(){return D.a});var I=r(50);r.d(n,"compose",function(){return I.a});var L=r(82);r.d(n,"composeK",function(){return L.a});var B=r(154);r.d(n,"composeP",function(){return B.a});var Y=r(52);r.d(n,"concat",function(){return Y.a});var M=r(163);r.d(n,"cond",function(){return M.a});var R=r(164);r.d(n,"construct",function(){return R.a});var q=r(87);r.d(n,"constructN",function(){return q.a});var C=r(165);r.d(n,"contains",function(){return C.a});var W=r(88);r.d(n,"converge",function(){return W.a});var F=r(166);r.d(n,"countBy",function(){return F.a});var U=r(47);r.d(n,"curry",function(){return U.a});var z=r(5);r.d(n,"curryN",function(){return z.a});var K=r(168);r.d(n,"dec",function(){return K.a});var V=r(89);r.d(n,"defaultTo",function(){return V.a});var H=r(169);r.d(n,"descend",function(){return H.a});var $=r(90);r.d(n,"difference",function(){return $.a});var J=r(91);r.d(n,"differenceWith",function(){return J.a});var X=r(92);r.d(n,"dissoc",function(){return X.a});var Z=r(170);r.d(n,"dissocPath",function(){return Z.a});var G=r(171);r.d(n,"divide",function(){return G.a});var Q=r(94);r.d(n,"drop",function(){return Q.a});var tt=r(173);r.d(n,"dropLast",function(){return tt.a});var nt=r(177);r.d(n,"dropLastWhile",function(){return nt.a});var rt=r(180);r.d(n,"dropRepeats",function(){return rt.a});var et=r(96);r.d(n,"dropRepeatsWith",function(){return et.a});var at=r(181);r.d(n,"dropWhile",function(){return at.a});var ut=r(183);r.d(n,"either",function(){return ut.a});var ct=r(99);r.d(n,"empty",function(){return ct.a});var it=r(184);r.d(n,"endsWith",function(){return it.a});var ot=r(185);r.d(n,"eqBy",function(){return ot.a});var st=r(186);r.d(n,"eqProps",function(){return st.a});var ft=r(9);r.d(n,"equals",function(){return ft.a});var lt=r(187);r.d(n,"evolve",function(){return lt.a});var vt=r(53);r.d(n,"filter",function(){return vt.a});var pt=r(188);r.d(n,"find",function(){return pt.a});var dt=r(190);r.d(n,"findIndex",function(){return dt.a});var bt=r(192);r.d(n,"findLast",function(){return bt.a});var Ot=r(194);r.d(n,"findLastIndex",function(){return Ot.a});var jt=r(196);r.d(n,"flatten",function(){return jt.a});var ht=r(40);r.d(n,"flip",function(){return ht.a});var yt=r(197);r.d(n,"forEach",function(){return yt.a});var gt=r(198);r.d(n,"forEachObjIndexed",function(){return gt.a});var mt=r(199);r.d(n,"fromPairs",function(){return mt.a});var xt=r(200);r.d(n,"groupBy",function(){return xt.a});var wt=r(201);r.d(n,"groupWith",function(){return wt.a});var Et=r(202);r.d(n,"gt",function(){return Et.a});var _t=r(203);r.d(n,"gte",function(){return _t.a});var St=r(204);r.d(n,"has",function(){return St.a});var Nt=r(205);r.d(n,"hasIn",function(){return Nt.a});var Tt=r(206);r.d(n,"head",function(){return Tt.a});var Pt=r(85);r.d(n,"identical",function(){return Pt.a});var kt=r(58);r.d(n,"identity",function(){return kt.a});var At=r(207);r.d(n,"ifElse",function(){return At.a});var Dt=r(208);r.d(n,"inc",function(){return Dt.a});var It=r(209);r.d(n,"indexBy",function(){return It.a});var Lt=r(210);r.d(n,"indexOf",function(){return Lt.a});var Bt=r(211);r.d(n,"init",function(){return Bt.a});var Yt=r(212);r.d(n,"innerJoin",function(){return Yt.a});var Mt=r(213);r.d(n,"insert",function(){return Mt.a});var Rt=r(214);r.d(n,"insertAll",function(){return Rt.a});var qt=r(215);r.d(n,"intersection",function(){return qt.a});var Ct=r(217);r.d(n,"intersperse",function(){return Ct.a});var Wt=r(218);r.d(n,"into",function(){return Wt.a});var Ft=r(221);r.d(n,"invert",function(){return Ft.a});var Ut=r(222);r.d(n,"invertObj",function(){return Ut.a});var zt=r(26);r.d(n,"invoker",function(){return zt.a});var Kt=r(103);r.d(n,"is",function(){return Kt.a});var Vt=r(223);r.d(n,"isEmpty",function(){return Vt.a});var Ht=r(75);r.d(n,"isNil",function(){return Ht.a});var $t=r(224);r.d(n,"join",function(){return $t.a});var Jt=r(104);r.d(n,"juxt",function(){return Jt.a});var Xt=r(13);r.d(n,"keys",function(){return Xt.a});var Zt=r(225);r.d(n,"keysIn",function(){return Zt.a});var Gt=r(97);r.d(n,"last",function(){return Gt.a});var Qt=r(226);r.d(n,"lastIndexOf",function(){return Qt.a});var tn=r(105);r.d(n,"length",function(){return tn.a});var nn=r(41);r.d(n,"lens",function(){return nn.a});var rn=r(227);r.d(n,"lensIndex",function(){return rn.a});var en=r(228);r.d(n,"lensPath",function(){return en.a});var an=r(229);r.d(n,"lensProp",function(){return an.a});var un=r(35);r.d(n,"lift",function(){return un.a});var cn=r(76);r.d(n,"liftN",function(){return cn.a});var on=r(230);r.d(n,"lt",function(){return on.a});var sn=r(231);r.d(n,"lte",function(){return sn.a});var fn=r(7);r.d(n,"map",function(){return fn.a});var ln=r(232);r.d(n,"mapAccum",function(){return ln.a});var vn=r(233);r.d(n,"mapAccumRight",function(){return vn.a});var pn=r(234);r.d(n,"mapObjIndexed",function(){return pn.a});var dn=r(235);r.d(n,"match",function(){return dn.a});var bn=r(236);r.d(n,"mathMod",function(){return bn.a});var On=r(18);r.d(n,"max",function(){return On.a});var jn=r(237);r.d(n,"maxBy",function(){return jn.a});var hn=r(107);r.d(n,"mean",function(){return hn.a});var yn=r(238);r.d(n,"median",function(){return yn.a});var gn=r(239);r.d(n,"memoize",function(){return gn.a});var mn=r(109);r.d(n,"memoizeWith",function(){return mn.a});var xn=r(240);r.d(n,"merge",function(){return xn.a});var wn=r(241);r.d(n,"mergeAll",function(){return wn.a});var En=r(242);r.d(n,"mergeDeepLeft",function(){return En.a});var _n=r(243);r.d(n,"mergeDeepRight",function(){return _n.a});var Sn=r(244);r.d(n,"mergeDeepWith",function(){return Sn.a});var Nn=r(42);r.d(n,"mergeDeepWithKey",function(){return Nn.a});var Tn=r(245);r.d(n,"mergeWith",function(){return Tn.a});var Pn=r(62);r.d(n,"mergeWithKey",function(){return Pn.a});var kn=r(246);r.d(n,"min",function(){return kn.a});var An=r(247);r.d(n,"minBy",function(){return An.a});var Dn=r(248);r.d(n,"modulo",function(){return Dn.a});var In=r(110);r.d(n,"multiply",function(){return In.a});var Ln=r(33);r.d(n,"nAry",function(){return Ln.a});var Bn=r(249);r.d(n,"negate",function(){return Bn.a});var Yn=r(250);r.d(n,"none",function(){return Yn.a});var Mn=r(80);r.d(n,"not",function(){return Mn.a});var Rn=r(25);r.d(n,"nth",function(){return Rn.a});var qn=r(251);r.d(n,"nthArg",function(){return qn.a});var Cn=r(252);r.d(n,"o",function(){return Cn.a});var Wn=r(102);r.d(n,"objOf",function(){return Wn.a});var Fn=r(253);r.d(n,"of",function(){return Fn.a});var Un=r(255);r.d(n,"omit",function(){return Un.a});var zn=r(256);r.d(n,"once",function(){return zn.a});var Kn=r(98);r.d(n,"or",function(){return Kn.a});var Vn=r(111);r.d(n,"over",function(){return Vn.a});var Hn=r(257);r.d(n,"pair",function(){return Hn.a});var $n=r(258);r.d(n,"partial",function(){return $n.a});var Jn=r(259);r.d(n,"partialRight",function(){return Jn.a});var Xn=r(260);r.d(n,"partition",function(){return Xn.a});var Zn=r(19);r.d(n,"path",function(){return Zn.a});var Gn=r(261);r.d(n,"pathEq",function(){return Gn.a});var Qn=r(262);r.d(n,"pathOr",function(){return Qn.a});var tr=r(263);r.d(n,"pathSatisfies",function(){return tr.a});var nr=r(264);r.d(n,"pick",function(){return nr.a});var rr=r(113);r.d(n,"pickAll",function(){return rr.a});var er=r(265);r.d(n,"pickBy",function(){return er.a});var ar=r(81);r.d(n,"pipe",function(){return ar.a});var ur=r(266);r.d(n,"pipeK",function(){return ur.a});var cr=r(83);r.d(n,"pipeP",function(){return cr.a});var ir=r(21);r.d(n,"pluck",function(){return ir.a});var or=r(114);r.d(n,"prepend",function(){return or.a});var sr=r(267);r.d(n,"product",function(){return sr.a});var fr=r(268);r.d(n,"project",function(){return fr.a});var lr=r(44);r.d(n,"prop",function(){return lr.a});var vr=r(269);r.d(n,"propEq",function(){return vr.a});var pr=r(270);r.d(n,"propIs",function(){return pr.a});var dr=r(271);r.d(n,"propOr",function(){return dr.a});var br=r(272);r.d(n,"propSatisfies",function(){return br.a});var Or=r(273);r.d(n,"props",function(){return Or.a});var jr=r(274);r.d(n,"range",function(){return jr.a});var hr=r(14);r.d(n,"reduce",function(){return hr.a});var yr=r(39);r.d(n,"reduceBy",function(){return yr.a});var gr=r(116);r.d(n,"reduceRight",function(){return gr.a});var mr=r(275);r.d(n,"reduceWhile",function(){return mr.a});var xr=r(276);r.d(n,"reduced",function(){return xr.a});var wr=r(38);r.d(n,"reject",function(){return wr.a});var Er=r(93);r.d(n,"remove",function(){return Er.a});var _r=r(277);r.d(n,"repeat",function(){return _r.a});var Sr=r(278);r.d(n,"replace",function(){return Sr.a});var Nr=r(36);r.d(n,"reverse",function(){return Nr.a});var Tr=r(279);r.d(n,"scan",function(){return Tr.a});var Pr=r(118);r.d(n,"sequence",function(){return Pr.a});var kr=r(280);r.d(n,"set",function(){return kr.a});var Ar=r(11);r.d(n,"slice",function(){return Ar.a});var Dr=r(281);r.d(n,"sort",function(){return Dr.a});var Ir=r(282);r.d(n,"sortBy",function(){return Ir.a});var Lr=r(283);r.d(n,"sortWith",function(){return Lr.a});var Br=r(284);r.d(n,"split",function(){return Br.a});var Yr=r(285);r.d(n,"splitAt",function(){return Yr.a});var Mr=r(286);r.d(n,"splitEvery",function(){return Mr.a});var Rr=r(287);r.d(n,"splitWhen",function(){return Rr.a});var qr=r(288);r.d(n,"startsWith",function(){return qr.a});var Cr=r(289);r.d(n,"subtract",function(){return Cr.a});var Wr=r(108);r.d(n,"sum",function(){return Wr.a});var Fr=r(290);r.d(n,"symmetricDifference",function(){return Fr.a});var Ur=r(291);r.d(n,"symmetricDifferenceWith",function(){return Ur.a});var zr=r(51);r.d(n,"tail",function(){return zr.a});var Kr=r(57);r.d(n,"take",function(){return Kr.a});var Vr=r(100);r.d(n,"takeLast",function(){return Vr.a});var Hr=r(292);r.d(n,"takeLastWhile",function(){return Hr.a});var $r=r(293);r.d(n,"takeWhile",function(){return $r.a});var Jr=r(295);r.d(n,"tap",function(){return Jr.a});var Xr=r(297);r.d(n,"test",function(){return Xr.a});var Zr=r(117);r.d(n,"times",function(){return Zr.a});var Gr=r(299);r.d(n,"toLower",function(){return Gr.a});var Qr=r(300);r.d(n,"toPairs",function(){return Qr.a});var te=r(301);r.d(n,"toPairsIn",function(){return te.a});var ne=r(24);r.d(n,"toString",function(){return ne.a});var re=r(302);r.d(n,"toUpper",function(){return re.a});var ee=r(303);r.d(n,"transduce",function(){return ee.a});var ae=r(304);r.d(n,"transpose",function(){return ae.a});var ue=r(305);r.d(n,"traverse",function(){return ue.a});var ce=r(306);r.d(n,"trim",function(){return ce.a});var ie=r(307);r.d(n,"tryCatch",function(){return ie.a});var oe=r(49);r.d(n,"type",function(){return oe.a});var se=r(308);r.d(n,"unapply",function(){return se.a});var fe=r(309);r.d(n,"unary",function(){return fe.a});var le=r(310);r.d(n,"uncurryN",function(){return le.a});var ve=r(311);r.d(n,"unfold",function(){return ve.a});var pe=r(312);r.d(n,"union",function(){return pe.a});var de=r(313);r.d(n,"unionWith",function(){return de.a});var be=r(60);r.d(n,"uniq",function(){return be.a});var Oe=r(101);r.d(n,"uniqBy",function(){return Oe.a});var je=r(119);r.d(n,"uniqWith",function(){return je.a});var he=r(314);r.d(n,"unless",function(){return he.a});var ye=r(315);r.d(n,"unnest",function(){return ye.a});var ge=r(316);r.d(n,"until",function(){return ge.a});var me=r(56);r.d(n,"update",function(){return me.a});var xe=r(115);r.d(n,"useWith",function(){return xe.a});var we=r(73);r.d(n,"values",function(){return we.a});var Ee=r(317);r.d(n,"valuesIn",function(){return Ee.a});var _e=r(318);r.d(n,"view",function(){return _e.a});var Se=r(319);r.d(n,"when",function(){return Se.a});var Ne=r(120);r.d(n,"where",function(){return Ne.a});var Te=r(320);r.d(n,"whereEq",function(){return Te.a});var Pe=r(321);r.d(n,"without",function(){return Pe.a});var ke=r(322);r.d(n,"xprod",function(){return ke.a});var Ae=r(323);r.d(n,"zip",function(){return Ae.a});var De=r(324);r.d(n,"zipObj",function(){return De.a});var Ie=r(325);r.d(n,"zipWith",function(){return Ie.a});},function(t,n,r){var e=r(17),a=Object(e.a)(!1);n.a=a;},function(t,n,r){var e=r(17),a=Object(e.a)(!0);n.a=a;},function(t,n,r){n.a={"@@functional/placeholder":!0};},function(t,n,r){var e=r(10),a=r(1),u=r(5),c=Object(a.a)(function(t){return Object(u.a)(t.length,function(){var n=0,r=arguments[0],a=arguments[arguments.length-1],u=Array.prototype.slice.call(arguments,0);return u[0]=function(){var t=r.apply(this,Object(e.a)(arguments,[n,a]));return n+=1,t},t.apply(this,u)})});n.a=c;},function(t,n,r){var e=r(0),a=r(3),u=r(132),c=Object(e.a)(Object(a.a)(["all"],u.a,function(t,n){for(var r=0;r<n.length;){if(!t(n[r]))return !1;r+=1;}return !0}));n.a=c;},function(t,n,r){var e=r(0),a=r(16),u=r(4),c=function(){function t(t,n){this.xf=n,this.f=t,this.all=!0;}return t.prototype["@@transducer/init"]=u.a.init,t.prototype["@@transducer/result"]=function(t){return this.all&&(t=this.xf["@@transducer/step"](t,!0)),this.xf["@@transducer/result"](t)},t.prototype["@@transducer/step"]=function(t,n){return this.f(n)||(this.all=!1,t=Object(a.a)(this.xf["@@transducer/step"](t,!1))),t},t}(),i=Object(e.a)(function(t,n){return new c(t,n)});n.a=i;},function(t,n,r){var e=r(1),a=r(5),u=r(18),c=r(21),i=r(14),o=Object(e.a)(function(t){return Object(a.a)(Object(i.a)(u.a,0,Object(c.a)("length",t)),function(){for(var n=0,r=t.length;n<r;){if(!t[n].apply(this,arguments))return !1;n+=1;}return !0})});n.a=o;},function(t,n,r){var e=r(0),a=r(4),u=function(){function t(t,n){this.xf=n,this.f=t;}return t.prototype["@@transducer/init"]=a.a.init,t.prototype["@@transducer/result"]=a.a.result,t.prototype["@@transducer/step"]=function(t,n){return this.xf["@@transducer/step"](t,this.f(n))},t}(),c=Object(e.a)(function(t,n){return new u(t,n)});n.a=c;},function(t,n,r){var e=r(1),a=r(5),u=r(18),c=r(21),i=r(14),o=Object(e.a)(function(t){return Object(a.a)(Object(i.a)(u.a,0,Object(c.a)("length",t)),function(){for(var n=0,r=t.length;n<r;){if(t[n].apply(this,arguments))return !0;n+=1;}return !1})});n.a=o;},function(t,n,r){var e=r(137),a=r(0),u=r(3),c=r(138),i=Object(a.a)(Object(u.a)([],c.a,e.a));n.a=i;},function(t,n,r){function e(t,n){for(var r=0,e=n.length-(t-1),a=new Array(e>=0?e:0);r<e;)a[r]=Array.prototype.slice.call(n,r,r+t),r+=1;return a}n.a=e;},function(t,n,r){var e=r(10),a=r(0),u=r(4),c=function(){function t(t,n){this.xf=n,this.pos=0,this.full=!1,this.acc=new Array(t);}return t.prototype["@@transducer/init"]=u.a.init,t.prototype["@@transducer/result"]=function(t){return this.acc=null,this.xf["@@transducer/result"](t)},t.prototype["@@transducer/step"]=function(t,n){return this.store(n),this.full?this.xf["@@transducer/step"](t,this.getCopy()):t},t.prototype.store=function(t){this.acc[this.pos]=t,this.pos+=1,this.pos===this.acc.length&&(this.pos=0,this.full=!0);},t.prototype.getCopy=function(){return Object(e.a)(Array.prototype.slice.call(this.acc,this.pos),Array.prototype.slice.call(this.acc,0,this.pos))},t}(),i=Object(a.a)(function(t,n){return new c(t,n)});n.a=i;},function(t,n,r){var e=r(10),a=r(0),u=Object(a.a)(function(t,n){return Object(e.a)(n,[t])});n.a=u;},function(t,n,r){var e=r(1),a=r(72),u=r(5),c=r(7),i=r(18),o=r(21),s=r(14),f=r(73),l=Object(e.a)(function t(n){return n=Object(c.a)(function(n){return "function"==typeof n?n:t(n)},n),Object(u.a)(Object(s.a)(i.a,0,Object(o.a)("length",Object(f.a)(n))),function(){var t=arguments;return Object(c.a)(function(n){return Object(a.a)(n,t)},n)})});n.a=l;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return n(t)});n.a=a;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){var e=t(n),a=t(r);return e<a?-1:e>a?1:0});n.a=a;},function(t,n,r){var e=r(1),a=r(33),u=Object(e.a)(function(t){return Object(a.a)(2,t)});n.a=u;},function(t,n,r){var e=r(0),a=r(34),u=r(69),c=r(35),i=Object(e.a)(function(t,n){return Object(a.a)(t)?function(){return t.apply(this,arguments)&&n.apply(this,arguments)}:Object(c.a)(u.a)(t,n)});n.a=i;},function(t,n,r){var e=r(47),a=Object(e.a)(function(t){return t.apply(this,Array.prototype.slice.call(arguments,1))});n.a=a;},function(t,n,r){var e=r(0),a=r(147),u=r(7),c=Object(e.a)(function(t,n){return Object(u.a)(t,Object(a.a)(n))});n.a=c;},function(t,n,r){var e=r(148),a=r(31),u=r(8),c=r(4),i=function(t){return {"@@transducer/init":c.a.init,"@@transducer/result":function(n){return t["@@transducer/result"](n)},"@@transducer/step":function(n,r){var a=t["@@transducer/step"](n,r);return a["@@transducer/reduced"]?Object(e.a)(a):a}}},o=function(t){var n=i(t);return {"@@transducer/init":c.a.init,"@@transducer/result":function(t){return n["@@transducer/result"](t)},"@@transducer/step":function(t,r){return Object(a.a)(r)?Object(u.a)(n,t,r):Object(u.a)(n,t,[r])}}};n.a=o;},function(t,n,r){function e(t){return {"@@transducer/value":t,"@@transducer/reduced":!0}}n.a=e;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){if(t>n)throw new Error("min must not be greater than max in clamp(min, max, value)");return r<t?t:r>n?n:r});n.a=a;},function(t,n,r){var e=r(78),a=r(1),u=Object(a.a)(function(t){return null!=t&&"function"==typeof t.clone?t.clone():Object(e.a)(t,[],[],!0)});n.a=u;},function(t,n,r){var e=r(1),a=Object(e.a)(function(t){return function(n,r){return t(n,r)?-1:t(r,n)?1:0}});n.a=a;},function(t,n,r){var e=r(35),a=r(80),u=Object(e.a)(a.a);n.a=u;},function(t,n,r){function e(t,n){return function(){return n.call(this,t.apply(this,arguments))}}n.a=e;},function(t,n,r){function e(){if(0===arguments.length)throw new Error("composeP requires at least one argument");return a.a.apply(this,Object(u.a)(arguments))}n.a=e;var a=r(83),u=r(36);},function(t,n,r){function e(t,n){return function(){var r=this;return t.apply(r,arguments).then(function(t){return n.call(r,t)})}}n.a=e;},function(t,n,r){function e(t,n){var r=function(r){var u=n.concat([t]);return Object(a.a)(r,u)?"<Circular>":e(r,u)},f=function(t,n){return Object(u.a)(function(n){return Object(c.a)(n)+": "+r(t[n])},n.slice().sort())};switch(Object.prototype.toString.call(t)){case"[object Arguments]":return "(function() { return arguments; }("+Object(u.a)(r,t).join(", ")+"))";case"[object Array]":return "["+Object(u.a)(r,t).concat(f(t,Object(s.a)(function(t){return /^\d+$/.test(t)},Object(o.a)(t)))).join(", ")+"]";case"[object Boolean]":return "object"==typeof t?"new Boolean("+r(t.valueOf())+")":t.toString();case"[object Date]":return "new Date("+(isNaN(t.valueOf())?r(NaN):Object(c.a)(Object(i.a)(t)))+")";case"[object Null]":return "null";case"[object Number]":return "object"==typeof t?"new Number("+r(t.valueOf())+")":1/t==-1/0?"-0":t.toString(10);case"[object String]":return "object"==typeof t?"new String("+r(t.valueOf())+")":Object(c.a)(t);case"[object Undefined]":return "undefined";default:if("function"==typeof t.toString){var l=t.toString();if("[object Object]"!==l)return l}return "{"+f(t,Object(o.a)(t)).join(", ")+"}"}}n.a=e;var a=r(20),u=r(30),c=r(160),i=r(161),o=r(13),s=r(38);},function(t,n,r){function e(t,n,r,e){function i(t,n){return a(t,n,r.slice(),e.slice())}var o=Object(u.a)(t),s=Object(u.a)(n);return !Object(c.a)(function(t,n){return !Object(c.a)(i,n,t)},s,o)}function a(t,n,r,u){if(Object(s.a)(t,n))return !0;var c=Object(l.a)(t);if(c!==Object(l.a)(n))return !1;if(null==t||null==n)return !1;if("function"==typeof t["fantasy-land/equals"]||"function"==typeof n["fantasy-land/equals"])return "function"==typeof t["fantasy-land/equals"]&&t["fantasy-land/equals"](n)&&"function"==typeof n["fantasy-land/equals"]&&n["fantasy-land/equals"](t);if("function"==typeof t.equals||"function"==typeof n.equals)return "function"==typeof t.equals&&t.equals(n)&&"function"==typeof n.equals&&n.equals(t);switch(c){case"Arguments":case"Array":case"Object":if("function"==typeof t.constructor&&"Promise"===Object(i.a)(t.constructor))return t===n;break;case"Boolean":case"Number":case"String":if(typeof t!=typeof n||!Object(s.a)(t.valueOf(),n.valueOf()))return !1;break;case"Date":if(!Object(s.a)(t.valueOf(),n.valueOf()))return !1;break;case"Error":return t.name===n.name&&t.message===n.message;case"RegExp":if(t.source!==n.source||t.global!==n.global||t.ignoreCase!==n.ignoreCase||t.multiline!==n.multiline||t.sticky!==n.sticky||t.unicode!==n.unicode)return !1}for(var v=r.length-1;v>=0;){if(r[v]===t)return u[v]===n;v-=1;}switch(c){case"Map":return t.size===n.size&&e(t.entries(),n.entries(),r.concat([t]),u.concat([n]));case"Set":return t.size===n.size&&e(t.values(),n.values(),r.concat([t]),u.concat([n]));case"Arguments":case"Array":case"Object":case"Boolean":case"Number":case"String":case"Date":case"Error":case"RegExp":case"Int8Array":case"Uint8Array":case"Uint8ClampedArray":case"Int16Array":case"Uint16Array":case"Int32Array":case"Uint32Array":case"Float32Array":case"Float64Array":case"ArrayBuffer":break;default:return !1}var p=Object(f.a)(t);if(p.length!==Object(f.a)(n).length)return !1;var d=r.concat([t]),b=u.concat([n]);for(v=p.length-1;v>=0;){var O=p[v];if(!Object(o.a)(O,n)||!a(n[O],t[O],d,b))return !1;v-=1;}return !0}n.a=a;var u=r(158),c=r(37),i=r(159),o=r(6),s=r(85),f=r(13),l=r(49);},function(t,n,r){function e(t){for(var n,r=[];!(n=t.next()).done;)r.push(n.value);return r}n.a=e;},function(t,n,r){function e(t){var n=String(t).match(/^function (\w*)/);return null==n?"":n[1]}n.a=e;},function(t,n,r){function e(t){return '"'+t.replace(/\\/g,"\\\\").replace(/[\b]/g,"\\b").replace(/\f/g,"\\f").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\t/g,"\\t").replace(/\v/g,"\\v").replace(/\0/g,"\\0").replace(/"/g,'\\"')+'"'}n.a=e;},function(t,n,r){var e=function(t){return (t<10?"0":"")+t},a="function"==typeof Date.prototype.toISOString?function(t){return t.toISOString()}:function(t){return t.getUTCFullYear()+"-"+e(t.getUTCMonth()+1)+"-"+e(t.getUTCDate())+"T"+e(t.getUTCHours())+":"+e(t.getUTCMinutes())+":"+e(t.getUTCSeconds())+"."+(t.getUTCMilliseconds()/1e3).toFixed(3).slice(2,5)+"Z"};n.a=a;},function(t,n,r){var e=r(0),a=r(4),u=function(){function t(t,n){this.xf=n,this.f=t;}return t.prototype["@@transducer/init"]=a.a.init,t.prototype["@@transducer/result"]=a.a.result,t.prototype["@@transducer/step"]=function(t,n){return this.f(n)?this.xf["@@transducer/step"](t,n):t},t}(),c=Object(e.a)(function(t,n){return new u(t,n)});n.a=c;},function(t,n,r){var e=r(12),a=r(1),u=r(7),c=r(18),i=r(14),o=Object(a.a)(function(t){var n=Object(i.a)(c.a,0,Object(u.a)(function(t){return t[0].length},t));return Object(e.a)(n,function(){for(var n=0;n<t.length;){if(t[n][0].apply(this,arguments))return t[n][1].apply(this,arguments);n+=1;}})});n.a=o;},function(t,n,r){var e=r(1),a=r(87),u=Object(e.a)(function(t){return Object(a.a)(t.length,t)});n.a=u;},function(t,n,r){var e=r(20),a=r(0),u=Object(a.a)(e.a);n.a=u;},function(t,n,r){var e=r(39),a=Object(e.a)(function(t,n){return t+1},0);n.a=a;},function(t,n,r){var e=r(29),a=r(6),u=r(4),c=function(){function t(t,n,r,e){this.valueFn=t,this.valueAcc=n,this.keyFn=r,this.xf=e,this.inputs={};}return t.prototype["@@transducer/init"]=u.a.init,t.prototype["@@transducer/result"]=function(t){var n;for(n in this.inputs)if(Object(a.a)(n,this.inputs)&&(t=this.xf["@@transducer/step"](t,this.inputs[n]),t["@@transducer/reduced"])){t=t["@@transducer/value"];break}return this.inputs=null,this.xf["@@transducer/result"](t)},t.prototype["@@transducer/step"]=function(t,n){var r=this.keyFn(n);return this.inputs[r]=this.inputs[r]||[r,this.valueAcc],this.inputs[r][1]=this.valueFn(this.inputs[r][1],n),t},t}(),i=Object(e.a)(4,[],function(t,n,r,e){return new c(t,n,r,e)});n.a=i;},function(t,n,r){var e=r(28),a=Object(e.a)(-1);n.a=a;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){var e=t(n),a=t(r);return e>a?-1:e<a?1:0});n.a=a;},function(t,n,r){var e=r(0),a=r(46),u=r(32),c=r(92),i=r(93),o=r(56),s=Object(e.a)(function t(n,r){switch(n.length){case 0:return r;case 1:return Object(a.a)(n[0])?Object(i.a)(n[0],1,r):Object(c.a)(n[0],r);default:var e=n[0],s=Array.prototype.slice.call(n,1);return null==r[e]?r:Object(a.a)(n[0])?Object(o.a)(e,t(s,r[e]),r):Object(u.a)(e,t(s,r[e]),r)}});n.a=s;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return t/n});n.a=a;},function(t,n,r){var e=r(0),a=r(4),u=function(){function t(t,n){this.xf=n,this.n=t;}return t.prototype["@@transducer/init"]=a.a.init,t.prototype["@@transducer/result"]=a.a.result,t.prototype["@@transducer/step"]=function(t,n){return this.n>0?(this.n-=1,t):this.xf["@@transducer/step"](t,n)},t}(),c=Object(e.a)(function(t,n){return new u(t,n)});n.a=c;},function(t,n,r){var e=r(0),a=r(3),u=r(174),c=r(176),i=Object(e.a)(Object(a.a)([],c.a,u.a));n.a=i;},function(t,n,r){function e(t,n){return Object(a.a)(t<n.length?n.length-t:0,n)}n.a=e;var a=r(57);},function(t,n,r){var e=r(0),a=r(16),u=r(4),c=function(){function t(t,n){this.xf=n,this.n=t,this.i=0;}return t.prototype["@@transducer/init"]=u.a.init,t.prototype["@@transducer/result"]=u.a.result,t.prototype["@@transducer/step"]=function(t,n){this.i+=1;var r=0===this.n?t:this.xf["@@transducer/step"](t,n);return this.n>=0&&this.i>=this.n?Object(a.a)(r):r},t}(),i=Object(e.a)(function(t,n){return new c(t,n)});n.a=i;},function(t,n,r){var e=r(0),a=r(4),u=function(){function t(t,n){this.xf=n,this.pos=0,this.full=!1,this.acc=new Array(t);}return t.prototype["@@transducer/init"]=a.a.init,t.prototype["@@transducer/result"]=function(t){return this.acc=null,this.xf["@@transducer/result"](t)},t.prototype["@@transducer/step"]=function(t,n){return this.full&&(t=this.xf["@@transducer/step"](t,this.acc[this.pos])),this.store(n),t},t.prototype.store=function(t){this.acc[this.pos]=t,this.pos+=1,this.pos===this.acc.length&&(this.pos=0,this.full=!0);},t}(),c=Object(e.a)(function(t,n){return new u(t,n)});n.a=c;},function(t,n,r){var e=r(0),a=r(3),u=r(178),c=r(179),i=Object(e.a)(Object(a.a)([],c.a,u.a));n.a=i;},function(t,n,r){function e(t,n){for(var r=n.length-1;r>=0&&t(n[r]);)r-=1;return Object(a.a)(0,r+1,n)}n.a=e;var a=r(11);},function(t,n,r){var e=r(0),a=r(8),u=r(4),c=function(){function t(t,n){this.f=t,this.retained=[],this.xf=n;}return t.prototype["@@transducer/init"]=u.a.init,t.prototype["@@transducer/result"]=function(t){return this.retained=null,this.xf["@@transducer/result"](t)},t.prototype["@@transducer/step"]=function(t,n){return this.f(n)?this.retain(t,n):this.flush(t,n)},t.prototype.flush=function(t,n){return t=Object(a.a)(this.xf["@@transducer/step"],t,this.retained),this.retained=[],this.xf["@@transducer/step"](t,n)},t.prototype.retain=function(t,n){return this.retained.push(n),t},t}(),i=Object(e.a)(function(t,n){return new c(t,n)});n.a=i;},function(t,n,r){var e=r(1),a=r(3),u=r(95),c=r(96),i=r(9),o=Object(e.a)(Object(a.a)([],Object(u.a)(i.a),Object(c.a)(i.a)));n.a=o;},function(t,n,r){var e=r(0),a=r(3),u=r(182),c=r(11),i=Object(e.a)(Object(a.a)(["dropWhile"],u.a,function(t,n){for(var r=0,e=n.length;r<e&&t(n[r]);)r+=1;return Object(c.a)(r,1/0,n)}));n.a=i;},function(t,n,r){var e=r(0),a=r(4),u=function(){function t(t,n){this.xf=n,this.f=t;}return t.prototype["@@transducer/init"]=a.a.init,t.prototype["@@transducer/result"]=a.a.result,t.prototype["@@transducer/step"]=function(t,n){if(this.f){if(this.f(n))return t;this.f=null;}return this.xf["@@transducer/step"](t,n)},t}(),c=Object(e.a)(function(t,n){return new u(t,n)});n.a=c;},function(t,n,r){var e=r(0),a=r(34),u=r(35),c=r(98),i=Object(e.a)(function(t,n){return Object(a.a)(t)?function(){return t.apply(this,arguments)||n.apply(this,arguments)}:Object(u.a)(c.a)(t,n)});n.a=i;},function(t,n,r){var e=r(0),a=r(9),u=r(100),c=Object(e.a)(function(t,n){return Object(a.a)(Object(u.a)(t.length,n),t)});n.a=c;},function(t,n,r){var e=r(2),a=r(9),u=Object(e.a)(function(t,n,r){return Object(a.a)(t(n),t(r))});n.a=u;},function(t,n,r){var e=r(2),a=r(9),u=Object(e.a)(function(t,n,r){return Object(a.a)(n[t],r[t])});n.a=u;},function(t,n,r){var e=r(0),a=Object(e.a)(function t(n,r){var e,a,u,c={};for(a in r)e=n[a],u=typeof e,c[a]="function"===u?e(r[a]):e&&"object"===u?t(e,r[a]):r[a];return c});n.a=a;},function(t,n,r){var e=r(0),a=r(3),u=r(189),c=Object(e.a)(Object(a.a)(["find"],u.a,function(t,n){for(var r=0,e=n.length;r<e;){if(t(n[r]))return n[r];r+=1;}}));n.a=c;},function(t,n,r){var e=r(0),a=r(16),u=r(4),c=function(){function t(t,n){this.xf=n,this.f=t,this.found=!1;}return t.prototype["@@transducer/init"]=u.a.init,t.prototype["@@transducer/result"]=function(t){return this.found||(t=this.xf["@@transducer/step"](t,void 0)),this.xf["@@transducer/result"](t)},t.prototype["@@transducer/step"]=function(t,n){return this.f(n)&&(this.found=!0,t=Object(a.a)(this.xf["@@transducer/step"](t,n))),t},t}(),i=Object(e.a)(function(t,n){return new c(t,n)});n.a=i;},function(t,n,r){var e=r(0),a=r(3),u=r(191),c=Object(e.a)(Object(a.a)([],u.a,function(t,n){for(var r=0,e=n.length;r<e;){if(t(n[r]))return r;r+=1;}return -1}));n.a=c;},function(t,n,r){var e=r(0),a=r(16),u=r(4),c=function(){function t(t,n){this.xf=n,this.f=t,this.idx=-1,this.found=!1;}return t.prototype["@@transducer/init"]=u.a.init,t.prototype["@@transducer/result"]=function(t){return this.found||(t=this.xf["@@transducer/step"](t,-1)),this.xf["@@transducer/result"](t)},t.prototype["@@transducer/step"]=function(t,n){return this.idx+=1,this.f(n)&&(this.found=!0,t=Object(a.a)(this.xf["@@transducer/step"](t,this.idx))),t},t}(),i=Object(e.a)(function(t,n){return new c(t,n)});n.a=i;},function(t,n,r){var e=r(0),a=r(3),u=r(193),c=Object(e.a)(Object(a.a)([],u.a,function(t,n){for(var r=n.length-1;r>=0;){if(t(n[r]))return n[r];r-=1;}}));n.a=c;},function(t,n,r){var e=r(0),a=r(4),u=function(){function t(t,n){this.xf=n,this.f=t;}return t.prototype["@@transducer/init"]=a.a.init,t.prototype["@@transducer/result"]=function(t){return this.xf["@@transducer/result"](this.xf["@@transducer/step"](t,this.last))},t.prototype["@@transducer/step"]=function(t,n){return this.f(n)&&(this.last=n),t},t}(),c=Object(e.a)(function(t,n){return new u(t,n)});n.a=c;},function(t,n,r){var e=r(0),a=r(3),u=r(195),c=Object(e.a)(Object(a.a)([],u.a,function(t,n){for(var r=n.length-1;r>=0;){if(t(n[r]))return r;r-=1;}return -1}));n.a=c;},function(t,n,r){var e=r(0),a=r(4),u=function(){function t(t,n){this.xf=n,this.f=t,this.idx=-1,this.lastIdx=-1;}return t.prototype["@@transducer/init"]=a.a.init,t.prototype["@@transducer/result"]=function(t){return this.xf["@@transducer/result"](this.xf["@@transducer/step"](t,this.lastIdx))},t.prototype["@@transducer/step"]=function(t,n){return this.idx+=1,this.f(n)&&(this.lastIdx=this.idx),t},t}(),c=Object(e.a)(function(t,n){return new u(t,n)});n.a=c;},function(t,n,r){var e=r(1),a=r(77),u=Object(e.a)(Object(a.a)(!0));n.a=u;},function(t,n,r){var e=r(23),a=r(0),u=Object(a.a)(Object(e.a)("forEach",function(t,n){for(var r=n.length,e=0;e<r;)t(n[e]),e+=1;return n}));n.a=u;},function(t,n,r){var e=r(0),a=r(13),u=Object(e.a)(function(t,n){for(var r=Object(a.a)(n),e=0;e<r.length;){var u=r[e];t(n[u],u,n),e+=1;}return n});n.a=u;},function(t,n,r){var e=r(1),a=Object(e.a)(function(t){for(var n={},r=0;r<t.length;)n[t[r][0]]=t[r][1],r+=1;return n});n.a=a;},function(t,n,r){var e=r(23),a=r(0),u=r(39),c=Object(a.a)(Object(e.a)("groupBy",Object(u.a)(function(t,n){return null==t&&(t=[]),t.push(n),t},null)));n.a=c;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){for(var r=[],e=0,a=n.length;e<a;){for(var u=e+1;u<a&&t(n[u-1],n[u]);)u+=1;r.push(n.slice(e,u)),e=u;}return r});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return t>n});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return t>=n});n.a=a;},function(t,n,r){var e=r(0),a=r(6),u=Object(e.a)(a.a);n.a=u;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return t in n});n.a=a;},function(t,n,r){var e=r(25),a=Object(e.a)(0);n.a=a;},function(t,n,r){var e=r(2),a=r(5),u=Object(e.a)(function(t,n,r){return Object(a.a)(Math.max(t.length,n.length,r.length),function(){return t.apply(this,arguments)?n.apply(this,arguments):r.apply(this,arguments)})});n.a=u;},function(t,n,r){var e=r(28),a=Object(e.a)(1);n.a=a;},function(t,n,r){var e=r(39),a=Object(e.a)(function(t,n){return n},null);n.a=a;},function(t,n,r){var e=r(0),a=r(84),u=r(15),c=Object(e.a)(function(t,n){return "function"!=typeof n.indexOf||Object(u.a)(n)?Object(a.a)(n,t,0):n.indexOf(t)});n.a=c;},function(t,n,r){var e=r(11),a=Object(e.a)(0,-1);n.a=a;},function(t,n,r){var e=r(37),a=r(2),u=r(54),c=Object(a.a)(function(t,n,r){return Object(u.a)(function(n){return Object(e.a)(t,n,r)},n)});n.a=c;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){t=t<r.length&&t>=0?t:r.length;var e=Array.prototype.slice.call(r,0);return e.splice(t,0,n),e});n.a=a;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){return t=t<r.length&&t>=0?t:r.length,[].concat(Array.prototype.slice.call(r,0,t),n,Array.prototype.slice.call(r,t))});n.a=a;},function(t,n,r){var e=r(20),a=r(0),u=r(54),c=r(40),i=r(60),o=Object(a.a)(function(t,n){var r,a;return t.length>n.length?(r=t,a=n):(r=n,a=t),Object(i.a)(Object(u.a)(Object(c.a)(e.a)(r),a))});n.a=o;},function(t,n,r){function e(t,n,r){var e,u=typeof t;switch(u){case"string":case"number":return 0===t&&1/t==-1/0?!!r._items["-0"]||(n&&(r._items["-0"]=!0),!1):null!==r._nativeSet?n?(e=r._nativeSet.size,r._nativeSet.add(t),r._nativeSet.size===e):r._nativeSet.has(t):u in r._items?t in r._items[u]||(n&&(r._items[u][t]=!0),!1):(n&&(r._items[u]={},r._items[u][t]=!0),!1);case"boolean":if(u in r._items){var c=t?1:0;return !!r._items[u][c]||(n&&(r._items[u][c]=!0),!1)}return n&&(r._items[u]=t?[!1,!0]:[!0,!1]),!1;case"function":return null!==r._nativeSet?n?(e=r._nativeSet.size,r._nativeSet.add(t),r._nativeSet.size===e):r._nativeSet.has(t):u in r._items?!!Object(a.a)(t,r._items[u])||(n&&r._items[u].push(t),!1):(n&&(r._items[u]=[t]),!1);case"undefined":return !!r._items[u]||(n&&(r._items[u]=!0),!1);case"object":if(null===t)return !!r._items.null||(n&&(r._items.null=!0),!1);default:return u=Object.prototype.toString.call(t),u in r._items?!!Object(a.a)(t,r._items[u])||(n&&r._items[u].push(t),!1):(n&&(r._items[u]=[t]),!1)}}var a=r(20),u=function(){function t(){this._nativeSet="function"==typeof Set?new Set:null,this._items={};}return t.prototype.add=function(t){return !e(t,!0,this)},t.prototype.has=function(t){return e(t,!1,this)},t}();n.a=u;},function(t,n,r){var e=r(23),a=r(0),u=Object(a.a)(Object(e.a)("intersperse",function(t,n){for(var r=[],e=0,a=n.length;e<a;)e===a-1?r.push(n[e]):r.push(n[e],t),e+=1;return r}));n.a=u;},function(t,n,r){var e=r(78),a=r(2),u=r(43),c=r(8),i=r(219),o=Object(a.a)(function(t,n,r){return Object(u.a)(t)?Object(c.a)(n(t),t["@@transducer/init"](),r):Object(c.a)(n(Object(i.a)(t)),Object(e.a)(t,[],[],!1),r)});n.a=o;},function(t,n,r){function e(t){if(Object(i.a)(t))return t;if(Object(c.a)(t))return s;if("string"==typeof t)return f;if("object"==typeof t)return l;throw new Error("Cannot create transformer for "+t)}n.a=e;var a=r(61),u=r(59),c=r(31),i=r(43),o=r(102),s={"@@transducer/init":Array,"@@transducer/step":function(t,n){return t.push(n),t},"@@transducer/result":u.a},f={"@@transducer/init":String,"@@transducer/step":function(t,n){return t+n},"@@transducer/result":u.a},l={"@@transducer/init":Object,"@@transducer/step":function(t,n){return Object(a.a)(t,Object(c.a)(n)?Object(o.a)(n[0],n[1]):n)},"@@transducer/result":u.a};},function(t,n,r){function e(t){if(null==t)throw new TypeError("Cannot convert undefined or null to object");for(var n=Object(t),r=1,e=arguments.length;r<e;){var u=arguments[r];if(null!=u)for(var c in u)Object(a.a)(c,u)&&(n[c]=u[c]);r+=1;}return n}n.a=e;var a=r(6);},function(t,n,r){var e=r(1),a=r(6),u=r(13),c=Object(e.a)(function(t){for(var n=Object(u.a)(t),r=n.length,e=0,c={};e<r;){var i=n[e],o=t[i],s=Object(a.a)(o,c)?c[o]:c[o]=[];s[s.length]=i,e+=1;}return c});n.a=c;},function(t,n,r){var e=r(1),a=r(13),u=Object(e.a)(function(t){for(var n=Object(a.a)(t),r=n.length,e=0,u={};e<r;){var c=n[e];u[t[c]]=c,e+=1;}return u});n.a=u;},function(t,n,r){var e=r(1),a=r(99),u=r(9),c=Object(e.a)(function(t){return null!=t&&Object(u.a)(t,Object(a.a)(t))});n.a=c;},function(t,n,r){var e=r(26),a=Object(e.a)(1,"join");n.a=a;},function(t,n,r){var e=r(1),a=Object(e.a)(function(t){var n,r=[];for(n in t)r[r.length]=n;return r});n.a=a;},function(t,n,r){var e=r(0),a=r(15),u=r(9),c=Object(e.a)(function(t,n){if("function"!=typeof n.lastIndexOf||Object(a.a)(n)){for(var r=n.length-1;r>=0;){if(Object(u.a)(n[r],t))return r;r-=1;}return -1}return n.lastIndexOf(t)});n.a=c;},function(t,n,r){var e=r(1),a=r(41),u=r(25),c=r(56),i=Object(e.a)(function(t){return Object(a.a)(Object(u.a)(t),Object(c.a)(t))});n.a=i;},function(t,n,r){var e=r(1),a=r(74),u=r(41),c=r(19),i=Object(e.a)(function(t){return Object(u.a)(Object(c.a)(t),Object(a.a)(t))});n.a=i;},function(t,n,r){var e=r(1),a=r(32),u=r(41),c=r(44),i=Object(e.a)(function(t){return Object(u.a)(Object(c.a)(t),Object(a.a)(t))});n.a=i;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return t<n});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return t<=n});n.a=a;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){for(var e=0,a=r.length,u=[],c=[n];e<a;)c=t(c[0],r[e]),u[e]=c[1],e+=1;return [c[0],u]});n.a=a;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){for(var e=r.length-1,a=[],u=[n];e>=0;)u=t(r[e],u[0]),a[e]=u[1],e-=1;return [a,u[0]]});n.a=a;},function(t,n,r){var e=r(0),a=r(8),u=r(13),c=Object(e.a)(function(t,n){return Object(a.a)(function(r,e){return r[e]=t(n[e],e,n),r},{},Object(u.a)(n))});n.a=c;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return n.match(t)||[]});n.a=a;},function(t,n,r){var e=r(0),a=r(46),u=Object(e.a)(function(t,n){return Object(a.a)(t)?!Object(a.a)(n)||n<1?NaN:(t%n+n)%n:NaN});n.a=u;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){return t(r)>t(n)?r:n});n.a=a;},function(t,n,r){var e=r(1),a=r(107),u=Object(e.a)(function(t){var n=t.length;if(0===n)return NaN;var r=2-n%2,e=(n-r)/2;return Object(a.a)(Array.prototype.slice.call(t,0).sort(function(t,n){return t<n?-1:t>n?1:0}).slice(e,e+r))});n.a=u;},function(t,n,r){var e=r(109),a=r(24),u=Object(e.a)(function(){return Object(a.a)(arguments)});n.a=u;},function(t,n,r){var e=r(61),a=r(0),u=Object(a.a)(function(t,n){return Object(e.a)({},t,n)});n.a=u;},function(t,n,r){var e=r(61),a=r(1),u=Object(a.a)(function(t){return e.a.apply(null,[{}].concat(t))});n.a=u;},function(t,n,r){var e=r(0),a=r(42),u=Object(e.a)(function(t,n){return Object(a.a)(function(t,n,r){return n},t,n)});n.a=u;},function(t,n,r){var e=r(0),a=r(42),u=Object(e.a)(function(t,n){return Object(a.a)(function(t,n,r){return r},t,n)});n.a=u;},function(t,n,r){var e=r(2),a=r(42),u=Object(e.a)(function(t,n,r){return Object(a.a)(function(n,r,e){return t(r,e)},n,r)});n.a=u;},function(t,n,r){var e=r(2),a=r(62),u=Object(e.a)(function(t,n,r){return Object(a.a)(function(n,r,e){return t(r,e)},n,r)});n.a=u;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return n<t?n:t});n.a=a;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){return t(r)<t(n)?r:n});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return t%n});n.a=a;},function(t,n,r){var e=r(1),a=Object(e.a)(function(t){return -t});n.a=a;},function(t,n,r){var e=r(86),a=r(0),u=r(3),c=r(71),i=r(70),o=Object(a.a)(Object(e.a)(Object(u.a)(["any"],c.a,i.a)));n.a=o;},function(t,n,r){var e=r(1),a=r(5),u=r(25),c=Object(e.a)(function(t){var n=t<0?1:t+1;return Object(a.a)(n,function(){return Object(u.a)(t,arguments)})});n.a=c;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){return t(n(r))});n.a=a;},function(t,n,r){var e=r(1),a=r(254),u=Object(e.a)(a.a);n.a=u;},function(t,n,r){function e(t){return [t]}n.a=e;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){for(var r={},e={},a=0,u=t.length;a<u;)e[t[a]]=1,a+=1;for(var c in n)e.hasOwnProperty(c)||(r[c]=n[c]);return r});n.a=a;},function(t,n,r){var e=r(12),a=r(1),u=Object(a.a)(function(t){var n,r=!1;return Object(e.a)(t.length,function(){return r?n:(r=!0,n=t.apply(this,arguments))})});n.a=u;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return [t,n]});n.a=a;},function(t,n,r){var e=r(10),a=r(112),u=Object(a.a)(e.a);n.a=u;},function(t,n,r){var e=r(10),a=r(112),u=r(40),c=Object(a.a)(Object(u.a)(e.a));n.a=c;},function(t,n,r){var e=r(53),a=r(104),u=r(38),c=Object(a.a)([e.a,u.a]);n.a=c;},function(t,n,r){var e=r(2),a=r(9),u=r(19),c=Object(e.a)(function(t,n,r){return Object(a.a)(Object(u.a)(t,r),n)});n.a=c;},function(t,n,r){var e=r(2),a=r(89),u=r(19),c=Object(e.a)(function(t,n,r){return Object(a.a)(t,Object(u.a)(n,r))});n.a=c;},function(t,n,r){var e=r(2),a=r(19),u=Object(e.a)(function(t,n,r){return n.length>0&&t(Object(a.a)(n,r))});n.a=u;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){for(var r={},e=0;e<t.length;)t[e]in n&&(r[t[e]]=n[t[e]]),e+=1;return r});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){var r={};for(var e in n)t(n[e],e,n)&&(r[e]=n[e]);return r});n.a=a;},function(t,n,r){function e(){if(0===arguments.length)throw new Error("pipeK requires at least one argument");return a.a.apply(this,Object(u.a)(arguments))}n.a=e;var a=r(82),u=r(36);},function(t,n,r){var e=r(110),a=r(14),u=Object(a.a)(e.a,1);n.a=u;},function(t,n,r){var e=r(30),a=r(58),u=r(113),c=r(115),i=Object(c.a)(e.a,[u.a,a.a]);n.a=i;},function(t,n,r){var e=r(2),a=r(9),u=Object(e.a)(function(t,n,r){return Object(a.a)(n,r[t])});n.a=u;},function(t,n,r){var e=r(2),a=r(103),u=Object(e.a)(function(t,n,r){return Object(a.a)(t,r[n])});n.a=u;},function(t,n,r){var e=r(2),a=r(6),u=Object(e.a)(function(t,n,r){return null!=r&&Object(a.a)(n,r)?r[n]:t});n.a=u;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){return t(r[n])});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){for(var r=t.length,e=[],a=0;a<r;)e[a]=n[t[a]],a+=1;return e});n.a=a;},function(t,n,r){var e=r(0),a=r(106),u=Object(e.a)(function(t,n){if(!Object(a.a)(t)||!Object(a.a)(n))throw new TypeError("Both arguments to range must be numbers");for(var r=[],e=t;e<n;)r.push(e),e+=1;return r});n.a=u;},function(t,n,r){var e=r(29),a=r(8),u=r(16),c=Object(e.a)(4,[],function(t,n,r,e){return Object(a.a)(function(r,e){return t(r,e)?n(r,e):Object(u.a)(r)},r,e)});n.a=c;},function(t,n,r){var e=r(1),a=r(16),u=Object(e.a)(a.a);n.a=u;},function(t,n,r){var e=r(0),a=r(17),u=r(117),c=Object(e.a)(function(t,n){return Object(u.a)(Object(a.a)(t),n)});n.a=c;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){return r.replace(t,n)});n.a=a;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){for(var e=0,a=r.length,u=[n];e<a;)n=t(n,r[e]),u[e+1]=n,e+=1;return u});n.a=a;},function(t,n,r){var e=r(2),a=r(17),u=r(111),c=Object(e.a)(function(t,n,r){return Object(u.a)(t,Object(a.a)(n),r)});n.a=c;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return Array.prototype.slice.call(n,0).sort(t)});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return Array.prototype.slice.call(n,0).sort(function(n,r){var e=t(n),a=t(r);return e<a?-1:e>a?1:0})});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return Array.prototype.slice.call(n,0).sort(function(n,r){for(var e=0,a=0;0===e&&a<t.length;)e=t[a](n,r),a+=1;return e})});n.a=a;},function(t,n,r){var e=r(26),a=Object(e.a)(1,"split");n.a=a;},function(t,n,r){var e=r(0),a=r(105),u=r(11),c=Object(e.a)(function(t,n){return [Object(u.a)(0,t,n),Object(u.a)(t,Object(a.a)(n),n)]});n.a=c;},function(t,n,r){var e=r(0),a=r(11),u=Object(e.a)(function(t,n){if(t<=0)throw new Error("First argument to splitEvery must be a positive integer");for(var r=[],e=0;e<n.length;)r.push(Object(a.a)(e,e+=t,n));return r});n.a=u;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){for(var r=0,e=n.length,a=[];r<e&&!t(n[r]);)a.push(n[r]),r+=1;return [a,Array.prototype.slice.call(n,r)]});n.a=a;},function(t,n,r){var e=r(0),a=r(9),u=r(57),c=Object(e.a)(function(t,n){return Object(a.a)(Object(u.a)(t.length,n),t)});n.a=c;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){return Number(t)-Number(n)});n.a=a;},function(t,n,r){var e=r(0),a=r(52),u=r(90),c=Object(e.a)(function(t,n){return Object(a.a)(Object(u.a)(t,n),Object(u.a)(n,t))});n.a=c;},function(t,n,r){var e=r(2),a=r(52),u=r(91),c=Object(e.a)(function(t,n,r){return Object(a.a)(Object(u.a)(t,n,r),Object(u.a)(t,r,n))});n.a=c;},function(t,n,r){var e=r(0),a=r(11),u=Object(e.a)(function(t,n){for(var r=n.length-1;r>=0&&t(n[r]);)r-=1;return Object(a.a)(r+1,1/0,n)});n.a=u;},function(t,n,r){var e=r(0),a=r(3),u=r(294),c=r(11),i=Object(e.a)(Object(a.a)(["takeWhile"],u.a,function(t,n){for(var r=0,e=n.length;r<e&&t(n[r]);)r+=1;return Object(c.a)(0,r,n)}));n.a=i;},function(t,n,r){var e=r(0),a=r(16),u=r(4),c=function(){function t(t,n){this.xf=n,this.f=t;}return t.prototype["@@transducer/init"]=u.a.init,t.prototype["@@transducer/result"]=u.a.result,t.prototype["@@transducer/step"]=function(t,n){return this.f(n)?this.xf["@@transducer/step"](t,n):Object(a.a)(t)},t}(),i=Object(e.a)(function(t,n){return new c(t,n)});n.a=i;},function(t,n,r){var e=r(0),a=r(3),u=r(296),c=Object(e.a)(Object(a.a)([],u.a,function(t,n){return t(n),n}));n.a=c;},function(t,n,r){var e=r(0),a=r(4),u=function(){function t(t,n){this.xf=n,this.f=t;}return t.prototype["@@transducer/init"]=a.a.init,t.prototype["@@transducer/result"]=a.a.result,t.prototype["@@transducer/step"]=function(t,n){return this.f(n),this.xf["@@transducer/step"](t,n)},t}(),c=Object(e.a)(function(t,n){return new u(t,n)});n.a=c;},function(t,n,r){var e=r(79),a=r(0),u=r(298),c=r(24),i=Object(a.a)(function(t,n){if(!Object(u.a)(t))throw new TypeError("‘test’ requires a value of type RegExp as its first argument; received "+Object(c.a)(t));return Object(e.a)(t).test(n)});n.a=i;},function(t,n,r){function e(t){return "[object RegExp]"===Object.prototype.toString.call(t)}n.a=e;},function(t,n,r){var e=r(26),a=Object(e.a)(0,"toLowerCase");n.a=a;},function(t,n,r){var e=r(1),a=r(6),u=Object(e.a)(function(t){var n=[];for(var r in t)Object(a.a)(r,t)&&(n[n.length]=[r,t[r]]);return n});n.a=u;},function(t,n,r){var e=r(1),a=Object(e.a)(function(t){var n=[];for(var r in t)n[n.length]=[r,t[r]];return n});n.a=a;},function(t,n,r){var e=r(26),a=Object(e.a)(0,"toUpperCase");n.a=a;},function(t,n,r){var e=r(8),a=r(66),u=r(5),c=Object(u.a)(4,function(t,n,r,u){return Object(e.a)(t("function"==typeof n?Object(a.a)(n):n),r,u)});n.a=c;},function(t,n,r){var e=r(1),a=Object(e.a)(function(t){for(var n=0,r=[];n<t.length;){for(var e=t[n],a=0;a<e.length;)void 0===r[a]&&(r[a]=[]),r[a].push(e[a]),a+=1;n+=1;}return r});n.a=a;},function(t,n,r){var e=r(2),a=r(7),u=r(118),c=Object(e.a)(function(t,n,r){return "function"==typeof r["fantasy-land/traverse"]?r["fantasy-land/traverse"](n,t):Object(u.a)(t,Object(a.a)(n,r))});n.a=c;},function(t,n,r){var e=r(1),a="\t\n\v\f\r   ᠎             　\u2028\u2029\ufeff",u="​",c="function"==typeof String.prototype.trim,i=c&&!a.trim()&&u.trim()?function(t){return t.trim()}:function(t){var n=new RegExp("^["+a+"]["+a+"]*"),r=new RegExp("["+a+"]["+a+"]*$");return t.replace(n,"").replace(r,"")},o=Object(e.a)(i);n.a=o;},function(t,n,r){var e=r(12),a=r(10),u=r(0),c=Object(u.a)(function(t,n){return Object(e.a)(t.length,function(){try{return t.apply(this,arguments)}catch(t){return n.apply(this,Object(a.a)([t],arguments))}})});n.a=c;},function(t,n,r){var e=r(1),a=Object(e.a)(function(t){return function(){return t(Array.prototype.slice.call(arguments,0))}});n.a=a;},function(t,n,r){var e=r(1),a=r(33),u=Object(e.a)(function(t){return Object(a.a)(1,t)});n.a=u;},function(t,n,r){var e=r(0),a=r(5),u=Object(e.a)(function(t,n){return Object(a.a)(t,function(){for(var r,e=1,a=n,u=0;e<=t&&"function"==typeof a;)r=e===t?arguments.length:u+a.length,a=a.apply(this,Array.prototype.slice.call(arguments,u,r)),e+=1,u=r;return a})});n.a=u;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){for(var r=t(n),e=[];r&&r.length;)e[e.length]=r[0],r=t(r[1]);return e});n.a=a;},function(t,n,r){var e=r(10),a=r(0),u=r(50),c=r(60),i=Object(a.a)(Object(u.a)(c.a,e.a));n.a=i;},function(t,n,r){var e=r(10),a=r(2),u=r(119),c=Object(a.a)(function(t,n,r){return Object(u.a)(t,Object(e.a)(n,r))});n.a=c;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){return t(r)?r:n(r)});n.a=a;},function(t,n,r){var e=r(59),a=r(48),u=Object(a.a)(e.a);n.a=u;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){for(var e=r;!t(e);)e=n(e);return e});n.a=a;},function(t,n,r){var e=r(1),a=Object(e.a)(function(t){var n,r=[];for(n in t)r[r.length]=t[n];return r});n.a=a;},function(t,n,r){var e=r(0),a=function(t){return {value:t,"fantasy-land/map":function(){return this}}},u=Object(e.a)(function(t,n){return t(a)(n).value});n.a=u;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){return t(r)?n(r):r});n.a=a;},function(t,n,r){var e=r(0),a=r(9),u=r(7),c=r(120),i=Object(e.a)(function(t,n){return Object(c.a)(Object(u.a)(a.a,t),n)});n.a=i;},function(t,n,r){var e=r(20),a=r(0),u=r(40),c=r(38),i=Object(a.a)(function(t,n){return Object(c.a)(Object(u.a)(e.a)(t),n)});n.a=i;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){for(var r,e=0,a=t.length,u=n.length,c=[];e<a;){for(r=0;r<u;)c[c.length]=[t[e],n[r]],r+=1;e+=1;}return c});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){for(var r=[],e=0,a=Math.min(t.length,n.length);e<a;)r[e]=[t[e],n[e]],e+=1;return r});n.a=a;},function(t,n,r){var e=r(0),a=Object(e.a)(function(t,n){for(var r=0,e=Math.min(t.length,n.length),a={};r<e;)a[t[r]]=n[r],r+=1;return a});n.a=a;},function(t,n,r){var e=r(2),a=Object(e.a)(function(t,n,r){for(var e=[],a=0,u=Math.min(n.length,r.length);a<u;)e[a]=t(n[a],r[a]),a+=1;return e});n.a=a;},function(t,n,r){n.__esModule=!0;var e=r(63),a=function(){function t(t,n,r){this.type=t,this.text=n,this.spans=r;}return t.isEmbedBlock=function(t){return t===e.NODE_TYPES.embed},t.isImageBlock=function(t){return t===e.NODE_TYPES.image},t.isList=function(t){return t===e.NODE_TYPES.list},t.isOrderedList=function(t){return t===e.NODE_TYPES.oList},t.isListItem=function(t){return t===e.NODE_TYPES.listItem},t.isOrderedListItem=function(t){return t===e.NODE_TYPES.oListItem},t.emptyList=function(){return {type:e.NODE_TYPES.list,spans:[],text:""}},t.emptyOrderedList=function(){return {type:e.NODE_TYPES.oList,spans:[],text:""}},t}();n.RichTextBlock=a;},function(t,n,r){function e(t,n,r){return u.default.fromRichText(t).children.map(function(t,e){return a(t,n,e,r)})}function a(t,n,r,e){function a(t,r){var u=t instanceof c.SpanNode?t.text:null,i=t.children.reduce(function(t,n,r){return t.concat([a(n,r)])},[]);return e&&e(t.type,t.element,u,i,r)||n(t.type,t.element,u,i,r)}return a(t,r)}n.__esModule=!0;var u=r(64),c=r(122);n.default=e;}])}();}();},function(t,n,r){t.exports=r(1);}])});
	});

	var prismicDOM = unwrapExports(prismicDom_min);
	var prismicDom_min_1 = prismicDom_min.PrismicDOM;

	//

	var script$3 = {
	  name: 'PrismicLink',
	  props: {
	    field: {
	      required: true
	    }
	  },
	  computed: {
	    linkComponent: function linkComponent() {
	      if (!this.field) {
	        return null;
	      }

	      var template = '';
	      var url = prismicDOM.Link.url(this.field, this.$prismic.linkResolver);

	      if (this.field.link_type === 'Document') {
	        template = '\n          <router-link to="' + url + '">\n            <slot/>\n          </router-link>\n        ';
	      } else {
	        var target = this.field.target ? 'target="\'' + this.field.target + '\'" rel="noopener"' : '';

	        template = '\n          <a href="' + url + '" ' + target + '>\n            <slot/>\n          </a>\n        ';
	      }
	      return { template: template };
	    }
	  }
	};

	var __vue_script__$3 = script$3;

	/* template */
	var __vue_render__$3 = function __vue_render__() {
	  var _vm = this;
	  var _h = _vm.$createElement;
	  var _c = _vm._self._c || _h;
	  return _c(_vm.linkComponent, { tag: "component" }, [_vm._t("default")], 2);
	};
	var __vue_staticRenderFns__$3 = [];
	__vue_render__$3._withStripped = true;

	var __vue_template__$3 = typeof __vue_render__$3 !== 'undefined' ? { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 } : {};
	/* style */
	var __vue_inject_styles__$3 = undefined;
	/* scoped */
	var __vue_scope_id__$3 = undefined;
	/* module identifier */
	var __vue_module_identifier__$3 = undefined;
	/* functional template */
	var __vue_is_functional_template__$3 = false;
	/* component normalizer */
	function __vue_normalize__$3(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
	  var component = (typeof script === 'function' ? script.options : script) || {};

	  {
	    component.__file = "/Users/jbdebiasio/dev/prismic-vue/src/components/Link.vue";
	  }

	  if (!component.render) {
	    component.render = template.render;
	    component.staticRenderFns = template.staticRenderFns;
	    component._compiled = true;

	    if (functional) component.functional = true;
	  }

	  component._scopeId = scope;

	  return component;
	}
	/* style inject */
	function __vue_create_injector__$3() {
	  var head = document.head || document.getElementsByTagName('head')[0];
	  var styles = __vue_create_injector__$3.styles || (__vue_create_injector__$3.styles = {});
	  var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

	  return function addStyle(id, css) {
	    if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) return; // SSR styles are present.

	    var group = isOldIE ? css.media || 'default' : id;
	    var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

	    if (!style.ids.includes(id)) {
	      var code = css.source;
	      var index = style.ids.length;

	      style.ids.push(id);

	      if (isOldIE) {
	        style.element = style.element || document.querySelector('style[data-group=' + group + ']');
	      }

	      if (!style.element) {
	        var el = style.element = document.createElement('style');
	        el.type = 'text/css';

	        if (css.media) el.setAttribute('media', css.media);
	        if (isOldIE) {
	          el.setAttribute('data-group', group);
	          el.setAttribute('data-next-index', '0');
	        }

	        head.appendChild(el);
	      }

	      if (isOldIE) {
	        index = parseInt(style.element.getAttribute('data-next-index'));
	        style.element.setAttribute('data-next-index', index + 1);
	      }

	      if (style.element.styleSheet) {
	        style.parts.push(code);
	        style.element.styleSheet.cssText = style.parts.filter(Boolean).join('\n');
	      } else {
	        var textNode = document.createTextNode(code);
	        var nodes = style.element.childNodes;
	        if (nodes[index]) style.element.removeChild(nodes[index]);
	        if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
	      }
	    }
	  };
	}
	/* style inject SSR */

	var Link = __vue_normalize__$3(__vue_template__$3, __vue_inject_styles__$3, typeof __vue_script__$3 === 'undefined' ? {} : __vue_script__$3, __vue_scope_id__$3, __vue_is_functional_template__$3, __vue_module_identifier__$3, typeof __vue_create_injector__$3 !== 'undefined' ? __vue_create_injector__$3 : function () {}, typeof __vue_create_injector_ssr__ !== 'undefined' ? __vue_create_injector_ssr__ : function () {});

	//

	var script$4 = {
	  name: 'PrismicRichText',
	  props: {
	    field: {
	      required: true
	    },
	    isPlain: {
	      type: Boolean,
	      required: false,
	      default: false
	    },
	    htmlSerializer: {
	      type: Function,
	      required: false
	    }
	  },
	  computed: {
	    richTextComponent: function richTextComponent() {
	      if (!this.field) {
	        return null;
	      }

	      var template = '';

	      if (this.isPlain === false) {
	        template = '\n          <div>\n            ' + prismicDOM.RichText.asHtml(this.field, this.$prismic.linkResolver, this.htmlSerializer || this.$prismic.htmlSerializer) + '\n          </div>\n        ';
	      } else {
	        template = '<span>' + prismicDOM.RichText.asText(this.field) + '</span>';
	      }
	      return { template: template };
	    }
	  }
	};

	var __vue_script__$4 = script$4;

	/* template */
	var __vue_render__$4 = function __vue_render__() {
	  var _vm = this;
	  var _h = _vm.$createElement;
	  var _c = _vm._self._c || _h;
	  return _c(_vm.richTextComponent, { tag: "component" });
	};
	var __vue_staticRenderFns__$4 = [];
	__vue_render__$4._withStripped = true;

	var __vue_template__$4 = typeof __vue_render__$4 !== 'undefined' ? { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 } : {};
	/* style */
	var __vue_inject_styles__$4 = undefined;
	/* scoped */
	var __vue_scope_id__$4 = undefined;
	/* module identifier */
	var __vue_module_identifier__$4 = undefined;
	/* functional template */
	var __vue_is_functional_template__$4 = false;
	/* component normalizer */
	function __vue_normalize__$4(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
	  var component = (typeof script === 'function' ? script.options : script) || {};

	  {
	    component.__file = "/Users/jbdebiasio/dev/prismic-vue/src/components/RichText.vue";
	  }

	  if (!component.render) {
	    component.render = template.render;
	    component.staticRenderFns = template.staticRenderFns;
	    component._compiled = true;

	    if (functional) component.functional = true;
	  }

	  component._scopeId = scope;

	  return component;
	}
	/* style inject */
	function __vue_create_injector__$4() {
	  var head = document.head || document.getElementsByTagName('head')[0];
	  var styles = __vue_create_injector__$4.styles || (__vue_create_injector__$4.styles = {});
	  var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

	  return function addStyle(id, css) {
	    if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) return; // SSR styles are present.

	    var group = isOldIE ? css.media || 'default' : id;
	    var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

	    if (!style.ids.includes(id)) {
	      var code = css.source;
	      var index = style.ids.length;

	      style.ids.push(id);

	      if (isOldIE) {
	        style.element = style.element || document.querySelector('style[data-group=' + group + ']');
	      }

	      if (!style.element) {
	        var el = style.element = document.createElement('style');
	        el.type = 'text/css';

	        if (css.media) el.setAttribute('media', css.media);
	        if (isOldIE) {
	          el.setAttribute('data-group', group);
	          el.setAttribute('data-next-index', '0');
	        }

	        head.appendChild(el);
	      }

	      if (isOldIE) {
	        index = parseInt(style.element.getAttribute('data-next-index'));
	        style.element.setAttribute('data-next-index', index + 1);
	      }

	      if (style.element.styleSheet) {
	        style.parts.push(code);
	        style.element.styleSheet.cssText = style.parts.filter(Boolean).join('\n');
	      } else {
	        var textNode = document.createTextNode(code);
	        var nodes = style.element.childNodes;
	        if (nodes[index]) style.element.removeChild(nodes[index]);
	        if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
	      }
	    }
	  };
	}
	/* style inject SSR */

	var RichText = __vue_normalize__$4(__vue_template__$4, __vue_inject_styles__$4, typeof __vue_script__$4 === 'undefined' ? {} : __vue_script__$4, __vue_scope_id__$4, __vue_is_functional_template__$4, __vue_module_identifier__$4, typeof __vue_create_injector__$4 !== 'undefined' ? __vue_create_injector__$4 : function () {}, typeof __vue_create_injector_ssr__ !== 'undefined' ? __vue_create_injector_ssr__ : function () {});

	var PrismicVue = {
	  install: function install(Vue) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    Vue.prototype.$prismic = prismic;
	    Vue.prototype.$prismic.endpoint = options.endpoint;
	    Vue.prototype.$prismic.linkResolver = options.linkResolver;
	    Vue.prototype.$prismic.htmlSerializer = options.htmlSerializer;

	    Vue.component('PrismicEditButton', EditButton);
	    Vue.component('PrismicEmbed', Embed);
	    Vue.component('PrismicImage', Image);
	    Vue.component('PrismicLink', Link);
	    Vue.component('PrismicRichText', RichText);
	  }
	};

	return PrismicVue;

})));
