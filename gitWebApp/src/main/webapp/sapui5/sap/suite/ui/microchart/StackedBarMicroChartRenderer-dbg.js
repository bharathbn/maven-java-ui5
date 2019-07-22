/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

sap.ui.define(['jquery.sap.global', 'sap/m/ValueColor'],
	function(jQuery, ValueColor) {
	"use strict";

	/**
	 * StackedBarMicroChart renderer.
	 * @namespace
	 */
	var StackedBarMicroChartRenderer = {};

	StackedBarMicroChartRenderer.LABEL_COLOR_LIGHT = "#ffffff";
	StackedBarMicroChartRenderer.LABEL_COLOR_DARK = "#000000";

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 */
	StackedBarMicroChartRenderer.render = function (oRm, oControl) {
		var aChartData = oControl._calculateChartData();

		if (!oControl._bThemeApplied) {
			return;
		}
		this._aBars = oControl.getAggregation("bars");
		oRm.write("<div");
		oRm.writeControlData(oControl);
		if (oControl.hasListeners("press")) {
			oRm.writeAttribute("tabindex", "0");
			oRm.addClass("sapSuiteUiMicroChartPointer");
		}
		oRm.addClass("sapSuiteStackedMC");
		oRm.addClass("sapSuiteStackedMCSize" + oControl.getSize());
		oRm.writeClasses();

		// tooltip and aria label
		var sTooltip = oControl._getTooltip(aChartData);
		if (sTooltip && typeof sTooltip === "string") {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.writeAttribute("role", "presentation");
		oRm.writeAttributeEscaped("aria-label", oControl._createTooltipText(aChartData));

		oRm.writeStyles();
		oRm.write(">");
		this._renderInnerContent(oRm, oControl, aChartData);
		oRm.write("</div>");
	};

	/**
	 * Renders the control's inner content, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @param {Object} chartData The calculated data needed for the chart to be displayed
	 */
	StackedBarMicroChartRenderer._renderInnerContent = function(oRm, oControl, chartData) {
		for (var i = 0; i < chartData.length; i++) {
			this._renderChartBar(oRm, oControl, chartData[i], i, i === chartData.length - 1);
		}
	};

	/**
	 * Renders the bar area for the given control.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @param {Object} dataBar The calculated data needed for the bar to be displayed
	 * @param {int} index The index inside bars aggregation
	 * @param {Boolean} isLastBar Flag indicating if the current bar is the last bar inside bars aggregation
	 */
	StackedBarMicroChartRenderer._renderChartBar = function(oRm, oControl, dataBar, index, isLastBar) {
		var sColor;
		if (dataBar.width > 0) {
			oRm.write("<div");
			oRm.addClass("sapSuiteStackedMCBar");
			if (!isLastBar) {
				oRm.addClass("sapSuiteStackedMCBarNoLast");
			}
			if (!dataBar.color) {
				oRm.addStyle("background-color", "transparent");
			} else if (ValueColor[dataBar.color]) {
				oRm.addClass("sapSuiteStackedMCBarSemanticColor" + dataBar.color);
				sColor = sap.ui.core.theming.Parameters.get(this._getValueCssParameter(dataBar.color));
			} else {
				sColor = sap.ui.core.theming.Parameters.get(dataBar.color);
				if (!sColor) {
					sColor = dataBar.color;
				}
				oRm.addStyle("background-color", sColor);
			}
			oRm.addStyle("width", dataBar.width + "%");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");
			if (sColor) {
				this._renderChartBarLabel(oRm, oControl, dataBar.displayValue, sColor);
			}
			oRm.write("</div>");
		}
	};

	/**
	 * Renders the label text for the current bar area.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @param {String} displayValue The value that should be displayed
	 * @param {String} backgroundColor The background color of the current bar area
	 */
	StackedBarMicroChartRenderer._renderChartBarLabel = function(oRm, oControl, displayValue, backgroundColor) {
		if (!displayValue) {
			return;
		}
		oRm.write("<div");
		oRm.addClass("sapSuiteStackedMCBarLabel");
		oRm.writeClasses();
		oRm.addStyle("color", this._getLabelColor(backgroundColor));
		oRm.writeStyles();
		oRm.write(">");
		oRm.writeEscaped(displayValue);
		oRm.write("</div>");
	};

	/**
	 * Returns the color value of the label by calculating the data point color brightness
	 *
	 * @private
	 * @param {string} backgroundColor The background color
	 * @returns {string} The color of the label
	 */
	StackedBarMicroChartRenderer._getLabelColor = function(backgroundColor) {
		var iRedValue = parseInt(backgroundColor.substring(1, 3), 16),
			iGreenValue = parseInt(backgroundColor.substring(3, 5), 16),
			iBlueValue = parseInt(backgroundColor.substring(5, 7), 16);

		// apply the data point color brightness algorithm
		var fDataPoint = ((iRedValue * 299) + (iGreenValue * 587) + (iBlueValue * 114)) / 1000;
		if (fDataPoint > 127.5) {
			return StackedBarMicroChartRenderer.LABEL_COLOR_DARK;
		} else {
			return StackedBarMicroChartRenderer.LABEL_COLOR_LIGHT;
		}
	};

	/**
	 * Returns the color css parameter
	 *
	 * @private
	 * @param {string} color The bar color
	 * @returns {string} The css parameter
	 */
	StackedBarMicroChartRenderer._getValueCssParameter = function(color) {
		var sColor = color;
		if (sColor === "Error") {
			sColor = "Bad";
		}
		return "sapUiChartPaletteSemantic" + sColor;
	};

	return StackedBarMicroChartRenderer;

}, /* bExport= */ true);