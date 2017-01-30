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


//https://raw.githubusercontent.com/RIFTIO/RIFT.ware/master/rift-shell
import _ from 'lodash'
import React from 'react';
import ReactDOM from 'react-dom';
import TreeView from 'react-treeview';
import TextInput from 'widgets/form_controls/textInput.jsx';
import Button from '../Button';
import './FileMananger.scss';
import FileManagerActions from './FileManagerActions.js';
import imgSave from '../../../../node_modules/open-iconic/svg/data-transfer-upload.svg'
import {Panel, PanelWrapper} from 'widgets/panel/panel';
import SkyquakeComponent from 'widgets/skyquake_container/skyquakeComponent.jsx';
import LoadingIndicator from 'widgets/loading-indicator/loadingIndicator.jsx';

import DropZone from 'dropzone'
import Utils from '../../libraries/utils'
import FileManagerUploadDropZone from '../../libraries/FileManagerUploadDropZone';
let API_SERVER = require('utils/rw.js').getSearchParams(window.location).api_server;

const createDropZone = function (action, clickable, type, id, path, dropTarget) {
    const dropZone = new FileManagerUploadDropZone(ReactDOM.findDOMNode(dropTarget), [clickable], action, type, id, path);
    // dropZone.on('dragover', this.onDragOver);
    // dropZone.on('dragend', this.onDragEnd);
    // dropZone.on('addedfile', this.onFileAdded);
    return dropZone;
};
//updateFileLocationInput
class FileManager extends React.Component {
    constructor(props) {
        super(props)
    }
    componentWillMount() {
        // FileManagerActions.openFileManagerSockets()
    }
    componentWillUnmount() {
        // FileManagerActions.closeFileManagerSockets();
    }
    generateFolder(data, nesting) {
        let nestingLevel = nesting || 1;

    }
    deleteFile(name) {
        return function(e) {
            FileManagerActions.deletePackageFile(name);
        }

    }
    updateFileLocationInput(name) {
        return function(e) {
            FileManagerActions.updateFileLocationInput({
                name: name,
                value: e.target.value
            });
        }
    }
    sendDownloadFileRequst = (url, path) => {
        let self = this;
        return function(e) {
            if(!url || url == "") {
                return self.props.actions.showNotification.defer({type: 'error', msg: 'Value missing in download request'});;
            }
            let files = self.props.files.data;
            let folder = path.split('/');
            let splitUrl = url.split('/');
            let fileName = splitUrl[splitUrl.length - 1];
            folder.pop;
            let fullPath = _.cloneDeep(folder);
            fullPath.push(fileName);
            fullPath = fullPath.join('/');
            folder = folder.join('/');
            let fileIndex = _.findIndex(files[folder], function(f) {
                return f.name == fullPath;
            })
            if (fileIndex == -1) {
                FileManagerActions.sendDownloadFileRequst({
                    url: url,
                    path: path
                });
            } else {
                self.props.actions.showNotification('It seems you\'re attempting to upload a file with a duplicate file name');
            }
        }
    }
    render() {
        let self = this;
        let html = (
            <div className="FileManager">
                <PanelWrapper style={{flexDirection: 'column'}}>
                <Panel className="addFileSection" style={{backgroundColor: 'transparent'}} no-corners>
                    <div className="inputSection">
                        <TextInput placeholder="some/path" value={this.props.newPathName} label="create a new directory" onChange={FileManagerActions.newPathNameUpdated} />
                        <Button label="Create" onClick={FileManagerActions.createDirectory} />
                    </div>
                </Panel>
                {self.props.files && self.props.files.id && buildList(self, self.props.files) }
                </PanelWrapper>
            </div>
        )
        return html;
    }

}

function buildList(self, data) {
    let toReturn = [];
    data.id.map(function(k,i) {
        toReturn.push (contentFolder(self, data.data[k], k, i, self.props.filesState, self.updateFileLocationInput, self.sendDownloadFileRequst, self.deleteFile));
    });
    return toReturn.reverse();
}

