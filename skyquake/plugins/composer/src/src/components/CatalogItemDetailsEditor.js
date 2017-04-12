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
'use strict';

import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import EditDescriptorModelProperties from './EditDescriptorModelProperties'
import {SkyquakeRBAC, isRBACValid} from 'widgets/skyquake_rbac/skyquakeRBAC.jsx';
import ROLES from 'utils/roleConstants.js';
const PROJECT_ROLES = ROLES.PROJECT;
const PLATFORM = ROLES.PLATFORM;

const CatalogItemDetailsEditor = React.createClass({
	mixins: [PureRenderMixin],
	getInitialState() {
		return {};
	},
	getDefaultProps() {
		return {
			container: null,
			width: 0
		};
	},
	contextTypes: {
	    router: React.PropTypes.object,
	    userProfile: React.PropTypes.object
	},
	componentWillMount() {
	},
	componentDidMount() {
	},
	componentDidUpdate() {
	},
	componentWillUnmount() {
	},
	render() {
      	const User = this.context.userProfile;

		const container = this.props.container || {model: {}, uiState: {}};
		if (!(container && container.model && container.uiState)) {
			return null;
		}

		return (
			<div className="CatalogItemDetailsEditor">
				<form name="details-descriptor-editor-form">
					<div className="properties-group">
					{
						isRBACValid(User, [PROJECT_ROLES.CAT_ADMIN]) ?
							<EditDescriptorModelProperties container={this.props.container} width={this.props.width} />
						: <EditDescriptorModelProperties container={this.props.container} width={this.props.width} readonly={true} />
					}
					</div>
				</form>
			</div>
		);

	}
});

CatalogItemDetailsEditor.contextTypes = {
    router: React.PropTypes.object,
    userProfile: React.PropTypes.object
};
export default CatalogItemDetailsEditor;
