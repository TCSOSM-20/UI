
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
import Alt from 'widgets/skyquake_container/skyquakeAltInstance';
function crashStore () {
  this.exportAsync(require('./crashSource.js'));
  this.bindActions(require('./crashActions.js'));
  this.isLoading = false;
  this.crashList = null;
}

crashStore.prototype.getCrashDetailsSuccess = function(list) {
  this.setState({
    isLoading: false,
    crashList: list
  })
  console.log('Crash details load success', list)
};
crashStore.prototype.getCrashDetailsLoading = function(info) {
  this.setState({
    isLoading: true,
    crashList: null,
  })
  console.log('Loading crash details...', info)
};
crashStore.prototype.getCrashDetailsFailure = function(info) {
  this.setState({
    isLoading: false,
    error: info
  })
  console.log('Failed to retrieve crash/debug details', info)
};

module.exports = Alt.createStore(crashStore, 'crashStore');;

