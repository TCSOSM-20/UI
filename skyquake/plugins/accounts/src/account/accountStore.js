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
import AccountActions from './accountActions.js';
import AccountSource from './accountSource.js';

var Utils = require('utils/utils.js');
var rw = require('utils/rw.js');
var altImage = rw.getSearchParams(window.location).alt_image;
var _ = require('lodash');

let Params = {
    //Config Agent
    ConfigAgent: {

    }
}


let AccountMeta = {
    'resource-orchestrator': {
        defaultType: 'openmano',
        types: [
        {
            name: "OpenMANO",
            'ro-account-type': 'openmano'
        }],
        params: {
            'openmano' : [{
                label: "Host",
                ref: 'host'
            }, {
                label: "Port",
                ref: 'port'
            }, {
                label: "Tenant ID",
                ref: 'tenant-id'
            }]
        }
    },
    'config-agent': {

        defaultType: 'juju',
        params: {
            "juju": [{
                label: "IP Address",
                ref: 'ip-address'
                }, {
                    label: "Port",
                    ref: 'port',
                    optional: true
                }, {
                    label: "Username",
                    ref: 'user',
                    optional: true
                }, {
                    label: "Secret",
                    ref: 'secret',
                    optional: true
            }]
        },
        types: [{
            "name": "JUJU",
            "account-type": "juju",
        }]
    },
    'sdn': {
        defaultType: 'odl',
        params: {
            "odl": [{
                label: "Username",
                ref: 'username'
            }, {
                label: "Password",
                ref: 'password'
            }, {
                label: "URL",
                ref: 'url'
            }],

            "openstack": [{
                label: "Key",
                ref: 'key'
            },{
                label: "Secret",
                ref: 'secret'
            },{
                label: "Authentication URL",
                ref: 'auth_url'
            },{
                label: "Tenant",
                ref: 'tenant'
            },{
                label: "User domain",
                ref: 'user-domain',
                optional: true
            },{
                label: "Project domain",
                ref: 'project-domain',
                optional: true
            },{
                label: "Region",
                ref: 'region',
                optional: true
            }
            // ,{
            //     label: "admin",
            //     ref: 'admin',
            //     default: false,
            //     optional: true
            // }
            // ,{
            //    label: "Management Network",
            //    ref: 'mgmt-network'
            // }
            // ,{
            //     label: "Plugin Name",
            //     ref: 'plugin-name',
            //     optional: true
            // },{
            //     label: "Security Groups",
            //     ref: 'security-groups',
            //     type: 'list',
            //     optional: true
            // },{
            //     label: "Dynamic Flavor Support ",
            //     ref: 'dynamic-flavor-support',
            //     type: 'boolean',
            //     optional: true
            // }
            //, {
            //    label: "Floating IP Pool",
            //    ref: 'floating-ip-pool',
            //    optional: true
            // }
            // ,{
            //     label: "Certificate Validation",
            //     ref: 'cert-validate',
            //     type: 'boolean',
            //     optional: true
            // }
            ]

        },
        types: [{
            "name": "ODL",
            "account-type": "odl",
        },{
            "name": "OpenStack",
            "account-type": "openstack",
        }]
    },
    'cloud': {
        defaultType: 'openstack',
        params: {
            "aws": [{
                label: "Key",
                ref: 'key'
            }, {
                label: "Secret",
                ref: 'secret'
            }, {
              label: "Availability Zone",
              ref: 'availability-zone'
            }, {
              label: "Default Subnet ID",
              ref: 'default-subnet-id'
            }, {
              label: "Region",
              ref: 'region'
            }, {
              label: "VPC ID",
              ref: 'vpcid'
            }, {
              label: "SSH Key",
              ref: 'ssh-key'
            }],
            "cloudsim_proxy": [{
                label: "Host",
                ref: "host"
            }],
            "openstack": [{
                label: "Key",
                ref: 'key'
            }, {
                label: "Secret",
                ref: 'secret'
            }, {
                label: "Authentication URL",
                ref: 'auth_url'
            }, {
                label: "Tenant",
                ref: 'tenant'
            }, {
                label: 'Default Management Network',
                ref: 'mgmt-network',
                optional: true
            }, {
                label: 'Default Floating IP Pool Network Name',
                ref: 'floating-ip-pool',
                optional: true
            }, {
                label: "User Domain",
                ref: 'user-domain',
                optional: true
            }, {
                label: "Project Domain",
                ref: 'project-domain',
                optional: true
            }, {
              label: "Region",
              ref: 'region',
              optional: true
            }],
            "openvim": [{
                label: "Host",
                ref: 'host'
            }, {
                label: "Tenant Name",
                ref: 'tenant-name'
            }, {
                label: 'Management Network',
                ref: 'mgmt-network'
            }, {
                label: "Port",
                ref: 'port',
                optional: true
            }],
            "prop_cloud1": [{
                label: "Host",
                ref: "host"
            }, {
                label: "Username",
                ref: "username"
            }, {
                label: "Password",
                ref: "password"
            }, {
                label: "Management Network",
                ref: "mgmt-network"
            }, {
                label: "Public IP pool",
                ref: "public-ip-pool"
            }, {
                label: "WAN Interface",
                ref: "wan-interface"
            }, {
                label: "Firewall",
                ref: "firewall",
                optional: true
             }]
        },
        nestedParams: {
            "openvim": {
                "container-name": "image-management",
                "label": "Image Management",
                "params": [{
                    label: "Username",
                    ref: 'username'
                }, {
                    label: "Password",
                    ref: 'password'
                }, {
                    label: 'Image Directory Path',
                    ref: 'image-directory-path',
                    optional: true
                }]
            }
        },
        types: [{
            "name": "OpenStack",
            "account-type": "openstack"
        }, {
            "name": "Cloudsim",
            "account-type": "cloudsim_proxy"
        }, {
            "name": "AWS",
            "account-type": "aws"
        }, {
            "name": "Open VIM",
            "account-type": "openvim"
        }, {
            "name": "Brocade",
            "account-type": "prop_cloud1"
         }]
    },
    resources: {
    },
    image: {
        "aws": require("../../images/aws.png"),
        "openvim": require("../../images/openmano.png"),
        "openstack": require("../../images/openstack.png"),
        "cloudsim_proxy": require("../../images/riftio.png"),
        "odl": require("../../images/OpenDaylight_logo.png"),
        "juju": require("../../images/juju.svg"),
        "prop_cloud1": require("../../images/brocade.png"),
        "openmano": require("../../images/openmano.png")

    },
    labelByType: {
        "aws": "AWS",
        "openvim": "Open VIM",
        "openstack": "OpenStack",
        "cloudsim_proxy": "Cloudsim",
        "prop_cloud1": "Brocade",
        "openmano": "OpenStack"
    }
}

