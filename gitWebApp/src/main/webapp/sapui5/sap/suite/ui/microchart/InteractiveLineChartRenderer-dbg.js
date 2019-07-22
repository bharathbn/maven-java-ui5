/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	/**
	* InteractiveLineChartRenderer renderer.
	* @namespace
	*/
	var InteractiveLineChartRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render - Output - Buffer
	 * @param {sap.ui.core.Control} oControl the control to be rendered
	 */
	InteractiveLineChartRenderer.render = function(oRm, oControl) {
		if (!oControl._bThemeApplied) {
			return;
		}

		var nMaxDisplayedPoints = oControl.getMaxDisplayedPoints();
		var nPointLength = oControl.getPoints().length, iIndex = 0;
		if (nMaxDisplayedPoints < nPointLength) {
			nPointLength = nMaxDisplayedPoints;
		}
		var nPercentageWidth = 100 / nPointLength;
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapSuiteILC");
		oRm.writeClasses();
		oRm.write(">");
		if (!oControl.getSelectionEnabled()) {
			this.renderDisabledOverlay(oRm, oControl);
		}
		this.renderChartCanvas(oRm, oControl, nPointLength, nPercentageWidth);
		oRm.write("<div");
		oRm.addClass("sapSuiteILCBottomLabelArea");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapSuiteILCInteraction");
		oRm.writeClasses();
		oRm.write(">");

		for (iIndex = 0; iIndex < nPointLength; iIndex++) {
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-point-area-" + iIndex);
			oRm.addClass("sapSuiteILCSection");
			oRm.addClass("sapSuiteILCCanvasLayout");
			if (oControl.getPoints()[iIndex].getSelected()) {
				oRm.addClass("sapSuiteILCSelected");
			}
			oRm.writeClasses();
			oRm.addStyle("width", nPercentageWidth + "%");
			oRm.addStyle("left", iIndex * nPercentageWidth + "%");
			oRm.writeStyles();
			oRm.write(">");
			oRm.write("<div");
			oRm.addClass("sapSuiteILCBackgroundArea");
			oRm.writeClasses();
			oRm.write("/>");
			this.renderLabels(oRm, oControl, iIndex, nPointLength);
			oRm.write("<div");
			oRm.addClass("sapSuiteILCInteractionArea");
			oRm.addClass("sapMPointer");
			oRm.writeClasses();
			if (iIndex === 0 && oControl.getSelectionEnabled()) {
				oRm.writeAttribute("tabindex", "0");
			}
			oRm.write("/>");
			oRm.write("</div>");
		}
		oRm.write("</div>");
		oRm.write("</div>");
	};

	InteractiveLineChartRenderer.renderChartCanvas = function(oRm, oControl, nPointLength, nPercentageWidth) {
		var iIndex;
		oRm.write("<div");
		oRm.addClass("sapSuiteILCChartCanvas");
		oRm.addClass("sapSuiteILCCanvasLayout");
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<svg");
		oRm.addClass("sapSuiteILCSvgElement");
		oRm.writeClasses();
		oRm.writeAttribute("height", "100%");
		oRm.writeAttribute("width", "100%");
		oRm.writeAttribute("focusable", "false");
		oRm.write(">");

		for (iIndex = 1; iIndex < nPointLength; iIndex++) {
			if (!oControl.getPoints()[iIndex - 1]._bNullValue && !oControl.getPoints()[iIndex]._bNullValue) {
				oRm.write("<line");
				oRm.writeAttribute("x1", nPercentageWidth / 2 + (iIndex - 1) * nPercentageWidth + "%");
				oRm.writeAttribute("y1", 100 - oControl._aNormalisedValues[iIndex - 1] + "%");
				oRm.writeAttribute("x2", nPercentageWidth / 2 + (iIndex) * nPercentageWidth + "%");
				oRm.writeAttribute("y2", 100 - oControl._aNormalisedValues[iIndex] + "%");
				oRm.writeAttribute("stroke-width", "2");
				oRm.write("/>");
			}
		}
		oRm.write("</svg>");
		for (iIndex = 0; iIndex < nPointLength; iIndex++) {
			oRm.write("<div");
			oRm.addStyle("left", nPercentageWidth / 2 + iIndex * nPercentageWidth + "%");
			if (!oControl.getPoints()[iIndex]._bNullValue) {
				oRm.addClass("sapSuiteILCPoint");
				oRm.addStyle("bottom", oControl._aNormalisedValues[iIndex] + "%");
			}
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write("/>");
		}
		oRm.write("</div>");
	};

	InteractiveLineChartRenderer.renderLabels = function(oRm, oControl, iIndex, nPointLength) {
		var oPoint = oControl.getPoints()[iIndex];
		var sBottomLabelText = oPoint.getLabel() || "", sTopLabelText = oPoint.getDisplayedValue();
		var aHeights;
		oRm.write("<div");
		oRm.addClass("sapSuiteILCTextElement");
		oRm.addClass("sapSuiteILCBottomText");
		oRm.addClass("sapMPointer");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(sBottomLabelText);
		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapSuiteILCTextElement");
		oRm.addClass("sapSuiteILCToplabel");
		oRm.addClass("sapMPointer");
		if (!oPoint._bNullValue) {
			if (!sTopLabelText) {
				sTopLabelText = oPoint.getValue().toString();
			}
			aHeights = [oControl._aNormalisedValues[iIndex]];
			if (iIndex > 0 && !oControl.getPoints()[iIndex - 1]._bNullValue) {
				aHeights.push((oControl._aNormalisedValues[iIndex] + oControl._aNormalisedValues[iIndex - 1]) / 2);
			}
			if (iIndex < nPointLength - 1 && !oControl.getPoints()[iIndex + 1]._bNullValue) {
				aHeights.push((oControl._aNormalisedValues[iIndex] + oControl._aNormalisedValues[iIndex + 1]) / 2);
			}
			aHeights.sort(function(a, b) {
				return a - b;
			});
			if (Math.abs(oControl._aNormalisedValues[iIndex] - aHeights[0]) < Math.abs(oControl._aNormalisedValues[iIndex] - aHeights[aHeights.length - 1])) {
				oRm.addStyle("bottom", aHeights[0] + "%");
				oRm.addClass("sapSuiteILCShiftBelow");
			} else {
				oRm.addStyle("bottom", aHeights[aHeights.length - 1] + "%");
				oRm.addClass("sapSuiteILCShiftAbove");
			}
		} else {
			sTopLabelText = oControl._oRb.getText("INTERACTIVECHART_NA");
			oRm.addClass("sapSuiteILCShiftBelow");
			oRm.addClass("sapSuiteILCNaLabel");
		}
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">");
		oRm.writeEscaped(sTopLabelText);
		oRm.write("</div>");
	};

	InteractiveLineChartRenderer.renderDisabledOverlay = function(oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapSuiteILCDisabledOverlay");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");
	};
	return InteractiveLineChartRenderer;

}, /* bExport */ true);
