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


var watsUninstall = {

  /* Logger. */
  _logger : null,
  /* Extension manager */
  _extensionManager : null,
  /* The observer service */
  _obsService : null,
  // The extension manager action requested observer topic
  _TOPIC_EM_ACTION_REQUESTED : "em-action-requested",

  /**
   * Initializes the component and enables the service to observe for changes
   * related to uninstallation.
   */
  _init : function() {
    this._logger = watsUtils.getLogger("watsUninstall");
    this._logger.trace("_init");

    this._extensionManager =
      Cc["@mozilla.org/extensions/manager;1"].
        getService(Components.interfaces.nsIExtensionManager);
    this._obsService =
      Cc["@mozilla.org/observer-service;1"].
        getService(Components.interfaces.nsIObserverService);

    this._obsService.addObserver(this, this._TOPIC_EM_ACTION_REQUESTED, false);
  },

  /**
   * Handles actions when WATS is marked/unmarked to be uninstalled from the
   * addon manager.
   */
  _uninstall : function() {
    var watsFolder = watsUtils.getProfileDirectory();
    watsFolder.remove(true);
  },

  /**
   * Observes global topic changes.
   * @param aSubject the object that experienced the change.
   * @param aTopic the topic being observed.
   * @param aData the data relating to the change.
   */
  observe : function(aSubject, aTopic, aData) {

    switch(aTopic) {

      case this._TOPIC_EM_ACTION_REQUESTED:
        aSubject.QueryInterface(Components.interfaces.nsIUpdateItem);
        if ("wats@adversitement.nl" == aSubject.id) {
          switch(aData) {
            case "item-uninstalled":
              this._uninstall();
              break;
          }
        }
        break;
    }
  }
};

window.addEventListener(
  "load", function() { watsUninstall._init(); }, false);