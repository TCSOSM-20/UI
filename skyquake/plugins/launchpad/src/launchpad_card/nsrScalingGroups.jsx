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
import React from 'react';
import RecordViewStore from '../recordViewer/recordViewStore.js';
import SkyquakeComponent from 'widgets/skyquake_container/skyquakeComponent.jsx';
import Button from 'widgets/button/rw.button.js';
import Utils from 'utils/utils.js';
import UpTime from 'widgets/uptime/uptime.jsx';
import './nsrScalingGroups.scss';

class NsrScalingGroups extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	handleExecuteClick = (nsr_id, scaling_group_id, max_instance_count, event) => {
		let self = this;
		if (this.getInstancesForScalingGroup(scaling_group_id) == max_instance_count) {
			self.props.flux.actions.global.showNotification("Maximum allowed scaling instances created for this group. Cannot create any more");
			return;
		}
		RecordViewStore.createScalingGroupInstance({
			nsr_id: nsr_id,
			scaling_group_id: scaling_group_id
		});
	}

	handleDeleteClick = (nsr_id, scaling_group_id, scaling_instance_index, event) => {
		RecordViewStore.deleteScalingGroupInstance({
			nsr_id: nsr_id,
			scaling_group_id: scaling_group_id,
			scaling_instance_index: scaling_instance_index
		});
	}

	createScalingGroupTable = (scalingGroupDesriptorName) => {
		let trows = [];

		this.props.data['scaling-group-record'] && this.props.data['scaling-group-record'].map((sgr, sgri) => {

			sgr['instance'] ? sgr['instance'].map((sgrInstance, sgrInstanceIndex) => {
				let id = sgrInstance['instance-id'];
				let sgrName = sgr['scaling-group-name-ref'];

				if (sgrName == scalingGroupDesriptorName) {
					trows.push(
						<tr key={sgrInstanceIndex}>
							<td>{sgrInstanceIndex + 1}</td>
							<td>{id}</td>
							<td><UpTime initialTime={sgrInstance['create-time']} run={true} /></td>
							<td>{sgrInstance['op-status']}</td>
                                                        <td>{sgrInstance['config-status']}</td>
							<td>
								{sgrInstance['is-default'] == 'false' ? <a onClick={this.handleDeleteClick.bind(this, this.props.data.id, sgrName, id)} title="Delete">
				                	<span className="oi" data-glyph="trash" aria-hidden="true"></span>
				            	</a> : null}
							</td>
						</tr>
					);
				}
			}) : trows.push(
				<tr key={sgri}>
					<td colSpan="5" style={{textAlign: 'center'}}>No network services scaled in this group</td>
				</tr>
			);
		});

		let tbody = (
			<tbody>
		        {trows}
		    </tbody>
		);

		return (
			<table className="scalingGroupsInstancesTable">
			    <thead>
			        <tr>
			        	<th style={{width: '6%'}}></th>
			            <th style={{width: '12%'}}>ID</th>
			            <th style={{width: '24%'}}>Uptime</th>
			            <th style={{width: '25%'}}>Status</th>
                                    <th style={{width: '25%'}}>Config-Status</th>
			            <th style={{width: '7%'}}> </th>
			        </tr>
			    </thead>
			    {tbody}
			</table>
		);
	}

	getInstancesForScalingGroup = (scalingGroupDesriptorName) => {
		let count = 0;
		this.props.data['scaling-group-record'] && this.props.data['scaling-group-record'].map((sgr, sgri) => {
			sgr['instance'] && sgr['instance'].map((sgrInstance, sgrInstanceIndex) => {
				if (sgr['scaling-group-name-ref'] == scalingGroupDesriptorName) {
					count++;
				}
			});
		});

		return count;
	}

	render() {
		let scalingGroups = [];

		this.props.data['scaling-group-descriptor'] && this.props.data['scaling-group-descriptor'].map((sgd) => {
			let sgvnfs = [];
			let sgMaxCount = (
				<span>
					<span>Max: </span>
					<span>{sgd['max-instance-count']}</span>
				</span>
			);

			sgd['vnfd-member'] && sgd['vnfd-member'].map((vnf) => {
				let instanceCount = vnf['count'];
				sgvnfs.push(
					<span>{vnf['short-name']} {instanceCount > 1 ? '(' + instanceCount + ')': ''}</span>
				);
			});

			sgvnfs = Utils.arrayIntersperse(sgvnfs, ', ');

			let sgInstanceTable = this.createScalingGroupTable(sgd.name);

			let sgCreateInstanceButton = <Button label='Create Scaling Group Instance' className="dark" isDisabled={this.getInstancesForScalingGroup(sgd.name) == sgd["max-instance-count"]} isLoading={false} onClick={this.handleExecuteClick.bind(this, this.props.data.id, sgd.name, sgd['max-instance-count'])} />

			let scalingGroup =
				<div>
					<div className='launchpadCard_title' style={{textAlign:'right'}}><span style={{float:'left'}}>{sgd.name}</span></div>
					<div className='vnfsList'><span className='vnfsLabel'>VNFS: </span><span>{sgvnfs}</span></div>
					<div className='scalingGroupsInstancesTableWrapper'>
						{sgInstanceTable}
					</div>
					{sgCreateInstanceButton} {sgMaxCount}
				</div>

			scalingGroups.push(scalingGroup);
		});

		return (
			<div className='nsScalingGroups'>
                <div className=''>
                	{scalingGroups}
                </div>
            </div>
		);
	}

}

export default SkyquakeComponent(NsrScalingGroups);
