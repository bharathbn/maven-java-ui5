/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/fl/Utils", "jquery.sap.global"
], function(Utils, $) {
	"use strict";

	/**
	 * Base functionality for all change handler which provides some reuse methods
	 * @alias sap.ui.fl.changeHandler.Base
	 * @author SAP SE
	 * @version 1.44.4
	 * @experimental Since 1.27.0
	 *
	 */
	var Base = { };

	/**
	 * Sets a text in a change.
	 *
	 * @param {object} oChange - change object
	 * @param {string} sKey - text key
	 * @param {string} sText - text value
	 * @param {string} sType - translation text type e.g. XBUT, XTIT, XTOL, XFLD
	 *
	 * @public
	 */
	Base.setTextInChange = function(oChange, sKey, sText, sType) {
		if (!oChange.texts) {
			oChange.texts = {};
		}
		if (!oChange.texts[sKey]) {
			oChange.texts[sKey] = {};
		}
		oChange.texts[sKey].value = sText;
		oChange.texts[sKey].type = sType;
	};

	return Base;
}, /* bExport= */true);
