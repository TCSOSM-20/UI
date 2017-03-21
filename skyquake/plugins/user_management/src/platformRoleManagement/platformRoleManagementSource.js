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


let Projects = mockProjects();
let Users = mockUsers();


module.exports = function(Alt) {
    return {

        getUsers: {
          remote: function() {
              return new Promise(function(resolve, reject) {
                // setTimeout(function() {
                //   resolve(Users);
                // }, 1000);
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
        getProjects: {
          remote: function() {
              return new Promise(function(resolve, reject) {
                // setTimeout(function() {
                //   resolve(Projects);
                // }, 1000)
                $.ajax({
                  url: `/project?api_server=${API_SERVER}`,
                  type: 'GET',
                  beforeSend: Utils.addAuthorizationStub,
                  success: function(data, textStatus, jqXHR) {
                    resolve(data.project);
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
          success: Alt.actions.global.getProjectsSuccess,
                    loading: Alt.actions.global.showScreenLoader,
          error: Alt.actions.global.showNotification
        },
        updateProject: {
          remote: function(state, project) {
            return new Promise(function(resolve, reject) {
              $.ajax({
                  url: `/project?api_server=${API_SERVER}`,
                  type: 'PUT',
                  data: project,
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
            'error': 'There was an error updating the project.'
          }),
          success: Alt.actions.global.updateProjectSuccess,
          loading: Alt.actions.global.showScreenLoader,
          error: Alt.actions.global.showNotification
        },
        deleteProject: {
          remote: function(state, project) {
            return new Promise(function(resolve, reject) {
              // setTimeout(function() {
              //     resolve(true);
              // }, 1000)
              $.ajax({
                url: `/project/${project['name']}?api_server=${API_SERVER}`,
                type: 'DELETE',
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
          success: Alt.actions.global.deleteProjectSuccess,
          loading: Alt.actions.global.showScreenLoader,
          error: Alt.actions.global.showNotification
        },
        createProject: {
            remote: function(state, project) {

              return new Promise(function(resolve, reject) {
                // setTimeout(function() {
                //     resolve(true);
                // }, 1000)
                $.ajax({
                  url: `/project?api_server=${API_SERVER}`,
                  type: 'POST',
                  data: project,
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
            success: Alt.actions.global.createProjectSuccess,
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

function mockProjects() {
  let data = [];
  let count = 10;
  for(let i = 0; i < 3; i++) {
    data.push({
      name: `Test Project ${i}`,
      description: 'Some description',
      roles: ['Some-Role', 'Some-Other-Role'],
      users: [
        {
          'user-name': 'Some-User',
          'user-domain': 'system',
          role: [
            {
              'role': 'Some-Role',
              'key-set' : 'some key'
            },
            {
              'role': 'Some-Other-Role',
              'key-set' : 'some key'
            }
          ]
        },
        {
          'user-name': 'Some-User',
          'user-domain': 'system',
          role: [
            {
              'role': 'Some-Role',
              'key-set' : 'some key'
            }
          ]
        }
      ]
    })
  }
  return data;
}
function mockUsers() {
  let data = [];
  let count = 10;
  for(let i = 0; i < 10; i++) {
    data.push({
      'user-name': `Tester ${i}`,
      'user-domain': 'Some Domain',
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
