/*************************************************************************
*
* Copyright 2021 and onwards, Just-BI B.V. (Rijswijk, the Netherlands; KVK: 27256964)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/
sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/ui/util/Storage",
  "ui5tips/utils/bufferedEventHandler",
], 
function(
  JSONModel,
  Storage,
  bufferedEventHandler
){
  "use strict";
  
  /**
  * Extended JSON model with persistent storage using browser localstorage
  */
  
  var model = JSONModel.extend("ui5tips.utils.LocalStorageJSONModel", {
    autoSaveTimeout: -1,
    templateData: null,
    constructor: function(settings, observe){
      JSONModel.apply(this, null, observe);
      switch (typeof settings) {
        case 'string':
          //this happens when the model was configured with a data source - data gets loaded async from uri.
          // the following block is just a trick to let the normal JSON model fetch data from the uri.
          // we tried a few things and creating a new dummy JSON model for it is the easiest most reliable trick.
          var tmp = new JSONModel(settings, observe);
          tmp.attachRequestCompleted(function(){
            this.init(tmp.getData());
          }.bind(this));
          break;        
        case 'object':
          //this happens when the model was configured with a direct object.
        default:
          this.init(settings);
      }      
    },
    init: function(settings){
      this.storage = new Storage(Storage.Type.local, settings ? settings.storagePrefix : undefined);
      this.templateData = settings ? settings.template : null;
      this.loadFromStorage(this.templateData);
      this.setAutoSaveTimeout((settings ? settings.autoSaveTimeout : this.autoSaveTimeout) || this.autoSaveTimeout);
    },
    getTemplateData: function(){
      return this.templateData;
    },
    setProperty: function(path, value, context, asyncUpdate){
      var wasDirty = this.isDirty();
      JSONModel.prototype.setProperty.call(this, path, value, context, asyncUpdate);
      this.firePropertyChange({
        reason: 'explicit change via setter',
        path: path, 
        value: value, 
        context: context
      });
      var isDirty = this.isDirty();
      if (wasDirty !== isDirty) {
        this.fireEvent('dirtyStateChange', {
          wasDirty: wasDirty,
          isDirty: isDirty,          
        });
      }
    },
    attachDirtyStateChange: function(data, handler, listener){
      this.attachEvent('dirtyStateChange', data, handler, listener);
    },
    detachDirtyStateChange: function(handler, listener){
      this.detachEvent('dirtyStateChange', handler, listener);
    },
    isDirty: function(){
      var storedData = this.getDataFromStorage();
      var data = this.getData();
      var isClean = JSON.stringify(storedData) === JSON.stringify(data);
      return !isClean;
    },
    updateAutoSaveHandler: function(){
      if (this.autoSaveHandler) {
        this.autoSaveHandler.detach();
      }
      var autoSaveTimeout = this.getAutoSaveTimeout();
      if (autoSaveTimeout <= 0) {
        return;
      }
      this.autoSaveHandler = bufferedEventHandler.bufferEvents(
        // eventprovider
        this, 
        // how long to wait after last event to handle the event
        autoSaveTimeout, 
        // the event to buffer
        'propertyChange', 
        // any extra data for the handler
        null, 
        // actual handler function
        this.saveToStorage, 
        // scope for the handler function
        this
      );
    },
    setAutoSaveTimeout: function(autoSaveTimeout){
      this.autoSaveTimeout = autoSaveTimeout;
      this.updateAutoSaveHandler();
    },
    getAutoSaveTimeout: function(){
      return this.autoSaveTimeout;
    },
    getStorageKey: function(){
      return this.getMetadata().getName();
    },
    saveToStorage: function(){
      var wasDirty = this.isDirty();
      var data = this.getData();
      this.putDataInStorage(data);
      var isDirty = this.isDirty();
      if (wasDirty !== isDirty) {
        this.fireEvent('dirtyStateChange', {
          wasDirty: wasDirty,
          isDirty: isDirty,
        });
      }
    },
    resetToTemplate: function() {
      var templateData = this.getTemplateData();
      var data = {};
      data = this.updateDataFromTemplate(data, templateData);
      this.setProperty('/', data);
      this.refresh(true);
      this.saveToStorage();
    },
    getDataFromStorage: function(){
      var data = this.storage.get(this.getStorageKey());
      return data;
    },
    putDataInStorage: function(data){
      this.storage.put(this.getStorageKey(), data);
    },
    loadFromStorage: function(template){
      var data = this.getDataFromStorage();
      if (template){
        data = this.updateDataFromTemplate(data, template);
        this.putDataInStorage(data);
      }
      this.setProperty('/', data);
    },
    updateDataFromTemplate: function(data, template){
      //harmonize data retrieved from storage with the template.
      //goal is "upgrade" the data so that all new features in the template are added,
      //but without destroying any of the data, ever.      
            
      function copyData(source, target){
        var keys = Object.keys(source);
        keys.forEach(function(propertyName){
          var sourceValue = source[propertyName];
          var targetValue = target[propertyName];          
          if (targetValue === undefined || targetValue === null || targetValue === '') {
            //target either does not have this key at all, or it is null or the empty string (which we deem safe to overwrite)
            //so we create it and simply assign the value.
            if (typeof sourceValue === "object" && sourceValue !== null) {              
              // object is non-null reference type, we can use Object.assign. 
              // first, instantiate a new value of the right reference type
              targetValue = sourceValue instanceof Array ? [] : {};
              
              // then, do the deep assignment
              //Object.assign(targetValue, sourceValue);
              copyData(sourceValue, targetValue);
            }
            else {
              //value is either null or not a reference type - safe to simply assign.
              targetValue = sourceValue;
            }
            
            //do the actual assignment to the missing key.
            target[propertyName] = targetValue;
          }
          else if (sourceValue === null) {
            // we won't overwrite with null from template.
          }
          else if (typeof targetValue === 'object' && targetValue.constructor === sourceValue.constructor){
            // only if the sourceValue is not null, and both targetValue and sourceValue are reference types, copy the contents.
            copyData(sourceValue, targetValue);
          }
          else if (typeof sourceValue !== typeof targetValue){
            console.error('Property ' + propertyName + ' exists in source and target but have different types (' + (typeof sourceValue) + ';' + (typeof targetValue) +')');
          }
          else {
            //target has this property, and has a value. we do not overwrite the exiting value
          }
        });
      }

      if (data === null) {
        data = {};
      }
      if (template === null) {
        template = {};
      }
      //make some copies to work on so we don't mess up the originals in case something goes wrong in this method.
      var dataCopy = Object.assign({}, data);
      var templateCopy = Object.assign({}, template);
      
      //now, copy stuff from data to the template
      copyData(templateCopy, dataCopy);      
      return dataCopy;
    },
    deleteFromStorage: function(){
      this.storage.remove(this.getStorageKey());
    }
  });
  return model;
});