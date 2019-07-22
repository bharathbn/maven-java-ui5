/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element'],
	function(jQuery, library, Element) {
	"use strict";

	/**
	 * Constructor for the bar element of the InteractiveBarChart.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class A bar element for the InteractiveBarChart.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 *
	 * @public
	 * @experimental Since 1.42.0 This element is currently under development. The API could be changed at any point in time.
	 * @constructor
	 * @alias sap.suite.ui.microchart.InteractiveBarChartBar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var InteractiveBarChartBar = Element.extend("sap.suite.ui.microchart.InteractiveBarChartBar", /** @lends sap.suite.ui.microchart.InteractiveBarChartBar.prototype */ {
		metadata : {
			library : "sap.suite.ui.microchart",
			properties : {
				/**
				 * The label for the chart bar
				 */
				label : {
					type : "string",
					group : "Misc",
					defaultValue : null
				},
				/**
				 * Determines if the chart bar is in selected state
				 */
				selected : {
					type : "boolean",
					group : "Appearance",
					defaultValue : false
				},
				/**
				 * The value label to be displayed on the bar in the chart
				 */
				displayedValue : {
					type : "string",
					group : "Data",
					defaultValue : null
				},
				/**
				 * The numeric value of the chart bar to be displayed on bar
				 */
				value : {
					type : "float",
					group : "Data"
				}
			}
		}
	});

	InteractiveBarChartBar.prototype.init = function() {
		this._bNullValue = true;
	};

	InteractiveBarChartBar.prototype.validateProperty = function(sPropertyName, oValue) {
		if (sPropertyName === "value" && (oValue === null || oValue === undefined || oValue < 0 || isNaN(oValue))) {
			this._bNullValue = true;
		} else if (sPropertyName === "value") {
			this._bNullValue = false;
		}
		return Element.prototype.validateProperty.apply(this, arguments);
	};
	return InteractiveBarChartBar;
});