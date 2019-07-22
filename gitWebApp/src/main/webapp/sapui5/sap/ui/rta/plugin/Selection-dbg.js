/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides class sap.ui.rta.plugin.Selection.
sap.ui.define([
	'sap/ui/dt/Plugin',
	'sap/ui/rta/Utils'
],
function(Plugin, Utils) {
	"use strict";

	//Do reevaluation of selectability clicked overlays
	function _isSelectable(oOverlay){
		if (oOverlay && !oOverlay.isSelectable()){
			var bSelectable = Utils.isEditable(oOverlay);
			oOverlay.setSelectable(bSelectable);
			return bSelectable;
		}
		return !!oOverlay;
	}


	/**
	 * Constructor for a new Selection plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The Selection plugin allows you to select or focus overlays with mouse or keyboard and navigate to others.
	 * @extends sap.ui.dt.Plugin
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.plugin.Selection
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Selection = Plugin.extend("sap.ui.rta.plugin.Selection", /** @lends sap.ui.dt.Plugin.prototype */
	{
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.rta",
			properties: {},
			associations: {},
			events: {}
		}
	});

	/**
	 * Register an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	Selection.prototype.registerElementOverlay = function(oOverlay) {
		//other plugins depend on this logic, get rid of this in futures
		_isSelectable(oOverlay);

		oOverlay.attachBrowserEvent("click", this._onClick, this);
		oOverlay.attachBrowserEvent("keydown", this._onKeyDown, this);
		oOverlay.attachBrowserEvent("mousedown", this._onMouseDown, this);
	};

	/**
	 * Additionally to super->deregisterOverlay this method detatches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	Selection.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachBrowserEvent("click", this._onClick, this);
		oOverlay.detachBrowserEvent("keydown", this._onKeyDown, this);
		oOverlay.detachBrowserEvent("mousedown", this._onMouseDown, this);
	};

	/**
	 * Handle keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Selection.prototype._onKeyDown = function(oEvent) {
		var oOverlay = Utils.getFocusedOverlay();
		_isSelectable(oOverlay);
		if (oEvent.keyCode === jQuery.sap.KeyCodes.ENTER) {
			if ((oOverlay) && (!oOverlay.isSelected())) {
				oOverlay.setSelected(true);
				oEvent.stopPropagation();
			}
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_UP) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			if (oOverlay) {
				var oParentOverlay = oOverlay.getParentElementOverlay();
				if (oParentOverlay && _isSelectable(oParentOverlay)) {
					oParentOverlay.focus();
					oEvent.stopPropagation();
				}
			}
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_DOWN) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			if (oOverlay) {
				var oFirstChildOverlay = Utils.getFirstFocusableChildOverlay(oOverlay);
				if (oFirstChildOverlay) {
					oFirstChildOverlay.focus();
					oEvent.stopPropagation();
				}
			}
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			if (oOverlay) {
				var oPrevSiblingOverlay = Utils.getPreviousFocusableSiblingOverlay(oOverlay);
				if (oPrevSiblingOverlay) {
					oPrevSiblingOverlay.focus();
					oEvent.stopPropagation();
				}
			}
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_RIGHT) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			if (oOverlay) {
				var oNextSiblingOverlay = Utils.getNextFocusableSiblingOverlay(oOverlay);
				if (oNextSiblingOverlay) {
					oNextSiblingOverlay.focus();
					oEvent.stopPropagation();
				}
			}
		}
	};

	/**
	 * Handle MouseDown event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Selection.prototype._onMouseDown = function(oEvent) {
		if (sap.ui.Device.browser.name == "ie"){
			var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
			if (_isSelectable(oOverlay)){
				oOverlay.focus();
				oEvent.stopPropagation();
			} else {
				oOverlay.getDomRef().blur();
			}
			oEvent.preventDefault;
		}
	};

	/**
	 * Handle click event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Selection.prototype._onClick = function(oEvent) {
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		if (_isSelectable(oOverlay)) {
			oOverlay.setSelected(!oOverlay.getSelected());
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	return Selection;
}, /* bExport= */true);
