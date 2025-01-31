/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/**
 * SemanticPage base classes
 *
 * @namespace
 * @name sap.m.semantic
 */

// Provides class sap.m.semantic.SemanticConfiguration
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Metadata', "sap/m/OverflowToolbarLayoutData", "sap/ui/core/InvisibleText", "sap/ui/core/IconPool"],
	function(jQuery, Metadata, OverflowToolbarLayoutData, InvisibleText, IconPool) {
	"use strict";

	/**
	 * Constructor for a sap.m.semantic.SemanticConfiguration.
	 *
	 * @class Defines the visual properties and positioning for each supported semantic type
	 * @version 1.44.4
	 * @private
	 * @since 1.30.0
	 * @alias sap.m.semantic.SemanticConfiguration
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var SemanticConfiguration = Metadata.createClass("sap.m.semantic.SemanticConfiguration", {

	});

	/*
	 static members
	 */
	SemanticConfiguration.prototype._PositionInPage = {

		headerLeft: "headerLeft",
		headerRight: "headerRight",
		headerMiddle: "headerMiddle",
		footerLeft: "footerLeft",
		footerRight_IconOnly: "footerRight_IconOnly",
		footerRight_TextOnly: "footerRight_TextOnly",
		shareMenu: "shareMenu"
	};

	SemanticConfiguration._PageMode = {

		display: "display",
		edit: "edit",
		multimode: "multimode"
	};

	SemanticConfiguration.isKnownSemanticType = function (sType) {

		return SemanticConfiguration.getConfiguration(sType) != undefined;
	};

	SemanticConfiguration.getConfiguration = function (sType) {

		return SemanticConfiguration._oTypeConfigs[sType];
	};

	SemanticConfiguration.getSettings = function (sType) {

		return SemanticConfiguration._oTypeConfigs[sType].getSettings();
	};

	SemanticConfiguration.getPositionInPage = function (sType) {

		return SemanticConfiguration._oTypeConfigs[sType].position;
	};

	SemanticConfiguration.getSequenceOrderIndex = function (sType) {

		return SemanticConfiguration._oTypeConfigs[sType].order;
	};

	SemanticConfiguration.getAriaId = function (sType) {

		return SemanticConfiguration._oTypeConfigs[sType].getSettings().ariaLabelledBy;
	};

	SemanticConfiguration._oTypeConfigs = (function () { //TODO: set from outside?

	var oTypeConfigs = {},
			oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		oTypeConfigs["sap.m.semantic.MultiSelectAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.headerRight,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("multi-select"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_MULTI_SELECT")
				};
			}
		};

		oTypeConfigs["sap.m.semantic.MainAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_TextOnly,
			getSettings: function() {
				return {
					type: sap.m.ButtonType.Emphasized,
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: false,
						stayInOverflow: false
					})};
			},
			order: 0
		};

		oTypeConfigs["sap.m.semantic.EditAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_TextOnly,
			triggers: SemanticConfiguration._PageMode.edit,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_EDIT"),
					type: sap.m.ButtonType.Emphasized,
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: false,
						stayInOverflow: false
					})
				};
			},
			order: 1
		};

		oTypeConfigs["sap.m.semantic.SaveAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_TextOnly,
			triggers: SemanticConfiguration._PageMode.display,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_SAVE"),
					type: sap.m.ButtonType.Emphasized,
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: false,
						stayInOverflow: false
					})
				};
			},
			order: 3
		};

		oTypeConfigs["sap.m.semantic.DeleteAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_TextOnly,
			triggers: SemanticConfiguration._PageMode.display,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_DELETE"),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: false,
						stayInOverflow: false
					})
				};
			},
			order: 4
		};

		oTypeConfigs["sap.m.semantic.PositiveAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_TextOnly,
			getSettings: function() {
				return {
					type: sap.m.ButtonType.Accept,
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: false,
						stayInOverflow: false
					})};
			},
			order: 5
		};

		oTypeConfigs["sap.m.semantic.NegativeAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_TextOnly,
			getSettings: function() {
				return {
					type: sap.m.ButtonType.Reject,
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: false,
						stayInOverflow: false
					})};
			},
			order: 6
		};

		oTypeConfigs["sap.m.semantic.CancelAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_TextOnly,
			triggers: SemanticConfiguration._PageMode.display,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_CANCEL")
				};
			},
			order: 7
		};

		oTypeConfigs["sap.m.semantic.ForwardAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_TextOnly,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_FORWARD"),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						stayInOverflow: false
					})
				};
			},
			order: 8
		};

		oTypeConfigs["sap.m.semantic.OpenInAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_TextOnly,
			getSettings: function() {
				return {
					text: oBundle.getText("SEMANTIC_CONTROL_OPEN_IN")
				};
			},
			order: 9
		};

		oTypeConfigs["sap.m.semantic.AddAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_IconOnly,
			triggers: SemanticConfiguration._PageMode.edit,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("add"),
					text: oBundle.getText("SEMANTIC_CONTROL_ADD"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_ADD")
				};
			},
			order: 0,
			constraints: "IconOnly"
		};

		oTypeConfigs["sap.m.semantic.FavoriteAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_IconOnly,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("favorite"),
					text: oBundle.getText("SEMANTIC_CONTROL_FAVORITE"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_FAVORITE")
				};
			},
			order: 1,
			constraints: "IconOnly"
		};

		oTypeConfigs["sap.m.semantic.FlagAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_IconOnly,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("flag"),
					text: oBundle.getText("SEMANTIC_CONTROL_FLAG"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_FLAG")
				};
			},
			order: 2,
			constraints: "IconOnly"
		};

		oTypeConfigs["sap.m.semantic.ISort"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_IconOnly,
			order: 3
		};

		oTypeConfigs["sap.m.semantic.IFilter"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_IconOnly,
			order: 4
		};

		oTypeConfigs["sap.m.semantic.IGroup"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_IconOnly,
			order: 5
		};

		oTypeConfigs["sap.m.semantic.SortAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_IconOnly,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("sort"),
					text: oBundle.getText("SEMANTIC_CONTROL_SORT"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_SORT"),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						stayInOverflow: false
					})
				};
			},
			constraints: "IconOnly"
		};

		oTypeConfigs["sap.m.semantic.SortSelect"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_IconOnly,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("sort"),
					type: "IconOnly",
					autoAdjustWidth: true,
					tooltip: oBundle.getText("SEMANTIC_CONTROL_SORT"),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						stayInOverflow: false
					})
				};
			},
			getEventDelegates: function(oContext) {
				return {
					onAfterRendering: function () {
						this.$().attr({"aria-haspopup": true, "role": ""});
					}.bind(oContext)
				};
			},
			constraints: "IconOnly"
		};

		oTypeConfigs["sap.m.semantic.FilterAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_IconOnly,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("filter"),
					text: oBundle.getText("SEMANTIC_CONTROL_FILTER"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_FILTER"),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						stayInOverflow: false
					})
				};
			},
			constraints: "IconOnly"
		};

		oTypeConfigs["sap.m.semantic.FilterSelect"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_IconOnly,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("filter"),
					type: "IconOnly",
					autoAdjustWidth: true,
					tooltip: oBundle.getText("SEMANTIC_CONTROL_FILTER"),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						stayInOverflow: false
					})
				};
			},
			constraints: "IconOnly"
		};

		oTypeConfigs["sap.m.semantic.GroupAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_IconOnly,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("group-2"),
					text: oBundle.getText("SEMANTIC_CONTROL_GROUP"),
					tooltip: oBundle.getText("SEMANTIC_CONTROL_GROUP"),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						stayInOverflow: false
					})
				};
			},
			constraints: "IconOnly"
		};

		// sap.m.Select has no property for tooltip of the icon, so the default tooltip icon will be used
		// this might lead to a different translation of the tooltip when the "Group-2" button is used inside sap.m.Select or used as a standard button
		oTypeConfigs["sap.m.semantic.GroupSelect"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerRight_IconOnly,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("group-2"),
					type: "IconOnly",
					autoAdjustWidth: true,
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						stayInOverflow: false
					})
				};
			},
			getEventDelegates: function(oContext) {
				return {
					onAfterRendering: function () {
						this.$().attr({"aria-haspopup": true, "role": ""});
					}.bind(oContext)
				};
			},
			constraints: "IconOnly"
		};

		oTypeConfigs["saveAsTileAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.shareMenu,
			order: 0,
			constraints: "IconOnly"
		};

		oTypeConfigs["pagingAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.headerRight
		};

		oTypeConfigs["sap.m.semantic.DiscussInJamAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.shareMenu,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("discussion-2"),
					text: oBundle.getText("SEMANTIC_CONTROL_DISCUSS_IN_JAM")
				};
			},
			order: 1,
			constraints: "IconOnly"
		};

		oTypeConfigs["sap.m.semantic.ShareInJamAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.shareMenu,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("share-2"),
					text: oBundle.getText("SEMANTIC_CONTROL_SHARE_IN_JAM")
				};
			},
			order: 2,
			constraints: "IconOnly"
		};

		oTypeConfigs["sap.m.semantic.SendMessageAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.shareMenu,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("discussion"),
					text: oBundle.getText("SEMANTIC_CONTROL_SEND_MESSAGE")
				};
			},
			order: 3,
			constraints: "IconOnly"
		};

		oTypeConfigs["sap.m.semantic.SendEmailAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.shareMenu,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("email"),
					text: oBundle.getText("SEMANTIC_CONTROL_SEND_EMAIL")
				};
			},
			order: 4,
			constraints: "IconOnly"
		};

		oTypeConfigs["sap.m.semantic.PrintAction"] = {
			position: SemanticConfiguration.prototype._PositionInPage.shareMenu,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("print"),
					text: oBundle.getText("SEMANTIC_CONTROL_PRINT")
				};
			},
			order: 5,
			constraints: "IconOnly"
		};

		oTypeConfigs["sap.m.semantic.MessagesIndicator"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerLeft,
			getSettings: function() {
				return {
					icon: IconPool.getIconURI("message-popup"),
					text: {
						path: "message>/",
						formatter: function (aMessages) {
							return aMessages.length || 0;
						}
					},
					tooltip: oBundle.getText("SEMANTIC_CONTROL_MESSAGES_INDICATOR"),
					type: sap.m.ButtonType.Emphasized,
					visible: {
						path: "message>/",
						formatter: function (aMessages) {
							return aMessages && aMessages.length > 0;
						}
					},
					models: {message: sap.ui.getCore().getMessageManager().getMessageModel()},
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: false,
						stayInOverflow: false
					})
				};
			}
		};

		oTypeConfigs["draftIndicator"] = {
			position: SemanticConfiguration.prototype._PositionInPage.footerLeft,
			getSettings: function() {
				return {
					layoutData: new sap.m.OverflowToolbarLayoutData({shrinkable: false})
				};
			},
			order: 1
		};

		return oTypeConfigs;
	})();

	return SemanticConfiguration;

}, /* bExport= */ false);
