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
import adminActions from './adminActions.js';
import Utils from 'utils/utils.js';
import $ from 'jquery';
var adminSource = {
    get: function () {
        return {
            remote: function (state) {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: 'api/?api_server=' + API_SERVER,
                        type: 'GET',
                        contentType: "application/json",
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (error) {
                            console.log("There was an error getting the crash details: ", error);
                            reject(error);
                        }
                    }).fail(function (xhr) {
                        console.log(xhr)
                    });

                }).catch(function (e) {
                        console.log(e)
                });
            },
            success: adminActions.getAdminSuccess,
            loading: adminActions.getAdminLoading,
            error: adminActions.getAdminFail
        }
    },
}
module.exports = adminSource;