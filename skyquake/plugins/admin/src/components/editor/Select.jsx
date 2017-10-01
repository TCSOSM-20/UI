/*
 *
 *   Copyright 2016-2017 RIFT.IO Inc
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

import React from 'react'
import ClassNames from 'classnames'
import changeCase from 'change-case'

// import '../../styles/EditDescriptorModelProperties.scss'

export default function Select(props) {
	const { id, label, value, options, title, required, readOnly, onChange } = props;
	const selectOptions = options.map((o, i) => <option key={':' + i} value={o.value}>{o.name}</option>);
	if (!value || !required) {
		let placeholder = props.placeholder || " ";
		placeholder = changeCase.title(placeholder);
		const noValueDisplayText = placeholder;
		selectOptions.unshift(<option key={'(value-not-set)'} value="" placeholder={placeholder}>{noValueDisplayText}</option>);
	}
	function onSelectChange(e) {
		e.preventDefault();
		onChange(e.target.value);
	}
	return (
		<select
			id={id}
			style={{minWidth: '100%', maxWidth: '100%'}}
			defaultValue={value}
			title={title}
			onChange={onSelectChange}
			required={required} 
			disabled={readOnly}>
			{selectOptions}
		</select>
	);
}
