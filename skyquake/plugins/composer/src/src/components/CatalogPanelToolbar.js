
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
import Button from './Button'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import CatalogPanelTrayActions from '../actions/CatalogPanelTrayActions'
import CatalogItemsActions from '../actions/CatalogItemsActions'

import '../styles/CatalogPanelToolbar.scss'

import imgAdd from '../../../node_modules/open-iconic/svg/plus.svg'
import imgCopy from '../../../node_modules/open-iconic/svg/layers.svg'
import imgOnboard from '../../../node_modules/open-iconic/svg/cloud-upload.svg'
import imgUpdate from '../../../node_modules/open-iconic/svg/rain.svg'
import imgDownload from '../../../node_modules/open-iconic/svg/cloud-download.svg'
import imgDelete from '../../../node_modules/open-iconic/svg/trash.svg'
import {SkyquakeRBAC, isRBACValid} from 'widgets/skyquake_rbac/skyquakeRBAC.jsx';
import ROLES from 'utils/roleConstants.js';
const PROJECT_ROLES = ROLES.PROJECT;
const PLATFORM = ROLES.PLATFORM;

const CatalogHeader = React.createClass({
	mixins: [PureRenderMixin],
	getInitialState() {
		return {};
	},
	getDefaultProps() {
	},
	componentWillMount() {
	},
	componentDidMount() {
	},
	componentDidUpdate() {
	},
	componentWillUnmount() {
	},
	contextTypes: {
	    userProfile: React.PropTypes.object
	},
	render() {
		const disabled = !isRBACValid(this.context.userProfile, [PROJECT_ROLES.PROJECT_ADMIN, PROJECT_ROLES.CATALOG_ADMIN]);
		return (
			<div className="CatalogPanelToolbar">
				<h1>Descriptor Catalogs</h1>
				<div className="btn-bar">
					<div className="btn-group">
						<Button type="image" title="OnBoard a catalog package" className="action-onboard-catalog-package" onClick={this.onClickOnBoardCatalog} src={imgOnboard} disabled={disabled}/>
						<Button type="image" title="Update a catalog package" className="action-update-catalog-package" onClick={this.onClickUpdateCatalog} src={imgUpdate}  disabled={disabled}/>
						<Button type="image" title="Export selected catalog item(s)" className="action-export-catalog-items" onClick={this.onClickExportCatalogItems} src={imgDownload}  disabled={disabled}/>
					</div>
					<div className="btn-group">
						<div className="menu">
							<Button type="image" title="Create a new catalog item" className="action-create-catalog-item" onClick={this.onClickCreateCatalogItem.bind(null, 'nsd')} src={imgAdd}  disabled={disabled}/>
							<div className="sub-menu">
								<Button type="image" title="Create a new catalog item" className="action-create-catalog-item" onClick={this.onClickCreateCatalogItem.bind(null, 'nsd')} src={imgAdd} label="Add NSD"  disabled={disabled}/>
								<Button type="image" title="Create a new catalog item" className="action-create-catalog-item" onClick={this.onClickCreateCatalogItem.bind(null, 'vnfd')} src={imgAdd} label="Add VNFD"  disabled={disabled}/>
							</div>
						</div>
						<Button type="image" title="Copy catalog item" className="action-copy-catalog-item" onClick={this.onClickDuplicateCatalogItem} src={imgCopy}  disabled={disabled}/>
					</div>
					<div className="btn-group">
						<Button type="image" title="Delete catalog item" className="action-delete-catalog-item" onClick = {this.onClickDeleteCatalogItem} src={imgDelete}  disabled={disabled}/>
					</div>
				</div>
			</div>
		);
	},
	onClickUpdateCatalog() {
		//CatalogPanelTrayActions.open();
		// note CatalogPackageManagerUploadDropZone wired our btn
		// click event to the DropZone.js configuration and will
		// open the tray when/if files are added to the drop zone
	},
	onClickOnBoardCatalog() {
		//CatalogPanelTrayActions.open();
		// note CatalogPackageManagerUploadDropZone wired our btn
		// click event to the DropZone.js configuration and will
		// open the tray when/if files are added to the drop zone
	},
	onClickDeleteCatalogItem() {
		CatalogItemsActions.deleteSelectedCatalogItem();
	},
	onClickCreateCatalogItem(type) {
		CatalogItemsActions.createCatalogItem(type);
	},
	onClickDuplicateCatalogItem() {
		CatalogPanelTrayActions.open();
		CatalogItemsActions.duplicateSelectedCatalogItem();
	},
	onClickExportCatalogItems() {
		CatalogPanelTrayActions.open();
		CatalogItemsActions.exportSelectedCatalogItems();
	}
});

export default CatalogHeader;
