/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element'],
	function(jQuery, library, Element) {
	"use strict";

	/**
	 * Constructor for the point element of the InteractiveLineChart.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class A point element for the InteractiveLineChart.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 *
	 * @public
	 * @experimental Since 1.42.0 This is currently under development. The API could be changed at any point in time.
	 * @constructor
	 * @alias sap.suite.ui.microchart.InteractiveLineChartPoint
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var InteractiveLineChartPoint = Element.extend("sap.suite.ui.microchart.InteractiveLineChartPoint", /** @lends sap.suite.ui.microchart.InteractiveLineChartPoint.prototype */ {
		metadata : {
			library : "sap.suite.ui.microchart",
			properties : {
				/**
				 * The bottom label for the chart point
				 */
				label : {
					type : "string",
					group : "Misc",
					defaultValue : null
				},
				/**
				 * Determines if the chart point is in selected state
				 */
				selected : {
					type : "boolean",
					group : "Appearance",
					defaultValue : false
				},
				/**
				 * The numeric value of the chart point
				 */
				value : {
					type : "float",
					group : "Data",
					defaultValue : null
				},
				/**
				 * The value label to be displayed near the point in the chart
				 */
				displayedValue : {
					type : "string",
					group : "Data",
					defaultValue : null
				}
			}
		}
	});

	InteractiveLineChartPoint.prototype.init = function() {
		this._bNullValue = true;
	};

	InteractiveLineChartPoint.prototype.validateProperty = function(sPropertyName, oValue) {
		if (sPropertyName === "value" && (oValue === null || oValue === undefined)) {
			this._bNullValue = true;
		} else if (sPropertyName === "value") {
			this._bNullValue = false;
		}
		return Element.prototype.validateProperty.apply(this, arguments);
	};

	return InteractiveLineChartPoint;
});
