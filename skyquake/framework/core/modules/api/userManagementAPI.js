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


var UserManagement = {};
var Promise = require('bluebird');
var rp = require('request-promise');
var Promise = require('promise');
var constants = require('../../api_utils/constants');
var utils = require('../../api_utils/utils');
var _ = require('lodash');
var ProjectManagementAPI = require('./projectManagementAPI.js');

UserManagement.get = function(req) {
    var self = this;
    var api_server = req.query['api_server'];

    return new Promise(function(resolve, reject) {
        Promise.all([
            rp({
                uri: utils.confdPort(api_server) + '/api/operational/user-config/user',
                method: 'GET',
                headers: _.extend({}, constants.HTTP_HEADERS.accept.data, {
                    'Authorization': req.session && req.session.authorization
                }),
                forever: constants.FOREVER_ON,
                rejectUnauthorized: false,
                resolveWithFullResponse: true
            })
        ]).then(function(result) {
            var response = {};
            response['data'] = {};
            if (result[0].body) {
                response['data']['user'] = JSON.parse(result[0].body)['rw-user:user'];
            }
            response.statusCode = constants.HTTP_RESPONSE_CODES.SUCCESS.OK

            resolve(response);
        }).catch(function(error) {
            var response = {};
            console.log('Problem with UserManagement.get', error);
            response.statusCode = error.statusCode || 500;
            response.errorMessage = {
                error: 'Failed to get UserManagement' + error
            };
            reject(response);
        });
    });
};


UserManagement.getProfile = function(req) {
    var self = this;
    var api_server = req.query['api_server'];
    return new Promise(function(resolve, reject) {
        var response = {};
        try {
            var userId = req.session.userdata.username
            response['data'] = {
                userId: userId,
                projectId: req.session.projectId
            };
            UserManagement.getUserInfo(req, userId).then(function(result) {
                response.statusCode = constants.HTTP_RESPONSE_CODES.SUCCESS.OK;
                response.data.data = result.data
                resolve(response);
            }, function(error) {
                console.log('Error retrieving getUserInfo');
                response.statusCode = constants.HTTP_RESPONSE_CODES.ERROR.INTERNAL_SERVER_ERROR;
                reject(response);
            })
        } catch (e) {
            response.data.data = e;
            response.statusCode = constants.HTTP_RESPONSE_CODES.ERROR.INTERNAL_SERVER_ERROR;
            reject(response);
            reject()
        }
    });
};
UserManagement.getUserInfo = function(req, userId, domain) {
    var self = this;
    var api_server = req.query['api_server'];
    var id = req.params['userId'] || userId;
    var domain = req.params['domainId'] || domain;
    var response = {};
    return new Promise(function(resolve, reject) {
        if (id) {
            var getProjects = ProjectManagementAPI.get(req)
            var getPlatformUser = ProjectManagementAPI.getPlatform(req, id)
            Promise.all([
                getProjects,
                getPlatformUser
            ]).then(function(result) {
                var userData = {
                    platform: {
                        role: {

                        }
                    },
                    //id/key values for each project
                    projectId:[],
                    project: {
                        /**
                         *  [projectId] : {
                         *      data: [project object],
                         *      role: {
                         *          [roleId]: true
                         *      }
                         *  }
                         */
                    }
                }
                //Build project roles
                var projects = result[0].data.project;
                var userProjects = [];
                projects && projects.map(function(p, i) {
                    var users = p['project-config'] && p['project-config'].user;
                    userData.projectId.push(p.name);
                    users && users.map(function(u) {
                        if(u['user-name'] == id) {
                            userData.project[p.name] = {
                                data: p,
                                role: {}
                            }
                            u.role && u.role.map(function(r) {
                                userData.project[p.name].role[r.role] = true
                            });
                        }
                    })
                });
                //Build platform roles
                var platformRoles = result[1].data.platform && result[1].data.platform.role;
                platformRoles && platformRoles.map(function(r) {
                    userData.platform.role[r.role] = true
                });
                response.data = userData;
                response.statusCode = constants.HTTP_RESPONSE_CODES.SUCCESS.OK
                resolve(response);
            })
        } else {
            var errorMsg = 'userId not specified in UserManagement.getUserInfo';
            console.error(errorMsg);
            response.statusCode = constants.HTTP_RESPONSE_CODES.ERROR.BAD_REQUEST;
            response.error = errorMsg;
            reject(response)
        }

    })
}
UserManagement.create = function(req) {
    var self = this;
    var api_server = req.query['api_server'];
    var data = req.body;
    data = {
        "user":[data]
    }
    return new Promise(function(resolve, reject) {
        Promise.all([
            rp({
                uri: utils.confdPort(api_server) + '/api/config/user-config',
                method: 'POST',
                headers: _.extend({}, constants.HTTP_HEADERS.accept.data, {
                    'Authorization': req.session && req.session.authorization
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
            console.log('Problem with UserManagement.create', error);
            response.statusCode = error.statusCode || 500;
            response.errorMessage = {
                error: 'Failed to create user' + error
            };
            reject(response);
        });
    });
};
UserManagement.update = function(req) {
    var self = this;
    var api_server = req.query['api_server'];
    var bodyData = req.body;
    data = {
        "user":[bodyData]
    }
    var updateTasks = [];
    if(bodyData.hasOwnProperty('old-password')) {
        var changePW = rp({
            uri: utils.confdPort(api_server) + '/api/operations/change-password',
            method: 'POST',
            headers: _.extend({}, constants.HTTP_HEADERS.accept.data, {
                'Authorization': req.session && req.session.authorization
            }),
            forever: constants.FOREVER_ON,
            json: {
                "input": {
                    'user-name' : bodyData['user-name'],
                    'user-domain' : bodyData['user-domain'],
                    'old-password' : bodyData['old-password'],
                    'new-password' : bodyData['new-password'],
                    'confirm-password' : bodyData['confirm-password'],
                }
            },
            rejectUnauthorized: false,
            resolveWithFullResponse: true
        });
        updateTasks.push(changePW);
    };
    var updateUser = rp({
                uri: utils.confdPort(api_server) + '/api/config/user-config',
                method: 'PUT',
                headers: _.extend({}, constants.HTTP_HEADERS.accept.data, {
                    'Authorization': req.session && req.session.authorization
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
            console.log('Problem with UserManagement.passwordChange', error);
            response.statusCode = error.statusCode || 500;
            response.errorMessage = {
                error: 'Failed to passwordChange user' + error
            };
            reject(response);
        });
    });
};

UserManagement.delete = function(req) {
    var self = this;
    var username = req.params.username;
    var domain = req.params.domain;
    var api_server = req.query["api_server"];
    var requestHeaders = {};
    var url = `${utils.confdPort(api_server)}/api/config/user-config/user/${username},${domain}`
    return new Promise(function(resolve, reject) {
        _.extend(requestHeaders,
            constants.HTTP_HEADERS.accept.data,
            constants.HTTP_HEADERS.content_type.data, {
                'Authorization': req.session && req.session.authorization
            });
        rp({
            url: url,
            method: 'DELETE',
            headers: requestHeaders,
            forever: constants.FOREVER_ON,
            rejectUnauthorized: false,
        }, function(error, response, body) {
            if (utils.validateResponse('UserManagement.DELETE', error, response, body, resolve, reject)) {
                return resolve({
                    statusCode: response.statusCode,
                    data: JSON.stringify(response.body)
                });
            };
        });
    })
}
module.exports = UserManagement;
