/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global'], function(jQuery) {
	"use strict";

	/**
	 * Constructs a utility class to analyse the OData metadata document ($metadata), to resolve SAP-Annotations
	 *
	 * @constructor
	 * @param {sap.ui.model.odata.ODataModel}
	 *          oDataModel - odata model
	 * @public
	 * @author Markus Viol
	 */
	var ElementPreprocessor = function(oMetadataAnalyzer) {
		this._oMetadataAnalyzer = oMetadataAnalyzer;
		this._aEntityTypes = [];
		//map with invisibleFields per entity type
		this.invisibleFields = {};
	};

	/**
	 * Enriches the fields with additional information: complex type paths, ignored,
	 * usually called by more specific methods
	 * @param {array}
	 *          aFields - fields array
	 * @param {Array}
	 *          aIgnoredFields - List of fields which should be ignored.
	 * @param {Boolean}
	 *          bIsComplexType Set to true if fields are children of a complex type
	 * @returns {array} - object of fields which are visible *
	 * @private
	 * @name ElementPreprocessor#_updateAndFilterFields
	 * @function
	 */
	ElementPreprocessor.prototype._updateAndFilterFields = function(aFields, aIgnoredFields, bIsComplexType, sKey) {

		var aValidFields = [];
		for (var f = 0; f < aFields.length; f++) {
			var oCurrentField = aFields[f];
			if (oCurrentField.visible === false) {
				this.invisibleFields[sKey] = this.invisibleFields[sKey] || [];
				if (this.invisibleFields[sKey].indexOf(oCurrentField) === -1) {
					oCurrentField.isComplexType = bIsComplexType;
					this.invisibleFields[sKey].push(oCurrentField);
				}
				continue;
			}
			// TODO: check if the label is overridden in an annotation

			// only add fields which are not in ignored list
			var bIsFieldOnIgnoreList = this._isFieldOnIgnoreList(oCurrentField, aIgnoredFields, bIsComplexType);
			var bIsFieldBlacklisted = this._isFieldBlacklisted(oCurrentField);
			if (!bIsFieldOnIgnoreList && !bIsFieldBlacklisted) {
				if (this._isComplexType(oCurrentField) === true) {
					var aValidComplexTypeFields = this._resolveComplexTypeToFlatFieldList(oCurrentField, aIgnoredFields);
					if (aValidComplexTypeFields) {
						aValidFields = aValidFields.concat(aValidComplexTypeFields);
					}
				} else {
					aValidFields.push(oCurrentField);
				}
			}
		}
		return aValidFields;
	};

	/**
	 * Is field using a complex type
	 *
	 * @param {Object}
	 *          oField Field from entityType
	 * @returns {Boolean} Returns true if field is using a complex type
	 */
	ElementPreprocessor.prototype._isComplexType = function(oField) {
		if (oField && oField.type) {
			if (oField.type.toLowerCase().indexOf("edm") !== 0) {
				return true;
			}
		}
		return false;
	};

	/**
	 * COPIED
	 * Check if odata property matches specific checks which identify the field as non-listable
	 *
	 * @param {object}
	 *          oCurrentField Current property of entity set
	 * @returns {Boolean} Returns true if field is blacklisted and false if field can be added to list.
	 */
	ElementPreprocessor.prototype._isFieldBlacklisted = function(oCurrentField) {
		if (oCurrentField) {
			if (oCurrentField.name.toLowerCase().indexOf("uxfc") === 0) {
				return true;
			} else if (oCurrentField.type.toLowerCase() === "edm.time") {
				return true;
			}
		}
		return false;
	};
	/**
	 * Resolves a field from the entity type which is using a complex type into the underlying fields
	 *
	 * @param {Object}
	 *          oComplexTypeField Field from entity type which is using the complex type
	 * @param {Array}
	 *          aIgnoredFields Fields which should be ignored
	 * @returns {Array} Returns an array with all fields of the requested complex type
	 */
	ElementPreprocessor.prototype._resolveComplexTypeToFlatFieldList = function(oComplexTypeField, aIgnoredFields) {
		var aResult = [];
		var oSchemaDefinition = this._oMetadataAnalyzer.getSchemaDefinition();

		if (oComplexTypeField && oComplexTypeField.type && oSchemaDefinition) {
			var sTypeName = this._getComplexTypeName(oComplexTypeField);
			if (sTypeName) {
				var aComplexTypes = oSchemaDefinition.complexType;
				var i = 0;
				for (i = 0; i < aComplexTypes.length; i++) {
					var oCurrentComplexType = aComplexTypes[i];
					oCurrentComplexType["complexTypePropertyName"] = oComplexTypeField.name;
					oCurrentComplexType.entityName = oComplexTypeField.entityName;
					if (oCurrentComplexType.name === sTypeName) {
						aResult = this._getFieldsFromComplexType(oCurrentComplexType, aIgnoredFields);
						break;
					}
				}
			}
		}
		return aResult;
	};

	/**
	 * Enriches the fields of the current complext type with the type paths
	 *
	 * @param {Object}
	 *          oComplexType
	 * @param {Array}
	 *          aIgnoredFields Fields which should be ignored
	 * @returns Returns an array with fields from the complex type
	 */
	ElementPreprocessor.prototype._getFieldsFromComplexType = function(oComplexType, aIgnoredFields) {
		var aFields = this._oMetadataAnalyzer.getFieldsByComplexTypeName(oComplexType.name);
		if (aFields) {
			for (var i = 0; i < aFields.length; i++) {
				aFields[i]["isComplexProperty"] = true;
				// Within a complex type property we want the original entity type name of the reference parent entity type
				aFields[i]["entityName"] = oComplexType.entityName;
				aFields[i]["complexTypePropertyName"] = oComplexType.complexTypePropertyName;
			}
			return this._updateAndFilterFields(aFields, aIgnoredFields, true, oComplexType.name);
		}
		return [];
	};

	/**
	 * Get the name of a complex type without the namespace
	 *
	 * @param {Object}
	 *          oComplexType
	 * @returns Returns the name of the complex type without its namespace
	 */
	ElementPreprocessor.prototype._getComplexTypeName = function(oComplexType) {
		var aTypeDescription = oComplexType.type.split(".");
		if (aTypeDescription.length === 2) {
			return aTypeDescription[1];
		}
		return null;
	};

	/**
	 * Check if a odata property is on the list of ignored fields
	 *
	 * @param {Object}
	 *          oCurrentField Current property on entityset
	 * @param {Array}
	 *          aIgnoredFields List of ignored fields
	 * @param {Boolean}
	 *          bIsComplexType Set to true if fields are children of a complex type
	 * @returns {Boolean} Returns true if field was found on ignore list else false
	 */
	ElementPreprocessor.prototype._isFieldOnIgnoreList = function(oCurrentField, aIgnoredFields, bIsComplexType) {
		if (aIgnoredFields) {
			var numberOfEntitySets = this._aEntityTypes.length;
			var sQualifiedName = oCurrentField.entityName + "." + oCurrentField.name;
			// If number of entity sets is only one or fields are NOT children of a complex type,
			// then full qualified name or shortname is possible
			if (numberOfEntitySets === 1 && !bIsComplexType) {
				if (aIgnoredFields.indexOf(oCurrentField.name) !== -1 || aIgnoredFields.indexOf(sQualifiedName) !== -1) {
					return true;
				}
				// else only full qualified name is valid
			} else if (aIgnoredFields.indexOf(sQualifiedName) !== -1) {
				return true;
			}
		}
		return false;
	};

	/**
	 * @param {string/array}
	 *          vEntityTypes - entity types
	 * @param {string}
	 *          sAnnotation - annotation
	 * @returns {array} - object of label and EntityType name of the entitySet
	 * @private
	 * @name ElementPreprocessor#_getEntitySets
	 * @function
	 */
	ElementPreprocessor.prototype._getEntityTypes = function(vEntityTypes, sAnnotation) {

		var aEntityTypes = [];
		var sLabel;
		var aEntityTypeNames;

		if (!this._oMetadataAnalyzer || !this._oMetadataAnalyzer._oSchemaDefinition) {
			return [];
		}

		var aAllEntityTypList = this._oMetadataAnalyzer._oSchemaDefinition.entityType;
		// TODO:
		// if (sAnnotation) {
		// aEntityTypeNames = this._oMetadataAnalyzer.getEntityTypeNameByAnnotation(sAnnotation);
		// }
		if (!vEntityTypes) {
			aEntityTypeNames = [];
			for (var t = 0; t < aAllEntityTypList.length; t++) {
				aEntityTypeNames.push(aAllEntityTypList[t].name);
			}
		}
		if (!aEntityTypeNames) {
			aEntityTypeNames = this._convertEntityTypesToArray(vEntityTypes);
		}

		for (var e = 0; e < aEntityTypeNames.length; e++) {
			sLabel = this._oMetadataAnalyzer.getEntityLabelByEntityTypeName(aEntityTypeNames[e]);
			aEntityTypes.push({
				key : aEntityTypeNames[e],
				label : sLabel || aEntityTypeNames[e]
			});
		}

		return aEntityTypes;
	};

	/**
	 * @param {string/array}
	 *          vEntityTypes - entity types
	 * @returns {array} - entity types
	 * @private
	 * @name sap.ui.comp.odata.FieldSelector#_convertEntityTypesToArray
	 * @function
	 */
	ElementPreprocessor.prototype._convertEntityTypesToArray = function(vEntityTypes) {

		if (typeof (vEntityTypes) === "string") {
			var sRawString = vEntityTypes.replace(/ /g, '');
			return sRawString.split(',');
		}

		if (jQuery.isArray(vEntityTypes)) {
			return vEntityTypes;
		}

		return undefined;
	};

	/**
	 * Destroys the inner references
	 *
	 * @public
	 * @name sap.ui.comp.odata.FieldSelector#destroy
	 * @function
	 */
	ElementPreprocessor.prototype.destroy = function() {

		if (this._oMetadataAnalyzer && this._oMetadataAnalyzer.destroy) {
			this._oMetadataAnalyzer.destroy();
		}
		this._oMetadataAnalyzer = null;
		this._aEntityTypes = null;
	};

	return ElementPreprocessor;

}, /* bExport= */true);
