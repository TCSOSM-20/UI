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
 * Created by onvelocity on 1/27/16.
 *
 * This class creates the initial descriptor model JSON objects.
 */

'use strict';

import _isFunction from 'lodash/isFunction'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _cloneDeep from 'lodash/cloneDeep'
import DescriptorTemplates from './DescriptorTemplates'
import DescriptorModelMetaFactory from './DescriptorModelMetaFactory'

const keys = Object.keys;

function resolveInitHandlers(model) {
	function init(m) {
		keys(m).map(key => {
			const value = m[key];
			if (_isFunction(value)) {
				m[key] = value(m, key, model);
			}
			if (_isArray(value)) {
				value.forEach(v => init(v));
			}
			if (_isObject(value)) {
				init(value);
			}
		});
		return m;
	}
	return init(model);
}

export default {
	createModelForType(type) {
		const template = DescriptorTemplates[type];
		if (template) {
			const model = _cloneDeep(template);
			return resolveInitHandlers(model);
		}
	}
}
