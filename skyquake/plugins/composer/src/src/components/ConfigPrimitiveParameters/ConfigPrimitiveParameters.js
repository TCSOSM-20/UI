
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

import d3 from 'd3'
import React from 'react'
import Range from '../Range'
import Button from '../Button'
import ClassNames from 'classnames'
import changeCase from 'change-case'
import LayoutRow from '../LayoutRow'
import SelectionManager from '../../libraries/SelectionManager'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import CatalogItemsActions from '../../actions/CatalogItemsActions'
import CanvasEditorActions from '../../actions/CanvasEditorActions'
import DescriptorModelFactory from '../../libraries/model/DescriptorModelFactory'
import ComposerAppActions from '../../actions/ComposerAppActions'
import DescriptorModelMetaFactory from '../../libraries/model/DescriptorModelMetaFactory'
import ComposerAppStore from '../../stores/ComposerAppStore'
import DeletionManager from '../../libraries/DeletionManager'
import ContentEditableDiv from '../ContentEditableDiv'
import TooltipManager from '../../libraries/TooltipManager'
import HighlightRecordServicePaths from '../../libraries/graph/HighlightRecordServicePaths'

import '../../styles/EditForwardingGraphPaths.scss'

import imgNSD from '../../images/default-catalog-icon.svg'
import imgFG from '../../../../node_modules/open-iconic/svg/infinity.svg'
import imgRemove from '../../../../node_modules/open-iconic/svg/trash.svg'
import imgAdd from '../../../../node_modules/open-iconic/svg/plus.svg'
import imgConnection from '../../../../node_modules/open-iconic/svg/random.svg'
import imgClassifier from '../../../../node_modules/open-iconic/svg/spreadsheet.svg'
import imgReorder from '../../../../node_modules/open-iconic/svg/menu.svg'
import EditConfigParameterMap from '../EditConfigParameterMap'
function configParameterMapMap(ap, i) {

    const context = this;
    context.vnfapMap = ap;
    return (
        <div key={i}>
        <div>{ap.id}</div>
        <div>{ap.capability['member-vnf-index']}</div>
        <div>{ap.capability['capability-ref']}</div>

        </div>
    )

}

function mapNSD(nsd, i) {

    const context = this;
    context.nsd = nsd;

    function onClickAddConfigParameterMap(nsd, event) {
        event.preventDefault();
        nsd.createConfigParameterMap();
        CatalogItemsActions.catalogItemDescriptorChanged(nsd.getRoot());
    }

    const forwardingGraphs = nsd.configParameterMap.map(configParameterMap.bind(context));
    if (forwardingGraphs.length === 0) {
        forwardingGraphs.push(
            <div key="1" className="welcome-message">
                No Forwarding Graphs to model.
            </div>
        );
    }

    return (
        <div key={i} className={nsd.className}>
            {forwardingGraphs}
            <div className="footer-actions">
                <div className="row-action-column">
                    <Button className="create-new-forwarding-graph" src={imgAdd} width="20px" onClick={onClickAddConfigParameterMap.bind(null, nsd)} label="Add new Access Point" />
                </div>
            </div>
        </div>
    );

}

const ConfigPrimitiveParameters = React.createClass({
    mixins: [PureRenderMixin],
    getInitialState: function () {
        return ComposerAppStore.getState();
    },
    getDefaultProps: function () {
        return {
            containers: []
        };
    },
    componentWillMount: function () {
    },
    componentDidMount: function () {
    },
    componentDidUpdate: function () {
    },
    componentWillUnmount: function () {
    },
    render() {
        const self = this;
        const containers = this.props.containers;
        const context = {
            component: this,
            containers: containers
        };

        const networkService = containers.filter(d => d.type === 'nsd');
        if (networkService.length === 0) {
            return <p className="welcome-message">No <img src={imgNSD} width="20px" /> NSD open in the canvas. Try opening an NSD.</p>;
        }
        return (
                <div className="ConfigParameterMap">
                    <div className="config-parameter-map">
                        <div className="config-parameter-titles">
                            <div className="config-parameter">
                                Request
                            </div>
                            <div className="config-parameter">
                                Source
                            </div>
                        </div>
                        {
                            containers.map(function(c, i) {
                                if(c.className == 'ConfigParameterMap') {
                                    return <EditConfigParameterMap key={i} container={c} width={self.props.width} />
                                }
                            })
                        }
                        <div className="toggle-bottom-spacer" style={{visibility: 'hidden', 'height': '50%', position: 'absolute'}}>We need this so when the user closes the panel it won't shift away and scare the bj out of them!</div>
                    </div>
                </div>
        )
    }
});



export default ConfigPrimitiveParameters;
//<EditDescriptorModelProperties container={DescriptorModelMetaFactory.createModelInstanceForType('nsd.vnffgd.rsp')} width={this.props.width} />
