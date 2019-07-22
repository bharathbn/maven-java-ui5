/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

sap.ui.define([
		"jquery.sap.global", "./AddField", "sap/ui/fl/Utils", "sap/ui/fl/changeHandler/Base", "sap/ui/fl/changeHandler/JsControlTreeModifier"],
		function(jQuery, AddField, Utils, Base, JsControlTreeModifier) {
	"use strict";

	/**
	 * Change handler for adding a smart form group element (representing one or more fields).
	 *
	 * @alias sap.ui.fl.changeHandler.AddFields
	 * @author SAP SE
	 * @version 1.44.4
	 * @experimental Since 1.33.0
	 */
	var AddFields = { };
	/**
	 * Adds a smart form group element incl. one or more value controls.
	 *
	 * @param {sap.ui.fl.Change} oChange change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.comp.smartform.Group} oGroup group control that matches the change selector for applying the change
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @public
	 */
	AddFields.applyChange = function(oChange, oGroup, mPropertyBag) {
		var oChangeDefinition = oChange.getDefinition();
		var fnCheckChangeDefinition = function(oChangeDefinition) {
			var bMandatoryTextsArePresent = oChangeDefinition.texts;
			var bContentPresent = oChangeDefinition.content;
			var bMandatoryContentPresent = false;

			if (bContentPresent) {
				bMandatoryContentPresent = oChangeDefinition.content.field && (oChangeDefinition.content.field.selector || oChangeDefinition.content.field.id) &&
					oChangeDefinition.content.field.jsTypes && oChangeDefinition.content.field.value && oChangeDefinition.content.field.valueProperty;
			}

			return  bMandatoryTextsArePresent && bContentPresent && bMandatoryContentPresent;
		};

		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		if (fnCheckChangeDefinition(oChangeDefinition)) {

			var oFieldSelector = oChangeDefinition.content.field.selector;
			var sFieldId = oChangeDefinition.content.field.id;
			var sLabelText;
			var sLabel;
			var sPreviousLabel;
			for (var j = 0; j < oChangeDefinition.content.field.jsTypes.length; j++) {
				sLabel = "fieldLabel" + j;
				if (oChangeDefinition.texts[sLabel].value !== sPreviousLabel) {
					sLabelText = (sLabelText) ? sLabelText + "/" + oChangeDefinition.texts[sLabel].value : oChangeDefinition.texts[sLabel].value;
					sPreviousLabel = oChangeDefinition.texts[sLabel].value;
				}
			}
			var insertIndex = oChangeDefinition.content.field.index;
			var oGroupElement = oModifier.createControl("sap.ui.comp.smartform.GroupElement", mPropertyBag.appComponent, oView, oFieldSelector || sFieldId);

			for (var i = 0; i < oChangeDefinition.content.field.jsTypes.length; i++) {
				var sJsType = oChangeDefinition.content.field.jsTypes[i];
				var sPropertyName = oChangeDefinition.content.field.valueProperty[i];
				var oPropertyValue = oChangeDefinition.content.field.value[i];
				var oEntitySet = oChangeDefinition.content.field.entitySet;

				AddField.addElementIntoGroupElement(oModifier, oView, oGroupElement, sLabelText, sJsType, sPropertyName, oPropertyValue, oEntitySet, i, mPropertyBag.appComponent);
			}

			oModifier.setProperty(oGroupElement, "label", sLabelText);
			oModifier.insertAggregation(oGroup, "groupElements", oGroupElement, insertIndex);

			return true;


		} else {
			Utils.log.error("Change does not contain sufficient information to be applied: [" + oChangeDefinition.layer + "]"
					+ oChangeDefinition.namespace + "/" + oChangeDefinition.fileName + "." + oChangeDefinition.fileType);
			// however subsequent changes should be applied
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo with attributes "fieldLabel", the field label to be included in the change,
	 *          "fieldValue", the value for the control that displays the value, "valueProperty", the control property
	 *          that holds the field value, "newControlId", the control ID for the control to be added and "jsType", the
	 *          JavaScript control for the field value. Alternative new format is index, label, newControlId and bindingPath,
	 *          which will result in a new SmartField being added and bound.
	 *
	 * @public
	 */
	AddFields.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
		var oAppComponent = mPropertyBag.appComponent;
		var oChangeDefinition = oChange.getDefinition();

		if (oSpecificChangeInfo.fieldLabels) {
			for (var i = 0; i < oSpecificChangeInfo.fieldLabels.length; i++) {
				var sFieldLabel = "fieldLabel" + i;
				Base.setTextInChange(oChangeDefinition, sFieldLabel, oSpecificChangeInfo.fieldLabels[i], "XFLD");
			}
		} else if (oSpecificChangeInfo.label) {
			Base.setTextInChange(oChangeDefinition, "fieldLabel0", oSpecificChangeInfo.label, "XFLD");
		} else {
			throw new Error("oSpecificChangeInfo.fieldLabels or label attribute required");
		}
		if (!oChangeDefinition.content) {
			oChangeDefinition.content = {};
		}
		if (!oChangeDefinition.content.field) {
			oChangeDefinition.content.field = {};
		}
		if (oSpecificChangeInfo.fieldValues) {
			oChangeDefinition.content.field.value = oSpecificChangeInfo.fieldValues;
		} else if (oSpecificChangeInfo.bindingPath) {
			oChangeDefinition.content.field.value = [oSpecificChangeInfo.bindingPath];
		} else {
			throw new Error("oSpecificChangeInfo.fieldValue or bindingPath attribute required");
		}
		if (oSpecificChangeInfo.valueProperty) {
			oChangeDefinition.content.field.valueProperty = oSpecificChangeInfo.valueProperty;
		} else if (oSpecificChangeInfo.bindingPath) {
			oChangeDefinition.content.field.valueProperty = ["value"];
		} else {
			throw new Error("oSpecificChangeInfo.valueProperty or bindingPath attribute required");
		}
		if (oSpecificChangeInfo.newControlId) {
			oChangeDefinition.content.field.selector = JsControlTreeModifier.getSelector(oSpecificChangeInfo.newControlId, oAppComponent);
		} else {
			throw new Error("oSpecificChangeInfo.newControlId attribute required");
		}
		if (oSpecificChangeInfo.jsTypes) {
			oChangeDefinition.content.field.jsTypes = oSpecificChangeInfo.jsTypes;
		} else if (oSpecificChangeInfo.bindingPath) {
			oChangeDefinition.content.field.jsTypes = ["sap.ui.comp.smartfield.SmartField"];
		} else {
			throw new Error("oSpecificChangeInfo.jsTypes or bindingPath attribute required");
		}
		if (oSpecificChangeInfo.index === undefined) {
			throw new Error("oSpecificChangeInfo.index attribute required");
		} else {
			oChangeDefinition.content.field.index = oSpecificChangeInfo.index;
		}
		if (oSpecificChangeInfo.entitySet) {
			// an optional entity set can be configured
			oChangeDefinition.content.field.entitySet = oSpecificChangeInfo.entitySet;
		}

	};

	return AddFields;
},
/* bExport= */true);
