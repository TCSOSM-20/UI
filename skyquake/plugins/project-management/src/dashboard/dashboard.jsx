/*
 * STANDARD_RIFT_IO_COPYRIGHT
 */

import React from 'react';
import ReactDOM from 'react-dom';
import AppHeader from 'widgets/header/header.jsx';
import ProjectManagementStore from './projectMgmtStore.js';
import SkyquakeComponent from 'widgets/skyquake_container/skyquakeComponent.jsx';
import 'style/layout.scss';
import './projectMgmt.scss';
import {Panel, PanelWrapper} from 'widgets/panel/panel';
import {InputCollection, FormSection} from 'widgets/form_controls/formControls.jsx';

import TextInput from 'widgets/form_controls/textInput.jsx';
import Input from 'widgets/form_controls/input.jsx';
import Button, {ButtonGroup} from 'widgets/button/sq-button.jsx';
import SelectOption from 'widgets/form_controls/selectOption.jsx';
import 'widgets/form_controls/formControls.scss';
import imgAdd from '../../node_modules/open-iconic/svg/plus.svg'
import imgRemove from '../../node_modules/open-iconic/svg/trash.svg'

class ProjectManagementDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.Store = this.props.flux.stores.hasOwnProperty('ProjectManagementStore') ? this.props.flux.stores.ProjectManagementStore : this.props.flux.createStore(ProjectManagementStore);
        this.Store.getProjects();
        this.Store.getUsers();
        this.state = this.Store.getState();
        this.actions = this.state.actions;
    }
    componentDidUpdate() {
        let self = this;
        ReactDOM.findDOMNode(this.projectList).addEventListener('transitionend', this.onTransitionEnd, false);
        setTimeout(function() {
            let element = self[`project-ref-${self.state.activeIndex}`]
            element && !isElementInView(element) && element.scrollIntoView({block: 'end', behavior: 'smooth'});
        })
    }
    componentWillMount() {
        this.Store.listen(this.updateState);
    }
    componentWillUnmount() {
        this.Store.unlisten(this.updateState);
    }
    updateState = (state) => {
        this.setState(state);
    }
    updateInput = (key, e) => {
        let property = key;
        this.actions.handleUpdateInput({
            [property]:e.target.value
        })
    }
    disabledChange = (e) => {
        this.actions.handleDisabledChange(e.target.checked);
    }
    platformChange = (platformRole, e) => {
        this.actions.handlePlatformRoleUpdate(platformRole, e.currentTarget.checked);
    }
    addProjectRole = (e) => {
        this.actions.handleAddProjectItem();
    }
    removeProjectRole = (i, e) => {
        this.actions.handleRemoveProjectItem(i);
    }
    updateProjectRole = (i, e) => {
        this.actions.handleUpdateProjectRole(i, e)
    }
    addProject = () => {
        this.actions.handleAddProject();
    }
    viewProject = (un, index) => {
        this.actions.viewProject(un, index);
    }
    editProject = () => {
        this.actions.editProject(false);
    }
    cancelEditProject = () => {
        this.actions.editProject(true)
    }
    closePanel = () => {
        this.actions.handleCloseProjectPanel();
    }

    deleteProject = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.Store.deleteProject({
                'name': this.state['name']
            });
    }
    createProject = (e) => {
        let self = this;
        e.preventDefault();
        e.stopPropagation();
        let projectUsers = self.state.projectUsers;

        //Remove null values from role
        projectUsers.map((u) => {
           u.role && u.role.map((r,i) => {
             let role = {};
             //you may add a user without a role or a keys, but if one is present then the other must be as well.
            if(!r || ((r.role || r['keys']) && (!r.role || !r['keys']))) {
                projectUsers.splice(i, 1);
            } else {
                return u;
            }
           })
        })
        this.Store.createProject({
            'name': self.state['name'],
            'description': self.state.description,
            'project-config' : {
                'user': projectUsers
            }
        });
    }
    updateProject = (e) => {
        let self = this;
        e.preventDefault();
        e.stopPropagation();
        let projectUsers = self.state.projectUsers;

        //Remove null values from role
        projectUsers.map((u) => {
           u.role && u.role.map((r,i) => {
             let role = {};
             //you may add a user without a role or a keys, but if one is present then the other must be as well.
            if(!r || ((r.role || r['keys']) && (!r.role || !r['keys']))) {
                projectUsers.splice(i, 1);
            } else {
                return u;
            }
           })
        })

        this.Store.updateProject(_.merge({
            'name': self.state['name'],
            'description': self.state.description,
            'project-config' : {
                'user': projectUsers
            }
        }));
    }
     evaluateSubmit = (e) => {
        if (e.keyCode == 13) {
            if (this.props.isEdit) {
                this.updateProject(e);
            } else {
                this.createProject(e);
            }
            e.preventDefault();
            e.stopPropagation();
        }
    }
    updateSelectedUser = (e) => {
        this.setState({
            selected
        })
    }
    addUserToProject = (e) => {
        this.actions.handleAddUser();
    }
    removeUserFromProject = (userIndex, e) => {
        this.actions.handleRemoveUserFromProject(userIndex);
    }
    updateUserRoleInProject = (userIndex, roleIndex, e) => {
        this.actions.handleUpdateUserRoleInProject({
            userIndex,
            roleIndex,
            value: JSON.parse(e.target.value)
        })
    }
    removeRoleFromUserInProject = (userIndex, roleIndex, e) => {
        this.actions.handleRemoveRoleFromUserInProject({
            userIndex,
            roleIndex
        })
    }
    addRoleToUserInProject = (userIndex, e) => {
        this.actions.addRoleToUserInProject(userIndex);
    }
    onTransitionEnd = (e) => {
        this.actions.handleHideColumns(e);
        console.log('transition end')
    }
    disableChange = (e) => {
        let value = e.target.value;
        value = value.toUpperCase();
        if (value=="TRUE") {
            value = true;
        } else {
            value = false;
        }
        console.log(value)
    }
    render() {
        let self = this;
        let html;
        let props = this.props;
        let state = this.state;
        let passwordSectionHTML = null;
        let formButtonsHTML = (
            <ButtonGroup className="buttonGroup">
                <Button label="EDIT" type="submit" onClick={this.editProject} />
            </ButtonGroup>
        );
        if(!this.state.isReadOnly) {
            formButtonsHTML = (
                                state.isEdit ?
                                (
                                    <ButtonGroup className="buttonGroup">
                                        <Button label="Update" type="submit" onClick={this.updateProject} />
                                        <Button label="Delete" onClick={this.deleteProject} />
                                        <Button label="Cancel" onClick={this.cancelEditProject} />
                                    </ButtonGroup>
                                )
                                : (
                                    <ButtonGroup className="buttonGroup">
                                        <Button label="Create" type="submit" onClick={this.createProject}  />
                                    </ButtonGroup>
                                )
                            )
        }

        html = (
            <PanelWrapper className={`row projectManagement ${!this.state.projectOpen ? 'projectList-open' : ''}`} style={{'alignContent': 'center', 'flexDirection': 'row'}} >
                <PanelWrapper ref={(div) => { this.projectList = div}} className={`column projectList expanded ${this.state.projectOpen ? 'collapsed ' : ' '} ${this.state.hideColumns ? 'hideColumns ' : ' '}`}>
                    <Panel title="Project List" style={{marginBottom: 0}} no-corners>
                        <div className="tableRow tableRow--header">
                            <div className="projectName">
                                projectName
                            </div>
                            <div>
                                Description
                            </div>
                        </div>
                        {state.projects && state.projects.map((u, k) => {
                            let platformRoles = [];
                            for(let role in u.platformRoles) {
                                platformRoles.push(<div>{`${role}: ${u.platformRoles[role]}`}</div>)
                            }
                            return (
                                <div ref={(el) => this[`project-ref-${k}`] = el} className={`tableRow tableRow--data ${((self.state.activeIndex == k) && self.state.projectOpen) ? 'tableRow--data-active' : ''}`} key={k}>
                                    <div
                                        className={`projectName projectName-header ${((self.state.activeIndex == k) && self.state.projectOpen) ? 'activeProject' : ''}`}
                                        onClick={self.viewProject.bind(null, u, k)}>
                                        {u['name']}
                                    </div>
                                    <div>
                                        {u['description']}
                                    </div>


                                </div>
                            )
                        })}
                    </Panel>
                    <ButtonGroup  className="buttonGroup" style={{margin: '0 0.5rem 0.5rem', background: '#ddd', paddingBottom: '0.5rem'}}>
                        <Button label="Add Project" onClick={this.addProject} />
                    </ButtonGroup>
                </PanelWrapper>
                <PanelWrapper onKeyUp={this.evaluateSubmit}
                    className={`ProjectAdmin column`}>
                    <Panel
                        title={state.isEdit ? state['name'] : 'Create Project'}
                        style={{marginBottom: 0}}
                        hasCloseButton={this.closePanel}
                        no-corners>
                        <FormSection title="PROJECT INFO">
                        {
                            this.state.isEdit ?
                                null
                                : <Input  readonly={state.isReadOnly}  label="Name" value={state['name']} onChange={this.updateInput.bind(null, 'name')} />
                        }
                            <Input readonly={state.isReadOnly} type="textarea" label="Description" value={state['description']}  onChange={this.updateInput.bind(null, 'description')}></Input>
                        </FormSection>
                        <FormSection title="USER ROLES">
                        <div className="tableRow tableRow--header">
                            <div className="projectName">
                                User Name
                            </div>
                            <div>
                                Role
                            </div>
                        </div>
                            {
                                state.projectUsers && state.projectUsers.map((u, k) => {
                                    return (
                                        <div ref={(el) => this[`project-ref-${k}`] = el} className={`tableRow tableRow--data projectUsers`} key={k}>
                                            <div className="userName" style={state.isReadOnly ? {paddingTop: '0.25rem'} : {} }>{u['user-name']}</div>
                                            <div>
                                                {
                                                    u.role && u.role.map((r, l) => {
                                                        return (
                                                            <div key={l}>
                                                                <div style={{display: 'flex'}} className="selectRole">
                                                                    <SelectOption
                                                                        readonly={state.isReadOnly}
                                                                        defaultValue={r.role}
                                                                        options={state.roles}
                                                                        onChange={self.updateUserRoleInProject.bind(self, k, l)}
                                                                    />
                                                                    {!state.isReadOnly ?
                                                                        <span
                                                                        className="removeInput"
                                                                        onClick={self.removeRoleFromUserInProject.bind(self, k, l)}
                                                                        >
                                                                            <img src={imgRemove} />
                                                                            Remove Role
                                                                        </span>
                                                                        : null
                                                                    }

                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                                {!state.isReadOnly ?
                                                    <div className="buttonGroup">
                                                        <span className="addInput addRole" onClick={self.addRoleToUserInProject.bind(self, k)}><img src={imgAdd} />
                                                            Add Role
                                                        </span>
                                                        {
                                                            (!(u.role && u.role.length)) ?
                                                                <span
                                                                    className="removeInput"
                                                                    onClick={self.removeUserFromProject.bind(self, k)}
                                                                >
                                                                    <img src={imgRemove} />
                                                                    Remove User
                                                                </span> : null
                                                        }
                                                    </div>
                                                    : null
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            {
                                !state.isReadOnly ?
                                    <div className="tableRow tableRow--header">
                                        <div>
                                            <div className="addUser">
                                                <SelectOption
                                                    onChange={this.actions.handleSelectedUser}
                                                    defaultValue={state.selectedUser}
                                                    initial={true}
                                                    options={state.users && state.users.map((u) => {
                                                        return {
                                                            label: u['user-name'],
                                                            value: u
                                                        }
                                                    })}
                                                />
                                                <span className="addInput" onClick={this.addUserToProject}><img src={imgAdd} />
                                                    Add User
                                                </span>
                                            </div>
                                        </div>
                                    </div> : null
                            }

                        </FormSection>

                    </Panel>
                        {formButtonsHTML}

                </PanelWrapper>


            </PanelWrapper>
        );
        return html;
    }
}
// onClick={this.Store.update.bind(null, Account)}
ProjectManagementDashboard.contextTypes = {
    router: React.PropTypes.object
};

ProjectManagementDashboard.defaultProps = {
    projectList: [],
    selectedProject: {}
}

export default SkyquakeComponent(ProjectManagementDashboard);


function isElementInView(el) {
    var rect = el && el.getBoundingClientRect() || {};

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}


// isReadOnly={state.isReadOnly} disabled={state.disabled} onChange={this.disableChange}

class isDisabled extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let props = this.props;
        return (<div/>)
    }
}



