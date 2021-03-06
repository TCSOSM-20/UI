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

import Classifier from './Classifier'
import DescriptorModel from '../DescriptorModel'
import RecordServicePath from './RecordServicePath'
import DescriptorModelFactory from '../DescriptorModelFactory'
import DescriptorModelMetaFactory from '../DescriptorModelMetaFactory'

export default class ForwardingGraph extends DescriptorModel {

	static get type() {
		return 'vnffgd';
	}

	static get className() {
		return 'ForwardingGraph';
	}

	constructor(model, parent) {
		super(model, parent);
		this.type = 'vnffgd';
		this.uiState['qualified-type'] = 'nsd.vnffgd';
		this.className = 'ForwardingGraph';
	}

	get rsp() {
		if (!this.model.rsp) {
			this.model.rsp = [];
		}
		return this.model.rsp.map(d => DescriptorModelFactory.newRecordServicePath(d, this));
	}

	set rsp(obj) {
		this.updateModelList('rsp', obj, RecordServicePath);
	}

	createRsp() {
		const property = DescriptorModelMetaFactory.getModelMetaForType('nsd.vnffgd.rsp');
		const uniqueName = DescriptorModelMetaFactory.generateItemUniqueName(this.rsp, property);
		const model = DescriptorModelMetaFactory.createModelInstanceForType('nsd.vnffgd.rsp', uniqueName);
		return this.rsp = new RecordServicePath(model, this);
	}

	removeRsp(obj) {
		this.children.filter(d => d.id === obj.id).forEach(rsp => rsp.remove());
	}

	get recordServicePaths() {
		return this.rsp;
	}

	removeRecordServicePath(child) {
		this.rsp = this.rsp.filter(rsp => rsp.uid !== child.uid);
		this.removeChild(child);
	}

	get classifier() {
		if (!this.model['classifier']) {
			this.model['classifier'] = [];
		}
		return this.model['classifier'].map(d => DescriptorModelFactory.newClassifier(d, this));
	}

	set classifier(obj) {
		this.updateModelList('classifier', obj, Classifier);
	}

	createClassifier(model) {
		model = model || DescriptorModelMetaFactory.createModelInstanceForType(DescriptorModelFactory.Classifier.qualifiedType);
		return this.classifier = DescriptorModelFactory.newClassifier(model, this);
	}

	removeClassifier(child) {
		return this.removeModelListItem('classifier', child);
	}

	remove() {
		if (this.parent) {
			return this.parent.removeVnffgd(this);
		}
	}

	getColor() {

	}

	createClassifierForRecordServicePath(rsp) {
		const classifier = this.createClassifier();
		classifier.model['rsp-id-ref'] = rsp.id;
	}

	removeVnfdConnectionPointRefForVnfdIndex(vnfdIndex) {
		this.rsp.forEach(rsp => rsp.removeVnfdConnectionPointRefForVnfdIndex(vnfdIndex));
	}

}

