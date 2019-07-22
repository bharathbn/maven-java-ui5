/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides the Design Time Metadata for the sap.ui.comp.smartform.Group control
sap.ui.define([
	"sap/ui/comp/smartform/GroupElement.designtime"
], function(GroupElementDesignTimeMetadata) {
	"use strict";

	var fnHasUnboundFields = function(oGroup) {
		var aElements = oGroup.getGroupElements();
		for (var j = 0; j < aElements.length; j++) {
			var oElement = aElements[j];
			if (GroupElementDesignTimeMetadata.functions.hasUnboundFields(oElement)) {
				return true;
			}
		}
		return false;
	};



	return {
		name : {
			singular : "GROUP_CONTROL_NAME",
			plural : "GROUP_CONTROL_NAME_PLURAL"
		},
		aggregations: {
			groupElements: {
				ignore: true
			},
			formElements: {
				domRef: ":sap-domref",
				childrenName : {
					singular : "FIELD_CONTROL_NAME",
					plural : "FIELD_CONTROL_NAME_PLURAL"
				},
				actions: {
					move: "moveFields",
					addODataProperty: {
						changeType: "addFields",
						filter: function(oGroup, mODataProperty ) {
							var oSmartForm = GroupElementDesignTimeMetadata.functions.getSmartForm(oGroup);
							var sIgnoredFields = oSmartForm ? oSmartForm.getIgnoredFields() : "";

							return sIgnoredFields.indexOf(mODataProperty.name) === -1;
						},
						getLabel : function(oGroupElement){
							return oGroupElement.getParent().getLabelText();
						}
					}
				}
			}
		},
		actions: {
			rename: {
				changeType: "renameGroup",
				domRef: function(oControl) {
					return oControl.getTitle().getDomRef();
				},
				getState: function(oControl) {
					var oState = {
						oldValue: oControl.getTitle().getText()
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
			},
			remove: {
				changeType: "hideControl",
				isEnabled: function(oGroup) {
					return !fnHasUnboundFields(oGroup);
				},
				getConfirmationText: function(oGroup) {
					var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");

					var aMandatoryFieldNames = [];
					oGroup.getGroupElements().forEach(function(oGroupElement) {
						if (oGroupElement.getVisible() && GroupElementDesignTimeMetadata.functions.hasMandatoryFields(oGroupElement)) {
							var sGroupElement = oGroupElement.getLabelText() || oGroupElement.getId();
							aMandatoryFieldNames.push(sGroupElement);
						}
					});

					if (aMandatoryFieldNames.length) {
						var sFormattingPrefix = "\n\u2003\u2003\u2022\u2004 "; // new line, two M whitespaces, bullet point, N whitespace
						var sMandatoryFields = "";
						aMandatoryFieldNames.forEach(function(oMandatoryFieldName) {
							sMandatoryFields += sFormattingPrefix + oMandatoryFieldName;
						});
						return oTextResources.getText("GROUP_DESIGN_TIME_REMOVE_GROUP_WITH_MANDATORY_FIELDS_MESSAGE", sMandatoryFields);
					}

				},
				getState: function(oGroup) {
					return {
						element: oGroup,
						visible: oGroup.getVisible()
					};
				},
				restoreState: function(oGroup, oState) {
					oState.element.setVisible(oState.visible);
				}
			}
		},
		getRelevantContainer: function(oGroup) {
			//the corresponding smart form is the relevant container
			return GroupElementDesignTimeMetadata.functions.getSmartForm(oGroup);
		},
		properties: {
			useHorizontalLayout: {
				ignore: true
			},
			horizontalLayoutGroupElementMinWidth: {
				ignore: true
			},
			label: {
				ignore: false
			}
		}
	};

}, /* bExport= */true);
