/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand', 'sap/ui/rta/command/Unhide', "sap/ui/fl/changeHandler/UnhideControl"], function(FlexCommand,
		UnhideCommand, UnhideChangeHandler) {
	"use strict";

	/**
	 * Unhide SimpleForm Element or SimpleForm Container
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.Unhide
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var UnhideForm = UnhideCommand.extend("sap.ui.rta.command.UnhideForm", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				originalElement : {
					type : "object"
				},
				changeType : {
					type : "string",
					defaultValue : "unhideControl"
				}
			},
			associations : {},
			events : {}
		}
	});

	UnhideForm.FORWARD = true;
	UnhideForm.BACKWARD = false;

	/**
	 * @override
	 */
	UnhideForm.prototype.init = function() {
	};

	/**
	 * @override
	 */
	UnhideForm.prototype._getSpecificChangeInfo = function(bForward) {

		var oElement = this.getElement();
		var mSpecificInfo = {};

		mSpecificInfo.selector = {};
		mSpecificInfo.selector.id = oElement.getId();
		mSpecificInfo.changeType = this.getChangeType();
		mSpecificInfo.sUnhideId = this.getOriginalElement().getId();

		return mSpecificInfo;
	};

	/**
	 * @override
	 */
	UnhideForm.prototype._getFlexChange = function(bForward, oElement) {
		var mSpecificChangeInfo = this._getSpecificChangeInfo(bForward);

		var oChange = this._completeChangeContent(mSpecificChangeInfo);

		return {
			change : oChange,
			selectorElement : oElement
		};
	};

	/**
	 * @override
	 */
	UnhideForm.prototype._getForwardActionData = function(oElement) {
		return this._getFlexChange(UnhideForm.FORWARD, oElement);
	};

	/**
	 * @override
	 */
	UnhideForm.prototype._getBackwardActionData = function(oElement) {
		return this._getFlexChange(UnhideForm.BACKWARD, oElement);
	};

	/**
	 * @override
	 */
	UnhideForm.prototype._undoWithElement = function(oElement) {
		var oCtrl = this.getOriginalElement();
		var aContent = oElement.getContent();

		if (this.getChangeType() === "unhideSimpleFormField") {
			var iStart = -1;
			aContent.some(function (oField, index) {
				if (oField === oCtrl) {
					iStart = index;
					oField.setVisible(false);
				}
				if (iStart >= 0 && index > iStart) {
					if ((oField instanceof sap.m.Label) || (oField instanceof sap.ui.core.Title)) {
						return true;
					} else {
						oField.setVisible(false);
					}
				}
			});
		}

	};

	/**
	 * @override
	 */
	UnhideForm.prototype.serialize = function() {
		return this._getSpecificChangeInfo(UnhideForm.FORWARD);
	};

	return UnhideForm;

}, /* bExport= */true);
