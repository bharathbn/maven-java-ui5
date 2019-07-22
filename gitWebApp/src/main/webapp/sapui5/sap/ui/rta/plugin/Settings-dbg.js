/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides class sap.ui.rta.plugin.Settings.
sap.ui.define([
	'sap/ui/dt/Plugin'
], function(Plugin) {
	"use strict";

	/**
	 * Constructor for a new Settings Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The Settings allows trigger change of settings operations on the overlay
	 * @extends sap.ui.dt.Plugin
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.44
	 * @alias sap.ui.rta.plugin.Settings
	 * @experimental Since 1.44. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Settings = Plugin.extend("sap.ui.rta.plugin.Settings", /** @lends sap.ui.rta.plugin.Settings.prototype */
	{
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.rta",
			properties: {
				commandStack : {
					type : "any"
				}
			},
			associations: {},
			events: {}
		}
	});

	Settings.prototype._getUnsavedChanges = function(sId, aChangeTypes) {
		var sElementId;

		var aUnsavedChanges = this.getCommandStack().getSerializableCommands().filter(function(oCommand) {
			sElementId = oCommand.getElement().id || oCommand.getElement().getId();
			if (sElementId === sId && aChangeTypes.indexOf(oCommand.getChangeType()) >= 0) {
				return true;
			}
		}).map(function(oCommand) {
			return oCommand.getPreparedActionData().change;
		});

		return aUnsavedChanges;
	};

	/**
	 * @private
	 */
	Settings.prototype._getEffectiveDesignTimeMetadata = function(oOverlay) {
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
	Settings.prototype._getSettingsAction = function(oOverlay) {
		return this._getEffectiveDesignTimeMetadata(oOverlay).getAction("settings", oOverlay.getElementInstance());
	};

	/**
	 * Checks if settings is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @public
	 */
	Settings.prototype.isSettingsAvailable = function(oOverlay) {
		return !!this._getSettingsAction(oOverlay);
	};

	/**
	 * Checks if settings is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @public
	 */
	Settings.prototype.isSettingsEnabled = function(oOverlay) {
		var oAction = this._getSettingsAction(oOverlay);
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


	Settings.prototype.handleSettings = function(aSelectedOverlays) {
		var oSettingsCommand;
		var oElement = aSelectedOverlays[0].getElementInstance();
		var that = this;

		return aSelectedOverlays[0].getDesignTimeMetadata().getAction("settings").handler(oElement, this._getUnsavedChanges.bind(this)).then(function(aChanges) {
			aChanges.forEach(function(mChange) {
				oSettingsCommand = that.getCommandFactory().getCommandFor(mChange.selectorControl, "settings", mChange.changeSpecificData);
				that.fireElementModified({
					"command" : oSettingsCommand
				});
			});
		})['catch'](function(oError) {
			if (oError) {
				throw oError;
			}
		});
	};

	return Settings;
}, /* bExport= */true);
