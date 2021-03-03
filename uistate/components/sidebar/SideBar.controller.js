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
], 
function(
  Controller
){
  "use strict";  
  var controller = Controller.extend("ui5tips.components.sidebar.SideBar", {
    onInit: function () {
    },
    onRowSelectionChanged: function(event){
      var view = this.getView();
      var splitter = view.getParent();
      var page = splitter.getParent();
      var mainPage = page.getParent();
      var detailPage = mainPage.byId('detailPage');

      var rowContext = event.getParameter('rowContext');
      detailPage.bindElement('companies>' + rowContext.getPath());      
    }
  });
  return controller;
});
