/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/ui/fl/Utils', 'jquery.sap.global', 'sap/ui/fl/changeHandler/Base'
], function(Utils, jQuery, Base) {
	"use strict";

	/**
	 * Change handler for renaming a smart form group element.
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.RenameField
	 * @author SAP SE
	 * @version 1.44.4
	 * @experimental Since 1.27.0
	 */
	var RenameField = { };

	/**
	 * Renames a smart form group element.
	 *
	 * @param {sap.ui.fl.Change} oChange change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @public
	 */
	RenameField.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChange = oChange.getDefinition();
		var sPropertyName = oChange.content.labelProperty;
		if (!sPropertyName && oModifier.targets === "xmlTree"){
			//ducktyping not possible in xml tree
			return false;
		}

		if (oChange.texts && oChange.texts.fieldLabel && this._isProvided(oChange.texts.fieldLabel.value)) {
			if (!oControl) {
				throw new Error("no Control provided for renaming");
			}
			var sFieldLabel = oChange.texts.fieldLabel.value;
			if (!sPropertyName){
				if (typeof oControl.setLabel === 'function') {
					sPropertyName = "label";
				} else if (typeof oControl.setTitle === 'function') {
					sPropertyName = "title";
				} else {
					throw new Error('Control does not support "renameField" change');
				}
			}
			if (Utils.isBinding(sFieldLabel)) {
				oModifier.setPropertyBinding(oControl, sPropertyName, sFieldLabel);
			} else {
				oModifier.setProperty(oControl, sPropertyName, sFieldLabel);
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
	 * @param {object} oSpecificChangeInfo with attribute fieldLabel, the new field label to be included in the change
	 * @public
	 */
	RenameField.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo) {
		var oChange = oChangeWrapper.getDefinition();

		if (this._isProvided(oSpecificChangeInfo.value)) {
			Base.setTextInChange(oChange, "fieldLabel", oSpecificChangeInfo.value, "XFLD");
		} else {
			throw new Error("oSpecificChangeInfo.value attribute required");
		}
	};

	/**
	 * Checks if a string is provided as also empty strings are allowed for the fields
	 */
	RenameField._isProvided = function(sString){
		return typeof (sString) === "string";
	};

	return RenameField;
},
/* bExport= */true);
