/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/rta/command/FlexCommand',
		'sap/ui/rta/controlAnalyzer/ControlAnalyzerFactory'], function(jQuery, FlexCommand, ControlAnalyzerFactory) {
	"use strict";

	/**
	 * Create new container
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.CreateContainer
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var CreateContainer = FlexCommand.extend("sap.ui.rta.command.CreateContainer", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				index : {
					type : "int"
				},
				newControlId : {
					type : "string"
				},
				label : {
					type : "string"
				},
				createContainerMetadata : {
					type : "object"
				}
			},
			associations : {},
			events : {}
		}
	});

	CreateContainer.prototype._getSpecificChangeInfo = function(bForward) {

		var mSpecificInfo = {
			changeType : this.getChangeType(),
			index : this.getIndex(),
			newControlId : this.getNewControlId(),
			newLabel : this.getLabel()
		};

		return mSpecificInfo;
	};

	CreateContainer.prototype._getFlexChange = function() {
		var oPreparedChange = this.getPreparedActionData(FlexCommand.FORWARD);
		if (!oPreparedChange) {
			var mSpecificChangeInfo = this._getSpecificChangeInfo();
			oPreparedChange = this._completeChangeContent(mSpecificChangeInfo);
		}
		return oPreparedChange;
	};

	/**
	 * @override
	 */
	CreateContainer.prototype._getForwardActionData = function(oElement) {
		return this._getFlexChange();
	};

	/**
	 * @override
	 */
	CreateContainer.prototype._getBackwardActionData = function(oElement) {
		var fnGetState = this.getCreateContainerMetadata().getState;
		var sAddedControlId = this.getNewControlId();
		var oAddedControl = sap.ui.getCore().byId(sAddedControlId);

		if (fnGetState) {
			return fnGetState.call(null, oAddedControl);
		} else {
			jQuery.sap.log.error("No getState implementation found for createContainer action ", oAddedControl.getMetadata().getName() + ".designtime");
		}
	};


	CreateContainer.prototype.undo = function() {
		var fnRestoreState = this.getCreateContainerMetadata().restoreState;
		var sAddedControlId = this.getNewControlId();
		var oAddedControl = sap.ui.getCore().byId(sAddedControlId);
		if (fnRestoreState) {
			fnRestoreState.call(null, oAddedControl);
		} else {
			jQuery.sap.log.error("No restoreState implementation found for createContainer action ", oAddedControl.getMetadata().getName() + ".designtime");
		}
	};

	/**
	 * @override
	 */
	CreateContainer.prototype.serialize = function() {
		return this._getSpecificChangeInfo();
	};

	return CreateContainer;

}, /* bExport= */true);
