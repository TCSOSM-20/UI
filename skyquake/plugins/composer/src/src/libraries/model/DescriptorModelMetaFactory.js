/**
 * Created by onvelocity on 1/27/16.
 *
 * This class provides methods to get the metadata about descriptor models.
 */

'use strict';

import _cloneDeep from 'lodash/cloneDeep'
import utils from './../utils'
import DescriptorModelMetaProperty from './DescriptorModelMetaProperty'
import CommonUtils from 'utils/utils';
const assign = Object.assign;

const exportInnerTypesMap = {
	'constituent-vnfd': 'nsd.constituent-vnfd',
	'vdu': 'vnfd.vdu'
};

function getPathForType(type) {
	if (exportInnerTypesMap[type]) {
		return exportInnerTypesMap[type];
	}
	return type;
}

let modelMetaByPropertyNameMap = [];

let cachedDescriptorModelMetaRequest = null;

export default {
	init() {
		if (!cachedDescriptorModelMetaRequest) {
			cachedDescriptorModelMetaRequest = new Promise(function(resolve, reject) {
				CommonUtils.getDescriptorModelMeta().then(function(data) {
					let DescriptorModelMetaJSON = data;
					modelMetaByPropertyNameMap = Object.keys(DescriptorModelMetaJSON).reduce((map, key) => {
						function mapProperties(parentMap, parentObj) {
							parentMap[':meta'] = parentObj;
							const properties = parentObj && parentObj.properties ? parentObj.properties : [];
							properties.forEach(p => {
								parentMap[p.name] = mapProperties({}, assign(p, {':qualified-type': parentObj[':qualified-type'] + '.' + p.name}));
								return map;
							}, parentMap);
							return parentMap;
						}
						map[key] = mapProperties({}, assign(DescriptorModelMetaJSON[key], {':qualified-type': key}));
						return map;
					}, {});

					(() => {
						// initialize the UI centric properties that CONFD could care less about
						utils.assignPathValue(modelMetaByPropertyNameMap, 'nsd.meta.:meta.preserve-line-breaks', true);
						utils.assignPathValue(modelMetaByPropertyNameMap, 'vnfd.meta.:meta.preserve-line-breaks', true);
						utils.assignPathValue(modelMetaByPropertyNameMap, 'vnfd.vdu.cloud-init.:meta.preserve-line-breaks', true);
						utils.assignPathValue(modelMetaByPropertyNameMap, 'nsd.constituent-vnfd.vnf-configuration.config-template.:meta.preserve-line-breaks', true);
					})();
					resolve();
				}, function(error) {
					cachedDescriptorModelMetaRequest = null;
				})
			})
		}

		return cachedDescriptorModelMetaRequest;
	},
	/**
	 * Create a new instance of the indicated property and, if relevent, use the given
	 * unique name for the instance's key (see generateItemUniqueName)
	 * 
	 * @param {Object | string} typeOrPath a property definition object or a path to a property 
	 * @param [{string}] uniqueName optional 
	 * @returns 
	 */
	createModelInstanceForType(typeOrPath, uniqueName) {
		const modelMeta = this.getModelMetaForType(typeOrPath);
		return DescriptorModelMetaProperty.createModelInstance(modelMeta, uniqueName);
	},
	getModelMetaForType(typeOrPath, filterProperties = () => true) {
		// resolve paths like 'nsd' or 'vnfd.vdu' or 'nsd.constituent-vnfd'
		const found = utils.resolvePath(modelMetaByPropertyNameMap, getPathForType(typeOrPath));
		if (found) {
			const uiState = _cloneDeep(found[':meta']);
			uiState.properties = uiState.properties.filter(filterProperties);
			return uiState;
		}
		console.warn('no model uiState found for type', typeOrPath);
	},
	getModelFieldNamesForType(typeOrPath) {
		// resolve paths like 'nsd' or 'vnfd.vdu' or 'nsd.constituent-vnfd'
		const found = utils.resolvePath(modelMetaByPropertyNameMap, getPathForType(typeOrPath));
		if (found) {
			let result = [];
			found[':meta'].properties.map((p) => {
				// if(false) {
				if(p.type == 'choice') {
					result.push(p.name)
					return p.properties.map(function(q){
						result.push(q.properties[0].name);
					})

				} else  {
					return result.push(p.name);
				}
			})
			return result;
		}
		console.warn('no model uiState found for type', typeOrPath);
	},
	/**
	 * For a list with a single valued key that is of type string, generate a unique name
	 * for a new entry to be added to the indicated list. This name will use the provided
	 * prefix (or the list's name) followed by a number. The number will be based on the
	 * current length of the array but will insure there is no collision with an existing
	 * name.
	 * 
	 * @param {Array} list the list model data
	 * @param {prooerty} property the schema definition of the list 
	 * @param [{any} prefix] the perferred prefix for the name. If not provide property.name
	 *  will be used. 
	 * @returns {string}
	 */
	generateItemUniqueName (list, property, prefix) {
		if (   property.type !== 'list' 
			|| property.key.length !== 1
			|| property.properties.find(prop => prop.name === property.key[0])['data-type'] !== 'string') {
			// only support list with a single key of type string
			return null;
		}
		if (!prefix) {
			prefix = property.name;
		}
		let key = property.key[0];
		let suffix = list ? list.length + 1 : 1
		let keyValue = prefix + '-' + suffix;
		function makeUniqueName() {
			if (list) {
				for (let i = 0; i < list.length; i = ++i) {
					if (list[i][key] === keyValue) {
						keyValue = keyValue + '-' + (i+1);
						makeUniqueName(); // not worried about recursing too deep (chances ??)
						break;
					}
				}
			}
		}
		makeUniqueName();
		return keyValue;
	}

}
