
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
 * Created by onvelocity on 10/20/15.
 */

import _ from 'lodash'
import utils from './../utils'
import DescriptorModelFields from './DescriptorModelFields'
import DescriptorModelMetaFactory from './DescriptorModelMetaFactory'

let nsdFields = null;
let vldFields = null;
let vnfdFields = null;
let cvnfdFields = null;
let configParameterMapFields = null;




/**
 * Serialize DescriptorModel JSON into CONFD JSON. Also, cleans up the data as needed.
 *
 * @type {{serialize: (function(*=)), ':clean': (function(*=)), nsd: {serialize: (function(*=))}, vld: {serialize: (function(*=))}, vnfd-connection-point-ref: {serialize: (function(*=))}, constituent-vnfd: {serialize: (function(*=))}, vnfd: {serialize: (function(*=))}, vdu: {serialize: (function(*=))}}}
 */
const DescriptorModelSerializer = {
	serialize(model) {
		const type = model.uiState && model.uiState.type;
		const serializer = this[type];
		if (serializer) {
			model = serializer.serialize(model);
			this[':clean'](model);
			return model;
		}
		return false;
	},
	':clean'(model) {
		// remove uiState from all elements accept nsd and vnfd
		// remove empty / blank value fields
		function clean(m) {
			Object.keys(m).forEach(k => {
				const isEmptyObject = typeof m[k] === 'object' && _.isEmpty(m[k]);
				if (typeof m[k] === 'undefined' || isEmptyObject || m[k] === '') {
					delete m[k];
				}
				const isMetaAllowed = /^nsd|vnfd$/.test(m.uiState && m.uiState.type);
				if (k === 'uiState') {
					if (isMetaAllowed) {
						// remove any transient ui state properties
						const uiState = _.pick(m.uiState, DescriptorModelFields.meta);
						if (!_.isEmpty(uiState)) {
							// uiState field must be a string
							m['meta'] = JSON.stringify(uiState);
						}
					}
					delete m[k];
				}
				if (typeof m[k] === 'object') {
					clean(m[k]);
				}
			});
		}
		clean(model);
		return model;
	},
	nsd: {
		serialize(nsdModel) {
			if(!nsdFields) nsdFields = DescriptorModelMetaFactory.getModelFieldNamesForType('nsd').concat('uiState');
			const confd = _.pick(nsdModel, nsdFields);

			// vnfd is defined in the ETSI etsi_gs reference manual but RIFT does not use it
			delete confd.vnfd;

			// map the vnfd instances into the CONFD constituent-vnfd ref instances
			confd['constituent-vnfd'] = confd['constituent-vnfd'].map((d, index) => {

				const constituentVNFD = {
					'member-vnf-index': d['member-vnf-index'],
					'vnfd-id-ref': d['vnfd-id-ref']
				};

				if (d['vnf-configuration']) {
					const vnfConfig = _.cloneDeep(d['vnf-configuration']);
					const configType = vnfConfig['config-type'] || 'none';
					// make sure we send the correct values based on config type
					if (configType === 'none') {
						constituentVNFD['vnf-configuration'] = {'config-type': 'none'};
						const configPriority = utils.resolvePath(vnfConfig, 'input-params.config-priority');
						const configPriorityValue = _.isNumber(configPriority) ? configPriority : d.uiState['member-vnf-index'];
						utils.assignPathValue(constituentVNFD['vnf-configuration'], 'input-params.config-priority', configPriorityValue);
					} else {
						// remove any unused configuration options
						['netconf', 'rest', 'script', 'juju'].forEach(type => {
							if (configType !== type) {
								delete vnfConfig[type];
							}
						});
						constituentVNFD['vnf-configuration'] = vnfConfig;
					}
				}

				if (d.hasOwnProperty('start-by-default')) {
					constituentVNFD['start-by-default'] = d['start-by-default'];
				}

				return constituentVNFD;

			});
			for (var key in confd) {
				checkForChoiceAndRemove(key, confd, nsdModel);
			}
			// serialize the VLD instances
			confd.vld = confd.vld.map(d => {
				return DescriptorModelSerializer.serialize(d);
			});

			return cleanEmptyTopKeys(confd);

		}
	},
	vld: {
		serialize(vldModel) {
			if(!vldFields) vldFields = DescriptorModelMetaFactory.getModelFieldNamesForType('nsd.vld');
			const confd = _.pick(vldModel, vldFields);
			const property = 'vnfd-connection-point-ref';

			// TODO: There is a bug in RIFT-REST that is not accepting empty
			// strings for string properties.
			// once that is fixed, remove this piece of code.
			// fix-start
			for (var key in confd) {
			  	if (confd.hasOwnProperty(key) && confd[key] === '') {
                	delete confd[key];
                } else {
                	//removes choice properties from top level object and copies immediate children onto it.
					checkForChoiceAndRemove(key, confd, vldModel);
                }
			}


			const deepProperty = 'provider-network';
			for (var key in confd[deepProperty]) {
				if (confd[deepProperty].hasOwnProperty(key) && confd[deepProperty][key] === '') {
					delete confd[deepProperty][key];
				}
			}
			// fix-end
			confd[property] = confd[property].map(d => DescriptorModelSerializer[property].serialize(d));
			return cleanEmptyTopKeys(confd);
		}
	},
	'vnfd-connection-point-ref': {
		serialize(ref) {
			return _.pick(ref, ['member-vnf-index-ref', 'vnfd-id-ref', 'vnfd-connection-point-ref']);
		}
	},
	'internal-connection-point': {
		serialize(ref) {
			return _.pick(ref, ['id-ref']);
		}
	},
	'constituent-vnfd': {
		serialize(cvnfdModel) {
			if(!cvnfdFields) cvnfdFields = DescriptorModelMetaFactory.getModelFieldNamesForType('nsd.constituent-vnfd');
			return _.pick(cvnfdModel, cvnfdFields);
		}
	},
	vnfd: {
		serialize(vnfdModel) {
			if(!vnfdFields) vnfdFields = DescriptorModelMetaFactory.getModelFieldNamesForType('vnfd').concat('uiState');
			const confd = _.pick(vnfdModel, vnfdFields);
			confd.vdu = confd.vdu.map(d => DescriptorModelSerializer.serialize(d));
			return cleanEmptyTopKeys(confd);
		}
	},
	vdu: {
		serialize(vduModel) {
			const copy = _.cloneDeep(vduModel);
			for (let k in copy) {
				checkForChoiceAndRemove(k, copy, vduModel)
			}
			const confd = _.omit(copy, ['uiState']);
			return cleanEmptyTopKeys(confd);
		}
    },
    'config-parameter-map': {
        serialize(configParameterMap) {
            //vnfapMapFields
            if(!configParameterMapFields) configParameterMapFields = DescriptorModelMetaFactory.getModelFieldNamesForType('nsd.config-parameter-map');
            return _.pick(configParameterMap, configParameterMapFields);
        }
	}
};


function checkForChoiceAndRemove(k, confd, model) {
    let state = model.uiState;
    if (state.choice) {
        let choice = state.choice[k]
        if(choice) {
            if (choice.constructor.name == "Array") {
                for(let i = 0; i < choice.length; i++) {
                    for (let key in confd[k][i]) {
                        if(choice[i] && (choice[i].selected.indexOf(key) > -1)) {
                            confd[k][i][key] = confd[k][i][key]
                        }
                        confd[key];
                    };
                }
            } else {
                for (let key in confd[k]) {
                    if(choice && (choice.selected.indexOf(key) > -1)) {
                        confd[key] = confd[k][key]
                    }
                };
                delete confd[k];
            }

        }
    }
    return confd;
}

function cleanEmptyTopKeys(m){
    Object.keys(m).forEach(k => {
        const isEmptyObject = typeof m[k] === 'object' && _.isEmpty(m[k]);
        if (typeof m[k] === 'undefined' || isEmptyObject || m[k] === '') {
            delete m[k];
        }
    });
    return m;
}

export default DescriptorModelSerializer;
