/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand', "sap/ui/fl/changeHandler/PropertyChange", "sap/ui/rta/Utils"], function(FlexCommand,
		PropertyChangeHandler, Utils) {
	"use strict";

	/**
	 * Basic implementation for the command pattern.
	 *
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.BaseCommand
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Property = FlexCommand.extend("sap.ui.rta.command.Property", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				propertyName : {
					type : "string"
				},
				newValue : {
					type : "any"
				},
				// optional
				oldValue : {
					type : "any"
				},
				semanticMeaning : {
					type : "string"
				},
				changeType : {
					type : "string",
					defaultValue : "propertyChange"
				}
			},
			associations : {},
			events : {}
		}
	});


	Property.prototype.init = function() {
		this.setChangeHandler(PropertyChangeHandler);
	};

	Property.FORWARD = true;
	Property.BACKWARD = false;

	Property.prototype._ensureOldValue = function(oElement){
		if (this.getOldValue() === undefined) {
			var vOldValue = Utils.getPropertyValue(oElement, this.getPropertyName());
			this.setOldValue(vOldValue);
		}
	};

	Property.prototype._getSpecificChangeInfo = function(bForward) {
		var oElement = this._getElement();
		this._ensureOldValue(oElement);
		// general format
		return {
			changeType : this.getChangeType(),
			selector : {
				id : oElement.getId(),
				type : oElement.getMetadata().getName()
			},
			content : {
				property : this.getPropertyName(),
				oldValue : bForward ? this.getOldValue() : this.getNewValue(),
				newValue : bForward ? this.getNewValue() : this.getOldValue(),
				semantic : this.getSemanticMeaning()
			}
		};
	};

	Property.prototype._getFlexChange = function(bForward) {
		var mSpecificChangeInfo = this._getSpecificChangeInfo(bForward);

		var oChange = this._completeChangeContent(mSpecificChangeInfo);

		return {
			change : oChange,
			selectorElement : this._getElement()
		};
	};

	/**
	 * @override
	 */
	Property.prototype._getForwardActionData = function(oElement) {
		return this._getFlexChange(Property.FORWARD);
	};

	/**
	 * @override
	 */
	Property.prototype._getBackwardActionData = function(oElement) {
		return this._getFlexChange(Property.BACKWARD);
	};

	/**
	 * @override
	 */
	Property.prototype.serialize = function() {
		return this._getSpecificChangeInfo(Property.FORWARD);
	};


	return Property;

}, /* bExport= */true);
