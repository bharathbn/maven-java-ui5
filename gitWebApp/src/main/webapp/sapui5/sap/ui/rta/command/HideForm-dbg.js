/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand', 'sap/ui/rta/command/Hide', "sap/ui/fl/changeHandler/HideControl"], function(FlexCommand,
		HideCommand, HideChangeHandler) {
	"use strict";

	/**
	 * Hide SimpleForm Element or SimpleForm Container
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.40
	 * @alias sap.ui.rta.command.Hide
	 * @experimental Since 1.40. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var HideForm = HideCommand.extend("sap.ui.rta.command.HideForm", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				originalElement : {
					type : "object"
				},
				changeType : {
					type : "string",
					defaultValue : "hideControl"
				},
				groupId : {
					type : "string"
				},
				groupIndex : {
					type : "int"
				},
				nextGroupIndex : {
					type : "int",
					defaultValue : -1
				},
				fields : {
					type : "array"
				}
			},
			associations : {},
			events : {}
		}
	});

	HideForm.FORWARD = true;
	HideForm.BACKWARD = false;

	/**
	 * @override
	 */
	HideForm.prototype.init = function() {
	};

	/**
	 * @override
	 */
	HideForm.prototype._getSpecificChangeInfo = function(bForward) {

		var oElement = this.getElement();
		var oOriginalElement = this.getOriginalElement();
		var mSpecificInfo = {};

		mSpecificInfo.selector = {};
		mSpecificInfo.selector.id = oElement.getId();
		mSpecificInfo.changeType = this.getChangeType();
		mSpecificInfo.removedElement = {
			id : oOriginalElement.getId()
		};

		if (oOriginalElement instanceof sap.ui.core.Title) {
			this._setGroupInfo(oOriginalElement);
		}

		return mSpecificInfo;
	};

	/**
	 * @private
	 */
	HideForm.prototype._setGroupInfo = function(oTitleElement) {
		var that = this;
		var aContent = this.getElement().getContent();
		var aFields = [];
		aContent.some(function (oField, index) {
			if (oField === oTitleElement) {
				that.setGroupId(oTitleElement.getId());
				that.setGroupIndex(index);
			}
			if (that.getGroupIndex() < index) {
				if (oField instanceof sap.ui.core.Title) {
					that.setNextGroupIndex(index);
					return true;
				} else {
					if (oField.getVisible() === true) {
						aFields.push(oField);
					}
				}
			}
		});
		this.setFields(aFields);
	};

	/**
	 * @override
	 */
	HideForm.prototype._getFlexChange = function(bForward, oElement) {
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
	HideForm.prototype._getForwardActionData = function(oElement) {
		return this._getFlexChange(HideForm.FORWARD, oElement);
	};

	/**
	 * @override
	 */
	HideForm.prototype._getBackwardActionData = function(oElement) {
		return this._getFlexChange(HideForm.BACKWARD, oElement);
	};

	/**
	 * @override
	 */
	HideForm.prototype._undoWithElement = function(oElement) {
		var oCtrl = this.getOriginalElement();
		var aContent = oElement.getContent();

		var iStart = -1;
		if (this.getChangeType() === "hideSimpleFormField") {
			aContent.some(function (oField, index) {
				if (oField === oCtrl) {
					iStart = index;
					oField.setVisible(true);
				}
				if (iStart >= 0 && index > iStart) {
					if ((oField instanceof sap.m.Label) || (oField instanceof sap.ui.core.Title)) {
						return true;
					} else {
						oField.setVisible(true);
					}
				}
			});
		} else if (this.getChangeType() === "removeSimpleFormGroup") {
			var oTitle = sap.ui.getCore().byId(this.getGroupId());
			this.getElement().insertContent(oTitle, this.getGroupIndex());
			if ((this.getGroupIndex() === 0) && (this.getNextGroupIndex() > 0)) {
				var oNextTitle = oElement.removeContent(1);
				oElement.insertContent(oNextTitle, this.getNextGroupIndex());
			}
			this.getFields().forEach(function(oField) {
				oField.setVisible(true);
			});

			this.setOriginalElement(oTitle);
		}

	};

	/**
	 * @override
	 */
	HideForm.prototype.serialize = function() {
		return this._getSpecificChangeInfo(HideForm.FORWARD);
	};

	return HideForm;

}, /* bExport= */true);
