
import React from 'react';
import { Link } from 'react-router';

import DashboardCard from 'widgets/dashboard_card/dashboard_card.jsx';
import LaunchpadFleetActions from'../launchpadFleetActions';
import LaunchpadFleetStore from '../launchpadFleetStore';
import UpTime from 'widgets/uptime/uptime.jsx';
import {SkyquakeRBAC, isRBACValid} from 'widgets/skyquake_rbac/skyquakeRBAC.jsx';
import ROLES from 'utils/roleConstants.js';
const PROJECT_ROLES = ROLES.PROJECT;
/*
 * TODO: Handle when page is loading. See recordView for ref
 */


/*
 * key -  NSR property name
 * label - Text to display for the header column label
 * colClass - class to add for rendering this column
 * transform: function to call to display the value for the property
 */
const FIELD_KEYS = [
    {
        // was using 'short-name'
        key: 'name',
        label: 'NS Name',
        colClass: 'nsColNsName',
        transform: function(nsr, key) {
            let val = nsr[key];
            let title = '"' + val + '" Click to open the viewport dashboard.';
            let sdnpresent = nsr['sdn-account'] ? true: false;
            return (
                <Link className="nsViewportLink"
                    to={{pathname: '/viewport', query: {id: nsr.id,
                        sdnpresent: sdnpresent}}}
                    title={title}>
                    {val}
                </Link>
            )
        }
    },
    {
        key: 'nsd_name',
        label: 'nsd',
        colClass: 'nsColNsdName',
        transform: function(nsr, key) {
            let val=nsr[key];
            return (
                <span title={val}>{val}</span>
            );
        }
    },
    {
        key: 'operational-status',
        label: 'Status',
        colClass: 'nsColStatus',
        transform: function(nsr, key, isLoading) {
            let val = null;
            if(isLoading) {
                if (nsr['operational-status'] == 'running') {
                    if(nsr['config-status'] == 'configuring') {
                        val = 'Configuring'
                    } else {
                        val = 'Configuration Failed'
                    }
                } else {
                    val = nsr['operational-status'];
                }
            } else {
                val = 'Active'
            }
            return (
                <span title={val} style={{'textTransform': 'capitalize'}}>{val}</span>);
        }
    },
    {
        key: 'create-time',
        label: 'Uptime',
        colClass: 'nsColUptime',
        transform: function(nsr, key) {
            let val = nsr[key];
            return (<UpTime initialTime={val} run={true} />);
        }
    }
];

/*
 * Render the network service grid header row
 */
class NsListHeader extends React.Component {

    render() {
        const {fieldKeys, ...props} = this.props;
        return (
            <div className="nsListHeaderRow">
                {fieldKeys.map( (field, index) =>
                    <div className={"nsListHeaderField " + field.colClass}
                        key={index} >
                        {field.label}
                    </div>
                )}
                <div className="nsListHeaderField nsColAction"></div>
            </div>
        );
    }
}

/*
 * Render a row for the network service
 */
class NsListItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.state.isLoading = this.isLoading(props)
        this.state.failed = false;
    }

    renderFieldBody(nsr, field, isLoading) {
        return field.transform(nsr, field.key, isLoading);
    }

    columnStyle(field) {
        return {
            'width': field.width
        }
    }

    classNames(isCardOpen) {
        return "nsListItemRow" + (isCardOpen ? " openedCard" : "");
    }


    openDashboard(nsr_id) {
        window.location.href = '//' + window.location.hostname +
            ':' + window.location.port + '/index.html' +
            window.location.search +
            window.location.hash + '/' + nsr_id + '/detail';
        launchpadFleetStore.closeSocket();
    }

    componentWillReceiveProps(props) {
        this.setState({
            isLoading:  this.isLoading(props)
        })
    }
    isLoading(props) {
        return !((props.nsr['operational-status'] == 'running') && (props.nsr['config-status'] == 'configured'))
    }
    actionButton(glyphValue, title, onClick) {
        return (
           <div className="actionButton"  onClick={onClick}>
            <span className="oi" data-glyph={glyphValue}
            title={title} aria-hidden="true"></span>
           </div>
        );
    }

    render() {
        let failed = this.state.failed;
        let isLoading =  this.state.isLoading || failed;
        const {nsr, isCardOpen, fieldKeys, ...props} = this.props;
        const self = this;
        return (
            <div className={this.classNames(isCardOpen)} data-id={nsr.id}>
                {fieldKeys.map( (field, index) =>
                    <div className={"nsListItemField " + field.colClass}
                        key={index} >
                        <div className="cellValue">
                        {self.renderFieldBody(nsr, field, isLoading)}
                        </div>
                    </div>
                )}
                <div className="nsListItemField nsColAction">
                    <div className="cellValue">
                    {
                        (isCardOpen)
                            ? this.actionButton("circle-x",
                                "Close network service card",
                                function() {
                                    LaunchpadFleetActions.closeNsrCard(nsr.id);
                                })
                            : this.actionButton("arrow-circle-right",
                                "Open network service card",
                                function() {
                                    LaunchpadFleetActions.openNsrCard(nsr.id);
                                })
                    }
                    </div>
                </div>
            </div>
        );
    }
}

/*
 * Used for development/debugging layout
 */
class EmptyNsListItem extends React.Component {
    render() {
        const {fieldKeys, ...props} = this.props;
        return (
            <div className={"nsListItemRow"} >
                {fieldKeys.map( (field, index) =>
                    <div className={"nsListItemField " + field.colClass}
                        key={index} >
                    </div>
                )}
                <div className="nsListItemField nsColAction">
                </div>
            </div>
        );
    }
}

/*
 * Used for development/debugging layout
 */
class MockNsListItem extends React.Component {

