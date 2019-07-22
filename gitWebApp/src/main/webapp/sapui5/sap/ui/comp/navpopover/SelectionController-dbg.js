/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides SelectionController
sap.ui.define([
	'jquery.sap.global', 'sap/ui/base/ManagedObject', 'sap/m/P13nDialog', 'sap/m/P13nSelectionPanel', 'sap/m/P13nItem', 'sap/m/P13nColumnsItem', 'sap/ui/comp/personalization/Util'
], function(jQuery, ManagedObject, P13nDialog, P13nSelectionPanel, P13nItem, P13nColumnsItem, PersonalizationUtil) {
	"use strict";

	/**
	 * The SelectionController can be used to...
	 * 
	 * @class Table Personalization Controller
	 * @extends sap.ui.base.ManagedObject
	 * @constructor
	 * @private
	 * @alias sap.ui.comp.navpopover.SelectionController
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SelectionController = ManagedObject.extend("sap.ui.comp.navpopover.SelectionController",
	/** @lends sap.ui.comp.navpopover.SelectionController.prototype */
	{
		metadata: {
			library: "sap.ui.comp"
		}
	});

	/**
	 * @param {array} aMItems Array of simple object representation of LinkData with the type {key: {string}, text: {string}, target: {string},
	 *        description: {string}, visible:{boolean}}
	 * @param {array} aMColumnsItems Array of simple object representation of 'touched' links with the type {key: {string}, visible:{boolean},
	 *        index:{int}}
	 * @param {sap.ui.comp.navpopover.SmartLink | sap.m.ObjectIdentifier} oControl Control which triggers opening of selection dialog
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @private
	 */
	SelectionController.prototype.openSelectionDialog = function(aMItems, aMColumnsItems, oControl) {
		var aMColumnsItemsOld = SelectionController._applyNewItems(aMItems, aMColumnsItems);
		return new Promise(function(resolve) {
			var oDialog = new P13nDialog({
				stretch: sap.ui.Device.system.phone,
				showReset: false,
				contentWidth: "25rem",
				contentHeight: "35rem",
				panels: [
					new P13nSelectionPanel({
						titleLarge: sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_SELECTION_TITLE"),
						items: aMItems.filter(function(oMItem) {
							return oMItem.key !== undefined;
						}).map(function(oMItem) {
							return new P13nItem({
								columnKey: oMItem.key,
								text: oMItem.text
							});
						}),
						columnsItems: aMColumnsItems.filter(function(oMColumnsItem) {
							return oMColumnsItem.key !== undefined;
						}).map(function(oMColumnsItem) {
							return new P13nColumnsItem({
								columnKey: oMColumnsItem.key,
								visible: oMColumnsItem.visible,
								index: oMColumnsItem.index
							});
						})
					})
				],
				ok: function(oEvent) {
					if (!oEvent.getParameter("payload") || !oEvent.getParameter("payload").selection || !oEvent.getParameter("payload").selection.columnsItems) {
						// No items selected
						this.close();
						this.destroy();
						return resolve(null);
					}
					var oDefinedLinksNew = SelectionController.getDiff(aMColumnsItemsOld, SelectionController._columnsItems2MColumnsItems(oEvent.getParameter("payload").selection.columnsItems));
					if (!oDefinedLinksNew) {
						// Nothing to store
						this.close();
						this.destroy();
						return resolve(null);
					}

					this.close();
					this.destroy();
					return resolve(oDefinedLinksNew);
				},
				cancel: function() {
					// Cancel clicked
					this.close();
					this.destroy();
					return resolve(null);
				}
			});
			oDialog.toggleStyleClass("sapUiSizeCompact", !!jQuery(oControl.getDomRef()).closest(".sapUiSizeCompact").length);
			oDialog.open();
		});
	};

	/**
	 * Takes over the 'visible' value of aNew into corresponding item of aItemsAll.
	 * 
	 * @param {array} aItemsAll Array of objects in format {key: {string}, visible: undefined}
	 * @param {array} aNew Array of objects in format {key: {string}, visible: true}
	 * @returns {array} Array
	 * @private
	 */
	SelectionController._applyNewItems = function(aItemsAll, aNew) {
		return aItemsAll.map(function(oItem) {
			var oNew = PersonalizationUtil.getArrayElementByKey("key", oItem.key, aNew);
			return {
				key: oItem.key,
				visible: oNew ? oNew.visible : oItem.visible
			};
		});
	};

	/**
	 * Convert columnsItems into an array of objects in format {key: {string}, visible: {boolean}}
	 * 
	 * @param {array} aColumnsItems Array of sap.m.P13nColumnsItem objects
	 * @returns {array}
	 * @private
	 */
	SelectionController._columnsItems2MColumnsItems = function(aColumnsItems) {
		// Do not store the index of selected item as it is not of interest. We are only interested in the order starting by 0.
		// Comparing to table personalization the links can not be moved inside of NavigationPopover and can not be set to visible like it
		// is possible in Table.
		return aColumnsItems.map(function(oColumnItem) {
			return {
				key: oColumnItem.getColumnKey(),
				visible: oColumnItem.getVisible()
			};
		});
	};

	/**
	 * Result is XOR based difference = aOldAll - aNew
	 * 
	 * @param {array} aOldAll Superset of aNew
	 * @param {array} aNew Subset of aOldAll
	 * @returns {object | null} Object of format
	 * 
	 * <pre>
	 * {addedLinks:[{key: {string}, visible: {boolean}}], removedLinks:[{key: {string}, visible: {boolean}}]}
	 * </pre>
	 * 
	 * @private
	 */
	SelectionController.getDiff = function(aOldAll, aNew) {
		// The aNew array should be a subset of aOldAll
		if (aOldAll.length < aNew.length) {
			return null;
		}

		var oDelta = {
			addedLinks: [],
			removedLinks: []
		};
		aOldAll.forEach(function(oOld) {
			var oNew = PersonalizationUtil.getArrayElementByKey("key", oOld.key, aNew);
			if (!oNew) {
				return;
			}
			if (oNew.visible !== oOld.visible && oNew.visible === true) {
				oDelta.addedLinks.push(oNew);
			}
			if (oNew.visible !== oOld.visible && oNew.visible === false) {
				oDelta.removedLinks.push(oNew);
			}
		});

		return (oDelta.addedLinks.length || oDelta.removedLinks.length) ? oDelta : null;
	};

	/**
	 * Result is Union of aOld and aNew. If for an old item a corresponding new item exists, the old item is updated by new item. If for an old item
	 * no corresponding new item exists, the new item is appended to the result.
	 * 
	 * @param {array} aOld
	 * @param {array} aNew
	 * @returns {array}
	 * @private
	 */
	SelectionController.getUnion = function(aOld, aNew) {
		var aUnion = [];

		// Modify items of aOld with corresponding items of aNew
		aOld.forEach(function(oOld) {
			var oUnion = jQuery.extend(true, {}, oOld);
			var oNew = PersonalizationUtil.getArrayElementByKey("key", oOld.key, aNew);
			if (oNew) {
				oUnion.visible = oNew.visible;
				oUnion.index = oNew.index;
			}
			aUnion.push(oUnion);
		});

		// Take over items of aNew which are not content of aOld
		aNew.forEach(function(oNew) {
			var oUnion = PersonalizationUtil.getArrayElementByKey("key", oNew.key, aUnion);
			if (!oUnion) {
				aUnion.push(oNew);
			}
		});
		return aUnion;
	};

	return SelectionController;

}, /* bExport= */true);
