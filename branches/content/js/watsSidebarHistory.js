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

var watsSidebarHistory = {

  _WATS_SIDEBAR_HISTORY_YELLOW_LINK : "chrome://wats/skin/images/yellow.png",
  _WATS_SIDEBAR_HISTORY_RED_LINK : "chrome://wats/skin/images/red.png",
  _WATS_SIDEBAR_HISTORY_BLACK_LINK : "chrome://wats/skin/images/black.png",

  /**
   * This function serializes the current values loaded in the tree
   * into an xml file. An entry is added into the history tree.
   */
  addURLToHistory : function(aURL) {
    // In case the site catalyst URL is not issued from a previous
    // load of an history item, we add the item to the history.
    if (watsSidebarSC.getParameterValue(aURL, "watsHistory") == "") {

      var backupNumber = watsUtils.getNextBackupNumber();
      var historyTreeChildren = document.getElementById("historyTreeChildren");
      var typeWindow = Application.storage.get("currentType", "default");
      var historyTree = document.getElementById("watsSidebarHistoryTree");

      //@@TODO: review.
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=461905
      this.addHistoryElement(aURL, backupNumber);
    }
  },

  /**
   * This function adds an element to the history tree.
   */
  addHistoryElement : function (aURL, backupNumber) {
    var historyTree = document.getElementById("watsSidebarHistoryTree");
    var historyTreeChildren = document.getElementById("historyTreeChildren");
    var historyTreeItem = document.createElement("treeitem");
    var historyTreeRow = document.createElement("treerow");
    var currentTime = watsUtils.getTime();
    var reportSuiteID = Application.storage.get("reportSuiteID", "default");

    var treeCell1 = document.createElement("treecell");
    var treeCell2 = document.createElement("treecell");
    var treeCell3 = document.createElement("treecell");
    var treeCell4 = document.createElement("treecell");
    var treeCell5 = document.createElement("treecell");

    treeCell1.setAttribute("label",
      reportSuiteID + " - " + watsSidebarSC._pageName);
    treeCell1.setAttribute("id",
      reportSuiteID + " - " + watsSidebarSC._pageName);
    treeCell1.setAttribute("value",
      reportSuiteID + " - " + watsSidebarSC._pageName);
    treeCell1.setAttribute("editable", false);
    treeCell1.setAttribute("properties", "search");

    treeCell2.setAttribute("label", backupNumber);
    treeCell2.setAttribute("id", backupNumber);
    treeCell2.setAttribute("value", backupNumber);

    if (watsSidebarSC._linkType == "Custom Link") {
      treeCell3.setAttribute("src", this._WATS_SIDEBAR_HISTORY_YELLOW_LINK);
      treeCell3.src = this._WATS_SIDEBAR_HISTORY_YELLOW_LINK;
      treeCell3.setAttribute("id", "Custom Link");
      treeCell3.setAttribute("value", "Custom Link");
    } else if (watsSidebarSC._linkType == "Download") {
      treeCell3.setAttribute("src", this._WATS_SIDEBAR_HISTORY_RED_LINK);
      treeCell3.src = this._WATS_SIDEBAR_HISTORY_RED_LINK;
      treeCell3.setAttribute("id", "Download");
      treeCell3.setAttribute("value", "Download");
    } else if (watsSidebarSC._linkType == "Exit Link") {
      treeCell3.setAttribute("src", this._WATS_SIDEBAR_HISTORY_BLACK_LINK);
      treeCell3.src = this._WATS_SIDEBAR_HISTORY_YELLOW_LINK;
      treeCell3.setAttribute("id", "Exit Link");
      treeCell3.setAttribute("value", "Exit Link");
    }
    treeCell3.setAttribute("align", "center");

    treeCell4.setAttribute("label", currentTime);
    treeCell4.setAttribute("value", currentTime);
    treeCell4.setAttribute("editable", false);
    treeCell4.setAttribute("properties", "time");

    treeCell5.setAttribute("label", aURL);
    treeCell5.setAttribute("value", aURL);

    historyTreeRow.appendChild(treeCell4);
    historyTreeRow.appendChild(treeCell1);
    historyTreeRow.appendChild(treeCell2);
    historyTreeRow.appendChild(treeCell3);
    historyTreeRow.appendChild(treeCell5);

    historyTreeItem.appendChild(historyTreeRow);
    historyTreeChildren.appendChild(historyTreeItem);
    historyTree.view.selection.select(historyTree.view.rowCount -1);

    var boxObject = historyTree.boxObject;
    boxObject.QueryInterface(Ci.nsITreeBoxObject);
    boxObject.ensureRowIsVisible(historyTree.view.rowCount -1);

  },

  /**
   * This function is called when the search textbox content is
   * modified. What happens in that case is that history tree s filtered
   * upon this search term.
   */
  filterHistory : function () {
    var searchTextbox =
      document.getElementById("wats-sidebar-history-filter-textbox");
    var searchTextboxValue = searchTextbox.value;
    if (searchTextboxValue != "") {
      var historyTree = document.getElementById("watsSidebarHistoryTree");
      var treeCells = historyTree.getElementsByTagName("treecell");
      for (var i = 0 ; i < treeCells.length ; i++) {
        // go through the history tree and filter out items
        // that don't contains the string
        var treeCell = treeCells[i];
        if (treeCell.getAttribute("properties") == "search" &&
            treeCell.getAttribute("value").indexOf(searchTextboxValue) == -1){
          treeCell.parentNode.parentNode.setAttribute("collapsed", true);
          treeCell.parentNode.parentNode.hidden = true;
        }
      }
    } else {
      // restablish all items to be visible
      var historyTree = document.getElementById("watsSidebarHistoryTree");
      var treeItems = historyTree.getElementsByTagName("treeitem");
      for (var i = 0 ; i < treeItems.length ; i++) {
        // go through the history tree and make all tree items
        // visible
        var treeItem = treeItems[i];
        treeItem.setAttribute("collapsed", false);
        treeItem.hidden = false;
      }
    }
  },

  /**
   * This function is called when a key is pressed within the
   * filter textbox.
   */
  onFilterKeyPress : function (event) {
    // if backspace, we call the filterHistory function.
    if ((event.keyCode == 8)) {
      watsSidebarHistory.filterHistory();
    }
  },

  /**
   * This function removes all elements contained in the history tree.
   * It also removes corresponding files created in this purpose.
   */
  clearAllHistory : function() {
    var tree = document.getElementById("watsSidebarHistoryTree");
    var treeChildren = document.getElementById("historyTreeChildren");

    while(treeChildren.hasChildNodes()){
      treeChildren.removeChild(treeChildren.firstChild);
    }
  },

  /**
   * This function is called when a item is double clicked on
   * within the history tree.
   * In that case, we retrieve the ID and the URL of the element
   * in order to load the data contained in the proper file.
   * This data is directly loaded into the tree.
   */
  loadHistoryItem : function() {
    var atree = document.getElementById("watsSidebarHistoryTree");
    var id =
      atree.view.getCellValue(
        atree.currentIndex, atree.columns.getNamedColumn('history-id'));

    var scurl =
      atree.view.getCellValue(
        atree.currentIndex, atree.columns.getNamedColumn('history-scurl'));

    var req = new XMLHttpRequest();
    // We append a home-made parameter to be able to
    // know that the request comes from the history
    var newURL = scurl + "&watsHistory=true";
    req.open('GET', newURL, false);
    req.send(null);
  }

}
