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
var Cu = Components.utils;

Cu.import("resource://common/log4moz.js");

var watsUtils = {

  _DEFAULT_HISTORY_ITEMS : 10,

  /**
   * This function returns the folder which contains our
   * constraints.
   */
  getConstraintsFolder : function() {
    var folder = this.getProfileDirectory();
    folder.append("xml");

    if (!folder.exists() || !folder.isDirectory()) {
      // read and write permissions to owner and group, read-only for others.
      folder.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
    }

    return folder;
  },

  /**
   * This function returns the folder containing the
   * datasource.xml file.
   */
  getDataSourceFolder : function () {
    var DIR_SERVICE =
      new Components.Constructor(
        "@mozilla.org/file/directory_service;1", "nsIProperties");
    var path = (new DIR_SERVICE()).get("ProfD", Ci.nsIFile);

    path.append("extensions");
    path.append("wats@adversitement.nl");
    path.append("chrome");
    path.append("content");
    path.append("xml");

    return path;
  },

  /**
   * This function returns a pointer on the folder containing
   * HTML files representing SC tree values.
   */
  getExportFolder : function () {
    var DIR_SERVICE =
      new Components.Constructor(
        "@mozilla.org/file/directory_service;1", "nsIProperties");
    var path = (new DIR_SERVICE()).get("ProfD", Ci.nsIFile);

    path.append("extensions");
    path.append("wats@adversitement.nl");
    path.append("chrome");
    path.append("content");
    path.append("html");

    return path;
  },

  /**
   * This function returns the folder which contains
   * history of requests displayed in the sidebar.
   */
  getHistoryFolder : function () {
    var DIR_SERVICE =
      new Components.Constructor(
        "@mozilla.org/file/directory_service;1", "nsIProperties");
    var path = (new DIR_SERVICE()).get("ProfD", Ci.nsIFile);

    path.append("extensions");
    path.append("wats@adversitement.nl");
    path.append("chrome");
    path.append("content");
    path.append("history");

    return path;
  },

  /**
   * This function returns the folder which contains
   * our scenarios.
   */
  getScenarioFolder : function() {
    var folder = this.getProfileDirectory();
    folder.append("scenario");

    if (!folder.exists() || !folder.isDirectory()) {
      // read and write permissions to owner and group, read-only for others.
      folder.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
    }

    return folder;
  },

  /**
   * This function returns the folder which contains
   * our scenarios.
   */
  getReportFolder : function() {
    var DIR_SERVICE =
      new Components.Constructor(
        "@mozilla.org/file/directory_service;1", "nsIProperties");
    var folder = (new DIR_SERVICE()).get("ProfD", Ci.nsIFile);

    folder.append("Wats");
    folder.append("report");
    if (!folder.exists() || !folder.isDirectory()) {
      // read and write permissions to owner and group, read-only for others.
      folder.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
    }

    return folder;
  },

  /**
   * This function reads an XML file specified by the
   * following path.
   * @param aPath {String} The path of the file to read.
   */
  readXMLDocument : function(aPath) {
    // object representing the file to read
    var file =
      Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    file.initWithPath(aPath);

    // init of the stream over this file.
    var stream =
      Cc["@mozilla.org/network/file-input-stream;1"]
        .createInstance(Ci.nsIFileInputStream);
    stream.init(file, -1, -1, Ci.nsIFileInputStream.CLOSE_ON_EOF);

    // creation of a DOM parser
    var parser =
      Cc["@mozilla.org/xmlextras/domparser;1"]
        .createInstance(Ci.nsIDOMParser);

    // generation of the DOM from the stream
    var doc = parser.parseFromStream(stream, null, file.fileSize, "text/xml");
    parser = null;
    stream = null;
    file = null;

    return doc;
  },

  /**
   * This function returns the main window.
   */
  getMainWindow : function() {
    var wm =
      Cc["@mozilla.org/appshell/window-mediator;1"]
        .getService(Ci.nsIWindowMediator);
    var mainWindow = wm.getMostRecentWindow("navigator:browser");

    return mainWindow;
  },

  /**
   * This saves a modified DOMDocument in the XML file
   * specified by the path parameter.
   * @aDomDoc The DOM Document.
   * @aPath The full path of the XML document.
   */
  saveXMLDocument : function(aDomDoc, aPath) {
    var serializer = new XMLSerializer();
    var foStream =
      Cc["@mozilla.org/network/file-output-stream;1"]
        .createInstance(Ci.nsIFileOutputStream);

    // write, create, truncate
    foStream.init(aPath, 0x02 | 0x08 | 0x20, 0664, 0);
    // remember, doc is the DOM tree
    serializer.serializeToStream(aDomDoc, foStream, "");
    foStream.close();
  },

  /**
   * This function checks if the element of a given Id, for the
   * given report suite has an existing contraint or not.
   * @param aId {String} the id of the element to check.
   * @param aReportSuiteId {String} the id of the reportSuite.
   */
  isExistingItemConstraint : function(aId, aReportSuiteId) {

    var found = false;

    // Check if a constraint doesn't already exist for this parameter.
    var constraintsFile = watsUtils.getConstraintsFolder();
    constraintsFile.append(aReportSuiteId);

    var doc = watsUtils.readXMLDocument(constraintsFile.path);

    var elements = doc.getElementsByTagName('constraint');
    for (var i = 0 ; i < elements.length ; i++) {
      if (elements[i] && elements[i].getAttribute("id") == aId) {
        var type = elements[i].getAttribute("t");
        var rule = elements[i].getAttribute("r");
        found = [type, rule];
        // TODO: set the default type in the menu list.
        // the interface should then be dyanmically loaded.
        // Proper values should then appear in the interface.
      }
    }
    return found;
  },

  /**
   * This function initializes the logger.
   */
  initLogger : function () {
    // The basic formatter will output lines like:
    // DATE/TIME  LoggerName LEVEL  (log message)
    let formatter = new Log4Moz.GlaxFormatter();
    let root = Log4Moz.repository.rootLogger;
    let logFile = this.getProfileDirectory();
    let app;

    logFile.append("log.txt");

    // Loggers are hierarchical, lowering this log level will affect all
    // output.
    root.level = Log4Moz.Level["All"];

    // this appender will log to the file system.
    app = new Log4Moz.RotatingFileAppender(logFile, formatter);
    app.level = Log4Moz.Level["Trace"];
    root.addAppender(app);

    // get the observer service.
    this._observerService =
      Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
  },

  /**
   * Gets a logger repository from Log4Moz.
   * @param aName the name of the logger to create.
   * @param aLevel (optional) the logger level.
   * @return the generated logger.
   */
  getLogger : function(aName, aLevel) {

    this.initLogger();
    let logger = Log4Moz.repository.getLogger(aName);
    logger.level = Log4Moz.Level[(aLevel ? aLevel : "All")];

    return logger;
  },

  /**
   * Gets a reference to the directory where the extension will keep its
   * files. The directory is created if it doesn't exist.
   * @return reference (nsIFile) to the extension directory.
   */
  getProfileDirectory : function() {
    // XXX: there's no logging here because the logger initialization depends
    // on this method.

    let directoryService =
      Cc["@mozilla.org/file/directory_service;1"].
        getService(Ci.nsIProperties);
    let profDir = directoryService.get("ProfD", Ci.nsIFile);

    profDir.append("Wats");

    if (!profDir.exists() || !profDir.isDirectory()) {
      // read and write permissions to owner and group, read-only for others.
      profDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
    }

    return profDir;
  },

  /**
   * This function allows to write data in a file.
   * If the file doesn't exist yet, we then create this file.
   * @param aData {String} the data to write in the file.
   * @param aFilePath {String} the file where to write into.
   */
  writeInFile : function (aData, aFilePath, truncate) {

    var file =
      Cc["@mozilla.org/file/local;1"]
        .createInstance(Ci.nsILocalFile);
    var foStream =
      Cc["@mozilla.org/network/file-output-stream;1"]
        .createInstance(Ci.nsIFileOutputStream);
    var encoder =
      Cc["@mozilla.org/layout/documentEncoder;1?type=text/xml"]
        .createInstance(Ci.nsIDocumentEncoder);

    file.initWithPath(aFilePath);
    if (!file.exists()) {
      file.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0666);
    }

    var WRITE_MODE;
    if (!truncate) {
      WRITE_MODE = 0x20;
    } else {
      WRITE_MODE = 0x10;
    }
    foStream.init(file, 0x02 | 0x08 | WRITE_MODE, 0664, 0);

    foStream.write(aData, aData.length);
    foStream.close();
  },

  /**
   * This function writes DOM documents to history files.
   * @@TODO: remove if not used.
   */
  writeHistoryFile : function(aDomDoc, aPath) {
    var file =
      Cc["@mozilla.org/file/local;1"]
        .createInstance(Ci.nsILocalFile);
    var encoder =
      Cc["@mozilla.org/layout/documentEncoder;1?type=text/xml"]
        .createInstance(Ci.nsIDocumentEncoder);
    var stream =
      Cc["@mozilla.org/network/file-output-stream;1"]
        .createInstance(Ci.nsIFileOutputStream);

    file.initWithPath(aPath);

    stream.init(file, -1, -1, 0);

    encoder.init(aDomDoc, "text/xml", 0);
    encoder.setCharset("UTF-8");
    encoder.encodeToStream(stream);
    encoder = null;
    stream = null;
    file = null;
  },

  /**
   * Obtains the number of the next backup file.
   * @return the number of the next backup file.
   */
  getNextBackupNumber : function() {
    var maxFiles = null;
    var logNumber;

    var prefs =
      Cc["@mozilla.org/preferences-service;1"]
        .getService(Ci.nsIPrefService).getBranch("extensions.wats");

    try {
      maxFiles = prefs.getIntPref("historyItems");
    } catch (e) {
      maxFiles = this._DEFAULT_HISTORY_ITEMS;
      prefs.setIntPref("historyItems", this._DEFAULT_HISTORY_ITEMS);
    }

    try {
      logNumber = prefs.getIntPref("history_backup");
      logNumber = (logNumber % maxFiles) + 1;
    } catch (e) {
      logNumber = 1;
    }

    prefs.setIntPref("history_backup", logNumber);

    return logNumber;
  },

  /**
   * This functions returns the maximum amount of items
   * accepted within the history tree.
   */
  getMaxFilesInHistory : function () {
    var maxFiles = null;

    var prefs =
      Cc["@mozilla.org/preferences-service;1"]
        .getService(Ci.nsIPrefService).getBranch("extensions.wats");

    try {
      maxFiles = prefs.getIntPref("historyItems");
    } catch (e) {
      maxFiles = this._DEFAULT_HISTORY_ITEMS;
      prefs.setIntPref("historyItems", this._DEFAULT_HISTORY_ITEMS);
    }

    return maxFiles;
  },

  /** This function allows to read in the file
   * referenced by a file name.
   * @param aFilePath {String} the string corresponding to the file name.
   */
  readInFile : function (aFilePath) {

    var file =
      Cc["@mozilla.org/file/local;1"]
        .createInstance(Ci.nsILocalFile);
    var is =
      Cc["@mozilla.org/network/file-input-stream;1"]
        .createInstance(Ci.nsIFileInputStream);
    var sis =
      Cc["@mozilla.org/scriptableinputstream;1"]
        .createInstance(Ci.nsIScriptableInputStream);
    var output = null;

    file.initWithPath(aFilePath);

    if (!file.exists()) {
      alert("File does not exist");
    }

    is.init(file, 0x01, 00004, null);
    sis.init(is);

    output = sis.read(sis.available());

    return output;
  },

  /**
   * This function returns the time under the string format.
   */
  getTime : function () {
    var d = new Date();

    var curr_hour = d.getHours();
    var curr_min = d.getMinutes();
    var curr_sec = d.getSeconds();

    if (curr_hour < 10) {
      curr_hour = "0" + curr_hour;
    }
    if (curr_min < 10) {
      curr_min = "0" + curr_min;
    }
    if (curr_sec < 10) {
      curr_sec = "0" + curr_sec;
    }
    return curr_hour + ":" + curr_min + ":" + curr_sec;
  },

  /**
   * This function returns the date under the string format.
   */
  getDate : function () {
    var currentTime = new Date();
    var month = currentTime.getMonth() + 1;
    var day = currentTime.getDate();
    var year = currentTime.getFullYear();

    return month + "/" + day + "/" + year + " - ";
  },

  /**
   * Returns an array of elements that match the given aXPathExpression,
   * from the aXMLNode specified, using xpath.
   * @param aXMLNode the XML node or document to search for matches.
   * @param aXPathExpresion the xpath expression to be used in the search.
   * @return array with the elements that matched the xpath expression.
   */
  evaluateXPath : function (aXMLNode, aXPathExpression) {

    // NSArray declaration.
    const NSArray =
      new Components.Constructor("@mozilla.org/array;1", Ci.nsIMutableArray);
    let matches = new NSArray();
    let xpe =
      Cc["@mozilla.org/dom/xpath-evaluator;1"].
        getService(Ci.nsIDOMXPathEvaluator);
    var htmlDocument = this.getMainWindow().gBrowser.contentDocument;

    let nsResolver =
      xpe.createNSResolver(
        ((null == aXMLNode.ownerDocument) ? aXMLNode.documentElement :
         aXMLNode.ownerDocument.documentElement));

    var resolver =
      function() { return htmlDocument.documentElement.namespaceURI; };

    let result = xpe.evaluate(aXPathExpression, aXMLNode, nsResolver, 0, null);
    let res = result.iterateNext();

    while (res) {
      matches.appendElement(res, false);
      res = result.iterateNext();
    }

    return matches;
  },

  /**
   * This function is a workaround!!!
   * Note: this has to be called  when a new window is opened instead of
   * the sidebar.
   */
  getBrowserWindow : function () {
    var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
                      .getService(Ci.nsIWindowMediator);
    var enumerator = wm.getEnumerator("navigator:browser");
    var win = enumerator.getNext();

    return win;
  },

  /**
   * This function checks if a window is opened checkin the title of
   * the window.
   * @returns {DOMWindow} the opened window or null.
   */
  isWindowOpened : function (aWindowTitle) {
    var wm =
      Cc["@mozilla.org/appshell/window-mediator;1"]
        .getService(Ci.nsIWindowMediator);
    var enumerator = wm.getEnumerator(null);
    while(enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      var elem = win.document.title;

      if (elem.indexOf(aWindowTitle) != -1) {
        return win;
      }
    }
    return null;
  },

  /**
   * This function takes a a URL as a parameter
   * and returns a the corresponding domain.
   */
  getDomain : function (aURL) {
    var results = aURL.match(/:\/\/(.[^/]+)/);
    if (results[1]) {
      return results[1];
    } else {
      return null;
    }
  },

  /**
   * This function deletes the cookies corresponding to the
   * current URL/domain.
   */
  deleteCookies : function() {
    var cookies = null;
    var url = Application.storage.get("SiteCatalystURL", "default");
    var hostURL = Application.storage.get("hostURL", "default");
    var SC_COOKIES_SCHOST = watsUtils.getDomain(url);
    var SC_COOKIES_HOST = watsUtils.getDomain(hostURL);

    if (SC_COOKIES_SCHOST) {
      var subdomain =
        SC_COOKIES_HOST.substring(
          SC_COOKIES_HOST.indexOf(".") + 1, SC_COOKIES_HOST.length);

      var cookieManager =
        Cc["@mozilla.org/cookiemanager;1"]
          .getService(Ci.nsICookieManager);

      var arrayCookies = this.getStoredCookies(SC_COOKIES_HOST, "/");
      for (var i = 0 ; i < arrayCookies.length ; i++) {
        cookieManager.remove(arrayCookies[i].host, arrayCookies[i].name,
          arrayCookies[i].path, false);
      }

      arrayCookies = this.getStoredCookies(SC_COOKIES_SCHOST, "/");
      for (var j = 0 ; j < arrayCookies.length ; j++) {
        cookieManager.remove(arrayCookies[j].host, arrayCookies[j].name,
          arrayCookies[j].path, false);
      }
    }
  },

  /**
   * (taken from Http Fox)
   * This function retrieves cookies for a spcified host and path.
   */
  getStoredCookies: function (host, path) {
    var cookies = new Array();

    // If the host is set
    if (host) {
      var cookie = null;
      var cookieHost = null;
      var cookiePath = null;

      var cookieEnumeration =
        Cc["@mozilla.org/cookiemanager;1"]
          .getService(Ci.nsICookieManager).enumerator;

      // Loop through the cookies
      while (cookieEnumeration.hasMoreElements()) {
        cookie = cookieEnumeration.getNext().QueryInterface(Ci.nsICookie);

        cookieHost = cookie.host;
        cookiePath = cookie.path;

        // If there is a host and path for this cookie
        if (cookieHost && cookiePath) {
          // If the cookie host starts with '.'
          if (cookieHost.charAt(0) == ".") {
            cookieHost = cookieHost.substring(1);
          }

          // If the host and cookie host and path and cookie path match
          if ((host == cookieHost || host.indexOf("." + cookieHost) != -1)
             && (path == cookiePath || path.indexOf(cookiePath) == 0)) {
              cookies.push(cookie);
          }
        }
      }
    }

    return cookies;
  }
}
