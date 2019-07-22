/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides object sap.ui.rta.ControlAnalyzerFactory.
sap.ui.define(['sap/ui/rta/controlAnalyzer/SmartForm', 'sap/ui/rta/controlAnalyzer/Form', 'sap/ui/rta/controlAnalyzer/ObjectPage'], function() {
	"use strict";

	/**
	 * @class ControlAnalyzerFactory delivers change controller for a specific component
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 *
	 * @private
	 * @static
	 * @since 1.34
	 * @alias ControlAnalyzerFactory
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API
	 *               might be changed in future.
	 */

	var ControlAnalyzerFactory = {};

	// Add here all known change controllers. Actually we support only the SmartForm and ObjectPage
	var _mapOfControllers = {

		'sap.ui.comp.smartform' : {
			'Constructor' : sap.ui.rta.controlAnalyzer.SmartForm
		},

		'sap.ui.layout.form' : {
			'Constructor' : sap.ui.rta.controlAnalyzer.Form
		},

		'sap.uxap' : {
			'Constructor' : sap.ui.rta.controlAnalyzer.ObjectPage
		},

		//fallback
		'sap' : {
			'Constructor' : sap.ui.rta.controlAnalyzer.Base
		},

		// search function to search map by name or prefix
		'findControlAnalyzerByName' : function(oContext, sName) {
			var result = oContext._mapOfControllers[sName];
			if (!result) { // if not yet found try also the prefix, TODO generalize algorithm
				var iIndex = sName.lastIndexOf('.');
				if (iIndex > 0) {
					result = oContext._mapOfControllers.findControlAnalyzerByName(oContext, sName.substr(0, iIndex));
				} else if (iIndex === -1) {
					//fallback to base analyzer:
					result = oContext._mapOfControllers.sap;
				}
			}
			return result;
		}

	};
	ControlAnalyzerFactory._mapOfControllers = _mapOfControllers;

	/**
	 * Factory method to provide a change controller for a given control
	 *
	 * @param {sap.ui.core.Control}
	 *          oControl Control for which a change controller is requested
	 * @returns {sap.ui.rta.controlAnalyzer.Base} the change controller or null
	 */
	ControlAnalyzerFactory.getControlAnalyzerFor = function(oControl) {
		var result = null;
		jQuery.sap.assert(!!oControl, "Cannot get rta change controller for undefined control.");
		if (oControl) {
			var sType = oControl.getMetadata().getName();
			var oDescriptor = this._mapOfControllers.findControlAnalyzerByName(this, sType);
			if (oDescriptor) {
					result = oDescriptor.instance = new oDescriptor.Constructor({"control" : oControl});
			}
		}
		return result;
	};

	return ControlAnalyzerFactory;
}, /* bExport= */true);
