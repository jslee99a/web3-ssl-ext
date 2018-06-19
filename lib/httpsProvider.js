/*
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/** @file httpsprovider.js
 * @authors:
 *   Jongseok Lee <aristos2@sk.com>
 * @date 2018
 */

var errors = require('web3-core-helpers').errors;
var XHR2 = require('xhr2'); // jshint ignore: line
const http = require('http');
const https = require('https');

/**
 * HttpProvider should be used to send rpc calls over http
 */
var HttpsProvider = function HttpProvider(host, clientKey, clientCert, caCert, timeout, headers) {
    this.host = host || 'http://localhost:8545';
    this.timeout = timeout || 0;
    this.connected = false;
    this.headers = headers;
    this.clientKey = clientKey;
    this.clientCert = clientCert;
    this.caCert = caCert;

};


HttpsProvider.prototype._prepareRequest = function(){


    XHR2.XMLHttpRequest.prototype.setClientTLS = function (clientKey, clientCert, caCert){
        this._clientKey = clientKey;
        this._clientCert = clientCert;
        this._caCert = caCert;
    };


    XHR2.XMLHttpRequest.prototype._sendHxxpRequest = function() {
        var agent, hxxp, request;
//        console.log ("clientKey : " + this._clientKey + ", clientCert : " + this._clientCert);
        if (this._url.protocol === 'http:') {
            hxxp = http;
            agent = this.nodejsHttpAgent;
        } else {
            hxxp = https;
            agent = this.nodejsHttpsAgent;
        }
        request = hxxp.request({
            hostname: this._url.hostname,
            port: this._url.port,
            path: this._url.path,
            auth: this._url.auth,
            method: this._method,
            headers: this._headers,
            key: this._clientKey,
            cert: this._clientCert,
            ca : this._caCert,
            agent: agent
        });
        this._request = request;
        if (this.timeout) {
            request.setTimeout(this.timeout, (function(_this) {
                return function() {
                    return _this._onHttpTimeout(request);
                };
            })(this));
        }
        request.on('response', (function(_this) {
            return function(response) {
                return _this._onHttpResponse(request, response);
            };
        })(this));
        request.on('error', (function(_this) {
            return function(error) {
                return _this._onHttpRequestError(request, error);
            };
        })(this));
        this.upload._startUpload(request);
        if (this._request === request) {
            this._dispatchProgress('loadstart');
        }
        return void 0;
    };

    var request = new XHR2();

    request.setClientTLS(this.clientKey , this.clientCert, this.caCert );

    request.open('POST', this.host, true);
    request.setRequestHeader('Content-Type','application/json');

    if(this.headers) {
        this.headers.forEach(function(header) {
            request.setRequestHeader(header.name, header.value);
        });
    }

    return request;
};

/**
 * Should be used to make async request
 *
 * @method send
 * @param {Object} payload
 * @param {Function} callback triggered on end with (err, result)
 */
HttpsProvider.prototype.send = function (payload, callback) {
    var _this = this;
    var request = this._prepareRequest();


    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.timeout !== 1) {
            var result = request.responseText;
            var error = null;

            try {
                result = JSON.parse(result);
            } catch(e) {
                error = errors.InvalidResponse(request.responseText);
            }

            _this.connected = true;
            callback(error, result);
        }
    };

    request.ontimeout = function() {
        _this.connected = false;
        callback(errors.ConnectionTimeout(this.timeout));
    };

    try {
        request.send(JSON.stringify(payload));
    } catch(error) {
        this.connected = false;
        callback(errors.InvalidConnection(this.host));
    }
};

module.exports = HttpsProvider;
