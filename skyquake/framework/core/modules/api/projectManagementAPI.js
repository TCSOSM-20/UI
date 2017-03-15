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
// DescriptorModelMeta API (NSD + VNFD)


var ProjectManagement = {};
var Promise = require('bluebird');
var rp = require('request-promise');
var Promise = require('promise');
var constants = require('../../api_utils/constants');
var utils = require('../../api_utils/utils');
var _ = require('lodash');

ProjectManagement.get = function(req) {
    var self = this;
    var api_server = req.query['api_server'];

    return new Promise(function(resolve, reject) {
        Promise.all([
            rp({
                uri: utils.confdPort(api_server) + '/api/operational/project',
                method: 'GET',
                headers: _.extend({}, constants.HTTP_HEADERS.accept.data, {
                    'Authorization': req.get('Authorization')
                }),
                forever: constants.FOREVER_ON,
                rejectUnauthorized: false,
                resolveWithFullResponse: true
            })
        ]).then(function(result) {
            var response = {};
            response['data'] = {};
            if (result[0].body) {
                response['data']['project'] = JSON.parse(result[0].body)['rw-project:project'];
            }
            response.statusCode = constants.HTTP_RESPONSE_CODES.SUCCESS.OK

            resolve(response);
        }).catch(function(error) {
            var response = {};
            console.log('Problem with ProjectManagement.get', error);
            response.statusCode = error.statusCode || 500;
            response.errorMessage = {
                error: 'Failed to get ProjectManagement' + error
            };
            reject(response);
        });
    });
};
ProjectManagement.create = function(req) {
    var self = this;
    var api_server = req.query['api_server'];
    var data = req.body;
    data = {
        "project":[data]
    }
    return new Promise(function(resolve, reject) {
        Promise.all([
            rp({
                uri: utils.confdPort(api_server) + '/api/config/project',
                method: 'POST',
                headers: _.extend({}, constants.HTTP_HEADERS.accept.data, {
                    'Authorization': req.get('Authorization')
                }),
                forever: constants.FOREVER_ON,
                json: data,
                rejectUnauthorized: false,
                resolveWithFullResponse: true
            })
        ]).then(function(result) {
            var response = {};
            response['data'] = {};
            if (result[0].body) {
                response['data'] = result[0].body;
            }
            response.statusCode = constants.HTTP_RESPONSE_CODES.SUCCESS.OK

            resolve(response);
        }).catch(function(error) {
            var response = {};
            console.log('Problem with ProjectManagement.create', error);
            response.statusCode = error.statusCode || 500;
            response.errorMessage = {
                error: 'Failed to create user' + error
            };
            reject(response);
        });
    });
};
ProjectManagement.update = function(req) {
    var self = this;
    var api_server = req.query['api_server'];
    var bodyData = req.body;
    data = {
        "project":[bodyData]
    }
    var updateTasks = [];

    var updateUser = rp({
                uri: utils.confdPort(api_server) + '/api/config/project',
                method: 'PUT',
                headers: _.extend({}, constants.HTTP_HEADERS.accept.data, {
                    'Authorization': req.get('Authorization')
                }),
                forever: constants.FOREVER_ON,
                json: data,
                rejectUnauthorized: false,
                resolveWithFullResponse: true
            });
    updateTasks.push(updateUser)
    return new Promise(function(resolve, reject) {
        Promise.all([
            updateTasks
        ]).then(function(result) {
            var response = {};
            response['data'] = {};
            if (result[0].body) {
                response['data'] = result[0].body;
            }
            response.statusCode = constants.HTTP_RESPONSE_CODES.SUCCESS.OK

            resolve(response);
        }).catch(function(error) {
            var response = {};
            console.log('Problem with ProjectManagement.update', error);
            response.statusCode = error.statusCode || 500;
            response.errorMessage = {
                error: 'Failed to passwordChange user' + error
            };
            reject(response);
        });
    });
};

ProjectManagement.delete = function(req) {
    var self = this;
    var projectname = req.params.projectname;
    var api_server = req.query["api_server"];
    var requestHeaders = {};
    var url = `${utils.confdPort(api_server)}/api/config/project/${projectname}`
    return new Promise(function(resolve, reject) {
        _.extend(requestHeaders,
            constants.HTTP_HEADERS.accept.data,
            constants.HTTP_HEADERS.content_type.data, {
                'Authorization': req.get('Authorization')
            });
        rp({
            url: url,
            method: 'DELETE',
            headers: requestHeaders,
            forever: constants.FOREVER_ON,
            rejectUnauthorized: false,
        }, function(error, response, body) {
            if (utils.validateResponse('ProjectManagement.DELETE', error, response, body, resolve, reject)) {
                return resolve({
                    statusCode: response.statusCode,
                    data: JSON.stringify(response.body)
                });
            };
        });
    })
}
module.exports = ProjectManagement;