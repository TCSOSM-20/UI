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
/**
 * Created by onvelocity on 11/23/15.
 */

'use strict';

import ColorGroups from '../../ColorGroups'
import DescriptorModel from '../DescriptorModel'
import ForwardingGraph from './ForwardingGraph'
import VirtualNetworkFunctionAccessPointMap from './VirtualNetworkFunctionAccessPointMap'
import VirtualLink from './VirtualLink'
import ConstituentVnfd from './ConstituentVnfd'
import PhysicalNetworkFunction from './PhysicalNetworkFunction'
import DescriptorModelFactory from '../DescriptorModelFactory'
import DescriptorModelMetaFactory from '../DescriptorModelMetaFactory'

const indexAsInteger = d => 1 + (parseInt(d.model['member-vnf-index'], 10) || 0);

const suffixAsInteger = function (field) {
	return (d) => 1 + (parseInt(String(d.model[field]).split('').reverse().join(''), 10) || 0);
};

const toBiggestValue = (newIndex, curIndex) => Math.max(newIndex, curIndex);

export default class NetworkService extends DescriptorModel {

	static get type() {
		return 'nsd';
	}

	static get className() {
		return 'NetworkService';
	}

	constructor(model, parent) {
		super(model, parent);
		this.type = 'nsd';
		this.className = 'NetworkService';
		this._connectors = [];
	}

	get constituentVnfd() {
		if (!this.model['constituent-vnfd']) {
			this.model['constituent-vnfd'] = [];
		}
		return this.model['constituent-vnfd'].map(d => DescriptorModelFactory.newConstituentVnfd(d, this));
	}

	set constituentVnfd(obj) {
		const updateNextVnfdIndex = (cvnfd) => {
			const items = this.constituentVnfd;
			const length = items.length;
			// the default value is set to an instance count but we want it to be a sequence no
			cvnfd.model['member-vnf-index'] = 0;
			cvnfd.model['member-vnf-index'] = items.map(indexAsInteger).reduce(toBiggestValue, length);
		};
		this.updateModelList('constituent-vnfd', obj, ConstituentVnfd, updateNextVnfdIndex);
	}

	createConstituentVnfd(model) {
		model = model || DescriptorModelMetaFactory.createModelInstanceForType('nsd.constituent-vnfd');
		return this.constituentVnfd = DescriptorModelFactory.newConstituentVnfd(model, this);
	}

	removeConstituentVnfd(cvnfd) {
		cvnfd = this.findChildByUid(cvnfd);
		this.vld.forEach(vld => vld.removeVnfdConnectionPointRefForVnfdIndex(cvnfd.vnfdIndex));
		this.vnffgd.forEach(fg => fg.removeVnfdConnectionPointRefForVnfdIndex(cvnfd.vnfdIndex));
		return this.removeModelListItem('constituentVnfd', cvnfd);
	}

	get pnfd() {
		if (!this.model.pnfd) {
			this.model.pnfd = [];
		}
		return this.model.pnfd.map(d => DescriptorModelFactory.newPhysicalNetworkFunction(d, this));
	}

	set pnfd(obj) {
		this.updateModelList('pnfd', obj, PhysicalNetworkFunction);
	}

	createPnfd(model) {
		model = model || DescriptorModelMetaFactory.createModelInstanceForType('nsd.pnfd');
		return this.pnfd = DescriptorModelFactory.newPhysicalNetworkFunction(model, this);
	}

	removePnfd(pnfd) {
		return this.removeModelListItem('pnfd', pnfd);
	}


	get vld() {
		if (!this.model.vld) {
			this.model.vld = [];
		}
		return this.model.vld.map(d => DescriptorModelFactory.newVirtualLink(d, this));
	}

	set vld(obj) {
		this.updateModelList('vld', obj, VirtualLink);
	}

	createVld() {
		const property = DescriptorModelMetaFactory.getModelMetaForType('nsd.vld');
		const uniqueName = DescriptorModelMetaFactory.generateItemUniqueName(this.vld, property);
		const model = DescriptorModelMetaFactory.createModelInstanceForType('nsd.vld', uniqueName);
		return this.vld = DescriptorModelFactory.newVirtualLink(model, this);
	}

