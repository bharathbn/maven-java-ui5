/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/base/ManagedObject', 'sap/ui/rta/command/Stack', 'sap/ui/fl/FlexControllerFactory'], function(ManagedObject, CommandStack, FlexControllerFactory) {
	"use strict";

	/**
	 * Basic implementation for the LREP Serializer.
	 *
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.42
	 * @alias sap.ui.rta.command.LREPSerializer
	 * @experimental Since 1.42. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var LREPSerializer = ManagedObject.extend("sap.ui.rta.command.LREPSerializer", {
		metadata : {
			library : "sap.ui.rta",
			associations : {
				/** The root control which is needed for the Flex Controller */
				"rootControl" : {
					type : "sap.ui.core.Control"
				}
			},
			properties : {
				"commandStack" : {
					type : "object" // has to be of type sap.ui.rta.command.Stack
				}
			},
			aggregations : {}
		}
	});

	/**
	 * Serializes and saves all changes to LREP
	 *
	 * @returns {Promise}
	 * @public
	 */
	LREPSerializer.prototype.saveCommands = function() {
		var oCommandStack = this.getCommandStack();

		var oRootControl = sap.ui.getCore().byId(this.getRootControl());
		var oFlexController = FlexControllerFactory.createForControl(oRootControl);
		var aCommands = oCommandStack.getSerializableCommands();

		aCommands.forEach(function(oCommand, i) {
			var oElement = oCommand.getElement();
			var oPreparedChange = oCommand.getPreparedActionData();
			if (oPreparedChange) {
				oFlexController.addPreparedChange(oPreparedChange.change || oPreparedChange, oElement);
			} else {
				// Plain unprepared commmand, can be removed in case all commands are always prepared
				oFlexController.addChange(oCommand.serialize(), oElement);
			}
		});

		var that = this;
		return oFlexController.saveAll().then(
			function() {
				jQuery.sap.log.info("UI adaptation successfully transfered changes to layered repository");
				that.getCommandStack().removeAllCommands();
			});
	};

	return LREPSerializer;

}, /* bExport= */true);