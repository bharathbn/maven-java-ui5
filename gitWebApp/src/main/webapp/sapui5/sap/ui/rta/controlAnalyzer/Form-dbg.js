/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/controlAnalyzer/Base', 'sap/ui/rta/Utils', 'sap/ui/dt/ElementUtil', 'sap/ui/fl/Utils'],
		function(Base, Utils, ElementUtil, FlexUtils) {
			"use strict";

			/**
			 * Constructor for a new change controller for the sap.ui.layout.form. Do not instantiate this class directly!
			 * Instead use the ControlAnalyzerFactory.
			 *
			 * @class Context - controller for flexibility changes
			 * @extends sap.ui.base.ManagedObject
			 * @author SAP SE
			 * @version 1.44.4
			 * @constructor
			 * @private
			 * @since 1.34
			 * @alias sap.ui.rta.controlAnalyzer.Form
			 * @augments sap.ui.rta.controlAnalyzer.Base
			 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API
			 *               might be changed in future.
			 */
			var Form = Base.extend("sap.ui.rta.controlAnalyzer.Form", {
				metadata : {
					library : "sap.ui.rta",
					properties : {}
				}
			});

			/**
			 * @override
			 */
			Form.prototype.init = function() {
			};

			/**
			 * @override
			 */
			Form.prototype.getFlexChangeType = function(sType, oElement, mSettings) {
				var sFlexChangeType;
				switch (sType) {
					case "rename" :
						if (ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormContainer")) {
							sFlexChangeType = "renameTitle";
						} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormElement")) {
							sFlexChangeType = "renameLabel";
						}
						break;
					case "hide" :
						if (ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormContainer")) {
							sFlexChangeType = "removeSimpleFormGroup";
						} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormElement")) {
							sFlexChangeType = "hideSimpleFormField";
						}
						break;
					case "unhide" :
						if (ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormElement")) {
							sFlexChangeType = "unhideSimpleFormField";
						}
						break;
					case "add" :
						if (ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.SimpleForm")) {
							sFlexChangeType = "addSimpleFormGroup";
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
			Form.prototype.getCommandClass = function(sCommand) {
				var sCommandClass;
				switch (sCommand) {
					case "rename" :
						sCommandClass = 'sap.ui.rta.command.RenameForm';
						break;
					case "hide" :
						sCommandClass = 'sap.ui.rta.command.HideForm';
						break;
					case "unhide" :
						sCommandClass = 'sap.ui.rta.command.UnhideForm';
						break;
					case "add" :
						sCommandClass = 'sap.ui.rta.command.AddSimple';
						break;
					default :
						break;
				}
				return sCommandClass;
			};

			/**
			 * @override
			 */
			Form.prototype.getConfiguredElement = function(oElement) {
				return this._getSimpleFormContainer(oElement);
			};

			/**
			 * @public
			 */
			Form.prototype.getRenamableControl = function(oElement) {
				if (ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormElement")) {
					return oElement.getLabel();
				} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormContainer")) {
					return oElement.getTitle();
				}
			};

			Form.prototype.getLabel = function(oElement) {
				return this.getRenamableControl(oElement).getText();
			};

			Form.prototype.getLabelBinding = function(oElement) {
				return oElement.getBindingInfo("text");
			};

			Form.prototype.resumeLabelBinding = function(oElement) {
				var oBinding = oElement.getBinding("text");
				if (oBinding) {
					oBinding.resume();
				}
			};

			/**
			 * @override
			 */
			Form.prototype.createChangeData = function(oControl, oCurrentSelectedBlock, bHideControl, oSelectedControl) {
				var mChangeData = {};
				var oBindingContextObject = oControl.getBindingContext().getObject();
				var sControldId = oBindingContextObject.controlId
						? oBindingContextObject.controlId
						: oBindingContextObject.fieldLabel;

				var oObjectPage = sap.ui.getCore().byId(sControldId);
				var bControlExists = !!oObjectPage;

				var fnCreateChangeEvent = function() {
					if (bControlExists) {
						if (oBindingContextObject.visibilityType === "hide") {
							mChangeData = {
								controlId : sControldId,
								changeType : bHideControl ? "hideControl" : "unhideControl",
								controlType : "SimpleForm"
							};
						}
					}
					return mChangeData;
				};

				return new Promise(function(resolve, reject) {
					resolve(fnCreateChangeEvent());
				});

			};

			/**
			 * @override
			 */
			Form.prototype.getSelectedBlock = function(oControl) {
				return Utils.findSupportedBlock(oControl, ["sap.ui.layout.form.SimpleForm"]);
			};

			/**
			 * @override
			 */
			Form.prototype.getClosestType = function(oControl) {
				return Utils.getClosestTypeForControl(oControl, "sap.ui.layout.form.SimpleForm");
			};

			/**
			 * @overwrite
			 */
			Form.prototype.prepare = function() {
				var aElements = this._getSimpleFormElements(this.getControl());

				if (!this.getPrepared()) {
					for (var i = 0; i < aElements.length; i++) {

						var sTitle = aElements[i].getText ? aElements[i].getText() : aElements[i].getId();
						var bVisible = aElements[i].getVisible ? aElements[i].getVisible() : aElements[i].getParent().getVisible();

						if (bVisible === false) {
							this._mAvailableElements[aElements[i].getId()] = {
								fieldLabel : sTitle,
								quickInfo : sTitle,
								entityType : "",
								controlId : aElements[i].getId(),
								visibilityType : "hide"
							};
						} else {
							this._mHiddenElements[aElements[i].getId()] = {
								fieldLabel : sTitle,
								quickInfo : sTitle,
								entityType : "",
								controlId : aElements[i].getId(),
								visibilityType : "hide"
							};
						}
					}
					sap.ui.rta.controlAnalyzer.Base.prototype.prepare.apply(this);
				}
				return Promise.resolve();
			};

			/**
			 * @private
			 */
			Form.prototype._getSimpleFormElements = function(oElement) {
				var aElements = [];
				var oSimpleForm = this._getSimpleFormContainer(oElement);
				var aContent = oSimpleForm.getContent();
				aContent.forEach(function(oField) {
					if (oField instanceof sap.m.Label) {
						aElements.push(oField);
					}
				});
				return aElements;
			};

			/**
			 * @private
			 */
			Form.prototype._getSimpleFormContainer = function(oElement) {
				if (ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.SimpleForm")) {
					return oElement;
				} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.Form")
						|| ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormContainer")
						|| ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormElement")) {
					return this._getSimpleFormContainer(oElement.getParent());
				}
			};

			/**
			 * @private
			 */
			Form.prototype._hasStableIds = function(oElement) {
				// simple form and all elements in content aggregation have stable ids
				if (ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.SimpleForm") && FlexUtils.checkControlId(oElement)) {
					var bHasAnyChildUnstableId = oElement.getContent().some(function(oChild) {
						var bHasUnstableId = !FlexUtils.checkControlId(oChild);
						return bHasUnstableId;
					});
					return !bHasAnyChildUnstableId;
				}
			};

			/**
			 * @private
			 */
			Form.prototype._determineGroupIndex = function(oElement) {
				var iIndex = 0;
				if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormContainer") {
					var aContent = this._getSimpleFormContainer(oElement).getContent();
					var iStart = -1;
					var oTitle = oElement.getTitle();
					if (oTitle !== null) {
						aContent.some(function(oField, index) {
							if (oField === oTitle) {
								iStart = index;
							}
							if (iStart >= 0 && index > iStart) {
								if (oField instanceof sap.ui.core.Title) {
									iIndex = index;
									return true;
								}
							}
						});
						iIndex = (!iIndex) ? aContent.length : iIndex;
					}
				}
				return iIndex;
			};

			/**
			 * @private
			 */
			Form.prototype._determineIndexOfFormElement = function(oFormElement, bOffset) {
				var aContent = oFormElement.getParent().getAggregation("formElements");

				var iIndex;
				aContent.some(function(oContent, index) {
					if (oContent === oFormElement) {
						iIndex = index;
						return true;
					}
				});
				iIndex = (bOffset) ? iIndex + 1 : iIndex;
				return iIndex;
			};

			/**
			 * @private
			 */
			Form.prototype._getStableElementForCommand = function(oElement) {
				var oStableElement;
				if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormContainer") {
					oStableElement = oElement.getTitle();
				} else if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
					oStableElement = oElement.getLabel();
				}
				return oStableElement;
			};

			/**
			 * @override
			 */
			Form.prototype.mapSpecificChangeData = function(sType, mSpecificChangeData) {
				var mResult;
				switch (sType) {
					case "Add" :
						mResult = this._mapAddSpecificChangeData(sType, mSpecificChangeData);
						break;
					default :
						mResult = this.prototype.mapSpecificChangeData(sType, mSpecificChangeData);
						break;
				}
				return mResult;
			};

			/**
			 * @private
			 */
			Form.prototype._mapAddSpecificChangeData = function(sType, mSpecificChangeData) {
				if (mSpecificChangeData.changeType === "addSimpleFormGroup") {
					mSpecificChangeData.groupLabel = mSpecificChangeData.labels[0];
					delete mSpecificChangeData.labels;
				}
				return mSpecificChangeData;
			};

			Form.prototype.isHideable = function(oElement) {
				var bInstance = (ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormElement") || ElementUtil
						.isInstanceOf(oElement, "sap.ui.layout.form.FormContainer"));
				return (bInstance && !this.isMandatory(oElement));
			};

			return Form;

		}, /* bExport= */true);
