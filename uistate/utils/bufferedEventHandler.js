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
  "sap/ui/base/Event",
  "sap/ui/base/EventProvider"
], 
function(
  Event,
  EventProvider
){
  "use strict";
  var bufferedEventHandler = {
    /**
    * Example usage:
    *
    * var searchField = this.byId('searchField');
    * bufferedEventHandler.bufferEvents(
    *   // event provider
    *   searchField,
    *   // timeInterval
    *   1000, 
    *   // eventId
    *   'liveChange', 
    *   // data
    *   null, 
    *   // handler
    *   this.doSearch, 
    *   // listener
    *   this,
    *   // progressHandler
    *   this.searchFieldProgress,
    *   // progressUpdateInterval
    *   50
    * );
    */
    bufferEvents: function(
      // the object that emits the events. (must implement of sap.ui.base.EventProvider)
      eventProvider, 
      // how much time to wait after receiving an event before calling the handler (int, in milliseconds)
      timeInterval, 
      // name of an event emitted by the eventprovider. (string - 1st argument to eventProvider.attachEvent)
      eventId, 
      // any data the handler should get when it is called (object - 2nd argument to eventProvider.attachEvent, null or undefined if not applicable)
      data, 
      // the handler function (function - 3rd argument to eventProvider.attachEvent)
      handler, 
      // the scope for calling the handler (object - 4th argument to eventProvider.attachEvent, null or undefined if not applicable)
      listener, 
      // function, will be called periodially (in scope of the listerner) after receiving the last event from the eventprovider untill the timeinterval expires (omit if not applicable)
      progressHandler, 
      // time interval for calling the progressHandler (int, in milliseconds)
      progressUpdateInterval
    ){
      if (!(eventProvider instanceof EventProvider)) {
        throw new Error("First argument must be an instance of sap.ui.base.EventProvider.");
      }
      // unfortunately, not all eventproviders will expose their events through metadata.
      // I filed a ui5 issue for it here: https://github.com/SAP/openui5/issues/3074
      if (eventProvider.getMetadata().getEvent && eventProvider.getMetadata().getEvent(eventId) === undefined) {
        throw new Error('EventProvider "' + eventProvider.getMetadata().getName() + '" does not expose event with id "' + eventId + '".');
      }
      if (typeof(timeInterval) !== "number") {
        throw new Error("Second argument must be a number.");
      }
      var _data, _handler, _listener, _progressHandler, _progressUpdateInterval;
      if (typeof(handler) === "function") {
        _data = data;
        _handler = handler;
        _listener = listener;
      }
      else {
        if (typeof(data) === "function") {
          _data = undefined;
          _handler = data;
          _listener = handler;
        }
        else {
          throw new Error("Missing handler function.");          
        }
      }
      
      if (typeof(listener) === "object" && typeof(progressHandler) === "function") {
        _progressHandler = progressHandler;
      }
      else
      if (typeof(listener) === "function") {
        _progressHandler = listener;
      }
      
      if (typeof(_progressHandler) === "function") {
        if (typeof(progressUpdateInterval) !== "number"){
          //if nothing was specified, we will send a progress update every 100ms.
          _progressUpdateInterval = 100;
        }
        else {
          _progressUpdateInterval = progressUpdateInterval;
        }
      }
      
      var args = [eventId];
      if (typeof(_data) !== "undefined") {
        args.push(_data);
      }

      var createHandler = function(timeinterval, handler, listener, progressHandler, progressUpdateInterval){
        var timeoutId = null;
        var bufferedEvent = new Event();
        var progress = 0, progressInterval;
        var callProgressHandler = function(){
          progressHandler.call(listener, progress/timeinterval);
          progress += progressUpdateInterval;
        };
        var bufferedHandler = function(event){
          if (timeoutId !== null) {
            window.clearTimeout(timeoutId);
          }

          if (progressHandler) {
            progress = 0;
            if (progressInterval !== null) {
              window.clearInterval(progressInterval);
            }
            callProgressHandler();
          }
          
          bufferedEvent.sId = event.sId;
          bufferedEvent.oSource = event.oSource;
          bufferedEvent.mParameters = event.mParameters;
          timeoutId = window.setTimeout(function(){
            if (progressHandler) {
              window.clearInterval(progressInterval);
              progressInterval = null;
              callProgressHandler();
            }
            timeoutId = null;
            handler.call(listener, bufferedEvent);
          }, timeinterval);
          
          if (progressHandler) {
            progressInterval = window.setInterval(function(){
              callProgressHandler();
            }, progressUpdateInterval);
          }
        };
        bufferedHandler.detach = function(){
          eventProvider.detachEvent.call(eventProvider, eventId, bufferedHandler);
        };
        return bufferedHandler;
      };
      
      var bufferedHandler = createHandler(timeInterval, _handler, _listener, _progressHandler, _progressUpdateInterval);
      args.push(bufferedHandler);
      eventProvider.attachEvent.apply(eventProvider, args);
      
      return bufferedHandler;
    }
  }
  return bufferedEventHandler;
});