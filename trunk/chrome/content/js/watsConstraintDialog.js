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


var watsConstraintDialog = {

  _WATS_CONSTRAINT_DIALOG_CHECKBOX_IMAGE_URL :
  "chrome://global/skin/checkbox/cbox-check.gif",

  /**
   * Initialize the watsConstraintDialog object.
   */
  init : function () {
    this._logger = watsUtils.getLogger("watsConstraintsDialog");
    this._logger.trace("init");

    /* Try to load here the constraint value if it exists. */
    var menulist = document.getElementById("watsConstraintMenulist");
    var id = window.arguments[0];
    var reportSuiteID = window.arguments[1];
    var found = watsUtils.isExistingItemConstraint(id, reportSuiteID);

    if (found){
      if (found[0] == "interval") {
        var intervalValuesArray = found[1].split("...");
        menulist.selectedItem = document.getElementById("intervalMenuItem");
        this.createNumericIntervalInterface(false);
        document.getElementById("interval1Textbox").value =
          intervalValuesArray[0];
        document.getElementById("interval2Textbox").value =
          intervalValuesArray[1];
      } else if (found [0] == "doubleinterval") {
        var intervalValuesArray = found[1].split("...");
        menulist.selectedItem = document.getElementById("intervalDoubleMenuItem");
        this.createNumericIntervalInterface(true);
        document.getElementById("interval1Textbox").value =
          intervalValuesArray[0];
        document.getElementById("interval2Textbox").value =
          intervalValuesArray[1];
      } else if (found[0] == "specific") {
        menulist.selectedItem = document.getElementById("specificMenuItem");
        this.createSpecificConstraintInterface();
        document.getElementById("specificConstraintTextbox").value = found[1];
      } else if (found[0] == "list") {
        var listElementsArray = found[1].split(",");
        menulist.selectedItem = document.getElementById("listMenuItem");
        this.createConstraintListInterface();
        for (var i = 0 ; i < listElementsArray.length ; i++) {
          var constraintTextboxId = "constraintTextbox" + (i + 1);
          //dump("value of the constraintTextboxId : " + constraintTextboxId + "\n");
          document.getElementById(constraintTextboxId).value =
            listElementsArray [i];
        }
      } else if (found [0] == "regexp") {
        menulist.selectedItem = document.getElementById("regexpMenuItem");
        this.createRegExpConstraintInterface();
        document.getElementById("regexpConstraintTextbox").value = found[1];
      }
    }
  },

  /**
   * This callback is fired when an item in the menulist is
   * selected. Depending on the selection, we dynamically
   * change the interface of the dialog.
   */
  menuItemSelected : function() {
    this._logger.trace("menuItemSelected");

    var menulist = document.getElementById("watsConstraintMenulist");
    var definitionBox = document.getElementById("watsConstraintDefinition");

    while(definitionBox.hasChildNodes()){
      definitionBox.removeChild(definitionBox.firstChild);
    }

    //dump("the selectedIndex : " + menulist.selectedIndex + "\n");
    switch (menulist.selectedIndex) {
      case 0:
          document.getElementById("watsConstraintDialog")
            .setAttribute('buttondisabledaccept', true);
          watsConstraintDialog.clearInterface();
      case 1:
        document.getElementById("watsConstraintDialog")
          .setAttribute('buttondisabledaccept', false);
        this.createNumericIntervalInterface(false);
        break;
      case 2:
        document.getElementById("watsConstraintDialog")
          .setAttribute('buttondisabledaccept', false);
        this.createNumericIntervalInterface(true);
        break;
      case 3:
        document.getElementById("watsConstraintDialog")
          .setAttribute('buttondisabledaccept', false);
        this.createSpecificConstraintInterface();
        break;
      case 4:
        document.getElementById("watsConstraintDialog")
          .setAttribute('buttondisabledaccept', false);
        this.createConstraintListInterface();
        break;
      case 5:
        document.getElementById("watsConstraintDialog")
          .setAttribute('buttondisabledaccept', false);
        this.createRegExpConstraintInterface();
        break;
      default:
        break;
    }
  },

  /**
   * Appends a UI allowing to define a numeric interval
   * constraint for the current parameter.
   */
  createNumericIntervalInterface : function(isFloat) {
    this._logger.trace("createNumericIntervalInterface");

    var definitionBox =
      document.getElementById("watsConstraintDefinition");
    var hbox = document.createElement("hbox");
    hbox.setAttribute("flex", "1");

    var descr = document.createElement("label");
    descr.setAttribute("value", "Enter left/right numeric interval : ");
    descr.setAttribute("style", "numericIntervalDescrLabel");

    var interval1Textbox = document.createElement("textbox");
    interval1Textbox.setAttribute("type", "number");
    interval1Textbox.setAttribute("id", "interval1Textbox");
    interval1Textbox.setAttribute("class", "numericIntervalTextboxWidth");
    interval1Textbox.setAttribute(
      "onchange", "watsConstraintDialog.intervalTextboxChange(event);");

    var dashLabel = document.createElement("label");
    dashLabel.setAttribute("value", "_");

    var interval2Textbox = document.createElement("textbox");
    interval2Textbox.setAttribute("type", "number");
    interval2Textbox.setAttribute("id", "interval2Textbox");
    interval2Textbox.setAttribute("class", "numericIntervalTextboxWidth");
    interval2Textbox.setAttribute(
      "onchange", "watsConstraintDialog.intervalTextboxChange(event);");

    if (isFloat) {
      interval1Textbox.setAttribute("decimalplaces", 2);
      interval2Textbox.setAttribute("decimalplaces", 2);
    }

    hbox.appendChild(descr);
    hbox.appendChild(interval1Textbox);
    hbox.appendChild(dashLabel);
    hbox.appendChild(interval2Textbox);

    definitionBox.appendChild(hbox);
  },

  /**
   * Appends a UI allowing to set a specific cosntraint for
   * the current parameter.
   */
  createSpecificConstraintInterface : function() {
    this._logger.trace("createSpecificConstraintInterface");

    var definitionBox = document.getElementById("watsConstraintDefinition");
    var hbox = document.createElement("hbox");
    var textbox1 = document.createElement("textbox");
    textbox1.setAttribute("id", "specificConstraintTextbox");
    textbox1.setAttribute("onchange",
      "watsConstraintDialog.specificConstraintTextboxChange();");
    var descrLabel = document.createElement("label");
    descrLabel.setAttribute("value", "Enter the expected value: ");
    descrLabel.setAttribute("class", "specificConstraintDescrLabel");

    hbox.appendChild(descrLabel);
    hbox.appendChild(textbox1);

    definitionBox.appendChild(hbox);
  },

  /**
   * Appends a UI in order to set a regexp constraint for the
   * current parameter.
   */
  createRegExpConstraintInterface : function() {
    this._logger.trace("createRegExpConstraintInterface");

    var definitionBox = document.getElementById("watsConstraintDefinition");
    var hbox = document.createElement("hbox");
    var textbox1 = document.createElement("textbox");
    textbox1.setAttribute("id", "regexpConstraintTextbox");
    var descrLabel = document.createElement("label");
    descrLabel.setAttribute("value", "Enter the regexp constraint: ");
    descrLabel.setAttribute("class", "regexpConstraintDescrLabel");

    hbox.appendChild(descrLabel);
    hbox.appendChild(textbox1);

    definitionBox.appendChild(hbox);
  },

  /**
   * Appends a UI allowing to set a list of accepted values
   * as a constraint for the current parameter.
   */
  createConstraintListInterface : function() {
    this._logger.trace("createConstraintListInterface");

    var definitionBox =
      document.getElementById("watsConstraintDefinition");
    var vbox = document.createElement("vbox");

    var textbox1 = document.createElement("textbox");
    textbox1.setAttribute("flex", "1");
    var textbox2 = document.createElement("textbox");
    textbox2.setAttribute("flex", "1");
    var textbox3 = document.createElement("textbox");
    textbox3.setAttribute("flex", "1");

    var label1 = document.createElement("label");
    label1.setAttribute("value", "Value 1 : ");
    label1.setAttribute("class", "constraintListLabel");
    var label2 = document.createElement("label");
    label2.setAttribute("value", "Value 2 : ");
    label2.setAttribute("class", "constraintListLabel");
    var label3 = document.createElement("label");
    label3.setAttribute("value", "Value 3 : ");
    label3.setAttribute("class", "constraintListLabel");

    var hbox1 = document.createElement("hbox");
    var hbox2 = document.createElement("hbox");
    var hbox3 = document.createElement("hbox");

    hbox1.appendChild(label1);
    hbox1.appendChild(textbox1);

    hbox2.appendChild(label2);
    hbox2.appendChild(textbox2)

    hbox3.appendChild(label3);
    hbox3.appendChild(textbox3);

    textbox1.setAttribute("id", "constraintTextbox1");
    textbox2.setAttribute("id", "constraintTextbox2");
    textbox3.setAttribute("id", "constraintTextbox3");

    vbox.appendChild(hbox1);
    vbox.appendChild(hbox2);
    vbox.appendChild(hbox3);

    definitionBox.appendChild(vbox);
  },

  /**
   * Function called when values in the interval textboxes
   * are changing. If both of the textboxes are filled,
   *  we then activate the OK button.
   */
  intervalTextboxChange : function() {
    this._logger.trace("intervalTextboxChange");

    var interval1Textbox = document.getElementById("interval1Textbox");
    var interval2Textbox = document.getElementById("interval2Textbox");

    if( (interval1Textbox.textLength > 0) && (interval2Textbox.textLength > 0)) {
      // We re-activate the ok button in the dialog.
    } else {
    }
  },

  /**
   * Function called when values in the specific textbox is changing.
   * If the textbox is filled, we activate the OK button.
   */
  specificConstraintTextboxChange : function() {
    this._logger.trace("specificConstraintTextboxChange");

    var textbox = document.getElementById("specificConstraintTextbox");
    if(textbox.textLength > 0) {
      //document.getElementById("watsConstraintDialog").buttondisabledaccept = false;
      // We re-activate the ok button in the dialog.
    } else {
      //document.getElementById("watsConstraintDialog").buttondisabledaccept = true;
    }
  },

  /**
   * Function called when the ok button
   * of the constraint dialog is pressed on.
   */
  onSave : function() {
    this._logger.trace("onSave");

    var menulist = document.getElementById("watsConstraintMenulist");
    var definitionBox = document.getElementById("watsConstraintDefinition");
    var type = null;
    var rule = null;

    switch (menulist.selectedIndex) {
      case 0:
        return;
      case 1:
        // We save the 2 parts of the interval.
        var value1 = document.getElementById("interval1Textbox").value;
        var value2 = document.getElementById("interval2Textbox").value;
        type = "interval";
        rule = value1 + "..." + value2;
        break;
      case 2:
        // We save the 2 parts of the interval.
        var value1 = document.getElementById("interval1Textbox").value;
        var value2 = document.getElementById("interval2Textbox").value;
        type = "doubleinterval";
        rule = value1 + "..." + value2;
        break;
      case 3:
        // We save the value entered in the textbox.
        var value1 =
          document.getElementById("specificConstraintTextbox").value;
        type = "specific";
        rule = value1;
        break;
      case 4:
        var value1 = document.getElementById("constraintTextbox1").value;
        var value2 = document.getElementById("constraintTextbox2").value;
        var value3 = document.getElementById("constraintTextbox3").value;
        type = "list";
        rule = value1 + "," + value2 + "," + value3;
        //@@TODO at the moment, only 3 different possible values
        // can be set
        break;
      case 5:
        // We save the value entered in the textbox.
        var value1 =
          document.getElementById("regexpConstraintTextbox").value;
        type = "regexp";
        rule = value1;
        break;
      default:
        break;
    }
    this.writeDataInXML(window.arguments[0], type, rule);
    var atree = window.opener.document.getElementById("rulesTree");
    var aElementId = atree.view.getCellValue(
        atree.currentIndex, atree.columns.getNamedColumn('value'));
    var nodeName = window.opener.document.getElementById(aElementId).
      nextSibling.setAttribute(
        "src", this._WATS_CONSTRAINT_DIALOG_CHECKBOX_IMAGE_URL);
  },

  /**
   * This function writes the type and the rule to
   * apply to a certain parameter, given its id.
   */
  writeDataInXML : function(aId, aType, aRule) {
    this._logger.trace("writeDataInXML");

    var constraintsFile = watsUtils.getConstraintsFolder();
    constraintsFile.append(window.arguments[1]);

    var doc = watsUtils.readXMLDocument(constraintsFile.path);

    var elements = doc.getElementsByTagName('constraint');
    for (var i = 0 ; i < elements.length ; i++) {
      if (elements[i] && elements[i].getAttribute("id") == aId) {
        elements[i].setAttribute("t", aType);
        elements[i].setAttribute("r", aRule);
        watsUtils.saveXMLDocument(doc, constraintsFile);
      }
    }
  }
}