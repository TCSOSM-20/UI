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
 * Created by onvelocity on 1/18/16.
 *
 * This class generates the form fields used to edit the CONFD JSON model.
 */
'use strict';

import _ from 'lodash'
import utils from '../libraries/utils'
import React from 'react'
import ClassNames from 'classnames'
import changeCase from 'change-case'
import toggle from '../libraries/ToggleElementHandler'
import Button from './Button'
import Property from '../libraries/model/DescriptorModelMetaProperty'
import ComposerAppActions from '../actions/ComposerAppActions'
import CatalogItemsActions from '../actions/CatalogItemsActions'
import DESCRIPTOR_MODEL_FIELDS from '../libraries/model/DescriptorModelFields'
import DescriptorModelFactory from '../libraries/model/DescriptorModelFactory'
import DescriptorModelMetaFactory from '../libraries/model/DescriptorModelMetaFactory'
import SelectionManager from '../libraries/SelectionManager'
import DeletionManager from '../libraries/DeletionManager'
import DescriptorModelIconFactory from '../libraries/model/IconFactory'
import getEventPath from '../libraries/getEventPath'
import CatalogDataStore from '../stores/CatalogDataStore'

import imgAdd from '../../../node_modules/open-iconic/svg/plus.svg'
import imgRemove from '../../../node_modules/open-iconic/svg/trash.svg'

import '../styles/EditDescriptorModelProperties.scss'
import '../styles/EditConfigParameterMap.scss';


function getDescriptorMetaBasicForType(type) {
	const basicPropertiesFilter = d => _.includes(DESCRIPTOR_MODEL_FIELDS[type], d.name);
	return DescriptorModelMetaFactory.getModelMetaForType(type, basicPropertiesFilter) || {properties: []};
}

function getDescriptorMetaAdvancedForType(type) {
	const advPropertiesFilter = d => !_.includes(DESCRIPTOR_MODEL_FIELDS[type], d.name);
	return DescriptorModelMetaFactory.getModelMetaForType(type, advPropertiesFilter) || {properties: []};
}

