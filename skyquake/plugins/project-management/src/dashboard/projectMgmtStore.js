/*
 * STANDARD_RIFT_IO_COPYRIGHT
 */
import ProjectManagementActions from './projectMgmtActions.js';
import ProjectManagementSource from './projectMgmtSource.js';
import _ from 'lodash';
export default class ProjectManagementStore {
    constructor() {
        this.actions = ProjectManagementActions(this.alt);
        this.bindActions(this.actions);
        this.registerAsync(ProjectManagementSource);
        this.projects = [];
        this['name'] = '';
        this['description'] = 'Some Description';
        this.projectUsers = [];
        this.selectedUser = null;
        this.selectedRole = null;
        this.roles = ['Assign a role', 'super_admin'];
        this.users = [];
        this.activeIndex = null;
        this.isReadOnly = true;
        this.projectOpen = false;
        this.hideColumns = false;
        this.isEdit = false;
        // this.exportPublicMethods({})
    }
    /**
     * [handleFieldUpdate description]
     * @param  {Object} data {
     *                       [store_property] : [value]
     * }
     * @return {[type]}      [description]
     */
    handleUpdateInput(data) {
        this.setState(data);
    }
    handleAddProjectItem(item) {
        let projectRoles = this.projectRoles;
        projectRoles.push('');
        this.setState({projectRoles});
    }
    handleRemoveProjectItem(i) {
        let projectRoles = this.projectRoles;
        projectRoles.splice(i, 1);
        console.log('Removing', projectRoles)
        this.setState({projectRoles});
    }
    handleUpdateProjectRole(data) {
        let i = data[0];
        let e = data[1];
        let projectRoles = this.projectRoles
        projectRoles[i] = JSON.parse(e.currentTarget.value);
        this.setState({
            projectRoles
        });
    }
    viewProject(data) {
        let project = data[0];
        let projectIndex = data[1];

        let ProjectUser = {
            'name': project['name'],
            'description': project['description'],
            'projectUsers': project['project-config'] && project['project-config']['user'] || []
        }
        let state = _.merge({
            activeIndex: projectIndex,
            projectOpen: true,
            isEdit: true,
            isReadOnly: true
        }, ProjectUser);
        this.setState(state)
    }
    editProject(isEdit) {
        this.setState({
            isReadOnly: isEdit
        })
    }
    handleCloseProjectPanel() {
        this.setState({
            projectOpen: false,
            isEdit: false,
            isReadOnly: true
        })
    }
    handleHideColumns(e) {
        if(this.projectOpen && e.currentTarget.classList.contains('hideColumns')) {
            this.setState({
                hideColumns: true
            })
        } else {
            this.setState({
                hideColumns: false
            })
        }
    }
    handleDisabledChange(isDisabled){
        this.setState({
            disabled: isDisabled
        })
    }
    handlePlatformRoleUpdate(data){
        let platform_role = data[0];
        let checked = data[1];
        let platformRoles = this.platformRoles;
        platformRoles[platform_role] = checked;
        this.setState({
            platformRoles
        })
    }
    handleSelectedUser(event) {
        this.setState({
            selectedUser: JSON.parse(event.currentTarget.value)
        })
    }

    handleSelectedRole(event) {
        this.setState({
            selectedRole: JSON.parse(event.currentTarget.value)
        })
    }
    resetProject() {
        let name = '';
        let description = '';
        return {
            'name' : name,
            'description' : description
        }
    }
    handleAddProject() {
        this.setState(_.merge( this.resetProject() ,
              {
                isEdit: false,
                projectOpen: true,
                activeIndex: null,
                isReadOnly: false,
                projectUsers: []
            }
        ))
    }

    handleUpdateSelectedUser(user) {
        this.setState({
            selectedUser: JSON.parse(user)
        });
    }
    handleAddUser() {
        let u = JSON.parse(this.selectedUser);
        let r = this.selectedRole;
        let projectUsers = this.projectUsers;
        console.log('adding user')
        projectUsers.push({
          'user-name': u['user-name'],
          'user-domain': u['user-domain'],
          "role":[{
                      "role": r,
                      "keys": r
            }
          ]
        })
        this.setState({projectUsers})
    }
    handleUpdateUserRoleInProject(data) {
        let {userIndex, roleIndex, value} = data;
        let projectUsers = this.projectUsers;
        projectUsers[userIndex].role[roleIndex].role = value;
        projectUsers[userIndex].role[roleIndex]['keys'] = value;

    }
    addRoleToUserInProject(userIndex) {
        let projectUsers = this.projectUsers;
        if(!projectUsers[userIndex].role) {
            projectUsers[userIndex].role = [];
        }
        projectUsers[userIndex].role.push({
              'role': null,
              //temp until we get actual keys
              'keys' : 'some key'
            });
        this.setState({
            projectUsers
        })
    }
    handleRemoveRoleFromUserInProject (data) {
        let {userIndex, roleIndex} = data;
        let projectUsers = this.projectUsers;
        projectUsers[userIndex].role.splice(roleIndex, 1);
        this.setState({
            projectUsers
        })
    }
    handleRemoveUserFromProject (userIndex) {
        let projectUsers = this.projectUsers;
        projectUsers.splice(userIndex, 1);
        this.setState({
            projectUsers
        })
    }
    getProjectsSuccess(projects) {
        this.alt.actions.global.hideScreenLoader.defer();
        this.setState({projects: projects});
    }
    getUsersSuccess(users) {
        console.log(users)
        this.alt.actions.global.hideScreenLoader.defer();
        this.setState({users});
    }
    updateProjectSuccess() {
        this.alt.actions.global.hideScreenLoader.defer();
        let projects = this.projects || [];
        projects[this.activeIndex] = {
            'name': this['name'],
            'description': this['description']
        }
        this.setState({
            projects,
            isEdit: true,
            isReadOnly: true
        })
    }
    deleteProjectSuccess() {
        this.alt.actions.global.hideScreenLoader.defer();
        let projects = this.projects;
        projects.splice(this.activeIndex, 1);
        this.setState({projects, projectOpen: false})
    }
    createProjectSuccess() {
        this.alt.actions.global.hideScreenLoader.defer();
        let projects = this.projects || [];
        projects.push({
            'name': this['name'],
            'description': this['description']
         });
        let newState = {
            projects,
            isEdit: true,
            isReadOnly: true,
            activeIndex: projects.length - 1
        };
        _.merge(newState)
        this.setState(newState);
    }
}