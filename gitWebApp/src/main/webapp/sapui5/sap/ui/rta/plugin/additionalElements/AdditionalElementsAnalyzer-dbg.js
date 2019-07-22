/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

 sap.ui.define(['sap/ui/comp/odata/MetadataAnalyser', 'sap/ui/comp/smartfield/AnnotationHelper', 'sap/ui/core/StashedControlSupport', 'sap/ui/dt/ElementUtil', 'sap/ui/rta/Utils'],
	function(MetadataAnalyser, AnnotationHelper, StashedControlSupport, ElementUtil, RtaUtils){
	"use strict";

	var oAnnotationHelper = new AnnotationHelper();

	function _getBoundEntityType (oElement, oModel) {
		var _oModel = oModel ? oModel : oElement.getModel();
		var oBindingContext = oElement.getBindingContext();
		if (oBindingContext) {
			var oEntityTypeMetadata = _oModel.oMetadata._getEntityTypeByPath(oBindingContext.getPath());
			return oEntityTypeMetadata.name;
		}
		return "";
	}

	/**
	 * Is field using a complex type
	 *
	 * @param {Object}
	 *          oProperty property from entityType
	 * @returns {Boolean} Returns true if property is using a complex type
	 */
	function _isComplexType (oProperty) {
		if (oProperty && oProperty.type) {
			if (oProperty.type.toLowerCase().indexOf("edm") !== 0) {
				return true;
			}
		}
		return false;
	}

	function _expandComplexProperties(aODataProperties, oMetadataAnalyzer){
		return aODataProperties.reduce(function(aExpandedProperties, oProperty){
			var vProps = oProperty;
			if (_isComplexType(oProperty)) {
				vProps = oMetadataAnalyzer.getFieldsByComplexTypeName(oProperty.type).map(function(oComplexProperty){
					oComplexProperty.bindingPath = oProperty.name + "/" + oComplexProperty.name;
					oComplexProperty.entityName = oProperty.entityName;
					oComplexProperty.referencedComplexPropertyName = oProperty.fieldLabel ? oProperty.fieldLabel : oProperty.name;
					return oComplexProperty;
				});
			} else {
				//harmonize structure
				vProps.bindingPath = oProperty.name;
			}
			return aExpandedProperties.concat(vProps);
		}, []);
	}

	function _filterInvisibleProperties(aODataProperties, oElement) {
		return aODataProperties.filter(function(oProperty){
			//sap:visible=false and or "com.sap.vocabularies.Common.v1.FieldControl" with EnumMember "com.sap.vocabularies.Common.v1.FieldControlType/Hidden"
			//handled by MetadataAnalyser
			return oProperty.visible;
		}).filter(function(oProperty){
			//@runtime hidden by field control value = 0
			var sFieldControlPath = oAnnotationHelper.getFieldControlPath(oProperty);
			if (sFieldControlPath){
				var iFieldControlValue = oElement.getBindingContext().getProperty(sFieldControlPath);
				return iFieldControlValue !== 0;
			}
			return true;
		});
	}

	function _getODataPropertiesOfModel (oElement) {
		var oModel = oElement.getModel();
		var aResult = [];
		if (oModel) {
			var sModelName = oModel.getMetadata().getName();
			if (sModelName === "sap.ui.model.odata.ODataModel" || sModelName === "sap.ui.model.odata.v2.ODataModel") {
				aResult = oModel.getMetaModel().loaded().then(function(){
					var oMetadataAnalyzer = new MetadataAnalyser(oModel);
					var sEntityType = _getBoundEntityType(oElement, oModel);
					var aODataProperties = oMetadataAnalyzer.getFieldsByEntityTypeName(sEntityType) || [];
					aODataProperties = _expandComplexProperties(aODataProperties, oMetadataAnalyzer);
					aODataProperties = _filterInvisibleProperties(aODataProperties, oElement);
					return aODataProperties;
				});
			}
		}
		return aResult;
	}

	function _oDataPropertyToAdditionalElementInfo (oODataProperty){
		return {
			selected : false,
			label : oODataProperty.renamedLabel ? oODataProperty.renamedLabel : oODataProperty.fieldLabel,
			referencedComplexPropertyName: oODataProperty.referencedComplexPropertyName ? oODataProperty.referencedComplexPropertyName : "",
			duplicateComplexName: oODataProperty.duplicateComplexName ? oODataProperty.duplicateComplexName : false,
			tooltip :  oODataProperty.quickInfo || oODataProperty.fieldLabel,
			//command relevant data
			type : "odata",
			entityType : oODataProperty.entityName,
			name : oODataProperty.name,
			bindingPath : oODataProperty.bindingPath,
			originalLabel: oODataProperty.renamedLabel && oODataProperty.renamedLabel !== oODataProperty.fieldLabel ? oODataProperty.fieldLabel : ""
		};
	}

	function _elementToAdditionalElementInfo (mData){
		var oElement = mData.element;
		var mAction = mData.action;
		return {
			selected : false,
			label : RtaUtils.getLabelForElement(oElement, mAction.getLabel),
			tooltip : RtaUtils.getLabelForElement(oElement, mAction.getLabel),
			referencedComplexPropertyName: oElement.referencedComplexPropertyName ? oElement.referencedComplexPropertyName : "",
			duplicateComplexName: oElement.duplicateComplexName ? oElement.duplicateComplexName : false,
			bindingPaths: oElement.bindingPaths,
			originalLabel: oElement.renamedLabel && oElement.renamedLabel !== oElement.labelFromOData ? oElement.labelFromOData : "",
			//command relevant data
			type : "invisible",
			element : oElement
		};
	}

	function _getBindingPaths (oElement, mAction) {
		var aBindingPaths = [];
		if (mAction.getBoundChildren) {
			mAction.getBoundChildren(oElement).forEach(function(oField) {
				if (oField.mBindingInfos) {
					for ( var oInfo in oField.mBindingInfos) {
						var sPath = RtaUtils.getPathFromBindingInfo(oInfo, oField.mBindingInfos);
						if (sPath) {
							aBindingPaths.push(sPath);
						}
					}
				}
			});
		}
		return aBindingPaths;
	}

	function _getBoundChildren (sAggregationName, oElement) {
		var aBoundChildren = [];
		ElementUtil.getAggregation(oElement, sAggregationName).forEach(function(oChildElement){
			if (jQuery.isEmptyObject(oChildElement.mBindingInfos)){
				//look deeper
				for (var sChildAggregationName in oChildElement.getMetadata().getAllAggregations()) {
					aBoundChildren = aBoundChildren.concat(_getBoundChildren(sChildAggregationName, oChildElement));
				}
			} else {
				aBoundChildren.push(oChildElement);
			}
		});
		return aBoundChildren;
	}

	function _getRelevantElements(oElement, oRelevantContainer){
		if (oRelevantContainer){
			return ElementUtil.findAllSiblingsInContainer(oElement, oRelevantContainer);
		} else {
			return [oElement];
		}
	}

	function _checkForComplexDuplicates(aODataProperties) {
		aODataProperties.forEach(function(oODataProperty, index, aODataProperties) {
			if (oODataProperty["duplicateComplexName"] !== true) {
				for (var j = index + 1; j < aODataProperties.length - 1; j++) {
					if (oODataProperty.fieldLabel === aODataProperties[j].fieldLabel) {
						oODataProperty["duplicateComplexName"] = true;
						aODataProperties[j]["duplicateComplexName"] = true;
					}
				}
			}
		});
		return aODataProperties;
	}

	var oAnalyzer = {
		//depending on the available actions for the aggregation call one or both of these methods

		enhanceInvisibleElements : function(oParent, mRevealData){
			return Promise.resolve().then(function () {
				return _getODataPropertiesOfModel(oParent);
			}).then(function(aODataProperties) {
				aODataProperties = _checkForComplexDuplicates(aODataProperties);

				var aInvisibleElements = mRevealData.elements || [];

				return aInvisibleElements.map(function(oInvisibleElement) {
					var sType = oInvisibleElement.getMetadata().getName();
					//TODO fix with stashed type support

					var mTypeData = mRevealData.types[sType];
					var mAction = mTypeData.action;


					oInvisibleElement.bindingPaths = _getBindingPaths(oInvisibleElement, mAction);
					oInvisibleElement.fieldLabel = RtaUtils.getLabelForElement(oInvisibleElement, mAction.getLabel);

					//check for duplicate labels to later add the referenced complexTypeName if available
					aODataProperties.some(function(oUnboundProperty) {
						if (oUnboundProperty.fieldLabel === oInvisibleElement.fieldLabel) {
							oInvisibleElement.duplicateComplexName = true;
							return true;
						}
					});

					//add information from the oDataProperty to the InvisibleProperty
					aODataProperties.some(function(oUnboundProperty) {
						if (oInvisibleElement.bindingPaths && oInvisibleElement.bindingPaths.indexOf(oUnboundProperty.bindingPath) > -1) {
							oInvisibleElement.labelFromOData = oUnboundProperty.fieldLabel;
							if (oInvisibleElement.fieldLabel !== oInvisibleElement.labelFromOData) {
								oInvisibleElement.renamedLabel = true;
							}
							if (oUnboundProperty.referencedComplexPropertyName) {
								oInvisibleElement.referencedComplexPropertyName = oUnboundProperty.referencedComplexPropertyName;
							}
							return true;
						}
					});

					return {
						element : oInvisibleElement,
						action : mAction
					};
				});
			}).then(function(aAllElementData) {
				return aAllElementData.map(_elementToAdditionalElementInfo);
			});
		},

		getUnboundODataProperties : function(oElement, mAction){
			//TODO split in smaller functions
			return Promise.resolve().then(function () {
				return _getODataPropertiesOfModel(oElement);
			}).then(function(aODataProperties) {
				var aRelevantElements = _getRelevantElements(oElement, mAction.relevantContainer);

				var aAllChildren = aRelevantElements.reduce(function (aPreviousChildren, oCurrentElement) {
					return aPreviousChildren.concat(_getBoundChildren.bind(null, mAction.aggregation)(oCurrentElement));
				}, []);

				var mRenamedLabels = {};
				var mVisiblyBoundProperties = aAllChildren.reduce(function(mProperties, oChildElement){
					if (oChildElement.mBindingInfos) {
						for ( var oInfo in oChildElement.mBindingInfos) {
							var sPath = RtaUtils.getPathFromBindingInfo(oInfo, oChildElement.mBindingInfos);
							if (sPath) {
								mProperties[sPath] = true;
								mRenamedLabels[sPath] = RtaUtils.getLabelForElement(oChildElement, mAction.getLabel);
							}
						}
					}
					return mProperties;
				}, {});

				var fnFilter = mAction.filter ? mAction.filter : function() {return true;};
				aODataProperties = aODataProperties.reduce(function(aODataProperties, oDataProperty) {
					oDataProperty["renamedLabel"] = mRenamedLabels[oDataProperty.bindingPath];
					if (!mVisiblyBoundProperties[oDataProperty.bindingPath] && fnFilter(oElement, oDataProperty)) {
						return aODataProperties.concat(oDataProperty);
					} else {
						return aODataProperties;
					}
				}, []);

				aODataProperties = _checkForComplexDuplicates(aODataProperties);

				return aODataProperties;
			}).then(function(aUnboundODataProperties) {
				return aUnboundODataProperties.map(_oDataPropertyToAdditionalElementInfo);
			});
		}
	};
	return oAnalyzer;
});
