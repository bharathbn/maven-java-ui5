/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/base/ManagedObject'], function(ManagedObject) {
	"use strict";

	/**
	 * Basic implementation for the command pattern.
	 *
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 *
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.BaseCommand
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var BaseCommand = ManagedObject.extend("sap.ui.rta.command.BaseCommand", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				element : {
					type : "sap.ui.core.Element"
				},
				elementId : {
					type : "string"
				},
				name : {
					type : "string"
				}
			},
			associations : {},
			events : {}
		}
	});

	BaseCommand.ERROR_UNKNOWN_ID = "no element for id: ";

	/**
	 * @protected will be called by the command factory when all data is provided to the change
	 */
	BaseCommand.prototype.prepareActionData = function() {
	};

	/**
	 * @protected Template Method to implement execute logic, with ensure precondition Element is available
	 */
	BaseCommand.prototype._executeWithElement = function(oElement) {
	};

	BaseCommand.prototype.execute = function() {
		this._withElement(this._executeWithElement.bind(this));
	};

	/**
	 * @protected Template Method to implement undo logic, with ensure precondition Element is available
	 */
	BaseCommand.prototype._undoWithElement = function(oElement) {
	};

	BaseCommand.prototype.undo = function() {
		this._withElement(this._undoWithElement.bind(this));
	};

	BaseCommand.prototype._withElement = function(fn) {
		var oElement = this._getElement();
		if (oElement) {
			fn(oElement);
		} else {
			jQuery.sap.log.error(this.getMetadata().getName(), BaseCommand.ERROR_UNKNOWN_ID + this.getElementId());
		}
	};

	BaseCommand.prototype.serialize = function() {
	};

	BaseCommand.prototype.isEnabled = function() {
		return true;
	};

	BaseCommand.deserialize = function(oChangeData) {
	};

	BaseCommand.prototype._getElement = function() {
		// Check if Element could be complete virtual property (always created by id)
		var oElement = this.getElement();
		if (!oElement) {
			oElement = sap.ui.getCore().byId(this.getElementId());
			this.setElement(oElement);
		}
		return oElement;
	};

	return BaseCommand;

}, /* bExport= */true);
