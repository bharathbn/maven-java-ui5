/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides control sap.ui.rta.ToolsMenu.
sap.ui.define([
	'sap/ui/rta/library',
	'sap/ui/core/Control',
	'sap/m/Toolbar',
	'sap/m/ToolbarLayoutData',
	'sap/m/ToolbarSpacer',
	'sap/m/Label',
	'sap/ui/core/Popup',
	'sap/ui/fl/registry/Settings',
	'sap/ui/fl/Utils'
	],
	function(
		library,
		Control,
		Toolbar,
		ToolbarLayoutData,
		ToolbarSpacer,
		Label,
		Popup,
		FlexSettings,
		Utils) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.ToolsMenu control.
	 *
	 * @class
	 * Contains all the necessary Toolbars for the Runtime Authoring
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.ToolsMenu
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ToolsMenu = Control.extend("sap.ui.rta.ui.ToolsMenu", {
		metadata : {

			library : "sap.ui.rta",
			// ---- control specific ----
			aggregations : {
				"toolbars" : {
					type : "sap.m.Toolbar",
					multiple : true,
					singularName : "toolbar"
				}
			},
			events : {
				/**
				 * Events are fired when the Toolbar - Buttons are pressed
				 */
				"undo" : {},
				"redo" : {},
				"close" : {},
				"toolbarClose" : {},
				"restore": {},
				"transport" : {}
			}
		}

	});

	/**
	 * Initialization of the ToolsMenu Control
	 * @private
	 */
	ToolsMenu.prototype.init = function() {

		// Get messagebundle.properties for sap.ui.rta
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

	};

	/**
	 * Create Toolbar
	 * @private
	 */
	ToolsMenu.prototype.createToolbar = function() {

		var sText = null;
		// calculate z-index dependent on opened popups
		var iZIndex = Popup.getNextZIndex();

		if (!this._oToolBar) {

			var oAdaptModeLabel = null;
			var oAppTitleLabel = null;
			var oButtonExit = null;
			var oSpacerTop = null;
			var oTop = null;

			// Label 'Adaptation Mode'
			sText = " - " + this._oRb.getText("TOOLBAR_TITLE");
			oAdaptModeLabel = new Label({
				text : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			oAdaptModeLabel.bAllowTextSelection = false;

			// Label 'Application Name'
			sText = null;
			oAppTitleLabel = new Label({
				text : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			oAppTitleLabel.bAllowTextSelection = false;

			// Button 'Undo'
			sText = this._oRb.getText("BTN_UNDO");
			this._oButtonUndo = new sap.m.Button({
				type:"Transparent",
				icon: "sap-icon://undo",
				enabled : false,
				tooltip : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			this._oButtonUndo.data("Action", "UNDO",true);
			this._oButtonUndo.attachEvent('press', this._onUndo, this);

			// Button 'Redo'
			sText = this._oRb.getText("BTN_REDO");
			this._oButtonRedo = new sap.m.Button({
				type:"Transparent",
				icon: "sap-icon://redo",
				iconFirst: false,
				enabled : false,
				tooltip : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			this._oButtonRedo.data("Action", "REDO",true);
			this._oButtonRedo.attachEvent('press', this._onRedo, this);

			// Button 'Restore'
			sText = this._oRb.getText("BTN_RESTORE");
			this._oButtonRestore = new sap.m.Button({
				type:"Transparent",
				text : sText,
				visible: true,
				tooltip : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			this._oButtonRestore.data("Action", "RESTORE",true);
			this._oButtonRestore.attachEvent('press', this._onRestore, this);

			// Button 'Exit'
			sText = this._oRb.getText("BTN_EXIT");
			oButtonExit = new sap.m.Button({
				type:"Transparent",
				text : sText,
				tooltip : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			oButtonExit.data("Action", "EXIT",true);
			oButtonExit.attachEvent('press', this.close, this);

			// Button 'Transport'
			sText = this._oRb.getText("BTN_TRANSPORT");
			this._oButtonTransport = new sap.m.Button({
				type:"Transparent",
				text : sText,
				visible : false,
				tooltip : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			this._oButtonTransport.data("Action", "TRANSPORT", true);
			this._oButtonTransport.attachEvent('press', this._onTransport, this);

			// Space between Toolbar Elements
			oSpacerTop = new ToolbarSpacer();

			//create Toolbar
			this._oToolBar = new Toolbar({
				active : true,
				content : [
				           oAppTitleLabel,
				           oAdaptModeLabel,
				           oSpacerTop,
				           this._oButtonUndo,
				           this._oButtonRedo,
				           this._oButtonRestore,
				           this._oButtonTransport,
				           oButtonExit
				           ]
			});

			this._oToolBar.addStyleClass("sapUiRTAToolBar");
			this.addToolbar(this._oToolBar);

			// Insert a DIV-Element for Top Toolbar in the DOM
			jQuery("body").prepend('<div id="RTA-Toolbar" style="z-index: ' + iZIndex + '"></div>');
			oTop = jQuery("#RTA-Toolbar").addClass("sapUiRTAToolsMenuWrapper");
			oTop = oTop[0];
			this.placeAt(oTop);
		}
	};

	/**
	 * Override the EXIT-Function
	 * @private
	 */
	ToolsMenu.prototype.exit = function() {
		// Remove the DOM-Element for the Toolbar
		jQuery("#RTA-Toolbar").remove();
	};

	/**
	 * Trigger transport
	 * @private
	 */
	ToolsMenu.prototype._onTransport = function() {
		this.fireTransport();
	};

	/**
	 * Check if the transports are available,
	 * transports are available in non-productive systems
	 * and no merge errors has occoured
	 * currently set's the visibility for Transport and Restore button
	 *
	 * @returns {Promise}
	 */
	ToolsMenu.prototype.checkTransportAvailable = function() {
		var that = this;
		return FlexSettings.getInstance(Utils.getComponentClassName(this._oRootControl)).then(function(oSettings) {
			if (!oSettings.isProductiveSystem() && !oSettings.hasMergeErrorOccured()) {
				var bIsATOEnabled = oSettings.isAtoEnabled();
				that._oButtonTransport.setVisible(true);
				that.adaptTransportText(bIsATOEnabled);
				return bIsATOEnabled;
			}
		}).catch(function(){
			that._oButtonTransport.setVisible(false);
		});
	};

	/**
	 * Makes the Toolbar(s) visible
	 * @public
	 */
	ToolsMenu.prototype.show = function() {
		this._oToolBar.addStyleClass("sapUiRTAToolBarVisible");
		this._oToolBar.removeStyleClass("sapUiRTAToolBarInvisible");
	};

	/**
	 * Makes the TOP Toolbar invisible
	 * @public
	 */
	ToolsMenu.prototype.hide = function() {
		var that = this;

		return new Promise(function(resolve) {
			that._oToolBar.addStyleClass("sapUiRTAToolBarInvisible");
			var oToolBarDOM = document.getElementsByClassName("sapUiRTAToolBar")[0];
			var fnAnimationEnd = function() {
				resolve();
				that.fireClose();
			};
			// all types of CSS3 animationend events for different browsers
			oToolBarDOM.addEventListener("webkitAnimationEnd", fnAnimationEnd);
			oToolBarDOM.addEventListener("animationend", fnAnimationEnd);
			oToolBarDOM.addEventListener("oanimationend", fnAnimationEnd);
		});
	};

	/**
	 * Trigger undo
	 * @private
	 */
	ToolsMenu.prototype._onUndo = function() {

		this.fireUndo();
	};

	/**
	 * Trigger redo
	 * @private
	 */
	ToolsMenu.prototype._onRedo = function() {

		this.fireRedo();
	};

	/**
	 * Discard all the LREP changes and restore the default app state
	 * @private
	 */
	ToolsMenu.prototype._onRestore = function() {

		this.fireRestore();
	};

	/**
	 * Closing the ToolsMenu
	 * @public
	 */
	ToolsMenu.prototype.close = function() {

		this.fireToolbarClose();

	};

	/**
	 * Set the Application Title
	 * @param {string} sTitle Application Title
	 * @public
	 */
	// Method for setting the Application Title
	ToolsMenu.prototype.setTitle = function(sTitle) {
		var oLabel = this._oToolBar.getContent()[0];
		oLabel.setText(sTitle);
	};

	/**
	 * Set the root control
	 * @param {sap.ui.core.Control} oControl - SAPUI5 control
	 * @public
	 */
	ToolsMenu.prototype.setRootControl = function(oControl) {
		this._oRootControl = oControl;
	};

	/**
	 * Adapt the text of the Transport - Button
	 * depending on ATO enabled Setting
	 * @private
	 */
	ToolsMenu.prototype.adaptTransportText = function(bATOEnabled) {
		var sText = null;
		if (bATOEnabled) {
			sText = this._oRb.getText("BTN_PUBLISH");
		} else {
			sText = this._oRb.getText("BTN_TRANSPORT");
		}
		this._oButtonTransport.setText(sText);
		this._oButtonTransport.setTooltip(sText);
	};

	/**
	 * Adapt the enablement of the und/redo buttons in the ToolsMenu
	 */
	ToolsMenu.prototype.adaptUndoRedoEnablement = function(bCanUndo,bCanRedo) {
		this._oButtonUndo.setEnabled(bCanUndo);
		this._oButtonRedo.setEnabled(bCanRedo);
	};

	/**
	 * Adapt the enablement of the Transport/Publish button in the ToolsMenu
	 * @param {Boolean}
	 * 			bChangesExists set to true if changes exists
	 */
	ToolsMenu.prototype.adaptTransportEnablement = function(bChangesExists) {
		this._oButtonTransport.setEnabled(bChangesExists);
	};

	/**
	 * Adapt the enablement of the Reset button in the ToolsMenu
	 * @param {Boolean}
	 * 			bChangesExists set to true if changes exists
	 */
	ToolsMenu.prototype.adaptRestoreEnablement = function(bChangesExists) {
		this._oButtonRestore.setEnabled(bChangesExists);
	};

	return ToolsMenu;

}, /* bExport= */ true);
