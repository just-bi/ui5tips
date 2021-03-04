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
  "sap/ui/core/mvc/Controller",
  "sap/ui/table/Column",
  "sap/m/Text",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/FilterType",
  "ui5tips/utils/bufferedEventHandler"
], 
function(
  Controller,
  Column,
  Text,
  Filter,
  FilterOperator,
  FilterType,
  bufferedEventHandler
){
  "use strict";  
  var controller = Controller.extend("ui5tips.components.mainpage.MainPage", {
    onInit: function() {
      this.initSearchField();
    },
    initSearchField: function(){
      var searchField = this.byId('searchField');
      bufferedEventHandler.bufferEvents(
        // event provider
        searchField,
        // timeInterval
        1000, 
        // eventId
        'liveChange', 
        // data
        null, 
        // handler
        this.doSearch, 
        // listener
        this,
        // progressHandler
        this.searchFieldProgress,
        // progressUpdateInterval
        50
      );
    },
    createFilter: function(searchTerm){
      if (!searchTerm || searchTerm.length === 0){
        return null;
      }
      return new Filter({
        path: 'CompanyName',
        operator: FilterOperator.Contains,
        value1: searchTerm,
        caseSensitive: false
      })
    },
    doSearch: function(event){
      var newValue = event.getParameter('newValue');
      var filter = this.createFilter(newValue);
      var table = this.byId('table');
      table.getBinding('rows').filter(filter, FilterType.Control);
    },
    searchFieldProgress: function(progress){
      var progressIndicator = this.byId('progressIndicator');
      var percentValue = progress*100;
      progressIndicator.setPercentValue(percentValue);
    },
    createColumn: function(id, context){
      var contextObject = context.getObject();
      var columnName = contextObject.name;
      var column = new Column();
      column.setLabel(columnName);
      var text = new Text({
        wrapping: false
      });
      text.bindProperty('text', {
        model: 'companies',
        path: columnName
      });
      column.setTemplate(text);
      return column;
    }
  });
  return controller;
});

