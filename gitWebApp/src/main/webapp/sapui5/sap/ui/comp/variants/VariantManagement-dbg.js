/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.variants.VariantManagement.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/Device', 'sap/ui/model/json/JSONModel', 'sap/m/SearchField', 'sap/m/RadioButton', 'sap/ui/core/TextAlign', 'sap/m/ScreenSize', 'sap/m/PopinDisplay', 'sap/m/Column', 'sap/m/Text', 'sap/m/Bar', 'sap/m/Table', 'sap/m/Page', 'sap/m/PlacementType', 'sap/m/ButtonType', 'sap/m/Toolbar', 'sap/m/ToolbarSpacer', 'sap/m/ActionSheet', 'sap/m/Button', 'sap/m/CheckBox', 'sap/m/Dialog', 'sap/m/Input', 'sap/m/Label', 'sap/m/ResponsivePopover', 'sap/m/SelectList', 'sap/m/ObjectIdentifier', 'sap/ui/comp/library', 'sap/ui/comp/transport/TransportSelection', './EditableVariantItem', './VariantItem', 'sap/ui/core/InvisibleText', 'sap/ui/core/Control', 'sap/ui/core/Item', 'sap/ui/core/ValueState', 'sap/ui/core/VerticalAlign', 'sap/ui/layout/HorizontalLayout', 'sap/ui/layout/Grid'
], function(jQuery, Device, JSONModel, SearchField, RadioButton, TextAlign, ScreenSize, PopinDisplay, Column, Text, Bar, Table, Page, PlacementType, ButtonType, Toolbar, ToolbarSpacer, ActionSheet, Button, CheckBox, Dialog, Input, Label, ResponsivePopover, SelectList, ObjectIdentifier, library, TransportSelection, EditableVariantItem, VariantItem, InvisibleText, Control, Item, ValueState, VerticalAlign, HorizontalLayout, Grid) {
	"use strict";

	/**
	 * Constructor for a new VariantManagement.
	 * 
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The VariantManagement control can be used to manage variants, such as filter bar variants or table variants.
	 * @extends sap.ui.core.Control
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.variants.VariantManagement
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var VariantManagement = Control.extend("sap.ui.comp.variants.VariantManagement", /** @lends sap.ui.comp.variants.VariantManagement.prototype */
	{
		metadata: {
			library: "sap.ui.comp",
			designTime: true,
			properties: {

				/**
				 * Enables the setting of the initially selected variant.
				 * 
				 * @since 1.22.0
				 */
				initialSelectionKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Can be set to true or false depending on whether you want to enable or disable the control.
				 * 
				 * @since 1.22.0
				 */
				enabled: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Provides a string value to set the default variant. Used for the save dialog. Has no effect on the selected variant.
				 * 
				 * @since 1.22.0
				 */
				defaultVariantKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The key of the currently selected item. Returns null if the default item list is selected.
				 * 
				 * @since 1.24.0
				 */
				selectionKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Indicates that a Create Tile is visible in the Create dialog.
				 * 
				 * @since 1.26.0
				 * @deprecated Since version 1.32.0.
				 */
				showCreateTile: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that Execute on Selection is visible in the Save Variant and the Manage Variants dialogs.
				 * 
				 * @since 1.26.0
				 */
				showExecuteOnSelection: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that Share is visible in the Save Variant and the Manage Variants dialogs. Share allows you to share variants with other
				 * users.
				 * 
				 * @since 1.26.0
				 */
				showShare: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates that set as default is visible in the Save Variant and the Manage Variants dialogs.
				 * 
				 * @since 1.44.0
				 */
				showSetAsDefault: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Enables the lifecycle support. If set to true, the VariantManagement control handles the transport information for shared variants.
				 * 
				 * @since 1.26.0
				 */
				lifecycleSupport: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Overwrites the default Standard variant title.
				 * 
				 * @since 1.28.0
				 */
				standardItemText: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * If set to<code>true</code>, the scenario is an industry-specific solution. This flag is only used internally in the app variant
				 * scenarios.
				 * 
				 * @since 1.32.0
				 */
				industrySolutionMode: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Items displayed by the VariantManagement control.
				 * 
				 * @since 1.22.0
				 * @deprecated Since version 1.26.0. Replaced by association <code>variantItems</code>
				 */
				items: {
					type: "sap.ui.core.Item",
					multiple: true,
					singularName: "item",
					deprecated: true
				},

				/**
				 * Variant items displayed by the VariantManagement control.
				 * 
				 * @since 1.26.0
				 */
				variantItems: {
					type: "sap.ui.comp.variants.VariantItem",
					multiple: true,
					singularName: "variantItem"
				}
			},
			events: {

				/**
				 * This event is fired when the Save Variant dialog is closed with OK for a variant.
				 * 
				 * @since 1.22.0
				 */
				save: {
					parameters: {
						/**
						 * The variant title
						 */
						name: {
							type: "string"
						},

						/**
						 * Indicates if an existing variant is overwritten or if a new variant is created
						 */
						overwrite: {
							type: "boolean"
						},

						/**
						 * The variant key
						 */
						key: {
							type: "string"
						},

						/**
						 * The Execute on Selection indicator
						 */
						exe: {
							type: "boolean"
						},

						/**
						 * The default variant indicator
						 */
						def: {
							type: "boolean"
						},

						/**
						 * The shared variant indicator
						 */
						global: {
							type: "boolean"
						},

						/**
						 * The package name
						 */
						lifecyclePackage: {
							type: "string"
						},

						/**
						 * The transport ID
						 */
						lifecycleTransportId: {
							type: "string"
						}
					}
				},

				/**
				 * This event is fired when users apply changes to variants in the Manage Variants dialog.
				 * 
				 * @since 1.22.0
				 */
				manage: {
					parameters: {
						/**
						 * List of changed variant keys
						 */
						renamed: {
							type: "string[]"
						},

						/**
						 * List of deleted variant keys
						 */
						deleted: {
							type: "string[]"
						},

						/**
						 * List of variant keys and the associated Execute on Selection indicator
						 */
						exe: {
							type: "object[]"
						},

						/**
						 * The default variant key
						 */
						def: {
							type: "boolean"
						}
					}
				},

				/**
				 * This event is fired when a new variant is selected.
				 * 
				 * @since 1.22.0
				 */
				select: {
					parameters: {
						/**
						 * The variant key
						 */
						key: {
							type: "string"
						}
					}
				}
			}
		},
		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 * 
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
		renderer: function(oRm, oControl) {
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.addClass("sapUiCompVarMngmt");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.oVariantLayout);
			oRm.write("</div>");
		}
	});

	VariantManagement.STANDARD_NAME = "STANDARD";
	VariantManagement.MAX_NAME_LEN = 100;

	/**
	 * Constructs and initializes the VariantManagement control.
	 */
	VariantManagement.prototype.init = function() {
		var that = this;

		this.STANDARDVARIANTKEY = "*standard*";
		this.setStandardVariantKey(this.STANDARDVARIANTKEY);
		this.aRemovedVariants = [];
		this.aRenamedVariants = [];
		this.aRemovedVariantTransports = [];
		this.aExeVariants = [];
		this.oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");
		this.lastSelectedVariantKey = this._sStandardVariantKey;
		this.bVariantItemMode = false;
		this.oSelectedItem = null;
		this.sNewDefaultKey = "";
		this.bManagementTableInitialized = false;
		this.sTransport = null;
		this.sPackage = null;
		this.aEvents = [];
		this.bEventRunning = false;
		this.bPopoverOpen = false;
		this.oVariantSelectionPage = null;
		this.oActions = null;
		this.oActionSheet = null;
		this.oActionSheetManage = null;
		this.oActionSheetSave = null;
		this.oActionSheetSaveAs = null;
		this.bManualVariantKey = false;
		this.bFireSelect = false;
		this.bExecuteOnSelectForStandardViaXML = false;
		this.bExecuteOnSelectForStandardByUser = null;
		this.bSupportExecuteOnSelectOnSandardVariant = false;
		this._bInnerControlsCreated = false;

		this._isVendorLayer = false;

		this.oModel = new JSONModel({
			enabled: false,
			selectedVariant: ""
		});
		this.setModel(this.oModel, "save_enablement");

		this.oVariantInvisbletext = new InvisibleText({
			text: {
				parts: [
					{
						path: 'save_enablement>/selectedVariant'
					}, {
						path: 'save_enablement>/enabled'
					}
				],
				formatter: function(sText, bValue) {
					if (bValue) {
						sText = that.oResourceBundle.getText("VARIANT_MANAGEMENT_MODIFIED", [
							sText
						]);
					}
					return sText;
				}
			}
		});

		this.oVariantText = new Label(this.getId() + "-text", {
			text: "{save_enablement>/selectedVariant}"
		});
		this._setStandardText();
		this.oVariantText.addStyleClass("sapUICompVarMngmtText");
		this.oVariantText.addStyleClass("sapMH4Style");

		if (Device.system.phone) {
			this.oVariantText.addStyleClass("sapUICompVarMngmtTextMaxWidth");
		}

		this.oVariantModifiedText = new Label(this.getId() + "-modified", {
			visible: "{save_enablement>/enabled}"
		});
		this.oVariantModifiedText.setText("*");
		this.oVariantModifiedText.addStyleClass("sapUICompVarMngmtText");

		// FIORITECHP1-3557
		this.oVariantModifiedText.addStyleClass("sapUICompVarMngmtModified");
		this.oVariantModifiedText.addStyleClass("sapMH4Style");

		this.oVariantPopoverTrigger = new Button(this.getId() + "-trigger", {
			type: ButtonType.Transparent,
			icon: "sap-icon://arrow-down",
			press: function() {
				that._openVariantSelection();
			},
			tooltip: this.oResourceBundle.getText("VARIANT_MANAGEMENT_TRIGGER_TT")
		});

		this.oVariantPopoverTrigger.addStyleClass("sapUICompVarMngmtTriggerBtn");

		this.oVariantPopoverTrigger.addAriaLabelledBy(this.oVariantInvisbletext);
		this.oVariantLayout = new HorizontalLayout({
			content: [
				this.oVariantText, this.oVariantModifiedText, this.oVariantPopoverTrigger, this.oVariantInvisbletext
			]
		});
		this.oVariantLayout.addStyleClass("sapUICompVarMngmtLayout");
		this.addDependent(this.oVariantLayout);
	};

	// FIORITECHP1-3554
	VariantManagement.prototype._setTriggerButtonIcon = function(bFlag) {
		var oIcon;

		if (!Device.system.phone) {

			oIcon = sap.ui.getCore().byId(this.oVariantPopoverTrigger.$("img")[0].id);
			if (oIcon) {
				oIcon.toggleStyleClass("sapUiCompVarMngmtImageExpand");
			}
		}
	};

	VariantManagement.prototype._triggerSave = function() {
		var oEvent = this._createEvent("variantSaveAs", this._handleVariantSaveAs);
		this._addEvent(oEvent);
	};

	VariantManagement.prototype._checkVariantNameConstraints = function(oInputField, oSaveButton, oManagementTable) {

		if (!oInputField) {
			return;
		}

		var sValue = oInputField.getValue();
		sValue = sValue.trim();

		if (!this._checkIsDuplicate(oInputField, sValue, this.oManagementTable)) {

			if (sValue === "") {
				oInputField.setValueState(ValueState.Error);
				oInputField.setValueStateText(this.oResourceBundle.getText("VARIANT_MANAGEMENT_ERROR_EMPTY"));
			} else if (sValue.length > VariantManagement.MAX_NAME_LEN) {
				oInputField.setValueState(ValueState.Error);
				oInputField.setValueStateText(this.oResourceBundle.getText("VARIANT_MANAGEMENT_MAX_LEN", [
					VariantManagement.MAX_NAME_LEN
				]));
			} else {
				oInputField.setValueState(ValueState.None);
				oInputField.setValueStateText(null);
			}
		}

		if (oSaveButton) {

			if (oInputField.getValueState() !== ValueState.Error) {
				this._checkIsDuplicate(oInputField, sValue, oManagementTable);
			}

			if ((oInputField.getValueState() === ValueState.Error) || this._anyInErrorState(oManagementTable)) {
				oSaveButton.setEnabled(false);
			} else {
				oSaveButton.setEnabled(true);
			}
		}
	};

	VariantManagement.prototype._anyInErrorState = function(oManagementTable, oInputField) {
		var oItems, oInput, i;

		if (oManagementTable) { //
			oItems = oManagementTable.getItems();
			if (oItems) {
				for (i = 0; i < oItems.length; i++) {
					oInput = oItems[i].getCells()[0];

					if (oInputField && (oInputField === oInput)) {
						continue;
					}

					if (oInput && oInput.getValueState && (oInput.getValueState() === ValueState.Error)) {
						if (this._checkIsDuplicate(oInput, oInput.getValue(), oManagementTable)) {
							return true;
						}
					}
				}
			}
		}

		return false;
	};

	VariantManagement.prototype._checkIsDuplicate = function(oInputField, sValue, oManagementTable) {

		var bFlag = this._isDuplicate(oInputField, sValue, oManagementTable);

		if (bFlag) {
			oInputField.setValueState(ValueState.Error);
			oInputField.setValueStateText(this.oResourceBundle.getText("VARIANT_MANAGEMENT_ERROR_DUPLICATE"));
		} else {
			oInputField.setValueState(ValueState.None);
			oInputField.setValueStateText(null);
		}

		return bFlag;
	};

	VariantManagement.prototype._isDuplicate = function(oInputField, sValue, oManagementTable) {
		if (oManagementTable) {
			return this._isDuplicateManaged(oInputField, sValue, oManagementTable);
		} else {
			return this._isDuplicateSaveAs(sValue);
		}
	};

	VariantManagement.prototype._isDuplicateManaged = function(oInputField, sValue, oManagementTable) {
		var oItems, oInput, i;

		if (oManagementTable) { //
			oItems = oManagementTable.getItems();
			if (oItems) {
				for (i = 0; i < oItems.length; i++) {
					oInput = oItems[i].getCells()[0];

					if (oInput === oInputField) {
						continue;
					}

					if (oInput) {
						if (oInput.getValue && (sValue === oInput.getValue().trim())) {
							return true;
						} else if (oInput.getText && (sValue === oInput.getText().trim())) {
							return true;
						}
					}
				}
			}
		}

		return false;
	};

	VariantManagement.prototype._isDuplicateSaveAs = function(sValue) {
		var sTrimName = sValue.trim();
		if (!sTrimName) {
			return true;
		}

		var sText = this._determineStandardVariantName();
		if (sText === sTrimName) {
			return true;
		}

		var oItems = this._getItems();
		for (var iCount = 0; iCount < oItems.length; iCount++) {
			sText = oItems[iCount].getText().trim();
			if (sText === sTrimName) {
				return true;
			}
		}

		return false;
	};

	VariantManagement.prototype._createActionSheet = function() {

		if (!this.oActionSheet) {
			this.oActionSheet = new ActionSheet(this.getId() + "-actionsheet", {
				showCancelButton: true,
				buttons: [
					this.oActionSheetManage, this.oActionSheetSave, this.oActionSheetSaveAs
				],
				placement: PlacementType.Top
			});
		}
	};

	VariantManagement.prototype._createSaveDialog = function() {
		var that = this;

		// this.oSaveSave.setEnabled(false);

		var sValue = this.oInputName ? this.oInputName.getValue() : "";
		this.oSaveSave.setEnabled(!this._isDuplicate(this.oInputName, sValue));

		if (!this.oSaveDialog) {

			this.oSaveDialog = new Dialog(this.getId() + "-savedialog", {
				title: this.oResourceBundle.getText("VARIANT_MANAGEMENT_SAVEDIALOG"),
				beginButton: this.oSaveSave,
				endButton: new Button(this.getId() + "-variantcancel", {
					text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_CANCEL"),
					press: function() {
						that._bSaveCanceled = true;
						that.oSaveDialog.close();
					}
				}),
				content: [
					this.oLabelName, this.oInputName, this.oLabelKey, this.oInputKey, this.oSaveDialogOptionsGrid
				],
				stretch: Device.system.phone,
				afterOpen: function() {
					that._setTriggerButtonIcon(false);
				},
				afterClose: function() {
					that._setTriggerButtonIcon(true);
				}
			});
			this.oSaveDialog.setParent(this);
			this.oSaveDialog.addStyleClass("sapUiPopupWithPadding");
			this.oSaveDialog.addStyleClass("sapUiCompVarMngmtSaveDialog");
		}
	};

	VariantManagement.prototype._createManagementDialog = function() {
		var that = this;

		if (!this.oManagementDialog) {
			this.oManagementDialog = new Dialog(this.getId() + "-managementdialog", {
				// contentWidth: "600px",
				customHeader: new Bar(this.getId() + "-managementHeader", {
					contentMiddle: [
						new Text(this.getId() + "-managementHeaderText", {
							text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_MANAGEDIALOG")
						})
					]
				}),
				beginButton: this.oManagementSave,
				endButton: new Button(this.getId() + "-managementcancel", {
					text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_CANCEL"),
					press: function() {
						that.aRemovedVariants = [];
						that.oManagementDialog.close();
					}
				}),
				content: [
					this.oManagementTable
				],
				stretch: Device.system.phone,
				afterOpen: function() {
					that._setTriggerButtonIcon(false);
				},
				afterClose: function() {
					if (that.bFireSelect == true) {
						that.bFireSelect = false;
						setTimeout(function() {
							that._fireSelectAsync();
						}, 0);
					}
					that._setTriggerButtonIcon(true);
				}
			});
			this.oManagementDialog.setParent(this);

			// FIORITECHP1-3555
			// this.oManagementDialog.addStyleClass("sapUiPopupWithPadding");
		}
	};

	VariantManagement.prototype._handleArrowUpDown = function(oList, oSearch) {

		var sItemId = null;
		var that = this;

		oList.attachBrowserEvent("keydown", jQuery.proxy(function(e) {
			if (e.which === 38) { // UP
				if (that.oVariantSelectionPage.getShowSubHeader()) {
					sItemId = document.activeElement.id;
				}
			}
		}, this));

		oList.attachBrowserEvent("keyup", jQuery.proxy(function(e) {
			if (e.which === 38) { // UP
				if (sItemId && (sItemId === document.activeElement.id)) {
					var aItems = oList.getItems();
					if (aItems && aItems.length > 0) {
						var oItem = sap.ui.getCore().byId(sItemId);
						if (oItem === aItems[0]) {
							oSearch.focus();
						}
					}
				}

				sItemId = null;
			}
		}, this));

		oSearch.attachBrowserEvent("keyup", jQuery.proxy(function(e) {
			if (e.which === 40) { // DOWN
				var aItems = oList.getItems();
				if (aItems && aItems.length > 0) {
					aItems[0].focus();
				}
			}
		}, this));
	};

	VariantManagement.prototype._triggerSearch = function(oEvent) {

		if (!oEvent) {
			return;
		}

		var parameters = oEvent.getParameters();
		if (!parameters) {
			return;
		}

		this._restoreCompleteList();

		var sValue = parameters.newValue ? parameters.newValue : "";

		this._triggerSearchByValue(sValue.toLowerCase());
	};

	VariantManagement.prototype._triggerSearchByValue = function(sValue) {
		var sText, sKey, oVariantListItem;

		this.oSelectedVariantItemKey = null;

		oVariantListItem = this.oVariantList.getItemByKey(this.getStandardVariantKey());
		if (oVariantListItem && (oVariantListItem.getText().toLowerCase().indexOf(sValue) < 0)) {

			if (this.getSelectionKey() === sKey) {
				this.oSelectedVariantItemKey = sKey;
			}
			this.oVariantList.removeItem(oVariantListItem);

			oVariantListItem.destroy();
		}

		var oItems = this._getItems();
		for (var iCount = 0; iCount < oItems.length; iCount++) {
			sText = oItems[iCount].getText();

			if (sText.toLowerCase().indexOf(sValue) < 0) {
				sKey = oItems[iCount].getKey();
				oVariantListItem = this.oVariantList.getItemByKey(sKey);
				if (oVariantListItem) {

					if (this.getSelectionKey() === sKey) {
						this.oSelectedVariantItemKey = sKey;
					}
					this.oVariantList.removeItem(oVariantListItem);

					oVariantListItem.destroy();
				}
			}
		}
	};

	VariantManagement.prototype._restoreCompleteList = function() {
		var iCount, oItem, oItems, oVariantListItem;
		var nOffset = 0;

		oVariantListItem = this.oVariantList.getItemByKey(this.getStandardVariantKey());
		if (!oVariantListItem) {
			oVariantListItem = this._createStandardVariantListItem();
			if (oVariantListItem) {
				this.oVariantList.insertItem(oVariantListItem, 0);
			}
		}

		if (oVariantListItem) {
			nOffset = 1;
			if (this.oSelectedVariantItemKey) {
				if (this.oSelectedVariantItemKey === oVariantListItem.getKey()) {
					this.oVariantList.setSelectedItem(oVariantListItem);
					this.oSelectedVariantItemKey = null;
				}
			} else {
				/* eslint-disable no-lonely-if */
				if (this.getSelectionKey() == oVariantListItem.getKey() || this.getSelectionKey() === null) {
					this.oVariantList.setSelectedItem(oVariantListItem);
					/* eslint-enable no-lonely-if */
				}
			}
		}

		oItems = this._getItems();
		oItems.sort(this._compareItems);
		for (iCount = 0; iCount < oItems.length; iCount++) {
			oItem = oItems[iCount];

			if (oItem.getKey() === this.getStandardVariantKey()) {
				continue;
			}

			oVariantListItem = this.oVariantList.getItemByKey(oItem.getKey());
			if (!oVariantListItem) {
				oVariantListItem = this._createVariantListItem(oItem, iCount);
				this.oVariantList.insertItem(oVariantListItem, iCount + nOffset);
			}

			if (this.oSelectedVariantItemKey) {
				if (this.oSelectedVariantItemKey === oVariantListItem.getKey()) {
					this.oVariantList.setSelectedItem(oVariantListItem);
					this.oSelectedVariantItemKey = null;
				}
			} else {
				/* eslint-disable no-lonely-if */
				if (this.getSelectionKey() == oVariantListItem.getKey()) {
					this.oVariantList.setSelectedItem(oVariantListItem);
					/* eslint-enable no-lonely-if */
				}
			}

		}
	};

	VariantManagement.prototype._determineStandardVariantName = function() {

		var sText = this.oResourceBundle.getText("VARIANT_MANAGEMENT_STANDARD");

		if (this.bVariantItemMode === false) {
			sText = this.oResourceBundle.getText("VARIANT_MANAGEMENT_DEFAULT");
		}

		if (this.getStandardVariantKey() === this.STANDARDVARIANTKEY) {
			if (this.getStandardItemText() !== null && this.getStandardItemText() != "") {
				sText = this.getStandardItemText();
			}
		}

		return sText;

	};

	VariantManagement.prototype._createStandardVariantListItem = function() {
		var oItem, oVariantListItem = null;

		var sText = this._determineStandardVariantName();

		if ((this.bVariantItemMode === true) || (this.bVariantItemMode === false && (this.getSelectionKey() === this.getStandardVariantKey() || this.getSelectionKey() === null))) {

			oVariantListItem = new VariantItem(this.oVariantPopoverTrigger.getId() + "-item-standard", {
				key: this.getStandardVariantKey(),
				text: sText,
				readOnly: true, // !this.getIndustrySolutionMode(),
				executeOnSelection: this.getExecuteOnSelectForStandardVariant()
			});

			if (this._isIndustrySolutionModeAndVendorLayer() && this.bVariantItemMode) {
				oVariantListItem.setGlobal(true);
				oVariantListItem.setReadOnly(false); // in vendor layer a change should be possible
			}

			if (this.getStandardVariantKey() !== this.STANDARDVARIANTKEY) {
				oItem = this.getItemByKey(this.getStandardVariantKey());
				if (oItem) {
					this._setVariantListItemProperties(oItem, oVariantListItem);
					// oVariantListItem.setReadOnly(true);
				}
			} else {
				oVariantListItem.setAuthor("SAP");
			}
		}

		return oVariantListItem;
	};

	VariantManagement.prototype._createVariantListItem = function(oItem, iCount) {
		var oVariantListItem = new VariantItem(this.oVariantPopoverTrigger.getId() + "-item-" + iCount, {
			key: oItem.getKey(),
			text: oItem.getText()
		});

		this._setVariantListItemProperties(oItem, oVariantListItem);

		return oVariantListItem;
	};

	VariantManagement.prototype._setVariantListItemProperties = function(oItem, oVariantListItem) {
		if (oItem.getReadOnly) {
			oVariantListItem.setReadOnly(oItem.getReadOnly());
		}
		if (oItem.getExecuteOnSelection) {
			oVariantListItem.setExecuteOnSelection(oItem.getExecuteOnSelection());
		}
		if (oItem.getGlobal) {
			oVariantListItem.setGlobal(oItem.getGlobal());
		}
		if (oItem.getLifecyclePackage) {
			oVariantListItem.setLifecyclePackage(oItem.getLifecyclePackage());
		}
		if (oItem.getLifecycleTransportId) {
			oVariantListItem.setLifecycleTransportId(oItem.getLifecycleTransportId());
		}
		if (oItem.getNamespace) {
			oVariantListItem.setNamespace(oItem.getNamespace());
		}
		if (oItem.getAccessOptions) {
			oVariantListItem.setAccessOptions(oItem.getAccessOptions());
		}
		if (oItem.getLabelReadOnly) {
			oVariantListItem.setLabelReadOnly(oItem.getLabelReadOnly());
		}
		if (oItem.getAuthor) {
			oVariantListItem.setAuthor(oItem.getAuthor());
		}
	};

	// exit destroy all controls created in init
	VariantManagement.prototype.exit = function() {

		if (this.oSearchField) {
			this.oSearchField.destroy();
			this.oSearchField = undefined;
		}

		if (this.oVariantManage) {
			this.oVariantManage.destroy();
			this.oVariantManage = undefined;
		}
		if (this.oVariantSave) {
			this.oVariantSave.destroy();
			this.oVariantSave = undefined;
		}
		if (this.oVariantList) {
			this.oVariantList.destroy();
			this.oVariantList = undefined;
		}
		if (this.oInputName) {
			this.oInputName.destroy();
			this.oInputName = undefined;
		}
		if (this.oLabelName) {
			this.oLabelName.destroy();
			this.oLabelName = undefined;
		}
		if (this.oDefault) {
			this.oDefault.destroy();
			this.oDefault = undefined;
		}
		if (this.oSaveSave) {
			this.oSaveSave.destroy();
			this.oSaveSave = undefined;
		}
		if (this.oSaveDialog) {
			this.oSaveDialog.destroy();
			this.oSaveDialog = undefined;
		}
		if (this.oManagementTable) {
			this.oManagementTable.destroy();
			this.oManagementTable = undefined;
		}
		if (this.oManagementSave) {
			this.oManagementSave.destroy();
			this.oManagementSave = undefined;
		}
		if (this.oManagementDialog) {
			this.oManagementDialog.destroy();
			this.oManagementDialog = undefined;
		}
		if (this.oVariantText) {
			this.oVariantText.destroy();
			this.oVariantText = undefined;
		}
		if (this.oVariantPopoverTrigger) {
			this.oVariantPopoverTrigger.destroy();
			this.oVariantPopoverTrigger = undefined;
		}
		if (this.oVariantLayout) {
			this.oVariantLayout.destroy();
			this.oVariantLayout = undefined;
		}
		if (this.oVariantPopOver) {
			this.oVariantPopOver.destroy();
			this.oVariantPopOver = undefined;
		}
		if (this.oVariantSaveAs) {
			this.oVariantSaveAs.destroy();
			this.oVariantSaveAs = undefined;
		}
		if (this.oShare) {
			this.oShare.destroy();
			this.oShare = undefined;
		}
		if (this.oExecuteOnSelect) {
			this.oExecuteOnSelect.destroy();
			this.oExecuteOnSelect = undefined;
		}
		if (this.oCreateTile) {
			this.oCreateTile.destroy();
			this.oCreateTile = undefined;
		}
		if (this.oSaveDialogOptionsGrid) {
			this.oSaveDialogOptionsGrid.destroy();
			this.oSaveDialogOptionsGrid = undefined;
		}
		if (this.oVariantSelectionPage) {
			this.oVariantSelectionPage.destroy();
			this.oVariantSelectionPage = undefined;
		}
		if (this.oActions) {
			this.oActions.destroy();
			this.oActions = undefined;
		}
		if (this.oActionSheetManage) {
			this.oActionSheetManage.destroy();
			this.oActionSheetManage = undefined;
		}
		if (this.oActionSheetSave) {
			this.oActionSheetSave.destroy();
			this.oActionSheetSave = undefined;
		}
		if (this.oActionSheetSaveAs) {
			this.oActionSheetSaveAs.destroy();
			this.oActionSheetSaveAs = undefined;
		}
		if (this.oInputKey) {
			this.oInputKey.destroy();
			this.oInputKey = undefined;
		}
		if (this.oLabelKey) {
			this.oLabelKey.destroy();
			this.oLabelKey = undefined;
		}
	};

	VariantManagement.prototype.addItem = function(oItem) {
		oItem = this.validateAggregation("items", oItem, true);
		this.bVariantItemMode = false;
		this.addAggregation("items", oItem, false);
		var _sKey = this.getInitialSelectionKey();
		this._setSelection(oItem, _sKey);
		this._manageButtonState();
		this._setStandardText();
		return this;
	};

	VariantManagement.prototype.insertItem = function(oItem, iIndex) {
		var _iIndex = iIndex;
		oItem = this.validateAggregation("items", oItem, true);
		this.bVariantItemMode = false;
		this.insertAggregation("items", oItem, _iIndex);
		var _sKey = this.getInitialSelectionKey();
		this._setSelection(oItem, _sKey);
		this._manageButtonState();
		this._setStandardText();
		return this;
	};

	VariantManagement.prototype.removeItem = function(oItem) {
		this.removeAggregation("items", oItem);
		this._manageButtonState();
		return oItem;
	};

	VariantManagement.prototype.removeAllItems = function() {
		var ret = this.removeAllAggregation("items");
		this._manageButtonState();
		this._setSelectedItem(null);
		return ret;
	};

	VariantManagement.prototype.destroyItems = function() {
		this.destroyAggregation("items");
		this._manageButtonState();
		this._setSelectedItem(null);
		return this;
	};

	VariantManagement.prototype._getItems = function() {
		if (this.bVariantItemMode) {
			return this.getVariantItems();
		} else {
			return this.getItems();
		}
	};

	VariantManagement.prototype._removeItem = function(oItem) {
		if (this.bVariantItemMode) {
			return this.removeVariantItem(oItem);
		} else {
			return this.removeItem(oItem);
		}
	};

	VariantManagement.prototype.getItemByKey = function(sKey) {
		var oItems = this._getItems();
		for (var iCount = 0; iCount < oItems.length; iCount++) {
			if (sKey == oItems[iCount].getKey()) {
				return oItems[iCount];
			}
		}
		return null;
	};

	VariantManagement.prototype.addVariantItem = function(oVariantItem) {
		oVariantItem = this.validateAggregation("variantItems", oVariantItem, true);
		this.bVariantItemMode = true;
		this.addAggregation("variantItems", oVariantItem, false);
		var _sKey = this.getInitialSelectionKey();
		this._setSelection(oVariantItem, _sKey);
		this._manageButtonState();
		this._setStandardText();
		return this;
	};

	VariantManagement.prototype.insertVariantItem = function(oVariantItem, iIndex) {
		var _iIndex = iIndex;
		oVariantItem = this.validateAggregation("variantItems", oVariantItem, true);
		this.bVariantItemMode = true;
		this.insertAggregation("variantItems", oVariantItem, _iIndex);
		var _sKey = this.getInitialSelectionKey();
		this._setSelection(oVariantItem, _sKey);
		this._manageButtonState();
		this._setStandardText();
		return this;
	};

	VariantManagement.prototype._setSelectedItem = function(oItem) {
		this.oSelectedItem = oItem;
		if (oItem != null) {
			this._setVariantText(oItem.getText());
		} else {
			this._setStandardText();
		}
	};

	VariantManagement.prototype._getSelectedItem = function() {
		return this.oSelectedItem;
	};

	VariantManagement.prototype.setInitialSelectionKey = function(sKey) {
		this.setProperty("initialSelectionKey", sKey, true); // do not re-render !
		this._setSelectionByKey(sKey);
	};

	VariantManagement.prototype.setEnabled = function(bEnabled) {
		this.setProperty("enabled", bEnabled, false);
		if (this.oVariantPopoverTrigger) {
			this.oVariantPopoverTrigger.setEnabled(bEnabled);
		}
		if (!bEnabled) {
			this.oVariantText.addStyleClass("sapUICompVarMngmtDisabled");
			this.oVariantModifiedText.addStyleClass("sapUICompVarMngmtDisabled");
		} else {
			this.oVariantText.removeStyleClass("sapUICompVarMngmtDisabled");
			this.oVariantModifiedText.removeStyleClass("sapUICompVarMngmtDisabled");
		}
	};

	VariantManagement.prototype.getFocusDomRef = function() {
		if (this.oVariantPopoverTrigger && this.getEnabled()) {
			return this.oVariantPopoverTrigger.getFocusDomRef();
		}

		return sap.ui.core.Element.prototype.getFocusDomRef.apply(this, []);
	};

	/**
	 * The string given as "sKey" will be used to set the initial selected item of the Variant Management. If an item exists with the matching key the
	 * item will be marked as selected If the key is set before any items are added the Variant Management will try to set the selection when the
	 * items are added in "addItem" or "insterItem".
	 * 
	 * @param {sap.ui.core.Item} oItem the Item to be compared
	 * @param {string} sKey the string used to be compared with the item's key attribute
	 */
	VariantManagement.prototype._setSelection = function(oItem, sKey) {
		if (oItem.getKey() === sKey) {
			this._setSelectedItem(oItem);
			this.fireSelect({
				key: sKey
			});
		}
	};

	VariantManagement.prototype.addStyleClass = function(sStyleClass) {
		if (Control.prototype.addStyleClass) {
			Control.prototype.addStyleClass.apply(this, arguments);
		}
		if (this.oVariantPopOver) {
			this.oVariantPopOver.addStyleClass(sStyleClass);
		}
		if (this.oSaveDialog) {
			this.oSaveDialog.addStyleClass(sStyleClass);
		}
		if (this.oManagementDialog) {
			this.oManagementDialog.addStyleClass(sStyleClass);
		}
	};

	VariantManagement.prototype.removeStyleClass = function(sStyleClass) {
		if (Control.prototype.addStyleClass) {
			Control.prototype.removeStyleClass.apply(this, arguments);
		}
		if (this.oVariantPopOver) {
			this.oVariantPopOver.removeStyleClass(sStyleClass);
		}
		if (this.oSaveDialog) {
			this.oSaveDialog.removeStyleClass(sStyleClass);
		}
		if (this.oManagementDialog) {
			this.oManagementDialog.removeStyleClass(sStyleClass);
		}
	};

	/**
	 * Removes the current variant selection and resets to default value.
	 * 
	 * @public
	 * @since 1.22.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VariantManagement.prototype.clearVariantSelection = function() {
		this.setInitialSelectionKey(this.getStandardVariantKey());
		this._setSelectedItem(null);
	};

	/**
	 * If the oControl has the ".sapUiSizeCompact" class it will be also set on the oDialog
	 * 
	 * @param {sap.ui.core.Control} oControl the control to be checked for compact
	 * @param {sap.ui.core.Control} oDialog the dialog/popover to receive the compact style class
	 */
	VariantManagement.prototype._setDialogCompactStyle = function(oControl, oDialog) {
		if (this._checkDialogCompactStyle(oControl)) {
			oDialog.addStyleClass("sapUiSizeCompact");
		} else {
			oDialog.removeStyleClass("sapUiSizeCompact");
		}
	};

	/**
	 * If the oControl has the ".sapUiSizeCompact" the function will return true
	 * 
	 * @param {sap.ui.core.Control} oControl the control to be checked for compact
	 * @returns {boolean} result
	 */
	VariantManagement.prototype._checkDialogCompactStyle = function(oControl) {
		if (oControl.$().closest(".sapUiSizeCompact").length > 0) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Check and set Manage Button State
	 */
	VariantManagement.prototype._manageButtonState = function() {
		if (this.oActionSheetManage) {
			this.oActionSheetManage.setEnabled(true);
		}
	};

	VariantManagement.prototype.getSelectionKey = function() {
		var sKey = null;
		var oItem = this._getSelectedItem();
		if (oItem !== null) {
			sKey = oItem.getKey();
		} else if (this.bVariantItemMode) {
			sKey = this.getStandardVariantKey();
		} else {
			sKey = null;
		}
		return sKey;
	};

	VariantManagement.prototype._setSelectionByKey = function(sKey) {
		var oItems = this._getItems();
		var bFound = false;
		if (oItems.length > 0) {
			for (var iI = 0; iI < oItems.length; iI++) {
				if (oItems[iI].getKey() === sKey) {
					this._setSelectedItem(oItems[iI]);
					bFound = true;
					break;
				}
			}
		}
		if (!bFound) {
			this._setSelectedItem(null);
		}
	};

	VariantManagement.prototype.replaceKey = function(sOldKey, sNewKey) {
		var oItems = this._getItems();
		if (oItems.length > 0) {
			for (var iI = 0; iI < oItems.length; iI++) {
				if (oItems[iI].getKey() === sOldKey) {
					oItems[iI].setKey(sNewKey);
					if (this.getDefaultVariantKey() == sOldKey) {
						this.setDefaultVariantKey(sNewKey);
					}
					if (this._getSelectedItem() === oItems[iI]) {
						this._setSelectedItem(null);
					}
					break;
				}
			}
		}
	};

	VariantManagement.prototype._assignUser = function(sKey, sUser) {
		var oItems = this._getItems();
		if (oItems.length > 0) {
			for (var iI = 0; iI < oItems.length; iI++) {
				if (oItems[iI].getKey() === sKey) {
					if (oItems[iI].setAuthor && oItems[iI].getAuthor && !oItems[iI].getAuthor()) {
						oItems[iI].setAuthor(sUser);
					}
					break;
				}
			}
		}
	};

	VariantManagement.prototype.currentVariantSetModified = function(bFlag) {
		this.oModel.setProperty("/enabled", bFlag);
	};

	VariantManagement.prototype.currentVariantGetModified = function() {
		return this.oModel.getProperty("/enabled");
	};

	VariantManagement.prototype._delayedControlCreation = function() {
		var that = this;

		if (this._bInnerControlsCreated) {
			return;
		}

		this._bInnerControlsCreated = true;

		this.oVariantManage = new Button(this.getId() + "-manage", {
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_MANAGE"),
			enabled: true, // FIORITECHP1-3572
			press: function() {
				that._openVariantManagementDialog();
			}
		});
		this.oVariantManage.addStyleClass("sapUiHideOnPhone");

		this.oVariantSave = new Button(this.getId() + "-mainsave", {
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_SAVE"),
			press: function() {
				var oEvent = that._createEvent("variantSavePressed", that._variantSavePressed);
				that._addEvent(oEvent);
			},
			enabled: false
		});
		this.oVariantSave.setModel(this.oModel);
		this.oVariantSave.addStyleClass("sapUiHideOnPhone");

		this.oVariantSaveAs = new Button(this.getId() + "-saveas", {
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_SAVEAS"),
			press: function() {
				that._openSaveAsDialog();
			}
		});
		this.oVariantSaveAs.addStyleClass("sapUiHideOnPhone");

		this.oVariantList = new SelectList(this.getId() + "-list", {
			itemPress: function(event) {
				var sSelectionKey = null;
				if (event && event.getParameters()) {
					var oItemPressed = event.getParameters().item;
					if (oItemPressed) {
						sSelectionKey = oItemPressed.getKey();
// if (!this.getSelectedItem() || sSelectionKey !== this.getSelectedItem().getKey()) {
// bNewSelection = true;
// }
					}
				}
				if (sSelectionKey) {
					that.lastSelectedVariantKey = sSelectionKey;
					that._setSelectionByKey(sSelectionKey);
					that.oVariantPopOver.close();
// that.bDirty = false;
					that.oModel.setProperty("/enabled", false);
					that.bFireSelect = true;
				}
			}
		});
		this.oVariantList.setNoDataText(this.oResourceBundle.getText("VARIANT_MANAGEMENT_NODATA"));

		this.oActionSheetManage = new Button({
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_MANAGE"),
			enabled: false,
			press: function(oEvent) {
				that._openVariantManagementDialog();
			}
		});
		this.oActionSheetSave = new Button({
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_SAVE"),
			enabled: false,
			press: function(oEvent) {
				var olEvent = that._createEvent("variantSavePressed", that._variantSavePressed);
				that._addEvent(olEvent);
			}
		});
		this.oActionSheetSaveAs = new Button({
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_SAVEAS"),
			press: function(oEvent) {
				that._openSaveAsDialog();
			}
		});

		this.oActions = new Button(this.getId() + "-actions", {
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_ACTIONS"),
			press: function() {
				that._createActionSheet();
				that.oActionSheet.openBy(this);
			}
		});
		this.oActions.addStyleClass("sapUiVisibleOnlyOnPhone");

		this.oSearchField = new SearchField();
		this.oSearchField.attachLiveChange(function(oEvent) {
			that._triggerSearch(oEvent);
		});

		this._handleArrowUpDown(this.oVariantList, this.oSearchField);

		this.oVariantSelectionPage = new Page(this.getId() + "selpage", {
			subHeader: new Toolbar({
				content: [
					this.oSearchField
				]
			}),
			content: [
				this.oVariantList
			],
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(this.getId() + "-spacer"), this.oVariantManage, this.oVariantSave, this.oVariantSaveAs, this.oActions
				]
			}),
			showSubHeader: false,
			showNavButton: false,
			showHeader: false
		});
		this.oVariantPopOver = new ResponsivePopover(this.getId() + "-popover", {
			title: this.oResourceBundle.getText("VARIANT_MANAGEMENT_VARIANTS"),
			contentWidth: "400px",
			placement: PlacementType.Bottom,
			content: [
				this.oVariantSelectionPage
			],
			afterOpen: function() {
				that.bPopoverOpen = true;
				that._markSharedVariants();

				that._setTriggerButtonIcon(false);
			},
			afterClose: function() {
				// that.bPopoverOpen = false;
				if (that.bFireSelect == true) {
					that.bFireSelect = false;
					setTimeout(function() {
						that._fireSelectAsync();
					}, 0);
				}

				that._setTriggerButtonIcon(true);

				setTimeout(function() {
					that.bPopoverOpen = false;
				}, 300);

			},
			contentHeight: "300px"
		});
		this.oVariantPopOver.addStyleClass("sapUICompVarMngmtPopover");

		/* save new dialog */
		this.oInputName = new Input(this.getId() + "-name", {
			liveChange: function(oEvent) {
				that._checkVariantNameConstraints(this, that.oSaveSave);
			}
		});
		this.oLabelName = new Label(this.getId() + "-namelabel", {
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_NAME"),
			required: true
		});
		this.oLabelName.setLabelFor(this.oInputName);

		this.oDefault = new CheckBox(this.getId() + "-default", {
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_SETASDEFAULT"),
			enabled: true,
			visible: true,
			width: "100%"
		});

		this.oExecuteOnSelect = new CheckBox(this.getId() + "-execute", {
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_EXECUTEONSELECT"),
			enabled: true,
			visible: false,
			width: "100%"
		});

		this.oCreateTile = new CheckBox(this.getId() + "-tile", {
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_CREATETILE"),
			enabled: true,
			visible: false,
			width: "100%"
		});

		this.oShare = new CheckBox(this.getId() + "-share", {
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_SHARE"),
			enabled: true,
			visible: false,
			select: function(oControlEvent) {
				var oEvent = that._createEvent("inputfieldChange", that._handleShareSelected);
				oEvent.args.push(oControlEvent);
				that._addEvent(oEvent);
			},
			width: "100%"
		});

		this.oInputKey = new Input(this.getId() + "-key", {
			liveChange: function(oEvent) {
				that._checkVariantNameConstraints(this);
			}
		});

		this.oLabelKey = new Label(this.getId() + "-keylabel", {
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_KEY"),
			required: true
		});
		this.oLabelKey.setLabelFor(this.oInputKey);

		this.oSaveSave = new Button(this.getId() + "-variantsave", {
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_OK"),
			press: function() {
				that._bSaveCanceled = false;
				that._triggerSave();
			},
			enabled: true
		});
		this.oSaveDialogOptionsGrid = new Grid({
			defaultSpan: "L6 M6 S12"
		});

		this.oManagementTable = new Table(this.getId() + "-managementTable");

		this.oManagementSave = new Button(this.getId() + "-managementsave", {
			text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_OK"),
			enabled: true,
			press: function() {
				var oEvent = that._createEvent("managementSave", that._handleManageSavePressed);
				that._addEvent(oEvent);
			}
		});

		this._manageButtonState();

	};

	VariantManagement.prototype._openVariantSelection = function() {
		var oItems = null;

		this._delayedControlCreation();

		if (this.bPopoverOpen == true) {
			return;
		}

		this.bPopoverOpen = true;

		this.oVariantList.destroyItems();

		this.oVariantSave.setEnabled(false);
		this.oActionSheetSave.setEnabled(false);
		if (this.bVariantItemMode === false && this.getSelectionKey() !== null) {
			this.oVariantSave.setEnabled(true);
			this.oActionSheetSave.setEnabled(true);
		}

		oItems = this._getItems();
		if (oItems.length < 9) {
			this.oVariantSelectionPage.setShowSubHeader(false);
		} else {
			this.oVariantSelectionPage.setShowSubHeader(true);
			this.oSearchField.setValue("");
		}

		this._restoreCompleteList();

		if (this.currentVariantGetModified()) {
			var oSelectedItem = this.oVariantList.getItemByKey(this.getSelectionKey());
			if (oSelectedItem) {
				if (!oSelectedItem.getReadOnly() || (this._isIndustrySolutionModeAndVendorLayer() && (this.getStandardVariantKey() === oSelectedItem.getKey()))) {
					this.oVariantSave.setEnabled(true);
					this.oActionSheetSave.setEnabled(true);
				}
			}
		}

		this.oVariantSaveAs.setEnabled(true);
		if (this._isIndustrySolutionModeAndVendorLayer() && (this.getStandardVariantKey() === this.getSelectionKey()) && (this.getStandardVariantKey() === this.STANDARDVARIANTKEY)) {
			this.oVariantSaveAs.setEnabled(false);
		}

		this._setDialogCompactStyle(this, this.oVariantPopOver);
		this._manageButtonState();
		this.oVariantPopOver.setInitialFocus(this.oVariantList.getSelectedItem().getId());
		this.oVariantPopOver.openBy(this.oVariantPopoverTrigger.$("img")[0]);
	};

	// FIORITECHP1-3573
