/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand', "sap/ui/fl/changeHandler/PropertyBindingChange", "sap/ui/rta/Utils"], function(FlexCommand,
		PropertyBindingChangeHandler, Utils) {
	"use strict";

	/**
	 * The BindProperty command take an element and the name of a property
	 * (propertyName) together with a complex binding string (newBinding).
	 * When executed, the binding is set on the property. The binding string
	 * has to comply with the same rules that apply to bindings passed to properties
	 * in the constructor of SAPUI5 ManagedObjects.
	 *
	 * Setting the oldValue or oldBinding is optional if you are running in the
	 * designMode (see unit test page).
	 * If set these take precedence over the actual value of the control.
	 * You should not set both properties.
	 *
	 *
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.ui.rta.command.BindProperty
	 * @experimental Since 1.38. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var BindProperty = FlexCommand.extend("sap.ui.rta.command.BindProperty", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				propertyName : {
					type : "string"
				},
				newBinding : {
					type : "string",
					bindable : false
				},
				//optional - command can derive it from the element
				oldValue : {
					type : "any"
				},
				//optional - command can derive it from the element
				oldBinding : {
					type : "string"
				},
				changeType : {
					type : "string",
					defaultValue : "propertyBindingChange"
				}
			},
			associations : {},
			events : {}
		}
	});


	BindProperty.prototype.init = function() {
		this.setChangeHandler(PropertyBindingChangeHandler);
	};

	BindProperty.FORWARD = true;
	BindProperty.BACKWARD = false;

	/**
	 * @override to suppress the binding strings to be used as
	 */
	BindProperty.prototype.bindProperty = function(sName, oBindingInfo){
		if (sName === "newBinding"){
			return this.setNewBinding(oBindingInfo.bindingString);
		}
		if (sName === "oldBinding"){
			return this.setOldBinding(oBindingInfo.bindingString);
		}
		return FlexCommand.prototype.bindProperty.apply(this, arguments);
	};

	BindProperty.prototype._ensureOld = function(){
		if ((this.getOldValue() === undefined) && (this.getOldBinding() === undefined)){
			var oElement = this._getElement();
			var oBindingInfo = oElement.getBindingInfo(this.getPropertyName());
			if (oBindingInfo && oBindingInfo.bindingString) {
				this.setOldBinding(oBindingInfo.bindingString);
			} else {
				var vOldValue = Utils.getPropertyValue(oElement, this.getPropertyName());
				this.setOldValue(vOldValue);
			}
		}
	};

	BindProperty.prototype._getOld = function(){
		if ( this.getOldValue() === "undefined" ){
			return this.getOldValue();
		} else {
			return this.getOldBinding();
		}
	};

	BindProperty.prototype._getSpecificChangeInfo = function(bForward) {
		var oElement = this._getElement();
		this._ensureOld();
		// general format
		var mSpecificChangeInfo = {
			changeType : this.getChangeType(),
			selector : {
				id : oElement.getId(),
				type : oElement.getMetadata().getName()
			},
			content : {
				property : this.getPropertyName(),
				newBinding : bForward ? this.getNewBinding() : this._getOld()
			}
		};
		if (bForward && typeof this.getOldValue() !== "undefined"){
			mSpecificChangeInfo.content.oldValue = this.getOldValue();
		} else {
			mSpecificChangeInfo.content.oldBinding = bForward ? this.getOldBinding() : this.getNewBinding();
		}

		return mSpecificChangeInfo;
	};

	BindProperty.prototype._getFlexChange = function(bForward) {
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
	BindProperty.prototype._getForwardActionData = function(oElement) {
		return this._getFlexChange(BindProperty.FORWARD);
	};

	/**
	 * @override
	 */
	BindProperty.prototype._getBackwardActionData = function(oElement) {
		return this._getFlexChange(BindProperty.BACKWARD);
	};

	/**
	 * @override
	 */
	BindProperty.prototype.serialize = function() {
		return this._getSpecificChangeInfo(BindProperty.FORWARD);
	};


	return BindProperty;

}, /* bExport= */true);
