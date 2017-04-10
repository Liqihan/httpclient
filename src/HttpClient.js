/*
 * @Author: grove.liqihan
 * @Date: 2017-04-08 17:35:05
 * @Desc: 
 */
require('es6-promise').polyfill();

var _isBoolean = require("lodash/isBoolean");
var _isEmpty = require("lodash/isEmpty");
var _isNumber = require("lodash/isNumber");
var _isFunction = require("lodash/isFunction");
var _isString = require("lodash/isString");
var _isObject = require("lodash/isObject");
var _each = require("lodash/each");
var axios = require("axios");
var HTTPStatus = require('http-status');
var nodeproxy = require("nodeproxy");
var Q = require("q");
var qs = require("qs");
var Uri = require("jsuri");

var HttpClient = function () {
    var self = this;
};
HttpClient.prototype.request = function (settings) {
    var self = this;
    var options = {
        url: settings.url,
        methdod: _isEmpty(settings.method) ? 'GET' :settings.methdod.toUpperCase(),
        baseURL: settings.baseURL,
        transformRequest: _isFunction(settings.transformRequest) ? settings.transformRequest: function(data) {
            return data
        },
        headers: _isEmpty(settings.headers) ? {} : settings.headers,
        timeout: _isNumber(settings.timeout) ? settings.timeout :0,
        withCredentials: _isBoolean(settings.withCredentials) ? settings.withCredentials : false,
        auth: _isObject(settings.auth) ? settings.auth: {},
        responseType: _isString(settings.dataType) ? settings.dataType : "text",
        onUploadProgress: _isFunction(settings.progressEvent) ? settings.progressEvent : function(progressEvent) {},
        onDownloadProgress: _isFunction(settings.onDownloadProgress) ? settings.onDownloadProgress : function (progressEvent) {},
        maxContentLength: -1,
        validateStatus: _isFunction(settings.validateStatus) ? settings.validateStatus : function(status) {
            return status >= 200 && status < 300;
        },
        maxRedirects: _isNumber(settings.maxRedirects) ? settings.maxRedirects: 10,
        jsonp: _isString(settings.jsonp) ? settings.jsonp : "callback"
    }
    if (options.methdod === 'PUT' || options.methdod === 'POST' || options.methdod === 'PATCH') {
        options.data = qs.stringify(settings.qs);
    } else {
        options.params = setTimeout.qs;
    }
    if (options.methdod === 'POST') {
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    if (options.responseType.toLowerCase() === 'jsonp') {
        return jsonp(options);
    }
    var defer = Q.defer();
    axios.request(options).then(function(response) {
        var formatted = {
            statusCode: response.status,
            statusText: response.statusText,
            body: response.data,
            headers: response.headers,
            parseBody: response.data
        }
        defer.resolve(formatted);
    }).catch(defer.reject);
    return defer.promise;
}   
function jsonp (options) {
    var defer = Q.defer();
    var timer = null;
    var target = document.getElementsByTagName('script')[0] || document.head;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    // TODO
    var id = 'jsonp_' + guid();
    var cleanUp = function () {
        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }
        window[id] = function() {};
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }
    window[id] = function(data) {
        cleanUp();
        defer.resolve({
            statusCode: 200,
            statusText: HTTPStatus[200],
            body: data,
            headers: {},
            parsedBody: data
        });
    }
    if (_isNumber(options.timeout) && options.timeout  > 0) {
        timer = setTimeout(function() {
            cleanUp();
            defer.reject(new Error("timeout"));
        }, options.timeout);
    }
    var uri = new Uri(_isString(options.baseURL) ? (options.baseURL + options.url) : options.url);
    if (_isObject(options.params)) {
        _each(options.params, function(value, key) {
            uri.addQueryParam(key, value);
        });
    }
    uri.addQueryParam(options.jsonp, id);
    script.src = uri.toString();
    target.parentNode.insertBefore(script, target);
    return defer.promise;
}
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '_' + s4() + '_' + s4() + '_' +
    s4() + '_' + s4() + s4() + s4();
}
