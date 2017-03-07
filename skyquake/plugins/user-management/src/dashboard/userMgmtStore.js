/*
 * STANDARD_RIFT_IO_COPYRIGHT
 */
import UserManagementActions from './userMgmtActions.js';
import UserManagementSource from './userMgmtSource.js';
import _ from 'lodash';
export default class UserManagementStore {
    constructor() {
        this.actions = UserManagementActions(this.alt);
        this.bindActions(this.actions);
        this.registerAsync(UserManagementSource);
        this.users = [];
        this['user-name'] = '';
        this['user-domain'] = '';
        this.disabled = false;
        this.platformRoles = {
            super_admin: false,
            platform_admin: false,
            platform_oper: false
        };
        this.projectRoles = ['Project:Role'];
        this.projectRolesOptions = ['Choose your adventure', 'Project:Role', 'Project:Another Role'];
        this.currentPassword = '';
        this['old-password'] = '';
        this['new-password'] = '';
        this['confirm-password'] = '';

        this.activeIndex = null;
        this.userOpen = false;
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
    viewUser(data) {
        let user = data[0];
        let userIndex = data[1];

        let ActiveUser = {
            'user-name': user['user-name'],
            'user-domain': user['user-domain'],
            platformRoles: user.platformRoles || this.platformRoles,
            disabled: user.disabled || this.disabled,
            projectRoles: user.projectRoles || this.projectRoles
        }
        let state = _.merge({
            activeIndex: userIndex,
            userOpen: true,
            isEdit: true
        }, ActiveUser);
        this.setState(state)
    }
    handleCloseUserPanel() {
        this.setState({
            userOpen: false,
            isEdit: false
        })
    }
    handleHideColumns(e) {
        if(this.userOpen && e.currentTarget.classList.contains('hideColumns')) {
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
    resetUser() {
        let username = '';
        let domain = '';
        let disabled = false;
        let platformRoles = {
            super_admin: false,
            platform_admin: false,
            platform_oper: false
        };
        let projectRoles = [];
        let currentPassword = '';
        let oldPassword = '';
        let newPassword = '';
        let confirmPassword = '';
        return {
            'user-name' : username,
            'user-domain' : domain,
            disabled,
            platformRoles,
            projectRoles,
            currentPassword,
            'old-password': oldPassword,
            'new-password': newPassword,
            'confirm-password': confirmPassword
        }
    }
    resetPassword() {
        let currentPassword = '';
        let oldPassword = '';
        let newPassword = '';
        let confirmPassword = '';
        return {
            currentPassword,
            'old-password': oldPassword,
            'new-password': newPassword,
            'confirm-password': confirmPassword
        }
    }
    handleAddUser() {
        this.setState(_.merge( this.resetUser() ,{ isEdit: false, userOpen: true }))
    }
    handleCreateUser() {

    }
    handleUpdateUser() {

    }

    getUsersSuccess(users) {
        this.alt.actions.global.hideScreenLoader.defer();
        this.setState({users});
    }
    updateUserSuccess() {
        this.alt.actions.global.hideScreenLoader.defer();
        let users = this.users;
        users[this.activeIndex] = {
            'user-name': this['user-name'],
            'user-domain': this['user-domain'],
            platformRoles: this.platformRoles,
            disabled: this.disabled,
            projectRoles: this.projectRoles
        }
        this.setState({users})
    }
    deleteUserSuccess() {
        this.alt.actions.global.hideScreenLoader.defer();
        let users = this.users;
        users.splice(this.activeIndex, 1);
        this.setState({users, userOpen: false})
    }
    createUserSuccess() {
        this.alt.actions.global.hideScreenLoader.defer();
        let users = this.users;
        users.push({
            'user-name': this['user-name'],
            'user-domain': this['user-domain'],
            platformRoles: this.platformRoles,
            disabled: this.disabled,
            projectRoles: this.projectRoles
         });
        let newState = {users, isEdit: true};
        _.merge(newState, this.resetPassword())
        this.setState(newState);
    }
}
