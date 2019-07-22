/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand', "sap/ui/fl/changeHandler/UnhideControl"], function(FlexCommand,
		UnhideChangeHandler) {
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
	var Unhide = FlexCommand.extend("sap.ui.rta.command.Unhide", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				changeType : {
					type : "string",
					defaultValue : "unhideControl"
				}
			},
			associations : {},
			events : {}
		}
	});

	Unhide.prototype.init = function() {
		this.setChangeHandler(UnhideChangeHandler);
	};

	Unhide.prototype._undoWithElement = function(oElement) {
		// TODO: should we call also a change handler here (hideControl), or better extend the PropertyChangeCommand
		// an set the property 'visible' to false?
		oElement.setVisible(false);
	};

	Unhide.prototype.serialize = function() {
		return {
			changeType : this.getChangeType(),
			selector : {
				id : this._getElement().getId()
			}
		};
	};

	return Unhide;

}, /* bExport= */true);
