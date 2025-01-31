/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides access to Java-like properties files
sap.ui.define(['jquery.sap.global', 'sap/ui/Device', 'jquery.sap.sjax'],
	function(jQuery, Device/* , jQuerySap1 */) {
	"use strict";

	// Javadoc for private inner class "Properties" - this list of comments is intentional!
	/**
	 * @interface  Represents a list of properties (key/value pairs).
	 *
	 * Each key and its corresponding value in the property list is a string.
	 * Values are unicode escaped \ue0012.
	 * Keys are case-sensitive and only alpha-numeric characters with a leading character are allowed.
	 *
	 * Use {@link jQuery.sap.properties} to create an instance of jQuery.sap.util.Properties.
	 *
	 * The getProperty method is used to retrieve a value from the list.
	 * The setProperty method is used to store or change a property in the list.
	 * Additionally, the getKeys method can be used to retrieve an array of all keys that are
	 * currently in the list.
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 * @since 0.9.0
	 * @name jQuery.sap.util.Properties
	 * @public
	 */
	/**
	 * Returns the value of a given key. Optionally, a given default value is returned if the requested key is not in the list.
	 * @param {string} sKey The key of the property
	 * @param {string} [sDefaultValue] Optional, the default value if the requested key is not in the list.
	 * @return {string} The value of a given key. The default value (if given) is returned if the requested key is not in the list.
	 *
	 * @function
	 * @name jQuery.sap.util.Properties.prototype.getProperty
	 */
	/**
	 * Returns an array of all keys in the property list.
	 * @return {array} All keys in the property list.
	 *
	 * @function
	 * @name jQuery.sap.util.Properties.prototype.getKeys
	 */
	/**
	 * Adds or changes a given key to/in the list.
	 * @param {string} sKey The key of the property
	 * @param {string} sValue The value for the key with unicode encoding.
	 *
	 * @function
	 * @name jQuery.sap.util.Properties.prototype.setProperty
	 */
	/**
	 * Creates and returns a clone of the property list.
	 * @return {jQuery.sap.util.Properties} A clone of the property list
	 *
	 * @function
	 * @name jQuery.sap.util.Properties.prototype.clone
	 */

	/*
	 * Implements jQuery.sap.util.Properties
	 */
	var Properties = function() {
		this.mProperties = {};
		this.aKeys = null;
	};

	/*
	 * Implements jQuery.sap.util.Properties.prototype.getProperty
	 */
	Properties.prototype.getProperty = function(sKey, sDefaultValue) {
		var sValue = this.mProperties[sKey];
		if (typeof (sValue) == "string") {
			return sValue;
		} else if (sDefaultValue) {
			return sDefaultValue;
		}
		return null;
	};

	/*
	 * Implements jQuery.sap.util.Properties.prototype.getKeys
	 */
	Properties.prototype.getKeys = function() {
		return this.aKeys || (this.aKeys = Object.keys(this.mProperties));
	};

	/*
	 * Implements jQuery.sap.util.Properties.prototype.setProperty
	 */
	Properties.prototype.setProperty = function(sKey, sValue) {
		if (typeof (sValue) != "string") {
			return;
		}
		if (typeof (this.mProperties[sKey]) != "string" && this.aKeys ) {
			this.aKeys.push(sKey);
		}
		this.mProperties[sKey] = sValue;
	};

	/*
	 * Implements jQuery.sap.util.Properties.prototype.clone
	 */
	Properties.prototype.clone = function() {
		var oClone = new Properties();
		oClone.mProperties = jQuery.extend({}, this.mProperties);
		return oClone;
	};

	// helper to create a memory-optimized version of the given string, depending on the number of concat operations (V8 only)
	var flatstr = Device.browser.chrome ? function (s, iConcatOps) {
		if ( iConcatOps > 2 && 40 * iConcatOps > s.length ) {
			Number(s); // cast to number on V8 has the side effect of creating a flat version of concat strings
		}
		return s;
	} : function(s) { return s; };

	/**
	 * RegExp used to split file into lines, also removes leading whitespace.
	 * Note: group must be non-capturing, otherwise the line feeds will be part of the split result.
	 */
	var rLines = /(?:\r\n|\r|\n|^)[ \t\f]*/;

	/**
	 * Regular expressions to detect escape sequences (unicode or special) and continuation line markers
	 * in a single line of a properties file. The first expression also detects key/value separators and is used
	 * as long as no key has been found. The second one is used for the remainder of the line.
	 *
	 *                         [---unicode escape--] [esc] [cnt] [---key/value separator---]
	 */
	var rEscapesOrSeparator = /(\\u[0-9a-fA-F]{0,4})|(\\.)|(\\$)|([ \t\f]*[ \t\f:=][ \t\f]*)/g;
	var rEscapes            = /(\\u[0-9a-fA-F]{0,4})|(\\.)|(\\$)/g;

	/**
	 * Special escape characters as supported by properties format.
	 * @see JDK API doc for java.util.Properties
	 */
	var mEscapes = {
		'\\f' : '\f',
		'\\n' : '\n',
		'\\r' : '\r',
		'\\t' : '\t'
	};

	/*
	 * Parses the given text sText and sets the properties
	 * in the properties object oProp accordingly.
	 * @param {string} sText the text to parse
	 * @param oProp the properties object to fill
	 * @private
	 */
	function parse(sText, oProp) {

		var aLines = sText.split(rLines), // split file into lines
			sLine,rMatcher,sKey,sValue,i,m,iLastIndex,iConcatOps;

		function append(s) {
			if ( sValue ) {
				sValue = sValue + s;
				iConcatOps++;
			} else {
				sValue = s;
				iConcatOps = 0;
			}
		}

		oProp.mProperties = {};

		for (i = 0; i < aLines.length; i++) {
			sLine = aLines[i];
			// ignore empty lines
			if (sLine === "" || sLine.charAt(0) === "#" || sLine.charAt(0) === "!" ) {
				continue;
			}

			// start with the full regexp incl. key/value separator
			rMatcher = rEscapesOrSeparator;
			rMatcher.lastIndex = iLastIndex = 0;
			sKey = null;
			sValue = "";

			while ( (m = rMatcher.exec(sLine)) !== null ) {
				// handle any raw, unmatched input
				if ( iLastIndex < m.index ) {
					append(sLine.slice(iLastIndex, m.index));
				}
				iLastIndex = rMatcher.lastIndex;
				if ( m[1] ) {
					// unicode escape
					if ( m[1].length !== 6 ) {
						throw new Error("Incomplete Unicode Escape '" + m[1] + "'");
					}
					append(String.fromCharCode(parseInt(m[1].slice(2), 16)));
				} else if ( m[2] ) {
					// special or simple escape
					append(mEscapes[m[2]] || m[2].slice(1));
				} else if ( m[3] ) {
					// continuation line marker
					sLine = aLines[++i];
					rMatcher.lastIndex = iLastIndex = 0;
				} else if ( m[4] ) { // only occurs in full regexp
					// key/value separator detected
					// -> remember key and switch to simplified regexp
					sKey = sValue;
					sValue = "";
					rMatcher = rEscapes;
					rMatcher.lastIndex = iLastIndex;
				}
			}
			if ( iLastIndex < sLine.length ) {
				append(sLine.slice(iLastIndex));
			}
			if ( sKey == null ) {
				sKey = sValue;
				sValue = "";
			}

			oProp.mProperties[sKey] = flatstr(sValue, sValue ? iConcatOps : 0); // Note: empty sValue implies iConcatOps == 0

		}

	}

	/**
	 * Creates and returns a new instance of {@link jQuery.sap.util.Properties}.
	 *
	 * If option 'url' is passed, immediately a load request for the given target is triggered.
	 * A property file that is loaded can contain comments with a leading ! or #.
	 * The loaded property list does not contain any comments.
	 *
	 * <b>Example for loading a property file:</b>
	 * <pre>
	 *  jQuery.sap.properties({url : "../myProperty.properties"});
	 * </pre>
	 *
	 * <b>Example for creating an empty properties instance:</b>
	 * <pre>
	 *  jQuery.sap.properties();
	 * </pre>
	 *
	 * <b>Examples for getting and setting properties:</b>
	 * <pre>
	 *	var oProperties = jQuery.sap.properties();
	 *	oProperties.setProperty("KEY_1","Test Key");
	 *	var sValue1 = oProperties.getProperty("KEY_1");
	 *	var sValue2 = oProperties.getProperty("KEY_2","Default");
	 * </pre>
	 *
	 * @public
	 * @param {object} [mParams] Parameters used to initialize the property list
	 * @param {string} [mParams.url] The URL to the .properties file which should be loaded.
	 * @param {boolean} [mParams.async] Whether the .properties file which should be loaded asynchronously (Default: <code>false</code>)
	 * @param {object} [mParams.headers] A map of additional header key/value pairs to send along with the request (see headers option of jQuery.ajax).
	 * @return {jQuery.sap.util.Properties|Promise} A new property list instance (synchronous case). In case of asynchronous loading an ECMA Script 6 Promise is returned.
	 * @SecSink {0|PATH} Parameter is used for future HTTP requests
	 */
	jQuery.sap.properties = function properties(mParams) {
		mParams = jQuery.extend({url: undefined, headers: {}}, mParams);

		var bAsync = !!mParams.async,
			oProp = new Properties();


		function _parse(sText){
			if (typeof (sText) == "string") {
				parse(sText, oProp);
			}
		}

		function _load(){
			var oRes;

			if (typeof (mParams.url) == "string") {
				oRes = jQuery.sap.loadResource({
					url: mParams.url,
					dataType: 'text',
					headers: mParams.headers,
					failOnError: false,
					async: bAsync
				});
			}

			return oRes;
		}

		if (bAsync) {
			return new Promise(function(resolve, reject){
				var oRes = _load();
				if (!oRes) {
					resolve(oProp);
					return;
				}

				oRes.then(function(oVal){
					try {
						_parse(oVal);
						resolve(oProp);
					} catch (e) {
						reject(e);
					}
				}, function(oVal){
					reject(oVal instanceof Error ? oVal : new Error("Problem during loading of property file '" + mParams.url + "': " + oVal));
				});
			});
		} else {
			_parse(_load());
			return oProp;
		}
	};

	return jQuery;

});
