/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

/*global Promise */// declare unusual global vars for JSLint/SAPUI5 validation
sap.ui.define(['jquery.sap.global', 'sap/ui/comp/odata/FieldSelectorModelConverter', 'sap/ui/dt/ElementUtil'], function(jQuery, FieldSelectorModelConverter, ElementUtil) {
	"use strict";

	/**
	 * Class for ModelConverter.
	 * 
	 * @class
	 * ModelConverter functionality to get a converted model from a given OData Model, which includes checks for already bound and visible properties on the UI as well as renamed labels for sap:label
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 *
	 * @private
	 * @static
	 * @since 1.33
	 * @alias sap.ui.rta.ModelConverter
	 * @experimental Since 1.33. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ModelConverter = {};

	ModelConverter.getConvertedModelWithBoundAndRenamedLabels = function(oControl, aEntityTypes, oControlAnalyzer) {
		var that = this;
		var oModel = oControl.getModel();
		return this._getModelConverter(oModel).then(function(oFieldSelectorModelConverter) {
			return that._getFieldModel(oControl, oFieldSelectorModelConverter, aEntityTypes, oControlAnalyzer);
		});
	};

	ModelConverter._getModelConverter = function(oModel) {
		var oMetaModel = oModel.getMetaModel();
		return oMetaModel.loaded().then(function() {
			return new FieldSelectorModelConverter(oModel);
		}, function(oReason) {
			jQuery.sap.log.error("MetadataModel could not be loaded", oReason);
		});
	};

	ModelConverter._getIgnoredFields = function(oControl) {
		
		if (oControl && oControl.getIgnoredFields) {
			var sCsvIgnoredFields = oControl.getIgnoredFields();
			if (sCsvIgnoredFields) {
				var aIgnoredFields = sCsvIgnoredFields.split(",");
				return aIgnoredFields;
			}
		}
		return [];
	};

	/**
	 * Generates the field model based on renamed labels, already bound and visible fields as well as complex types
	 * @param  {Array} aEntityTypes List of entity types
	 * @param  {sap.ui.core.Control} oControl Currently selected control
	 * @return {Array} List of Fields for the given entity type
	 * @private
	 */
	ModelConverter._getFieldModel = function(oControl, oFieldSelectorModelConverter, aEntityTypes, oControlAnalyzer) {
		var aIgnoredFields = this._getIgnoredFields(oControl);
		var oConvertedModel = oFieldSelectorModelConverter.getConvertedModel(aEntityTypes, aIgnoredFields);

		if (!oControlAnalyzer) {
			throw new Error("ModelConverter: no usable change controller instance found!");
		}

		var oVisibleAndBoundFields = oControlAnalyzer.findVisibleAndBoundFieldsAndLabelNames(oControl);

		var mVisibleAndBoundFields = oVisibleAndBoundFields.visibleAndBoundFields;
		var mFieldsAndLabelNames = oVisibleAndBoundFields.fieldsAndLabelNames;
		var mFieldsAndBoundPropertyName = oVisibleAndBoundFields.fieldsAndBoundPropertyName;
		var mBoundFieldsId = oVisibleAndBoundFields.boundFieldsId;
		var sEntityType;

		for (var z = 0; z < aEntityTypes.length; z++) {
			sEntityType = aEntityTypes[z];
			for (var i = 0; i < oConvertedModel[sEntityType].length; i++) {
				var oActModelEntity = oConvertedModel[sEntityType][i];
				var complexTypePropertyName = oFieldSelectorModelConverter.getMetaDataAnalyzer()
						._getNameOfPropertyUsingComplexType(sEntityType, oActModelEntity.entityName);
				if (mVisibleAndBoundFields[oActModelEntity.name]) {
					oActModelEntity.checked = true;
					
				}
				oActModelEntity.controlId = mBoundFieldsId[oActModelEntity.name];
				//Check for complexTypes
				if (complexTypePropertyName) {
					oActModelEntity.isComplexType = true;
					oActModelEntity.complexTypeName = complexTypePropertyName;

					if (mVisibleAndBoundFields[complexTypePropertyName + "/" + oActModelEntity.name]) {
						oActModelEntity.checked = true;
						oActModelEntity.controlId = mVisibleAndBoundFields[complexTypePropertyName + "/" + oActModelEntity.name];
					}
				}
				//Check for renamed labels
				var sFieldLabel;
				var sPath;

				if (oActModelEntity.isComplexType) {
					sPath = oActModelEntity.complexTypeName + "/" + oActModelEntity.name;
					sFieldLabel = mFieldsAndLabelNames[sPath];
					oActModelEntity.boundProperty = mFieldsAndBoundPropertyName[sPath];
				} else {
					sFieldLabel = mFieldsAndLabelNames[oActModelEntity.name];
					oActModelEntity.boundProperty = mFieldsAndBoundPropertyName[oActModelEntity.name];
				}
				if (sFieldLabel && sFieldLabel !== oActModelEntity["sap:label"]) {
					oActModelEntity.fieldLabel = sFieldLabel;
				}

			}
		}
		return oConvertedModel[sEntityType];
	};

	return ModelConverter;

}, /* bExport= */true);