/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/Element'
], function(jQuery, Element) {
	"use strict";

	/**
	 * The ColumnWrapper can be used to wrap a chart.
	 * 
	 * @class Chart Wrapper
	 * @extends sap.ui.core.Control
	 * @author SAP
	 * @version 1.34.0-SNAPSHOT
	 * @alias sap.ui.comp.personalization.ColumnWrapper
	 */
	var ColumnWrapper = Element.extend("sap.ui.comp.personalization.ColumnWrapper",
	/** @lends sap.ui.comp.personalization.ColumnWrapper */
	{
		constructor: function(sId, mSettings) {
			Element.apply(this, arguments);
		},
		metadata: {
			library: "sap.ui.comp",
			properties: {
				/**
				 * Defines label to be displayed for the column.
				 * 
				 * @since 1.34.0
				 */
				label: {
					type: "string"
				},

				/**
				 * Defines tooltip of column.
				 * 
				 * @since 1.34.0
				 */
				tooltip: {
					type: "string"
				},

// /**
// * Defines visibility of column.
// *
// * @since 1.34.0
// */
// visible: {
// type: "boolean",
// defaultValue: true
// },

				/**
				 * Defines selection of column.
				 * 
				 * @since 1.34.0
				 */
				selected: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the type of column. Supported values are: "dimension", "measure" and "notDimeasure".
				 * 
				 * @since 1.34.0
				 */
				aggregationRole: {
					type: "sap.ui.comp.personalization.AggregationRole"
				},

				/**
				 * Defines the role of column. Supported values are: "axis1", "axis2" or "axis3" in case of measure and "category" or "series" in case
				 * of dimension.
				 * 
				 * @since 1.34.0
				 */
				role: {
					type: "string"
				}
			}
		}
	});

	return ColumnWrapper;

}, /* bExport= */true);
