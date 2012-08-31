var Cc = Components.classes;
var Ci = Components.interfaces;
var Cr = Components.results;
var Ce = Components.Exception;

var watsOptions = {

  _DEFAULT_HISTORY_ITEMS : 10,
  _originalHistoryTextboxValue : null,

  /**
   * Called when the dialog is loaded.
   */
  init : function() {
    var historyTextbox =
      document.getElementById("wats-options-history-scale");
    var prefs =
      Cc["@mozilla.org/preferences-service;1"]
        .getService(Ci.nsIPrefService).getBranch("extensions.wats");
    var prefValue = null;

    try {
      prefValue = prefs.getIntPref("historyItems");
    } catch (e) {
      // we set the textbox number to the default value
      prefValue = this._DEFAULT_HISTORY_ITEMS;
      prefs.setIntPref("historyItems", this._DEFAULT_HISTORY_ITEMS);
    }
    historyTextbox.value = prefValue;
    this._originalHistoryTextboxValue = prefValue;

    var checkbox = document.getElementById("reportsTreeCheckbox");
    checkbox.checked = watsReport.reportMode;
  },

  /**
   * This function is called when pressing ok in the
   * preferences dialog.
   */
  savePreferencesChanges : function() {
    try {
      var historyTextboxValue =
        document.getElementById("wats-options-history-scale").value;
      var prefs =
        Cc["@mozilla.org/preferences-service;1"]
          .getService(Ci.nsIPrefService).getBranch("extensions.wats");

      prefs.setIntPref("historyItems", historyTextboxValue);
      // In case the original value is higher than the new one:
      // We clear the history so the new rules can take effect.
      if (this._originalHistoryTextboxValue > historyTextboxValue) {
        window.opener.watsSidebarHistory.clearAllHistory();
      }
      // @TODO: externalize this code so we don;t need to press
      // the save button to save the checkbox preference status
      var checkbox = document.getElementById("reportsTreeCheckbox");
      if (checkbox) {
        if (checkbox.checked) {
          try {
            watsReport.reportMode = true;
          } catch (e) {
            dump(e);
          }
        } else {
          watsReport.reportMode = false;
          // If we don't want support, we assume that we are not interested
          // into reading the associated files.
          //watsReport.removeReportFile(window.arguments[0]);
        }
      }
    } catch (e) {
      alert ("Error in savePreferencesChange : " + e + "\n");
    }
  }
}