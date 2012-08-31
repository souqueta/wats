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


var watsRuleTree = {

  _WATS_CONSTRAINT_DIALOG_URL :
    "chrome://wats/content/watsConstraintDialog.xul",

  _WATS_RULE_TREE_PENCIL_IMAGE_URL :
    "chrome://wats/skin/images/pencil16px.png",
  _WATS_RULE_TREE_LOCK_IMAGE_URL :
    "chrome://wats/skin/images/lock16px.png",
  _WATS_RULE_TREE_CHECKBOX_IMAGE_URL :
    "chrome://global/skin/checkbox/cbox-check.gif",
  /* The name of the constraint file */
  _constraintFileName : null,
  /* The logger */
  _logger : null,
  /* The current reportSuiteID */
  _reportSuiteID : null,

  /**
   * Function called as soon as the interface is loaded.
   */
  init: function() {
    this._logger = watsUtils.getLogger("watsRuleTree");
    this._logger.trace("init");

    var tree = document.getElementById("rulesTree");
    var currentType = Application.storage.get("currentType", "default");
    var reportSuiteID = null;
    var nameSpace = null;

    reportSuiteID = Application.storage.get("reportSuiteID", "default");
    nameSpace = Application.storage.get("nameSpace", "default");

    if (nameSpace == "") {
      document.getElementById("watsRuleTreeNamespaceDescr")
        .value = "";
    } else {
      document.getElementById("watsRuleTreeNamespace").value =
        nameSpace;
    }
    document.getElementById("watsRuleTreeReportSuite").value =
      reportSuiteID;
    this._constraintFileName = reportSuiteID + ".xml";
    this.checkForAlreadyDefinedConstraints();
  },

  /**
   * This function checks that a constraint has been or not
   * already defined or not for this Site Catalyst request.
   */
  checkForAlreadyDefinedConstraints : function() {

    this._logger.trace("checkForAlreadyDefinedConstraints");

    // TODO: define an unique way to indentify a file.
    var constraintFile = watsUtils.getConstraintsFolder();
    constraintFile.append(this._constraintFileName);
    // If the constraints file exists, we load its
    // values in the rules tree.
    if (constraintFile.exists()) {
      this._logger.debug("constraint file already exists! \n");
      try {
        var doc = watsUtils.readXMLDocument(constraintFile.path);
        this.populateTreeFromDocument(doc);
      } catch (e) {
        this._logger.error("Error trying to populate the tree : " + e + "\n");
      }
    }
  },

  /**
   * This function checks if the value of the cell changed from the original
   * XML file value. If this is the case, we write the new value in the XML file.
   * TODO: improve the performance of this function.
   * TODO: add a listener for keypress events on cells.
   */
  checkForChanges : function(event) {

    this._logger.trace("checkForChanges");

    var currentType = Application.storage.get("currentType", "default");

    // The new path is depending on the URL we are running on.
    var newPath = watsUtils.getConstraintsFolder();
    newPath.append(this._constraintFileName);

    var doc = watsUtils.readXMLDocument(newPath.path);
    var atree = document.getElementById("rulesTree");

    for (var j = 0; j < atree.view.rowCount; j++) {
      var value =
        atree.view.getCellText(j, atree.columns.getNamedColumn('value'));
      var id =
        atree.view.getCellValue(j, atree.columns.getNamedColumn('value'));

      var elements = doc.getElementsByTagName('constraint');
      for (var i = 0 ; i < elements.length ; i++) {
        if (elements[i] &&
            elements[i].getAttribute("id") == id &&
            elements[i].getAttribute("d") != value) {
              elements[i].setAttribute("d", value);
              watsUtils.saveXMLDocument(doc, newPath);
        }
      }
    }
    window.opener.watsSidebar.
      checkForAlreadyDefinedDescriptions(window.arguments[0], true);
    watsSidebarSC.validateParametersValues(window.arguments[0], true);
  },

  /** This function detects the kind of element the popup
   * is activated on. Depending on if the element has a constraint or
   * not, we adjust the associated context menu accordingly.
   */
  onPopUpShowing : function () {
    var tree = document.getElementById("rulesTree");
    var id =
      tree.view.getCellValue(
        tree.currentIndex, tree.columns.getNamedColumn('value'));
    var isExistingConstraint =
    watsUtils.isExistingItemConstraint(id, this._constraintFileName);

    if (isExistingConstraint != ',') {
      document.getElementById("openContraintMenuItem")
        .setAttribute("label", "Edit constraint for this item");
      document.getElementById("removeConstraintMenuItem")
        .setAttribute("disabled", false);
    } else {
      document.getElementById("openContraintMenuItem")
        .setAttribute("label", "Set constraint for this item");
      document.getElementById("removeConstraintMenuItem")
        .setAttribute("disabled", true);
    }
  },

  /**
   * This function adds an element in the tree, knowing the
   * command, the target and the value of the selenese tags.
   */
  addTreeItem : function (
    aTreeChildren, aTreeCell1Id, aProperty, aValue, isClassified) {

    var tree = document.getElementById("rulesTree");
    var treeItem = document.createElement("treeitem");
    var treeRow = document.createElement("treerow");

    var treeCell1 = document.createElement("treecell");
    var treeCell2 = document.createElement("treecell");
    var treeCellConstraint = document.createElement("treecell");

    treeCell1.setAttribute("label", aProperty);
    treeCell1.setAttribute("editable", false);
    treeCell1.setAttribute("properties", "variable");

    treeCell2.setAttribute("label", aValue);
    treeCell2.setAttribute("id", aTreeCell1Id);
    treeCell2.setAttribute("value", aTreeCell1Id);

    treeCellConstraint.setAttribute("editable", false);

    treeRow.appendChild(treeCell1);
    treeRow.appendChild(treeCell2);
    treeRow.appendChild(treeCellConstraint);

    var isContraint =
      watsUtils.isExistingItemConstraint(
        aTreeCell1Id, this._constraintFileName);

    if (isClassified) {
      treeCell2.setAttribute(
        "src", this._WATS_RULE_TREE_PENCIL_IMAGE_URL);
    } else {
      treeCell2.setAttribute("editable", false);
      treeCell2.setAttribute(
        "src", this._WATS_RULE_TREE_LOCK_IMAGE_URL);
    }

    if (isContraint[0] != "") {
      treeCellConstraint.setAttribute(
        "src", this._WATS_RULE_TREE_CHECKBOX_IMAGE_URL);
    } else {
      treeCellConstraint.setAttribute(
        "src", "");
    }

    treeItem.appendChild(treeRow);

    aTreeChildren.appendChild(treeItem);
  },


  /**
   * This function reads in an XML document, and populate the tree
   * up to the entries found in this file.
   * @param aXMLDocument The XML DOM document.
   */
  populateTreeFromDocument : function (aXMLDocument) {

    this._logger.trace("populateTreeFromDocument");

    var atree = document.getElementById("rulesTree");
    /* Variables corresponding to reechildren to populate. */
    var siteContentTreeChildren = document.getElementById("siteContent");
    var trafficVariablesTreeChildren =
      document.getElementById("trafficVariables");
    var generalTreeChildren = document.getElementById("general");
    var conversionVariablesTreeChildren =
      document.getElementById("conversionVariables");
    var testTreeChildren = document.getElementById("test");
    var trafficSourceTreeChildren = document.getElementById("trafficSource");
    var eventsTreeChildren = document.getElementById("events");

    var elements = aXMLDocument.getElementsByTagName('constraint');
    for (var i = 0 ; i < elements.length ; i++) {
      if (elements[i]) {
        var group = elements[i].getAttribute("group");
        var id = elements[i].getAttribute("id");
        var prop = elements[i].getAttribute("prop");
        var descr = elements[i].getAttribute("d");
        var classified = elements[i].getAttribute("classified");

        if (group == "general") {
          this.addTreeItem(
            generalTreeChildren, id, prop, descr, classified);
        } else if (group == "siteContent") {
          this.addTreeItem(
            siteContentTreeChildren, id, prop, descr, classified);
        } else if (group == "conversion") {
          this.addTreeItem(
            conversionVariablesTreeChildren, id, prop, descr, classified);
        } else if (group == "test") {
          this.addTreeItem(testTreeChildren, id, prop, descr, classified);
        } else if (group == "trafficVariable") {
          this.addTreeItem(
            trafficVariablesTreeChildren, id, prop, descr, classified);
        } else if (group == "trafficSource") {
          this.addTreeItem(
            trafficSourceTreeChildren, id, prop, descr, classified);
        } else if (group == "events") {
          this.addTreeItem(
            eventsTreeChildren, id, prop, descr, classified);
        }
      }
    }
  },

  /**
   * This function opens the constraint associated to the
   * selected item in the tree.
   */
  openConstraintDialog : function() {
    this._logger.trace("openConstraintDialog");

    var atree = document.getElementById("rulesTree");
    var id =
      atree.view.getCellValue(
        atree.currentIndex, atree.columns.getNamedColumn('value'));

    // Open the scenario corresponding to the filePath specified.
    window.openDialog(this._WATS_CONSTRAINT_DIALOG_URL, '',
      "chrome,titlebar,centerscreen", id, this._constraintFileName);
  },

  /**
   * This function is charged to remove the constraint associated
   * to a parameter which has a given id.
   * @param {String} the id of the element
   */
  removeConstraint : function() {

    this._logger.trace("removeConstraints");

    var atree = document.getElementById("rulesTree");
    var aElementId =
      atree.view.getCellValue(
        atree.currentIndex, atree.columns.getNamedColumn('value'));
    var path = watsUtils.getConstraintsFolder();
    var doc = null;
    var elements = null;

    document.getElementById(aElementId).nextSibling.
      setAttribute("src", "");
    path.append(this._constraintFileName);
    doc = watsUtils.readXMLDocument(path.path);
    elements = doc.getElementsByTagName('constraint');

    for (var i = 0 ; i < elements.length ; i++) {
      if (elements[i] &&
          elements[i].getAttribute("id") == aElementId) {
        elements[i].setAttribute("t", "");
        elements[i].setAttribute("r", "");
        watsUtils.saveXMLDocument(doc, path);
      }
    }
  },

  /**
   * This function closes the constraint window and
   * makes sure the menu item in the sidebar/window
   * is re-enabled.
   */
  closeWindow : function () {
    window.close();
  }
}
