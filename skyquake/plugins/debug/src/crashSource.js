
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
var rw = require('utils/rw.js');
var API_SERVER = rw.getSearchParams(window.location).api_server;
var crashActions = require('./crashActions.js');
var Utils = require('utils/utils.js');
import $ from 'jquery';
var crashSource = {

  get: function() {
    return {
      remote: function(state) {
        return new Promise(function(resolve, reject) {
          $.ajax({
            url: 'api/crash-details?api_server=' + API_SERVER,
            type:'GET',
            beforeSend: Utils.addAuthorizationStub,
            contentType: "application/json",
            success: function(data) {
              resolve(data);
            },
            error: function(error) {
              console.log("There was an error getting the crash details: ", error);
              reject(error);
            }
          }).fail(function(xhr){
            console.log('fail')
            //Authentication and the handling of fail states should be wrapped up into a connection class.
            Utils.checkAuthentication(xhr.status);
          });
        }).catch(function(err){console.log(err)});
      },
      success: crashActions.getCrashDetailsSuccess,
      loading: crashActions.getCrashDetailsLoading,
      error: crashActions.getCrashDetailsFail
    }
  }
}
module.exports = crashSource;
