/**
 * restclient.js
 *
 * Getting down with the funkiness that is the HTTP Client of node.js and making
 * it shine like jQuery. This library wraps up all the complexities of using node.js
 * to process HTTP requests and presents them in a simple format of:
 *
 * client.VERB(url, [data], [callback], [type])
 *
 * If you provide data it will be encoded and sent as part of the body. If you provide
 * a callback it will automatically be passed the resulting body message. If you provide
 * a type of "json", it will attempt to convert prior to issueing the callback.
 *
 * Oh and it wraps up Basic Auth as if it were bacon!
 *
 * @voodootikigod
 */
 
// the _url var is underscored to avoid conflicts with all the url vars in here
// I really didn't have much time to make this work with new nodejs versions ... (@jonashuckestein)
var http = require("http"), base64 = require("./base64"), _url = require("url"), sys=require("sys");


var RestClient = (function () {  
  
  /*!
   * param function is adapted from the 
   * jQuery JavaScript Library v1.3.2
   * http://jquery.com/
   *
   * param function is Copyright (c) 2009 John Resig
   * Dual licensed under the MIT and GPL licenses.
   * http://docs.jquery.com/License
   */
  var params = function( a ) {
    var s = [ ];
    function isArray( obj ) {
      return toString.call(obj) === "[object Array]";
    }
    function isFunction( obj ) {
      return toString.call(obj) === "[object Function]";
    }
    function add( key, value ){
      s[ s.length ] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
    };
    // Serialize the key/values
    for ( var j in a )
      // If the value is an array then the key names need to be repeated
      if ( isArray(a[j]) ) {
        var l = a[j].length;
        for(var i=0; i<l; i++) {
          add( j, a[j][i] );
        }
      } else {
        add( j, isFunction(a[j]) ? a[j]() : a[j] );
      }
    // Return the resulting serialization
    return s.join("&").replace(/%20/g, "+");
  };
  
  
  var rest_call = function (method, url, data, callback, type) {
    if (typeof data === "function")  {
      type = callback;
      callback = data;
    }
    if (typeof callback === "string") {
      type = callback;
    }
    var uri = _url.parse(url);
    var headers = {};
    if (!headers["Host"] && uri.host) {
      headers["Host"] = uri.host;
    }
    if (!headers["User-Agent"]) {
      headers["User-Agent"] = "Node.js HTTP Client";
    }
    if (!headers["Authorization"] && uri.user) {
      headers["Authorization"] = "Basic "+base64.encode(uri.user+":"+(uri.password||""));
    }
    var path = (uri.path || "/");
    var client = http.createClient((uri.port ||80), uri.host);
    var encoded_data = null;
    if (typeof data === "object") {
     encoded_data = params(data); 
     headers["Content-Length"] = encoded_data.length;
    }

    var result = client.request(method.toUpperCase(), uri.pathname, headers);
    if (encoded_data) {
      result.write(encoded_data);
    }
    result.end();
    if (typeof callback === "function") {
        var data_string = "";
        result.addListener("response", function(response) {
           response.addListener("data", function(chunk) {
              data_string += chunk;
           });
           response.addListener("end", function() {
               if (type == "json") {
                 callback(JSON.parse(data_string));
               } else {
                 callback(data_string);
               }
           });
        });
    }
    return result;
  };
  return {
    get: function(url, data, callback, type) {
      var res = rest_call('get', url, data, callback, type);
      return res;
    },
    post: function(url, data, callback, type) {
      var res = rest_call('post',url, data, callback, type);
      return res;
    },
    head: function(url, data, callback, type) {
      var res = rest_call('head', url, data, callback, type);
      return res;
    },
    put: function(url, data, callback, type) {
      var res = rest_call('put', url, data, callback, type);  
      return res;
    },
    del: function(url, data, callback, type) {
      var res = rest_call('del', url, data, callback, type);
      return res;
    }
  }
  
})()

exports.get = RestClient.get;
exports.post = RestClient.post;
exports.head = RestClient.head;
exports.put = RestClient.put;
exports.del = RestClient.del;