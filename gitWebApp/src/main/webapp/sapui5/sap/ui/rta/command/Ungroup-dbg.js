/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/BaseCommand', 'sap/ui/rta/Utils',
               'sap/ui/rta/controlAnalyzer/ControlAnalyzerFactory'], function(BaseCommand, Utils, ControlAnalyzerFactory) {
	"use strict";

	/**
	 * Unhide a control/element
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.Unhide
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Ungroup = BaseCommand.extend("sap.ui.rta.command.Ungroup", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				changeType : {
					type : "string",
					defaultValue : "UngroupControl"
				},
				smartForm : {
					type : "object"
				}
			},
			associations : {},
			events : {}
		}
	});


	Ungroup.prototype.init = function() {
		this._aCommands = [];
		this._aUngroupFields = [];
	};

	/**
	 * @override
	 */
	Ungroup.prototype.undo = function() {
		var aUngroupFields = this._aUngroupFields;
		var aJsTypes = [];
		var aFieldLabels = [];
		var aFieldValues = [];
		var aFieldProperties = [];
		if (aUngroupFields) {
			for (var i = 0; i < aUngroupFields.length; i++) {
				var oElement = sap.ui.getCore().byId(aUngroupFields[i].controlId);
				var oDataField = aUngroupFields[i];
				aJsTypes.push(oElement.getFields()[0].getMetadata().getName());
				aFieldLabels.push(oDataField["sap:label"]);
				var sPath = "";
				if (oDataField.isComplexProperty) {
					sPath = oDataField.complexTypePropertyName + "/" + oDataField.name;
				} else {
					sPath = oDataField.name;
				}
				aFieldValues.push(sPath);
				aFieldProperties.push(oDataField.valueProperty);
				var oFieldHideCommand = sap.ui.rta.command.CommandFactory.getCommandFor(oElement, "Hide");
				oFieldHideCommand.execute();
			}
			var oAddFieldCommand = Utils.createNewAddFieldsCommand(this.getSmartForm(), oElement.getParent(), 0, aJsTypes, aFieldLabels, aFieldProperties, aFieldValues);
			oAddFieldCommand.execute();
		}
	};

	Ungroup.prototype.execute = function() {
		var that = this;
		return this._createUngroupCommands().then(function() {
			for (var i = 0; i < that._aCommands.length; i++) {
				that._aCommands[i].execute();
			}
			that._updateElement();
			that.getElement().destroy();
		});
	};

	Ungroup.prototype.getCommands = function() {
		return this._aCommands;
	};

	Ungroup.prototype.serialize = function() {
		var aSeralized = [];
		for (var i = 0; i < this._aCommands.length; i++) {
			aSeralized.push(this._aCommands[i].serialize());
		}
		return aSeralized;
	};

	Ungroup.prototype._createUngroupCommands = function() {
		var that = this;
		var oGroupContainer = this.getElement().getParent();
		if (this._aCommands.length > 0) {
			return Promise.resolve();
		}

		var oSmartFormAnalyzer = sap.ui.rta.controlAnalyzer.ControlAnalyzerFactory.getControlAnalyzerFor(this.getSmartForm());
		return oSmartFormAnalyzer.prepare().then(function() {
			var mHiddenElements = oSmartFormAnalyzer.getHiddenElements();
			var aFields = that.getElement().getFields();

			for (var i = 0; i < aFields.length; i++) {
				var oField = aFields[i];
				var mPaths = Utils.getElementBindingPaths(oField);
				var sFoundFieldPath = Utils.findFieldBindingPathInFieldsArray(mPaths, mHiddenElements);
				var oFoundDataField = mHiddenElements[sFoundFieldPath];
				oFoundDataField["valueProperty"] = mPaths[sFoundFieldPath].valueProperty;

				if (oFoundDataField && oFoundDataField.controlId) {
					var oGroupElement = sap.ui.getCore().byId(oFoundDataField.controlId);
					var oUnhideCommand = sap.ui.rta.command.CommandFactory.getCommandFor(oGroupElement, "Unhide");
					that._aCommands.push(oUnhideCommand);
				} else if (oFoundDataField && !oFoundDataField.controlId) {
					var sPath = that._getBindingPath(oFoundDataField);
					var oNewFieldCommand = Utils.createNewAddFieldsCommand(that.getSmartForm(), oGroupContainer, 0, [oField.getMetadata().getName()],
							[oFoundDataField["sap:label"]],[mPaths[oFoundDataField.name].valueProperty], [sPath]);
					that._aCommands.push(oNewFieldCommand);
					oFoundDataField["controlId"] = oNewFieldCommand.getNewControlId();
				}
				that._aUngroupFields.push(oFoundDataField);
			}
		});
	};

	Ungroup.prototype._updateElement = function() {
		sap.ui.getCore().applyChanges();
		if (this._aUngroupFields.length === 0 || (this.getElement() && !this.getElement().bIsDestroyed) ) {
			return;
		}
		var aPaths = [];
		for (var i = 0; i < this._aUngroupFields.length; i++) {
			aPaths.push(this._getBindingPath(this._aUngroupFields[i]));
		}
		var sElementId = Utils.createNewSmartFormGroupElementId(this.getSmartForm(), aPaths);
		this.setElement(sap.ui.getCore().byId(sElementId));
	};

	Ungroup.prototype._getBindingPath = function(oDataField) {
		var sPath = "";
		if (oDataField.isComplexProperty) {
			sPath = oDataField.complexTypePropertyName + "/" + oDataField.name;
		} else {
			sPath = oDataField.name;
		}
		return sPath;
	};

	return Ungroup;

}, /* bExport= */true);
