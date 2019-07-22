/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

/**
 * @namespace Factory to access <code>ushell</code> services.
 * @name sap.ui.comp.navpopover.Factory
 * @author SAP SE
 * @version 1.44.4
 * @private
 * @since 1.36.0
 */
sap.ui.define([
	'sap/ui/comp/library', 'sap/ui/comp/navpopover/FlexConnector'
], function(CompLibrary, FlexConnector) {
	"use strict";
	var Factory = {

		getService: function(sServiceName) {
			switch (sServiceName) {
				case "CrossApplicationNavigation":
					return sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
				case "URLParsing":
					return sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("URLParsing");
				case "FlexConnector":
					return FlexConnector;
				default:
					return null;
			}
		}
	};

	return Factory;
}, /* bExport= */true);
