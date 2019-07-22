/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand', "sap/ui/fl/changeHandler/StashControl"], function(FlexCommand,
		StashChangeHandler) {
	"use strict";

	/**
	 * Stash a control/element
	 * 
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.ui.rta.command.Stash
	 * @experimental Since 1.38. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Stash = FlexCommand.extend("sap.ui.rta.command.Stash", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				changeType : {
					type : "string",
					defaultValue : "stashControl"
				}
			},
			associations : {},
			events : {}
		}
	});

	Stash.prototype.init = function() {
		this.setChangeHandler(StashChangeHandler);
	};

	Stash.prototype._undoWithElement = function(oElement) {
		// TODO: should we call also a change handler here (UnstashControl), or better extend the PropertyChangeCommand
		// an set the property 'stashed' to false?
		oElement = sap.ui.getCore().byId(oElement.getId());
		this.setElement(oElement);
		oElement.setStashed(false);
		oElement.setVisible(true);
	};

	Stash.prototype.serialize = function() {
		return {
			changeType : this.getChangeType(),
			selector : {
				id : this._getElement().getId()
			}
		};
	};

	return Stash;

}, /* bExport= */true);
