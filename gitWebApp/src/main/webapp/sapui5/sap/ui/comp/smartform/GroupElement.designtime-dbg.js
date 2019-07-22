/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides the Design Time Metadata for the sap.ui.comp.smartform.GroupElement control
sap.ui.define([
	"sap/ui/comp/smartform/SmartForm"
], function(SmartForm) {
	"use strict";

	var fnIsElementBound = function(oElement) {
		var mBindingInfos = oElement.mBindingInfos;
		// No Binding at all
		if (Object.keys(mBindingInfos).length === 0) {
			return false;
		} else {
			for ( var oPropertyName in mBindingInfos) {
				var aParts = mBindingInfos[oPropertyName].parts;
				for (var i = 0; i < aParts.length; i++) {
					var sModelName;
					if (aParts[i].model) {
						sModelName = oElement.getModel(aParts[i].model).getMetadata().getName();
						if (sModelName === "sap.ui.model.odata.ODataModel" || sModelName === "sap.ui.model.odata.v2.ODataModel") {
							return true;
						}
					} else {
						sModelName = oElement.getModel().getMetadata().getName();
						if (sModelName === "sap.ui.model.odata.ODataModel" || sModelName === "sap.ui.model.odata.v2.ODataModel") {
							return true;
						}
					}
				}
			}
		}
	};

	var fnHasUnboundFields = function(oGroupElement) {
		var aElements = oGroupElement.getFields();
		if (aElements.length === 0) {
			return true;
		}
		for (var j = 0; j < aElements.length; j++) {
			var oElement = aElements[j];
			if (!oElement.getDomRef()) {
				continue;
			}
			if (!fnIsElementBound(oElement)) {
				return true;
			}
		}
		return false;
	};

	var fnHasMandatoryFields = function(oGroupElement) {
		var aElements = oGroupElement.getFields();
		if (aElements.length === 0) {
			return false;
		}
		for (var j = 0; j < aElements.length; j++) {
			var oElement = aElements[j];
			if (oElement.getMandatory && oElement.getMandatory()) {
				return true;
			}
		}
		return false;
	};

	var fnGetSmartForm = function (oElement) {
		if (oElement instanceof SmartForm) {
			return oElement;
		} else if (oElement.getParent()) {
			return fnGetSmartForm(oElement.getParent());
		}
	};

	return {
		name: {
			singular : "FIELD_CONTROL_NAME",
			plural : "FIELD_CONTROL_NAME_PLURAL"
		},
		actions: {
			remove: {
				changeType: "hideControl",
				isEnabled: function(oGroupElement) {
					return !fnHasUnboundFields(oGroupElement);
				},
				getConfirmationText: function(oGroupElement) {
					// TODO: move text to comp
					var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");
					if (fnHasMandatoryFields(oGroupElement)) {
						var sGroupElement = oGroupElement.getLabelText() || oGroupElement.getId();
						return oTextResources.getText("GROUP_ELEMENT_DESIGN_TIME_REMOVE_MANDATORY_FIELD_MESSAGE", sGroupElement);
					}
				},
				getState: function(oGroupElement) {
					return {
						element: oGroupElement,
						visible: oGroupElement.getVisible()
					};
				},
				restoreState: function(oGroupElement, oState) {
					oState.element.setVisible(oState.visible);
				}
			},
			reveal : {
				changeType : "unhideControl"
			},
			rename: {
				changeType: "renameField",
				isEnabled: function(oControl) {
					if (oControl.getLabel()) {
						return true;
					}
					return false;
				},
				domRef: function(oControl) {
					return oControl.getLabel().getDomRef();
				},
				getState: function(oControl) {
					var oState = {
						oldValue: oControl.getLabel().getText()
					};
					return oState;
				},
				restoreState: function(oControl, oState) {
					oControl.setLabel(oState.oldValue);
					var sBindingValue = "";
					var oBindingInfo = oControl.getBindingInfo("label");
					if (oBindingInfo) {
						sBindingValue = oBindingInfo.binding.getValue();
						if (sBindingValue === oState.oldValue) {
							var oBinding = oControl.getBinding("label");
							if (oBinding) {
								oBinding.resume();
							}
						}
					}
					return true;
				}
			}
		},
		getRelevantContainer: function(oGroupElement) {
			return fnGetSmartForm(oGroupElement);
		},
		// TODO Clarify concept to reuse these functions/functionality in Group.designtime.js
		functions: {
			hasUnboundFields: fnHasUnboundFields,
			hasMandatoryFields: fnHasMandatoryFields,
			getSmartForm: fnGetSmartForm
		},
		properties: {
			useHorizontalLayout: {
				ignore: true
			},
			horizontalLayoutGroupElementMinWidth: {
				ignore: true
			},
			elementForLabel: {
				ignore: true
			}
		}
	};

}, /* bExport= */true);
