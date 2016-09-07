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

import DescriptorModel from '../DescriptorModel'
import DescriptorModelFactory from '../DescriptorModelFactory'

export default class InternalConnectionPointRef extends DescriptorModel {

	static get type() {
		return 'internal-connection-point-ref';
	}

	static get className() {
		return 'InternalConnectionPointRef';
	}

	static get qualifiedType() {
		return 'vnfd.internal-vld.' + InternalConnectionPointRef.type;
	}

	constructor(m, parent) {
		super(!m || typeof m === 'string' ? {id: m, isLeaf: true} : m, parent);
		this.uid = this.id;
		this.type = InternalConnectionPointRef.type;
		this.uiState['qualified-type'] = InternalConnectionPointRef.qualifiedType;
		this.className = InternalConnectionPointRef.className;
	}

	toString() {
		return this.valueOf();
	}

	remove() {
		return this.parent.removeInternalConnectionPointRefForId(this.id);
	}

	valueOf() {
		return this.id;
	}

}
