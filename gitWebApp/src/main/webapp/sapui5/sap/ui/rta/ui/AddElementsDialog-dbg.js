/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global',
			   'sap/ui/rta/library',
			   'sap/ui/rta/Utils',
			   'sap/ui/dt/OverlayRegistry',
			   'sap/ui/core/Control',
			   'sap/ui/commons/Label',
			   'sap/ui/commons/LabelDesign',
			   'sap/m/Dialog',
			   'sap/ui/model/json/JSONModel',
			   'sap/m/SearchField',
			   'sap/m/Button',
			   'sap/m/Toolbar',
			   'sap/m/ToolbarSpacer',
			   'sap/ui/model/Filter',
			   'sap/ui/model/FilterOperator',
			   'sap/ui/rta/controlAnalyzer/ControlAnalyzerFactory',
			   'sap/ui/rta/command/CommandFactory',
			   'sap/ui/rta/command/CompositeCommand',
			   'sap/m/List',
			   'sap/m/CustomListItem',
			   'sap/m/ListType',
			   'sap/m/ScrollContainer',
			   'sap/ui/model/Sorter',
			   'sap/ui/dt/ElementUtil'
			   ],
			   function (jQuery,library,Utils,OverlayRegistry,Control,Label,LabelDesign,Dialog,JSONModel,SearchField,Button,Toolbar,ToolbarSpacer,Filter,FilterOperator,ControlAnalyzerFactory,CommandFactory,CompositeCommand,List,ListItem,ListType,ScrollContainer,Sorter,ElementUtil) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.AddElementsDialog control.
	 *
	 * @class Context - Dialog for available Fields in Runtime Authoring
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias AddElementsDialog
	 * @experimental Since 1.32. This class is experimental and provides only limited functionality. Also the API might be
	 *			   changed in future.
	 */
	var AddElementsDialog = Control.extend("sap.ui.rta.ui.AddElementsDialog", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				/** The root control which the runtime authoring should handle */
				"commandStack" : {
					type : "sap.ui.core.Control"
				}
			},
			associations : {
				/** The root control which the runtime authoring should handle */
				"rootControl" : {
					type : "sap.ui.core.Control"
				}
			},
			events : {
				"opened" : {},
				"closed" : {},
				"openCustomField" : {}
			}
		}
	});

	/**
	 * Initialize the Dialog
	 *
	 * @private
	 */
	AddElementsDialog.prototype.init = function() {
		this._aData = [];
		var that = this;
		this._oModel = new JSONModel();
		// Get messagebundle.properties for sap.ui.rta
		this._oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		this._bAscendingSortOrder = false;
		this._oDialog = this._createDialog();
		var aContent = this._createContent();
		var aButtons = this._createButtons();
		aContent.forEach(function(oContent) {
			that._oDialog.addContent(oContent);
		});
		aButtons.forEach(function(oButton) {
			that._oDialog.addButton(oButton);
		});
		this._oDialog.setInitialFocus(this._oInput);
	};

	/**
	 * Create the Dialog
	 *
	 * @private
	 */
	AddElementsDialog.prototype._createDialog = function() {
		var oDialog;
		oDialog = new Dialog({
			title : this._oTextResources.getText("HEADER_FREP")
		}).addStyleClass("sapUIRtaFieldRepositoryDialog");


		return oDialog;
	};

	/**
	 * Create the Content of the Dialog
	 *
	 * @private
	 */
	AddElementsDialog.prototype._createContent = function() {
		// SearchField
		this._oInput =  new SearchField({
			width : "100%",
			liveChange : [this._updateModelFilter, this]
		}).addStyleClass("resourceListIF");

		// Button for sorting the List
		var oResortButton = new Button({
			text : "",
			icon : "sap-icon://sort",
			press : [this._resortList, this]
		});

		// Button for creating Custom Fields
		this._oCustomFieldButton = new Button({
			text : "",
			icon : "sap-icon://add",
			tooltip : this._oTextResources.getText("BTN_FREP_CCF"),
			enabled : false,
			press : [this._redirectToCustomFieldCreation, this]
		});

		// Toolbar
		this._oToolbarSpacer1 = new ToolbarSpacer();
		this.oInputFields = new Toolbar({
			content: [this._oInput, oResortButton, this._oToolbarSpacer1, this._oCustomFieldButton]
		});

		// Fields of the List
		var oFieldName = new Label({
			design: LabelDesign.Bold,
			tooltip: {
				parts: [{path: "quickInfo"},{path: "fieldLabel"}],
				formatter: function(quickInfo, fieldLabel) {
											if (!quickInfo) {
													return fieldLabel;
											}
											return quickInfo;
									}
			},
			text: "{fieldLabel}"
		});

		// List
		var oSorter = new Sorter("fieldLabel", this._bAscendingSortOrder);
		this._oList = new List(
				{
					mode : "MultiSelect",
					includeItemInSelection : true,
					growing : false,
					growingScrollToLoad : false,
					select: [this._fnSelected, this]
				}).setNoDataText(this._oTextResources.getText("MSG_NO_FIELDS"));

		var oListItem = new ListItem({
			type: ListType.Active,
			selected : "{checked}",
			content : [oFieldName]
		});
		this._oModel.setData({modelData: this._aData});
		this._oList.setModel(this._oModel);
		this._oList.bindItems({path:"/modelData", template: oListItem, sorter : oSorter});

		// Scrollcontainer containing the List
		// Needed for scrolling the List
		var oScrollContainer = new ScrollContainer({
			content: this._oList,
			vertical: true,
			horizontal: false
		}).addStyleClass("sapUIRtaCCDialogScrollContainer");

		return [this.oInputFields,
				oScrollContainer];
	};

	/**
	 * Create the Buttons of the Dialog (OK/Cancel)
	 *
	 * @private
	 */
	AddElementsDialog.prototype._createButtons = function() {
		var oOKButton = new Button({
			text : this._oTextResources.getText("BTN_FREP_OK"),
			press : [this.applyChanges, this]
		});
		var oCancelButton = new Button({
			text : this._oTextResources.getText("BTN_FREP_CANCEL"),
			press : [this.cancelDialog, this]
		});
		return [oOKButton, oCancelButton];
	};

	/**
	 * Close the dialog.
	 */
	AddElementsDialog.prototype.applyChanges = function() {
		// push and Execute the Commands onto the command stack
		if (this._oCompositeCommand.getCommands().length > 0){
			this.getCommandStack().pushAndExecute(this._oCompositeCommand);
		}
		// clear all variables
		this._oList.removeSelections();
		this._oCompositeCommand = null;
		this._mCommands = [];
		this._oCurrentAnalyzer = null;
		this._oCurrentSelectedBlock = null;
		this._oDialog.close();
	};

	/**
	 * Close dialog and revert all change operations
	 */
	AddElementsDialog.prototype.cancelDialog = function() {
		// clear all variables
		this._oList.removeSelections();
		this._oCompositeCommand = null;
		this._mCommands = [];
		this._oCurrentAnalyzer = null;
		this._oCurrentSelectedBlock = null;
		this._oDialog.close();
	};

	/**
	 * Function to be called when a field is selected in list
	 *
	 * @param {sap.ui.base.Event}
	 *		  oEvent event object
	 * @private
	 */
	AddElementsDialog.prototype._fnSelected = function(oEvent) {
		var oItem = oEvent.getParameter("listItem");
		var oContextObject = oItem.getBindingContext().getObject();
		var sItemId = oContextObject.name ? oContextObject.name : null;
		if (!sItemId) {
			sItemId = oContextObject.controlId ? oContextObject.controlId : null;
		}
		if (sItemId) {
			var oSavedCommandForElement = this._mCommands[sItemId];
			this._executeCommandForSelectedElement(oItem, oSavedCommandForElement, sItemId);
		} else {
			jQuery.sap.log.error("Change could not be applied because of missing id of listItem\n");
		}
	};

	/**
	 * Evaluate target index for Move Command in case of a move inside the same group
	 *
	 * @param {sap.ui.core.Control}
	 *		oSourceContainer {object} source container of the element to be moved
	 * @param {sap.ui.core.Control}
	 *		oTargetContainer {object} target container of the element to be moved
	 * @param {int}
	 *		iSourceIndex source index of the element to be moved
	 * @param {int}
	 *		iTargetIndex target index of the element to be moved (to be evaluated)
	 * @returns {int} iTargetIndex the evaluated target index
	 * @private
	 */
	AddElementsDialog.prototype._evaluateTargetIndex = function(oSourceContainer, oTargetContainer, iSourceIndex, iTargetIndex) {
		var iIndex = (oSourceContainer === oTargetContainer && iSourceIndex < iTargetIndex) ? iTargetIndex - 1 : iTargetIndex;
		return iIndex;
	};

	/**
	 * Function to analyze whether a move command is necessary in case of unhiding elements
	 *
	 * @param {sap.ui.core.Control}
	 *		  oCurrentSelectedBlock {object} mChangeData
	 * @private
	 */
	AddElementsDialog.prototype._getMoveCommand = function(oCurrentSelectedBlock, mChangeData, oSelectedControl) {
		var oResult;

		var oSourceElement = sap.ui.getCore().byId(mChangeData.controlId);
		var oSourceParent = oSourceElement ? oSourceElement.getParent() : null;
		var oSourceParentDesignTimeMetadata = OverlayRegistry.getOverlay(oCurrentSelectedBlock).getDesignTimeMetadata();
		var iSourceIndex;
		var iTargetIndex;
		if (oCurrentSelectedBlock && oSourceParent && (oCurrentSelectedBlock.getId() !== oSourceElement.getId())) {
			if (ElementUtil.isInstanceOf(oCurrentSelectedBlock, "sap.ui.layout.form.SimpleForm")) {
				var oTargetContainer;
				if (ElementUtil.isInstanceOf(oSelectedControl, "sap.ui.layout.form.FormContainer")) {
					iTargetIndex = oSelectedControl.getAggregation("formElements").length;
					oTargetContainer = oSelectedControl;
				} else if (ElementUtil.isInstanceOf(oSelectedControl, "sap.ui.layout.form.FormElement")) {
					iTargetIndex = this._oCurrentAnalyzer._determineIndexOfFormElement(oSelectedControl, true);
					oTargetContainer = oSelectedControl.getParent();
				}
				iSourceIndex = this._oCurrentAnalyzer._determineIndexOfFormElement(oSourceElement.getParent(), false);
				var oSourceContainer = oSourceElement.getParent().getParent();
				iTargetIndex = this._evaluateTargetIndex(oSourceContainer, oTargetContainer, iSourceIndex, iTargetIndex);

				oResult = CommandFactory.getCommandFor(oCurrentSelectedBlock, "Move", {
					movedElements : [{
						element : oSourceElement.getParent(),
						sourceIndex : iSourceIndex,
						targetIndex : iTargetIndex
					}],
					source : {
						publicParent : oCurrentSelectedBlock,
						publicAggregation: "form",
						parent : oSourceContainer,
						aggregation : "formElements"
					},
					target : {
						publicParent : oCurrentSelectedBlock,
						publicAggregation: "form",
						parent : oTargetContainer,
						aggregation : "formElements"
					}
				}, oSourceParentDesignTimeMetadata);

			} else {
				var aSourceChildren = ElementUtil.getAggregation(oSourceParent, "formElements");
				if (aSourceChildren.length > 0) {
					iSourceIndex = aSourceChildren.indexOf(oSourceElement);
					var aTargetChildren = ElementUtil.getAggregation(oCurrentSelectedBlock, "formElements");
					var fnClass = oCurrentSelectedBlock.getMetadata().getClass();
					var iTargetIndex = (oSelectedControl instanceof fnClass) ? aTargetChildren.length : aTargetChildren.indexOf(oSelectedControl) + 1;
					iTargetIndex = this._evaluateTargetIndex(oSourceParent, oCurrentSelectedBlock, iSourceIndex, iTargetIndex);

					oResult = CommandFactory.getCommandFor(oSourceParent, "Move", {
						movedElements : [{
							element : oSourceElement,
							sourceIndex : iSourceIndex,
							targetIndex : iTargetIndex
						}],
						source : {
							parent : oSourceParent,
							publicAggregation : oSourceElement.sParentAggregationName,
							aggregation : oSourceElement.sParentAggregationName
						},
						target : {
							parent : oCurrentSelectedBlock,
							publicAggregation : "formElements",
							aggregation : "formElements"
						}
					}, oSourceParentDesignTimeMetadata);
				}
			}
		}
		return oResult;
	};

	/**
	 * Function which executes the command for the selected element
	 *
	 * @param {sap.ui.base.Event}
	 *		  oEvent event object
	 * @private
	 */
	AddElementsDialog.prototype._executeCommandForSelectedElement = function(oItem, oCommand, sItemId) {
		var bIsChecked = oItem.getSelected();
		var that = this;

		// If already a command exists, then the new command is remove selection
		if (oCommand){
			delete that._mCommands[sItemId];
			that._oCompositeCommand.removeCommand(oCommand);
			return;
		}
		// There is no Command for this Item in the list
		return this._oCurrentAnalyzer.createChangeData(oItem, this._oCurrentSelectedBlock, !bIsChecked, this._oSelectedControl).then(function(oChangeData) {
			if (oChangeData) {
				// New Field on the screen
				if (oChangeData.changeType === "addField") {
					oCommand = CommandFactory.getCommandFor(that._oCurrentSelectedBlock, "Add", {
						index : oChangeData.index,
						newControlId : oChangeData.newControlId,
						labels : [oChangeData.fieldLabel],
						jsTypes : [oChangeData.jsType],
						fieldValues : [oChangeData.fieldValue],
						valuePropertys : [oChangeData.valueProperty]
					});
					that._mCommands[sItemId] = oCommand;
					that._oCompositeCommand.insertCommand(oCommand);
				} else if (oChangeData.changeType === "unhideControl") {
					// Field has already been on the screen and has been hidden
					if (oChangeData.controlType && oChangeData.controlType === "SimpleForm") {
						var oCtrl = sap.ui.getCore().byId(oChangeData.controlId).getParent();
						oCommand = CommandFactory.getCommandFor(oCtrl, "Unhide");
					} else {
						oCommand = CommandFactory.getCommandFor(sap.ui.getCore().byId(oChangeData.controlId), "Unhide");
					}
					var oMoveCommand = that._getMoveCommand(that._oCurrentSelectedBlock, oChangeData, that._oSelectedControl);
					if (oMoveCommand) {
						var oComposit = new CompositeCommand();
						oComposit.addCommand(oMoveCommand);
						oComposit.addCommand(oCommand);
						oCommand = oComposit;
					}
					that._mCommands[sItemId] = oCommand;
					that._oCompositeCommand.insertCommand(oCommand);
				} else if (oChangeData.changeType === "unstashControl") {
					oCommand = CommandFactory.getCommandFor(sap.ui.getCore().byId(oChangeData.controlId), "Unstash");
					oCommand.setParentAggregationName(oChangeData.parentAggregationName);
					oCommand.setIndex(oChangeData.iTargetIndex);
					that._mCommands[sItemId] = oCommand;
					that._oCompositeCommand.insertCommand(oCommand);
				}
			} else {
				// undo selection, as it was prevented inside change controller
				oItem.setSelected(!bIsChecked);
			}
		}).catch(function(oError) {
			jQuery.sap.log.error("Change could not be applied \n" + oError);
		});
	};

	/**
	 * Open the Field Repository Dialog
	 *
	 * @param {sap.ui.core.Control}
	 *		  oControl Currently selected control
	 */
	AddElementsDialog.prototype.open = function(oControl) {
		var that = this;
		this._oSelectedControl = oControl;
		this._mCommands = [];
		this._oCompositeCommand = new CompositeCommand();

		if (oControl.getMetadata().getName().indexOf("ObjectPage") !== -1) {
			this._oDialog.setTitle(this._oTextResources.getText("HEADER_SREP"));
		} else {
			this._oDialog.setTitle(this._oTextResources.getText("HEADER_FREP"));
		}

		Utils.isServiceUpToDate(oControl).then(function(){
			that._oCurrentAnalyzer = ControlAnalyzerFactory.getControlAnalyzerFor(oControl);
			return that._oCurrentAnalyzer.prepare();
		}).then(function() {
			var oCustomFields = that._oCurrentAnalyzer.getCustomFieldAvailable ? that._oCurrentAnalyzer.getCustomFieldAvailable() : false;
			if (oCustomFields) {
					that.setShowCreateCustomField(true);
					that._oCurrentFieldExtInfo = oCustomFields;
					that.attachEventOnce('openCustomField', null, that._onOpenCustomField, that);
			} else {
				that.setShowCreateCustomField(false);
			}
		}).then(function(){
			// Get a change controller that is able to handle the actual selected control
			if (that._oCurrentAnalyzer) {
				that._oCurrentSelectedBlock = that._oCurrentAnalyzer.getSelectedBlock(oControl);

				// TODO: remove url-parameter
				if (/[&?](sap-rta-oldmodel=(true|x)[&#]?)+/i.test(window.location.search)) {
					that._oCurrentAnalyzer.getCustomizeControlModel(oControl, true).then(function(aFieldCollection) {
						that._oModel.setData({modelData: aFieldCollection});
						that._oDialog.oPopup.attachOpened(function (){
							that.fireOpened();
						});
						// Makes sure the modal div element does not change the size of our application (which would result in
						// recalculation of our overlays)
						that._oDialog.open();
					});
				} else {
						var mAvailableElements = that._oCurrentAnalyzer.getAvailableElements();
						that._oModel.setData({modelData:mAvailableElements});
						that._oDialog.oPopup.attachOpened(function (){
							that.fireOpened();
						});
						// Makes sure the modal div element does not change the size of our application (which would result in
						// recalculation of our overlays)
						that._oDialog.open();
				}
			}
		})["catch"](function() {
			that.fireOpened();
		});

	};


	/**
	 * Resort the list
	 *
	 * @param {sap.ui.base.Event}
	 *		  oEvent event object
	 * @private
	 */
	AddElementsDialog.prototype._resortList = function(oEvent) {
		this._bAscendingSortOrder = !this._bAscendingSortOrder;
		var oBinding = this._oList.getBinding("items");
		var aSorter = [];
		aSorter.push(new Sorter("fieldLabel", this._bAscendingSortOrder));
		oBinding.sort(aSorter);
	};

	/**
	 * Fire an event to redirect to custom field creation
	 *
	 * @param {sap.ui.base.Event}
	 *		  oEvent event object
	 * @private
	 */
	AddElementsDialog.prototype._redirectToCustomFieldCreation = function(oEvent) {
		this.fireOpenCustomField();
		this._oDialog.close();
	};

	/**
	 * Enables the Custom Field Creation button
	 *
	 * @param {boolean}
	 *		  bShowCCF true shows the button, false not
	 */
	AddElementsDialog.prototype.setShowCreateCustomField = function(bShowCCF) {
		this._oCustomFieldButton.setEnabled(bShowCCF);
	};

	/**
	 * Function called when custom field button was pressed
	 *
	 * @param {sap.ui.base.Event}
	 *		  oEvent event object
	 */
	AddElementsDialog.prototype._onOpenCustomField = function(oEvent) {
		// open field ext ui
		var oCrossAppNav = sap.ushell && sap.ushell.Container
		&& sap.ushell.Container.getService("CrossApplicationNavigation");
		var sHrefForFieldExtensionUi = (oCrossAppNav && oCrossAppNav.hrefForExternal({
			target : {
				semanticObject : "CustomField",
				action : "develop"
			},
			params : {
				businessContexts : this._oCurrentFieldExtInfo.BusinessContexts,
				serviceName : this._oCurrentFieldExtInfo.ServiceName,
				serviceVersion : this._oCurrentFieldExtInfo.ServiceVersion,
				entityType : this._oCurrentFieldExtInfo.EntityType
			}
		}));

		Utils.openNewWindow(sHrefForFieldExtensionUi);
	};
	/**
	 * Updates the model on filter events
	 *
	 * @param {sap.ui.base.Event}
	 *		  oEvent event object
	 * @private
	 */
	AddElementsDialog.prototype._updateModelFilter = function(oEvent) {
		var sValue = oEvent.getParameter("newValue");
		var oBinding = this._oList.getBinding("items");
		if ((typeof sValue) === "string") {
			var oFilterLabel = new Filter("fieldLabel", FilterOperator.Contains, sValue);
			var oFilterQuickInfo = new Filter("quickInfo", FilterOperator.Contains, sValue);
			var oFilterLabelOrInfo = new Filter({ filters: [oFilterLabel, oFilterQuickInfo], and: false });
			oBinding.filter([oFilterLabelOrInfo]);
		} else {
			oBinding.filter([]);
		}
	};

	return AddElementsDialog;

}, /* bExport= */ true);