    simNsr() {
        return {
            name: 'Grue',
            nsd_name: 'Dungeon X',
            'operational-status': 'Hunting',
            'create-time': 1163507750
        };
    }
    render() {
        const {fieldKeys, mockNsr, isCardOpen, ...props} = this.props;
        let nsr = mockNsr;
        if (!nsr) {
            nsr = this.simNsr();
        }
        return (<NsListItem nsr={nsr}
            fieldKeys={fieldKeys}
            isCardOpen={isCardOpen}
            />
        );
    }
}
MockNsListItem.defaultProps = {
    isCardOpen: false
}


class NsList extends React.Component {

    emptyRows(count) {
        let emptyRows = [];
        for (var i=0; i < count; i++) {
            emptyRows.push(
                <EmptyNsListItem key={ "empty_"+i}
                    fieldKeys={this.props.fieldKeys} />
                );
        }
        return emptyRows;
    }

    mockNsRows(count) {
        let mockNsRows = [];
        let isCardOpen = false;
        for (var i=0; i < count; i++) {
            isCardOpen = !isCardOpen;
            mockNsRows.push(
                <MockNsListItem key={ "empty_"+i}
                    fieldKeys={this.props.fieldKeys} isCardOpen={isCardOpen} />
                );
        }
        return mockNsRows;
    }

    render() {
        const {nsrs, openedNsrIDs, fieldKeys, ...props} = this.props;
        return (
            <div className="nsList">
                <NsListHeader fieldKeys={fieldKeys} />
                <div className="nsList-body">
                    <div className="nsList-body_content">
                        {nsrs.map((nsr, index) =>
                            <NsListItem key={nsr.id} nsr={nsr}
                                fieldKeys={fieldKeys}
                                isCardOpen={openedNsrIDs.includes(nsr.id)} />
                        )}
                        {this.mockNsRows(this.props.mockNsRows)}
                        {this.emptyRows(this.props.emptyRows)}
                    </div>
                </div>
            </div>
        );
    }
}

NsList.defaultProps = {
    mockNsRows: 0,
    emptyRows: 0
}


export default class NsListPanel extends React.Component {

    handleInstantiateNetworkService = () => {
        this.context.router.push({pathname:'instantiate'});
    }
    handleShowHideToggle(newState) {
        return function() {
            LaunchpadFleetActions.setNsListPanelVisible(newState);
        }
    }
    panelToolbar() {
        let plusButton = require("style/img/launchpad-add-fleet-icon.png");

        return (
            <div className="nsListPanelToolbar">

                <div className="button"
                    onClick={this.handleInstantiateNetworkService} >
                    <img src={plusButton}/>
                    <span>Instantiate Service</span>
                </div>
            </div>
        );
    }

    render() {
        const {nsrs, openedNsrIDs, emptyRows, isVisible, ...props} = this.props;
        const fieldKeys = FIELD_KEYS;
        let glyphValue = (isVisible) ? "chevron-left" : "chevron-right";

        let totalNSRs = nsrs && nsrs.length;
        let runningNSRs = 0;
        let failedNSRs = 0;
        let scalingOutNSRs = 0;
        let scalingInNSRs = 0;
        let initializingNSRs = 0;

        nsrs && nsrs.map((nsr) => {
            nsr['operational-status'] == 'running' && runningNSRs++;
            nsr['operational-status'] == 'failed' && failedNSRs++;
            nsr['operational-status'] == 'scaling-out' && scalingOutNSRs++;
            nsr['operational-status'] == 'scaling-in' && scalingInNSRs++;
            (
                nsr['operational-status'] == 'init' ||
                nsr['operational-status'] == 'vl-init-phase' ||
                nsr['operational-status'] == 'vnf-init-phase'
            ) && initializingNSRs++;
        });


        if (isVisible) {

            let title = (
                <div>
                    NETWORK SERVICES
                    <div className='nsrSummary'>
                        <span className='nsrSummaryItem'>Total: {totalNSRs}</span>
                        <span className='nsrSummaryItem'>Running: {runningNSRs}</span>
                        <span className='nsrSummaryItem'>Failed: {failedNSRs}</span>
                        <span className='nsrSummaryItem'>Scaling Out: {scalingOutNSRs}</span>
                        <span className='nsrSummaryItem'>Scaling In: {scalingInNSRs}</span>
                        <span className='nsrSummaryItem'>Initializing: {initializingNSRs}</span>
                    </div>
                </div>
            );


            return (
                <DashboardCard className="nsListPanel" showHeader={true}
                    title={title}>
                    {isRBACValid(this.context.userProfile, [PROJECT_ROLES.LCM_ADMIN, PROJECT_ROLES.PROJECT_ADMIN]) ? this.panelToolbar() : null}
                    <a onClick={this.handleShowHideToggle(!isVisible)}
                        className={"nsListPanelToggle"}>
                        <span className="oi"
                            data-glyph={glyphValue}
                            title="Toggle Details Panel"
                            aria-hidden="true"></span></a>
                    <NsList nsrs={nsrs} openedNsrIDs={openedNsrIDs}
                        fieldKeys={fieldKeys} emptyRows={emptyRows} />
                </DashboardCard>


            );
        } else {
            return (
                <DashboardCard className="leftMinimizedNsListPanel" showHeader={true}
                            title="|">
                <a onClick={this.handleShowHideToggle(!isVisible)}
                        className={"nsListPanelToggle"}>
                        <span className="oi"
                            data-glyph={glyphValue}
                            title="Toggle Details Panel"
                            aria-hidden="true"></span></a>
                </DashboardCard>
            );
        }
    }
}
NsListPanel.contextTypes = {
    router: React.PropTypes.object,
    userProfile: React.PropTypes.object
};
NsListPanel.defaultProps = {
    isVisible: true
}
