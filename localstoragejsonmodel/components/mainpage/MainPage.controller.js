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
  "sap/ui/core/mvc/Controller"
], 
function(
  Controller
){
  "use strict";  
  var controller = Controller.extend("ui5tips.components.mainpage.MainPage", {
    onInit: function() {
      var messageManager = sap.ui.getCore().getMessageManager();
      messageManager.registerObject(this.getView(), true);
      this.initShoppingListModelHandlers();
    },
    getShoppingListModel: function(){
      var shoppingListModel = this.getOwnerComponent().getModel('shoppingList');
      return shoppingListModel;
    },
    initShoppingListModelHandlers: function(){
      var shoppingListModel = this.getShoppingListModel();
      shoppingListModel.attachDirtyStateChange(function(event){
        this.dirtyStateChanged(event.getParameters());
      }, this);
      shoppingListModel.attachPropertyChange(function(event){
        var path = event.getParameter('path');
        var context = event.getParameter('context');
        var itemsPath = '/items';

        if (path === itemsPath || context && context.getPath() === itemsPath) {
          this.itemsChanged(shoppingListModel.getProperty(itemsPath));
        }          
      }, this);
    },
    dirtyStateChanged: function(parameters){
      var isDirty = parameters.isDirty;
      this.byId('saveButton').setEnabled(isDirty);
      this.byId('undoButton').setEnabled(isDirty);
    },
    itemsChanged: function() {
      this.refreshRowActionTemplate();
    },
    isProductInShoppingList: function(product, shoppingList){
      if (!product || !shoppingList) {
        return undefined;
      }
      return shoppingList.some(function(shoppingListItem){
        return shoppingListItem.id === product.id;
      });
    },
    getShoppingCartRowActionIconSource: function(product, shoppingListItems){
      var isProductInShoppingList = this.isProductInShoppingList(product, shoppingListItems);
      switch (isProductInShoppingList){
        case undefined:
        case false:
          return 'sap-icon://cart';
        default:
          return 'sap-icon://cart-full';
      }
    },
    refreshRowActionTemplate: function(){
      var table = this.byId('products');
      var rowActionTemplate = table.getRowActionTemplate();
      table.setRowActionTemplate(null);
      table.setRowActionTemplate(rowActionTemplate);
    },
    changeQuantity: function(context, by){
      var model = context.getModel();
      var path = 'Quantity';
      var quantity = context.getObject()[path];
      model.setProperty(path, quantity + by, context);
    },
    onDecreaseQuantityPressed: function(event){
      var button = event.getSource();
      var context = button.getBindingContext('shoppingList');
      this.changeQuantity(context, -1);
    },
      onIncreaseQuantityPressed: function(event){
      var button = event.getSource();
      var context = button.getBindingContext('shoppingList');
      this.changeQuantity(context, 1);
    },
    formatItemTotal: function(price, quantity){
      if (!price ) {
        return undefined;
      }
      if (!quantity) {
        quantity = 0;
      }
      var currency = price.slice(0, 1);
      price = parseFloat(price.substr(1));
      return currency + (price * quantity).toFixed(2);
    },
    enableApprovalButton: function(items){
      if (!items) {
        return false;
      }
      return items.length > 0;
    },
    onCartButtonPressed: function(event){
      var row = event.getParameter('row');
      var productContext = row.getBindingContext('products');
      var product = productContext.getObject();
      
      var item = event.getParameter('item');
      var shoppingListContext = item.getBindingContext('shoppingList');
      var shoppingList = shoppingListContext.getObject();
      
      var isProductInShoppingList = this.isProductInShoppingList(product, shoppingList);
      if (isProductInShoppingList) {
        
      }
      else {
        var path = String(shoppingList.length);
        var shoppingListItem = Object.assign({"Quantity": 1}, product);
        shoppingListContext.getModel().setProperty(path, shoppingListItem, shoppingListContext);
      }
    },
    onDeleteButtonPressed: function(event){
      var row = event.getParameter('row');
      var rowContext = row.getBindingContext('shoppingList');
      var model = rowContext.getModel();
      var path = rowContext.getPath();
      var parts = path.split('/');
      var index = parseInt(parts.pop(), 10);
      path = parts.join('/');
      var shoppingList = Object.assign([], model.getProperty(path));
      shoppingList.splice(index, 1);
      model.setProperty(path, shoppingList);
    },
    onSaveButtonPressed: function(){
      var shoppingListModel = this.getShoppingListModel();
      shoppingListModel.saveToStorage();
    },
    onUndoButtonPressed: function(){
      var shoppingListModel = this.getShoppingListModel();
      shoppingListModel.loadFromStorage();
    },
    onApproveButtonPressed: function(){
      var shoppingListModel = this.getShoppingListModel();
      shoppingListModel.setProperty('/items', []);
      shoppingListModel.saveToStorage();
    },
    onClearButtonPressed: function(){
      var shoppingListModel = this.getShoppingListModel();
      shoppingListModel.setProperty('/items', []);
    }
  });
  return controller;
});

