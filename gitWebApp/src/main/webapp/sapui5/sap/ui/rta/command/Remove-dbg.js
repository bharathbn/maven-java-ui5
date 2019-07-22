/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand'], function(FlexCommand) {
	"use strict";

	/**
	 * Remove a control/element
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.42
	 * @alias sap.ui.rta.command.Remove
	 * @experimental Since 1.42. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Remove = FlexCommand.extend("sap.ui.rta.command.Remove", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				removedElement : {
					type : "object"
				},
				removeMetadata : {
					type : "object"
				}
			},
			associations : {},
			events : {}
		}
	});

	Remove.prototype._getSpecificChangeInfo = function() {
		var mSpecificInfo = {
			changeType : this.getChangeType(),
			removedElement : {
				id : this.getRemovedElement().getId()
			}
		};

		var ChangeHandler = this.getChangeHandler();

		return ChangeHandler.buildStableChangeInfo(mSpecificInfo);
	};

	Remove.prototype._getFlexChange = function() {
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
	Remove.prototype.undo = function() {
		var oState = this.getPreparedActionData(FlexCommand.BACKWARD);
		var fnRestoreState = this.getRemoveMetadata().restoreState;
		if (fnRestoreState) {
			fnRestoreState.call(this.getElement(), this.getRemovedElement(), oState);
		} else {
			jQuery.sap.log.error("No restoreState implementation found for remove action ", this.getElement().getMetadata().getName() + ".designtime");
		}
	};

	/**
	 * @override
	 */
	Remove.prototype._getForwardActionData = function(oElement) {
		return this._getFlexChange();
	};

	/**
	 * @override
	 */
	Remove.prototype._getBackwardActionData = function(oElement) {
		var fnGetState = this.getRemoveMetadata().getState;
		if (fnGetState) {
			return fnGetState.call(this.getElement(), this.getRemovedElement());
		} else {
			jQuery.sap.log.error("No getState implementation found for remove action ", this.getElement().getMetadata().getName() + ".designtime");
		}
	};

	/**
	 * @override
	 */
	Remove.prototype.serialize = function() {
		return this._getSpecificChangeInfo(FlexCommand.FORWARD);
	};

	return Remove;

}, /* bExport= */true);
