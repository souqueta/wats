/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is WATS.
 *
 * The Initial Developer of the Original Code is Amédée Souquet.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK ***** */


var Cc = Components.classes;
var Ci = Components.interfaces;
var Cr = Components.results;
var Ce = Components.Exception;

var watsSidebar = {

  _WATS_SIDEBAR_TITLE : "SiteCatalyst variables visualization",
  _WATS_CONSTRAINT_WINDOW_TITLE : "Set SiteCatalyst variables constraints",
  _WATS_SCENARIO_WINDOW_TITLE : "Play loaded scenario",

  _WATS_SIDEBAR_CHROME_URL : "chrome://wats/content/watsSidebar.xul",
  _WATS_RULE_TREE_CHROME_URL : "chrome://wats/content/watsRuleTree.xul",
  _WATS_OPTIONS_CHROME_URL : "chrome://wats/content/watsOptions.xul",
  _WATS_COOKIES_CHROME_URL : "chrome://wats/content/watsCookiesTree.xul",

  _WATS_SIDEBAR_WIDTH : 400,
  _PERMS_CONSTRAINT_DIRECTORY : 0755,

  /* The observer service */
  _observerService : null,
  _logger : null,
  _currentCommand : null,
  _watsWindow: null,

  /**
   * Function called each time the sidebar UI is loaded.
   */
  init: function () {
    var typeWindow = Application.storage.get("currentType", "default");

    this._logger = watsUtils.getLogger("watsSidebar");
    this._observerService =
      Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);

    this._observerService.addObserver(this, "quit-application-requested", false);
    this._observerService.addObserver(this, "http-on-modify-request", false);
    
    document.getElementById("wats-sidebar-history-filter-textbox").emptyText
      = "Filter by ReportSuiteID";

    if (typeWindow == "window") {
      this.initWindow();
    } else {
      this.initSidebar();
    }
  },

  /**
   * This function is called when the sidebar is opened.
   */
  initSidebar : function() {
    this._logger.trace("initSidebar");
    this.setSidebarWidth(this._WATS_SIDEBAR_WIDTH);

    watsUtils.getMainWindow().gBrowser.reload();

    this.initializeVisualizationTree();
  },

  /**
   * This function is called when the window is opened.
   */
  initWindow : function () {
    this._logger.trace("initWindow");

    var win = watsUtils.getBrowserWindow();
    // win.gBrowser.reload();
    win.gBrowser.reloadAllTabs();

    this.initializeVisualizationTree();
  },

  /**
   * This function opens the sidebar in a new window.
   */
  openSidebarInNewWindow : function() {
    var currentType = Application.storage.get("currentType", "default");

    // In case the window is already open, we just give the focus to it.
    Application.storage.set("currentType", "window");
    if (currentType == "window") {
      if (this.isOpened()) {
        this._watsWindow.focus();
        return;
      }
    } else {
      if (this.isOpened()) {
        this.toggleSidebar();
      }
    }
    this._watsWindow =
    // And not openDialog here because otherwise we lose the menubar.
      window.open(this._WATS_SIDEBAR_CHROME_URL,
        '', "chrome, titlebar,centerscreen,width=390,height=640,resizable=yes");
  },

  /**
   * This function takes care of closing the wats window if it's opened,
   * and to set the sidebar mode to true.
   * In Case the sidebar should close (and not open), we do nothing.
   */
  closeWatsWindowAndSetSidebarMode : function() {
    var isOpened = this.isOpened();
    if (isOpened) {
      var currentType = Application.storage.get('currentType', 'default');
      if(currentType == "window") {
        // we close the window
        this.closeWatsWindow();
      }
      Application.storage.set('currentType', 'sidebar');
    }
    // If we close the sidebar, we set the type to default
    Application.storage.set('currentType', 'default');
  },

  /**
   * This function specifies if the sidebar is opened or not in
   * the browser.
   */
  isOpened : function() {
    var sidebarWindow =
      watsUtils.getMainWindow().
        document.getElementById("sidebar").contentWindow;
    if (sidebarWindow && sidebarWindow.location.href
        == this._WATS_SIDEBAR_CHROME_URL) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * This callback is called after user clicked on the status bar button.
   * In case this is left click, we open in a new window.
   * Otherwise, if right click, we offer the choice via contextual menu.
   */
  onStatusBarButtonClick : function (aEvent) {
    if (aEvent.button != 0) {
      return;
    }
    else {
      try {
      this.closeWatsWindow();
      this.toggleSidebar();
      } catch (e) {
      }
    }
  },

  /**
   * This callback is called after user clicked on the new window icon.
   * In case this is left click, we open in a new window.
   * Otherwise, if right click, we offer the choice via contextual menu.
   */
  onNewWindowButtonClick : function (aEvent) {
    if (aEvent.button != 0) {
      return;
    }
    else {
      this.openSidebarInNewWindow();
    }
  },

  /**
   * This function checks that a constraint has been or not
   * already defined or not for this Site Catalyst request.
   * @param isSameWindow specifies if the request has been created
   * by a tiers window or not.
   */
  checkForAlreadyDefinedDescriptions : function(aReportSuiteID, isDifferentWindow) {
    if (this._logger== null) {
      this._logger = watsUtils.getLogger("watsSidebar");
      this._logger.trace("init");
    }
    this._logger.trace("checkForAlreadyDefinedDescriptions");

    // TODO: define an unique way to indentify a file.
    var constraintFile = watsUtils.getConstraintsFolder();
    var xmlFilename =  aReportSuiteID + ".xml";
    this._logger.debug("value of the xmlFileName : " + xmlFilename + "\n");
    constraintFile.append(xmlFilename);
    // If the constraints file exists, we load its
    // values in the rules tree.
    if (!constraintFile.exists()) {
      this._logger.debug("constraint file doesn't exist yet!");
      try {
        var dataSourceFile = watsUtils.getDataSourceFolder();
        dataSourceFile.append("datasource.xml");
        var path = watsUtils.getConstraintsFolder();
        // We automatically copy the default file to the new file.
        // We load the default datasource file.
        dataSourceFile.copyTo(path, xmlFilename);
      } catch(e) {
        this.logger.error("error trying to create and copy the file : " + e);
      }
    }
    this._logger.debug(
      "constraints file exists in checkForAlreadyDefinedDescriptions \n");
    var doc = watsUtils.readXMLDocument(constraintFile.path);
    var elements = doc.getElementsByTagName('constraint');
    for (var i = 0 ; i < elements.length ; i++) {
      var id = elements[i].getAttribute("id");
      var descr = elements[i].getAttribute("d");

      var typeWindow = Application.storage.get("currentType", "default");
      var sidebarElement = null;
      if (typeWindow == "window") {
        if (! isDifferentWindow) {
          sidebarElement = document.getElementById(id);
        } else {
          sidebarElement = document.getElementById(id);
        }
      } else {
        sidebarElement =
          watsUtils.getMainWindow().document.getElementById("sidebar").
            contentWindow.document.getElementById(id);
      }

      if (sidebarElement && (descr != null) && descr != "") {
        sidebarElement.setAttribute("label", descr);
      }
    }
  },

  /**
   * This function toggles the sidebar, calling the function
   * already available from the browser code.
   */
  toggleSidebar : function () {
    var wm =
      Cc['@mozilla.org/appshell/window-mediator;1']
        .getService(Ci.nsIWindowMediator);
     var browserWindow = null;
     var currentType = Application.storage.get("currentType", "default");
     if (currentType == "window") {
        browserWindow =
          window.QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIWebNavigation)
            .QueryInterface(Ci.nsIDocShellTreeItem)
            .rootTreeItem
            .QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIDOMWindow);
     } else {
      browserWindow = watsUtils.getMainWindow();
     }
     browserWindow.toggleSidebar('viewWatsSidebar');
  },

  /**
   * In the history, copies the Site Catalyst URL into the clipboard
   */
  copyItemURLToClipBoard : function () {
    var str =
      Cc["@mozilla.org/supports-string;1"]
        .createInstance(Ci.nsISupportsString);
    var trans =
      Cc["@mozilla.org/widget/transferable;1"].
        createInstance(Ci.nsITransferable);
    var clip =
      Cc["@mozilla.org/widget/clipboard;1"].getService(Ci.nsIClipboard);

    var atree = document.getElementById("watsSidebarHistoryTree");
    var scurl =
      atree.view.getCellValue(
        atree.currentIndex, atree.columns.getNamedColumn('history-scurl'));

    if (!str || !trans || !clip) {
      return false;
    }

    str.data = scurl;

    trans.addDataFlavor('text/unicode');
    trans.setTransferData('text/unicode', str, scurl.length * 2);

    clip.setData(trans, null, Ci.nsIClipboard.kGlobalClipboard);
    return true;
  },

  /**
   * This function allows to copy a selected line in the tree and
   * paste it somewhere else.
   */
  copyToClipboard : function (aEvent) {
    var str =
      Cc["@mozilla.org/supports-string;1"]
        .createInstance(Ci.nsISupportsString);
    var trans =
      Cc["@mozilla.org/widget/transferable;1"].
        createInstance(Ci.nsITransferable);
    var clip =
      Cc["@mozilla.org/widget/clipboard;1"].getService(Ci.nsIClipboard);
    var copytext = "";

    var atree = document.getElementById("watsSidebarTree");
    for (var i = 0; i < atree.view.rowCount ; i++) {
      if (atree.view.selection.isSelected(i)){
        var value =
          atree.view.getCellText(
          i, atree.columns.getNamedColumn('value'));
        var prop =
          atree.view.getCellText(i, atree.columns.getNamedColumn('prop'));
        // In case we activate the contextual menu of the Products variable,
        // we copy the actual value rather than the visual value.
        if (prop == "Products") {
          value = watsSidebarSC._products;
        }
        copytext += prop + " --> " + value + "\n";
      }
    }

    if (!str || !trans || !clip) {
      return false;
    }

    str.data = copytext;

    trans.addDataFlavor('text/unicode');
    trans.setTransferData('text/unicode', str, copytext.length * 2);

    clip.setData(trans, null, Ci.nsIClipboard.kGlobalClipboard);
    return true;
  },

  /** This function makes sure that the tree gets its items deleted
   * so we can reload the proper data in the tree.
   */
  initializeVisualizationTree : function () {
    this._logger.trace("initializeVisualizationTree");

    var siteContentTreeChildren = document.getElementById("siteContent");
    var trafficVariablesTreeChildren =
      document.getElementById("trafficVariables");
    var generalTreeChildren = document.getElementById("general");
    var conversionVariablesTreeChildren =
      document.getElementById("conversionVariables");
    var testTreeChildren = document.getElementById("test");
    var trafficSourceTreeChildren = document.getElementById("trafficSource");
    //var eventsTreeChildren = document.getElementById("events");

    while(siteContentTreeChildren && siteContentTreeChildren.hasChildNodes()){
      siteContentTreeChildren.removeChild(siteContentTreeChildren.firstChild);
    }
    while(trafficVariablesTreeChildren && trafficVariablesTreeChildren.hasChildNodes()){
      trafficVariablesTreeChildren.
        removeChild(trafficVariablesTreeChildren.firstChild);
    }
    while(generalTreeChildren && generalTreeChildren.hasChildNodes()){
      generalTreeChildren.removeChild(generalTreeChildren.firstChild);
    }
    while(conversionVariablesTreeChildren &&
      conversionVariablesTreeChildren.hasChildNodes()){
      conversionVariablesTreeChildren.removeChild(
        conversionVariablesTreeChildren.firstChild);
    }
    while(testTreeChildren && testTreeChildren.hasChildNodes()){
      testTreeChildren.removeChild(testTreeChildren.firstChild);
    }
    while(trafficSourceTreeChildren &&
      trafficSourceTreeChildren.hasChildNodes()){
      trafficSourceTreeChildren.removeChild(
        trafficSourceTreeChildren.firstChild);
    }
    /*while(eventsTreeChildren.hasChildNodes()){
      eventsTreeChildren.removeChild(
        eventsTreeChildren.firstChild);
    }*/
  },

  /**
   * This is the observerService's observe listener.
   */
  observe: function(aSubject, aTopic, aData){

    try {
      watsSidebarSC.observeSiteCatalystRequests(aSubject, aTopic, aData);
    } catch (e) {
      //@@TODO
    }
  },

  /**
   * This function switches on or off the section displaying the
   * historic of SC requests visualized in the sidebar.
   */
  toggleHistory : function() {
    var historyBox = document.getElementById("wats-sidebar-history-vbox");
    var historyFilter = document.getElementById("wats-sidebar-history-filter");
    var historyMenu = document.getElementById("wats-sidebar-toggle-history");
    historyBox.hidden =  !historyMenu.getAttribute("checked");
    historyFilter.hidden = !historyMenu.getAttribute("checked");
  },

  /**
   * This function returns the tab corresponding to the
   * requested httpChannel.
   * @param httpChannel {nsIHttpChannel} The HttpChannel we want
   * to know which tab has generated it.
   */
   getTabIdForHttpChannel : function(httpChannel) {

     if (httpChannel.notificationCallbacks) {
       var interfaceRequestor =
         httpChannel.notificationCallbacks
           .QueryInterface(Ci.nsIInterfaceRequestor);

      try {
        var targetDoc =
          interfaceRequestor.getInterface(Ci.nsIDOMWindow).document;
      } catch (e) { return null; }

      var tab = null;
      var win = null;

      var currentType = Application.storage.get("currentType", "default");
      if (currentType == "window") {
        win = watsUtils.getBrowserWindow();
      } else {
        win = watsUtils.getMainWindow();
      }
      var targetBrowserIndex =
        win.gBrowser.
          getBrowserIndexForDocument(targetDoc);

      // handle the case where there was no tab associated
      // with the request (rss, etc)
      if (targetBrowserIndex != -1) {
         tab = win.gBrowser.
                 tabContainer.childNodes[targetBrowserIndex];
      }
      else {
        return null;
      }

      return tab.linkedPanel;
    }
    else {
      return null;
    }
  },

  /**
   * This function opens all the items which are containers within the tree.
   */
  openAllTreeContainers : function () {
    // open all the containers in the tree at this stage.
    // we keep also track of all items which are open.
    var openedContainersIds = new Array();
    var treeItems = document.getElementsByTagName("treeitem");
    for (var j = 0 ; j < treeItems.length ; j++) {
      var treeItem = treeItems [j];
      if (treeItem.getAttribute("container") == "true") {
        if (treeItem.getAttribute("open") == "true") {
          openedContainersIds.push(treeItem.id);
        }
        treeItem.setAttribute("open", "true");
      }
    }
    return openedContainersIds;
  },

  /**
   * This function closes items that need to be closed.
   * TODO: share the openedContainerIds variable with above function.
   */
  closeNeededTreeContainers : function (openedContainersIds) {
    // close the containers that needs to at this stage.
    var treeItems = document.getElementsByTagName("treeitem");
    for (var j = 0 ; j < treeItems.length ; j++) {
      var treeItem = treeItems [j];
      if (treeItem.getAttribute("container") == "true"
          && openedContainersIds.indexOf(treeItem.id) == -1) {
        treeItem.setAttribute("open", "false");
      }
    }
  },

  /**
   * This functions replaces events name which have a description
   * in the constraint files.
   * @param eventList {List} The list of events returned by SC.
   */
  replaceEventsDescriptions : function(eventsList) {
    //@@TODO
    // check if the element exists in the constraint file.
    // if it exists, check if it has a description.
    // if it has a description, then load it in the sidebar.
    // this.addTreeItem(eventsTreeChildren, eventsArray[i], eventsArray[i], "");
    try {
      this._logger.trace("replaceEventsDescriptions");

      var newEventList = "";
      var eventsArray = eventsList.split(",");
      var newEventsArray = eventsArray.slice();
      var found = false;
      var constraintFile = watsUtils.getConstraintsFolder();
      var xmlFilename =  watsSidebarSC._reportSuiteID + ".xml";

      this._logger.debug(
        "value of the xmlFileName in replaceEventsDescriptions : "
          + xmlFilename + "\n");
      constraintFile.append(xmlFilename);
      // If the constraints file exists, we load its
      // values in the rules tree.
      if (constraintFile.exists()) {
        var doc = watsUtils.readXMLDocument(constraintFile.path);
        var elements = doc.getElementsByTagName('constraint');

        for (var i = 0 ; i < eventsArray.length ; i++){
          for (var j = 0 ; j < elements.length ; j++) {
            var eventElement = eventsArray[i];
            var id = elements[j].getAttribute("id");
            var descr = elements[j].getAttribute("d");
            if (id == eventElement && descr != "") {
              newEventsArray[i] = descr;
              found = true;
            }
          }
        }
      }
      if (found) {
        for (var i = 0; i < newEventsArray.length ; i++) {
          newEventList = newEventList + newEventsArray[i] + ",";
        }
        var newEventList = newEventList.substring(0, newEventList.length-1);
      } else {
        newEventList = eventsList;
      }
      return newEventList;
    } catch (e) {
      //dump ("Error in the replace event description method : " + e + "\n");
      return eventsList;
    }
  },

  /**
   * This function adds an element in the tree, knowing the
   * command, the target and the value of the selenese tags.
   */
  addTreeItem : function (aTreeChildren, aTreeCell1Id, aProperty, aValue) {

    if (aValue != null && aValue != "") {
      var tree = document.getElementById("watsSidebarTree");

      var treeItem = document.createElement("treeitem");
      var treeRow = document.createElement("treerow");

      // The first treecell corresponding to the variable.
      var treeCell1 = document.createElement("treecell");
      treeCell1.setAttribute("label", aProperty);
      treeCell1.setAttribute("id", aTreeCell1Id);
      treeCell1.setAttribute("value", aTreeCell1Id);
      treeCell1.setAttribute("properties", "variable");

      // The second variable corresponding to the value.
      var treeCell2 = document.createElement("treecell");
      treeCell2.setAttribute("label", aValue);

      treeRow.appendChild(treeCell1);
      treeRow.appendChild(treeCell2);

      treeItem.appendChild(treeRow);

      // This is a special case for products
      if (aTreeCell1Id == "products") {
        // Adds the new product treeChildren
        var treeChildrenProduct = document.createElement("treechildren");
        treeItem.appendChild(treeChildrenProduct);

        treeCell2.setAttribute("label", "");
        var category = null;
        var name = null;
        var quantity = null;
        var price = null;
        var evar = null;
        var event = null;
        var incrementor = null;
        var productsNumber = 0;

        var productsArray = aValue.split(",");
        var product = null;
        for (var p = 0; p <= productsArray.length -1 ; p++) {
          product = productsArray[p];

          // If the last character is not a column, we add it.
          // If we find two consecutives columns, we insert a space between them
          if (product.charAt(product.length) != ";") {
            product += ";";
          }
          if (product.indexOf(";;") != -1) {
            product.replace(";;", "; ;")
          }
          var productValuesArray = product.split(";");
          // The following statement assumes that products variables
          // ends with a ';'
          var productArrayLength = (productValuesArray.length) - 1;
          for (var i = 0 ; i < productArrayLength ; i++) {
            switch (i % 6) {
              case 0:
                category = productValuesArray[i];
                break;
              case 1:
                name = productValuesArray[i];
                break;
              case 2:
                quantity = productValuesArray[i];
                break;
              case 3:
                price = productValuesArray[i];
                break;
              case 4:
                incrementor = productValuesArray[i];
                break;
              case 5:
                evar = productValuesArray[i];
                break;

              default:
                break;
            }
            // In case we are reaching the last current product item.
            if (i == productArrayLength -1) {
              productsNumber++;

              treeItem.setAttribute("container", true);

              var treerowProduct = document.createElement("treerow");
              var treeitemProduct = document.createElement("treeitem");
              treeitemProduct.setAttribute("container", true);
              var treecellProduct1 = document.createElement("treecell");
              var treecellProduct2 = document.createElement("treecell");
              var productLabel = "Product" + productsNumber;
              treecellProduct1.setAttribute("label", productLabel);

              treerowProduct.appendChild(treecellProduct1);
              treerowProduct.appendChild(treecellProduct2);
              treeitemProduct.appendChild(treerowProduct);
              treeChildrenProduct.appendChild(treeitemProduct);

              // Adds the product properties to the product
              var treeChildrenProductDescription =
                document.createElement("treechildren");

              var treeitemProductCategory =
                document.createElement("treeitem");
              var treerowProductCategory = document.createElement("treerow");
              var treecellCategory1 = document.createElement("treecell");
              treecellCategory1.setAttribute("label", "Category");
              var treecellCategory2 = document.createElement("treecell");
              treecellCategory2.setAttribute("label", category);

              var treeitemProductName = document.createElement("treeitem");
              var treerowProductName = document.createElement("treerow");
              var treecellName1 = document.createElement("treecell");
              treecellName1.setAttribute("label", "Name");
              var treecellName2 = document.createElement("treecell");
              treecellName2.setAttribute("label", name);

              var treeitemProductQuantity =
                document.createElement("treeitem");
              var treerowProductQuantity = document.createElement("treerow");
              var treecellQuantity1 = document.createElement("treecell");
              treecellQuantity1.setAttribute("label", "Quantity");
              var treecellQuantity2 = document.createElement("treecell");
              treecellQuantity2.setAttribute("label", quantity);

              var treeitemProductPrice = document.createElement("treeitem");
              var treerowProductPrice = document.createElement("treerow");
              var treecellPrice1 = document.createElement("treecell");
              treecellPrice1.setAttribute("label", "Price");
              var treecellPrice2 = document.createElement("treecell");
              treecellPrice2.setAttribute("label", price);

              var treeitemProducteVar = document.createElement("treeitem");
              var treerowProducteVar = document.createElement("treerow");
              var treecelleVar1 = document.createElement("treecell");
              treecelleVar1.setAttribute("label", "eVar");

              var treeitemProductevent = document.createElement("treeitem");
              var treerowProductevent = document.createElement("treerow");
              var treecellevent1 = document.createElement("treecell");
              treecellevent1.setAttribute("label", "Event");

              var treeChildrenProducteVar = null;
              if (evar) {
                treeitemProducteVar.setAttribute("container", "true");
                treeChildrenProducteVar
                  = document.createElement("treechildren");
                treeitemProducteVar.appendChild(treeChildrenProducteVar);

                // here we take care of parsing the evars
                var evars = evar.split("|");
                for (var e = 0 ; e < evars.length ; e++) {
                  var variable = evars[e].split("=")[0];
                  var value = evars[e].split("=")[1];
  
                  var treeitemeVar = document.createElement("treeitem");
                  var treeroweVar = document.createElement("treerow");
                  var treecelleVar = document.createElement("treecell");
                  treecelleVar.setAttribute("label", variable);
                  var treecelleVarValue = document.createElement("treecell");
                  treecelleVarValue.setAttribute("label", value);
  
                  treeroweVar.appendChild(treecelleVar);
                  treeroweVar.appendChild(treecelleVarValue);
                  treeitemeVar.appendChild(treeroweVar);
                  treeChildrenProducteVar.appendChild(treeitemeVar);
                }
              }

              var treeChildrenProductevent = null;
              if (incrementor) {
                treeitemProductevent.setAttribute("container", "true");
                treeChildrenProductevent
                  = document.createElement("treechildren");
                treeitemProductevent.appendChild(treeChildrenProductevent);
                // here we take care of parsing the events
                var events = incrementor.split("|");
                for (var e = 0 ; e < events.length ; e++) {
                  var event = events[e].split("=")[0];
                  var value = events[e].split("=")[1];

                  var treeitemevent = document.createElement("treeitem");
                  var treerowevent = document.createElement("treerow");
                  var treecellevent = document.createElement("treecell");
                  treecellevent.setAttribute("label", event);
                  var treecelleventValue = document.createElement("treecell");
                  treecelleventValue.setAttribute("label", value);
  
                  treerowevent.appendChild(treecellevent);
                  treerowevent.appendChild(treecelleventValue);
                  treeitemevent.appendChild(treerowevent);
                  treeChildrenProductevent.appendChild(treeitemevent);
                }
              }

              treerowProductCategory.appendChild(treecellCategory1);
              treerowProductCategory.appendChild(treecellCategory2);

              treerowProductName.appendChild(treecellName1);
              treerowProductName.appendChild(treecellName2);

              treerowProductQuantity.appendChild(treecellQuantity1);
              treerowProductQuantity.appendChild(treecellQuantity2);

              treerowProductPrice.appendChild(treecellPrice1);
              treerowProductPrice.appendChild(treecellPrice2);

              treerowProductevent.appendChild(treecellevent1);

              treerowProducteVar.appendChild(treecelleVar1);

              treeitemProductCategory
                .appendChild(treerowProductCategory);
              treeitemProductName
                .appendChild(treerowProductName);
              treeitemProductQuantity
                .appendChild(treerowProductQuantity);
              treeitemProductPrice
                .appendChild(treerowProductPrice);
              treeitemProductevent
                .appendChild(treerowProductevent);
              treeitemProducteVar
                .appendChild(treerowProducteVar);

              // We only add the items to the tree if they are not null
              if (category) {
                treeChildrenProductDescription.
                  appendChild(treeitemProductCategory);
              }
              if (name) {
                treeChildrenProductDescription.
                  appendChild(treeitemProductName);
              }
              if (quantity) {
                treeChildrenProductDescription.
                  appendChild(treeitemProductQuantity);
              }
              if (price) {
                treeChildrenProductDescription.
                  appendChild(treeitemProductPrice);
              }
              if (incrementor) {
                treeChildrenProductDescription.
                  appendChild(treeitemProductevent);
              }
              if (evar) {
                treeChildrenProductDescription.
                  appendChild(treeitemProducteVar);
              }

              treeitemProduct.appendChild(treeChildrenProductDescription);
            }
          }
        }
      }
      aTreeChildren.appendChild(treeItem);
    }
  },

  /**
   * This function opens a new window, displaying the
   * list of parameters under a tree container.
   */
  openTree : function() {
    this._logger.debug("Value of the report suite ID in openTree : "
      + watsSidebarSC._reportSuiteID + "\n");

    var reportSuite = Application.storage.get("reportSuiteID", "default");
    // If the window is already opened, we just give it the focus.
    var win = watsUtils.isWindowOpened(this._WATS_CONSTRAINT_WINDOW_TITLE);
    if (win) {
      win.focus();
      return;
    }
    window.openDialog(this._WATS_RULE_TREE_CHROME_URL, '',
      "chrome,titlebar,centerscreen", reportSuite);
  },

  /**
   * This function allows to set the sidebar width.
   */
  setSidebarWidth : function(aWidth) {
    var mainWindow =
      window.QueryInterface(Ci.nsIInterfaceRequestor)
      .getInterface(Ci.nsIWebNavigation)
      .QueryInterface(Ci.nsIDocShellTreeItem)
      .rootTreeItem
      .QueryInterface(Ci.nsIInterfaceRequestor)
      .getInterface(Ci.nsIDOMWindow);
    try {
      mainWindow.document.getElementById("sidebar-box").width = aWidth;
    } catch (e) {
    }
  },

  /**
   * This function opens a new window, displaying
   * the content of a given scenario.
   */
  openScenarioTree : function() {

    // If the window is already opened, we just give it the focus.
    var win = watsUtils.isWindowOpened(this._WATS_SCENARIO_WINDOW_TITLE);
    if (win) {
      win.focus();
      return;
    }
    watsScenario.fileSelection();
  },

  /**
   * This function is called when the sidebar is closed, or when the
   * browser itself is closed.
   */
  quit : function () {

    var typeWindow = Application.storage.get("currentType", "default");
    if (typeWindow == "window") {
      this.closeWatsWindow();
      Application.storage.set("currentType", "default");
    } else {
      if (this.isOpened())
        this.toggleSidebar();
    }
  },

  /**
   * This function checks for existing opened wats windows,
   * and close them.
   */
  closeWatsWindow : function() {
    var win = watsUtils.isWindowOpened(this._WATS_SIDEBAR_TITLE);
    if (win) {
      win.focus();
      win.close();
      return;
    }
  },

  /**
   * This function is called at the moment when the file popup
   * is opened.
   */
  fileOnPopupShowing : function() {

    var visualizationMode =
      document.getElementById("watsVisualizationTab").getAttribute("selected");
    if (visualizationMode) {
      document.getElementById("wats-sidebar-toggle-history").disabled = false;
      document.getElementById("wats-sidebar-constraints-menuitem").disabled = false;
      document.getElementById("wats-sidebar-export-menuitem").disabled = false;
      document.getElementById("wats-sidebar-cookies-menuitem").disabled = false;
    } else {
      document.getElementById("wats-sidebar-toggle-history").disabled = true;
      document.getElementById("wats-sidebar-constraints-menuitem").disabled = true;
      document.getElementById("wats-sidebar-export-menuitem").disabled = true;
      document.getElementById("wats-sidebar-cookies-menuitem").disabled = true;
    }
  },

  /**
   * This function is called at the moment when the constraints popup
   * is opened.
   */
  constraintsOnPopupShowing : function () {
    var visualizationMode =
      document.getElementById("watsVisualizationTab").getAttribute("selected");
    if (visualizationMode) {
      document.getElementById("wats-sidebar-constraints-menuitem")
        .disabled = false;
    } else {
      document.getElementById("wats-sidebar-constraints-menuitem")
        .disabled = true;
    }
  },

  /**
   * This function is called at the moment when the scenarios popup
   * is opened.
   */
  scenariosOnPopupShowing : function() {
    var visualizationMode =
      document.getElementById("watsVisualizationTab").getAttribute("selected");
    if (visualizationMode) {
      document.getElementById("wats-sidebar-scenario-menuitem")
        .disabled = false;
    } else {
      document.getElementById("wats-sidebar-scenario-menuitem")
        .disabled = true;
    }
  },

  /**
   * This function opens the preferences screen.
   */
  openPreferences : function() {
    window.openDialog(this._WATS_OPTIONS_CHROME_URL,
      'Preferences',
      "titlebar,centerscreen,resizable=yes,width=340,height=240");
  },

  /**
   * This function opens the cookies dialog.
   */
  openCookiesDialog : function () {
    window.openDialog(this._WATS_COOKIES_CHROME_URL,
      'Cookies',
      "titlebar,centerscreen,resizable=yes,width=670, height=390");
  },

  /**
   * This function when the sidebar is closed.
   */
  uninit : function () {
    var typeWindow = Application.storage.get("currentType", "default");
    if (typeWindow == "window") {
      this.closeWatsWindow();
    }
  }
};
