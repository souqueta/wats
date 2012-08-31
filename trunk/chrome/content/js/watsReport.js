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

var watsReport = {

  _currentCommand : null,

  /**
   * This function appends a message to the already existing queue
   * of messages constituing the report file.
   */
  appendErrorMessageToReport : function (aMessage, aReportSuiteID) {
    var reportFile = watsUtils.getReportFolder();
    var reportFileName = aReportSuiteID + ".html";
    reportFile.append(reportFileName);

    watsUtils.writeInFile(aMessage, reportFile.path, true);
  },

  /**
   * This function deletes the report file corresponding to the
   * specified report suite ID.
   * @param aReportSuiteID {String} the report suite ID referencing the
   * report file.
   */
  removeReportFile : function (aReportSuiteID) {
    var reportFile = watsUtils.getReportFolder();
    var reportFileName = aReportSuiteID + ".txt";
    reportFile.append(reportFileName);

    if (reportFile.exists()) {
      reportFile.remove(true);
    }
  },

  /**
   * This function sets the flag to indicate
   * if we create reports or not on validation.
   */
  set reportMode (aValue) {
    var prefs =
      Cc["@mozilla.org/preferences-service;1"]
        .getService(Ci.nsIPrefService).getBranch("extensions.wats");

    prefs.setBoolPref("report", aValue);
  },

  /**
   * This function gets the flag to know if reports
   * have to be created while running scenarios.
   */
  get reportMode () {
    var prefs =
      Cc["@mozilla.org/preferences-service;1"]
        .getService(Ci.nsIPrefService).getBranch("extensions.wats");
    var value = null;

    try {
      value = prefs.getBoolPref("report");
    } catch (e) {
      // The preference is set to false by default.
      prefs.setBoolPref("report", false);
      value = false;
    }
    return value;
  },

  /**
   * This function sets the command from which our report is associated to.
   */
  set currentCommand (aValue) {
    this._currentCommand = aValue
  },

  /**
   * This function gets the command our report is associated to.
   */
  get currentCommand () {
    return this._currentCommand;
  }

}