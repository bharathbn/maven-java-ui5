/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/rta/command/FlexCommand', 'sap/ui/rta/controlAnalyzer/ControlAnalyzerFactory', "sap/ui/fl/Utils", "sap/ui/fl/changeHandler/BaseTreeModifier"], function(jQuery, FlexCommand, ControlAnalyzerFactory, FlexUtils, BaseTreeModifier) {
	"use strict";

	/**
	 * Add new OData property to a control
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.44
	 * @alias sap.ui.rta.command.AddODataProperty
	 * @experimental Since 1.44. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var AddODataProperty = FlexCommand.extend("sap.ui.rta.command.AddODataProperty", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				index : {
					type : "int"
				},
				newControlId : {
					type : "string"
				},
				label : {
					type : "string"
				},
				bindingString : {
					type : "string"
				}
			}
		}
	});

	AddODataProperty.prototype._getSpecificChangeInfo = function() {
		// general format
		return {
			changeType : this.getChangeType(),
			index : this.getIndex(),
			newControlId : this.getNewControlId(),
			label : this.getLabel(),
			bindingPath : this.getBindingString()
		};
	};

	AddODataProperty.prototype._getFlexChange = function() {
		var mSpecificChangeInfo = this._getSpecificChangeInfo();

		var oChange = this._completeChangeContent(mSpecificChangeInfo);

		return {
			change : oChange,
			selectorElement : this._getElement()
		};
	};

	/**
	 * @override
	 */
	AddODataProperty.prototype._getForwardActionData = function(oElement) {
		return this._getFlexChange();
	};

	/**
	 * @override
	 */
	AddODataProperty.prototype.undo = function() {
		var sAddedControlId = this.getNewControlId();
		var oAddedControl = sap.ui.getCore().byId(sAddedControlId);
		if (oAddedControl) {
			// TODO check this logic, when deserializing stack
			oAddedControl.destroy();
		}
	};

	/**
	 * @override
	 */
	AddODataProperty.prototype.serialize = function() {
		return this._getSpecificChangeInfo();
	};

	return AddODataProperty;

}, /* bExport= */true);
