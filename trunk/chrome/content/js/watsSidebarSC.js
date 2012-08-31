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


var watsSidebarSC = {

  /* The site catalyst variables.*/
  _namespace : null,
  _charset : null,
  _pageName : null,
  _server : null,
  _channel : null,
  _url : null,
  _referrer : null,
  _products : null,
  _events : null,
  _campaign: null,
  _codeVersion : null,
  _reportSuiteID : null,
  _partyCookie : null,
  _linkType : null,
  _linkURL : null,
  _linkName : null,
  _linkVideoDetails : null,
  _datacenter : null,
  _pageType : null,
  _currencyCode : null,

  _currentLocation : null,


  /**
   * This function parses a SiteCatalyst URL
   * and returns the needed parameters in a structure.
   * @param {aURL} String the SiteCatalyst URL.
   */
  parseURL : function(aURL) {
    watsSidebar._logger.trace("parseURL : " + aURL);

    aURL = decodeURI(aURL);
    var siteContentTreeChildren = document.getElementById("siteContent");
    var trafficVariablesTreeChildren =
      document.getElementById("trafficVariables");
    var generalTreeChildren = document.getElementById("general");
    var conversionVariablesTreeChildren =
      document.getElementById("conversionVariables");
    var testTreeChildren = document.getElementById("test");
    var trafficSourceTreeChildren = document.getElementById("trafficSource");
    //var eventsTreeChildren = document.getElementById("events");

    /* GENERAL variables */
    this._namespace = watsSidebarSC.getParameterValue(aURL, "ns");
    var datacenterMaxIndex = aURL.indexOf(".2o7.net");
    var datacenterMinIndex =
      aURL.substring(0, datacenterMaxIndex).lastIndexOf(".") + 1;
    var datacenter =
      (datacenterMaxIndex > -1) ?
        aURL.substring(datacenterMinIndex, datacenterMaxIndex) : null;
    watsSidebarSC._datacenter = datacenter;
    // Value after /ss/ and before /
    var reportSuiteIDRegExp = new RegExp(/\/ss\/(.*?)\//);
    var reportSuiteIDArray = reportSuiteIDRegExp.exec(aURL);
    if (reportSuiteIDArray) {
      watsSidebarSC._reportSuiteID = reportSuiteIDArray[1];
    }

    Application.storage.set("reportSuiteID", this._reportSuiteID);
    Application.storage.set("nameSpace", this._namespace);
    this._partyCookie =
      (aURL.indexOf("2o7.net") > -1) ?
        "Third Party Cookie" : "First Party Cookie";

    this._currencyCode = watsSidebarSC.getParameterValue(aURL, "cc");
    this._pageType = watsSidebarSC.getParameterValue(aURL, "pageType");
    this._linkType = watsSidebarSC.getParameterValue(aURL, "pe");

    if (this._linkType != "") {
      this._linkType =
        this._linkType.charAt(this._linkType.length -1);
      if (this._linkType == "o") {
        this._linkType = "Custom Link";
      } else if (this._linkType == "d") {
        this._linkType = "Download";
      } else if (this._linkType == "e") {
        this._linkType = "Exit Link";
      }
      this._linkURL = watsSidebarSC.getParameterValue(aURL, "pev1");
      this._linkName = watsSidebarSC.getParameterValue(aURL, "pev2");
      this._linkVideoDetails = watsSidebarSC.getParameterValue(aURL, "pev3");
    } // TODO: write the case statement

    /* SITE CONTENT variables */
    this._pageName = watsSidebarSC.getParameterValue(aURL, "pageName");
    this._server = watsSidebarSC.getParameterValue(aURL, "server");
    this._channel = watsSidebarSC.getParameterValue(aURL, "ch");

    // Check for existing hierarchy variables.
    for (var k = 0; k < 5 ; k++) {
      var parameterName = "h" + k;
      var parameterValue = watsSidebarSC.getParameterValue (aURL, parameterName);
      watsSidebar.addTreeItem(
        siteContentTreeChildren, parameterName, parameterName, parameterValue);
    }

    /* TEST variables */
    this._charset = watsSidebarSC.getParameterValue(aURL, "qe");
    this._url = watsSidebarSC.getParameterValue(aURL, "g");
    Application.storage.set("hostURL", this._url);

    var codeVersionRegExp = new RegExp(/\/ss\/(.*?)\/(.*?)\/(.*?)\//);
    var codeVersionArray = codeVersionRegExp.exec(aURL);
    this._codeVersion = codeVersionArray[3];

    /* TRAFFIC VARIABLES */
    // Check for the existing prop variables.
    for (var i = 0; i < 50 ; i++) {
      var parameterName = "c" + i;
      var parameterValue = watsSidebarSC.getParameterValue (aURL, parameterName);
      watsSidebar.addTreeItem(
        trafficVariablesTreeChildren, parameterName,
          parameterName, parameterValue);
    }

    /* CONVERSION variables */
    // Check for the existing conversion variables.
    for (var j = 0; j < 50 ; j++) {
      var parameterName = "v" + j;
      var parameterValue = watsSidebarSC.getParameterValue (aURL, parameterName);
      if (parameterName == "v0") {
        var campaignLabel = null;

        var currentType = Application.storage.get("currentType", "default");
        if (currentType == "window") {
          campaignLabel = document.getElementById("wats-sidebar-campaign-value");
        } else {
          campaignLabel =
            watsUtils.getMainWindow().document.getElementById("sidebar").
            contentWindow.document.getElementById("wats-sidebar-campaign-value");
        }

        if (parameterValue != null && parameterValue != "") {
          var newLabel = "Campaign: " + parameterValue;
          if (campaignLabel) {
            campaignLabel.setAttribute("value", newLabel);
            campaignLabel.setAttribute("hidden", false);
          }
        } else {
          if (campaignLabel) {
            campaignLabel.setAttribute("hidden", true);
          }
        }
        watsSidebar.addTreeItem(trafficSourceTreeChildren, parameterName,
                                parameterName, parameterValue);
      } else {
        // the conversion variable has a value, so we add it to the tree.
        watsSidebar.addTreeItem(conversionVariablesTreeChildren, parameterName,
                                parameterName, parameterValue);
      }
    }
    this._products = watsSidebarSC.getParameterValue(aURL, "products");
    this._events = watsSidebarSC.getParameterValue(aURL, "events");
    var eventsArray = this._events.split(",");
    this._events =
      watsSidebar.replaceEventsDescriptions(this._events);
    //dump("new value of this.events : " + this.events + "\n");
    /*for (var l = 0 ; l < eventsArray.length ; l++){
      //@@TODO
      watsSidebar.addTreeItem(
      eventsTreeChildren, eventsArray[i], eventsArray[i], "");
    }*/

    /* TRAFFIC SOURCE variables */
    //this.campaign = watsSidebar.getParameterValue(aURL, "vO");
    this._referrer = watsSidebarSC.getParameterValue(aURL, "r");

    /* COOKIES variable */
    var host = watsUtils.getDomain(this._url);
    var schost = watsUtils.getDomain(aURL);

    Application.storage.set("host", host);
    Application.storage.set("schost", schost);

    /* SITE CONTENT tree items */
    watsSidebar.addTreeItem(
      siteContentTreeChildren, "channel", "Channel", this._channel);
    watsSidebar.addTreeItem(
      siteContentTreeChildren, "pagename", "Pagename", this._pageName);
    watsSidebar.addTreeItem(
      generalTreeChildren, "pagetype", "PageType", this._pageType);
    watsSidebar.addTreeItem(
      siteContentTreeChildren, "server", "Server", this._server);
    watsSidebar.addTreeItem(siteContentTreeChildren, "url", "URL", this._url);


    /* GENERAL tree items */
    watsSidebar.addTreeItem(
      generalTreeChildren, "currencycode", "Currency", this._currencyCode);
    watsSidebar.addTreeItem(
      generalTreeChildren, "datacenter", "Datacenter", this._datacenter);
    watsSidebar.addTreeItem(
        generalTreeChildren, "linktype", "Link Type", this._linkType);
    watsSidebar.addTreeItem(
        generalTreeChildren, "linkurl", "Link URL", this._linkURL);
    watsSidebar.addTreeItem(
        generalTreeChildren, "linkname", "Link Name", this._linkName);
    watsSidebar.addTreeItem(
        generalTreeChildren, "linkvideo", "Link Video", this._linkVideoDetails);
    watsSidebar.addTreeItem(
      generalTreeChildren, "namespace", "Namespace", this._namespace);
    watsSidebar.addTreeItem(
      generalTreeChildren, "partyCookie", "PartyCookie",
        this._partyCookie);
    watsSidebar.addTreeItem(
      generalTreeChildren, "reportSuiteId", "ReportSuiteID",
        this._reportSuiteID);

    /* CONVERSION tree items */
    watsSidebar.addTreeItem(
      conversionVariablesTreeChildren, "products", "Products",
        this._products)
    watsSidebar.addTreeItem(
      conversionVariablesTreeChildren, "events", "Events", this._events);

    /* TEST tree item */
    watsSidebar.addTreeItem(
      testTreeChildren, "codeVersions", "Code versions",
        this._codeVersion);
    watsSidebar.addTreeItem(
      testTreeChildren, "charset", "Char set", this._charset);
    watsSidebar.addTreeItem(testTreeChildren, "url", "URL", this._url);

    /* TRAFFIC SOURCE tree items */
    watsSidebar.addTreeItem(
      trafficSourceTreeChildren, "referrer", "Referrer", this._referrer);

    // If after adding all of our elements, some of the categories
    // happen to be empty, we then hide them.
    this.hideEmptyCategories();
  },

  /**
   * This function checks if the categories within the main sidebar
   * tree have children or not. If not, we hide the category.
   */
  hideEmptyCategories : function () {
    var siteContentTreeChildren = document.getElementById("siteContent");
    var trafficVariablesTreeChildren =
      document.getElementById("trafficVariables");
    var generalTreeChildren = document.getElementById("general");
    var conversionVariablesTreeChildren =
      document.getElementById("conversionVariables");
    var testTreeChildren = document.getElementById("test");
    var trafficSourceTreeChildren = document.getElementById("trafficSource");
    var treeChildrenArray = [];

    treeChildrenArray.push(siteContentTreeChildren);
    treeChildrenArray.push(trafficVariablesTreeChildren);
    treeChildrenArray.push(generalTreeChildren);
    treeChildrenArray.push(conversionVariablesTreeChildren);
    treeChildrenArray.push(testTreeChildren);
    treeChildrenArray.push(trafficSourceTreeChildren);

    for (var i = 0 ; i < treeChildrenArray.length ; i++) {
      if (treeChildrenArray[i].firstChild == null) {
        treeChildrenArray[i].parentNode.hidden = true;
      } else {
        treeChildrenArray[i].parentNode.hidden = false;
      }
    }
  },

  /**
   * This function inspects all http requests, and checks
   * if these are site catalyst requests.
   */
  observeSiteCatalystRequests : function (aSubject, aTopic, aData) {
    // Called just before an HTTP Request is sent
    if (aTopic == 'http-on-modify-request') {
      if (typeof Components == 'undefined'
          || watsUtils.getMainWindow() == null) {
        return;
      }

      aSubject.QueryInterface(Ci.nsIHttpChannel);
      var url = aSubject.URI.spec;
      var myRe = new RegExp("/*\/ss\/*/");
      var reportSuiteID = null;
      if (myRe.test(url)) {

        // We make sure that the proper tab and tabpanels are selected.
        document.getElementById("watsTabPanels").
          setAttribute("selectedIndex", "1");
        document.getElementById("watsVisualizationTab").
          setAttribute("selected", "true");
        document.getElementById("watsVisualizationTab").
          disabled = false;
        document.getElementById("watsMainTab").
          disabled = true;
        document.getElementById("wats-sidebar-constraints-menuitem")
          .disabled = false;
        document.getElementById("wats-sidebar-cookies-menuitem")
          .disabled = false;
        document.getElementById("wats-sidebar-toggle-history")
          .disabled = false;
        document.getElementById("wats-sidebar-export-menuitem")
          .disabled = false;
        document.getElementById("wats-sidebar-scenario-menuitem")
          .disabled = false;

        try {
          watsSidebar.initializeVisualizationTree();
          watsSidebarSC.parseURL(url);
          watsSidebarSC.replaceReferrals();

          reportSuiteID =
            Application.storage.get("reportSuiteID", "default");
          watsSidebar.checkForAlreadyDefinedDescriptions(reportSuiteID);
          watsSidebarSC.validateParametersValues(reportSuiteID);
          watsSidebarHistory.addURLToHistory(url);
        } catch (e) {
          //@@TODO
        }
        Application.storage.set("SiteCatalystURL", url);
      } else {
        this._currentLocation =
          watsUtils.getMainWindow().gBrowser.selectedTab.linkedPanel;
        if (watsSidebar.getTabIdForHttpChannel(aSubject)
              == this._currentLocation) {
          // Then do nothing
        } else {
          if (watsSidebar.getTabIdForHttpChannel(aSubject) != null
             && this._currentLocation != null
             && watsUtils.getMainWindow().gBrowser.selectedTab.linkedPanel
             != this._currentLocation) {
            this._currentLocation = null;
            document.getElementById("watsTabPanels").
              setAttribute("selectedIndex", "0");
            // We make sure that the proper tab and tabpanels are selected.
            document.getElementById("watsVisualizationTab").
              setAttribute("selected", "false");
            document.getElementById("watsVisualizationTab").
              disabled = true;
            document.getElementById("watsMainTab").
              setAttribute("selected", "true");
            document.getElementById("watsMainTab").
              disabled = false;
            document.getElementById("wats-sidebar-constraints-menuitem")
             .disabled = true;
            document.getElementById("wats-sidebar-cookies-menuitem")
             .disabled = true;
            document.getElementById("wats-sidebar-toggle-history")
             .disabled = true;
            document.getElementById("wats-sidebar-export-menuitem")
             .disabled = true;
            document.getElementById("wats-sidebar-scenario-menuitem")
              .disabled = true;
            watsSidebar.initializeVisualizationTree();
          }
        }
      }
    } else if (aTopic == "quit-application-requested") {
      // When the browser is closed, we close our windows.
      try {
        watsSidebar.closeWatsWindow();
      } catch (e) {
        //@@TODO: handle watsSidebar case (sometimes undefined).
      }
    }
  },

  /**
   * This function navigates through the elements of the sidebar,
   * looking for a "D=" item. We then replace this item value
   * by the value referenced by this value.
   */
  replaceReferrals : function () {
    var openedContainerIds = watsSidebar.openAllTreeContainers();

    var tree = document.getElementById("watsSidebarTree");
    for (var i = 0; i < tree.view.rowCount; i++) {
      var value =
        tree.view.getCellText(i, tree.columns.getNamedColumn('value'));
      var id =
        tree.view.getCellValue(i, tree.columns.getNamedColumn('prop'));
      if (value.indexOf("D=") != -1) {
        var referral = value.substring(2, value.length).toLowerCase();
        if (referral == "vi") {
          //@@TODO: the first time we open the browser, watsSidebar value is
          // not correctly replaced.
          tree.view.setCellText(i,
            tree.columns.getNamedColumn('value'), "Visitor ID");
        } else {
          var typeWindow = Application.storage.get("currentType", "default");
          var sidebarElement = null;
          if (typeWindow == "window") {
            sidebarElement = document.getElementById(referral);
          } else {
            sidebarElement =
              watsUtils.getMainWindow().document.getElementById("sidebar").
                contentWindow.document.getElementById(referral);
          }

          if (sidebarElement != null) {
            var sidebarElementLabel =
              sidebarElement.nextSibling.getAttribute("label");
            tree.view.setCellText(i,
              tree.columns.getNamedColumn('value'), sidebarElementLabel);
          } else {
            // we hide the field because the referral doesn't have
            // any value (is actually not displayed in the sidebar)
            var typeWindow = Application.storage.get("currentType", "default");
            var currentElement = null;
            if (typeWindow == "window") {
              currentElement = document.getElementById(id);
            } else {
              currentElement =
                watsUtils.getMainWindow().document.getElementById("sidebar").
                  contentWindow.document.getElementById(id);
            }
            var treeitem = currentElement.parentNode.parentNode;
            //dump('node to remove : ' + treeitem.nodeName + " "
            // + value + " " + id + "\n");
            //dump('parent of the treeitem : ' +
            // treeitem.parentNode.nodeName + "\n");
            //@@TODO: there i a bug here. If I uncomment the code hidin the
            // treeitem, I obtain some strange side effects.
            /* TO INVESTIGATE - the s_code seems to set variables values a
            posteriori we remove some nodes. If we dont remove the nodes in 
            our tree, these values don't appear. */
            treeitem.parentNode.removeChild(treeitem);
            treeitem.setAttribute("collapsed", true);
            treeitem.hidden = true;
          }
        }
      }
    }
    watsSidebar.closeNeededTreeContainers(openedContainerIds);
  },

  /**
   * This function validates SC parameters against the constraints
   * defined in the constraint file.
   */
  validateParametersValues : function (aReportSuiteID, isDifferentWindow) {
    var constraintFile = watsUtils.getConstraintsFolder();
    var xmlFilename =  aReportSuiteID + ".xml";

    constraintFile.append(xmlFilename);
    // If the constraints file exists, we load its
    // values in the rules tree.
    if (constraintFile.exists()) {

      var doc = watsUtils.readXMLDocument(constraintFile.path);
      var elements = doc.getElementsByTagName('constraint');
      var result = true;
      var errorMessage = "";
      var pageTitle = "Page : " + this._pageName + "<br> <br>";
      watsReport.appendErrorMessageToReport(pageTitle, aReportSuiteID);

      for (var i = 0 ; i < elements.length ; i++) {
        var d = elements[i].getAttribute("d");
        var id = elements[i].getAttribute("id");
        var type = elements[i].getAttribute("t");
        var rule = elements[i].getAttribute("r");
        var isValid = true;

        var field = (d == "") ? id : d;

        var typeWindow = Application.storage.get("currentType", "default");
        var sidebarElement = null;
        if (typeWindow == "window") {
          if (isDifferentWindow) {
            sidebarElement = window.opener.document.getElementById(id);
          } else {
            sidebarElement = document.getElementById(id);
          }
        } else {
          sidebarElement =
            watsUtils.getMainWindow().document.getElementById("sidebar").
              contentWindow.document.getElementById(id);
        }
        if ((sidebarElement != null) && (type != "") && rule != "") {
          var sidebarElementLabel = null;
          if (sidebarElement.nextSibling.nodeName != "#text") {
            sidebarElementLabel =
              sidebarElement.nextSibling.getAttribute("label");
          } else {
            sidebarElementLabel =
              sidebarElement.nextSibling.wholeText;
          }

          if (type == "specific") {
            if (sidebarElementLabel != rule) {
              isValid = false;

              errorMessage = "<b>" + watsUtils.getDate()
                + watsUtils.getTime() + " </b>"
                + " <FONT COLOR='red'> [ERROR] </FONT>" +
                "Specific rule not followed on : " + field +
                " -- <b> Expected </b> : " + rule + " -- <b> Current </b> : "
                + sidebarElementLabel;
            }
          } else if (type == "regexp") {
            var regexp = new RegExp(rule);
            if (!regexp.test(sidebarElementLabel)) {
              isValid = false;

              errorMessage = "<b>" + watsUtils.getDate()
                + watsUtils.getTime() + " </b>"
                + " <FONT COLOR='red'> [ERROR] </FONT>" +
                "RegExp rule not followed on : " + field +
                " -- <b> Expected </b> : " + rule + " -- <b> Current </b> : "
                + sidebarElementLabel;
            }
          } else if (type == "interval") {
            var leftInterval = parseInt(rule.split("...")[0]);
            var rightInterval = parseInt(rule.split("...")[1]);
            if (! ( (leftInterval <= parseInt(sidebarElementLabel)) &&
                 ( parseInt(sidebarElementLabel) <= rightInterval) )) {
              isValid = false;

              errorMessage = "<b>" + watsUtils.getDate()
                + watsUtils.getTime() + " </b>"
                + " <FONT COLOR='red'> [ERROR] </FONT>" +
                + "Interval rule not followed on : "
                + field + " --  <b> Expected </b> : [" +
                leftInterval + "..." + rightInterval + "]" +
                " --  <b> Current </b> : " + sidebarElementLabel;
            }
          } else if (type == "doubleinterval") {
            var leftInterval = parseFloat(rule.split("...")[0]);
            var rightInterval = parseFloat(rule.split("...")[1]);
            if (! ( (leftInterval <= parseFloat(sidebarElementLabel)) &&
                 ( parseFloat(sidebarElementLabel) <= rightInterval) )) {
              isValid = false;

              errorMessage = "<b>" + watsUtils.getDate()
                + watsUtils.getTime() + " </b>"
                + " <FONT COLOR='red'> [ERROR] </FONT>" +
                "Interval float rule not followed on : " + field +
                " -- <b> Expected </b> : [" +
                leftInterval + "..." + rightInterval + "]" +
                " -- <b> Current </b> : " + sidebarElementLabel;
            }
          } else if (type =="list") {
            var containsElement = rule.indexOf(sidebarElementLabel);
            if (containsElement == -1) {
              isValid = false;
              errorMessage = "<b>" + watsUtils.getDate()
                + watsUtils.getTime() + "</b>"
                + " <FONT COLOR='red'> [ERROR] </FONT>" +
                "List rule not followed on : " + field;
            }
          }
          if (!isValid) {
            result = false;
            sidebarElement.parentNode.
              setAttribute('properties', 'statusredmoz');
            errorMessage = errorMessage + "<br>";
            // if the report mode is on, I append a new entry in
            // my report file
            /*if (watsReport && watsReport.reportMode) {
              var command =
                Application.storage.get("currentCommand", "default");
              var target =
                Application.storage.get("currentTarget", "default");
              var value =
                Application.storage.get("currentValue", "default");

              if (command != "default" || target != "default"
                  || value != "default") {
                errorMessage =  errorMessage + " -----> "  +
                  "Command: " + command + " -- Target: " + target
                  + " -- Value: " + value;
              }*/

              watsReport.appendErrorMessageToReport(
                errorMessage, aReportSuiteID);

            //}
          } else {
            // the element doesn't have any constraint on
            // we remove the potential existing styles.
            if (sidebarElement) {
              sidebarElement.parentNode.setAttribute('properties', null);
            }
          }
        } else {
          if (sidebarElement) {
            sidebarElement.parentNode.setAttribute('properties', null);
          } else {
            if (type != "" && rule != "") {
              errorMessage = "<b>" + watsUtils.getDate()
                + watsUtils.getTime() + " </b>"
                + " <FONT COLOR='grey'> [WARNING] </FONT>" +
                "The following variable" +
                " is not defined : " + field + "<br>";
               watsReport.appendErrorMessageToReport(
                errorMessage, aReportSuiteID);
            }
          }
        }
      }
      if (result) {
        var errorMessage =
          "<br> <FONT COLOR='green'> Everything is ok ! </FONT>" + "<br>";
        watsReport.appendErrorMessageToReport(errorMessage, aReportSuiteID);
      }
      var nextPage = "<br> <br>";
      watsReport.appendErrorMessageToReport(nextPage, aReportSuiteID);
    }
  },

  /**
   * This function is in charge of given a URL and a Parameter name,
   * to return the value of the parameter in this URL.
   * If the value is not found, null is returned.
   * @param aURL {String} the Site Catalyst URL.
   * @param {aParameterName} the name of the parameter.
   */
  getParameterValue : function (aURL, aParameterName) {
    var name = aParameterName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec(aURL);
    if (results == null)
      return "";
    else
      return unescape(results[1]);
  }
}