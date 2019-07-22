/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/Element'
], function(jQuery, Element) {
	"use strict";

	/**
	 * The ChartWrapper can be used to wrap a chart.
	 * 
	 * @class Chart Wrapper
	 * @extends sap.ui.core.Element
	 * @author SAP
	 * @version 1.34.0-SNAPSHOT
	 * @alias sap.ui.comp.personalization.ChartWrapper
	 */
	var ChartWrapper = Element.extend("sap.ui.comp.personalization.ChartWrapper",
	/** @lends sap.ui.comp.personalization.ChartWrapper */
	{
		constructor: function(sId, mSettings) {
			Element.apply(this, arguments);
		},
		metadata: {
			library: "sap.ui.comp",
			aggregations: {
				/**
				 * @since 1.34
				 */
				columns: {
					type: "sap.ui.comp.personalization.ColumnWrapper",
					multiple: true,
					singularName: "column"
				}
			},
			associations: {
				/**
				 * Defines original chart object.
				 * 
				 * @since 1.34
				 */
				chart: {
					type: "sap.chart.Chart",
					multiple: false
				}
			}
		}
	});

	ChartWrapper.prototype.getChartObject = function() {
		var oChart = this.getAssociation("chart");
		if (typeof oChart === "string") {
			oChart = sap.ui.getCore().byId(oChart);
		}
		return oChart;
	};
	
	ChartWrapper.prototype.getDomRef = function() {
		var oChart = this.getChartObject();		
		return oChart.getDomRef();
	};
	
	return ChartWrapper;

}, /* bExport= */true);