	removeVLD(vld) {
		return this.removeModelListItem('vld', vld);
	}


// <<<<<<< Updated upstream
//     get configParameterMap() {
//         if (!this.model['config-parameter-map']) {
//             this.model['config-parameter-map'] = [];
//         }
//         return this.model['config-parameter-map'].map(d => DescriptorModelFactory.newVirtualNetworkFunctionAccessPointMap(d, this)).map((fg, i) => {
//             return fg;
//         });
//     }

//     set configParameterMap(obj) {
//         const onVirtualNetworkFunctionAccessPointMap = (fg) => {

//         };
//         this.updateModelList('config-parameter-map', obj, VirtualNetworkFunctionAccessPointMap, onVirtualNetworkFunctionAccessPointMap);
//     }

//     createConfigParameterMap(model) {
//         model = model || DescriptorModelMetaFactory.createModelInstanceForType('nsd.config-parameter-map');
//         return this.configParameterMap = DescriptorModelFactory.newVirtualNetworkFunctionAccessPointMap(model, this);
//     }
// =======
	get configParameterMap() {
		if (!this.model['config-parameter-map']) {
			this.model['config-parameter-map'] = [];
		}
		return this.model['config-parameter-map'].map(d => DescriptorModelFactory.newVirtualNetworkFunctionAccessPointMap(d, this))
	}

	set configParameterMap(obj) {
		this.updateModelList('config-parameter-map', obj, VirtualNetworkFunctionAccessPointMap);
	}

	createConfigParameterMap() {
		const model = DescriptorModelMetaFactory.createModelInstanceForType('nsd.config-parameter-map');
		return this.configParameterMap = DescriptorModelFactory.newVirtualNetworkFunctionAccessPointMap(model, this);
	}
// >>>>>>> Stashed changes

	get vnffgd() {
		if (!this.model.vnffgd) {
			this.model.vnffgd = [];
		}
		return this.model.vnffgd.map(d => DescriptorModelFactory.newForwardingGraph(d, this)).map((fg, i) => {
			fg.uiState.colors = ColorGroups.getColorPair(i);
			return fg;
		});
	}

	set vnffgd(obj) {
		this.updateModelList('vnffgd', obj, ForwardingGraph);
	}

	createVnffgd(model) {
		const property = DescriptorModelMetaFactory.getModelMetaForType('nsd.vnffgd');
		const uniqueName = DescriptorModelMetaFactory.generateItemUniqueName(this.vnffgd, property, 'fg');
		model = model || DescriptorModelMetaFactory.createModelInstanceForType('nsd.vnffgd', uniqueName);
		return this.vnffgd = DescriptorModelFactory.newForwardingGraph(model, this);
	}

	removeVnffgd(fg) {
		return this.removeModelListItem('vnffgd', fg);
	}

	get forwardingGraphs() {
		return this.vnffgd;
	}



	// NOTE temporarily disable NSD connection points
	// https://trello.com/c/crVgg2A1/88-do-not-render-nsd-connection-in-the-composer
	//get connectionPoint() {
	//	if (this.model && this.model['connection-point']) {
	//		return this.model['connection-point'];
	//	}
	//	return [];
	//}
	//
	//get connectors() {
	//	const parent = this;
	//	if (!this._connectors.length) {
	//		this._connectors = this.connectionPoint.map(cp => {
	//			return DescriptorModelFactory.newConnectionPoint(parent, cp);
	//		});
	//	}
	//	return this._connectors;
	//}

	removeAnyConnectionsForConnector(cpc) {
		// todo need to also remove connection points from related ForwardingGraph paths
		this.vld.forEach(vldc => vldc.removeVnfdConnectionPointRefKey(cpc.key));
	}

	createConstituentVnfdForVnfd(vnfdRef) {
		const cvnfd = this.createConstituentVnfd();
		cvnfd.vnfdRef = vnfdRef;
		cvnfd.vnfdId = vnfdRef.id;
		return cvnfd;
	}

}
