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


var watsCookiesTree = {

  _cookieManager : null,
  _arrayCookie : [],

  /**
   * This function populates the cookie tree when the
   * dialog is opening.
   */
  init : function() {

    this._cookieManager =
      Cc["@mozilla.org/cookiemanager;1"]
        .getService(Ci.nsICookieManager);

    var SC_COOKIES_HOST = Application.storage.get("host", "default");
    var SC_COOKIES_SCHOST = Application.storage.get("schost", "default");

    var subdomain =
      SC_COOKIES_HOST.substring(
        SC_COOKIES_HOST.indexOf(".") + 1, SC_COOKIES_HOST.length);

    var arrayCookies = watsUtils.getStoredCookies(SC_COOKIES_HOST, "/");
    for (var u = 0 ; u < arrayCookies.length ; u++) {
      this.addTreeItem(arrayCookies[u]);
      this._arrayCookie.push(arrayCookies[u]);
    }

    arrayCookies = watsUtils.getStoredCookies(SC_COOKIES_SCHOST, "/");
    for (var v = 0 ; v < arrayCookies.length ; v++) {
      this.addTreeItem(arrayCookies[v]);
      this._arrayCookie.push(arrayCookies[v]);
    }
  },

  /**
   * This function adds an item within the cookies tree.
   * @param aCookie The cookie to add within the tree.
   * @ return nothing.
   */
  addTreeItem : function(aCookie) {

    var domainName = aCookie.host;
    var cookieName = aCookie.name;
    var cookieValue =
      unescape(unescape(unescape(unescape(aCookie.value))));
    var cookieExpiration;
    if (aCookie.expires == 0) {
      cookieExpiration = "End of the session";
    } else {
      cookieExpiration =
        new Date(aCookie.expires * 1000).toUTCString();
    }
    var cookiesTree = document.getElementById("watsCookiesTree");
    var cookiesTreeChildren =
      document.getElementById("cookiesTreeChildren");

    var cookieTreeItem = document.createElement("treeitem");
    var cookieTreeRow = document.createElement("treerow");

    var treecellDomain = document.createElement("treecell");
    var treecellName = document.createElement("treecell");
    var treecellValue =  document.createElement("treecell");
    var treecellExpiration = document.createElement("treecell");

    treecellDomain.setAttribute("label", domainName);
    treecellName.setAttribute("label", cookieName);
    treecellValue.setAttribute("label", cookieValue);
    treecellExpiration.setAttribute("label", cookieExpiration);

    cookieTreeRow.appendChild(treecellDomain);
    cookieTreeRow.appendChild(treecellName);
    cookieTreeRow.appendChild(treecellValue);
    cookieTreeRow.appendChild(treecellExpiration);

    cookieTreeItem.appendChild(cookieTreeRow);
    cookiesTreeChildren.appendChild(cookieTreeItem);
  },

  /**
   * This function removes the cookies within the tree, after the
   * 'delete cookies' button has been pressed, and the cookies deleted.
   */
  emptyTree : function() {

    var cookiesTreeChildren = document.getElementById("cookiesTreeChildren");

    while(cookiesTreeChildren && cookiesTreeChildren.hasChildNodes()) {
      cookiesTreeChildren.removeChild(
        cookiesTreeChildren.firstChild);
    }
  },

  /**
   * This function deletes the cookies which are selected.
   */
  deleteSelectedCookies : function () {

    var atree = document.getElementById("watsCookiesTree");
    var cookieArray = [];
    var indexesToRemove = [];
    var cookiesToRemove = [];

    /**
     * We first try to retrieve the cookie object from the selection.
     */
    var j = 0;
    for (var i = 0; i < atree.view.rowCount ; i++) {
      if (atree.view.selection.isSelected(i)){
        indexesToRemove.push(i-j);
        cookiesToRemove.push(i);
        j++;
      }
    }
    /**
      * Once the cookies retrieved, we remove the ones which are matching
      * to the list of cookies which belong to the domain.
      */
    for (var j = 0 ; j < indexesToRemove.length ; j++) {
      var index = indexesToRemove[j];
      var cookieIndex = cookiesToRemove[j];
      var cookie = this._arrayCookie[cookieIndex];

      this._cookieManager.remove(cookie.host, cookie.name,
        cookie.path, false);
      this.removeSelectedCookieTreeItem(index);
    }
  },

  /**
   * This function removes the selected cookie items
   * from the tree.
   */
  removeSelectedCookieTreeItem : function (aIndex) {
    var tree = document.getElementById("watsCookiesTree");
    var treeItems = document.getElementsByTagName("treeitem");
    var cookiesTreeChildren = document.getElementById("cookiesTreeChildren");

    for (var i = 0 ; i < treeItems.length ; i++) {
      var treeItem = treeItems[i];
      if (i == aIndex) {
        cookiesTreeChildren.removeChild(treeItem);
      }
    }
  }

};