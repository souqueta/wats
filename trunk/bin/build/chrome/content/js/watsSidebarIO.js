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


var watsSidebarIO = {

  /**
   * This function exports all the values of the tree into an HTML file.
   */
  exportTreeValuesToHTML : function() {
    var atree = document.getElementById("watsSidebarTree");
    var exportFolder = watsUtils.getExportFolder();
    var openedContainerIds = watsSidebar.openAllTreeContainers();
    var html = '<table border="1"><tr><th>Variable</th><th>Value</th></tr>';
    var currentType = Application.storage.get('currentType', 'default');
    var win = null;

    exportFolder.append("report.html");

    for (var i = 0; i < atree.view.rowCount ; i++) {
      var value =
        atree.view.getCellText(
          i, atree.columns.getNamedColumn('value'));
      var prop =
        atree.view.getCellText(
          i, atree.columns.getNamedColumn('prop'));
      if (value != "") {
        html += '<tr><td>' + prop + '</td><td>'
          + unescape(value) + '</td></tr>';
      } else {
        html += '<tr bgcolor="#70A100"><td>' + prop
          + '</td><td>' + unescape(value) + '</td></tr>';
      }
    }
    html += '</table>';
    // We write the data into the file with the truncate mode.
    watsUtils.writeInFile(html, exportFolder.path, false);

    watsSidebar.closeNeededTreeContainers(openedContainerIds);
    // We open the HTML file in a new tab.
    if (currentType == "window") {
      win = watsUtils.getBrowserWindow();
    } else {
      win = watsUtils.getMainWindow();
    }
    win.openUILinkIn(exportFolder.path, 'tab');
  },

  /**
   * This function import constraints from the selection of a zip
   * file on the filesystem.
   */
  importConstraints : function() {
    var nsIFilePicker = Ci.nsIFilePicker;

    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Select a destination", nsIFilePicker.modeOpen);
    fp.displayDirectory = watsUtils.getConstraintsFolder();
    fp.appendFilter("Zip Filter", "*.zip");
    var res = fp.show();
    if (res == nsIFilePicker.returnOK) {

      var zip =
        Cc["@mozilla.org/libjar/zip-reader;1"].createInstance(Ci.nsIZipReader);
      zip.open(fp.file);

      var it = zip.findEntries(null);
      while (it.hasMore()) {
        var entry = it.getNext();
        var destFolder = watsUtils.getConstraintsFolder();
        if (!destFolder.exists()) {
          destFolder.create(Ci.nsIFile.DIRECTORY_TYPE, 0644);
        }
        destFolder.append(entry);
        zip.extract(entry, destFolder);
      }
      zip.close();
      alert("Constraints successfully imported!");
    }
  },

  /**
   * This function exports constraints in a zip file on a filesystem.
   */
  exportConstraints : function() {
    var zipWriter =
      Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
    var zipW = new zipWriter();

    var constraintFolder = watsUtils.getConstraintsFolder();
    var constraintFolderEntries = constraintFolder.directoryEntries;
    var zipFile = null;

    var nsIFilePicker = Ci.nsIFilePicker;

    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Select a destination", nsIFilePicker.modeGetFolder);
    fp.displayDirectory = watsUtils.getConstraintsFolder();

    var res = fp.show();
    if (res == nsIFilePicker.returnOK) {
      zipFile = fp.file;

      zipFile.append("constraints.zip");
      // In case the file already exists, we remove it.
      if (zipFile.exists()) {
        zipFile.remove(true);
      }

      while (constraintFolderEntries.hasMoreElements()) {

        var constraintFolderEntry = constraintFolderEntries.getNext();
        constraintFolderEntry.QueryInterface(Ci.nsILocalFile);

        if (constraintFolderEntry.isFile()) {
          zipW.open(zipFile, 0x04 | 0x08 | 0x10);
          try {
            zipW.addEntryFile(
            constraintFolderEntry.leafName,
            Ci.nsIZipWriter.COMPRESSION_DEFAULT, constraintFolderEntry, false);
          } catch (e) {
              dump(e);
            }
          zipW.close();
        }
      }
      alert("Constraints successfully exported in : " + zipFile.path + "\n");
    }
  },

  /**
   * This function import constraints from the selection of a zip
   * file on the filesystem.
   */
  importScenarios : function() {
    var nsIFilePicker = Ci.nsIFilePicker;

    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Select a destination", nsIFilePicker.modeOpen);
    fp.displayDirectory = watsUtils.getScenarioFolder();
    fp.appendFilter("Zip Filter", "*.zip");
    var res = fp.show();
    if (res == nsIFilePicker.returnOK) {

      var zip =
        Cc["@mozilla.org/libjar/zip-reader;1"].createInstance(Ci.nsIZipReader);
      zip.open(fp.file);

      var it = zip.findEntries(null);
      while (it.hasMore()) {
        var entry = it.getNext();
        var destFolder = watsUtils.getScenarioFolder();
        if(!destFolder.exists()) {
          destFolder.create(Ci.nsIFile.DIRECTORY_TYPE, 0644);
        }
        destFolder.append(entry);
        zip.extract(entry, destFolder);
      }
      zip.close();
      alert("Scenarios successfully imported!");
    }
  },

  /**
   * This function exports constraints in a zip file on a filesystem.
   */
  exportScenarios : function() {
    var zipWriter =
      Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
    var zipW = new zipWriter();

    var scenarioFolder = watsUtils.getScenarioFolder();
    var scenarioFolderEntries = scenarioFolder.directoryEntries;
    var zipFile = null;
    
    var nsIFilePicker = Ci.nsIFilePicker;

    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Select a destination", nsIFilePicker.modeGetFolder);
    fp.displayDirectory = watsUtils.getConstraintsFolder();

    var res = fp.show();
    if (res == nsIFilePicker.returnOK) {
      zipFile = fp.file;

      zipFile.append("scenarios.zip");
      // In case the file already exists, we remove it.
      if (zipFile.exists()) {
        zipFile.remove(true);
      }

      while (scenarioFolderEntries.hasMoreElements()) {

        var scenarioFolderEntry = scenarioFolderEntries.getNext();
        scenarioFolderEntry.QueryInterface(Ci.nsILocalFile);

        if (scenarioFolderEntry.isFile()) {
          zipW.open(zipFile, 0x04 | 0x08 | 0x10);
          try {
            zipW.addEntryFile(
              scenarioFolderEntry.leafName,
              Ci.nsIZipWriter.COMPRESSION_DEFAULT, scenarioFolderEntry, false);
          } catch (e) {
              dump(e);
            }
          zipW.close();
        }
      }
      alert("Scenarios successfully exported in : " + zipFile.path + "\n");
    }
  }
}