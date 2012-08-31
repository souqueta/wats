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


var watsOverlay = {

  _logger : null,

  /**
   * Initialization of the wats overlay object.
   */
  init : function() {
    this._logger = watsUtils.getLogger("watsOverlay");
    this._logger.trace("init");
    this._addDefaultToolbarButton();
  },

  /**
   * This function automatically adds a toolbar button in the Firefox toolbar
   * in case this is not already existing.
   */
  _addDefaultToolbarButton : function() {
    this._logger.trace("_addDefaultToolbarButton");

    // Add toolbarButton next to location bar
    var beforeElement = document.getElementById("home-button");
    if (beforeElement && beforeElement.parentNode.getAttribute("currentset").
        indexOf("wats-toolbar-button") == -1) {
      beforeElement.parentNode.insertItem(
        "wats-toolbar-button", beforeElement);
      document.persist("nav-bar", "currentset");
    }
  }

};

window.addEventListener(
  "load", function() { watsOverlay.init(); }, false);