export default class AccountStore {
    constructor() {
        // const savedData = JSON.parse(window.sessionStorage.getItem('account'));
        const savedData = null;
        this.saveAccountToSessionStorage(null, true)
        this.cloud = [];
        this['config-agent'] = [];
        this['resource-orchestrator'] = [];
        this.sdn = [];
        this.savedData = savedData;
        this.account = null;
        // this.account = savedData.account;
        // this.accountType = savedData.accountType;
        this.types = this.accountType ? AccountMeta[this.accountType].types : [];
        this.refreshingAll = false;
        this.sdnOptions = [];
        this.AccountMeta = AccountMeta;
        this.showVIM = true;
        this.vduInstanceTimeout = '';
        this.bindActions(AccountActions(this.alt));
        this.registerAsync(AccountSource);
        this.exportPublicMethods({
            closeSocket:this.closeSocket,
            setAccountTemplate: this.setAccountTemplate,
            handleParamChange: this.handleParamChange,
            handleNameChange: this.handleNameChange,
            handleAccountTypeChange: this.handleAccountTypeChange,
            updateAccount: this.updateAccount,
            viewAccount: this.viewAccount,
            handleNestedParamChange: this.handleNestedParamChange,
            getImage: this.getImage,
            saveAccountToSessionStorage: this.saveAccountToSessionStorage,
            updateVduTimeout: this.updateVduTimeout,
            getTransientAccountForUser: this.getTransientAccountForUser
        })
    }
    refreshAllAccountsSuccess = () => {
        this.setState({
            refreshingAll: false
        });
    }
    refreshAllAccountsLoading = () => {
        this.setState({
            refreshingAll: true
        });
    }
    refreshAllAccountsError = () => {

    }
    refreshCloudAccountFail = () => {
        console.log(this);
    }
    refreshCloudAccountSuccess = () => {

    }
    deleteAccountSuccess = (response) => {
        this.saveAccountToSessionStorage(null, true);
        this.setState({
            currentAccount: false,
            account: {}
        });
    }
    openAccountSocketSuccess = (connection) => {
        let self = this;
        let  ws = window.multiplexer.channel(connection);
        if (!connection) return;
        this.setState({
            socket: ws.ws,
            channelId: connection
        });
        ws.onmessage = (socket) => {
            try {
                var data = JSON.parse(socket.data);
                Utils.checkAuthentication(data.statusCode, function() {
                    self.closeSocket();
                });
                let SdnOptions = [{
                    label: 'Select an SDN Account',
                    value: false
                }];
                SdnOptions = SdnOptions.concat(this.generateOptionsByName(data.sdn.data))
                var newState = {
                    cloud: data.cloud.data,
                    'config-agent': data['config-agent'].data,
                    sdn: data.sdn.data,
                    'resource-orchestrator': data['resource-orchestrator'].data,
                    sdnOptions: SdnOptions
                };

                //If account is selected, updated connection status only
                if(self.currentAccount && (self.account || self.savedData)) {
                    let Account = self.getAccountFromStream(data[self.currentAccount.type].data, self.currentAccount.name);
                    newState.account = self.changedData ? self.account : self.savedData || self.account;

                    newState.account['connection-status'] = Account && Account['connection-status'];
                    newState.savedData = null;
                }
                self.setState(newState);
            } catch(error) {
                console.log('Hit at exception in openAccountSocketSuccess', error)
            }

        }
        ws.onclose = () => {
            self.closeSocket();
        }
    }
    closeSocket = () => {
        if (this.socket) {
            window.multiplexer.channel(this.channelId).close();
        }
        this.setState({
            socket: null
        })
    }
    setAccountTemplate = (AccountType, type, savedData) => {
        console.log('Setting Account Template')
        let account = {
            name: '',
            'account-type': type || AccountMeta[AccountType].defaultType,
            params: AccountMeta[AccountType].params[AccountMeta[AccountType].defaultType],
            nestedParams: AccountMeta[AccountType].nestedParams ? AccountMeta[AccountType].nestedParams[AccountMeta[AccountType].defaultType]:null,
            'connection-status': {
                status: ''
            }
        };

        account[type || AccountMeta[AccountType].defaultType] = {}
        this.setState({
            account: savedData || account,
            accountType: AccountType,
            types: AccountMeta[AccountType].types,
            currentAccount: null,
            changedData: true,
            savedData: null
        })
    }
    getAccountFromStream(data, name) {
        let result = null;
        data && _.isArray(data) && data.map(function(a) {
            if(a.name == name) {
                result = a;
            }
        });
        return result;
    }
    viewAccount = ({type, name}, savedData) => {
        console.log('Viewing account')
        var data = null;
        var accounts = null;
        let vduInstanceTimeout = '';
        if(this && this[type] && this[type].length) {
            accounts = this[type];
            data = this.getAccountFromStream(accounts, name);
            const isRo = data.hasOwnProperty('ro-account-type');
            if(data) {
                let accountParams = {
                    params: AccountMeta[type].params[
                        isRo ? data['ro-account-type'] : data['account-type']
                    ]
                };

                let accountNestedParams = {
                    nestedParams: AccountMeta[type].nestedParams?AccountMeta[type].nestedParams[
                        isRo ? data['ro-account-type'] : data['account-type']
                    ]:null
                };
                if (data.hasOwnProperty('vdu-instance-timeout')) {
                    vduInstanceTimeout = data['vdu-instance-timeout'];
                }
                this.setState({
                    currentAccount: {type, name},
                    account: (savedData ? savedData : Object.assign(data, accountParams, accountNestedParams)) || null,
                    accountType: type,
                    types: AccountMeta[type].types,
                    vduInstanceTimeout: vduInstanceTimeout,
                    savedData: null
                })
            }
        } else {
            this.setState({
                    currentAccount: {type, name},
                    account: null,
                    accountType: type,
                    types: AccountMeta[type].types,
                })
        }
    }
    generateOptionsByName(data) {
        let results = [];
        if (data && _.isArray(data)) {
          data.map(function(d) {
              results.push({
                  label: d.name,
                  value: d.name
              })
          });
        }
        return results;
    }
    updateAccount = (account) => {
        this.saveAccountToSessionStorage(account);
        this.setState({account:account,
            changedData: true})
    }
    handleNameChange = (event) => {
        var account = this.account;
        account.name = event.target.value;
        this.saveAccountToSessionStorage(account)
        this.setState(
             {
                account:account,
                changedData: true
             }
        );
    }
    updateVduTimeout = (event) => {
        var vduInstanceTimeout = event.target.value;
        this.setState(
             {
                vduInstanceTimeout:vduInstanceTimeout
             }
        );
    }
    handleAccountTypeChange = (node, isRo, event) => {
        var temp = {};
        temp.name = this.account.name;
        if (isRo) {
            temp['ro-account-type'] = event.target.value;
        } else {
            temp['account-type'] = event.target.value;
        }
        temp.params= AccountMeta[this.accountType].params[event.target.value];
        temp.nestedParams = (AccountMeta[this.accountType] && AccountMeta[this.accountType].nestedParams )?AccountMeta[this.accountType].nestedParams[event.target.value]:null;
        temp[event.target.value] = {};
        this.saveAccountToSessionStorage(temp)
        this.setState({
            account: temp,
            changedData: true
        });
    }
    handleParamChange(node, isRo, event) {
        return function(event) {
            var account = this.state.account;
            if (isRo) {
                account[account['ro-account-type']][node.ref] = event.target.value;

            } else {
                account[account['account-type']][node.ref] = event.target.value;

            }
            account.params[node.ref] = event.target.value;
            this.updateAccount(account);
        }.bind(this);
    }
    handleNestedParamChange(containerName, node, event) {
        return function(event) {
            var account = this.state.account;
            account[account['account-type']][containerName] = account[account['account-type']][containerName] || {};
            account[account['account-type']][containerName][node.ref] = event.target.value;
            account[containerName] = account[containerName] || {};
            account[containerName].params = account[containerName].params || {};
            account[containerName].params[node.ref] = event.target.value;
            this.updateAccount(account);
        }.bind(this);
    }
    getImage = (type) => {
        return AccountMeta.image[type];
    }
    createAccountSuccess = () => {
        this.setState({account: {}})
        this.saveAccountToSessionStorage(null, true)
    }
    handleCancelAccount = () => {
        this.setState({account: {}, currentAccount: null, savedData: null, accountType: null, types: []})
        this.saveAccountToSessionStorage(null, true)
    }
    saveAccountToSessionStorage = (account, clear) => {
        const userProfile = this.userProfile;
        if(userProfile) {
             if(clear) {

                window.sessionStorage.removeItem(userProfile.userId + '@' + userProfile.domain + ':account');
                // this.setState({
                //     account:null,
                //     accountType: null
                // })
            } else {
                const state = account || this.account;
                window.sessionStorage.setItem(userProfile.userId + '@' + userProfile.domain + ':account', JSON.stringify(state));
            }
        }

    }
    getTransientAccountForUser = (userProfile) => {
        let userProfileTransientAccount = window.sessionStorage.getItem(userProfile.userId + '@' + userProfile.domain + ':account') || null;
        var transientAccount = null;
        if (userProfileTransientAccount) {
            transientAccount = JSON.parse(userProfileTransientAccount);
        };
        this.saveAccountToSessionStorage(null, true);
        if(!this.userProfile) {
            this.setState({
                savedData:  transientAccount,
                userProfile: userProfile
            })
        }
    }
}

