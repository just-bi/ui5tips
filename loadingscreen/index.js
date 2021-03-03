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
sap.ui.getCore().attachInit(function() {
  var componentContainer = new sap.ui.core.ComponentContainer({
    name: 'ui5tips',
    height: '100%',
    width: '100%'
  });
  var shell = new sap.m.Shell({
    app: componentContainer,
    appWidthLimited: false
  });
  var stylesheet = document.getElementById('animation');
  stylesheet.parentNode.removeChild(stylesheet);
  
  shell.placeAt('content');
});
