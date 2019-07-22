/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

sap.ui.define(['jquery.sap.global'],
	function() {
	"use strict";

	/**
	 * BulletMicroChart renderer.
	 * @namespace
	 */
	var BulletMicroChartRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm
	 *            the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl
	 *            the control to be rendered
	 */
	BulletMicroChartRenderer.render = function(oRm, oControl) {
		if (!oControl._bThemeApplied) {
			return;
		}
		var oChartData = oControl._calculateChartData();
		var fForecastValuePct = +oChartData.forecastValuePct;
		var sSize;
		if (oControl.getIsResponsive()) {
			sSize = "sapSuiteBMCResponsive";
		} else {
			sSize = "sapSuiteBMCSize" + oControl.getSize();
		}
		var sScale = oControl.getScale();
		var bRtl = sap.ui.getCore().getConfiguration().getRTL();
		var sOrientation = bRtl ? "right" : "left";
		var sMode = "sapSuiteBMCModeType" + oControl.getMode();
		var sDeltaValue = ("sapSuiteBMCModeType" + sap.suite.ui.microchart.BulletMicroChartModeType.Delta == sMode) ? oControl._calculateDeltaValue() : 0;
		var bIsActualSet = oControl.getActual() && oControl.getActual()._isValueSet;
		var sSizeXSClass = "sapSuiteBMCSize" + sap.m.Size.XS;
		var bShowActualValue = oControl.getShowActualValue() && (sSizeXSClass !== sSize) && ("sapSuiteBMCModeType" + sap.suite.ui.microchart.BulletMicroChartModeType.Actual === sMode);
		var bShowDeltaValue = oControl.getShowDeltaValue() && (sSizeXSClass !== sSize) && ("sapSuiteBMCModeType" + sap.suite.ui.microchart.BulletMicroChartModeType.Delta === sMode);
		var bShowTargetValue = oControl.getShowTargetValue() && (sSizeXSClass !== sSize);
		var sActualValueLabel = oControl.getActualValueLabel();
		var sDeltaValueLabel = oControl.getDeltaValueLabel();
		var sTargetValueLabel = oControl.getTargetValueLabel();
		var aData = oControl.getThresholds();
		var sTooltip = oControl.getTooltip_AsString();
		if (typeof sTooltip !== "string") {
			sTooltip = "";
		}
		if (bIsActualSet) {
			var sSemanticColor = "sapSuiteBMCSemanticColor" + oControl.getActual().getColor();
		}

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapSuiteBMC");
		oRm.addClass("sapSuiteBMCContent");
		oRm.addClass(sSize);
		if (oControl.hasListeners("press")) {
			oRm.addClass("sapSuiteUiMicroChartPointer");
			oRm.writeAttribute("tabindex", "0");
		}
		oRm.writeAttribute("role", "presentation");
		oRm.writeAttributeEscaped("aria-label", oControl.getAltText().replace(/\s/g, " ") + (sap.ui.Device.browser.firefox ? "" : " " + sTooltip ));
		if (!oControl.getIsResponsive()){
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		oRm.writeClasses();

		if (oControl.getWidth()) {
			oRm.addStyle("width", oControl.getWidth());
			oRm.writeStyles();
		}
		oRm.writeAttribute("id", oControl.getId() + "-bc-content");
		oRm.write(">");

		oRm.write("<div");
		oRm.addClass("sapSuiteBMCVerticalAlignmentContainer");
		oRm.addClass("sapSuiteBMCWholeControl");
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.addClass("sapSuiteBMCChart");
		oRm.addClass(sSize);
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-bc-chart");
		if (oControl.getIsResponsive()) {
			// tooltip has been moved to this container to avoid that the tooltip is being shown on the empty space that results from the vertical alignment.
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.write(">");
		var sValScale = "";
		oRm.write("<div");
		oRm.addClass("sapSuiteBMCTopLabel");
		oRm.writeClasses();
		oRm.write(">");
		if (bIsActualSet && bShowActualValue) {
			var sAValToShow = (sActualValueLabel) ? sActualValueLabel : "" + oControl.getActual().getValue();
			sValScale = sAValToShow + sScale;
			oRm.write("<div");
			oRm.addClass("sapSuiteBMCItemValue");
			oRm.addClass(sSemanticColor);
			oRm.addClass(sSize);
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.writeAttribute("id", oControl.getId() + "-bc-item-value");
			oRm.write(">");
			oRm.writeEscaped(sValScale);
			oRm.write("</div>");
		} else if (bIsActualSet && oControl._isTargetValueSet && bShowDeltaValue) {
			var sDValToShow = (sDeltaValueLabel) ? sDeltaValueLabel : "" + sDeltaValue;
			sValScale = sDValToShow + sScale;
			oRm.write("<div");
			oRm.addClass("sapSuiteBMCItemValue");
			oRm.addClass(sSemanticColor);
			oRm.addClass(sSize);
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.writeAttribute("id", oControl.getId() + "-bc-item-value");
			oRm.write(">");
			oRm.write("&Delta;");
			oRm.writeEscaped(sValScale);
			oRm.write("</div>");
		}
		oRm.write("</div>");
		oRm.write("<div");
		oRm.addClass("sapSuiteBMCChartCanvas");
		oRm.writeClasses();
		oRm.write(">");
		for (var i = 0; i < oChartData.thresholdsPct.length; i++) {
			if (aData[i]._isValueSet) {
				this.renderThreshold(oRm,  oControl, oChartData.thresholdsPct[i]);
			}
		}

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-chart-bar");
		oRm.addClass("sapSuiteBMCBar");
		oRm.addClass(sSize);
		oRm.addClass("sapSuiteBMCScaleColor" + oControl.getScaleColor());
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");

		if (oControl._isForecastValueSet && sMode == "sapSuiteBMCModeTypeActual") {
			oRm.write("<div");
			oRm.addClass("sapSuiteBMCForecastBarValue");
			oRm.addClass(sSemanticColor);
			oRm.addClass(sSize);
			oRm.writeClasses();
			oRm.addStyle("width", fForecastValuePct + "%");
			oRm.writeStyles();
			oRm.writeAttribute("id", oControl.getId() + "-forecast-bar-value");
			oRm.write("></div>");
		}

		if (bIsActualSet) {
			oRm.write("<div");
			oRm.addClass("sapSuiteBMCBarValueMarker");
			oRm.addClass(sMode);
			if (!oControl.getShowValueMarker()) {
				oRm.addClass("sapSuiteBMCBarValueMarkerHidden");
			}
			oRm.addClass(sSemanticColor);
			oRm.addClass(sSize);
			oRm.writeClasses();
			oRm.addStyle(sOrientation, parseFloat(oChartData.actualValuePct) + parseFloat(1) + "%");
			if (sMode == "sapSuiteBMCModeTypeDelta" && oChartData.actualValuePct <= oChartData.targetValuePct) {
				oRm.addStyle("margin", "0");
			}
			oRm.writeStyles();
			oRm.writeAttribute("id", oControl.getId() + "-bc-bar-value-marker");
			oRm.write("></div>");

			if (sMode == "sapSuiteBMCModeTypeActual") {
				oRm.write("<div");
				oRm.addClass("sapSuiteBMCBarValue");
				oRm.addClass(sSemanticColor);
				oRm.addClass(sSize);
				if (oControl._isForecastValueSet) {
					oRm.addClass("sapSuiteBMCForecast");
				}
				oRm.writeClasses();
				oRm.addStyle("width", oChartData.actualValuePct + "%");
				oRm.writeStyles();
				oRm.writeAttribute("id", oControl.getId() + "-bc-bar-value");
				oRm.write("></div>");
			} else if (oControl._isTargetValueSet && sMode == "sapSuiteBMCModeTypeDelta") {
				oRm.write("<div");
				oRm.addClass("sapSuiteBMCBarValue");
				oRm.addClass(sSemanticColor);
				oRm.addClass(sSize);
				oRm.writeClasses();
				oRm.addStyle("width", Math.abs(oChartData.actualValuePct - oChartData.targetValuePct) + "%");
				oRm.addStyle(sOrientation, 1 + Math.min(oChartData.actualValuePct, oChartData.targetValuePct) + "%");
				oRm.writeStyles();
				oRm.writeAttribute("id", oControl.getId() + "-bc-bar-value");
				oRm.write("></div>");
			}
		}

		if (oControl._isTargetValueSet) {
			oRm.write("<div");
			oRm.addClass("sapSuiteBMCTargetBarValue");
			oRm.addClass(sSize);
			oRm.writeClasses();
			oRm.addStyle(sOrientation, parseFloat(oChartData.targetValuePct).toFixed(2) + "%");
			oRm.writeStyles();
			oRm.writeAttribute("id", oControl.getId() + "-bc-target-bar-value");
			oRm.write("></div>");
			oRm.write("</div>");

			if (bShowTargetValue) {
				oRm.write("<div");
				oRm.addClass("sapSuiteBMCBottomLabel");
				oRm.writeClasses();
				oRm.write(">");
				var sTValToShow = (sTargetValueLabel) ? sTargetValueLabel : "" + oControl.getTargetValue();
				var sTValScale = sTValToShow + sScale;
				oRm.write("<div");
				oRm.addClass("sapSuiteBMCTargetValue");
				oRm.addClass(sSize);
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.writeAttribute("id", oControl.getId() + "-bc-target-value");
				oRm.write(">");
				oRm.writeEscaped(sTValScale);
				oRm.write("</div>");
				oRm.write("</div>");
			}
		} else {
			oRm.write("</div>");
		}
		oRm.write("</div>");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-info");
		oRm.writeAttribute("aria-hidden", "true");
		oRm.addStyle("display", "none");
		oRm.writeStyles();
		oRm.write(">");
		oRm.writeEscaped(sTooltip);
		oRm.write("</div>");
		oRm.write("</div>");
		oRm.write("</div>");
	};
	/**
	 * Renders the HTML for the thresholds, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose thresholds should be rendered
	 * @param {sap.ui.core.Control} oThreshold an object containing threshold values and colors
	 */
	BulletMicroChartRenderer.renderThreshold = function(oRm, oControl, oThreshold) {
		var sOrientation = sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left";
		var fValuePct = 0.98 * oThreshold.valuePct + 1;
		var sColor = "sapSuiteBMCSemanticColor" + oThreshold.color;
		var sSize;
		if (oControl.getIsResponsive()){
			sSize = "sapSuiteBMCResponsive";
		} else {
			sSize = "sapSuiteBMCSize" + oControl.getSize();
		}

		if (sColor === "sapSuiteBMCSemanticColor" + sap.m.ValueColor.Error) {
			oRm.write("<div");
			oRm.addClass("sapSuiteBMCDiamond");
			oRm.addClass(sSize);
			oRm.addClass(sColor);
			oRm.writeClasses();
			oRm.addStyle(sOrientation, fValuePct + "%");
			oRm.writeStyles();
			oRm.write("></div>");
		}
		oRm.write("<div");
		oRm.addClass("sapSuiteBMCThreshold");
		oRm.addClass(sSize);
		oRm.addClass(sColor);
		oRm.writeClasses();
		oRm.addStyle(sOrientation, fValuePct + "%");
		oRm.writeStyles();
		oRm.write("></div>");
	};

	return BulletMicroChartRenderer;

}, /* bExport= */ true);