function contentFolder(context, folder, path, key, inputState, updateFn, sendDownloadFileRequst, deleteFn) {
    let type = context.props.type;
    let id = context.props.item.id;
    const onboardDropZone = createDropZone.bind(this, FileManagerUploadDropZone.ACTIONS.onboard, '.ComposerAppAddFile.' + path.replace(/\//g, '-'), type, id, path);
    return (
        <Panel title={path} key={key} itemClassName="nested" no-corners>
        <div className="folder">
            {
                folder.map(function(f, i) {
                    if( !f.hasOwnProperty('contents') ){
                        return contentFile(context, f, path, i, deleteFn);
                    }
                })
            }
            <Panel className="addFileSection" no-corners>
                <ItemUpload type={type} id={id} path={path} key={key} dropZone={onboardDropZone} />
                <div style={{marginLeft: '0.5rem'}}>
                    OR
                </div>
                <div className="inputSection">
                    <TextInput placeholder="URL" className="" label="External URL" value={inputState[path]} onChange={updateFn(path)} />
                    <Button className='ComposerAppSave' label="DOWNLOAD" onClick={sendDownloadFileRequst(inputState[path], path)}/>
                </div>
            </Panel>

            </div>
        </Panel>
    );
}
class ItemUpload extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        if (this.props.dropZone) {
            const dropTarget = this;
            const dropZone = this.props.dropZone(dropTarget);
        }
    }
    render() {
        let {type, id, path, key, ...props} = this.props;
        return (
            <div className="inputSection">
                <label className="sqTextInput" style={{flexDirection: 'row', alignItems:'center'}}>
                    <span>Upload File</span>
                    <Button className={'ComposerAppAddFile ' + path.replace(/\//g, '-')} label="BROWSE"/>
                </label>
            </div>
        )
    }
}
function contentFile(context, file, path, key, deleteFn) {
    const name = stripPath(file.name, path);
    const id = context.props.item.id;
    const type = context.props.type;
    //{`${window.location.protocol}//${API_SERVER}:4567/api/package${type}/${id}/${path}/${name}`}
    return (
        <div className="file" key={key}>
            <div className="file-section">
                <div className="file-info">
                    <div className="file-status" style={{display: (file.status && file.status.toLowerCase() != 'completed') ? 'inherit' : 'none', color: (file.status == 'FAILED' ? 'red' : 'inherit')}}>
                        {file.status && (file.status == 'IN_PROGRESS' || file.status == 'DOWNLOADING'  )  ? <LoadingIndicator size={2} /> : file.status }
                    </div>
                    <div className="file-name">
                        <a target="_blank" href={`${API_SERVER}:4567/api/package/${type}/${id}/${path}/${name}`}>{name}</a>
                    </div>
                </div>
                <div className="file-action" style={{display: (!file.status || (file && file.status.toLowerCase() != 'loading...')) ? 'inherit' : 'none', cursor: 'pointer'}} onClick={deleteFn(file.name)}>X</div>
            </div>
        </div>
    )
}

function stripPath(name, path, returnPath) {
    let stripSlash = (name.indexOf('/') > -1) ? '/' : '';
    // return name.split(path + stripSlash)[1].replace('/', '');
    let split = name.split(path + stripSlash)[returnPath ? 0 : 1];
    return split ? split.replace('/', '') : name;
}



export default SkyquakeComponent(FileManager)
/**
 * Sample Data
 */
// let files = {
//   "name": ".",
//   "contents": [
//     {
//       "name": "pong_vnfd",
//       "contents": [
//         {
//           "name": "pong_vnfd/checksums.txt",
//           "last_modified_time": 1474458399.6218443,
//           "byte_size": 168
//         },
//         {
//           "name": "pong_vnfd/pong_vnfd.yaml",
//           "last_modified_time": 1474458399.6258445,
//           "byte_size": 3514
//         },
//         {
//           "name": "pong_vnfd/icons",
//           "contents": [
//             {
//               "name": "pong_vnfd/icons/rift_logo.png",
//               "last_modified_time": 1474458399.6218443,
//               "byte_size": 1658
//             }
//           ],
//           "last_modified_time": 1474458399.6218443,
//           "byte_size": 3
//         },
//         {
//           "name": "pong_vnfd/cloud_init",
//           "contents": [
//             {
//               "name": "pong_vnfd/cloud_init/pong_cloud_init.cfg",
//               "last_modified_time": 1474458399.6258445,
//               "byte_size": 227
//             }
//           ],
//           "last_modified_time": 1474458399.6258445,
//           "byte_size": 3
//         }
//       ],
//       "last_modified_time": 1474458399.6258445,
//       "byte_size": 6
//     }
//   ],
//   "last_modified_time": 1474458399.6218443,
//   "byte_size": 3
// };
