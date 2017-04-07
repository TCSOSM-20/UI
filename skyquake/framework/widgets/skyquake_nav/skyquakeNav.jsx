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

import React from 'react';
import { Link } from 'react-router';
import Utils from 'utils/utils.js';
import Crouton from 'react-crouton';
import 'style/common.scss';

import './skyquakeNav.scss';
import SelectOption from '../form_controls/selectOption.jsx';
import {FormSection} from '../form_controls/formControls.jsx';
import SkyquakeRBAC from 'widgets/skyquake_rbac/skyquakeRBAC.jsx';

//Temporary, until api server is on same port as webserver
var rw = require('utils/rw.js');
var API_SERVER = rw.getSearchParams(window.location).api_server;
var UPLOAD_SERVER = rw.getSearchParams(window.location).upload_server;

//
// Internal classes/functions
//

class LogoutAppMenuItem extends React.Component {
    handleLogout() {
        Utils.clearAuthentication();
    }
    render() {
        return (
            <div className="app">
                <h2>
                    <a onClick={this.handleLogout}>
                        Logout
                    </a>
                </h2>
            </div>
        );
    }
}

class SelectProject extends React.Component {
    constructor(props) {
        super(props);
    }
    selectProject(e) {
        let value = JSON.parse(e.currentTarget.value);
        console.log('selected project', value)
    }
    render() {
        let props = this.props;
        let currentValue = JSON.stringify(props.currentProject);
        let projects = this.props.projects && this.props.projects.map((p,i) => {
            return {
                label: p.name,
                value: p.name
            }
        });
        let hasProjects = (this.props.projects && (this.props.projects.length > 0))
        return (
            <div className="userSection app">
                {
                    hasProjects ?  'Project:' : 'No Projects Assigned'
                }
                {
                    hasProjects ?
                    <SelectOption
                        options={projects}
                        value={currentValue}
                        defaultValue={currentValue}
                        onChange={props.onSelectProject}
                        className="projectSelect" />
                    : null
                }
            </div>
        )
    }
}

class UserNav extends React.Component {
    constructor(props) {
        super(props);
    }
    handleLogout() {
        Utils.clearAuthentication();
    }
    selectProject(e) {
        let value = JSON.parse(e.currentTarget.value)
        console.log('selected project', value)
    }
    render() {
        let props = this.props;
        let userProfileLink = '';
        this.props.nav['user_management'] && this.props.nav['user_management'].routes.map((r) => {
            if(r.unique) {
                userProfileLink = returnLinkItem(r, props.currentUser)
            }
        })
        return (
            <div className="app">
                <h2>
                    USER: {userProfileLink}
                    <span className="oi" data-glyph="caret-bottom"></span>
                </h2>
                <ul className="menu">
                    <li>
                        <a onClick={this.handleLogout}>
                            Logout
                        </a>
                    </li>
                </ul>
            </div>
        )
    }
}

UserNav.defaultProps = {
    projects: [

    ]
}

//
// Exported classes and functions
//

//
/**
 * Skyquake Nav Component. Provides navigation functionality between all plugins
 */
export default class skyquakeNav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.validateErrorEvent = 0;
        this.state.validateErrorMsg = '';
    }
    componentDidMount() {
        this.props.store.openProjectSocket();
        this.props.store.getUserProfile();
    }
    validateError = (msg) => {
        this.setState({
            validateErrorEvent: true,
            validateErrorMsg: msg
        });
    }
    validateReset = () => {
        this.setState({
            validateErrorEvent: false
        });
    }
    returnCrouton = () => {
        return <Crouton
            id={Date.now()}
            message={this.state.validateErrorMsg}
            type={"error"}
            hidden={!(this.state.validateErrorEvent && this.state.validateErrorMsg)}
            onDismiss={this.validateReset}
        />;
    }
    render() {
        let html;
        html = (
                <div>
                {this.returnCrouton()}
            <nav className="skyquakeNav">
                {buildNav.call(this, this.props.nav, this.props.currentPlugin, this.props)}
            </nav>

            </div>
        )
        return html;
    }
}
skyquakeNav.defaultProps = {
    nav: {}
}
/**
 * Returns a React Component
 * @param  {object} link  Information about the nav link
 * @param  {string} link.route Hash route that the SPA should resolve
 * @param  {string} link.name Link name to be displayed
 * @param  {number} index index of current array item
 * @return {object} component A React LI Component
 */
