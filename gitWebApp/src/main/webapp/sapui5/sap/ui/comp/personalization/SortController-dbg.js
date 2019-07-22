/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides SortController
sap.ui.define([
	'jquery.sap.global', './BaseController', 'sap/m/library', './Util'
], function(jQuery, BaseController, library, Util) {
	"use strict";

	/**
	 * The SortController can be used to...
	 *
	 * @class Table Personalization Controller
	 * @extends sap.ui.comp.personalization.BaseController
	 * @author SAP
	 * @version 1.25.0-SNAPSHOT
	 * @alias sap.ui.comp.personalization.SortController
	 */
	var SortController = BaseController.extend("sap.ui.comp.personalization.SortController",
	/** @lends sap.ui.comp.personalization.SortController */
	{
		constructor: function(sId, mSettings) {
			BaseController.apply(this, arguments);
			this.setType(sap.m.P13nPanelType.sort);
		},
		metadata: {
			events: {
				afterSortModelDataChange: {}
			}
		}
	});

	SortController.prototype.setTable = function(oTable) {
		BaseController.prototype.setTable.apply(this, arguments);

		if (oTable instanceof sap.ui.table.Table) {
			oTable.detachSort(this._onSort, this);
			oTable.attachSort(this._onSort, this);
		}
	};

	/**
	 * this method will make a complete json snapshot of the current table instance ("original") from the perspective of the columns controller; the
	 * json snapshot can later be applied to any table instance to recover all columns related infos of the "original" table TODO: This really only
	 * works for when max 1 sort criteria is defined since otherwise potentially order of sort criteria is destroyed
	 */
	SortController.prototype._getTable2Json = function() {
		var oJsonData = this.createPersistentStructure();
		var oTable = this.getTable();
		Util.createSort2Json(oTable, oJsonData.sort.sortItems, this.getIgnoreColumnKeys());
		return oJsonData;
	};

	SortController.prototype._getTable2JsonRestore = function() {
		return this._getTable2Json();
	};

	SortController.prototype.syncTable2TransientModel = function() {
		var oTable = this.getTable();
		var aItems = [];
		var oColumn;
		var sColumnKey;
		var oColumnKey2ColumnMap = this.getColumnMap(true);

		if (oTable) {
			if (oTable instanceof sap.ui.table.Table) {
				for (sColumnKey in oColumnKey2ColumnMap) {
					oColumn = oColumnKey2ColumnMap[sColumnKey];
					if (Util.isSortable(oColumn)) {
						aItems.push({
							columnKey: sColumnKey,
							text: oColumn.getLabel().getText(),
							tooltip: (oColumn.getTooltip() instanceof sap.ui.core.TooltipBase) ? oColumn.getTooltip().getTooltip_Text() : oColumn.getTooltip_Text()
						});
					}
				}
			} else if (oTable instanceof sap.m.Table) {
				for (sColumnKey in oColumnKey2ColumnMap) {
					oColumn = oColumnKey2ColumnMap[sColumnKey];
					if (Util.isSortable(oColumn)) {
						aItems.push({
							columnKey: sColumnKey,
							text: oColumn.getHeader().getText(),
							tooltip: (oColumn.getHeader().getTooltip() instanceof sap.ui.core.TooltipBase) ? oColumn.getHeader().getTooltip().getTooltip_Text() : oColumn.getHeader().getTooltip_Text()
						});
					}
				}
			} else if (oTable instanceof sap.ui.comp.personalization.ChartWrapper) {
				for (sColumnKey in oColumnKey2ColumnMap) {
					oColumn = oColumnKey2ColumnMap[sColumnKey];
					aItems.push({
						columnKey: sColumnKey,
						text: oColumn.getLabel(),
						tooltip: (oColumn.getTooltip() instanceof sap.ui.core.TooltipBase) ? oColumn.getTooltip().getTooltip_Text() : oColumn.getTooltip_Text()
					});
				}
			}
		}

		Util.sortItemsByText(aItems, "text");

		// check if items was changed at all and take over if it was changed
		// TODO: clean up here
		var aItemsBefore = this.getModel("$sapuicomppersonalizationBaseController").getData().transientData.sort.items;
		if (jQuery(aItems).not(aItemsBefore).length !== 0 || jQuery(aItemsBefore).not(aItems).length !== 0) {
			this.getModel("$sapuicomppersonalizationBaseController").getData().transientData.sort.items = aItems;
		}
	};

	SortController.prototype._onSort = function(oEvent) {
		oEvent.preventDefault();
		var bAdded = oEvent.mParameters.columnAdded;

		var oTable = this.getTable();
		if (typeof oTable === "string") {
			oTable = sap.ui.getCore().byId(oTable);
		}

		this.fireBeforePotentialTableChange();

		// remove existing sortings
		if (!bAdded) {
			var oColumnKey2ColumnMap = this.getColumnMap();
			for ( var sColumnKey in oColumnKey2ColumnMap) {
				var oColumn = oColumnKey2ColumnMap[sColumnKey];
				if (oColumn.setSorted) {
					oColumn.setSorted(false);
				}
			}
		}
		var oColumn = oEvent.mParameters.column;
		if (oColumn && oColumn.setSorted) {
			oColumn.setSorted(true);
			oColumn.setSortOrder(oEvent.mParameters.sortOrder);
		}

		var oSortData = this.getModel("$sapuicomppersonalizationBaseController").getData().persistentData.sort;

		if (!bAdded) {
			oSortData.sortItems = [];
		}

		var i = Util.getIndexByKey(oSortData.sortItems, Util.getColumnKey(oColumn));
		if (i > -1) {
			oSortData.sortItems.splice(i, 1);
		}
		oSortData.sortItems.push({
			columnKey: Util.getColumnKey(oColumn),
			operation: oEvent.mParameters.sortOrder
		});

		this.fireAfterPotentialTableChange();

		this.fireAfterSortModelDataChange();
	};

	SortController.prototype.getPanel = function() {

		sap.ui.getCore().loadLibrary("sap.m");

		jQuery.sap.require("sap/m/P13nSortPanel");
		jQuery.sap.require("sap/m/P13nItem");
		jQuery.sap.require("sap/m/P13nSortItem");

		if (!this.getColumnHelper().hasSortableColumns()) {
			return null;
		}
		var that = this;
		var oPanel = new sap.m.P13nSortPanel({
			containerQuery: true,
			items: {
				path: "$sapmP13nPanel>/transientData/sort/items",
				template: new sap.m.P13nItem({
					columnKey: "{$sapmP13nPanel>columnKey}",
					text: "{$sapmP13nPanel>text}",
					tooltip: "{$sapmP13nPanel>tooltip}",
					maxLength: "{$sapmP13nPanel>maxlength}",
					type: "{$sapmP13nPanel>type}"
				})
			},
			sortItems: {
				path: "$sapmP13nPanel>/persistentData/sort/sortItems",
				template: new sap.m.P13nSortItem({
					columnKey: "{$sapmP13nPanel>columnKey}",
					operation: "{$sapmP13nPanel>operation}"
				})
			},
			beforeNavigationTo: that.setModelFunction()
		});

		oPanel.attachAddSortItem(function(oEvent) {
			var oData = this.getModel("$sapuicomppersonalizationBaseController").getData();
			var params = oEvent.getParameters();
			var oSortItem = {
				columnKey: params.sortItemData.getColumnKey(),
				operation: params.sortItemData.getOperation()
			};
			if (params.index > -1) {
				oData.persistentData.sort.sortItems.splice(params.index, 0, oSortItem);
			} else {
				oData.persistentData.sort.sortItems.push(oSortItem);
			}
			this.getModel("$sapuicomppersonalizationBaseController").setData(oData, true);
		}, this);

		oPanel.attachRemoveSortItem(function(oEvent) {
			var params = oEvent.getParameters();
			var oData = this.getModel("$sapuicomppersonalizationBaseController").getData();
			if (params.index > -1) {
				oData.persistentData.sort.sortItems.splice(params.index, 1);
				this.getModel("$sapuicomppersonalizationBaseController").setData(oData, true);
			}
		}, this);

		return oPanel;
	};

	SortController.prototype.syncJsonModel2Table = function(oJsonModel) {
		var oColumnKey2ColumnMap = this.getColumnMap();
		var oColumnKey2ColumnMapUnsorted = jQuery.extend(true, {}, oColumnKey2ColumnMap);

		this.fireBeforePotentialTableChange();

		if (this.getTable() instanceof sap.ui.table.Table) {
			oJsonModel.sort.sortItems.forEach(function(oSortItem) {
				var oColumn = oColumnKey2ColumnMap[oSortItem.columnKey];
				if (!oColumn) {
					return;
				}
				if (!oColumn.getSorted()) {
					oColumn.setSorted(true);
				}
				if (oColumn.getSortOrder() !== oSortItem.operation) {
					oColumn.setSortOrder(oSortItem.operation);
				}
				delete oColumnKey2ColumnMapUnsorted[oSortItem.columnKey];
			});

			for ( var sColumnKey in oColumnKey2ColumnMapUnsorted) {
				var oColumn = oColumnKey2ColumnMapUnsorted[sColumnKey];
				if (oColumn && oColumn.getSorted()) {
					oColumn.setSorted(false);
				}
			}
		}

		this.fireAfterPotentialTableChange();
	};

	/**
	 * Operations on sorting are processed sometime directly at the table and sometime not. In case that something has been changed via
	 * Personalization Dialog the consumer of the Personalization Dialog has to apply sorting at the table. In case that sorting has been changed via
	 * user interaction at table, the change is instantly applied at the table.
	 *
	 * @returns {sap.ui.comp.personalization.ChangeType}
	 */
	SortController.prototype.getChangeType = function(oPersistentDataBase, oPersistentDataCompare) {
		if (!oPersistentDataCompare || !oPersistentDataCompare.sort || !oPersistentDataCompare.sort.sortItems) {
			return sap.ui.comp.personalization.ChangeType.Unchanged;
		}
		var bIsDirty = JSON.stringify(oPersistentDataBase.sort.sortItems) !== JSON.stringify(oPersistentDataCompare.sort.sortItems);

		return bIsDirty ? sap.ui.comp.personalization.ChangeType.ModelChanged : sap.ui.comp.personalization.ChangeType.Unchanged;
	};

	/**
	 * Result is XOR based difference = oPersistentDataBase - oPersistentDataCompare
	 *
	 * @param {object} oPersistentDataCompare JSON object. Note: if sortItems is [] then it means that all sortItems have been deleted
	 * @returns {object} JSON object or empty object
	 */
	SortController.prototype.getChangeData = function(oPersistentDataBase, oPersistentDataCompare) {

		if (!oPersistentDataBase || !oPersistentDataBase.sort || !oPersistentDataBase.sort.sortItems) {
			return {
				sort: {
					sortItems: []
				}
			};
		}

		if (!oPersistentDataCompare || !oPersistentDataCompare.sort || !oPersistentDataCompare.sort.sortItems) {
			return {
				sort: Util.copy(oPersistentDataBase.sort)
			};
		}

		if (JSON.stringify(oPersistentDataBase.sort.sortItems) !== JSON.stringify(oPersistentDataCompare.sort.sortItems)) {
			return {
				sort: Util.copy(oPersistentDataBase.sort)
			};
		}
		return null;
	};

	/**
	 * @param {object} oPersistentDataBase: JSON object to which different properties from JSON oPersistentDataCompare are added
	 * @param {object} oPersistentDataCompare: JSON object from where the different properties are added to oPersistentDataBase. Note: if sortItems is []
	 *        then it means that all sortItems have been deleted
	 * @returns {object} new JSON object as union result of oPersistentDataBase and oPersistentDataCompare
	 */
	SortController.prototype.getUnionData = function(oPersistentDataBase, oPersistentDataCompare) {
		// not valid
		if (!oPersistentDataCompare || !oPersistentDataCompare.sort || !oPersistentDataCompare.sort.sortItems) {
			return {
				sort: Util.copy(oPersistentDataBase.sort)
			};
		}

		return {
			sort: Util.copy(oPersistentDataCompare.sort)
		};
	};

	SortController.prototype.determineNeededColumnKeys = function(oPersistentData) {
		var aNeededColumnKeys = [];
		if (!oPersistentData || !oPersistentData.sort || !oPersistentData.sort.sortItems) {
			return {
				sort: []
			};
		}
		oPersistentData.sort.sortItems.forEach(function(oModelColumn) {
			aNeededColumnKeys.push(oModelColumn.columnKey);
		});
		return {
			sort: aNeededColumnKeys
		};
	};

	/**
	 * Cleans up before destruction.
	 *
	 * @private
	 */
	SortController.prototype.exit = function() {
		BaseController.prototype.exit.apply(this, arguments);

		var oTable = this.getTable();
		if (oTable && oTable instanceof sap.ui.table.Table) {
			oTable.detachSort(this._onSort, this);
		}
	};

	return SortController;

}, /* bExport= */true);
