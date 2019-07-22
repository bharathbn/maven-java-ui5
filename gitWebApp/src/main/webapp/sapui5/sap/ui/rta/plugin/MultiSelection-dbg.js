/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides class sap.ui.dt.plugin.MultiSelection.
sap.ui.define(['sap/ui/dt/Plugin', 'sap/ui/dt/ElementUtil', 'sap/ui/rta/Utils'],
		function(Plugin, ElementUtil, RTAUtils) {
			"use strict";

			/**
			 * Constructor for a new MultiSelection.
			 * 
			 * @param {string}
			 *          [sId] id for the new object, generated automatically if no id is given
			 * @param {object}
			 *          [mSettings] initial settings for the new object
			 * 
			 * @class The MultiSelection allows to select the Overlays with a mouse click
			 * @extends sap.ui.dt.Plugin
			 * 
			 * @author SAP SE
			 * @version 1.33.0-SNAPSHOT
			 * 
			 * @constructor
			 * @private
			 * @since 1.33
			 * @alias sap.ui.rta.plugin.MultiSelection
			 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API
			 *               might be changed in future.
			 */
			var MultiSelection = Plugin.extend("sap.ui.rta.plugin.MultiSelection", /** @lends sap.ui.dt.plugin.MultiSelection.prototype */
			{
				metadata : {
					library : "sap.ui.rta",
					properties : {
						multiSelectionTypes : {
							type : "string[]"
						}
					}
				}
			});

			/**
			 * @override
			 */
			MultiSelection.prototype.init = function() {
				Plugin.prototype.init.apply(this, arguments);
				this._fnKeyDown = this._onKeyDown.bind(this);
				this._fnKeyUp = this._onKeyUp.bind(this);

				window.addEventListener("keydown", this._fnKeyDown);
				window.addEventListener("keyup", this._fnKeyUp);

			};

			/**
			 * @override
			 */
			MultiSelection.prototype.exit = function() {
				Plugin.prototype.exit.apply(this, arguments);

				window.removeEventListener("keydown", this._fnKeyDown);
				window.removeEventListener("keyup", this._fnKeyUp);

			};

			/**
			 * @override
			 */
			MultiSelection.prototype.setDesignTime = function(oDesignTime) {
				this._oDesignTime = oDesignTime;

				if (this._oDesignTime) {
					this._oDesignTime.detachSelectionChange(this._onDesignTimeSelectionChange, this);
				}
				Plugin.prototype.setDesignTime.apply(this, arguments);

				if (oDesignTime) {
					oDesignTime.attachSelectionChange(this._onDesignTimeSelectionChange, this);
				}
			};

			/**
			 * Event handler for key down events. Sets DesignTime SelectionMode to multi if cmd key was used.
			 * 
			 * @param {sap.ui.base.Event}
			 *          oEvent event object
			 * @private
			 */
			MultiSelection.prototype._onKeyDown = function(oEvent) {
				// left or right cmd / ctrl key
				if (sap.ui.Device.os.name === sap.ui.Device.os.OS.WINDOWS) {
					if (oEvent.keyCode === 17) {
						this._oDesignTime.setSelectionMode(sap.ui.dt.SelectionMode.Multi);
					}
				} else if (sap.ui.Device.os.name === sap.ui.Device.os.OS.MACINTOSH) {
					if (oEvent.keyCode === 91 || oEvent.keyCode === 93) {
						this._oDesignTime.setSelectionMode(sap.ui.dt.SelectionMode.Multi);
					}
				}
			};

			/**
			 * Event handler for key up events. Sets DesignTime SelectionMode to single if cmd key was used.
			 * 
			 * @param {sap.ui.base.Event}
			 *          oEvent event object
			 * @private
			 */
			MultiSelection.prototype._onKeyUp = function(oEvent) {
				if (sap.ui.Device.os.name === sap.ui.Device.os.OS.WINDOWS) {
					if (oEvent.keyCode === 17) {
						this._oDesignTime.setSelectionMode(sap.ui.dt.SelectionMode.Single);
					}
				} else if (sap.ui.Device.os.name === sap.ui.Device.os.OS.MACINTOSH) {
					if (oEvent.keyCode === 91 || oEvent.keyCode === 93) {
						this._oDesignTime.setSelectionMode(sap.ui.dt.SelectionMode.Single);
					}
				}
			};

			/**
			 * React on selection change from designTime
			 * 
			 * @param {sap.ui.base.Event}
			 *          oEvent fired
			 * @override
			 */
			MultiSelection.prototype._onDesignTimeSelectionChange = function(oEvent) {
				if (this._oDesignTime.getSelectionMode() === sap.ui.dt.SelectionMode.Single) {
					return;
				}
				
				var aMultiSelectionTypes = this.getMultiSelectionTypes();
				var bMultiSelectisValid = true;
				var oCurrentSelectedOverlay = oEvent.getParameter("selection")[oEvent.getParameter("selection").length - 1];
				var aSelections = this._oDesignTime.getSelection();
				if (aSelections && aSelections.length === 1) {
					oCurrentSelectedOverlay.setSelected(true);
					return;
				}
				if (!oCurrentSelectedOverlay || this._oDesignTime.getSelectionMode() === sap.ui.dt.SelectionMode.Single) {
					return;
				}
				aMultiSelectionTypes.forEach(function(sType, iIndex, aArray) {
					aSelections.forEach(function(oSelecedElement) {
						if (!ElementUtil.isInstanceOf(oSelecedElement.getElementInstance(), sType)) {
							bMultiSelectisValid = false;
						}
					});
					oCurrentSelectedOverlay.setSelected(bMultiSelectisValid);
				});
			};

			return MultiSelection;
		}, /* bExport= */true);