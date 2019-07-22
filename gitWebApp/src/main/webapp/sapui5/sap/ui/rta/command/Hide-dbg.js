/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand', "sap/ui/fl/changeHandler/HideControl"], function(FlexCommand,
		HideChangeHandler) {
	"use strict";

	/**
	 * Hide a control/element
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.Hide
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Hide = FlexCommand.extend("sap.ui.rta.command.Hide", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				changeType : {
					type : "string",
					defaultValue : "hideControl"
				}
			},
			associations : {},
			events : {}
		}
	});

	Hide.prototype.init = function() {
		this.setChangeHandler(HideChangeHandler);
	};

	Hide.prototype._undoWithElement = function(oElement) {
		// TODO: should we call also a change handler here (UnhideControl), or better extend the PropertyChangeCommand
		// an set the property 'visible' to false?
		oElement.setVisible(true);
	};

	Hide.prototype.serialize = function() {
		return {
			changeType : this.getChangeType(),
			selector : {
				id : this._getElement().getId()
			}
		};
	};

	return Hide;

}, /* bExport= */true);