//This should be extended to also make use of internal/external links and determine if the link should refer to an outside plugin or itself.
export function buildNavListItem (k, link, index) {
    let html = false;
    if (link.type == 'external') {
        this.hasSubNav[k] = true;
        html = (
            <li key={index}>
                {returnLinkItem(link)}
            </li>
        );
    }
    return html;
}

/**
 * Builds a link to a React Router route or a new plugin route.
 * @param  {object} link Routing information from nav object.
 * @return {object}  component   returns a react component that links to a new route.
 */
export function returnLinkItem(link, label) {
    let ref;
    let route = link.route;
    if(link.isExternal) {
        ref = (
            <a href={route}>{label || link.label}</a>
        )
    } else {
        if(link.path && link.path.replace(' ', '') != '') {
            route = link.path;
        }
        if(link.query) {
            let query = {};
            query[link.query] = '';
            route = {
                pathname: route,
                query: query
            }
        }
        ref = (
            <Link to={route}>
                {label || link.label}
            </Link>
        )
    }
    return ref;
}




/**
 * Constructs nav for each plugin, along with available subnavs
 * @param  {array} nav List returned from /nav endpoint.
 * @return {array}     List of constructed nav element for each plugin
 */
export function buildNav(nav, currentPlugin, props) {
    let navList = [];
    let navListHTML = [];
    let secondaryNav = [];
    let adminNav = [];
    let self = this;
    self.hasSubNav = {};
    let secondaryNavHTML = (
        <div className="secondaryNav" key="secondaryNav">
            {secondaryNav}
            <div className="app admin">
                <h2>
                    <a>
                        ADMIN <span className="oi" data-glyph="caret-bottom"></span>
                    </a>
                </h2>
                <ul className="menu">
                    {
                        adminNav
                    }
                </ul>
            </div>
            <SelectProject
                onSelectProject={props.store.selectActiveProject}
                projects={props.projects}
                currentProject={props.currentProject} />
            <UserNav
                currentUser={props.currentUser}
                nav={nav}  />
        </div>
    )
    for (let k in nav) {
        if (nav.hasOwnProperty(k)) {
            self.hasSubNav[k] = false;
            let header = null;
            let navClass = "app";
            let routes = nav[k].routes;
            let navItem = {};
            //Primary plugin title and link to dashboard.
            let route;
            let NavList;
            if (API_SERVER) {
                route = routes[0].isExternal ? '/' + k + '/index.html?api_server=' + API_SERVER + '' + '&upload_server=' + UPLOAD_SERVER + '' : '';
            } else {
                route = routes[0].isExternal ? '/' + k + '/' : '';
            }
            let dashboardLink = returnLinkItem({
                isExternal: routes[0].isExternal,
                pluginName: nav[k].pluginName,
                label: nav[k].label || k,
                route: route
            });
            if (nav[k].pluginName == currentPlugin) {
                navClass += " active";
            }
            NavList = nav[k].routes.map(buildNavListItem.bind(self, k));
            navItem.priority = nav[k].priority;
            navItem.order = nav[k].order;
            if(nav[k].admin_link) {
                adminNav.push((
                    <li key={nav[k].name}>
                        {dashboardLink}
                    </li>
                ))
            } else {
                            navItem.html = (
                <SkyquakeRBAC allow={nav[k].allow || ['*']} key={k} className={navClass}>
                    <h2>{dashboardLink} {self.hasSubNav[k] ? <span className="oi" data-glyph="caret-bottom"></span> : ''}</h2>
                    <ul className="menu">
                        {
                            NavList
                        }
                    </ul>
                </SkyquakeRBAC>
            );
            navList.push(navItem)
            }

        }
    }
    //Sorts nav items by order and returns only the markup
    navListHTML = navList.sort((a,b) => a.order - b.order).map(function(n) {
        if((n.priority  < 2)){
            return n.html;
        } else {
            secondaryNav.push(n.html);
        }
    });
    navListHTML.push(secondaryNavHTML);
    return navListHTML;
}
