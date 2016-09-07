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
import _ from 'lodash';
import LoggingActions from './loggingActions.js';
import LoggingSource from './loggingSource.js';

import alt from 'widgets/skyquake_container/skyquakeAltInstance';

class LoggingStore {
  constructor() {
    this.loggingConfig = {};
    // initialLoggingConfig is the saved state
    this.initialLoggingConfig = {};
    this.bindActions(LoggingActions);
    this.registerAsync(LoggingSource);
    this.exportPublicMethods({
      updateCategoryDefaultSeverity: this.updateCategoryDefaultSeverity,
      updateAllowDuplicateEvents: this.updateAllowDuplicateEvents,
      addDenyEvent: this.addDenyEvent,
      updateDenyEvent: this.updateDenyEvent,
      removeDenyEvent: this.removeDenyEvent,
      updateSyslogViewerURL: this.updateSyslogViewerURL,
      resetLoggingConfigData: this.resetLoggingConfigData
    });
  }

  getLoggingConfigSuccess = (data) => {
      console.log("LoggingStore.getLoggingConfigSuccess called. data=", data);
      // Do we need to do a deep clone?
      const initialLoggingConfig = _.cloneDeep(data);
      console.log("initialLoggingConfig=", initialLoggingConfig);
      this.setState({
      loggingConfig: data,
      initialLoggingConfig: initialLoggingConfig,
      isLoading: false
    });
  }

  getLoggingConfigError(data) {
    console.log("LoggongStore.getLoggingConfigError called. data=", data);
  }

  putLoggingConfigSuccess = (data) => {
    console.log("LoggingStore.putLoggingConfigSuccess called. data=", data);
    const initialLoggingConfig = _.cloneDeep(this.loggingConfig);
    this.setState({
      isLoading: false,
      initialLoggingConfig: initialLoggingConfig
    });
  }

  putLoggingConfigError(data) {
    console.log("LoggingStore.putLoggingConfigError called. data=", data);
  }

  resetLoggingConfigData = (data) => {
    console.log('LoggingStore.resetLoggingConfigData called. data=', data);
    // Do we need to do a deep clone?
    const loggingConfig = _.cloneDeep(this.initialLoggingConfig);
    this.setState({
      loggingConfig: loggingConfig
    });
  }

  updateCategoryDefaultSeverity = (catsev) => {
    console.log("LoggingStore.updateCategoryDefaultSeverity:", catsev);
    // find the category

    let catIndex = _.findIndex(this.loggingConfig.defaultSeverities, function(o) {
      return o.category == catsev.category;
    });
    console.log("catIndex=", catIndex);
    if (catIndex != -1) {
      const loggingConfig = this.loggingConfig;
      loggingConfig.defaultSeverities[catIndex].severity = catsev.severity;

      this.setState({
        loggingConfig: loggingConfig
      });
    }  else {
      console.log("ERROR: catIndex not founds for default category", catsev.category);
    }
  }

  updateAllowDuplicateEvents = (allowFlag) => {
    console.log("LoggingStore.updateAllowDuplicateEvents called. allowFlag=", allowFlag);
    const loggingConfig = this.loggingConfig;
    loggingConfig.allowDuplicateEvents = allowFlag;
    this.setState({
      loggingConfig: loggingConfig
    });
  }

  /**
   * Add a new empty (null) deny event to loggingConfig
   */
  addDenyEvent = (event) => {
    const loggingConfig = this.loggingConfig;
    loggingConfig.denyEventIDs.push(null);
    this.setState({
      loggingConfig: loggingConfig
    });
  }

  /**
   * Update
   */
  updateDenyEvent = (index, eventID) => {
    //console.log("LoggingStore.updateDenyEventID: index=", index);
    //console.log(" -> eventID=", eventID);

    const loggingConfig = this.loggingConfig;
    loggingConfig.denyEventIDs[index] = eventID;
    this.setState({
      loggingConfig: loggingConfig
    });
  }

  /**
   *
   */
  removeDenyEvent = (index) => {
    // console.log("LoggingStore.removeDenyEvent at index %s", index);
    const loggingConfig = this.loggingConfig;
    // Note: we are not validating index
    loggingConfig.denyEventIDs.splice(index, 1);
    this.setState({
      loggingConfig: loggingConfig
    });
  }

  /**
   *
   */
  updateSyslogViewerURL = (syslogViewerURL) => {
    const loggingConfig = this.loggingConfig;
    loggingConfig.syslogviewer = syslogViewerURL;
    this.setState({
      loggingConfig: loggingConfig
    });
  }
}

export default alt.createStore(LoggingStore);
