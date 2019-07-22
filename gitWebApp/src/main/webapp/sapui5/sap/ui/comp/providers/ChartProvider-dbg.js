/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// -----------------------------------------------------------------------------
// Generates the view metadata required for SmartTable using SAP-Annotations metadata
// -----------------------------------------------------------------------------
sap.ui.define([
	'jquery.sap.global', 'sap/ui/comp/odata/MetadataAnalyser', 'sap/ui/comp/odata/ChartMetadata', 'sap/ui/comp/odata/ODataType', './ControlProvider'
], function(jQuery, MetadataAnalyser, ChartMetadata, ODataType, ControlProvider) {
	"use strict";

	/**
	 * Constructs a class to generate the view/data model metadata for the SmartChart from the SAP-Annotations metadata
	 * 
	 * @constructor
	 * @experimental This module is only for internal/experimental use!
	 * @public
	 * @param {object} mPropertyBag - PropertyBag having members model, entitySet
	 */
	var ChartProvider = function(mPropertyBag) {
		if (mPropertyBag) {
			this._oParentODataModel = mPropertyBag.model;
			this.sEntitySet = mPropertyBag.entitySet;
			this._sIgnoredFields = mPropertyBag.ignoredFields;
			this.useSmartField = mPropertyBag.useSmartField;
			this._bSkipAnnotationParse = mPropertyBag.skipAnnotationParse === "true";
			this._sChartQualifier = mPropertyBag.chartQualifier;
			this._sPresentationVariantQualifier = mPropertyBag.presentationVariantQualifier;
			this._oDefaultDropDownDisplayBehaviour = mPropertyBag.defaultDropDownDisplayBehaviour;
			try {
				this._oDateFormatSettings = mPropertyBag.dateFormatSettings ? JSON.parse(mPropertyBag.dateFormatSettings) : undefined;
				this._oCurrencyFormatSettings = mPropertyBag.currencyFormatSettings ? JSON.parse(mPropertyBag.currencyFormatSettings) : undefined;
			} catch (ex) {
				// Invalid JSON provided!
			}
		}

		this._aODataFieldMetadata = [];
		this._oChartViewMetadata = null;
		this._oChartDataPointMetadata = null;
		this._aIgnoredFields = [];
		this._oMetadataAnalyser = new MetadataAnalyser(this._oParentODataModel);
		this._intialiseMetadata();
	};

	/**
	 * Initialises the necessary table metadata
	 * 
	 * @private
	 */
	ChartProvider.prototype._intialiseMetadata = function() {
		var oChartViewField, aChartViewMetadata = [], oField, i, iLen = 0;
		this._aODataFieldMetadata = this._oMetadataAnalyser.getFieldsByEntitySetName(this.sEntitySet);
		this._sFullyQualifiedEntityTypeName = this._oMetadataAnalyser.getEntityTypeNameFromEntitySetName(this.sEntitySet);

		if (!this._bSkipAnnotationParse) {
			this._oPresentationVariant = this._oMetadataAnalyser.getPresentationVariantAnnotation(this._sFullyQualifiedEntityTypeName, this._sPresentationVariantQualifier);
			if (this._oPresentationVariant && this._oPresentationVariant.chartAnnotation) {
				this._oChartAnnotation = this._oPresentationVariant.chartAnnotation;
			} else {
				this._oChartAnnotation = this._oMetadataAnalyser.getChartAnnotation(this._sFullyQualifiedEntityTypeName, this._sChartQualifier);
			}
		}
		if (!this._oDefaultDropDownDisplayBehaviour) {
			this._oDefaultDropDownDisplayBehaviour = this._oMetadataAnalyser.getTextArrangementValue(this._sFullyQualifiedEntityTypeName);
		}

		this._generateIgnoredFieldsArray();

		this._oControlProvider = new ControlProvider({
			metadataAnalyser: this._oMetadataAnalyser,
			model: this._oParentODataModel,
			fieldsMetadata: this._aODataFieldMetadata,
			dateFormatSettings: this._oDateFormatSettings,
			currencyFormatSettings: this._oCurrencyFormatSettings,
			defaultDropDownDisplayBehaviour: this._oDefaultDropDownDisplayBehaviour,
			useSmartField: this.useSmartField,
			enableDescriptions: false,
			entitySet: this.sEntitySet
		});

		if (this._aODataFieldMetadata) {
			iLen = this._aODataFieldMetadata.length;
		}

		for (i = 0; i < iLen; i++) {
			oField = this._aODataFieldMetadata[i];
			// Ignore the fields in the ignored list -or- the one marked with visible="false" in annotation
			if (this._aIgnoredFields.indexOf(oField.name) > -1 || !oField.visible) {
				continue;
			}

			// Check if field is not a Primitive type --> only generate metadata for primitive/simple type fields
			if (oField.type.indexOf("Edm.") === 0) {
				oChartViewField = this._getFieldViewMetadata(oField);
				this._enrichWithChartViewMetadata(oField, oChartViewField);
				aChartViewMetadata.push(oField);
			}
		}

		if (this._oChartAnnotation) {
			this._oChartViewMetadata = jQuery.extend({}, this._oChartAnnotation);
			// Convert chart type to UI5 format
			this._oChartViewMetadata.chartType = ChartMetadata.getChartType(this._oChartViewMetadata.chartType);
			this._oChartViewMetadata.fields = aChartViewMetadata;
		}
	};

	ChartProvider.prototype._setAnnotationMetadata = function(oFieldViewMetadata) {
		if (oFieldViewMetadata && oFieldViewMetadata.fullName) {
			var oSemanticObjects = this._oMetadataAnalyser.getSemanticObjectsFromAnnotation(oFieldViewMetadata.fullName);
			if (oSemanticObjects) {
				oFieldViewMetadata.semanticObjects = oSemanticObjects;
			}
		}
	};

	ChartProvider.prototype._getFieldViewMetadata = function(oField) {
		var oChartViewField = this._oControlProvider.getFieldViewMetadata(oField, false);
		this._setAnnotationMetadata(oChartViewField);

		return oChartViewField;
	};

	/**
	 * Generate an array of fields that need to be ignored in the SmartChart (if any)
	 * 
	 * @private
	 */
	ChartProvider.prototype._generateIgnoredFieldsArray = function() {
		if (this._sIgnoredFields) {
			this._aIgnoredFields = this._sIgnoredFields.split(",");
		}
	};

	/**
	 * Calculates additional attributes for a field
	 * 
	 * @param {object} oField - OData metadata for the chart field
	 * @param {object} oViewField - view metadata for the chart field
	 * @private
	 */
	ChartProvider.prototype._enrichWithChartViewMetadata = function(oField, oViewField) {

		oField.isMeasure = oField.aggregationRole && oField.aggregationRole === "measure";
		oField.isDimension = oField.aggregationRole && oField.aggregationRole === "dimension";

		oField.role = this._getRole(oField);

		oField.filterType = oViewField.filterType;
		if (oViewField.template) {
			oField.template = oViewField.template;
		}

		if (oField.isDimension) {
			oField.displayBehaviour = oViewField.displayBehaviour;
		}

		oField.isSemanticObject = (oViewField.semanticObjects) ? true : false;

		// set the inResult from metadata
		this._setInResult(oField);
		// set the sortOrder from metadata
		this._setSortOrder(oField);
	};

	/**
	 * Sets inResult on the field metadata if the field exists in the RequestAtLeast of PresentationVariant annotation
	 * 
	 * @param {object} oField - OData metadata for the table field
	 * @private
	 */
	ChartProvider.prototype._setInResult = function(oField) {
		// first check if field is part of PresentationVariant-->RequestAtLeastFields
		if (this._oPresentationVariant) {
			if (this._oPresentationVariant.requestAtLeastFields && this._oPresentationVariant.requestAtLeastFields.indexOf(oField.name) > -1) {
				oField.inResult = true;
			}
		}
	};

	/**
	 * Sets sorting realted info (sorted and sortOrder) on the field metadata if the field exists in the SortOrder of PresentationVariant annotation
	 * 
	 * @param {object} oField - OData metadata for the table field
	 * @private
	 */
	ChartProvider.prototype._setSortOrder = function(oField) {
		var iLen;
		// first check if field is part of PresentationVariant-->SortOrder
		if (this._oPresentationVariant && this._oPresentationVariant.sortOrderFields) {
			iLen = this._oPresentationVariant.sortOrderFields.length;
			for (var i = 0; i < iLen; i++) {
				if (this._oPresentationVariant.sortOrderFields[i].name === oField.name) {
					oField.sorted = true;
					oField.sortOrder = this._oPresentationVariant.sortOrderFields[i].descending ? "Descending" : "Ascending";
					break;
				}
			}
		}
	};

	ChartProvider.prototype._unmarkTextDimensions = function(aFields, aTextDimensionNames) {
		var i, oField;

		for (i = 0; i < aFields.length; i++) {
			oField = aFields[i];

			if (oField.isDimension) {
				if (aTextDimensionNames.indexOf(oField.name) > -1) {
					oField.isDimension = false;
				}
			}
		}
	};

	/**
	 * @param {object} oField - OData metadata for the chart field
	 * @returns {string} the role
	 */
	ChartProvider.prototype._getRole = function(oField) {
		if (this._oChartAnnotation) {
			if (oField.isDimension && this._oChartAnnotation.dimensionAttributes) {
				return ChartMetadata.getDimensionRole(this._oChartAnnotation.dimensionAttributes[oField.name]);
			} else if (oField.isMeasure && this._oChartAnnotation.measureAttributes) {
				return ChartMetadata.getMeasureRole(this._oChartAnnotation.measureAttributes[oField.name]);
			}
		}
	};

	/**
	 * Get the fields that can be added as Columns
	 * 
	 * @returns {Array} the table view metadata
	 * @public
	 */
	ChartProvider.prototype.getChartViewMetadata = function() {
		return this._oChartViewMetadata;
	};

	/**
	 * Get the Chart DataPoint metadata
	 * 
	 * @returns {Object} the DataPoint annotation object
	 * @public
	 */
	ChartProvider.prototype.getChartDataPointMetadata = function() {
		if (!this._oChartDataPointMetadata && this._sFullyQualifiedEntityTypeName) {
			this._oChartDataPointMetadata = this._oMetadataAnalyser.getDataPointAnnotation(this._sFullyQualifiedEntityTypeName);
		}
		return this._oChartDataPointMetadata;
	};

	/**
	 * Returns a flag indicating whether date handling with UTC is enabled for the table.
	 * 
	 * @returns {boolean} whether UTC date handling is enabled
	 * @public
	 */
	ChartProvider.prototype.getIsUTCDateHandlingEnabled = function() {
		return this._oDateFormatSettings ? this._oDateFormatSettings.UTC : false;
	};

	/**
	 * Destroys the object
	 * 
	 * @public
	 */
	ChartProvider.prototype.destroy = function() {
		if (this._oMetadataAnalyser && this._oMetadataAnalyser.destroy) {
			this._oMetadataAnalyser.destroy();
		}
		this._oMetadataAnalyser = null;
		if (this._oControlProvider && this._oControlProvider.destroy) {
			this._oControlProvider.destroy();
		}
		this._oControlProvider = null;
		this._aODataFieldMetadata = null;
		this._oChartViewMetadata = null;
		this._oChartDataPointMetadata = null;
		this._sIgnoredFields = null;
		this.bIsDestroyed = true;
	};

	return ChartProvider;
}, /* bExport= */true);
