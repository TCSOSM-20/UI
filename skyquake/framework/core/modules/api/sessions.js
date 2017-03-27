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

/**
 * sessions api module. Provides API functions for sessions
 * @module framework/core/modules/api/sessions
 * @author Kiran Kashalkar <kiran.kashalkar@riftio.com>
 */

var Promise = require('bluebird');
var constants = require('../../api_utils/constants');
var utils = require('../../api_utils/utils');
var request = utils.request;
var rp = require('request-promise');
var sessionsAPI = {};
var _ = require('lodash');
var base64 = require('base-64');
var APIVersion = '/v2';

function logAndReject(mesg, reject) {
    res.errorMessage = {
        error: mesg
    }
    console.log(mesg);
    reject(res);
}

function logAndRedirectToLogin(mesg, res, req) {
    console.log(mesg);
    res.redirect('login.html?api_server=' + req.query['api_server']);
    res.end();
}

sessionsAPI.create = function(req, res) {
    var api_server = req.query["api_server"];
    var uri = utils.confdPort(api_server);
    var login_url = uri + APIVersion + '/api/login';
    var project_url = uri + APIVersion + '/api/operational/project';
    var authorization_header_string = 'Basic ' + base64.encode(req.body['username'] + ':' + req.body['password']);
    return new Promise(function(resolve, reject) {
        Promise.all([
            rp({
                url: login_url,
                method: 'POST',
                headers: _.extend({}, constants.HTTP_HEADERS.accept.data, {
                    'Authorization': authorization_header_string
                }),
                forever: constants.FOREVER_ON,
                rejectUnauthorized: constants.REJECT_UNAUTHORIZED,
                resolveWithFullResponse: true
            }),
            rp({
                url: project_url,
                method: 'GET',
                headers: _.extend({}, constants.HTTP_HEADERS.accept.collection, {
                    'Authorization': authorization_header_string
                }),
                forever: constants.FOREVER_ON,
                rejectUnauthorized: constants.REJECT_UNAUTHORIZED,
                resolveWithFullResponse: true
            })

        ]).then(function(results) {
            // results[0].statusCode => 200/201
            // results[1].body.collection['rw-project:project'] => List of projects OR 204 with no content
            if (results[0].statusCode != constants.HTTP_RESPONSE_CODES.SUCCESS.OK) {
                var errorMsg = 'Invalid credentials provided!';
                logAndRedirectToLogin(errorMsg, res, req);
                return;
            }

            var username = req.body['username'];
            var project_list_for_user = [];

            if (results[1].statusCode == constants.HTTP_RESPONSE_CODES.SUCCESS.NO_CONTENT) {
                console.log('No projects added or user ', username ,' not privileged to view projects.');
            } else {
                // go through projects and get list of projects that this user belongs to.
                // pick first one as default project?

                var projects = JSON.parse(results[1].body).collection['rw-project:project'];
                projects && projects.map(function(project) {
                    project['project-config'] &&
                    project['project-config']['user'] &&
                    project['project-config']['user'].map(function(user) {
                        if (user['user-name'] == username) {
                            project_list_for_user.push(project.name);
                        }
                    });
                });

                req.session.projectId = (project_list_for_user.length > 0) && project_list_for_user[0];
            }

            req.session.authorization = authorization_header_string;
            req.session.loggedIn = true;

            var successMsg = 'User =>' + username + ' successfully logged in.';
            successMsg += req.session.projectId ? 'Project =>' + req.session.projectId + ' set as default.' : '';

            console.log(successMsg);

            var response = {
                statusCode: constants.HTTP_RESPONSE_CODES.SUCCESS.CREATED,
                data: JSON.stringify({
                    status: successMsg
                })
            };
            resolve(response);

        }).catch(function(error) {
            // Something went wrong - Redirect to /login
            var errorMsg = 'Error logging in or getting list of projects. Error: ' + error;
            console.log(errorMsg);
            logAndRedirectToLogin(errorMsg, res, req);
        });
    })
};

sessionsAPI.addProjectToSession = function(req, res) {
    return new Promise(function(resolve, reject) {
        if (req.session && req.session.loggedIn == true) {
            req.session.projectId = req.params.projectId;
            var successMsg = 'Added project' + projectId + ' to session' + req.sessionID;
            console.log(successMsg);

            return resolve ({
                statusCode: constants.HTTP_RESPONSE_CODES.SUCCESS.OK,
                data: JSON.stringify({
                    status: successMsg
                })
            });
        }

        var errorMsg = 'Session does not exist or not logged in';
        logAndReject(errorMsg, reject);
    });
}

sessionsAPI.delete = function(req, res) {
    var api_server = req.query["api_server"];
    var uri = utils.confdPort(api_server);
    var url = uri + '/api/logout';
    return new Promise(function(resolve, reject) {
        Promise.all([
            rp({
                url: url,
                method: 'POST',
                headers: _.extend({}, constants.HTTP_HEADERS.accept.data, {
                    'Authorization': req.session.authorization
                }),
                forever: constants.FOREVER_ON,
                rejectUnauthorized: constants.REJECT_UNAUTHORIZED,
                resolveWithFullResponse: true
            }),
            new Promise(function(success, failure) {
                req.session.destroy(function(err) {
                    if (err) {
                        var errorMsg = 'Error deleting session. Error: ' + err;
                        console.log(errorMsg);
                        success({
                            status: 'error',
                            message: errorMsg
                        });
                    }

                    var successMsg = 'Success deleting session';
                    console.log(successMsg);

                    success({
                        status: 'success',
                        message: successMsg
                    });
                });
            })
        ]).then(function(result) {
            // assume the session was deleted!
            var message = 'Session was deleted.'
            logAndRedirectToLogin(message, res, req);

        }).catch(function(error) {
            var message = 'Error deleting session or logging out. Error:' + error;
            logAndRedirectToLogin(message, res, req);
        });
    });
}


module.exports = sessionsAPI;
