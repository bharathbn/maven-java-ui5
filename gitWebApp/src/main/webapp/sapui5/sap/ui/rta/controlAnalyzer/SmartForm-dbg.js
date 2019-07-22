/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/controlAnalyzer/Base', 'sap/ui/rta/Utils', 'sap/ui/dt/ElementUtil',
		'sap/ui/rta/ModelConverter', 'sap/ui/comp/odata/MetadataAnalyser', 'sap/ui/rta/model/ElementPreprocessor'],
		function(Base, Utils, ElementUtil, ModelConverter, MetadataAnalyser, ElementPreprocessing) {
			"use strict";

			/**
			 * Constructor for a new change controller for the SmartForm. Do not instantiate this class directly! Instead use
			 * the ControlAnalyzerFactory.
			 *
			 * @class Context - controller for flexibility changes
			 * @extends sap.ui.base.ManagedObject
			 * @author SAP SE
			 * @version 1.44.4
			 * @constructor
			 * @private
			 * @since 1.34
			 * @alias sap.ui.rta.controlAnalyzer.SmartForm
			 * @augments sap.ui.rta.controlAnalyzer.Base
			 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API
			 *               might be changed in future.
			 */
			var SmartForm = Base.extend("sap.ui.rta.controlAnalyzer.SmartForm", {
				metadata : {
					library : "sap.ui.rta",
					properties : {
						customFieldAvailable : {
							type : "object",
							defaultValue : false
						}
					}
				}
			});

			SmartForm.rules = {};
			SmartForm.rules["EXCLUDEVISIBLERULE"] = "excludeVisibleElements";
			SmartForm.rules["EXCLUDEIGNOREDFIELDS"] = "excludeIgnoredFields";

			/**
			 * @override
			 */
			SmartForm.prototype.init = function() {
				var that = this;
				this._mVisibleAndBoundFields;
				this._mRegisteredRules = {};
				this._mRegisteredRules[SmartForm.rules.EXCLUDEVISIBLERULE] = function(oElement) {
					if (!that._mVisibleAndBoundFields) {
						that._mVisibleAndBoundFields = that.findBoundFields(false);
					}
					return that._retrieveElementFromMap(that._mVisibleAndBoundFields, oElement);
				};
				this._mRegisteredRules[SmartForm.rules.EXCLUDEIGNOREDFIELDS] = function(oElement) {
					var aIgnoredFields = that._getIgnoredFields();
					//Complex properties are divided by '.'
					if (oElement.isComplexProperty) {
						return aIgnoredFields.indexOf(oElement.complexTypePropertyName + "." + oElement.name) !== -1;
					}
					return aIgnoredFields.indexOf(oElement.name) !== -1;
				};
			};
			/**
			 * @override
			 */
			SmartForm.prototype.setControl = function(oControl) {
				var oSmartForm = Utils.getClosestTypeForControl(oControl, "sap.ui.comp.smartform.SmartForm");
				this.setProperty("control", oSmartForm, true);
				this.setProperty("selectedControl", oControl, true);
			};

			/**
			 * @override
			 */
			SmartForm.prototype.getFlexChangeType = function(sType, oElement) {

				var sFlexChangeType;
				switch (sType) {
					case "add" :
						if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.SmartForm")) {
							sFlexChangeType = "addGroup";
						} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.Group")) {
							sFlexChangeType = "addFields";
						}
						break;
					case "rename" :
						if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.SmartForm")) {
							sFlexChangeType = "renameField";
						} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.Group")) {
							sFlexChangeType = "renameGroup";
						} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.GroupElement")) {
							sFlexChangeType = "renameField";
						}
						break;
					default :
						break;
				}
				return sFlexChangeType;
			};

			/**
			 * @override
			 */
			SmartForm.prototype.mapSpecificChangeData = function(sType, mSpecificChangeData) {
				var mResult;
				switch (sType) {
					case "Add" :
						mResult = this._mapAddSpecificChangeData(sType, mSpecificChangeData);
						break;
					case "Rename" :
						mResult = this._mapRenameSpecificChangeData(sType, mSpecificChangeData);
						break;
					default :
						mResult = this.prototype.mapSpecificChangeData(sType, mSpecificChangeData);
						break;
				}
				return mResult;
			};

			/**
			 * @override
			 */
			SmartForm.prototype.getRenamableControl = function(oElement) {
				if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.Group")) {
					return oElement.getTitle();
				} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.GroupElement")) {
					return oElement.getLabel();
				}
			};

			SmartForm.prototype.getLabel = function(oElement) {
				if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.SmartForm")) {
					return oElement.getTitle();
				} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.Group")) {
					return oElement.getLabel();
				} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.GroupElement")) {
					return oElement.getLabelText();
				}
			};

			SmartForm.prototype.getLabelBinding = function(oElement) {
				if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.SmartForm")) {
					return oElement.getBindingInfo("title");
				} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.Group")
						|| ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.GroupElement")) {
					return oElement.getBindingInfo("label");
				}
			};

			SmartForm.prototype.resumeLabelBinding = function(oElement) {
				if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.SmartForm")) {
					var oBinding = oElement.getBinding("title");
					if (oBinding) {
						oBinding.resume();
					}
				} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.Group")
						|| ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.GroupElement")) {
					var oBinding = oElement.getBinding("label");
					if (oBinding) {
						oBinding.resume();
					}
				}
			};

			SmartForm.prototype._mapAddSpecificChangeData = function(sType, mSpecificChangeData) {
				if (mSpecificChangeData.changeType === "addFields") {
					mSpecificChangeData.fieldLabels = mSpecificChangeData.labels;
					delete mSpecificChangeData.labels;

				} else if (mSpecificChangeData.changeType === "addGroup") {
					mSpecificChangeData.groupLabel = mSpecificChangeData.labels[0];
					delete mSpecificChangeData.labels;
				}
				return mSpecificChangeData;
			};

			SmartForm.prototype._mapRenameSpecificChangeData = function(sType, mSpecificChangeData) {

				var oElement = mSpecificChangeData.element;

				if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.SmartForm")) {
					mSpecificChangeData.fieldLabel = mSpecificChangeData.value;
					mSpecificChangeData.labelProperty = "title";
				} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.Group")) {
					mSpecificChangeData.groupLabel = mSpecificChangeData.value;
				} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.GroupElement")) {
					mSpecificChangeData.fieldLabel = mSpecificChangeData.value;
					mSpecificChangeData.labelProperty = "label";
				}
				delete mSpecificChangeData.value;
				delete mSpecificChangeData.element;

				return mSpecificChangeData;

			};

			/**
			 * @override
			 */
			SmartForm.prototype.getSelectedBlock = function(oControl) {
				return Utils.findSupportedBlock(oControl, ["sap.ui.comp.smartform.Group"]);
			};

			/**
			 * @override
			 */
			SmartForm.prototype.getClosestType = function(oControl) {
				return Utils.getClosestTypeForControl(oControl, "sap.ui.comp.smartform.SmartForm");
			};

			/**
			 * @override
			 */
			SmartForm.prototype.createChangeData = function(oControl, oCurrentSelectedBlock, bHideControl, oSelectedControl) {
				var mChangeData = {};
				var oBindingContextObject = oControl.getBindingContext().getObject();
				var sControlId;
				if (oBindingContextObject.controlId) {
					sControlId = oBindingContextObject.controlId;
				} else {
					if (oBindingContextObject.complexTypePropertyName) {
						sControlId = oCurrentSelectedBlock.getId()
							+ "_" + oBindingContextObject.entityName
							+ "_" + oBindingContextObject.complexTypePropertyName
							+ "_" + oBindingContextObject.name;
					} else {
						sControlId = oCurrentSelectedBlock.getId()
							+ "_" + oBindingContextObject.entityName
							+ "_" + oBindingContextObject.name;
					}
				}
				var oSmartField = sap.ui.getCore().byId(sControlId);
				var bControlExists = !!oSmartField;

				var fnCreateChangeEvent = function() {
					if (bControlExists) {
						mChangeData = {
							controlId : sControlId,
							changeType : bHideControl ? "hideControl" : "unhideControl"
						};
					} else {
						// create new control
						var sBindingPath = oBindingContextObject.complexTypePropertyName ? oBindingContextObject.complexTypePropertyName + "/"
								+ oBindingContextObject.name : oBindingContextObject.name;
						if (oCurrentSelectedBlock) {
							var oGroup;
							if (oCurrentSelectedBlock instanceof sap.ui.comp.smartform.Group) {
								oGroup = oCurrentSelectedBlock;
							} else {
								oGroup = oCurrentSelectedBlock.getGroups()[0];
							}
							var aGroupElements = oGroup.getGroupElements();
							var iTargetIndex = Utils.determineTargetIndex(oSelectedControl, oCurrentSelectedBlock, aGroupElements, -1);

							mChangeData = {
								unhide : bControlExists,
								newControlId : sControlId,
								jsType : "sap.ui.comp.smartfield.SmartField",
								selectorId : oGroup.getId(),
								index : iTargetIndex,
								valueProperty : "value",
								changeType : "addField",
								fieldLabel : oBindingContextObject.fieldLabel,
								fieldValue : sBindingPath
							};
						}
					}
					return mChangeData;
				};

				if (bHideControl && !this.isHideable(oSmartField)) {
					return Utils.openRemoveElementConfirmationDialog(oSmartField).then(function(bConfirmed) {
						if (bConfirmed) {
							return fnCreateChangeEvent();
						} else {
							return null;
						}
					});
				} else {
					return new Promise(function(resolve, reject) {
						resolve(fnCreateChangeEvent());
					});
				}

			};

			/**
			 * @override
			 */
			SmartForm.prototype.findChangedFieldLabels = function() {
				if (!this._mFieldsAndLabelNames) {
					this._mFieldsAndLabelNames = this._findChangedFieldLabels();
				}
				return this._mFieldsAndLabelNames;
			};

			SmartForm.prototype._findChangedFieldLabels = function() {
				var mFieldsAndLabelNames = {};
				var mInvisibleBoundFields = this.findBoundFields(true);
				var mVisibleBoundFields = this.findBoundFields(false);
				var mAllBoundFields = jQuery.extend( {}, mInvisibleBoundFields, mVisibleBoundFields );
				for (var sPathValue in mAllBoundFields) {
					var oField = sap.ui.getCore().byId(mAllBoundFields[sPathValue]);
					var sText = Utils.getLabelForElement(oField);
					mFieldsAndLabelNames[sPathValue] = sText;
				}
				return mFieldsAndLabelNames;
			};

			/**
			 * Get all visible or invisible bound fields of the given smart form instance
			 * inside the all groupElements
			 * @override
			 */
			SmartForm.prototype.findBoundFields = function(bOnlyInvisibleFields) {
				// TODO: can be control specific (not generic)
				var oSmartForm = this.getControl();
				var aGroups = oSmartForm.getGroups();
				var oFieldData = {
						elementIds : {},
						boundFields : {}
				};
				var i, j, k = 0;
				for (i = 0; i < aGroups.length; i++) {
					var aElements = aGroups[i].getGroupElements();
					for (j = 0; j < aElements.length; j++) {
						var oFormElement = aElements[j];
						var aFields = oFormElement.getFields();
						for (k = 0; k < aFields.length; k++) {
							var oField = aFields[k];
							if (oField.mBindingInfos) {
								for ( var oInfo in oField.mBindingInfos) {
									var sPath = Utils.getPathFromBindingInfo(oInfo, oField.mBindingInfos);
									var oParent = oField.getParent();
									if (oParent && sPath) {
										//only groupElements which are invisible
										if (bOnlyInvisibleFields && !oFormElement.getVisible()) {
											this._addBoundFields(oFieldData, sPath, oField);
											continue;
										}
										//only groupElements which are visible
										if (oFormElement.getVisible() && !bOnlyInvisibleFields) { // existing domref
											this._addBoundFields(oFieldData, sPath, oField);
										}
									}
								}
							}
						}
					}
				}

				return oFieldData.boundFields;
			};


			SmartForm.prototype._addBoundFields = function(oFieldData, sPath, oField) {
				var oParent = oField.getParent();
				//check if we already found a binding path
				if (oFieldData.boundFields[sPath]) {
					//if so we use the groupElement with only one field
					if (oParent.getFields().length === 1) {
						oFieldData.boundFields[sPath] = oParent.getId();
					//if the groupElement has already more than one field we try to use the previous groupelement.
					} else if (oFieldData.elementIds[oField.getId()] && oFieldData.elementIds[oField.getId()].getFields() === 1) {
						oFieldData.boundFields[sPath] = oParent.getId();
					}
				} else {
					oFieldData.boundFields[sPath] = oParent.getId();
				}
				 oFieldData.elementIds[oField.getId()] = oParent;
			};


			/**
			 * Checks if a custom field is available
			 *
			 * @param {sap.ui.core.Control}
			 *          oControl Currently selected control
			 * @return {Boolean} true if custom fields are available, else false
			 * @private
			 */
			SmartForm.prototype._prepareCustomFields = function() {
				var that = this;
				return Utils.isCustomFieldAvailable(this.getSelectedControl()).then(function(oResult) {
					if (oResult) {
						that.setCustomFieldAvailable(oResult);
					}
					return oResult;
				});
			};

			/**
			 * Read ignored fields from smart form and parse CSV into array
			 *
			 * @param {sap.ui.comp.smartform.SmartForm} oSmartForm smart form instance
			 * @private
			 * @returns {Array} Returns a list of ignored fields or empty.
			 */
			SmartForm.prototype._getIgnoredFields = function() {
				var oSmartForm = this.getControl();
				if (oSmartForm) {
					var sCsvIgnoredFields = oSmartForm.getIgnoredFields();
					if (sCsvIgnoredFields) {
						var aIgnoredFields = sCsvIgnoredFields.split(",");
						return aIgnoredFields;
					}
				}
				return [];
			};

			/**
			 * Checks if a custom field is available
			 *
			 * @param {sap.ui.core.Control}
			 *          oControl Currently selected control
			 * @return {Boolean} true if custom fields are available, else false
			 * @private
			 */
			SmartForm.prototype.getCustomFieldAvailable = function() {
				if (!this.getPrepared()) {
					this._raiseIllegalState();
				}
				return this.getProperty("customFieldAvailable");
			};

			/**
			 * Getter for field model which contains only the invisible fields
			 *
			 * @param {sap.ui.core.Control}
			 *          oControl Currently selected control
			 * @return field model with invisible fields
			 * @private
			 */
			SmartForm.prototype.getCustomizeControlModel = function(oControl, bFiltered) {
				// TODO: Remove, old model
				var oClosestType = this.getClosestType(oControl);
				var vEntityType = oClosestType.getEntityType();

				if (vEntityType) {
					vEntityType = vEntityType.replace(/\s+/g, '').match(/([^,]+)/g);
				}

				if (!bFiltered) {
					return ModelConverter.getConvertedModelWithBoundAndRenamedLabels(oClosestType, vEntityType, this);
				} else {
					return ModelConverter.getConvertedModelWithBoundAndRenamedLabels(oClosestType, vEntityType, this).then(
							function(aElements) {
								return aElements.filter(function(mElement) {
									return !mElement.checked;
								});
							});
				}
			};

			/**
			 * @overwrite
			 */
			SmartForm.prototype.prepare = function() {
				if (!this.getPrepared()) { // prevent redundant preparation
					// 1. compute collection of fields that can be added to the control
					var fetchFieldsPromise = this._getFieldFetcherPromise();
					// 2. compute whether or not it's possible to ad custom fields to the control
					var fnIsCustomFieldAvailable = this._prepareCustomFields();

					return Promise.all([fetchFieldsPromise, fnIsCustomFieldAvailable]);
				} else {
					return new Promise().resolve();
				}
			};

			/**
			 * @return a Promise to compute collection of adable and not available fields
			 */
			SmartForm.prototype._getFieldFetcherPromise = function() {
				var that = this;
				return Utils.fetchODataPropertiesFor(this.getControl().getModel()).then(function(mProperties) {
					var sEntityTypeName = that.getBoundEntityType();
					Object.keys(mProperties).forEach(function(sEntityType) {
						mProperties[sEntityType].forEach(function(oElement) {
							var oChangedElement = that._applyChanges(oElement);
							var bFiltered = that._applyRules(oChangedElement);
							if (!bFiltered && oChangedElement.entityName === sEntityTypeName) {
								that._mAvailableElements[oChangedElement.name] = oChangedElement;
							} else {
								that._mHiddenElements[oChangedElement.name] = oChangedElement;
							}
						});
					});
					// filter properties, that are bound in the same combined groupElement
					that._mAvailableElements = Object.keys(that._mAvailableElements).reduce(function(mAvailable, sElement){
						var oElement = that._mAvailableElements[sElement];

						if (!oElement.controlId
							|| !Object.keys(mAvailable).some(function(sKey){
									var oPreviousElement = mAvailable[sKey];
									return oPreviousElement.controlId === oElement.controlId;
								})
							) {
							mAvailable[sElement] = oElement;
						}
						return mAvailable;
					}, {});
					sap.ui.rta.controlAnalyzer.Base.prototype.prepare.apply(that);
				});
			};

			/**
			 * @param oElement
			 *          a smart field
			 * @return true if field does not satisfy all rules to be a candidate to be added to the control, false if all
			 *         rules are satisfied
			 */
			SmartForm.prototype._applyRules = function(oElement) {
				var mFnRules = this._getRules();
				var bFiltered = false;
				for ( var sRule in mFnRules) {
					var fnRule = mFnRules[sRule];
					if (fnRule(oElement)) {
						bFiltered = true;
						break;
					}
				}
				return bFiltered;
			};

			/**
			 * Applies all static changes to the field originated in the model meta data
			 *
			 * @private
			 * @param oElement
			 *          a smart field
			 * @return changed oElement
			 */
			SmartForm.prototype._applyChanges = function(oElement) {
				var oChangedElement = oElement;
				var aFnChanges = this._getChanges();
				aFnChanges.forEach(function(fnChange) {
					oChangedElement = fnChange(oChangedElement);
				});
				return oChangedElement;
			};

			/**
			 * Returns the registered rules for filtering the available fields
			 *
			 * @return a map of name, rule pairs (every rule has a name
			 */
			SmartForm.prototype._getRules = function() {
				return this._mRegisteredRules;
			};

			/**
			 * Get the bound entityType of the selecected control. In case of a group element
			 * we use its parent group as this is where fields get added to.
			 */
			SmartForm.prototype.getBoundEntityType = function() {
				var oControl = this.getSelectedControl();

				if (ElementUtil.isInstanceOf(oControl, "sap.ui.comp.smartform.GroupElement")) {
					oControl = oControl.getParent();
				}

				if (oControl.getBindingContext() && oControl.getModel()) {
					return Utils.getBoundEntityType(oControl);
				}
			};

			SmartForm.prototype._retrieveElementFromMap = function(mElements, oElement) {
				var oResultElement;
				if (oElement.isComplexProperty) {
					oResultElement = mElements[oElement.complexTypePropertyName + "/" + oElement.name];
				} else {
					oResultElement = mElements[oElement.name];
				}
				return oResultElement;
			};

			SmartForm.prototype._determineGroupIndex = function(oElement) {
				var iIndex = 0;
				if (oElement.getMetadata().getName() === "sap.ui.comp.smartform.Group") {
					var aGroups = oElement.getParent().getAggregation("formContainers");
					for (var i = 0; i < aGroups.length; i++) {
						if (aGroups[i].getId() === oElement.getId()) {
							iIndex = i + 1;
							break;
						}
					}
				}
				return iIndex;
			};

			/**
			 * Returns all modifying functions to be applied to the raw field definition
			 * 1. renamed field labels & 2. find already bound, but hidden fields
			 * @return an array of modifying functions
			 */
			SmartForm.prototype._getChanges = function() {
				var that = this;
				return [function(oElement) {
					var mChangedFieldLabels = that.findChangedFieldLabels(oElement);
					var oChangedElement = that._retrieveElementFromMap(mChangedFieldLabels, oElement);
					if (oChangedElement) {
						oElement["fieldLabel"] = oChangedElement;
					}
					return oElement;
				}, function(oElement) {
					var sControlId;
					if (!that._mBoundFields) {
						that._mBoundFields = that.findBoundFields(true);
					}
					if (oElement.isComplexProperty) {
						sControlId = that._mBoundFields[oElement.complexTypePropertyName + "/" + oElement.name];
					} else {
						sControlId = that._mBoundFields[oElement.name];
					}
					if (sControlId) {
						oElement["controlId"] = sControlId;
					}
					return oElement;
				}];
			};

			/**
			 * @override
			 */
			SmartForm.prototype.checkTargetZone = function(oParentElement, sAggregationName, oMovedElement) {
				var oSourceSmartForm = ElementUtil.getClosestElementOfType(oMovedElement, "sap.ui.comp.smartform.SmartForm");
				var oTargetSmartForm = ElementUtil.getClosestElementOfType(oParentElement, "sap.ui.comp.smartform.SmartForm");

				if (oSourceSmartForm === oTargetSmartForm) {
					return true;
				}
			};

			/**
			 * @override
			 */
			SmartForm.prototype.isMandatory = function(oElement) {
				var bMandatory = false;

				if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.GroupElement")) {
					var aFields = oElement.getFields();
					for (var i = 0; i < aFields.length; i++) {
						var oGroupElement = aFields[i];
						if (ElementUtil.isInstanceOf(oGroupElement, "sap.ui.comp.smartfield.SmartField") && oGroupElement.getMandatory()) {
							// Break searching all SmartFields and get back on the
							// first found mandatory rendered SmartField
							bMandatory = true;
							break;
						}
					}
				} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.Group")) {
					var aGroupElements = oElement.getGroupElements();
					for (var j = 0; j < aGroupElements.length; j++) {
						return this.isMandatory(aGroupElements[j]);
					}
				}
				return bMandatory;
			};

			/**
			 * @override
			 */
			SmartForm.prototype.isHideable = function(oElement) {
				return ((ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.GroupElement") || ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.Group")) && !this.isMandatory(oElement));
			};

			return SmartForm;

		}, /* bExport= */true);
