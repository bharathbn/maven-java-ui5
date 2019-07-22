/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/base/ManagedObject', 'sap/ui/rta/controlAnalyzer/ControlAnalyzerFactory', 'sap/ui/dt/ElementUtil',
		'sap/ui/fl/registry/ChangeRegistry'], function(ManagedObject, ControlAnalyzerFactory, ElementUtil, ChangeRegistry) {
	"use strict";

	var fnGetChangeHandler = function(sControlType, sChangeType){
		var oResult = ChangeRegistry.getInstance().getRegistryItems({
			controlType : sControlType,
			changeTypeName : sChangeType
		});

		if (oResult && oResult[sControlType] && oResult[sControlType][sChangeType]) {
			var oRegItem = oResult[sControlType][sChangeType];
			return oRegItem.getChangeTypeMetadata().getChangeHandler();
		} else {
			jQuery.sap.log.warning("No '" + sChangeType + "' change handler for " + sControlType + " registered");
		}
	};

	var fnConfigureCommand = function(oElement, oCommand, mSettings) {

		var sCommandName = oCommand.getName();
		var oAnalyzer = ControlAnalyzerFactory.getControlAnalyzerFor(oElement);
		if (oAnalyzer.mapSettings) {
			mSettings = oAnalyzer.mapSettings(sCommandName, oElement, mSettings);
		}
		var oConfElement = oAnalyzer.getConfiguredElement(oElement);

		var sControlType = oConfElement.getMetadata().getName();
		var sChangeType = oAnalyzer.getFlexChangeType(sCommandName, oElement, mSettings);

		if (sChangeType) {
			var ChangeHandler = fnGetChangeHandler(sControlType, sChangeType);
			if (ChangeHandler){
				oCommand.setChangeHandler(ChangeHandler);
				oCommand.setChangeType(sChangeType);

				if (oElement !== oConfElement && oCommand.setOriginalElement) {
					var oStableElement = oAnalyzer._getStableElementForCommand(oElement);
					oCommand.setOriginalElement(oStableElement);
				}
			}
		} else {
			jQuery.sap.log.warning("No " + sCommandName + " change type registered for " + sControlType);
		}

		return true;
	};

	var fnConfigureActionCommand = function(oElement, oCommand, vAction){
		var sChangeType;
		if (typeof (vAction) === "string"){
			sChangeType = vAction;
		} else {
			sChangeType = vAction && vAction.changeType;
		}

		if (!sChangeType){
			return false;
		}
		var sControlType = oElement.getMetadata().getName();

		var ChangeHandler = fnGetChangeHandler(sControlType, sChangeType);
		if (!ChangeHandler){
			return false;
		}

		oCommand.setChangeHandler(ChangeHandler);
		oCommand.setChangeType(sChangeType);
		return true;
	};

	var fnConfigureCreateContainerCommand = function(oElement, oCommand, mSettings, oDesignTimeMetadata){
		var oNewAddedElement = mSettings.element || sap.ui.getCore().byId(mSettings.element.id);
		var oAction = oDesignTimeMetadata.getAggregationAction("createContainer", oNewAddedElement)[0];

		var bSuccessfullConfigured = fnConfigureActionCommand(oElement, oCommand, oAction);
		if (bSuccessfullConfigured){
			oCommand.setCreateContainerMetadata(oAction);
			return true;
		} else {
			return false;
		}
	};

	var fnConfigureMoveCommand = function(oElement, oCommand, mSettings, oElementDesignTimeMetadata){
		var sSourceAggregation = mSettings.source.publicAggregation;
		var oAggregationDesignTimeMetadata = oElementDesignTimeMetadata.createAggregationDesignTimeMetadata(sSourceAggregation);
		var oMovedElement = mSettings.movedElements[0].element || sap.ui.getCore().byId(mSettings.movedElements[0].id);
		var sChangeType = oAggregationDesignTimeMetadata.getMoveAction(oMovedElement);
		oAggregationDesignTimeMetadata.destroy();

		return fnConfigureActionCommand(oElement, oCommand, sChangeType);
	};

	var fnConfigureRenameCommand = function(oElement, oCommand, mSettings, oDesignTimeMetadata){
		var oRenamedElement = mSettings.renamedElement;
		var oAction = oDesignTimeMetadata.getAction("rename", oRenamedElement);

		var bSuccessfullConfigured = fnConfigureActionCommand(oElement, oCommand, oAction);
		if (bSuccessfullConfigured){
			oCommand.setRenameMetadata(oAction);
			return true;
		} else {
			return false;
		}
	};

	var fnConfigureRemoveCommand = function(oElement, oCommand, mSettings, oDesignTimeMetadata){
		var oRemovedElement = mSettings.removedElement || sap.ui.getCore().byId(mSettings.removedElement.id);
		var oAction = oDesignTimeMetadata.getAction("remove", oRemovedElement);

		var bSuccessfullConfigured = fnConfigureActionCommand(oElement, oCommand, oAction);
		if (bSuccessfullConfigured){
			oCommand.setRemoveMetadata(oAction);
			return true;
		} else {
			return false;
		}
	};

	var fnConfigureAddODataPropertyCommand = function(oElement, oCommand, mSettings, oDesignTimeMetadata){
		var oNewAddedElement = mSettings.element;
		var oAction = oDesignTimeMetadata.getAggregationAction("addODataProperty", oNewAddedElement)[0];

		return fnConfigureActionCommand(oElement, oCommand, oAction);
	};

	var fnConfigureRevealCommand = function(oElement, oCommand, mSettings, oDesignTimeMetadata){
		var oRevealParent = mSettings.hiddenParent;
		var oAction = oDesignTimeMetadata.getAction("reveal", oRevealParent);

		return fnConfigureActionCommand(oElement, oCommand, oAction);
	};

	var fnFindClassByAnalyzer = function(oElement, sCommand) {
		var oAnalyzer = ControlAnalyzerFactory.getControlAnalyzerFor(oElement);
		return oAnalyzer.getCommandClass(sCommand);
	};

	var fnGetConfiguredElementByAnalyzer = function(oElement) {
		if (oElement.getMetadata){
			var oAnalyzer = ControlAnalyzerFactory.getControlAnalyzerFor(oElement);
			return oAnalyzer.getConfiguredElement(oElement);
		} else {
			return oElement;
		}
	};

	var mCommands = { 	// Command names camel case with first char lower case
		// TODO: remove
		"hide" : {
			findClass : fnFindClassByAnalyzer,
			configure : fnConfigureCommand
		},
		// TODO: remove
		"unhide" : {
			findClass : fnFindClassByAnalyzer,
			configure : fnConfigureCommand
		},
		// TODO: remove
		"stash" : {
			clazz : 'sap.ui.rta.command.Stash'
		},
		// TODO: remove
		"unstash" : {
			clazz : 'sap.ui.rta.command.Unstash'
		},
		"group" : {
			clazz : 'sap.ui.rta.command.Group'
		},
		"ungroup" : {
			clazz : 'sap.ui.rta.command.Ungroup'
		},
		// TODO: remove
		"add" : {
			findClass : fnFindClassByAnalyzer,
			configure : fnConfigureCommand
		},
		"createContainer" : {
			clazz : 'sap.ui.rta.command.CreateContainer',
			configure : fnConfigureCreateContainerCommand
		},
		"move" : {
			clazz : 'sap.ui.rta.command.Move',
			configure : fnConfigureMoveCommand
		},
		"remove" : {
			clazz : 'sap.ui.rta.command.Remove',
			configure : fnConfigureRemoveCommand
		},
		"composite" : {
			clazz : 'sap.ui.rta.command.CompositeCommand'
		},
		"rename" : {
			clazz : 'sap.ui.rta.command.Rename',
			configure : fnConfigureRenameCommand
		},
		"property" : {
			clazz : 'sap.ui.rta.command.Property'
		},
		"bindProperty" : {
			clazz : 'sap.ui.rta.command.BindProperty'
		},
		"addODataProperty" : {
			clazz : 'sap.ui.rta.command.AddODataProperty',
			configure : fnConfigureAddODataPropertyCommand
		},
		"reveal" : {
			clazz : 'sap.ui.rta.command.Reveal',
			configure : fnConfigureRevealCommand
		},
		"settings" : {
			clazz : 'sap.ui.rta.command.Settings'
		}
	};


	/**
	 * Factory for commands. Shall handle the control specific command configuration.
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
	 * @alias sap.ui.rta.command.CommandFactory
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var CommandFactory = ManagedObject.extend("sap.ui.rta.command.CommandFactory", {
		metadata : {
			library : "sap.ui.rta",
			properties : {},
			associations : {},
			events : {}
		}
	});

	CommandFactory.getCommandFor = function(oElement, sCommand, mSettings, oDesignTimeMetadata) {

		sCommand = sCommand[0].toLowerCase() + sCommand.slice(1); // first char of command name is lower case
		var mCommand = mCommands[sCommand];

		if (!mCommand){
			throw new Error("Command '" + sCommand + "' doesn't exist, check typing");
		}

		var sClassName;
		if (mCommand.findClass) {
			sClassName = mCommand.findClass(oElement, sCommand);
		} else {
			sClassName = mCommand.clazz;
		}

		jQuery.sap.require(sClassName);
		var Command = jQuery.sap.getObject(sClassName);

		//TODO: get rid of this
		var oConfElement = fnGetConfiguredElementByAnalyzer(oElement);

		mSettings = jQuery.extend(mSettings, {
			element : oConfElement,
			name : sCommand
		});

		var oCommand = new Command(mSettings);

		var bSuccessfullConfigured = true; //configuration is optional
		if (mCommand.configure) {
			bSuccessfullConfigured = mCommand.configure(oElement, oCommand, mSettings, oDesignTimeMetadata);
		}

		if (bSuccessfullConfigured){
			oCommand.prepareActionData();
			return oCommand;
		} else {
			oCommand.destroy();
		}
	};

	return CommandFactory;

}, /* bExport= */true);
