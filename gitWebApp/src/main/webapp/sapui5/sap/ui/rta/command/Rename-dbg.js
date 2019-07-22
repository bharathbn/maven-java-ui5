/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/rta/command/FlexCommand', 'sap/ui/comp/smartform/flexibility/changes/RenameGroup',
		'sap/ui/comp/smartform/flexibility/changes/RenameField', 'sap/ui/fl/Change'], function(jQuery, FlexCommand,
		RenameGroupChangeHandler, RenameFieldChangeHandler, Change) {
	"use strict";

	/**
	 * Rename Element from one place to another
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.Rename
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Rename = FlexCommand.extend("sap.ui.rta.command.Rename", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				renamedElement : {
					type : "object"
				},
				newValue : {
					type : "string",
					defaultValue : "new text"
				},
				oldValue : {
					type : "string",
					defaultValue : undefined
				},
				renameMetadata : {
					type : "object"
				}
			},
			associations : {},
			events : {}
		}
	});

	Rename.prototype._getSpecificChangeInfo = function(bForward) {

		var mSpecificInfo = {
				changeType : this.getChangeType(),
				selector : {
					id : this.getElement().getId()
				},
				renamedElement : {
					id : this.getRenamedElement().getId()
				},
				value : bForward ? this.getNewValue() : this.getOldValue()
		};

		return mSpecificInfo;
	};

	Rename.prototype._getFlexChange = function(bForward) {
		var oPreparedActionData = this.getPreparedActionData(bForward);
		if (!oPreparedActionData) {
			var mSpecificChangeInfo = this._getSpecificChangeInfo(bForward);
			oPreparedActionData = this._completeChangeContent(mSpecificChangeInfo);
		}
		return oPreparedActionData;
	};

	/**
	 * @override
	 */
	Rename.prototype.undo = function() {
		var oState = this.getPreparedActionData(FlexCommand.BACKWARD);
		var fnRestoreState = this.getRenameMetadata().restoreState;
		if (fnRestoreState) {
			fnRestoreState.call(null, this.getRenamedElement(), oState);
		} else {
			jQuery.sap.log.error("No restoreState implementation found for rename action ", this.getRenamedElement().getMetadata().getName() + ".designtime");
		}
	};

	/**
	 * @override
	 */
	Rename.prototype._getForwardActionData = function(oElement) {
		return this._getFlexChange(FlexCommand.FORWARD, oElement);
	};

	/**
	 * @override
	 */
	Rename.prototype._getBackwardActionData = function(oElement) {
		var fnGetState = this.getRenameMetadata().getState;
		if (fnGetState) {
			return fnGetState.call(null, this.getRenamedElement());
		} else {
			jQuery.sap.log.error("No getState implementation found for rename action ", this.getRenamedElement().getMetadata().getName() + ".designtime");
		}
	};

	/**
	 * @override
	 */
	Rename.prototype.serialize = function() {
		return this._getSpecificChangeInfo(FlexCommand.FORWARD, this._getElement());
	};

	return Rename;

}, /* bExport= */true);
