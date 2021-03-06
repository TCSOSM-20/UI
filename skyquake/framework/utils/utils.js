/*
 *
 *   Copyright 2016 RIFT.IO Inc
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
import AuthActions from '../widgets/login/loginAuthActions';
import $ from 'jquery';
import rw from './rw';
import appConfiguration from './appConfiguration'
import SockJS from 'sockjs-client';

var API_SERVER = rw.getSearchParams(window.location).api_server;
let NODE_PORT = rw.getSearchParams(window.location).api_port || ((window.location.protocol == 'https:') ? 8443 : 8000);

var Utils = {};

Utils.DescriptorModelMeta = null;

var INACTIVITY_TIMEOUT = 600000;

Utils.isMultiplexerLoaded = function() {
    if (window.multiplexer) {
        return true;
    }
    return false;
};

Utils.setupMultiplexClient = function() {
    var sockjs_url = '/multiplex';

    var sockjs = new SockJS(sockjs_url);

    var loadChecker = function() {
        try {
            window.multiplexer = new WebSocketMultiplex(sockjs);
            console.log('WebSocketMultiplex loaded');
        } catch (e) {
            // caught an error, retry in someTime
            console.log('WebSocketMultiplex not loaded yet. will try again in 1 second:', e);
            setTimeout(function() {
                loadChecker();
            }, 1000);
        }
    }
    loadChecker();
};

Utils.checkAndResolveSocketRequest = function(data, resolve, reject, successCallback) {
    const checker = () => {
        if (!Utils.isMultiplexerLoaded()) {
            setTimeout(() => {
                checker();
            }, 500);
        } else {
            if (!successCallback) {
                resolve(data.id);
            } else {
                //resolve handled in callback
                successCallback(data.id)
            }
        }
    };

    checker();
};

Utils.bootstrapApplication = function() {
    return new Promise((resolve, reject) => {
        Promise.all([appConfiguration.get()]).then(function(results) {
            INACTIVITY_TIMEOUT = results[0]['inactivity-timeout'];
            resolve();
        }, function(error) {
            console.log("Error bootstrapping application ", error);
            reject();
        });
    });
};

Utils.getDescriptorModelMeta = function() {
    return new Promise(function(resolve, reject) {
        if (!Utils.DescriptorModelMeta) {
            $.ajax({
                url: '/descriptor-model-meta?api_server=' + API_SERVER,
                type: 'GET',
                beforeSend: Utils.addAuthorizationStub,
                success: function(data) {
                    Utils.DescriptorModelMeta = data;
                    Utils.DescriptorModelMetaLoaded = true;
                    resolve(data);
                },
                error: function(error) {
                    console.log("There was an error getting the schema: ", error);
                    reject(error);
                }
            }).fail(function(xhr) {
                console.log("There was an error getting the schema: ", xhr);
                Utils.checkAuthentication(xhr.status);
            });
        } else {
            resolve(Utils.DescriptorModelMeta);
        }
    })
}

Utils.addAuthorizationStub = function(xhr) {
    // NO-OP now that we are dealing with it on the server
    // var Auth = window.sessionStorage.getItem("auth");
    // xhr.setRequestHeader('Authorization', 'Basic ' + Auth);
};

Utils.getByteDataWithUnitPrefix = function(number, precision) {
    var toPrecision = precision || 3;
    if (number < Math.pow(10, 3)) {
        return [number, 'B'];
    } else if (number < Math.pow(10, 6)) {
        return [(number / Math.pow(10, 3)).toPrecision(toPrecision), 'KB'];
    } else if (number < Math.pow(10, 9)) {
        return [(number / Math.pow(10, 6)).toPrecision(toPrecision), 'MB'];
    } else if (number < Math.pow(10, 12)) {
        return [(number / Math.pow(10, 9)).toPrecision(toPrecision), 'GB'];
    } else if (number < Math.pow(10, 15)) {
        return [(number / Math.pow(10, 12)).toPrecision(toPrecision), 'TB'];
    } else if (number < Math.pow(10, 18)) {
        return [(number / Math.pow(10, 15)).toPrecision(toPrecision), 'PB'];
    } else if (number < Math.pow(10, 21)) {
        return [(number / Math.pow(10, 18)).toPrecision(toPrecision), 'EB'];
    } else if (number < Math.pow(10, 24)) {
        return [(number / Math.pow(10, 21)).toPrecision(toPrecision), 'ZB'];
    } else if (number < Math.pow(10, 27)) {
        return [(number / Math.pow(10, 24)).toPrecision(toPrecision), 'ZB'];
    } else {
        return [(number / Math.pow(10, 27)).toPrecision(toPrecision), 'YB'];
    }
}

Utils.getPacketDataWithUnitPrefix = function(number, precision) {
    var toPrecision = precision || 3;
    if (number < Math.pow(10, 3)) {
        return [number, 'P'];
    } else if (number < Math.pow(10, 6)) {
        return [(number / Math.pow(10, 3)).toPrecision(toPrecision), 'KP'];
    } else if (number < Math.pow(10, 9)) {
        return [(number / Math.pow(10, 6)).toPrecision(toPrecision), 'MP'];
    } else if (number < Math.pow(10, 12)) {
        return [(number / Math.pow(10, 9)).toPrecision(toPrecision), 'GP'];
    } else if (number < Math.pow(10, 15)) {
        return [(number / Math.pow(10, 12)).toPrecision(toPrecision), 'TP'];
    } else if (number < Math.pow(10, 18)) {
        return [(number / Math.pow(10, 15)).toPrecision(toPrecision), 'PP'];
    } else if (number < Math.pow(10, 21)) {
        return [(number / Math.pow(10, 18)).toPrecision(toPrecision), 'EP'];
    } else if (number < Math.pow(10, 24)) {
        return [(number / Math.pow(10, 21)).toPrecision(toPrecision), 'ZP'];
    } else if (number < Math.pow(10, 27)) {
        return [(number / Math.pow(10, 24)).toPrecision(toPrecision), 'ZP'];
    } else {
        return [(number / Math.pow(10, 27)).toPrecision(toPrecision), 'YP'];
    }
}
Utils.loginHash = "#/login";

Utils.clearAuthentication = function() {
    var self = this;
    window.sessionStorage.removeItem("auth");
    AuthActions.notAuthenticated();
    window.sessionStorage.setItem("locationRefHash", window.location.hash);
    var reloadURL = '';
    $.ajax({
        url: '//' + window.location.hostname + ':' + window.location.port + '/session?api_server=' + API_SERVER + '&hash=' + encodeURIComponent(window.location.hash),
        type: 'DELETE',
        success: function(data) {
            console.log('User logged out');
            reloadURL = data['url'] + '?post_logout_redirect_uri=' +
                 window.location.protocol + '//' +
                 window.location.hostname + ':' +
                 window.location.port +
                 '/?api_server=' + API_SERVER;

            window.location.replace(reloadURL);
        },
        error: function(data) {
            console.log('Problem logging user out');
        }
    });
}
Utils.isNotAuthenticated = function(windowLocation, callback) {
    var self = this;
    self.detectInactivity();
    if (!window.sessionStorage.getItem("auth")) {
        Utils.clearAuthentication();
    }
}
Utils.isDetecting = false;
Utils.detectInactivity = function(callback, duration) {
    var self = this;
    if (!self.isDetecting) {
        var cb = function() {
            self.clearAuthentication();
            if (callback) {
                callback();
            }
        };
        var isInactive;
        var timeout = duration || INACTIVITY_TIMEOUT;
        var setInactive = function() {
            isInactive = setTimeout(cb, timeout);
        };
        var reset = function() {
            clearTimeout(isInactive);
            setInactive();
        }
        setInactive();
        window.addEventListener('mousemove', reset);
        window.addEventListener("keypress", reset);
        self.isDetecting = true;
    }
}
Utils.checkAuthentication = function(statusCode, cb) {
    var self = this;
    if (statusCode == 401) {
        if (cb) {
            cb();
        }
        window.sessionStorage.removeItem("auth")
        self.isNotAuthenticated(window.location)
        return true;
    }
    return false;
}

Utils.isAuthenticationCached = function() {
    var self = this;
    if (window.sessionStorage.getItem("auth")) {
        return true;
    }
    return false;
}

Utils.getHostNameFromURL = function(url) {
    var match = url.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && match[3];
}

Utils.webSocketProtocol = function() {
    if (this.wsProto) {
        return this.wsProto;
    } else {
        if (window.location.protocol == 'http:') {
            this.wsProto = 'ws:'
        } else {
            this.wsProto = 'wss:'
        }
    }
    return this.wsProto;
}

Utils.arrayIntersperse = (arr, sep) => {
    if (arr.length === 0) {
        return [];
    }

    return arr.slice(1).reduce((xs, x, i) => {
        return xs.concat([sep, x]);
    }, [arr[0]]);
}

Utils.cleanImageDataURI = (imageString, type, id) => {
    if (/\bbase64\b/g.test(imageString)) {
        return imageString;
    } else if (/<\?xml\b/g.test(imageString)) {
        const imgStr = imageString.substring(imageString.indexOf('<?xml'));
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(imgStr);
    } else if (/\.(svg|png|gif|jpeg|jpg)$/.test(imageString)) {
        return '/composer/assets/logos/' + type + '/' + id + '/' + imageString;
        // return require('../images/logos/' + imageString);
    }
    if(type == 'nsd' || type == 'vnfd') {
        return require('style/img/catalog-'+type+'-default.svg');
    }
    return require('style/img/catalog-default.svg');
}

Utils.parseError = (error) => {
    let displayMsg = JSON.parse(error);
    if (displayMsg.errorMessage && displayMsg.errorMessage.body) {
        displayMsg = displayMsg.errorMessage.body;
        if(displayMsg['last-error'] && displayMsg['last-error']['rpc-error'] && displayMsg['last-error']['rpc-error']['error-message']) {
            displayMsg = displayMsg['last-error']['rpc-error']['error-message'];
        }
    }
    return displayMsg
}

Utils.rpcError = (rpcResult) => {
    try {
        let info = JSON.parse(rpcResult);
        let rpcError = info.body || info.errorMessage.body || info.errorMessage.error;
        if (rpcError) {
            if (typeof rpcError === 'string') {
                const index = rpcError.indexOf('{');
                if (index >= 0) {
                    return JSON.parse(rpcError.substr(index));
                }
            } else {
                return rpcError;
            }
        }
    } catch (e) {
    }
    console.log('invalid rpc error: ', rpcResult);
    return null;
}

module.exports = Utils;
