/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand'], function(FlexCommand) {
	"use strict";

	/**
	 * Basic implementation for the command pattern.
	 *
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.44
	 * @alias sap.ui.rta.command.BaseCommand
	 * @experimental Since 1.44. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Settings = FlexCommand.extend("sap.ui.rta.command.Settings", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				content : {
					type : "any"
				}
			},
			associations : {},
			events : {}
		}
	});


	Settings.FORWARD = true;
	Settings.BACKWARD = false;

	Settings.prototype._getSpecificChangeInfo = function(bForward) {

		var mSpecificInfo = {
				changeType : this.getChangeType(),
				content : this.getContent()
		};

		return mSpecificInfo;
	};

	Settings.prototype._getFlexChange = function(bForward) {
		var mSpecificChangeInfo = this._getSpecificChangeInfo(bForward);

		var oChange = this._completeChangeContent(mSpecificChangeInfo);

		return {
			change : oChange,
			selectorElement : this._getElement()
		};
	};

	/**
	 * @override
	 */
	Settings.prototype._getForwardActionData = function(oElement) {
		return this._getFlexChange(Settings.FORWARD);
	};

	/**
	 * @override
	 */
	Settings.prototype._getBackwardActionData = function(oElement) {
		return this._getFlexChange(Settings.BACKWARD);
	};

	/**
	 * @override
	 */
	Settings.prototype.serialize = function() {
		return this._getSpecificChangeInfo(Settings.FORWARD);
	};

	/**
	 * @override
	 */
	Settings.prototype.execute = function() {
		if (this.getElement().getMetadata) {
			FlexCommand.prototype.execute.apply(this, arguments);
		}
	};

	/**
	 * @override
	 */
	Settings.prototype.undo = function() {
		if (this.getElement().getMetadata) {
			FlexCommand.prototype.undo.apply(this, arguments);
		}
	};

	return Settings;

}, /* bExport= */true);
