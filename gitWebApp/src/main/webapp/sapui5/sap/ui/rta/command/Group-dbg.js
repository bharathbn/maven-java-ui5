/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define([
	'sap/ui/rta/command/BaseCommand',
	'sap/ui/rta/Utils',
	'sap/ui/rta/controlAnalyzer/ControlAnalyzerFactory',
	'sap/ui/dt/ElementDesignTimeMetadata'
], function(BaseCommand, Utils, ControlAnalyzerFactory, ElementDesignTimeMetadata) {
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
	var Group = BaseCommand.extend("sap.ui.rta.command.Group", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				source : {
					type : "any"
				},
				index : {
					type : "float"
				},
				labels : {
					type : "any[]"
				},
				jsTypes : {
					type : "any[]"
				},
				fieldValues : {
					type : "any[]"
				},
				valuePropertys : {
					type : "any[]"
				},
				groupFields : {
					type : "any[]"
				},
				smartForm : {
					type : "any"
				}

			},
			associations : {},
			events : {}
		}
	});

	Group.prototype.init = function() {
		this._aCommands = [];
		this._aOdataFields = [];
	};

	/**
	 * @override
	 */
	Group.prototype.undo = function() {
		this._updateElement();
		for (var i = 0; i < this._aCommands.length; i++) {
			this._aCommands[i].undo();
		}
		this.getElement().destroy();
	};

	Group.prototype.execute = function() {
		var that = this;
		return this._createGroupCommands().then(function() {
			for (var i = 0; i < that._aCommands.length; i++) {
				that._aCommands[i].execute();
			}
		});
	};

	Group.prototype.getCommands = function() {
		return this._aCommands;
	};

	Group.prototype.serialize = function() {
		var aSeralized = [];
		for (var i = 0; i < this._aCommands.length; i++) {
			aSeralized.push(this._aCommands[i].serialize());
		}
		return aSeralized;
	};

	Group.prototype._updateElement = function() {
		var that = this;
		sap.ui.getCore().applyChanges();
		var aPaths = this._aOdataFields.map(function(oField) {
			return that._getBindingPath(oField);
		});
		var sElementId = Utils.createNewSmartFormGroupElementId(this.getSmartForm(), aPaths);
		this.setElement(sap.ui.getCore().byId(sElementId));
	};

	Group.prototype._createGroupCommands = function() {
		if (this._aCommands.length > 0 ) {
			return Promise.resolve();
		}
		var that = this;
		var oSmartFormAnalyzer = sap.ui.rta.controlAnalyzer.ControlAnalyzerFactory.getControlAnalyzerFor(this.getSmartForm());
		var aGroupFields = this.getGroupFields();
		return oSmartFormAnalyzer.prepare().then(function() {
			var aJsTypes = [];
			var aFieldLabels = [];
			var aFieldValues = [];
			var aFieldProperties = [];
			var mHiddenElements = oSmartFormAnalyzer.getHiddenElements();
			that._aOdataFields = [];
			for (var i = 0; i < aGroupFields.length; i++) {
				var aFields = aGroupFields[i].getFields();

				for (var z = 0; z < aFields.length; z++) {
					var oField = aFields[z];
					var mPaths = Utils.getElementBindingPaths(oField);
					var sFoundFieldPath = Utils.findFieldBindingPathInFieldsArray(mPaths, mHiddenElements);
					var oFoundDataField = mHiddenElements[sFoundFieldPath];
					var sPath = that._getBindingPath(oFoundDataField);

					that._aOdataFields.push(oFoundDataField);
					aJsTypes.push(oField.getMetadata().getName());
					aFieldLabels.push(oFoundDataField["fieldLabel"]);
					aFieldValues.push(sPath);
					aFieldProperties.push(mPaths[sFoundFieldPath].valueProperty);
				}
				var oFieldHideCommand = sap.ui.rta.command.CommandFactory.getCommandFor(aGroupFields[i], "Hide");
				that._aCommands.push(oFieldHideCommand);
			}
			var sNewFieldId = Utils.createNewSmartFormGroupElementId(that.getSmartForm(), aFieldValues);
			if (sap.ui.getCore().byId(sNewFieldId)) {
				var oExisitingField = sap.ui.getCore().byId(sNewFieldId);
				var oParentContainer = oExisitingField.getParent();
				//TODO check for better solution by passing it as parameter...
				return oParentContainer.getMetadata().loadDesignTime().then(function(mDesignTimeMetadata){

					var oExisitingFieldUnhideCommand = sap.ui.rta.command.CommandFactory.getCommandFor(oExisitingField, "Unhide");
					var oExisitingFieldMoveCommand = sap.ui.rta.command.CommandFactory.getCommandFor(oParentContainer, "Move", {
						movedElements : [{
							element : oExisitingField,
							sourceIndex : 0,
							targetIndex : that.getIndex()
						}],
						target : {
							publicAggregation: "formElements",
							aggregation: "formElements",
							parent: oParentContainer
						},
						source : {
							publicAggregation: "formElements",
							aggregation: "formElements",
							parent: oParentContainer
						}
					}, new ElementDesignTimeMetadata({ data : mDesignTimeMetadata }));

					var sNewText;
					for (var j = 0; j < aFieldLabels.length; j++) {
						sNewText = sNewText ? sNewText + "/" + aFieldLabels[j] : aFieldLabels[j];
					}
					var oExisitingFieldRenameCommand = sap.ui.rta.command.CommandFactory.getCommandFor(oExisitingField, "Rename", {
						newValue : sNewText
					});
					that._aCommands.push(oExisitingFieldRenameCommand);
					that._aCommands.push(oExisitingFieldUnhideCommand);
					that._aCommands.push(oExisitingFieldMoveCommand);
				});
			} else {
				that._aCommands.push(Utils.createNewAddFieldsCommand(that.getSmartForm(), that.getSource().getParent(), that.getIndex(), aJsTypes, aFieldLabels, aFieldProperties, aFieldValues));
			}
		});
	};

	Group.prototype._getBindingPath = function(oDataField) {
		var sPath = "";
		if (oDataField.isComplexProperty) {
			sPath = oDataField.complexTypePropertyName + "/" + oDataField.name;
		} else {
			sPath = oDataField.name;
		}
		return sPath;
	};

	return Group;

}, /* bExport= */true);
