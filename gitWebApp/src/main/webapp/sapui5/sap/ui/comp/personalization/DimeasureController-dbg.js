/* eslint-disable strict */

/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides DimeasureController
sap.ui.define([
	'jquery.sap.global', './BaseController', 'sap/m/library', 'sap/ui/comp/library', './ChartWrapper', './Util'
], function(jQuery, BaseController, MLibrary, CompLibrary, ChartWrapper, Util) {
	"use strict";

	/**
	 * The DimeasureController can be used to...
	 *
	 * @class Table Personalization Controller
	 * @extends sap.ui.comp.personalization.BaseController
	 * @author SAP SE
	 * @version 1.44.4
	 * @since 1.34.0
	 * @alias sap.ui.comp.DimeasureController
	 */
	var DimeasureController = BaseController.extend("sap.ui.comp.personalization.DimeasureController", /** @lends sap.ui.comp.personalization.DimeasureController */

	{
		constructor: function(sId, mSettings) {
			BaseController.apply(this, arguments);
			this.setType(sap.m.P13nPanelType.dimeasure);
		},
		metadata: {
			events: {
				afterDimeasureModelDataChange: {}
			}
		}
	});

	DimeasureController.prototype.setTable = function(oTable) {
		BaseController.prototype.setTable.apply(this, arguments);

		if (!(oTable instanceof ChartWrapper)) {
			throw "The provided object is incorrect. 'oTable' has to be an instance of sap.ui.comp.personalization.ChartWrapper. ";
		}

		var oChart = oTable.getChartObject();
		oChart.detachDrilledDown(this._onDrilledDown, this);
		oChart.attachDrilledDown(this._onDrilledDown, this);
		oChart.detachDrilledUp(this._onDrilledUp, this);
		oChart.attachDrilledUp(this._onDrilledUp, this);

		var that = this;
		var fSetChartTypeOrigin = jQuery.proxy(oChart.setChartType, oChart);
		var fSetChartTypeOverwritten = function(sChartType) {
			fSetChartTypeOrigin(sChartType);
			var oModel = that.getModel("$sapuicomppersonalizationBaseController");
			var oData = oModel.getData();
			if (sChartType && sChartType !== oData.persistentData.dimeasure.chartTypeKey) {
				that.fireBeforePotentialTableChange();
				oData.persistentData.dimeasure.chartTypeKey = sChartType;
				that.fireAfterPotentialTableChange();
				that.fireAfterDimeasureModelDataChange();
			}
		};
		if (oChart.setChartType.toString() === fSetChartTypeOverwritten.toString()) {
			// Do nothing if due to recursion the method is already overwritten.
			return;
		}
		oChart.setChartType = fSetChartTypeOverwritten;
	};

	DimeasureController.prototype._onDrilledDown = function(oEvent) {
		this._updateModel(oEvent.getSource());
	};

	DimeasureController.prototype._onDrilledUp = function(oEvent) {
		this._updateModel(oEvent.getSource());
	};

	DimeasureController.prototype._updateModel = function(oChart) {
		var oModel = this.getModel("$sapuicomppersonalizationBaseController");
		var oData = oModel.getData();
		var oColumnKey2ColumnMap = this.getColumnMap();

		this.fireBeforePotentialTableChange();

		// Take over visible dimensions and measures as dimMeasureItems into model
		oData.persistentData.dimeasure.dimeasureItems = [];

		oChart.getVisibleDimensions().forEach(function(sDimensionName) {
			var oColumn = oColumnKey2ColumnMap[sDimensionName];
			oData.persistentData.dimeasure.dimeasureItems.push({
				columnKey: sDimensionName,
				index: oData.persistentData.dimeasure.dimeasureItems.length,
				visible: true,
				role: oColumn.getRole()
			});
		});
		oChart.getVisibleMeasures().forEach(function(sMeasureName) {
			var oColumn = oColumnKey2ColumnMap[sMeasureName];
			oData.persistentData.dimeasure.dimeasureItems.push({
				columnKey: sMeasureName,
				index: oData.persistentData.dimeasure.dimeasureItems.length,
				visible: true,
				role: oColumn.getRole()
			});
		});
		oModel.refresh();

		this.fireAfterPotentialTableChange();

		this.fireAfterDimeasureModelDataChange();
	};

	DimeasureController.prototype.createPersistentStructure = function(aItems) {
		var oPersistentData = BaseController.prototype.createPersistentStructure.apply(this, arguments);
		oPersistentData.dimeasure.chartTypeKey = "";
		return oPersistentData;
	};

	/**
	 * Callback from main controller after OK button has been executed.
	 *
	 * @param {object} oPayload that contains additional information from the panel
	 */
	DimeasureController.prototype.onAfterSubmit = function(oPayload) {
		if (!oPayload || !oPayload.dimeasure) {
			return;
		}
		var oData = this.getModel("$sapuicomppersonalizationBaseController").getData();

		// Take over updated, new added or deleted dimMeasureItems into model
		oData.persistentData.dimeasure.dimeasureItems = [];
		oPayload.dimeasure.dimMeasureItems.forEach(function(oDimMeasureItem) {
			oData.persistentData.dimeasure.dimeasureItems.push({
				columnKey: oDimMeasureItem.getColumnKey(),
				index: oDimMeasureItem.getIndex(),
				visible: oDimMeasureItem.getVisible(),
				role: oDimMeasureItem.getRole()
			});
		});
		oData.persistentData.dimeasure.chartTypeKey = oPayload.dimeasure.chartTypeKey;
		this.getModel("$sapuicomppersonalizationBaseController").refresh();

		// Apply changes to the chart
		BaseController.prototype.onAfterSubmit.apply(this, arguments);
	};

	DimeasureController.prototype.syncJsonModel2Table = function(oJsonModel) {
		var oTable = this.getTable();
		var oChart = oTable.getChartObject();
		var aDimensionItems = [];
		var aMeasureItems = [];
		var fUpdateSelectedEntities = function(aDimeasureItems, aSelectedEntitiesOld, fSetSelectedEntities, fGetDimeasureByName) {
			var aDimeasureItemsCopy = Util.copy(aDimeasureItems);
			aDimeasureItemsCopy.sort(function(a, b) {
				if (a.index < b.index) {
					return -1;
				} else if (a.index > b.index) {
					return 1;
				} else {
					return 0;
				}
			});
			var aSelectedEntitiesNew = [];
			aDimeasureItemsCopy.forEach(function(oDimeasureItem) {
				if (oDimeasureItem.visible === true) {
					aSelectedEntitiesNew.push(oDimeasureItem.columnKey);
					var oDimeasure = fGetDimeasureByName(oDimeasureItem.columnKey);
					if (oDimeasure) {
						oDimeasure.setRole(oDimeasureItem.role);
					}
				}
			});
			if (JSON.stringify(aSelectedEntitiesNew) !== JSON.stringify(aSelectedEntitiesOld)) {
				fSetSelectedEntities(aSelectedEntitiesNew);
			}
		};

		// Apply changes to the Chart
		this.fireBeforePotentialTableChange();

		Util.splitDimeasures(oJsonModel.dimeasure.dimeasureItems, this.getModel("$sapuicomppersonalizationBaseController").getData().transientData.dimeasure.items, aDimensionItems, aMeasureItems);

		var aVisibleDimensions = oChart.getVisibleDimensions();
		fUpdateSelectedEntities(aDimensionItems, aVisibleDimensions, jQuery.proxy(oChart.setVisibleDimensions, oChart), jQuery.proxy(oChart.getDimensionByName, oChart));
		var aVisibleMeasures = oChart.getVisibleMeasures();
		fUpdateSelectedEntities(aMeasureItems, aVisibleMeasures, jQuery.proxy(oChart.setVisibleMeasures, oChart), jQuery.proxy(oChart.getMeasureByName, oChart));

		oChart.setChartType(oJsonModel.dimeasure.chartTypeKey);

		this.fireAfterPotentialTableChange();
	};

	/**
	 * Does a complete JSON snapshot of the current table instance ("original") from the perspective of the columns controller; the JSON snapshot can
	 * later be applied to any table instance to recover all columns related infos of the "original" table
	 *
	 * @returns {objects} JSON objects with meta data from existing table columns
	 */
	DimeasureController.prototype._getTable2Json = function() {
		var oJsonData = this.createPersistentStructure();
		var oTable = this.getTable();
		if (!oTable) {
			return oJsonData;
		}
		var oChart = oTable.getChartObject();
		var aVisibleDimensionNames = oChart.getVisibleDimensions();
		var aVisibleMeasureNames = oChart.getVisibleMeasures();
		var oColumnKey2ColumnMap = this.getColumnMap(true);

		oJsonData.dimeasure.chartTypeKey = oChart.getChartType();

		aVisibleDimensionNames.forEach(function(sDimensionName) {
			var oColumn = oColumnKey2ColumnMap[sDimensionName];
			if (!oColumn) {
				return;
			}
			if (oColumn.getAggregationRole() !== sap.ui.comp.personalization.AggregationRole.Dimension && oColumn.getAggregationRole() !== sap.ui.comp.personalization.AggregationRole.Measure) {
				return;
			}
			oJsonData.dimeasure.dimeasureItems.push({
				columnKey: sDimensionName,
				index: oJsonData.dimeasure.dimeasureItems.length,
				visible: true,
				role: oColumn.getRole()
			});
		});

		aVisibleMeasureNames.forEach(function(sMeasureName) {
			var oColumn = oColumnKey2ColumnMap[sMeasureName];
			if (!oColumn) {
				return;
			}
			if (oColumn.getAggregationRole() !== sap.ui.comp.personalization.AggregationRole.Dimension && oColumn.getAggregationRole() !== sap.ui.comp.personalization.AggregationRole.Measure) {
				return;
			}
			oJsonData.dimeasure.dimeasureItems.push({
				columnKey: sMeasureName,
				index: oJsonData.dimeasure.dimeasureItems.length,
				visible: true,
				role: oColumn.getRole()
			});
		}, this);

		return oJsonData;
	};

	DimeasureController.prototype._getTable2JsonRestore = function() {
		return this._getTable2Json();
	};

	DimeasureController.prototype.syncTable2TransientModel = function() {
		var aItems = [];
		var oTable = this.getTable();
		if (!oTable) {
			return;
		}

		var oColumnKey2ColumnMap = this.getColumnMap(true);
		for ( var sColumnKey in oColumnKey2ColumnMap) {
			var oColumn = oColumnKey2ColumnMap[sColumnKey];
			if (oColumn.getAggregationRole() === sap.ui.comp.personalization.AggregationRole.NotDimeasure) {
				continue;
			}
			aItems.push({
				columnKey: sColumnKey,
				text: oColumn.getLabel(),
				tooltip: oColumn.getTooltip(),
				// visible: oColumn.getSelected(),
				aggregationRole: oColumn.getAggregationRole()
			});
		}

		// check if Items was changed at all and take over if it was changed
		var aItemsBefore = this.getModel("$sapuicomppersonalizationBaseController").getData().transientData.dimeasure.items;
		if (jQuery(aItems).not(aItemsBefore).length !== 0 || jQuery(aItemsBefore).not(aItems).length !== 0) {
			this.getModel("$sapuicomppersonalizationBaseController").getData().transientData.dimeasure.items = aItems;
		}
	};

	/**
	 * Returns a ColumnsPanel control
	 *
	 * @returns {sap.m.P13nDimMeasurePanel} returns a new created ColumnsPanel
	 */
	DimeasureController.prototype.getPanel = function(oPayload) {

		sap.ui.getCore().loadLibrary("sap.m");
		jQuery.sap.require("sap/m/P13nDimMeasurePanel");
		jQuery.sap.require("sap/m/P13nItem");
		jQuery.sap.require("sap/m/P13nDimMeasureItem");

		var that = this;
		var aAvailableChartTypes = [];
		if (oPayload && oPayload.availableChartTypes) {
			aAvailableChartTypes = oPayload.availableChartTypes;
		}
		var oPanel = new sap.m.P13nDimMeasurePanel({
			availableChartTypes: aAvailableChartTypes,
			chartTypeKey: "{$sapmP13nPanel>/persistentData/dimeasure/chartTypeKey}",
			items: {
				path: '$sapmP13nPanel>/transientData/dimeasure/items',
				template: new sap.m.P13nItem({
					columnKey: '{$sapmP13nPanel>columnKey}',
					text: '{$sapmP13nPanel>text}',
					tooltip: '{$sapmP13nPanel>tooltip}',
					aggregationRole: '{$sapmP13nPanel>aggregationRole}'
				})
			},
			dimMeasureItems: {
				path: "$sapmP13nPanel>/persistentData/dimeasure/dimeasureItems",
				template: new sap.m.P13nDimMeasureItem({
					columnKey: "{$sapmP13nPanel>columnKey}",
					index: "{$sapmP13nPanel>index}",
					visible: "{$sapmP13nPanel>visible}",
					role: "{$sapmP13nPanel>role}"
				})
			},
			beforeNavigationTo: that.setModelFunction()
		});
		return oPanel;
	};

	DimeasureController.prototype._isDimMeasureItemEqual = function(oDimMeasureItemA, oDimMeasureItemB) {
		if (!oDimMeasureItemA && !oDimMeasureItemB) {
			return true;
		}
		if (oDimMeasureItemA && !oDimMeasureItemB) {
			if (oDimMeasureItemA.index === -1 && oDimMeasureItemA.visible === false) {
				return true;
			}
			return false;
		}
		if (oDimMeasureItemB && !oDimMeasureItemA) {
			if (oDimMeasureItemB.index === -1 && oDimMeasureItemB.visible === false) {
				return true;
			}
			return false;
		}
		for ( var property in oDimMeasureItemA) {
			if (oDimMeasureItemB[property] === undefined || oDimMeasureItemA[property] !== oDimMeasureItemB[property]) {
				return false;
			}
		}
		return true;
	};

	DimeasureController.prototype._isSemanticEqual = function(oPersistentDataBase, oPersistentData) {
		if (oPersistentDataBase.dimeasure.chartTypeKey !== oPersistentData.dimeasure.chartTypeKey) {
			return false;
		}
		var fSort = function(a, b) {
			if (a.visible === true && (b.visible === false || b.visible === undefined)) {
				return -1;
			} else if ((a.visible === false || a.visible === undefined) && b.visible === true) {
				return 1;
			} else if (a.visible === true && b.visible === true) {
				if (a.index < b.index) {
					return -1;
				} else if (a.index > b.index) {
					return 1;
				} else {
					return 0;
				}
			} else if ((a.visible === false || a.visible === undefined) && (b.visible === false || b.visible === undefined)) {
				if (a.columnKey < b.columnKey) {
					return -1;
				} else if (a.columnKey > b.columnKey) {
					return 1;
				} else {
					return 0;
				}
			}
		};
		var aDimeasureItemsBase = Util.copy(oPersistentDataBase.dimeasure.dimeasureItems).sort(fSort);
		var aDimeasureItems = Util.copy(oPersistentData.dimeasure.dimeasureItems).sort(fSort);
// if (aDimeasureItems.length !== aDimeasureItemsBase.length) {
// return false;
// }
		var bIsEqual = true;
		aDimeasureItemsBase.some(function(oDimeasureItem, iIndex) {
			if (!this._isDimMeasureItemEqual(oDimeasureItem, aDimeasureItems[iIndex])) {
				bIsEqual = false;
				return true;
			}
		}, this);
		return bIsEqual;
	};

	/**
	 * Operations on columns are processed every time directly at the table. In case that something has been changed via Personalization Dialog or via
	 * user interaction at table, change is applied to the table.
	 *
	 * @param {object} oPersistentDataBase (new) JSON object
	 * @param {object} oPersistentDataCompare (old) JSON object
	 * @returns {object} that represents the change type, like: Unchanged || TableChanged || ModelChanged
	 */
	DimeasureController.prototype.getChangeType = function(oPersistentDataBase, oPersistentDataCompare) {
		if (!oPersistentDataCompare || !oPersistentDataCompare.dimeasure || !oPersistentDataCompare.dimeasure.dimeasureItems) {
			return sap.ui.comp.personalization.ChangeType.Unchanged;
		}
		return this._isSemanticEqual(oPersistentDataBase, oPersistentDataCompare) ? sap.ui.comp.personalization.ChangeType.Unchanged : sap.ui.comp.personalization.ChangeType.TableChanged;
	};

	/**
	 * Result is XOR based difference = oPersistentDataBase - oPersistentDataCompare (new - old)
	 *
	 * @param {object} oPersistentDataBase (new) JSON object which represents the current model state (Restore+PersistentData)
	 * @param {object} oPersistentDataCompare (old) JSON object which represents AlreadyKnown || Restore
	 * @returns {object} JSON object or null
	 */
	DimeasureController.prototype.getChangeData = function(oPersistentDataBase, oPersistentDataCompare) {

		if (!oPersistentDataBase || !oPersistentDataBase.dimeasure || !oPersistentDataBase.dimeasure.dimeasureItems) {
			return this.createPersistentStructure();
		}

		if (!oPersistentDataCompare || !oPersistentDataCompare.dimeasure || !oPersistentDataCompare.dimeasure.dimeasureItems) {
			return {
				chartTypeKey: oPersistentDataBase.dimeasure.chartTypeKey,
				dimeasure: Util.copy(oPersistentDataBase.dimeasure)
			};
		}
		if (!this._isSemanticEqual(oPersistentDataBase, oPersistentDataCompare)) {
			return {
				chartTypeKey: oPersistentDataBase.dimeasure.chartTypeKey,
				dimeasure: Util.copy(oPersistentDataBase.dimeasure)
			};
		}
		return null;
	};

	/**
	 * @param {object} oDataOld: JSON object to which different properties from oDataNew are added. E.g. Restore
	 * @param {object} oDataNew: JSON object from where the different properties are added to oDataOld. E.g. CurrentVariant || PersistentData
	 * @returns {object} new JSON object as union result of oDataOld and oPersistentDataCompare
	 */
	DimeasureController.prototype.getUnionData = function(oDataOld, oDataNew) {
		if (!oDataNew || !oDataNew.dimeasure || !oDataNew.dimeasure.dimeasureItems) {
			return {
				chartTypeKey: oDataOld.dimeasure.chartTypeKey,
				dimeasure: Util.copy(oDataOld.dimeasure)
			};
		}
		return {
			dimeasure: {
				chartTypeKey: oDataNew.dimeasure.chartTypeKey ? oDataNew.dimeasure.chartTypeKey : oDataOld.dimeasure.chartTypeKey,
				dimeasureItems: Util.copy(oDataNew.dimeasure.dimeasureItems)
			}
		};
	};

	DimeasureController.prototype.determineNeededColumnKeys = function(oPersistentData) {
		var aNeededColumnKeys = [];
		if (!oPersistentData || !oPersistentData.dimeasure || !oPersistentData.dimeasure.dimeasureItems) {
			return {
				dimeasure: []
			};
		}
		oPersistentData.dimeasure.dimeasureItems.forEach(function(oModelColumn) {
			aNeededColumnKeys.push(oModelColumn.columnKey);
		});
		return {
			dimeasure: aNeededColumnKeys
		};
	};

	/**
	 * Cleans up before destruction.
	 *
	 * @private
	 */
	DimeasureController.prototype.exit = function() {
		BaseController.prototype.exit.apply(this, arguments);

		var oTable = this.getTable();
		if (oTable) {
			var oChart = oTable.getChartObject();
			if (oChart) {
				oChart.detachDrilledDown(this._onDrilledDown, this);
				oChart.detachDrilledUp(this._onDrilledUp, this);
			}
		}
	};

	/* eslint-enable strict */

	return DimeasureController;

}, /* bExport= */true);
