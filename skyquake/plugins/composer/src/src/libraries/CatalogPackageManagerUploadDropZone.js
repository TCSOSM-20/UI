
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
 * Created by onvelocity on 10/27/15.
 */

import guid from '../libraries/guid'
import DropZone from 'dropzone'
import Utils from '../libraries/utils'
import CatalogPackageManagerActions from '../actions/CatalogPackageManagerActions'

/**
 * This class is responsible for wiring the DropZone.js to our React actions.
 */

const ACTIONS = {
	onboard: 'onboard',
	update: 'update'
};

function getCatalogPackageManagerServerOrigin() {
	// return Utils.getSearchParams(window.location).upload_server + ':4567';
	return window.location.origin;
}

function initializeDropZone(element = '#dropzone', button = false, action = ACTIONS.onboard) {
	let Auth = 'Basic ' + window.sessionStorage.getItem("auth");
    let dev_download_server = Utils.getSearchParams(window.location).dev_download_server;
	DropZone.autoDiscover = false;
	return new DropZone(element, {
		paramName: 'package',
		url() {
			if (action === ACTIONS.update) {
				return getCatalogPackageManagerServerOrigin() + '/composer/update?api_server=' + Utils.getSearchParams(window.location).api_server + '&upload_server=' + Utils.getSearchParams(window.location).upload_server + ( dev_download_server ? '&dev_download_server=' + dev_download_server : '');
			}
			return getCatalogPackageManagerServerOrigin() + '/composer/upload?api_server=' + Utils.getSearchParams(window.location).api_server + '&upload_server=' + Utils.getSearchParams(window.location).upload_server + ( dev_download_server ? '&dev_download_server=' + dev_download_server : '');
		},
		headers: {
			'Authorization': Auth
		},
		maxFilesize: 10000000000,
		clickable: button,
		acceptedFiles: 'application/octet-stream,.gz,.tar.gz,.tar,.qcow,.qcow2,.iso,application/yaml,.yaml,application/json,.json,application/zip,.zip,application/x-rar-compressed,.rar,application/x-7z-compressed,.7z,application/x-bzip,.bz,application/x-bzip2,.bz2,application/x-gtar,.gtar',
		autoProcessQueue: true,
		previewTemplate: '',
		sending(file, xhr, formData) {
			// NOTE ie11 does not get this form data
			formData.append('id', file.id);
		},
		error(file, errorMessage) {
			const response = {
				state: file,
				data: {
					status: 'upload-error',
					message: errorMessage
				}
			};
			CatalogPackageManagerActions.uploadCatalogPackageError(response);
		},
		success(file) {
			const data = JSON.parse(file.xhr.responseText);
			data.status = 'upload-success';
			const response = {
				state: file,
				data: data
			};
			CatalogPackageManagerActions.uploadCatalogPackageStatusUpdated(response);
		},
		addedfile(file) {
			file.id = file.id || guid();
			file.riftAction = action;
			CatalogPackageManagerActions.uploadCatalogPackage(file);
		},
		thumbnail(file, dataUrl) {
			const response = {
				state: file,
				data: {
					status: 'upload-thumbnail',
					dataUrl: dataUrl
				}
			};
			CatalogPackageManagerActions.uploadCatalogPackageStatusUpdated(response);
		},
		uploadprogress(file, progress, bytesSent) {
			const response = {
				state: file,
				data: {
					status: 'upload-progress',
					progress: progress,
					bytesSent: bytesSent
				}
			};
			CatalogPackageManagerActions.uploadCatalogPackageStatusUpdated(response);
		}
	});
}

export default class CatalogPackageManagerUploadDropZone {

	constructor(element, button, action) {
		this.dropZone = initializeDropZone(element, button, action);
	}

	static get ACTIONS() {
		return ACTIONS;
	}

	on(eventName, eventCallback) {
		this.dropZone.on(eventName, eventCallback);
	}

}
