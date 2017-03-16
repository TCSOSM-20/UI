/*
 * STANDARD_RIFT_IO_COPYRIGHT
 */
import $ from 'jquery';
var Utils = require('utils/utils.js');
let API_SERVER = require('utils/rw.js').getSearchParams(window.location).api_server;
let HOST = API_SERVER;
let NODE_PORT = require('utils/rw.js').getSearchParams(window.location).api_port || ((window.location.protocol == 'https:') ? 8443 : 8000);
let DEV_MODE = require('utils/rw.js').getSearchParams(window.location).dev_mode || false;

if (DEV_MODE) {
    HOST = window.location.protocol + '//' + window.location.hostname;
}


let Users = mockUsers();


module.exports = function(Alt) {
    return {
        getUsers: {
          remote: function() {
              return new Promise(function(resolve, reject) {
                // setTimeout(function() {
                //   resolve(Users);
                // }, 1000)
                $.ajax({
                  url: `/user?api_server=${API_SERVER}`,
                  type: 'GET',
                  beforeSend: Utils.addAuthorizationStub,
                  success: function(data, textStatus, jqXHR) {
                    resolve(data.users);
                  }
                }).fail(function(xhr){
                  //Authentication and the handling of fail states should be wrapped up into a connection class.
                  Utils.checkAuthentication(xhr.status);
                });
              });
          },
          interceptResponse: interceptResponse({
            'error': 'There was an error retrieving the resource orchestrator information.'
          }),
          success: Alt.actions.global.getUsersSuccess,
                    loading: Alt.actions.global.showScreenLoader,
          error: Alt.actions.global.showNotification
        },
        updateUser: {
          remote: function(state, user) {
            return new Promise(function(resolve, reject) {
              $.ajax({
                  url: `/user?api_server=${API_SERVER}`,
                  type: 'PUT',
                  data: user,
                  beforeSend: Utils.addAuthorizationStub,
                  success: function(data, textStatus, jqXHR) {
                    resolve(data);
                  }
                }).fail(function(xhr){
                  //Authentication and the handling of fail states should be wrapped up into a connection class.
                  Utils.checkAuthentication(xhr.status);
                });
            });
          },
          interceptResponse: interceptResponse({
            'error': 'There was an error updating the user.'
          }),
          success: Alt.actions.global.updateUserSuccess,
          loading: Alt.actions.global.showScreenLoader,
          error: Alt.actions.global.showNotification
        },
        deleteUser: {
          remote: function(state, user) {
            return new Promise(function(resolve, reject) {
                         // setTimeout(function() {
              //     resolve(true);
              // }, 1000)
              $.ajax({
                url: `/user/${user['user-name']}/${user['user-domain']}?api_server=${API_SERVER}`,
                type: 'DELETE',
                data: user,
                beforeSend: Utils.addAuthorizationStub,
                success: function(data, textStatus, jqXHR) {
                  resolve(data);
                }
              }).fail(function(xhr){
                //Authentication and the handling of fail states should be wrapped up into a connection class.
                Utils.checkAuthentication(xhr.status);
              });
            });
          },
          interceptResponse: interceptResponse({
            'error': 'There was an error deleting the user.'
          }),
          success: Alt.actions.global.deleteUserSuccess,
          loading: Alt.actions.global.showScreenLoader,
          error: Alt.actions.global.showNotification
        },
        createUser: {
            remote: function(state, user) {

              return new Promise(function(resolve, reject) {
                // setTimeout(function() {
                //     resolve(true);
                // }, 1000)
                $.ajax({
                  url: `/user?api_server=${API_SERVER}`,
                  type: 'POST',
                  data: user,
                  beforeSend: Utils.addAuthorizationStub,
                  success: function(data, textStatus, jqXHR) {
                    resolve(data);
                  }
                }).fail(function(xhr){
                  //Authentication and the handling of fail states should be wrapped up into a connection class.
                  Utils.checkAuthentication(xhr.status);
                });
              });
            },
            interceptResponse: interceptResponse({
              'error': 'There was an error updating the account.'
            }),
            success: Alt.actions.global.createUserSuccess,
            loading: Alt.actions.global.showScreenLoader,
            error: Alt.actions.global.showNotification
        }
      }
}

function interceptResponse (responses) {
  return function(data, action, args) {
    if(responses.hasOwnProperty(data)) {
      return {
        type: data,
        msg: responses[data]
      }
    } else {
      return data;
    }
  }
}

function mockUsers() {
  let data = [];
  let count = 10;
  for(let i = 0; i < 10; i++) {
    data.push({
      username: `Tester ${i}`,
      domain: 'Some Domain',
      platformRoles: {
        super_admin: true,
        platform_admin: false,
        platform_oper: false
      },
      disabled: false,
      projectRoles: [
        'Project:Role'
      ]
    })
  }
  return data;
}
