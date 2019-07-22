/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

// This control displays the history of values as a line mini chart or an area mini chart.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element'],
	function(jQuery, library, Element) {
	"use strict";

	/**
	 * Constructor for a new AreaMicroChart control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Displays or hides the labels for start and end dates, start and end values, and minimum and maximum values.
	 * @extends sap.ui.core.Control
	 *
	 * @version 1.44.4
	 *
	 * @public
	 * @alias sap.suite.ui.microchart.AreaMicroChartLabel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AreaMicroChartLabel = Element.extend("sap.suite.ui.microchart.AreaMicroChartLabel", /** @lends sap.suite.ui.microchart.AreaMicroChartLabel.prototype */ {
			metadata : {
				library : "sap.suite.ui.microchart",
				properties : {

					/**
					 * The graphic element color.
					 */
					color: { group: "Misc", type: "sap.m.ValueColor", defaultValue: "Neutral" },

					/**
					 * The line title.
					 */
					label: {type : "string", group : "Misc", defaultValue : "" }
				}
		}
	});

	return AreaMicroChartLabel;
});