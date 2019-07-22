/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides class sap.ui.rta.plugin.Remove.
sap.ui.define([
	'sap/ui/dt/Plugin',
	'sap/ui/fl/Utils',
	'sap/ui/rta/Utils',
	'sap/ui/dt/OverlayRegistry'

], function(Plugin, FlexUtils, RtaUtils,  OverlayRegistry) {
	"use strict";

	/**
	 * Constructor for a new CreateContainer Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The CreateContainer allows trigger CreateContainer operations on the overlay
	 * @extends sap.ui.dt.Plugin
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.plugin.CreateContainer
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var CreateContainer = Plugin.extend("sap.ui.rta.plugin.CreateContainer", /** @lends sap.ui.rta.plugin.CreateContainer.prototype */
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
	 * @private
	 */
	CreateContainer.prototype.getEffectiveDesignTimeMetadata = function(oOverlay) {
		return oOverlay.getDesignTimeMetadata();
	};

	CreateContainer.prototype._getParentOverlay = function(bSibling, oOverlay) {
		var oParentOverlay;
		if (bSibling) {
			oParentOverlay = oOverlay.getPublicParentElementOverlay();
		} else {
			oParentOverlay = oOverlay;
		}
		return oParentOverlay;
	};

	CreateContainer.prototype.getCreateAction = function(bSibling, oOverlay) {
		var oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
		var oDesignTimeMetadata = this.getEffectiveDesignTimeMetadata(oParentOverlay);
		var aActions = oDesignTimeMetadata.getAggregationAction("createContainer", oOverlay.getElementInstance());
		return aActions[0];
	};

	CreateContainer.prototype.isCreateAvailable = function(bSibling, oOverlay) {
		return !!this.getCreateAction(bSibling, oOverlay);
	};

	CreateContainer.prototype.isCreateEnabled = function(bSibling, oOverlay) {
		var vAction = this.getCreateAction(bSibling, oOverlay);
		if (!vAction) {
			return false;
		}

		if (vAction.isEnabled && typeof vAction.isEnabled === "function") {
			var fnIsEnabled = vAction.isEnabled;
			return fnIsEnabled.call(null, oOverlay.getElementInstance());
		} else {
			return true;
		}
	};

	CreateContainer.prototype._getCreatedContainerId = function(vAction, sNewControlID) {
		var sId = sNewControlID;
		if (vAction.getCreatedContainerId && typeof vAction.getCreatedContainerId === "function") {
			var fnMapToRelevantControlID = vAction.getCreatedContainerId;
			sId = fnMapToRelevantControlID.call(null, sNewControlID);

		}
		return OverlayRegistry.getOverlay(sId);
	};

	CreateContainer.prototype._determineIndex = function(oParentElement, oSiblingElement, sAggregationName, fnGetIndex) {
		return RtaUtils.getIndex(oParentElement, oSiblingElement, sAggregationName, fnGetIndex);
	};

	CreateContainer.prototype._getText = function(vAction, oDesignTimeMetadata, sText) {
		var sContainerTitle = oDesignTimeMetadata.getLibraryText(vAction.containerTitle);
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		return oTextResources.getText(sText, sContainerTitle);
	};

	CreateContainer.prototype.getCreateContainerText = function(bSibling, oOverlay) {
		var vAction = this.getCreateAction(bSibling, oOverlay);
		var oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
		var oDesignTimeMetadata = this.getEffectiveDesignTimeMetadata(oParentOverlay);
		var sText = "CTX_CREATE_CONTAINER";
		return this._getText(vAction, oDesignTimeMetadata, sText);
	};

	CreateContainer.prototype._getContainerTitle = function(vAction, oDesignTimeMetadata) {
		var sText = "TITLE_CREATE_CONTAINER";
		return this._getText(vAction, oDesignTimeMetadata, sText);
	};

	CreateContainer.prototype.handleCreate = function(bSibling, oOverlay) {
		var vAction = this.getCreateAction(bSibling, oOverlay);
		var oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
		var oDesignTimeMetadata = this.getEffectiveDesignTimeMetadata(oParentOverlay);
		var oTargetElement = oParentOverlay.getElementInstance();
		var oView = FlexUtils.getViewForControl(oTargetElement);

		var oSiblingElement;
		if (bSibling) {
			oSiblingElement = oOverlay.getElementInstance();
		}

		var sNewControlID = oView.createId(jQuery.sap.uid());
		var fnGetIndex = oDesignTimeMetadata.getAggregation(vAction.aggregation).getIndex;
		var iIndex = this._determineIndex(oTargetElement, oSiblingElement, vAction.aggregation, fnGetIndex);

		var oCommand = this.getCommandFactory().getCommandFor(oTargetElement, "createContainer", {
			newControlId : sNewControlID,
			label : this._getContainerTitle(vAction, oDesignTimeMetadata),
			index : iIndex
		}, oDesignTimeMetadata);

		this.fireElementModified({
			"command" : oCommand
		});

		var oNewContainerOverlay  = this._getCreatedContainerId(vAction, sNewControlID);
		oNewContainerOverlay.setSelected(true);

		return oNewContainerOverlay;
	};

	return CreateContainer;
}, /* bExport= */true);
