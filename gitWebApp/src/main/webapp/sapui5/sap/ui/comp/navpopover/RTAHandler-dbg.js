/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/comp/library', './SelectionController', './Util', 'sap/ui/comp/navpopover/flexibility/changes/AddLink', 'sap/ui/comp/navpopover/flexibility/changes/RemoveLink', 'sap/ui/fl/changeHandler/JsControlTreeModifier', './Factory'
], function(jQuery, CompLibrary, SelectionController, Util, AddLink, RemoveLink, JsControlTreeModifier, Factory) {
	"use strict";

	/**
	 * Runtime adaptation handler.
	 * 
	 * @constructor
	 * @private
	 * @since 1.44.0
	 * @alias sap.ui.comp.navpopover.RTAHandler
	 */
	var RTAHandler = {};

	RTAHandler.isSettingsAvailable = function() {
		return Factory.getService("CrossApplicationNavigation") && Factory.getService("FlexConnector").isVendorLayer();
	};

	RTAHandler.getStableElements = function(oNavigationPopoverHandler) {
		if (!oNavigationPopoverHandler || !(oNavigationPopoverHandler instanceof sap.ui.comp.navpopover.NavigationPopoverHandler)) {
			return null;
		}
		var sStableID = oNavigationPopoverHandler.getNavigationPopoverStableId();
		if (!sStableID) {
			return null;
		}
		var oAppComponent = oNavigationPopoverHandler._getAppComponent();
		if (!oAppComponent) {
			return null;
		}
		return [
			{
				id: sStableID,
				appComponent: oAppComponent
			}
		];
	};

	RTAHandler.execute = function(oNavigationPopoverHandler, fGetUnsavedChanges) {
		return new Promise(function(resolve, reject) {
			if (!oNavigationPopoverHandler || !(oNavigationPopoverHandler instanceof sap.ui.comp.navpopover.NavigationPopoverHandler)) {
				return reject(new Error("oNavigationPopoverHandler is not of supported type sap.ui.comp.navpopover.NavigationPopoverHandler"));
			}
			var sStableID = oNavigationPopoverHandler.getNavigationPopoverStableId();
			if (!sStableID) {
				return reject(new Error("StableId is not defined. SemanticObject=" + oNavigationPopoverHandler.getSemanticObject()));
			}
			var oAppComponent = oNavigationPopoverHandler._getAppComponent();
			if (!oAppComponent) {
				return reject(new Error("AppComponent is not defined. oControl=" + oNavigationPopoverHandler.getControl()));
			}
			var oControl = sap.ui.getCore().byId(oNavigationPopoverHandler.getControl());

			// Apply saved changes by creating NavigationPopover
			oNavigationPopoverHandler._getPopover().then(function(oNavigationPopover) {
				// Apply unsaved changes to NavigationPopover
				RTAHandler._applyUnsavedChanges(sStableID, fGetUnsavedChanges, oNavigationPopover, oAppComponent);

				var aMItems = Util.availableAction2MItems(oNavigationPopover);
				var aMColumnsItems = Util.availableAction2MColumnsItems(oNavigationPopover);

				oNavigationPopoverHandler._destroyPopover();

				new SelectionController().openSelectionDialog(aMItems, aMColumnsItems, oControl).then(function(oMDiffLinks) {
					if (!oMDiffLinks) {
						resolve([]);
					}
					var aAddedLinks = RTAHandler._prepareResult(oMDiffLinks.addedLinks, sap.ui.comp.navpopover.ChangeHandlerType.addLink, sStableID, oAppComponent);
					var aRemovedLinks = RTAHandler._prepareResult(oMDiffLinks.removedLinks, sap.ui.comp.navpopover.ChangeHandlerType.removeLink, sStableID, oAppComponent);
					resolve(aAddedLinks.concat(aRemovedLinks));

				})['catch'](function(oReason) {
					return reject(oReason);
				});
			});
		});
	};

	/**
	 * @private
	 */
	RTAHandler._prepareResult = function(aMLinks, sChangeType, sStableID, oAppComponent) {
		return aMLinks.map(function(oMLink) {
			return {
				selectorControl: {
					id: sStableID,
					controlType: "sap.ui.comp.navpopover.NavigationPopover",
					appComponent: oAppComponent
				},
				changeSpecificData: {
					changeType: sChangeType,
					content: oMLink
				}
			};
		});
	};

	/**
	 * @private
	 */
	RTAHandler._applyUnsavedChanges = function(sStableID, fGetUnsavedChanges, oNavigationPopover, oAppComponent) {
		var aChanges = fGetUnsavedChanges(sStableID, [
			sap.ui.comp.navpopover.ChangeHandlerType.addLink, sap.ui.comp.navpopover.ChangeHandlerType.removeLink
		]);
		aChanges.forEach(function(oChange) {
			switch (oChange.getChangeType()) {
				case sap.ui.comp.navpopover.ChangeHandlerType.addLink:
					AddLink.applyChange(oChange, oNavigationPopover, {
						modifier: JsControlTreeModifier,
						appComponent: oAppComponent
					});
					break;
				case sap.ui.comp.navpopover.ChangeHandlerType.removeLink:
					RemoveLink.applyChange(oChange, oNavigationPopover, {
						modifier: JsControlTreeModifier,
						appComponent: oAppComponent
					});
					break;
			}
		});
	};

	return RTAHandler;
},
/* bExport= */true);
