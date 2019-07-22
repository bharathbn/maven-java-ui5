/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element', 'sap/m/Label'],
	function(jQuery, library, Element, Label) {
	"use strict";

	/**
	 * Constructor for InteractiveDonutChartSegment element.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new element
	 *
	 * @class A donut chart segment.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 *
	 * @public
	 * @alias sap.suite.ui.microchart.InteractiveDonutChartSegment
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var InteractiveDonutChartSegment = Element.extend("sap.suite.ui.microchart.InteractiveDonutChartSegment", /** @lends sap.suite.ui.microchart.InteractiveDonutChartSegment.prototype */ {
		metadata : {
			library : "sap.suite.ui.microchart",
			properties : {
				/**
				 * Displayed text for the segment.
				 */
				"label" : { type : "string", group : "Misc", defaultValue : null },
				/**
				 * Indicator for the selected state.
				 */
				"selected" : { type : "boolean", group : "Appearance", defaultValue : false },
				/**
				 * The value representing a percentage or an absolute value.
				 */
				"value" : { type : "float", group : "Data", defaultValue : null },
				/**
				 * The value that is directly displayed on the legend.
				 */
				"displayedValue" : { type : "string", group : "Data", defaultValue: null }
			}
		}
	});

	InteractiveDonutChartSegment.prototype.init = function() {
		this._bNullValue = true;
	};

	InteractiveDonutChartSegment.prototype.validateProperty = function(sPropertyName, oValue) {
		if (sPropertyName === "value") {
			this._bNullValue = (oValue === null) || (typeof oValue === "undefined");
		}
		return Element.prototype.validateProperty.apply(this, arguments);
	};

	return InteractiveDonutChartSegment;
});
