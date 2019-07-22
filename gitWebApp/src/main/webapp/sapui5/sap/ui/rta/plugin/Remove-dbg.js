/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides class sap.ui.rta.plugin.Remove.
sap.ui.define([
	'sap/ui/dt/Plugin',
	'sap/ui/rta/Utils',
	'sap/ui/rta/command/CompositeCommand'

], function(Plugin, Utils, CompositeCommand) {
	"use strict";

	/**
	 * Constructor for a new Remove Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The Remove allows trigger remove operations on the overlay
	 * @extends sap.ui.dt.Plugin
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.plugin.Remove
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Remove = Plugin.extend("sap.ui.rta.plugin.Remove", /** @lends sap.ui.rta.plugin.Remove.prototype */
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
	 * Register browser event for an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	Remove.prototype.registerElementOverlay = function(oOverlay) {
		oOverlay.attachBrowserEvent("keydown", this._onKeyDown, this);
	};

	/**
	 * @private
	 */
	Remove.prototype._getEffectiveDesignTimeMetadata = function(oOverlay) {
		var oDesignTimeMetadata;
		if (oOverlay.isInHiddenTree()) {
			var oPublicParentAggregationOverlay = oOverlay.getPublicParentAggregationOverlay();
			oDesignTimeMetadata = oPublicParentAggregationOverlay.getDesignTimeMetadata();
		} else {
			oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		}
		return oDesignTimeMetadata;
	};

	/**
	 * @private
	 */
	Remove.prototype._getRemoveAction = function(oOverlay) {
		return this._getEffectiveDesignTimeMetadata(oOverlay).getAction("remove", oOverlay.getElementInstance());
	};

	/**
	 * Checks if remove is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @public
	 */
	Remove.prototype.isRemoveAvailable = function(oOverlay) {
		return !!this._getRemoveAction(oOverlay);
	};

	/**
	 * Checks if remove is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @public
	 */
	Remove.prototype.isRemoveEnabled = function(oOverlay) {
		var oAction = this._getRemoveAction(oOverlay);
		if (!oAction) {
			return false;
		}

		if (typeof oAction.isEnabled !== "undefined") {
			if (typeof oAction.isEnabled === "function") {
				return oAction.isEnabled(oOverlay.getElementInstance());
			} else {
				return oAction.isEnabled;
			}
		}
		return true;
	};

	/**
	 * @private
	 */
	Remove.prototype._getConfirmationText = function(oOverlay) {
		var oAction = this._getRemoveAction(oOverlay);
		if (oAction && oAction.getConfirmationText) {
			return oAction.getConfirmationText(oOverlay.getElementInstance());
		}
	};

	/**
	 * Detaches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	Remove.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachBrowserEvent("keydown", this._onKeyDown, this);
	};

	/**
	 * Handle keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Remove.prototype._onKeyDown = function(oEvent) {
		if (oEvent.keyCode === jQuery.sap.KeyCodes.DELETE) {
			oEvent.stopPropagation();
			this.removeElement();
		}
	};

	/**
	 * The selected (not the focused) element should be hidden!
	 *
	 * @private
	 */
	Remove.prototype.removeElement = function(aOverlays) {
		var aSelection;
		if (aOverlays){
			aSelection = aOverlays;
		} else {
			var oDesignTime = this.getDesignTime();
			aSelection = oDesignTime.getSelection();
		}

		if (aSelection.length > 0) {
			this._handleRemove( aSelection );
		}
	};

	Remove.prototype._getRemoveCommand = function(oElement, oRemovedElement, oDesignTimeMetadata) {
		return this.getCommandFactory().getCommandFor(oElement, "Remove", {
			removedElement : oRemovedElement
		}, oDesignTimeMetadata);
	};

	Remove.prototype._fireElementModified = function(oCompositeCommand) {
		if (oCompositeCommand.getCommands().length) {
			this.fireElementModified({
				"command" : oCompositeCommand
			});
		}
	};

	Remove.prototype._handleRemove = function(aSelectedOverlays) {
		var that = this;
		var aPromises = [];
		var oCompositeCommand = new CompositeCommand();

		aSelectedOverlays.forEach(function(oOverlay) {
			var oCommand;

			var oRemovedElement = oOverlay.getElementInstance();

			var oElement;
			var oDesignTimeMetadata = that._getEffectiveDesignTimeMetadata(oOverlay);
			if (oOverlay.isInHiddenTree()) {
				oElement = oOverlay.getPublicParentElementOverlay().getElementInstance();
			} else {
				oElement = oRemovedElement;
			}

			// TODO: enabled check is only needed, when called from the context menu
			if (that.isRemoveEnabled(oOverlay)) {
				var sConfirmationText = that._getConfirmationText(oOverlay);
				if (sConfirmationText) {
					aPromises.push(Utils.openRemoveConfirmationDialog(oRemovedElement, sConfirmationText).then(function(bConfirmed) {
						if (bConfirmed) {
							oCommand = that._getRemoveCommand(oElement, oRemovedElement, oDesignTimeMetadata);
							oCompositeCommand.addCommand(oCommand);
						}
					}));
				} else {
					oCommand = that._getRemoveCommand(oElement, oRemovedElement, oDesignTimeMetadata);
					oCompositeCommand.addCommand(oCommand);
				}
			}
		});

		// since Promise.all is always asynchronous, we want to call it only if at least one promise exists
		if (aPromises.length) {
			Promise.all(aPromises).then(function() {
				that._fireElementModified(oCompositeCommand);
			});
		} else {
			that._fireElementModified(oCompositeCommand);
		}
	};

	return Remove;
}, /* bExport= */true);
