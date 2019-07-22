/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/BaseCommand', "sap/ui/fl/FlexControllerFactory",
		"sap/ui/fl/changeHandler/JsControlTreeModifier", "sap/ui/fl/Utils"], function(BaseCommand, FlexControllerFactory,
		JsControlTreeModifier, Utils) {
	"use strict";

	/**
	 * Basic implementation for the flexibility commands, that use a flex change handler.
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
	 * @alias sap.ui.rta.command.FlexCommand
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var FlexCommand = BaseCommand.extend("sap.ui.rta.command.FlexCommand", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				changeHandler : {
					type : "any"
				},
				changeType : {
					type : "string"
				}
			},
			associations : {},
			events : {}
		}
	});

	FlexCommand.FORWARD = true;
	FlexCommand.BACKWARD = false;

	FlexCommand.prototype.getPreparedActionData = function(bForward) {
		// if nothing is specified deliver the forward case
		bForward = (bForward === FlexCommand.FORWARD || bForward === FlexCommand.BACKWARD) ? bForward : true;
		if (bForward) {
			return this._forwardPreparedActionData;
		} else {
			return this._backwardPreparedActionData;
		}
	};

	FlexCommand.prototype.prepareActionData = function() {
		this._forwardPreparedActionData = this._getForwardActionData(this._getElement());
		this._backwardPreparedActionData = this._getBackwardActionData(this._getElement());
	};

	FlexCommand.prototype._executeWithElement = function(oElement) {
		var vChange = this._getForwardActionData(oElement);
		this._applyChange(vChange);
	};

	/**
	* @protected Template Method to build the forward change
	*/
	FlexCommand.prototype._getForwardActionData = function(oElement) {
		//TODO make it just return the change when all command are converted
		return {
			change : this._completeChangeContent({
				changeType : this.getChangeType(),
				selector : {
					id : this._getElement().getId()
				}
			}),
			selectorElement : this._getElement()
		};
	};

	/**
	* @protected Template Method to build the backward change
	*/
	FlexCommand.prototype._getBackwardActionData = function(oElement) {
		//TODO make it just return the change
	};

	FlexCommand.prototype._undoWithElement = function(oElement) {
		var oPreparedChange = this.getPreparedActionData(FlexCommand.BACKWARD);
		if (oPreparedChange) {
			this._applyChange(oPreparedChange);
		} else {
			jQuery.log.warning("Undo functionality not supported for element with id " + oElement.getId());
		}

	};

	FlexCommand.prototype._completeChangeContent = function(mSpecificChangeInfo) {
		var oControl = this.getElement().appComponent || this.getElement();
		var oFlexController = FlexControllerFactory.createForControl(oControl);
		return oFlexController.createChange(mSpecificChangeInfo, this.getElement());
	};

	FlexCommand.prototype._applyChange = function(vChange) {
		//TODO: remove the following compatibility code when concept is implemented
		var oChange = vChange.change || vChange;

		var oAppComponent = Utils.getAppComponentForControl(this.getElement());
		var oSelectorElement = JsControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);

		//TODO allow backward changes to have different change handler
		this.getChangeHandler().applyChange(oChange, oSelectorElement, {
			modifier: JsControlTreeModifier,
			appComponent : oAppComponent
		});
	};
	return FlexCommand;

}, /* bExport= */true);
