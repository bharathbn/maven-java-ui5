/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides class sap.ui.rta.Main.
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject', 'sap/ui/rta/ui/ToolsMenu', 'sap/ui/dt/ElementUtil',
		'sap/ui/dt/DesignTime', 'sap/ui/dt/OverlayRegistry', 'sap/ui/dt/Overlay', 'sap/ui/rta/command/Stack',
		'sap/ui/rta/command/CommandFactory', 'sap/ui/rta/command/LREPSerializer', 'sap/ui/rta/plugin/Rename',
		'sap/ui/rta/plugin/DragDrop', 'sap/ui/rta/plugin/RTAElementMover', 'sap/ui/dt/plugin/CutPaste',
		'sap/ui/rta/plugin/Remove', 'sap/ui/rta/plugin/CreateContainer',
		'sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin','sap/ui/rta/plugin/additionalElements/AddElementsDialog',
		'sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer',
		'sap/ui/rta/plugin/Selection', 'sap/ui/rta/plugin/MultiSelection', 'sap/ui/rta/plugin/Settings',
		'sap/ui/dt/plugin/ContextMenu', 'sap/ui/dt/plugin/TabHandling', 'sap/ui/fl/FlexControllerFactory',
		'sap/ui/rta/ui/SettingsDialog', 'sap/ui/rta/ui/AddElementsDialog', './Utils',
		'sap/ui/fl/transport/Transports', 'sap/ui/fl/transport/TransportSelection','sap/ui/fl/Utils', 'sap/ui/fl/registry/Settings', 'sap/m/MessageBox', 'sap/m/MessageToast',
		'sap/ui/rta/controlAnalyzer/ControlAnalyzerFactory'], function(
		jQuery, ManagedObject, ToolsMenu, ElementUtil, DesignTime, OverlayRegistry, Overlay, CommandStack,
		CommandFactory, LREPSerializer, RTARenamePlugin, RTADragDropPlugin, RTAElementMover, CutPastePlugin,
		RemovePlugin, CreateContainerPlugin, AdditionalElementsPlugin, AdditionalElementsDialog, AdditionalElementsAnalyzer,
		SelectionPlugin, RTAMultiSelectionPlugin, SettingsPlugin, ContextMenuPlugin, TabHandlingPlugin, FlexControllerFactory,
		SettingsDialog, AddElementsDialog, Utils, Transports, TransportSelection, FlexUtils, FlexSettings, MessageBox, MessageToast,
		ControlAnalyzerFactory) {
	"use strict";
	/**
	 * Constructor for a new sap.ui.rta.RuntimeAuthoring class.
	 *
	 * @class The runtime authoring allows to adapt the fields of a running application.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.rta.RuntimeAuthoring
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API
	 *               might be changed in future.
	 */
	var RuntimeAuthoring = ManagedObject.extend("sap.ui.rta.RuntimeAuthoring", /** @lends sap.ui.rta.RuntimeAuthoring.prototype */
	{
		metadata : {
			// ---- control specific ----
			library : "sap.ui.rta",
			associations : {
				/** The root control which the runtime authoring should handle */
				"rootControl" : {
					type : "sap.ui.core.Control"
				}
			},
			properties : {
				/** The URL which is called when the custom field dialog is opened */
				"customFieldUrl" : "string",

				/** Whether the create custom field button should be shown */
				"showCreateCustomField" : "boolean",

				/** Whether the create custom field button should be shown */
				"showToolbars" : {
					type : "boolean",
					defaultValue : true
				},

				/** Temporary property : whether to show a dialog for changing control's properties#
				 * should be removed after DTA will fully switch to a property panel
				 */
				"showSettingsDialog" : {
					type : "boolean",
					defaultValue : true
				},

				/** Whether the window unload dialog should be shown */
				"showWindowUnloadDialog" : {
					type : "boolean",
					defaultValue : true
				},

				"commandStack" : {
					type : "sap.ui.rta.command.Stack"
				}
			},
			events : {
				/** Fired when the runtime authoring is started */
				"start" : {},

				/** Fired when the runtime authoring is stopped */
				"stop" : {},

				/** Fired when the runtime authoring failed to start */
				"failed" : {},

				/**
				 * Event fired when a DesignTime selection is changed
				 */
				"selectionChange" : {
					parameters : {
						selection : { type : "sap.ui.dt.Overlay[]" }
					}
				},

				/**
				 * Fired when the undo/redo stack has changed, undo/redo buttons can be updated
				 */
				"undoRedoStackModified" : {}
			}
		},
		_sAppTitle : null

	});

	/**
	 * @override
	 */
	RuntimeAuthoring.prototype.init = function() {
		this._onCommandStackModified = this._adaptUndoRedoButtons.bind(this);
	};

	/**
	 * Start Runtime Authoring
	 *
	 * @public
	 */
	RuntimeAuthoring.prototype.start = function() {
		var that = this;

		this._aPopups = [];

		this._oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		this._aSupportedControls = ["sap.ui.comp.smartform.Group", "sap.uxap.ObjectPageSection",
				"sap.uxap.ObjectPageLayout"];

		// Create DesignTime
		if (!this._oDesignTime) {
			this._oRootControl = sap.ui.getCore().byId(this.getRootControl());

			this._oRTAElementMover = new RTAElementMover();

			this._oRTAElementMover.setCommandFactory(CommandFactory);
			this._oRTADragDropPlugin = new RTADragDropPlugin({
				elementMover : this._oRTAElementMover,
				commandFactory : CommandFactory
			}).attachElementModified(this._handleElementModified, this);

			this._oRTADragDropPlugin.attachDragStarted(this._handleStopCutPaste, this);
			this._oCutPastePlugin = new CutPastePlugin({
				elementMover : this._oRTAElementMover,
				commandFactory : CommandFactory
			}).attachElementModified(this._handleElementModified, this);

			this._oRemovePlugin = new RemovePlugin({
				commandFactory : CommandFactory
			}).attachElementModified(this._handleElementModified, this);

			this._oAdditionalElementsPlugin = new AdditionalElementsPlugin({
				commandFactory : CommandFactory,
				analyzer : AdditionalElementsAnalyzer,
				dialog : new AdditionalElementsDialog()
			}).attachElementModified(this._handleElementModified, this);

			this._oRenamePlugin = new RTARenamePlugin({
				commandFactory : CommandFactory
			}).attachElementModified(this._handleElementModified, this);
			this._oRenamePlugin.attachEditable(this._handleStopCutPaste, this);

			this._oSelectionPlugin = new SelectionPlugin();

			this._oMultiSelectionPlugin = new RTAMultiSelectionPlugin({
				multiSelectionTypes : ["sap.ui.comp.smartform.GroupElement"]
			});

			this._oSettingsPlugin = new SettingsPlugin({
				commandFactory : CommandFactory,
				commandStack : this.getCommandStack()
			}).attachElementModified(this._handleElementModified, this);

			this._oCreateContainerPlugin = new CreateContainerPlugin({
				commandFactory : CommandFactory
			}).attachElementModified(this._handleElementModified, this);

			this._oContextMenuPlugin = new ContextMenuPlugin();
			this._oTabHandlingPlugin = new TabHandlingPlugin();
			this._buildContextMenu();

			jQuery.sap.measure.start("rta.dt.startup","Measurement of RTA: DesignTime start up");
			this._oDesignTime = new DesignTime({
				rootElements : [this._oRootControl],
				plugins : [this._oRTADragDropPlugin, this._oCutPastePlugin, this._oRemovePlugin, this._oRenamePlugin,
						this._oSelectionPlugin, this._oMultiSelectionPlugin, this._oSettingsPlugin, this._oCreateContainerPlugin, this._oContextMenuPlugin,
						this._oTabHandlingPlugin, this._oAdditionalElementsPlugin]
			});

			jQuery(Overlay.getOverlayContainer()).addClass("sapUiRta");

			this._oDesignTime.attachSelectionChange(function(oEvent) {
				that.fireSelectionChange({selection: oEvent.getParameter("selection")});
			}, this);

			this._oDesignTime.attachEventOnce("synced", function() {
				that.fireStart();
				jQuery.sap.measure.end("rta.dt.startup","Measurement of RTA: DesignTime start up");
			});

			this._oDesignTime.attachEventOnce("syncFailed", function() {
				that.fireFailed();
			});
		}

		if (this.getShowToolbars()) {
			// Create ToolsMenu
			this._createToolsMenu();
			// set focus initially on top toolbar
			var oDelegate = {
				"onAfterRendering" : function() {
					this._oToolsMenu._oToolBar.focus();
					this._oToolsMenu._oToolBar.removeEventDelegate(oDelegate, this);
				}
			};
			this._oToolsMenu._oToolBar.addEventDelegate(oDelegate, this);

			// Show Toolbar(s)
			this._oToolsMenu.show();
		}

		// Register function for checking unsaved before leaving RTA
		this._oldUnloadHandler = window.onbeforeunload;
		window.onbeforeunload = this._onUnload.bind(this);
	};

	var fnShowTechnicalError = function(vError) {
		var sErrorMessage = vError.message || vError.status || vError;
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		jQuery.sap.log.error("Failed to transfer runtime adaptation changes to layered repository", sErrorMessage);
		jQuery.sap.require("sap.m.MessageBox");
		var sMsg = oTextResources.getText("MSG_LREP_TRANSFER_ERROR") + "\n"
				+ oTextResources.getText("MSG_ERROR_REASON", sErrorMessage);
		sap.m.MessageBox.error(sMsg);
	};

	/**
	 * @override
	 */
	RuntimeAuthoring.prototype.setCommandStack = function(oCommandStack) {
		var  oOldCommandStack = this.getProperty("commandStack");
		if (oOldCommandStack) {
			oOldCommandStack.detachModified(this._onCommandStackModified);
		}

		if (this._oInternalCommandStack) {
			this._oInternalCommandStack.destroy();
			delete this._oInternalCommandStack;
		}

		var oResult = this.setProperty("commandStack", oCommandStack);

		if (oCommandStack) {
			oCommandStack.attachModified(this._onCommandStackModified);
		}

		if (this._oSettingsPlugin) {
			this._oSettingsPlugin.setCommandStack(oCommandStack);
		}

		return oResult;
	};

	/**
	 *
	 * @override
	 */
	RuntimeAuthoring.prototype.getCommandStack = function() {
		var oCommandStack = this.getProperty("commandStack");
		if (!oCommandStack) {
			oCommandStack = new CommandStack();
			this._oInternalCommandStack = oCommandStack;
		}
		this.setCommandStack(oCommandStack);

		return oCommandStack;
	};


	/**
	 * adapt the enablement of undo/redo/reset/transport button
	 * @private
	 */
	RuntimeAuthoring.prototype._adaptUndoRedoButtons = function() {
		if (this.getShowToolbars()) {
			var oCommandStack = this.getCommandStack();
			var bCanUndo = oCommandStack.canUndo();
			var bCanRedo = oCommandStack.canRedo();
			this._oToolsMenu.adaptUndoRedoEnablement(bCanUndo, bCanRedo);
			this._oToolsMenu.adaptTransportEnablement(this._bChangesExist || bCanUndo);
			this._oToolsMenu.adaptRestoreEnablement(this._bChangesExist || bCanUndo);
		}
		this.fireUndoRedoStackModified();
	};

	RuntimeAuthoring.prototype._closeToolBars = function() {
		if (this.getShowToolbars()) {
			return this._oToolsMenu.hide();
		} else {
			return Promise.resolve();
		}
	};

	/**
	 * Returns a selection from the DesignTime
	 * @return {sap.ui.dt.Overlay[]} selected overlays
	 * @public
	 */
	RuntimeAuthoring.prototype.getSelection = function() {
		if (this._oDesignTime) {
			return this._oDesignTime.getSelection();
		} else {
			return [];
		}
	};

	/**
	 * stop Runtime Authoring
	 *
	 * @public
	 * @param {boolean} bDontSaveChanges - stop RTA with or w/o saving changes
	 * @returns {Promise} promise with no parameters
	 */
	RuntimeAuthoring.prototype.stop = function(bDontSaveChanges) {
		var that = this;

		return ((bDontSaveChanges) ? Promise.resolve() : this._serializeToLrep())
			.then(this._closeToolBars.bind(this))
				.then(function(){
					that.exit();
					that.fireStop();
		})['catch'](fnShowTechnicalError);
	};

	RuntimeAuthoring.prototype.restore = function() {
		this._onRestore();
	};

	RuntimeAuthoring.prototype.transport = function() {
		this._onTransport();
	};

	// ---- backward compatibility API
	RuntimeAuthoring.prototype.undo = function() {
		this._onUndo();
	};

	RuntimeAuthoring.prototype.redo = function() {
		this._onRedo();
	};

	RuntimeAuthoring.prototype.canUndo = function() {
		return this.getCommandStack().canUndo();
	};

	RuntimeAuthoring.prototype.canRedo = function() {
		return this.getCommandStack().canRedo();
	};
	// ---- backward compatibility API

	/**
	 * Check for unsaved changes before Leaving Runtime Authoring
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._onUnload = function() {
		var oCommandStack = this.getCommandStack();
		var bUnsaved = oCommandStack.canUndo() || oCommandStack.canRedo();
		if (bUnsaved && this.getShowWindowUnloadDialog()) {
			var sMessage = this._oTextResources.getText("MSG_UNSAVED_CHANGES");
			return sMessage;
		} else {
			window.onbeforeunload = this._oldUnloadHandler;
		}
	};

	RuntimeAuthoring.prototype._serializeToLrep = function() {
		var oSerializer = new LREPSerializer({commandStack : this.getCommandStack(), rootControl : this.getRootControl()});
		return oSerializer.saveCommands();
	};

	RuntimeAuthoring.prototype._onUndo = function() {
		this._handleStopCutPaste();

		this.getCommandStack().undo();
	};

	RuntimeAuthoring.prototype._onRedo = function() {
		this._handleStopCutPaste();

		this.getCommandStack().redo();
	};

	RuntimeAuthoring.prototype._createToolsMenu = function() {
		var that = this;
		if (!this._oToolsMenu) {
			this._sAppTitle = this._getApplicationTitle();
			this._oToolsMenu = new ToolsMenu();
			this._oToolsMenu.createToolbar();
			this._oToolsMenu.setTitle(this._sAppTitle);
			this._oToolsMenu.setRootControl(this._oRootControl);
			this._oToolsMenu.checkTransportAvailable().then(function(bResult){
				that._bATOTransportEnabled = bResult;
			});
			this._checkChangesExist().then(function(bResult){
				that._bChangesExist = bResult;
				that._oToolsMenu.adaptTransportEnablement(bResult);
				that._oToolsMenu.adaptRestoreEnablement(bResult);
			});
			this._oToolsMenu.attachToolbarClose(this.stop.bind(this, false), this);
			this._oToolsMenu.attachTransport(this._onTransport, this);
			this._oToolsMenu.attachRestore(this._onRestore, this);
			this._oToolsMenu.attachUndo(this._onUndo, this);
			this._oToolsMenu.attachRedo(this._onRedo, this);
		}
	};

	/**
	 * Exit Runtime Authoring - destroy all controls
	 *
	 * @protected
	 */
	RuntimeAuthoring.prototype.exit = function() {
		if (this._oDesignTime) {
			jQuery(Overlay.getOverlayContainer()).removeClass("sapUiRta");
			this._oDesignTime.destroy();
			this._oDesignTime = null;
		}
		if (this._oToolsMenu) {
			this._oToolsMenu.destroy();
			this._oToolsMenu = null;
		}
		this.setCommandStack(null);
		window.onbeforeunload = this._oldUnloadHandler;
	};

	/**
	 * Function to handle ABAP transport of the changes
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._onTransport = function() {
		var that = this;

		function fnHandleAllErrors(oError) {
			if (oError.message === 'createAndApply failed') {
				return;
			}
			FlexUtils.log.error("transport error" + oError);
			return that._showMessage(MessageBox.Icon.ERROR, "HEADER_TRANSPORT_ERROR", "MSG_TRANSPORT_ERROR", oError);
		}

		this._handleStopCutPaste();

		return this._openSelection()
			.then(this._checkTransportInfo)
			.then(function(oTransportInfo) {
				if (oTransportInfo) {
					var oFlexController = FlexControllerFactory.createForControl(that._oRootControl);
					return that._serializeToLrep().then(function () {
						return oFlexController.getComponentChanges().then(function (aAllLocalChanges) {
							if (aAllLocalChanges.length > 0) {
								return that._createAndApplyChanges(aAllLocalChanges, oFlexController)
									.then(that._transportAllLocalChanges.bind(that, oTransportInfo, oFlexController))
										['catch'](fnHandleAllErrors);
							}
						});
					})['catch'](fnShowTechnicalError);
				}
			}
		);
	};

	RuntimeAuthoring.prototype._checkTransportInfo = function(oTransportInfo) {
		if (oTransportInfo && oTransportInfo.transport && oTransportInfo.packageName !== "$TMP") {
			return oTransportInfo;
		} else {
			return false;
		}
	};

	RuntimeAuthoring.prototype._openSelection = function () {
	   return new TransportSelection().openTransportSelection(null, this._oRootControl);
	};

	/**
	 * Create and apply changes
	 *
	 * Function is copied from FormP13nHandler. We need all changes for various controls.
	 * The function _createAndApplyChanges in the FormP13Handler calls that._getFlexController()
	 * which is specific for the SmartForm
	 *
	 * @private
	 * @param {array} aChangeSpecificData - array of objects with change specific data
	 * @param {sap.ui.fl.FlexController} - instance of FlexController
	 * @returns {Promise} promise that resolves with no parameters
	 */
	RuntimeAuthoring.prototype._createAndApplyChanges = function(aChangeSpecificData, oFlexController) {

		var that = this;

		return Promise.resolve().then(function() {

			function fnValidChanges(oChangeSpecificData) {
				return oChangeSpecificData && oChangeSpecificData.selector && oChangeSpecificData.selector.id;
			}

			aChangeSpecificData.filter(fnValidChanges).forEach(function(oChangeSpecificData) {
				var oControl = sap.ui.getCore().byId(oChangeSpecificData.selector.id);
				oFlexController.createAndApplyChange(oChangeSpecificData, oControl);
			});
		})['catch'](function(oError) {
			FlexUtils.log.error("Create and apply error: " + oError);
			return oError;
		}).then(function(oError) {
			return oFlexController.saveAll().then(function() {
				if (oError) {
					throw oError;
				}
			});
		})['catch'](function(oError) {
			FlexUtils.log.error("Create and apply and/or save error: " + oError);
			return that._showMessage(MessageBox.Icon.ERROR, "HEADER_TRANSPORT_APPLYSAVE_ERROR", "MSG_TRANSPORT_APPLYSAVE_ERROR", oError);
		});
	};

	/**
	 * Delete all changes for current layer and root control's component
	 *
	 * @private
	 * @return {Promise} the promise from the FlexController
	 */
	RuntimeAuthoring.prototype._deleteChanges = function() {
		var that = this;
		var oTransportSelection = new TransportSelection();
		var oFlexController = FlexControllerFactory.createForControl(this._oRootControl);

		oFlexController.getComponentChanges().then(function(aChanges) {
			return FlexSettings.getInstance(FlexUtils.getComponentClassName(that._oRootControl)).then(function(oSettings) {
				if (!oSettings.isProductiveSystem() && !oSettings.hasMergeErrorOccured()) {
					return oTransportSelection.setTransports(aChanges, that._oRootControl);
				}
			}).then(function() {
				return oFlexController.discardChanges(aChanges);
			}).then(function() {
				return window.location.reload();
			});
		})["catch"](function(oError) {
			return that._showMessage(MessageBox.Icon.ERROR, "HEADER_RESTORE_FAILED", "MSG_RESTORE_FAILED", oError);
		});
	};

	/**
	 * @private
	 */
	RuntimeAuthoring.prototype._showMessage = function(oMessageType, sTitleKey, sMessageKey, oError) {
		if (oError) {
			var sMessage = this._oTextResources.getText(sMessageKey, [oError.message || oError]);
		} else {
			var sMessage = this._oTextResources.getText(sMessageKey);
		}
		var sTitle = this._oTextResources.getText(sTitleKey);
		return new Promise(function(resolve) {
			MessageBox.show(sMessage, {
				icon: oMessageType,
				title: sTitle,
				onClose: resolve
			});
		});
	};

	/**
	 * @private
	 */
	RuntimeAuthoring.prototype._showMessageToast = function(sMessageKey) {
		var sMessage = this._oTextResources.getText(sMessageKey);

		MessageToast.show(sMessage);
	};

	/**
	 * Check if restart of RTA is needed
	 * the RTA FLP plugin will check this
	 * and restart RTA if needed
	 *
	 * @public
	 * @static
	 * @returns {Boolean} if restart is needed
	 */
	RuntimeAuthoring.needsRestart = function() {

		var bRestart = !!window.localStorage.getItem("sap.ui.rta.restart");
		return bRestart;
	};

	/**
	 * Enable restart of RTA
	 * the RTA FLP plugin would handle the restart
	 *
	 * @public
	 * @static
	 */
	RuntimeAuthoring.enableRestart = function() {

		window.localStorage.setItem("sap.ui.rta.restart", true);
	};

	/**
	 * Disable restart of RTA
	 * the RTA FLP plugin whould handle the restart
	 *
	 * @public
	 * @static
	 */
	RuntimeAuthoring.disableRestart = function() {

		window.localStorage.removeItem("sap.ui.rta.restart");
	};

	/**
	 * Discard all LREP changes and restores the default app state,
	 * opens a MessageBox where the user can confirm
	 * the restoring to the default app state
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._onRestore = function() {
		var that = this;

		var sMessage = this._oTextResources.getText("FORM_PERS_RESET_MESSAGE");
		var sTitle = this._oTextResources.getText("FORM_PERS_RESET_TITLE");

		this._handleStopCutPaste();

		function fnConfirmDiscardAllChanges(sAction) {
			if (sAction === "OK") {
				that.getCommandStack().removeAllCommands();
				RuntimeAuthoring.enableRestart();
				that._deleteChanges();
			}
		}

		MessageBox.confirm(sMessage, {
			icon: MessageBox.Icon.WARNING,
			title : sTitle,
			onClose : fnConfirmDiscardAllChanges
		});
	};

	/**
	 * Prepare all changes and assign them to an existing transport
	 *
	 * @private
	 * @param {object} oTransportInfo - information about the selected transport
	 * @param {sap.ui.fl.FlexController} - instance of FlexController
	 * @returns {Promise} Promise which resolves without parameters
	 */
	RuntimeAuthoring.prototype._transportAllLocalChanges = function(oTransportInfo, oFlexController) {

		var that = this;

		return oFlexController.getComponentChanges().then(function(aAllLocalChanges) {

			// Pass list of changes to be transported with transport request to backend
			var oTransports = new Transports();
			var aTransportData = oTransports._convertToChangeTransportData(aAllLocalChanges);
			var oTransportParams = {};
			//packageName is '' in CUSTOMER layer (no package input field in transport dialog)
			oTransportParams.package = oTransportInfo.packageName;
			oTransportParams.transportId = oTransportInfo.transport;
			oTransportParams.changeIds = aTransportData;

			return oTransports.makeChangesTransportable(oTransportParams).then(function() {

				// remove the $TMP package from all changes; has been done on the server as well,
				// but is not reflected in the client cache until the application is reloaded
				aAllLocalChanges.forEach(function(oChange) {

					if (oChange.getPackage() === '$TMP') {
						var oDefinition = oChange.getDefinition();
						oDefinition.packageName = oTransportInfo.packageName;
						oChange.setResponse(oDefinition);
					}
				});
			}).then(function() {
				that._showMessageToast("MSG_TRANSPORT_SUCCESS");
			});
		});
	};

	/**
	 * Checks the two parent-information maps for equality
	 *
	 * @param {object}
	 *          oInfo1 *
	 * @param {object}
	 *          oInfo2
	 * @return {boolean} true if equal, false otherwise
	 * @private
	 */
	RuntimeAuthoring.prototype._isEqualParentInfo = function(oInfo1, oInfo2) {
		var oResult = !!oInfo1 && !!oInfo2;
		if (oResult && (oInfo1.parent && oInfo2.parent)) {
			oResult = oInfo1.parent.getId() === oInfo2.parent.getId();
		}
		if (oResult && (oInfo1.index || oInfo2.index)) {
			oResult = oInfo1.index === oInfo2.index;
		}
		if (oResult && (oInfo1.aggregation || oInfo2.aggregation)) {
			oResult = oInfo1.aggregation === oInfo2.aggregation;
		}
		return oResult;
	};

	/**
	 * Function to handle modification of an element
	 *
	 * @param {sap.ui.base.Event}
	 *          oEvent event object
	 * @private
	 */
	RuntimeAuthoring.prototype._handleElementModified = function(oEvent) {
		this._handleStopCutPaste();

		var oCommand = oEvent.getParameter("command");
		if (oCommand instanceof sap.ui.rta.command.BaseCommand) {
			this.getCommandStack().pushAndExecute(oCommand);
		}
	};

	/**
	 * Function to handle hiding an element by the context menu
	 *
	 * @param {object}
	 *          oOverlay object
	 * @private
	 */
	RuntimeAuthoring.prototype._handleRemoveElement = function(aOverlays) {
		this._oRemovePlugin.removeElement(aOverlays);
	};

	/**
	 * @private
	 */
	RuntimeAuthoring.prototype._openSettingsDialog = function(oEventOrOverlays) {
		var aSelectedOverlays = (oEventOrOverlays.mParameters) ? oEventOrOverlays.getParameter("selectedOverlays") : oEventOrOverlays;
		var oElement = aSelectedOverlays[0].getElementInstance();
		this._handleStopCutPaste();

		if (!this._oSettingsDialog) {
			this._oSettingsDialog = new SettingsDialog();
		}
		this._oSettingsDialog.setCommandStack(this.getCommandStack());
		this._oSettingsDialog.open(oElement);
	};


	var fnMultiSelectionInactive = function(oOverlay) {
		return this._oDesignTime.getSelection().length < 2;
	};

	var fnHasParentStableId = function(oOverlay) {
		return Utils.hasParentStableId(oOverlay);
	};

	var fnIsMovable = function(oOverlay) {
		return oOverlay.getMovable();
	};

	var fnIsGroupElement = function(oOverlay) {
		return oOverlay.getElementInstance().getMetadata().getName() === "sap.ui.comp.smartform.GroupElement";
	};

	var fnIsGroup = function(oOverlay) {
		return oOverlay.getElementInstance().getMetadata().getName() === "sap.ui.comp.smartform.Group";
	};

	var fnIsSimpleFormElement = function(oOverlay) {
		var oElement = oOverlay.getElementInstance();
		var oAnalyzer = ControlAnalyzerFactory.getControlAnalyzerFor(oElement);
		if (oAnalyzer._getSimpleFormContainer) {
			return !!oAnalyzer._getSimpleFormContainer(oElement);
		} else {
			return false;
		}
	};

	var fnIsSection = function(oOverlay) {
		var oElement = oOverlay.getElementInstance();
		return oElement.getMetadata().getName() === "sap.uxap.ObjectPageSection";
	};

	var fnIsObjectPage = function(oOverlay) {
		var oElement = oOverlay.getElementInstance();
		return oElement.getMetadata().getName() === "sap.uxap.ObjectPageLayout";
	};

	var fnIsRemoveAvailable = function(oOverlay) {
		return this._oRemovePlugin.isRemoveAvailable(oOverlay);
	};

	var fnIsRemoveEnabled = function(oOverlay) {
		return this._oRemovePlugin.isRemoveEnabled(oOverlay);
	};

	var fnIsRenameAvailable = function(oOverlay) {
		return this._oRenamePlugin.isRenameAvailable(oOverlay);
	};

	var fnIsRenameEnabled = function(oOverlay) {
		return this._oRenamePlugin.isRenameEnabled(oOverlay);
	};

	var fnIsSettingsAvailable = function(oOverlay) {
		return this._oSettingsPlugin.isSettingsAvailable(oOverlay);
	};

	var fnIsSettingsEnabled = function(oOverlay) {
		return this._oSettingsPlugin.isSettingsEnabled(oOverlay);
	};

	RuntimeAuthoring.prototype._buildContextMenu = function() {
		var that = this;

		this._oContextMenuPlugin.addMenuItem({
			id : "CTX_RENAME_LABEL",
			text : that._oTextResources.getText("CTX_RENAME"),
			handler : this._handleRename.bind(this),
			available : fnIsRenameAvailable.bind(this),
			enabled : function(oOverlay) {
				return (fnMultiSelectionInactive.call(that, oOverlay) && fnIsRenameEnabled.call(that, oOverlay));
			}
		});
		if (/[&?](sap-rta-new-add=(true|x)[&#]?)+/i.test(window.location.search)) {
			this._oContextMenuPlugin.addMenuItem({
				id : "CTX_ADD_ELEMENTS_AS_SIBLING",
				text : that._oAdditionalElementsPlugin.getContextMenuTitle.bind(that._oAdditionalElementsPlugin, true),
				handler : that._oAdditionalElementsPlugin.showAvailableElements.bind(that._oAdditionalElementsPlugin, true),
				available : that._oAdditionalElementsPlugin.isAvailable.bind(that._oAdditionalElementsPlugin, true),
				enabled : function(oOverlay) {
					return fnMultiSelectionInactive.call(that, oOverlay) && that._oAdditionalElementsPlugin.isEnabled(true, oOverlay);
				}
			});

			this._oContextMenuPlugin.addMenuItem({
				id : "CTX_ADD_ELEMENTS_AS_CHILD",
				text : that._oAdditionalElementsPlugin.getContextMenuTitle.bind(that._oAdditionalElementsPlugin, false),
				handler : that._oAdditionalElementsPlugin.showAvailableElements.bind(that._oAdditionalElementsPlugin, false),
				available : that._oAdditionalElementsPlugin.isAvailable.bind(that._oAdditionalElementsPlugin, false),
				enabled : function(oOverlay) {
					return fnMultiSelectionInactive.call(that, oOverlay) && that._oAdditionalElementsPlugin.isEnabled(false, oOverlay);
				}
			});
		} else {
			this._oContextMenuPlugin.addMenuItem({
				id : "CTX_ADD_FORM_FIELD",
				text : that._oTextResources.getText("CTX_ADD_FIELD"),
				handler : this._handleAddElement.bind(this),
				available : function(oOverlay) {
					var oElement = oOverlay.getElementInstance();
					return fnIsSimpleFormElement(oOverlay) &&
					((ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormElement")) ||
					(ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormContainer") && oElement.getTitle() !== null) ||
					(ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormContainer") && oElement.getToolbar() !== null));
				},
				enabled : fnHasParentStableId
			});

			this._oContextMenuPlugin.addMenuItem({
				id : "CTX_ADD_FIELD",
				text : that._oTextResources.getText("CTX_ADD_FIELD"),
				handler : this._handleAddElement.bind(this),
				available : function(oOverlay) {
					return fnIsGroup(oOverlay) || fnIsGroupElement(oOverlay);
				},
				enabled : function(oOverlay) {
					return fnMultiSelectionInactive.call(that, oOverlay) && ( fnIsGroup(oOverlay) || fnHasParentStableId(oOverlay) );
				}
			});

			this._oContextMenuPlugin.addMenuItem({
				id : "CTX_ADD_SECTION",
				text : that._oTextResources.getText("CTX_ADD_SECTION"),
				handler : this._handleAddElement.bind(this),
				available : function(oOverlay) {
					return fnIsSection(oOverlay) || fnIsObjectPage(oOverlay);
				},
				enabled : function(oOverlay) {
					return Utils.hasObjectPageLayoutInvisibleSections.bind(Utils) && ( fnIsObjectPage(oOverlay) || fnHasParentStableId(oOverlay) );
				}
			});
		}

		this._oContextMenuPlugin.addMenuItem({
			id : "CTX_CREATE_CHILD_CONTAINER",
			text : this._oCreateContainerPlugin.getCreateContainerText.bind(this._oCreateContainerPlugin, false),
			handler : this._createContainer.bind(this, false),
			available : this._oCreateContainerPlugin.isCreateAvailable.bind(this._oCreateContainerPlugin, false),
			enabled : this._oCreateContainerPlugin.isCreateEnabled.bind(this._oCreateContainerPlugin, false)
		});

		this._oContextMenuPlugin.addMenuItem({
			id : "CTX_CREATE_SIBLING_CONTAINER",
			text : this._oCreateContainerPlugin.getCreateContainerText.bind(this._oCreateContainerPlugin, true),
			handler : this._createContainer.bind(this, true),
			available : this._oCreateContainerPlugin.isCreateAvailable.bind(this._oCreateContainerPlugin, true),
			enabled : this._oCreateContainerPlugin.isCreateEnabled.bind(this._oCreateContainerPlugin, true)
		});

		this._oContextMenuPlugin.addMenuItem({
			id : "CTX_REMOVE",
			text : that._oTextResources.getText("CTX_REMOVE"), // text can be defined also in designtime metadata
			handler : this._handleRemoveElement.bind(this),
			available : fnIsRemoveAvailable.bind(this),
			enabled : fnIsRemoveEnabled.bind(this)
		});

		this._oContextMenuPlugin.addMenuItem({
			id : "CTX_CUT",
			text : that._oTextResources.getText("CTX_CUT"),
			handler : this._handleCutElement.bind(this),
			available : fnIsMovable,
			enabled : function () {
				return that._oDesignTime.getSelection().length === 1;
			}
		});

		this._oContextMenuPlugin.addMenuItem({
			id : "CTX_PASTE",
			text : that._oTextResources.getText("CTX_PASTE"),
			handler : this._handlePasteElement.bind(this),
			available : fnIsMovable,
			enabled : function(oOverlay) {
				return that._oCutPastePlugin.isElementPasteable(oOverlay);
			}
		});

		this._oContextMenuPlugin.addMenuItem({
			id : "CTX_GROUP_FIELDS",
			text : that._oTextResources.getText("CTX_GROUP_FIELDS"),
			handler : this._handleGroupElements.bind(this),
			available : function() {
				var aSelectedOverlays = that._oDesignTime.getSelection();
				return (aSelectedOverlays.length > 1);
			},
			enabled : function() {
				var bIsEnabled = true;
				var aSelectedElementFields = [];
				var aSelectedOverlays = that._oDesignTime.getSelection();
				aSelectedOverlays.forEach(function(oOverlay) {
					var oElement = oOverlay.getElementInstance();
					aSelectedElementFields = aSelectedElementFields.concat(oElement.getFields());
				});
				if (aSelectedOverlays.length > 3 || aSelectedElementFields.length > 3) {
					return false;
				}
				aSelectedOverlays.some(function(oOverlay) {
					var oElement = oOverlay.getElementInstance();
					if (Utils.hasGroupElementUnBoundFields(oElement)) {
						bIsEnabled = false;
						return true;
					}
				});
				return bIsEnabled;
			}
		});

		this._oContextMenuPlugin.addMenuItem({
			id : "CTX_UNGROUP_FIELDS",
			text : that._oTextResources.getText("CTX_UNGROUP_FIELDS"),
			handler : this._handleUngroupElements.bind(this),
			available : function(oOverlay) {
				var oElement = oOverlay.getElementInstance();
				var aSelectedOverlays = that._oDesignTime.getSelection();
				return fnIsGroupElement(oOverlay) && oElement.getFields().length > 1 && aSelectedOverlays.length < 2;
			},
			enabled : function(oOverlay) {
				var oElement = oOverlay.getElementInstance();
				return !Utils.hasGroupElementUnBoundFields(oElement);
			}
		});

		this._oContextMenuPlugin.addMenuItem({
			id : "CTX_SETTINGS",
			text : that._oTextResources.getText("CTX_SETTINGS"),
			handler : this._handleSettings.bind(this),
			available : fnIsSettingsAvailable.bind(this),
			enabled : fnIsSettingsEnabled.bind(this)
		});
	};

	RuntimeAuthoring.prototype._createContainer = function(bSibling, aOverlays) {
		this._handleStopCutPaste();
		var that = this;

		var oOverlay = aOverlays[0];
		var oNewContainerOverlay = this._oCreateContainerPlugin.handleCreate(bSibling, oOverlay);

		var oDelegate = {
			"onAfterRendering" : function() {
				// TODO : remove timeout
				setTimeout(function() {
					that._oRenamePlugin.startEdit(oNewContainerOverlay);
				}, 0);
				oNewContainerOverlay.removeEventDelegate(oDelegate);
			}
		};

		oNewContainerOverlay.addEventDelegate(oDelegate);

	};

	/**
	 * Function to handle renaming a label
	 *
	 * @param {array}
	 *          aOverlays list of selected overlays
	 * @private
	 */
	RuntimeAuthoring.prototype._handleRename = function(aOverlays) {
		var oOverlay = aOverlays[0];
		this._oRenamePlugin.startEdit(oOverlay);
	};

	/**
	 * Function to handle adding an element
	 *
	 * @param {array}
	 *          aOverlays list of selected overlays
	 * @private
	 */
	RuntimeAuthoring.prototype._handleAddElement = function(aOverlays) {
		this._handleStopCutPaste();
		var oSelectedElement = aOverlays[0].getElementInstance();

		if (!this._oAddElementsDialog) {
			this._oAddElementsDialog = new AddElementsDialog({
				rootControl : this._oRootControl
			});
		}
		this._oAddElementsDialog.setCommandStack(this.getCommandStack());
		this._oAddElementsDialog.open(oSelectedElement);
	};

	/**
	 * Function to handle cutting an element
	 *
	 * @param {array}
	 *          aOverlays list of selected overlays
	 * @private
	 */
	RuntimeAuthoring.prototype._handleCutElement = function(aOverlays) {
		var oOverlay = aOverlays[0];
		this._oCutPastePlugin.cut(oOverlay);
	};

	/**
	 * Function to handle pasting an element
	 *
	 * @param {array}
	 *          aOverlays list of selected overlays
	 * @private
	 */
	RuntimeAuthoring.prototype._handlePasteElement = function(aOverlays) {
		var oOverlay = aOverlays[0];
		this._oCutPastePlugin.paste(oOverlay);
	};

	/**
	 * Handler function to stop cut and paste, because some other operation has started
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._handleStopCutPaste = function() {
		this._oCutPastePlugin.stopCutAndPaste();
	};

	/**
	 * Function to handle grouping of sap.ui.comp.smartfield.SmartFields
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._handleGroupElements = function() {
		this._handleStopCutPaste();

		var aSelectedOverlays = this._oDesignTime.getSelection();
		var oSelectedGroupElement = this._oContextMenuPlugin.getContextElement();
		var oTargetGroupContainer = Utils.getClosestTypeForControl(oSelectedGroupElement, "sap.ui.comp.smartform.Group");
		var iTargetIndex = oTargetGroupContainer.getGroupElements().indexOf(oSelectedGroupElement);

		var oGroupContainer = Utils.findSupportedBlock(oSelectedGroupElement, this._aSupportedControls);
		var oSmartForm = Utils.getClosestTypeForControl(oSelectedGroupElement, "sap.ui.comp.smartform.SmartForm");
		var aToGroupElements = [];
		for (var i = 0; i < aSelectedOverlays.length; i++) {
			var oElement = aSelectedOverlays[i].getElementInstance();
			aToGroupElements.push(oElement);
		}

		var oGroupCommand = CommandFactory.getCommandFor(oGroupContainer, "group", {
			source : oSelectedGroupElement,
			index : iTargetIndex,
			groupFields : aToGroupElements,
			smartForm : oSmartForm
		});
		this.getCommandStack().pushAndExecute(oGroupCommand);
	};

	/**
	 * Function to handle ungrouping of sap.ui.comp.smartform.GroupElements
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._handleUngroupElements = function() {
		this._handleStopCutPaste();

		var oSelectedGroupElement = this._oContextMenuPlugin.getContextElement();
		var oSmartForm = Utils.getClosestTypeForControl(oSelectedGroupElement, "sap.ui.comp.smartform.SmartForm");
		var oUngroupCommand = CommandFactory.getCommandFor(oSelectedGroupElement, "ungroup", {
			smartForm : oSmartForm
		});

		this.getCommandStack().pushAndExecute(oUngroupCommand);
	};

	/**
	 * Function to handle settings
	 *
	 * @private
	 */
	RuntimeAuthoring.prototype._handleSettings = function(aOverlays) {
		this._oSettingsPlugin.handleSettings(aOverlays);
	};

	/**
	 * @param {sap.ui.core.Element}
	 *          oElement The element which exists in the smart form
	 * @return {sap.ui.comp.smartform.SmartForm} the closest smart form found
	 * @private
	 */
	RuntimeAuthoring.prototype._getSmartFormForElement = function(oElement) {
		while (oElement && !ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.SmartForm")) {
			oElement = oElement.getParent();
		}

		return oElement;
	};

	/**
	 * Get the Title of the Application from the manifest.json
	 *
	 * @private
	 * @returns {String} the application title or empty string
	 */
	RuntimeAuthoring.prototype._getApplicationTitle = function() {

		var sTitle = "";
		var oComponent = sap.ui.core.Component.getOwnerComponentFor(this._oRootControl);
		if (oComponent) {
			sTitle = oComponent.getMetadata().getManifestEntry("sap.app").title;
		}
		return sTitle;
	};

	/**
	 * Check if Changes exists
	 * @private
	 * @returns {Promise}
	 */
	RuntimeAuthoring.prototype._checkChangesExist = function() {
		var oFlexController = FlexControllerFactory.createForControl(this._oRootControl);
		if (oFlexController.getComponentName().length > 0) {
			return oFlexController.getComponentChanges().then(function(aAllLocalChanges) {
				return aAllLocalChanges.length > 0;
			});
		} else {
			return Promise.resolve(false);
		}
	};

	return RuntimeAuthoring;

}, /* bExport= */true);
