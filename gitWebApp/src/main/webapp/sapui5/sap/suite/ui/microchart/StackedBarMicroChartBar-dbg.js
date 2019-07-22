/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

// Provides sap.suite.ui.microchart.StackedBarMicroChartBar control.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element', "sap/m/ValueCSSColor"],
	function(jQuery, library, Element, ValueCSSColor) {
	"use strict";

	/**
	 * Constructor for a new StackedBarMicroChartBar.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Contains the values of the stacked bar chart.
	 * @extends sap.ui.core.Element
	 *
	 * @version 1.44.4
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.microchart.StackedBarMicroChartBar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var StackedBarMicroChartBar = Element.extend("sap.suite.ui.microchart.StackedBarMicroChartBar", /** @lends sap.suite.ui.microchart.StackedBarMicroChartBar.prototype */ {
		metadata : {
			library: "sap.suite.ui.microchart",
			properties: {
				/**
				 * The value for stacked bar chart. It is used in order to determine the width of the bar
				 */
				value: {type: "float", group: "Data", defaultValue: "0"},

				/**
				 * The color of the bar.
				 */
				valueColor: {type: "sap.m.ValueCSSColor", group: "Appearance", defaultValue: null},

				/**
				 * If this property is set, then it will be displayed instead of value.
				 */
				displayValue: {type: "string", group: "Data", defaultValue: null}
			}
		}
	});

	StackedBarMicroChartBar.prototype.setValue = function(fValue, bSuppressInvalidate) {
		var bIsValueSet = jQuery.isNumeric(fValue);
		return this.setProperty("value", bIsValueSet ? fValue : NaN, bSuppressInvalidate);
	};

	StackedBarMicroChartBar.prototype.setValueColor = function(sValue, bSuppressInvalidate) {
		var bIsValueSet = ValueCSSColor.isValid(sValue);
		return this.setProperty("valueColor", bIsValueSet ? sValue : null, bSuppressInvalidate);
	};

	return StackedBarMicroChartBar;

});