function getTitle(model = {}) {
	if (typeof model['short-name'] === 'string' && model['short-name']) {
		return model['short-name'];
	}
	if (typeof model.name === 'string' && model.name) {
		return model.name;
	}
	if (model.uiState && typeof model.uiState.displayName === 'string' && model.uiState.displayName) {
		return model.uiState.displayName
	}
	if (typeof model.id === 'string') {
		return model.id;
	}
}
function startEditing() {
		DeletionManager.removeEventListeners();
	}

	function endEditing() {
		DeletionManager.addEventListeners();
	}

	function onClickSelectItem(property, path, value, event) {
		event.preventDefault();
		const root = this.getRoot();
		if (SelectionManager.select(value)) {
			CatalogItemsActions.catalogItemMetaDataChanged(root.model);
		}
	}

	function onFocusPropertyFormInputElement(property, path, value, event) {

		event.preventDefault();
		startEditing();

		function removeIsFocusedClass(event) {
			event.target.removeEventListener('blur', removeIsFocusedClass);
			Array.from(document.querySelectorAll('.-is-focused')).forEach(d => d.classList.remove('-is-focused'));
		}

		removeIsFocusedClass(event);

		const propertyWrapper = getEventPath(event).reduce((parent, element) => {
			if (parent) {
				return parent;
			}
			if (!element.classList) {
				return false;
			}
			if (element.classList.contains('property')) {
				return element;
			}
		}, false);

		if (propertyWrapper) {
			propertyWrapper.classList.add('-is-focused');
			event.target.addEventListener('blur', removeIsFocusedClass);
		}

	}

	function buildAddPropertyAction(container, property, path) {
		function onClickAddProperty(property, path, event) {
			event.preventDefault();
			//SelectionManager.resume();
			const create = Property.getContainerCreateMethod(property, this);
			if (create) {
				const model = null;
				create(model, path, property);
			} else {
				const name = path.join('.');
				const value = Property.createModelInstance(property);
				utils.assignPathValue(this.model, name, value);
			}
			CatalogItemsActions.catalogItemDescriptorChanged(this.getRoot());
		}
		return (
				<Button className="inline-hint" onClick={onClickAddProperty.bind(container, property, path)} label="Add" src={imgAdd} />
		);
	}

	function buildRemovePropertyAction(container, property, path) {
		function onClickRemoveProperty(property, path, event) {
			event.preventDefault();
			const name = path.join('.');
			const removeMethod = Property.getContainerMethod(property, this, 'remove');
			if (removeMethod) {
				removeMethod(utils.resolvePath(this.model, name));
			} else {
				utils.removePathValue(this.model, name);
			}
			CatalogItemsActions.catalogItemDescriptorChanged(this.getRoot());
		}
		return (
			<Button className="remove-property-action inline-hint" title="Remove" onClick={onClickRemoveProperty.bind(container, property, path)} label="Remove" src={imgRemove}/>
		);
	}

	function onFormFieldValueChanged(event) {
		if (DescriptorModelFactory.isContainer(this)) {
			event.preventDefault();
			const name = event.target.name;
			const value = JSON.parse(event.target.value);
			utils.assignPathValue(this.model, 'config-parameter-source.config-parameter-source-ref', value.value);
			utils.assignPathValue(this.model, 'config-parameter-source.member-vnf-index-ref', value.index);
			CatalogItemsActions.catalogItemDescriptorChanged(this.getRoot());
		}
	}

	function buildField(container, property, path, value, fieldKey, vnfdIndex) {
		let cds = CatalogDataStore;
		let catalogs = cds.getTransientCatalogs();

		const name = path.join('.');
		const isEditable = true;
		const isGuid = Property.isGuid(property);
		const onChange = onFormFieldValueChanged.bind(container);
		const isEnumeration = Property.isEnumeration(property);
		const isLeafRef = Property.isLeafRef(property);
		const onFocus = onFocusPropertyFormInputElement.bind(container, property, path, value);
		const placeholder = changeCase.title(property.name);
		const className = ClassNames(property.name + '-input', {'-is-guid': isGuid});
		const fieldValue = value ? (value.constructor.name != "Object") ? value : '' : undefined;
		// if (isEnumeration) {
		// 	const enumeration = Property.getEnumeration(property, value);
		// 	const options = enumeration.map((d, i) => {
		// 		// note yangforge generates values for enums but the system does not use them
		// 		// so we categorically ignore them
		// 		// https://trello.com/c/uzEwVx6W/230-bug-enum-should-not-use-index-only-name
		// 		//return <option key={fieldKey + ':' + i} value={d.value}>{d.name}</option>;
		// 		return <option key={fieldKey.toString() + ':' + i} value={d.name}>{d.name}</option>;
		// 	});
		// 	const isValueSet = enumeration.filter(d => d.isSelected).length > 0;
		// 	if (!isValueSet || property.cardinality === '0..1') {
		// 		const noValueDisplayText = changeCase.title(property.name);
		// 		options.unshift(<option key={'(value-not-in-enum)' + fieldKey.toString()} value="" placeholder={placeholder}>{noValueDisplayText}</option>);
		// 	}
		// 	return <select key={fieldKey.toString()} id={fieldKey.toString()} className={ClassNames({'-value-not-set': !isValueSet})} name={name} value={value} title={name} onChange={onChange} onFocus={onFocus} onBlur={endEditing} onMouseDown={startEditing} onMouseOver={startEditing} readOnly={!isEditable}>{options}</select>;
		// }

		if (isLeafRef && (path.indexOf("config-parameter-source-ref") > -1)) {
			let fullFieldKey = _.isArray(fieldKey) ? fieldKey.join(':') : fieldKey;
			let containerRef = container;
			let vnfdName = null;
			let options = [];
			let leafRefPathValues = [];
			while (containerRef.parent) {
				fullFieldKey = containerRef.parent.key + ':' + fullFieldKey;
				containerRef = containerRef.parent;
			}
			let parentProperty = container.parent.constituentVnfd;
			parentProperty.map((v, i) => {
				let somevalues = Property.getConfigParamRef(property, path, value, fullFieldKey, catalogs, container, v.vnfdId);
				options = somevalues && options.concat(somevalues.map((d, i) => {
						return <option key={v.vnfdId + ':' + fieldKey.toString() + ':' + i} value={JSON.stringify({value: d.value, index: v.vnfdIndex})}>{`${v['short-name']} (${v.vnfdIndex}) / ${d.value}`}</option>;
					}))
				leafRefPathValues = leafRefPathValues.concat(somevalues);

			});

			const isValueSet = leafRefPathValues.filter(d => d.isSelected).length > 0;
			if (!isValueSet) {
				const noValueDisplayText = changeCase.title(property.name);
				options.unshift(<option key={'(value-not-in-leafref)' + fieldKey.toString()} value="" placeholder={placeholder}>{noValueDisplayText}</option>);
			}
			return <select key={fieldKey.toString()} id={fieldKey.toString()} className={ClassNames({'-value-not-set': !isValueSet})} name={name} value={JSON.stringify({value:value, index: container.model['config-parameter-source']['member-vnf-index-ref']})} title={name} onChange={onChange} onFocus={onFocus} onBlur={endEditing} onMouseDown={startEditing} onMouseOver={startEditing} readOnly={!isEditable}>{options}</select>;
		}
	}

	function buildElement(container, property, valuePath, value, vnfdIndex) {
		return property.properties.map((property, index) => {
			let childValue;
			const childPath = valuePath.slice();
			if (typeof value === 'object') {
				childValue = value[property.name];
			}
			if(property.type != 'choice'){
						childPath.push(property.name);
			}
			return build(container, property, childPath, childValue, {}, vnfdIndex);

		});
	}


	function buildSimpleListItem(container, property, path, value, key, index) {
		// todo need to abstract this better
		const title = getTitle(value);
		var req = require.context("../", true, /\.svg/);
		return (
			<div>
				<a href="#select-list-item" key={Date.now()} className={property.name + '-list-item simple-list-item '} onClick={onClickSelectItem.bind(container, property, path, value)}>
					<img src={req('./' + DescriptorModelIconFactory.getUrlForType(property.name))} width="20px" />
					<span>{title}</span>
				</a>
				{buildRemovePropertyAction(container, property, path)}
			</div>
		);
	}

	function buildRemoveListItem(container, property, valuePath, fieldKey, index) {
		const className = ClassNames(property.name + '-remove actions');
		return (
			<div key={fieldKey.concat(index).join(':')} className={className}>
				<h3>
					<span className={property.type + '-name name'}>{changeCase.title(property.name)}</span>
					<span className="info">{index + 1}</span>
					{buildRemovePropertyAction(container, property, valuePath)}
				</h3>
			</div>
		);
	}

	function buildLeafListItem(container, property, valuePath, value, key, index, vnfdIndex) {
		// look at the type to determine how to parse the value
		return (
			<div>
				{buildRemoveListItem(container, property, valuePath, key, index)}
				{buildField(container, property, valuePath, value, key, vnfdIndex)}
			</div>

		);
	}

	function build(container, property, path, value, props = {}, vnfdIndex) {
		const fields = [];
		const isLeaf = Property.isLeaf(property);
		const isArray = Property.isArray(property);
		const isObject = Property.isObject(property);
		const isLeafList = Property.isLeafList(property);
		const fieldKey = [container.id].concat(path);
		const isRequired = Property.isRequired(property);
		const title = changeCase.titleCase(property.name);
		const columnCount = property.properties.length || 1;
		const isColumnar = isArray && (Math.round(props.width / columnCount) > 155);
		const classNames = {'-is-required': isRequired, '-is-columnar': isColumnar};

		if (!property.properties && isObject) {
			const uiState = DescriptorModelMetaFactory.getModelMetaForType(property.name) || {};
			property.properties = uiState.properties;
		}

		const hasProperties = _.isArray(property.properties) && property.properties.length;
		const isMissingDescriptorMeta = !hasProperties && !Property.isLeaf(property);

		// ensure value is not undefined for non-leaf property types
		if (isObject) {
			if (typeof value !== 'object') {
				value = isArray ? [] : {};
			}
		}
		const valueAsArray = _.isArray(value) ? value : isLeafList && typeof value === 'undefined' ? [] : [value];

		const isMetaField = property.name === 'meta';
		const isCVNFD = property.name === 'constituent-vnfd';
		const isSimpleListView = Property.isSimpleList(property);

		valueAsArray.forEach((value, index) => {

			let field;
			const key = fieldKey.slice();
			const valuePath = path.slice();

			if (isArray) {
				valuePath.push(index);
				key.push(index);
			}

			if (isMetaField) {
				if (typeof value === 'object') {
					value = JSON.stringify(value, undefined, 12);
				} else if (typeof value !== 'string') {
					value = '{}';
				}
			}

			if (isMissingDescriptorMeta) {
				field = <span key={key.concat('warning').join(':')} className="warning">No Descriptor Meta for {property.name}</span>;
			} else if (property.type === 'choice') {
                field = buildChoice(container, property, valuePath, value, key.join(':'), props);
			} else if (isSimpleListView) {
                field = buildSimpleListItem(container, property, valuePath, value, key, index, props);
			} else if (isLeafList) {
                field = buildLeafListItem(container, property, valuePath, value, key, index, vnfdIndex);
			} else if (hasProperties) {
                field = buildElement(container, property, valuePath, value, vnfdIndex)
			} else {
                field = buildField(container, property, valuePath, value, key.join(':'), vnfdIndex);
			}

			function onClickLeaf(property, path, value, event) {
				if (event.isDefaultPrevented()) {
					return;
				}
				event.preventDefault();
				event.stopPropagation();
				this.getRoot().uiState.focusedPropertyPath = path.join('.');
				console.log('property selected', path.join('.'));
				ComposerAppActions.propertySelected([path.join('.')]);
			}

			const clickHandler = isLeaf ? onClickLeaf : () => {};
			const isContainerList = isArray && !(isSimpleListView || isLeafList);
			if(valuePath.indexOf("member-vnf-index-ref") == -1) {
				fields.push(
					<div key={fieldKey.concat(['property-content', index]).join(':')}
						 className={ClassNames('property-content', {'simple-list': isSimpleListView})}
						 onClick={clickHandler.bind(container, property, valuePath, value)}>
						{isContainerList ? buildRemoveListItem(container, property, valuePath, fieldKey, index) : null}
						{field}
					</div>
				);
			}
		});

		classNames['-is-leaf'] = isLeaf;
		classNames['-is-array'] = isArray;
		classNames['cols-' + columnCount] = isColumnar;

		if (property.type === 'choice') {
			value = utils.resolvePath(container.model, ['uiState.choice'].concat(path, 'selected').join('.'));
			if(!value) {
				property.properties.map(function(p) {
					let pname = p.properties[0].name;
					if(container.model.hasOwnProperty(pname)) {
						value = container.model[pname];
					}
				})
			}
		}

		let displayValue = typeof value === 'object' ? '' : value;
		const displayValueInfo = isArray ? valueAsArray.filter(d => typeof d !== 'undefined').length + ' items' : '';

		const onFocus = isLeaf ? event => event.target.classList.add('-is-focused') : false;

		//Remove first entry, which is member-vnf-index because I'm tired of trying to figure out how it's being added and feel pressed for time. Come back here if there's ever time and fix correctly.
		if (fieldKey.indexOf('member-vnf-index-ref') == -1) {
				return (
					<div key={fieldKey.join(':')}  onFocus={onFocus}>
						{fields}
					</div>
				);
		}
	}
