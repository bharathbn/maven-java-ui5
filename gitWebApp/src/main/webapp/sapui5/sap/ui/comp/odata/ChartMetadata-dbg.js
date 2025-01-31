/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// ---------------------------------------------------------------------------------
// Class used to determine/retrieve UI chart type based on the annotation chart type
// ---------------------------------------------------------------------------------
sap.ui.define([], function() {
	"use strict";

	var mUi5ChartTypeForAnnotationChartType = {
		"com.sap.vocabularies.UI.v1.ChartType/Waterfall": "column",
		"com.sap.vocabularies.UI.v1.ChartType/Column": "column",
		"com.sap.vocabularies.UI.v1.ChartType/AreaStacked": "stacked_column",
		"com.sap.vocabularies.UI.v1.ChartType/ColumnStacked": "stacked_column",
		"com.sap.vocabularies.UI.v1.ChartType/ColumnDual": "dual_column",
		"com.sap.vocabularies.UI.v1.ChartType/ColumnStackedDual": "dual_stacked_column",
		"com.sap.vocabularies.UI.v1.ChartType/AreaStacked100": "100_stacked_column",
		"com.sap.vocabularies.UI.v1.ChartType/ColumnStacked100": "100_stacked_column",
		"com.sap.vocabularies.UI.v1.ChartType/ColumnStackedDual100": "100_dual_stacked_column",
		"com.sap.vocabularies.UI.v1.ChartType/HorizontalArea": "bar",
		"com.sap.vocabularies.UI.v1.ChartType/Bar": "bar",
		"com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked": "stacked_bar",
		"com.sap.vocabularies.UI.v1.ChartType/BarStacked": "stacked_bar",
		"com.sap.vocabularies.UI.v1.ChartType/BarDual": "dual_bar",
		"com.sap.vocabularies.UI.v1.ChartType/BarStackedDual": "dual_stacked_bar",
		"com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked100": "100_stacked_bar",
		"com.sap.vocabularies.UI.v1.ChartType/BarStacked100": "100_stacked_bar",
		"com.sap.vocabularies.UI.v1.ChartType/BarStackedDual100": "100_dual_stacked_bar",
		"com.sap.vocabularies.UI.v1.ChartType/Radar": "line",
		"com.sap.vocabularies.UI.v1.ChartType/Area": "line",
		"com.sap.vocabularies.UI.v1.ChartType/Line": "line",
		"com.sap.vocabularies.UI.v1.ChartType/LineDual": "dual_line",
		"com.sap.vocabularies.UI.v1.ChartType/Combination": "combination",
		"com.sap.vocabularies.UI.v1.ChartType/CombinationStacked": "stacked_combination",
		"com.sap.vocabularies.UI.v1.ChartType/CombinationDual": "dual_combination",
		"com.sap.vocabularies.UI.v1.ChartType/CombinationStackedDual": "dual_stacked_combination",
		"com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationStacked": "horizontal_stacked_combination",
		"com.sap.vocabularies.UI.v1.ChartType/Pie": "pie",
		"com.sap.vocabularies.UI.v1.ChartType/Donut": "donut",
		"com.sap.vocabularies.UI.v1.ChartType/Scatter": "scatter",
		"com.sap.vocabularies.UI.v1.ChartType/Bubble": "bubble",
		"com.sap.vocabularies.UI.v1.ChartType/HeatMap": "heatmap",
		"com.sap.vocabularies.UI.v1.ChartType/TreeMap": "treemap",
		"com.sap.vocabularies.UI.v1.ChartType/Bullet": "bullet",
		"com.sap.vocabularies.UI.v1.ChartType/VerticalBullet": "vertical_bullet"
	};

	var mMeasureRole = {
		"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1": "axis1",
		"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis2": "axis2",
		"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis3": "axis3"
	};

	var mDinemsionRole = {
		"com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Category": "category",
		"com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Series": "series"
	};

	/**
	 * Object used to determine/retrieve UI5 chart metadata based on the annotation chart metadata
	 * 
	 * @private
	 * @experimental This module is only for internal/experimental use!
	 */
	var ChartMetadata = {
		/**
		 * Get the UI5 chart type based on Annotation chart type
		 * 
		 * @public
		 * @param {string} sType - The Annotation chart type
		 * @returns {string} the UI5 chart type (if found)
		 */
		getChartType: function(sType) {
			return mUi5ChartTypeForAnnotationChartType[sType];
		},
		/**
		 * Get the UI5 measure role based on Annotation measure role
		 * 
		 * @public
		 * @param {string} sRole - The Annotation measure role
		 * @returns {string} the UI5 measure role (if found)
		 */
		getMeasureRole: function(sRole) {
			return mMeasureRole[sRole];
		},
		/**
		 * Get the UI5 dimension role based on Annotation dimension role
		 * 
		 * @public
		 * @param {string} sType - The Annotation dimension role
		 * @returns {string} the UI5 dimension role (if found)
		 */
		getDimensionRole: function(sRole) {
			return mDinemsionRole[sRole];
		}
	};

	return ChartMetadata;

}, /* bExport= */true);