// VariantManagement.prototype.onclick = function(oEvent) {
// if (this.getEnabled()) {
// this._openVariantSelection();
// }
// };

// VariantManagement.prototype.onkeydown = function(oEvent) {
// if (oEvent.which === jQuery.sap.KeyCodes.F4 || oEvent.altKey === true && oEvent.which === jQuery.sap.KeyCodes.ARROW_UP || oEvent.altKey === true &&
// oEvent.which === jQuery.sap.KeyCodes.ARROW_DOWN) {
// if (this.getEnabled()) {
// this._openVariantSelection();
// }
// }
// };

	VariantManagement.prototype._initalizeManagementTableColumns = function() {
		if (this.bManagementTableInitialized) {
			return;
		}
		this.oManagementTable.addColumn(new Column({
			header: new Text({
				text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_NAME")
			}),
			width: "14rem"
		}));
		this.oManagementTable.addColumn(new Column({
			header: new Text({
				text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_VARIANTTYPE")
			}),
			width: "8rem",
			demandPopin: true,
			popinDisplay: PopinDisplay.Inline,
			minScreenWidth: ScreenSize.Tablet
		}));
		if (this.getShowSetAsDefault()) {
			this.oManagementTable.addColumn(new Column({
				header: new Text({
					text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_DEFAULT")
				}),
				width: "4rem",
				demandPopin: true,
				popinDisplay: PopinDisplay.Inline,
				minScreenWidth: ScreenSize.Tablet
			}));
		}
		if (this.getShowExecuteOnSelection()) {
			this.oManagementTable.addColumn(new Column({
				header: new Text({
					text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_EXECUTEONSELECT")
				}),
				width: "5rem",
				hAlign: TextAlign.Center,
				demandPopin: true,
				popinDisplay: PopinDisplay.Inline,
				minScreenWidth: "800px"
			}));
		}
		this.oManagementTable.addColumn(new Column({
			header: new Text({
				text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_AUTHOR")
			}),
			width: "8rem",
			demandPopin: true,
			popinDisplay: PopinDisplay.Inline,
			minScreenWidth: "900px"
		}));
		this.oManagementTable.addColumn(new Column({
			width: "2rem",
			hAlign: TextAlign.Center
		}));
		this.bManagementTableInitialized = true;
	};

	VariantManagement.prototype._initalizeSaveAsDialog = function() {
		this.oSaveDialogOptionsGrid.removeAllContent();

		this.oDefault.setVisible(this.getShowSetAsDefault());
		this.oShare.setVisible(this.getShowShare());
		this.oExecuteOnSelect.setVisible(this.getShowExecuteOnSelection());
		this.oCreateTile.setVisible(this.getShowCreateTile());

		if (this.getShowSetAsDefault()) {
			this.oSaveDialogOptionsGrid.addContent(this.oDefault);
		}
		if (this.getShowShare()) {
			this.oSaveDialogOptionsGrid.addContent(this.oShare);
		}
		if (this.getShowExecuteOnSelection()) {
			this.oSaveDialogOptionsGrid.addContent(this.oExecuteOnSelect);
		}
		if (this.getShowCreateTile()) {
			this.oSaveDialogOptionsGrid.addContent(this.oCreateTile);
		}
	};

	VariantManagement.prototype.onBeforeRendering = function() {

		var fGetMax = function(aContent) {
			var len, maxLength = 0;
			for (var i = 0; i < aContent.length; i++) {
				len = aContent[i].$().width();
				if (len > maxLength) {
					maxLength = len;
				}
			}

			return maxLength;
		};

		if (this.oSaveDialogOptionsGrid && this.oSaveDialog && this.oSaveDialog.getVisible()) {
			var aContent = this.oSaveDialogOptionsGrid.getContent();
			if (aContent && aContent.length > 0) {
				var widthGrid = this.oSaveDialogOptionsGrid.$().width();

				var widthLabel = fGetMax(aContent);

				var widthPaddingLeft = 32;
				var widthCB = 12;
				if (!this._checkDialogCompactStyle(this.oSaveDialog)) {
					widthPaddingLeft = 48;
					widthCB = 18;
				}

				if ((widthPaddingLeft + widthLabel + widthCB) > widthGrid / 2) {
					this.oSaveDialogOptionsGrid.setDefaultSpan("L12 M12 S12");
				}

			}
		}
	};

	VariantManagement.prototype._markSharedVariants = function() {

		var oVariantListItem, oItem, oItems = this._getItems();

		for (var i = 0; i < oItems.length; i++) {
			oItem = oItems[i];

			if (oItem.getGlobal && oItem.getGlobal()) {
				oVariantListItem = this.oVariantList.getItemByKey(oItem.getKey());
				if (oVariantListItem) {
					var oItemElement = oVariantListItem.$();
					if (oItemElement) {
						oItemElement.addClass("sapUiCompVarMngmtSharedVariant");
					}
				}
			}
		}
	};

	VariantManagement.prototype._variantSavePressed = function() {
		var oItem = this._getSelectedItem();

		if (!oItem) {
			if (this.getStandardVariantKey() === this.STANDARDVARIANTKEY) {

				oItem = new VariantItem({
					text: this._determineStandardVariantName(),
					key: this.STANDARDVARIANTKEY,
					global: this._isIndustrySolutionModeAndVendorLayer()
				});
			} else {
				oItem = this.getItemByKey(this.getStandardVariantKey());
			}
		}

		var bDefault = false;
		if (this.getDefaultVariantKey() === oItem.getKey()) {
			bDefault = true;
		}

		if (oItem.getLifecyclePackage && oItem.getGlobal() == true) {
			var that = this;
			var fOkay = function(sPackage, sTransport) {
				that.oVariantPopOver.close();
				that.sPackage = sPackage;
				that.sTransport = sTransport;
				that.fireSave({
					name: oItem.getText(),
					overwrite: true,
					key: oItem.getKey(),
					def: bDefault,
					global: (that._isIndustrySolutionModeAndVendorLayer() && (that.getStandardVariantKey() === that.getStandardVariantKey())),
					lifecyclePackage: that.sPackage,
					lifecycleTransportId: that.sTransport
				});
				oItem.setLifecycleTransportId(that.sTransport);
				// that.bDirty = false;
				that.oModel.setProperty("/enabled", false);
				that._eventDone();
			};
			var fError = function(oResult) {
				that.sTransport = null;
				that.sPackage = null;
				that._cancelAllEvents();
			};
			this._assignTransport(oItem, fOkay, fError, this.oVariantText);
		} else {
			this.oVariantPopOver.close();
			this.fireSave({
				name: oItem.getText(),
				overwrite: true,
				key: oItem.getKey(),
				def: bDefault
			});
			this.oModel.setProperty("/enabled", false);
			this._eventDone();
		}
	};

	VariantManagement.prototype._assignTransport = function(oVariant, fOkay, fError, oControl) {
		var oObject = {
			type: "variant",
			name: "",
			namespace: ""
		};
		oObject["package"] = "";
		if (oVariant !== null) {
			oObject["package"] = oVariant.getLifecyclePackage();
			oObject["name"] = oVariant.getKey();
			oObject["namespace"] = oVariant.getNamespace();
		}
		var _fOkay = function(oResult) {
			var sPackage;
			var sTransport;
			sTransport = oResult.getParameters().selectedTransport;
			sPackage = oResult.getParameters().selectedPackage;
			fOkay(sPackage, sTransport);
		};
		var _fError = function(oResult) {
			fError(oResult);
		};
		if (this.getLifecycleSupport()) {
			var sTransport = null;
			if (oVariant) {
				sTransport = oVariant.getLifecycleTransportId();
			}
			if (sTransport != null && sTransport.trim().length > 0) {
				fOkay(oObject["package"], sTransport);
			} else {
				var oTransports = new TransportSelection();
				oTransports.selectTransport(oObject, _fOkay, _fError, this._checkDialogCompactStyle(oControl), oControl);
			}
		} else {
			fOkay(oObject["package"], "");
		}
	};

	VariantManagement.prototype.getDefaultVariantKey = function() {
		var sValue = this.getProperty("defaultVariantKey");
		if (sValue === "") {
			if (this.bVariantItemMode) {
				sValue = this.getStandardVariantKey();
			}
		}
		return sValue;
	};

	VariantManagement.prototype._compareItems = function(first, second) {
		var sFirst = first.getText();
		var sSecond = second.getText();
		var sFirstU = sFirst.toUpperCase();
		var sSecondU = sSecond.toUpperCase();
		if (sFirstU == sSecondU) {
			if (sFirst == sSecond) {
				return 0;
			}
			if (sFirst < sSecond) {
				return -1;
			}
			if (sFirst > sSecond) {
				return 1;
			}
		}
		if (sFirstU < sSecondU) {
			return -1;
		}
		if (sFirstU > sSecondU) {
			return 1;
		}
	};

	VariantManagement.prototype._accessOptionsText = function(sOptions) {
		var sMessage = null;
		switch (sOptions) {
			case "R":
				sMessage = this.oResourceBundle.getText("VARIANT_MANAGEMENT_WRONG_LAYER");
				break;
			case "RD":
				sMessage = this.oResourceBundle.getText("VARIANT_MANAGEMENT_WRONG_LANGUAGE");
				break;
			default:
				sMessage = null;
		}
		return sMessage;
	};

	VariantManagement.prototype._openSaveAsDialog = function() {
		this._initalizeSaveAsDialog();
		if (this._getSelectedItem()) {
			this.oInputName.setValue(this._getSelectedItem().getText());
		} else {
			this.oInputName.setValue("");
		}
		this.oInputName.setEnabled(true);
		this.oInputName.setValueState(ValueState.None);
		this.oInputName.setValueStateText(null);
		this.oDefault.setSelected(false);
		this.oShare.setSelected(false);
		this.oCreateTile.setSelected(false);
		this.oExecuteOnSelect.setSelected(false);

		this._createSaveDialog();
		this._setDialogCompactStyle(this, this.oSaveDialog);
		this.oVariantPopOver.close();
		this.sTransport = null;
		this.sPackage = null;
		if (this.bManualVariantKey) {
			this.oInputKey.setVisible(true);
			this.oInputKey.setEnabled(true);
			this.oInputKey.setValueState(ValueState.None);
			this.oInputKey.setValueStateText(null);
			this.oLabelKey.setVisible(true);
		} else {
			this.oInputKey.setVisible(false);
			this.oLabelKey.setVisible(false);
		}

		this.oSaveDialog.open();
	};

	VariantManagement.prototype._checkManageItemNameChange = function(oManageItem) {
		var sText = "";
		var oInputField = null;
		var that = this;
		oInputField = oManageItem.getCells()[0];

		sText = oInputField.getValue();
		sText = sText.trim();
		var oEditableVariantItem = oManageItem;
		var sKey = oEditableVariantItem.getKey();

		this._checkVariantNameConstraints(oInputField, this.oManagementSave, this.oManagementTable);

		if (oInputField.getValueState() === ValueState.Error) {
			// this.oManagementSave.setEnabled(false);
			this._eventDone();
			return;
		}

		if (this.oVariantList.getItemByKey(sKey).getText().trim() === sText) {
			this._eventDone();
			return;
		}

		if (oEditableVariantItem.getGlobal()) {
			var fOkay = function(sPackage, sTransport) {
				oEditableVariantItem.setLifecyclePackage(sPackage);
				oEditableVariantItem.setLifecycleTransportId(sTransport);
				that._eventDone();
			};

			var fError = function(oResult) {
				var oItem = that.oVariantList.getItemByKey(sKey); // ???
				oInputField.setValue(oItem.getText());
				that._cancelAllEvents();
			};

			this._createManagementDialog();
			this._assignTransport(oEditableVariantItem, fOkay, fError, this.oManagementDialog);
		} else {
			this._eventDone();
		}
	};

	VariantManagement.prototype._handleManageSavePressed = function() {
		var oNewItems = this.oManagementTable.getItems();
		var oItem;
		var fireSelect = false;
		var sName = "";
		var oOriginalItem = null;
		var iD = 0;

		for (var iG = 0; iG < oNewItems.length; iG++) {
			oItem = this.oVariantList.getItemByKey(oNewItems[iG].getKey());
			if (oNewItems[iG].getCells()[0].getValue) {
				sName = oNewItems[iG].getCells()[0].getValue();
			}
			if (oNewItems[iG].getCells()[0].getText) {
				sName = oNewItems[iG].getCells()[0].getText();
			}
			// FIORITECHP1-3556
			if (oNewItems[iG].getCells()[0].getTitle) {
				sName = oNewItems[iG].getCells()[0].getTitle();
			}
			sName = sName.trim();
			if (oItem.getText() !== sName) {
				this.aRenamedVariants.push({
					key: oItem.getKey(),
					name: sName
				});
				oOriginalItem = this.getItemByKey(oNewItems[iG].getKey());
				oOriginalItem.setText(sName);
				if (oOriginalItem.setLifecyclePackage) {
					oOriginalItem.setLifecyclePackage(oNewItems[iG].getLifecyclePackage());
					oOriginalItem.setLifecycleTransportId(oNewItems[iG].getLifecycleTransportId());
				}

				if (this.lastSelectedVariantKey === oItem.getKey()) {
					this._setVariantText(sName);
					// BCP 1670301513
// this.bDirty = false;
// this.oVariantModifiedText.setVisible(false);
// this.oModel.setProperty("/enabled", false);
				}
			}

			if (this.getShowExecuteOnSelection() && oItem.getExecuteOnSelection && oItem.getExecuteOnSelection() != oNewItems[iG].getCells()[3].getSelected()) {
				// execute on selection changed
				var bFlag = oNewItems[iG].getCells()[3].getSelected();
				var oItemTmp = this.getItemByKey(oNewItems[iG].getKey());

				if (!oItemTmp && (this.getSupportExecuteOnSelectOnSandardVariant() & (oNewItems[iG].getKey() === this.getStandardVariantKey()/* this.STANDARDVARIANTKEY */))) {
					oItemTmp = new VariantItem();
				}

				if (oItemTmp && oItemTmp.setExecuteOnSelection) {
					oItemTmp.setExecuteOnSelection(bFlag);

					if (this.getSupportExecuteOnSelectOnSandardVariant() & (oNewItems[iG].getKey() === this.getStandardVariantKey())) {
						this._executeOnSelectForStandardVariantByUser(bFlag);
					}
					this.aExeVariants.push({
						key: oItem.getKey(),
						exe: bFlag
					});
					if (oItemTmp.setLifecyclePackage) {
						oItemTmp.setLifecyclePackage(oNewItems[iG].getLifecyclePackage());
						oItemTmp.setLifecycleTransportId(oNewItems[iG].getLifecycleTransportId());
					}
				}
			}
		}

		if (this.oManagementDialog) {
			this.oManagementDialog.close();
		}
		this._manageButtonState();
		if (this.bVariantItemMode === false) {
			if (this.getDefaultVariantKey() != this.sNewDefaultKey) {
				var oItemTmpDef = null;
				if (this.sNewDefaultKey == this.getStandardVariantKey()) {
					oItemTmpDef = this.getItemByKey(this.getDefaultVariantKey());
					this.fireSave({
						name: oItemTmpDef.getText(),
						overwrite: true,
						key: oItemTmpDef.getKey(),
						def: false
					});
				} else {
					oItemTmpDef = this.getItemByKey(this.sNewDefaultKey);
					this.fireSave({
						name: oItemTmpDef.getText(),
						overwrite: true,
						key: oItemTmpDef.getKey(),
						def: true
					});
				}
			}
		}
		this.setDefaultVariantKey(this.sNewDefaultKey);

		for (iD = 0; iD < this.aRemovedVariants.length; iD++) {
			oItem = this.getItemByKey(this.aRemovedVariants[iD]);
			for (var iE = 0; iE < this.aRemovedVariantTransports.length; iE++) {
				if (this.aRemovedVariants[iD] === this.aRemovedVariantTransports[iE].key) {
					var oManageItem = this.aRemovedVariantTransports[iE];
					if (oItem.setLifecyclePackage) {
						oItem.setLifecycleTransportId(oManageItem.transport);
					}
					break;
				}
			}
		}

		this.fireManage({
			renamed: this.aRenamedVariants,
			deleted: this.aRemovedVariants,
			exe: this.aExeVariants,
			def: this.getDefaultVariantKey()
		});

		for (iD = 0; iD < this.aRemovedVariants.length; iD++) {
			oItem = this.getItemByKey(this.aRemovedVariants[iD]);
			if (oItem) {
				this._removeItem(oItem);
				oItem.destroy();
			}
			if (this.lastSelectedVariantKey === this.aRemovedVariants[iD]) {
				fireSelect = true;
				this._setSelectedItem(null);
				this.oModel.setProperty("/enabled", false);
			}
		}

		if (fireSelect) {
			this.bFireSelect = true;
		}
		this._eventDone();
	};

	// new event processor handling
	VariantManagement.prototype._createEvent = function(sName, fCallback) {
		var oEvent = {
			name: sName,
			fFunc: fCallback,
			args: []
		};
		return oEvent;
	};

	VariantManagement.prototype._handleNextEvent = function() {
		if (this.aEvents.length > 0) {
			if (!this.bEventRunning) {
				this.bEventRunning = true;
				var nextEvent = this.aEvents.pop();
				nextEvent.fFunc.apply(this, nextEvent.args);
			}
			// else {
			// if(bShow)
			// // console.log("Event still running");
			// }
			// } else {
			// // console.log("No Events to process");
		}
	};

	VariantManagement.prototype._addEvent = function(oEvent) {
		this.aEvents.push(oEvent);
		this._handleNextEvent();
	};

	VariantManagement.prototype._cancelAllEvents = function() {
		this.aEvents = [];
		this.bEventRunning = false;
	};

	VariantManagement.prototype._eventDone = function() {
		this.bEventRunning = false;
		this._handleNextEvent();
	};

	VariantManagement.prototype._handleManageExecuteOnSelectionChanged = function(oCheckBox) {
		var that = this;
		var oManageItem = oCheckBox.getParent();
		if (oManageItem.getGlobal()) {
			var fOkay = function(sPackage, sTransport) {
				oManageItem.setLifecyclePackage(sPackage);
				oManageItem.setLifecycleTransportId(sTransport);
				that._eventDone();
			};
			var fError = function(oResult) {
				oCheckBox.setSelected(!oCheckBox.getSelected());
				that._cancelAllEvents();
			};

			this._createManagementDialog();
			this._assignTransport(oManageItem, fOkay, fError, this.oManagementDialog);
		} else {
			this._eventDone();
		}
	};

	VariantManagement.prototype._handleManageDeletePressed = function(oButton) {

		if (!this._anyInErrorState(this.oManagementTable, oButton.getParent().getCells()[0])) {
			this.oManagementSave.setEnabled(true);
		}

		var oItem = oButton.getParent();
		if (oItem.getGlobal()) {
			var that = this;
			var fOkay = function(sPackage, sTransport) {
				var sKey = oItem.getKey();
				that.aRemovedVariants.push(sKey);
				that.oManagementTable.removeItem(oItem);
				if (oItem.getKey() === that.sNewDefaultKey) {
					that.oManagementTable.getItems()[0].getCells()[2].setSelected(true);
					that.sNewDefaultKey = that.getStandardVariantKey();
				}
				oItem.destroy();
				var oTransportAssignment = {
					key: sKey,
					transport: sTransport
				};
				that.aRemovedVariantTransports.push(oTransportAssignment);
				that._eventDone();
			};
			var fError = function(oResult) {
				that._cancelAllEvents();
			};

			this._createManagementDialog();
			this._assignTransport(oItem, fOkay, fError, this.oManagementDialog);
		} else {
			this.aRemovedVariants.push(oItem.getKey());
			this.oManagementTable.removeItem(oItem);
			if (oItem.getKey() === this.sNewDefaultKey) {
				this.oManagementTable.getItems()[0].getCells()[2].setSelected(true);
				this.sNewDefaultKey = this.getStandardVariantKey();
			}
			oItem.destroy();
			this._eventDone();
		}

		var oCancelButton = sap.ui.getCore().byId(this.getId() + "-managementcancel");
		if (oCancelButton) {
			oCancelButton.focus();
		}
	};

	VariantManagement.prototype._handleShareSelected = function(oControlEvent) {
		var that = this;

		if (oControlEvent.getParameters().selected) {
			var fOkay = function(sPackage, sTransport) {
				that.sTransport = sTransport;
				that.sPackage = sPackage;
				that._eventDone();
			};
			var fError = function(oResult) {
				that.oShare.setSelected(false);
				that.sTransport = null;
				that.sPackage = null;
				that._cancelAllEvents();
			};

			this._createSaveDialog();
			this._assignTransport(null, fOkay, fError, this.oSaveDialog);
		} else {
			this.sTransport = null;
			this.sPackage = null;
			this._eventDone();
		}
	};

	VariantManagement.prototype._handleVariantSaveAs = function() {
		var sKey = "SV" + new Date().getTime();
		var sName = this.oInputName.getValue();
		var sManualKey = this.oInputKey.getValue();
		var sTransport = "";
		var sPackage = "";
		var bExecuteOnSelect = false;
		var bCreateTile = false;
		var oItem = null;
		sName = sName.trim();
		if (sName == "") {
			this.oInputName.setValueState(ValueState.Error);
			this.oInputName.setValueStateText(this.oResourceBundle.getText("VARIANT_MANAGEMENT_ERROR_EMPTY"));
			this._cancelAllEvents();
			return;
		}
		sManualKey = sManualKey.trim();
		if (this.bManualVariantKey && sManualKey == "") {
			this.oInputKey.setValueState(ValueState.Error);
			this.oInputKey.setValueStateText(this.oResourceBundle.getText("VARIANT_MANAGEMENT_ERROR_EMPTY"));
			this._cancelAllEvents();
			return;
		}
		if (this.bManualVariantKey) {
			sKey = sManualKey;
		}

		if (this.oSaveDialog) {
			this.oSaveDialog.close();
		}
		if (this.oExecuteOnSelect !== null) {
			bExecuteOnSelect = this.oExecuteOnSelect.getSelected();
		}
		if (this.oCreateTile !== null) {
			bCreateTile = this.oCreateTile.getSelected();
		}
		if (this.bVariantItemMode) {
			oItem = new VariantItem({
				key: sKey,
				text: sName,
				readOnly: false,
				executeOnSelection: bExecuteOnSelect,
				global: this.oShare.getSelected(),
				lifecycleTransportId: this.sTransport,
				lifecyclePackage: this.sPackage
			});
			this.addVariantItem(oItem);
			this._setSelectedItem(oItem);
		} else {
			oItem = new Item({
				key: sKey,
				text: sName
			});
			this.addItem(oItem);
			this._setSelectedItem(oItem);
		}
		if (this.oDefault.getSelected()) {
			this.setDefaultVariantKey(sKey);
		}
		if (this.oShare.getSelected()) {
			sPackage = this.sPackage;
			sTransport = this.sTransport;
		}
		this._manageButtonState();
		this.fireSave({
			name: sName,
			overwrite: false,
			def: this.oDefault.getSelected(),
			key: sKey,
			exe: this.oExecuteOnSelect.getSelected(),
			tile: bCreateTile,
			global: this.oShare.getSelected(),
			lifecyclePackage: sPackage,
			lifecycleTransportId: sTransport
		});
		this.oModel.setProperty("/enabled", false);
		this._eventDone();
	};

	VariantManagement.prototype._setBackwardCompatibility = function(bFlag) {
		if (this.getItems().length === 0 && this.getVariantItems().length === 0) {
			this.bVariantItemMode = !bFlag;
		}
		this._setStandardText();
	};

	VariantManagement.prototype._setStandardText = function() {
		var sKey = this.getSelectionKey();
		if (sKey === null || sKey === this.getStandardVariantKey()) {
			if (this.bVariantItemMode == false) {
				this._setVariantText(this.oResourceBundle.getText("VARIANT_MANAGEMENT_DEFAULT"));
			} else {
				this._setVariantText(this.oResourceBundle.getText("VARIANT_MANAGEMENT_STANDARD"));
			}
			if (this.getStandardItemText() !== null && this.getStandardItemText() != "") {
				this._setVariantText(this.getStandardItemText());
			}
		}
	};

	VariantManagement.prototype._setVariantText = function(sText) {
		this.oModel.setProperty("/selectedVariant", sText);
		// this.oVariantText.setText(sText, true);
		// this._updateVariantInvisibletext();
	};
	VariantManagement.prototype._updateVariantInvisibletext = function(sText, bValue) {
// var sText = this.oVariantText.getText();
// if (this.oVariantModifiedText && this.oVariantModifiedText.getVisible()) {
// sText = this.oResourceBundle.getText("VARIANT_MANAGEMENT_MODIFIED", [
// sText
// ]);
// }
// this.oVariantInvisbletext.setText(sText, true);

		if (bValue) {
			sText = this.oResourceBundle.getText("VARIANT_MANAGEMENT_MODIFIED", [
				sText
			]);
		}

		return sText;
	};

	VariantManagement.prototype._openVariantManagementDialog = function() {
		var oItem;
		var oItems = null;
		var iItemNo = 0;
		var oManageItem;
		var oNameCell;
		var oTypeCell;
		var oDefaultCell;
		var oExecuteCell;
		var oDeleteCell;
		var sTypeText;
		var sTooltip;
		var fLiveChange;
		var fChange;
		var fSelectRB;
		var fSelectCB;
		var fPress;

		var that = this;

		this.oManagementSave.setEnabled(true);

		this.oManagementTable.destroyItems();

		fLiveChange = function(oControlEvent) {
			that._checkVariantNameConstraints(this, that.oManagementSave, that.oManagementTable);
		};

		fChange = function(oControlEvent) {
			var oEvent = that._createEvent("inputfieldChange", that._checkManageItemNameChange);
			oEvent.args.push(this.getParent());
			that._addEvent(oEvent);
		};

		fSelectRB = function(oControlEvent) {
			if (oControlEvent.getParameters().selected === true) {
				var oItem = this.getParent();
				that.sNewDefaultKey = oItem.getKey();
			}
		};

		fSelectCB = function(oControlEvent) {
			var oEvent = that._createEvent("executeOnSelectionChange", that._handleManageExecuteOnSelectionChanged);
			oEvent.args.push(this);
			that._addEvent(oEvent);
		};

		fPress = function(oControlEvent) {
			var oEvent = that._createEvent("manageDeletePressed", that._handleManageDeletePressed);
			oEvent.args.push(this);

			that._addEvent(oEvent);
		};

		this._initalizeManagementTableColumns();
		this.sNewDefaultKey = this.getDefaultVariantKey();

		this._restoreCompleteList();

		if (this.oVariantList.getItems()[0].getKey() !== this.getStandardVariantKey() && this.bVariantItemMode == false) {
			oItem = new VariantItem(this.oVariantManage.getId() + "-item-standard", {
				key: this.getStandardVariantKey(),
				text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_DEFAULT"),
				readOnly: true,
				executeOnSelection: false
			});
			this.oVariantList.insertItem(oItem, 0);
		}
		oItems = this.oVariantList.getItems();
		for (var iH = 0; iH < oItems.length; iH++) {
			if (oItems[iH].getReadOnly() || oItems[iH].getLabelReadOnly()) {
				var sOptions = oItems[iH].getAccessOptions();
				sTooltip = this._accessOptionsText(sOptions);
			} else {
				sTooltip = null;
			}
			if (oItems[iH].getReadOnly()) {
				sTooltip = this.oResourceBundle.getText("VARIANT_MANAGEMENT_WRONG_LAYER");
			} else if (oItems[iH].getLabelReadOnly() === true) {
				sTooltip = this.oResourceBundle.getText("VARIANT_MANAGEMENT_WRONG_LANGUAGE");
			}

			if (oItems[iH].getKey() === this.getStandardVariantKey()) {
				sTooltip = null;
			}
			oManageItem = new EditableVariantItem(this.oVariantManage.getId() + "-edit-" + iItemNo, {
				key: oItems[iH].getKey(),
				global: oItems[iH].getGlobal(),
				lifecyclePackage: oItems[iH].getLifecyclePackage(),
				lifecycleTransportId: oItems[iH].getLifecycleTransportId(),
				namespace: oItems[iH].getNamespace(),
				labelReadOnly: oItems[iH].getLabelReadOnly(),
				author: oItems[iH].getAuthor(),
				vAlign: VerticalAlign.Middle
			});
			if (oItems[iH].getKey() === this.getStandardVariantKey() || oItems[iH].getReadOnly() === true || oItems[iH].getLabelReadOnly() === true) {
				// FIORITECHP1-3556
// oNameCell = new Text(this.oVariantManage.getId() + "-text-" + iItemNo, {
// text: oItems[iH].getText()
// });

				oNameCell = new ObjectIdentifier(this.oVariantManage.getId() + "-text-" + iItemNo, {
					title: oItems[iH].getText()
				});

				// oNameCell.addStyleClass("sapUICompVarMngmtLbl");
				if (sTooltip) {
					oNameCell.setTooltip(sTooltip);
				}
			} else {
				oNameCell = new Input(this.oVariantManage.getId() + "-input-" + iItemNo, {
					value: oItems[iH].getText(),
					liveChange: fLiveChange,
					change: fChange
				});
			}
			oManageItem.addCell(oNameCell);

			if (oItems[iH].getGlobal()) {
				sTypeText = this.oResourceBundle.getText("VARIANT_MANAGEMENT_SHARED");
			} else {
				sTypeText = this.oResourceBundle.getText("VARIANT_MANAGEMENT_PRIVATE");
			}
			oTypeCell = new Text(this.oVariantManage.getId() + "-type-" + iItemNo, {
				text: sTypeText,
				wrapping: false
			});
			oTypeCell.addStyleClass("sapUICompVarMngmtType");
			oManageItem.addCell(oTypeCell);

			if (this.getShowSetAsDefault()) {
				oDefaultCell = new RadioButton(this.oVariantManage.getId() + "-def-" + iItemNo, {
					groupName: this.oVariantManage.getId(),
					select: fSelectRB
				});

				if (this.sNewDefaultKey === oItems[iH].getKey() || oItems[iH].getKey() === this.getStandardVariantKey() && this.sNewDefaultKey === "") {
					oDefaultCell.setSelected(true);
				}
				oManageItem.addCell(oDefaultCell);
			}

			if (this.getShowExecuteOnSelection()) {
				oExecuteCell = new CheckBox(this.oVariantManage.getId() + "-exe-" + iItemNo, {
					selected: false,
					enabled: false,
					select: fSelectCB
				});
				if (oItems[iH].getExecuteOnSelection) {
					if ((oItems[iH].getKey() === this.getStandardVariantKey() && this.getSupportExecuteOnSelectOnSandardVariant())) {
						oExecuteCell.setEnabled(true);
					} else {
						oExecuteCell.setEnabled(!oItems[iH].getReadOnly());
					}
					oExecuteCell.setSelected(oItems[iH].getExecuteOnSelection());
					if (sTooltip) {
						oExecuteCell.setTooltip(sTooltip);
					}
				}
				oManageItem.addCell(oExecuteCell);
			}

			oTypeCell = new Text(this.oVariantManage.getId() + "-author-" + iItemNo, {
				text: oItems[iH].getAuthor(),
				textAlign: "Begin"
			});
			// oTypeCell.addStyleClass("sapUICompVarMngmtType");
			oManageItem.addCell(oTypeCell);

			oDeleteCell = new Button(this.oVariantManage.getId() + "-del-" + iItemNo, {
				icon: "sap-icon://sys-cancel",
				enabled: true,
				type: ButtonType.Transparent,
				press: fPress,
				tooltip: this.oResourceBundle.getText("VARIANT_MANAGEMENT_DELETE")
			});

			this._assignColumnInfoForDeleteButton(oDeleteCell);

			if (oItems[iH].getReadOnly && oItems[iH].getReadOnly()) {
				oDeleteCell.setEnabled(false);

				// FIORITECHP1-3560
				oDeleteCell.setVisible(false);
			}
			oManageItem.addCell(oDeleteCell);

			this.oManagementTable.addItem(oManageItem);
			iItemNo++;
		}
		this.aRemovedVariants = [];
		this.aRemovedVariantTransports = [];
		this.aRenamedVariants = [];

		this.aExeVariants = [];

		this._createManagementDialog();
		this._setDialogCompactStyle(this, this.oManagementDialog);
		oItem = this.oVariantList.getSelectedItem();
		if (oItem) {
			this.lastSelectedVariantKey = oItem.getKey();
		}
		this.oVariantPopOver.close();
		this.oManagementDialog.open();
	};

	VariantManagement.prototype._assignColumnInfoForDeleteButton = function(oDeleteButton) {
		if (!this._oInvisibleDeleteColumnName) {
			this._oInvisibleDeleteColumnName = new InvisibleText({
				text: this.oResourceBundle.getText("VARIANT_MANAGEMENT_ACTION_COLUMN")
			});

			this._createManagementDialog();
			this.oManagementDialog.addContent(this._oInvisibleDeleteColumnName);

		}

		if (this._oInvisibleDeleteColumnName) {
			oDeleteButton.addAriaLabelledBy(this._oInvisibleDeleteColumnName);
		}
	};

	VariantManagement.prototype._enableManualVariantKey = function(bEnable) {
		this.bManualVariantKey = bEnable;
	};

	VariantManagement.prototype._fireSelectAsync = function(sKey) {
		var slKey;
		if (sKey === undefined || sKey === null) {
			var oItem = this._getSelectedItem();
			if (oItem === null) {
				slKey = this.getStandardVariantKey();
			} else {
				slKey = oItem.getKey();
			}
		}
		this.fireSelect({
			key: slKey
		});
	};

	VariantManagement.prototype.setSupportExecuteOnSelectOnSandardVariant = function(bFlag) {
		this.bSupportExecuteOnSelectOnSandardVariant = bFlag;
	};
	VariantManagement.prototype.getSupportExecuteOnSelectOnSandardVariant = function() {
		return this.bSupportExecuteOnSelectOnSandardVariant;
	};

	VariantManagement.prototype._executeOnSelectForStandardVariantByXML = function(bSelect) {
		this.bExecuteOnSelectForStandardViaXML = bSelect;
	};

	VariantManagement.prototype._executeOnSelectForStandardVariantByUser = function(bSelect) {
		this.bExecuteOnSelectForStandardByUser = bSelect;
	};

	VariantManagement.prototype.getExecuteOnSelectForStandardVariant = function() {

		if (this.getSupportExecuteOnSelectOnSandardVariant()) {
			if (this.bExecuteOnSelectForStandardByUser !== null) {
				return this.bExecuteOnSelectForStandardByUser;
			}
		}

		return this.bExecuteOnSelectForStandardViaXML;
	};

	VariantManagement.prototype.getStandardVariantKey = function() {
		return this._sStandardVariantKey;
	};

	VariantManagement.prototype.setStandardVariantKey = function(sStandardVariantKey) {
		this._sStandardVariantKey = sStandardVariantKey;
	};

	VariantManagement.prototype._setVendorLayer = function(bVendorLayer) {
		this._isVendorLayer = bVendorLayer;
	};

	VariantManagement.prototype._isIndustrySolutionModeAndVendorLayer = function() {
		if (this.getIndustrySolutionMode() && this._isVendorLayer) {
			return true;
		}

		return false;
	};

	return VariantManagement;

}, /* bExport= */true);