export default function EditDescriptorModelProperties(props, type) {

    const container = props.container;

    if (!(DescriptorModelFactory.isContainer(container))) {
        return
    }



    const containerType = (_.isEmpty(type) ? false : type)|| container.uiState['qualified-type'] || container.uiState.type;
	const basicProperties = getDescriptorMetaBasicForType(containerType).properties;


	function buildAdvancedGroup() {
		const properties = getDescriptorMetaAdvancedForType(containerType).properties;
		if (properties.length === 0) {
			return null;
		}
		const hasBasicFields = basicProperties.length > 0;
		const closeGroup = basicProperties.length > 0;
		return (
			<div className="config-parameter-map">
					<div className="config-parameter">
						Request
					</div>
					<div className="config-parameter">
						Source
					</div>
					{properties.map((property,i) => {
						const path = [property.name];
						const value = container.model[property.name];
						if(path == 'id') {
							return null
						}
						if(path == 'config-parameter-request') {
							let cds = CatalogDataStore;
							let catalogs = cds.getTransientCatalogs();
							let vnfdIndexRef = container.model[path]['member-vnf-index-ref'];
							let vnfdIdRef = container.parent.model['constituent-vnfd'].filter(function(v){return v['member-vnf-index'] == vnfdIndexRef})[0]['vnfd-id-ref'];
							let vnfd = catalogs[1].descriptors.filter((v) => v.id == vnfdIdRef)[0];
							let primitiveName = vnfd['config-parameter']['config-parameter-request'].filter((p) => p.name == value['config-parameter-request-ref'] )[0].parameter[0]['config-primitive-name-ref'];
							return (
								<div className="config-parameter config-parameter-request" key={path + '-' + i}>
									{`${vnfd['short-name']}(${vnfdIndexRef}) / ${primitiveName} / ${value['config-parameter-request-ref']}`}
								</div>
							)
						} else if(path == 'config-parameter-source') {
							//Builds Source
							return <div className="config-parameter config-parameter-source"> {build(container, property, path, value, _.assign({toggle: true, width: props.width}, props), value['member-vnf-index-ref'])} </div>
						}

					})}
				<div className="toggle-bottom-spacer" style={{visibility: 'hidden', 'height': '50%', position: 'absolute'}}>We need this so when the user closes the panel it won't shift away and scare the bj out of them!</div>
			</div>
		);
	}

	function buildMoreLess(d, i) {
		return (
			<span key={'bread-crumb-part-' + i}>
				<a href="#select-item" onClick={onClickSelectItem.bind(d, null, null, d)}>{d.title}</a>
				<i> / </i>
			</span>
		);
	}

	const path = [];
	if (container.parent) {
		path.push(container.parent);
	}
	path.push(container);

	return (
		<div className="EditDescriptorModelProperties -is-tree-view">
			{buildAdvancedGroup()}
		</div>
	);

}
export {build}
// export buildElement;
// export buildChoice;
