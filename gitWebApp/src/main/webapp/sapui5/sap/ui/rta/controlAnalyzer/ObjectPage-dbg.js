/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(
		['sap/ui/rta/controlAnalyzer/Base', 'sap/ui/rta/Utils', 'sap/ui/dt/ElementUtil', 'sap/ui/core/StashedControlSupport'],
		function(Base, Utils, ElementUtil, StashedControlSupport) {
			"use strict";

			/**
			 * Constructor for a new ObjectPage. Do not instantiate this class directly! Instead use the
			 * ControlAnalyzerFactory.
			 *
			 * @class Context - controller for flexibility changes
			 * @extends sap.ui.base.ManagedObject
			 *
			 * @author SAP SE
			 * @version 1.44.4
			 *
			 * @constructor
			 * @private
			 * @since 1.34
			 * @alias sap.ui.rta.ObjectPage
			 * @augments sap.ui.rta.controlAnalyzer.Base
			 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API
			 *               might be changed in future.
			 */
			var ObjectPage = Base.extend("sap.ui.rta.controlAnalyzer.ObjectPage", {
				metadata : {
					library : "sap.ui.rta"
				}
			});
			
			/**
			 * @override
			 */
			ObjectPage.prototype.setControl = function(oControl) {
				var oObjectPageLayout = Utils.getClosestTypeForControl(oControl, "sap.uxap.ObjectPageLayout");
				this.setProperty("control", oObjectPageLayout, true);
				this.setProperty("selectedControl", oControl, true);
			};

			/**
			 * @override
			 */
			ObjectPage.prototype.getSelectedBlock = function(oControl) {
				return Utils.findSupportedBlock(oControl, ["sap.uxap.ObjectPageLayout"]);
			};

			/**
			 * @override
			 */
			ObjectPage.prototype.getClosestType = function(oControl) {
				return Utils.getClosestTypeForControl(oControl, "sap.uxap.ObjectPageLayout");
			};

			/**
			 * @override
			 */
			ObjectPage.prototype.getControlsFieldCollection = function(oControl) {
				throw new Error('getControlsFieldCollection not yet implemented in ObjectPage');
			};

			/**
			 * @override
			 */
			ObjectPage.prototype.createChangeData = function(oControl, oCurrentSelectedBlock, bHideControl, oSelectedControl) {
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
									changeType : bHideControl ? "hideControl" : "unhideControl"
							};
						} else if (oBindingContextObject.visibilityType === "stash") {
							var aSections = Utils.getObjectPageSections(oCurrentSelectedBlock);
							var iTargetIndex = Utils.determineTargetIndex(oSelectedControl, oCurrentSelectedBlock, aSections, 1);

							mChangeData = {
									controlId : sControldId,
									changeType : bHideControl ? "stashControl" : "unstashControl",
									parentAggregationName : "sections",
									iTargetIndex : iTargetIndex
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
			ObjectPage.prototype.findVisibleAndBoundFieldsAndLabelNames = function(oControl) {

				var mVisibleAndBoundFields = [];
				var mFieldsAndLabelNames = {};
				var mFieldsAndBoundPropertyName = {};
				var aElements = ElementUtil.findAllPublicElements(oControl);

				var i = 0;
				for (i = 0; i < aElements.length; i++) {
					var oObHeaderElement = aElements[i];
					if (oObHeaderElement instanceof sap.m.ObjectAttribute) {
						mVisibleAndBoundFields.push(oObHeaderElement.getBindingPath("text"));
					}
				}

				return {
					visibleAndBoundFields : mVisibleAndBoundFields,
					fieldsAndLabelNames : mFieldsAndLabelNames,
					fieldsAndBoundPropertyName : mFieldsAndBoundPropertyName
				};
			};

			ObjectPage.prototype.prepare = function() {
				var oControl = this.getControl();
				var aSections = Utils.getObjectPageSections(oControl);

				if (!this.getPrepared()) {
					for (var i = 0; i < aSections.length; i++) {
						
						var sTitle = aSections[i].getTitle ? aSections[i].getTitle() : aSections[i].getId();
						
						if (aSections[i].getStashed && (aSections[i].getStashed() || aSections[i].getVisible() === false)) {
							this._mAvailableElements[aSections[i].getId()] = {
								fieldLabel : sTitle,
								quickInfo : sTitle,
								entityType : "",
								controlId : aSections[i].getId(),
								visibilityType: "stash"
							};
						} else if (aSections[i].getVisible && aSections[i].getVisible() === false) {
							this._mAvailableElements[aSections[i].getTitle()] = {
								fieldLabel : sTitle,
								quickInfo : sTitle,
								entityType : "",
								controlId : aSections[i].getId(),
								visibilityType: "hide"
							};
						} else {
							this._mHiddenElements[aSections[i].getTitle()] = {
								fieldLabel : sTitle,
								quickInfo : sTitle,
								entityType : "",
								controlId : aSections[i].getId(),
								visibilityType: "hide"
							};
						}
					}
					sap.ui.rta.controlAnalyzer.Base.prototype.prepare.apply(this);
				}
				return Promise.resolve();
			};

			/**
			 * @override
			 */
			ObjectPage.prototype.checkTargetZone = function(oParentElement, sAggregationName, oMovedElement) {
				if (ElementUtil.isInstanceOf(oMovedElement, "sap.uxap.ObjectPageSection")) {
					if (ElementUtil.isInstanceOf(oParentElement, "sap.uxap.ObjectPageLayout")) {
						if (oMovedElement.getParent() === oParentElement && sAggregationName === "sections") {
							return true;
						}
					}
				}
			};

			/**
			 * @override
			 */
			ObjectPage.prototype.isHideable = function(oElement) {
				return (ElementUtil.isInstanceOf(oElement, "sap.uxap.ObjectPageSection") && !this.isMandatory(oElement));
			};

			return ObjectPage;

		}, /* bExport= */true);
