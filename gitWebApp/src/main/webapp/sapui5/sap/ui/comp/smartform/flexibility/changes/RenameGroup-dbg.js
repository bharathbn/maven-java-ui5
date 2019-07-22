/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/ui/fl/Utils', 'jquery.sap.global', 'sap/ui/fl/changeHandler/Base'
], function(Utils, jQuery, Base) {
	"use strict";

	/**
	 * Change handler for renaming a SmartForm group.
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.RenameGroup
	 * @author SAP SE
	 * @version 1.44.4
	 * @experimental Since 1.27.0
	 */
	var RenameGroup = { };

	/**
	 * Renames a form group.
	 *
	 * @param {sap.ui.fl.Change} oChange change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.comp.smartform.Group} oGroup Group control that matches the change selector for applying the change
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @public
	 */
	RenameGroup.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChange = oChange.getDefinition();
		if (oChange.texts && oChange.texts.groupLabel && this._isProvided(oChange.texts.groupLabel.value)) {
			if (!oControl) {
				throw new Error("no Control provided for renaming");
			}
			var sGroupLabel = oChange.texts.groupLabel.value;
			if (Utils.isBinding(sGroupLabel)) {
				oModifier.setPropertyBinding(oControl, "label", sGroupLabel);
			} else {
				oModifier.setProperty(oControl, "label", sGroupLabel);
			}
			return true;
		} else {
			Utils.log.error("Change does not contain sufficient information to be applied: [" + oChange.layer + "]" + oChange.namespace + "/" + oChange.fileName + "." + oChange.fileType);
			//however subsequent changes should be applied
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo with attribute groupLabel, the new group label to be included in the change
	 * @public
	 */
	RenameGroup.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo) {
		var oChange = oChangeWrapper.getDefinition();

		if (this._isProvided(oSpecificChangeInfo.value)) {
			Base.setTextInChange(oChange, "groupLabel", oSpecificChangeInfo.value, "XFLD");
		} else {
			throw new Error("oSpecificChangeInfo.value attribute required");
		}
	};

	/**
	 * Checks if a string is provided as also empty strings are allowed for the group
	 */
	RenameGroup._isProvided = function(sString){
		return typeof (sString) === "string";
	};

	return RenameGroup;
},
/* bExport= */true);
