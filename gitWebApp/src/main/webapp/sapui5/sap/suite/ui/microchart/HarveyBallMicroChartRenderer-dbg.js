 /*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

sap.ui.define([],
	function() {
	"use strict";

	/**
	* HarveyBallMicroChartRenderer renderer.
	* @namespace
	*/
	var HarveyBallMicroChartRenderer = {};

	HarveyBallMicroChartRenderer._iReferenceControlHeight = 72;
	HarveyBallMicroChartRenderer._iReferenceControlWidth = 168;

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render - Output - Buffer
	 * @param {sap.ui.core.Control} oControl the control to be rendered
	 */
	HarveyBallMicroChartRenderer.render = function(oRm, oControl) {
		if (!oControl._bThemeApplied) {
			return;
		}
		var bRtl = sap.ui.getCore().getConfiguration().getRTL();
		this._calculatePath(oControl);
		var sTooltip = oControl.getTooltip_AsString();
		if (typeof sTooltip !== "string") {
			sTooltip = "";
		}
		var sTotalScale = "";
		var sValueLabel = "";
		var sValueScale = "";
		var bFmtLabel = false;
		var fValue = 0;
		var sColorClass = "";
		var sColorPaletteColor = false;
		// support only value from first item
		if (oControl.getItems().length) {
			var oPieItem = oControl.getItems()[0];
			fValue = oPieItem.getFraction();
			sColorClass = "sapSuiteHBMCSemanticColor" + oPieItem.getColor();
			sValueLabel = oPieItem.getFractionLabel() ? oPieItem.getFractionLabel() : sValueLabel + oPieItem.getFraction();
			sValueScale = oPieItem.getFractionScale() ? oPieItem.getFractionScale().substring(0, 3) : sValueScale;
			bFmtLabel = oPieItem.getFormattedLabel();
		}

		if (bFmtLabel) {
			var oFormattedValue = oControl._parseFormattedValue(sValueLabel);

			sValueScale = oFormattedValue.scale.substring(0, 3);
			sValueLabel = oFormattedValue.value;
		}

		var fTotal = oControl.getTotal();
		var sTotalLabel = oControl.getTotalLabel() ? oControl.getTotalLabel() : "" + oControl.getTotal();
		if (oControl.getTotalScale()) {
			sTotalScale = oControl.getTotalScale().substring(0, 3);
		}

		if (oControl.getFormattedLabel()) {
			var oFormattedTotal = oControl._parseFormattedValue(sTotalLabel);
			sTotalScale = oFormattedTotal.scale.substring(0, 3);
			sTotalLabel = oFormattedTotal.value;
		}
		var iTrunc = 5; // truncate values to 5 chars
		if (sValueLabel) {
			sValueLabel = (sValueLabel.length >= iTrunc && (sValueLabel[iTrunc - 1] === "." || sValueLabel[iTrunc - 1] === ","))
					? sValueLabel.substring(0, iTrunc - 1)
					: sValueLabel.substring(0, iTrunc);
		}
		if (sTotalLabel) {
			sTotalLabel = (sTotalLabel.length >= iTrunc && (sTotalLabel[iTrunc - 1] === "." || sTotalLabel[iTrunc - 1] === ","))
					? sTotalLabel.substring(0, iTrunc - 1)
					: sTotalLabel.substring(0, iTrunc);
		}
		if (oControl.getColorPalette().length > 0) {
			sColorPaletteColor = oControl.getColorPalette()[0];
		}

		var sSizeClass = "sapSuiteHBMCSize" + oControl.getSize();
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.writeAttributeEscaped("title", sTooltip);
		oRm.addClass("sapSuiteHBMC");
		oRm.addClass(oControl.getIsResponsive() ? "sapSuiteHBMCResponsive" : sSizeClass);
		if (oControl.hasListeners("press")) {
			oRm.addClass("sapSuiteUiMicroChartPointer");
			oRm.writeAttribute("tabindex", "0");
		}
		oRm.writeClasses();

		if (!oControl.getIsResponsive() && oControl.getWidth()){
			oRm.addStyle("width", oControl.getWidth());
		}
		oRm.writeStyles();

		oRm.write(">");

		oRm.write("<div");
		oRm.addClass("sapSuiteHBMCChartCnt");
		oRm.addClass(oControl.getIsResponsive() ? "sapSuiteHBMCResponsive" : sSizeClass);
		oRm.writeClasses();
		oRm.addStyle("display", "inline-block");
		oRm.writeStyles();
		oRm.writeAttribute("role", "presentation");
		oRm.writeAttributeEscaped("aria - label", oControl.getAltText().replace(/\s/g, " ") + (sap.ui.Device.browser.firefox ? "" : " " + sTooltip));
		oRm.write(">");

		oRm.write("<svg");
		oRm.writeAttribute("id", oControl.getId() + "-harvey-ball");
		if (oControl.getIsResponsive()) {
			oRm.addClass("sapSuiteHBMCChartCnt");
			oRm.addClass("sapSuiteHBMCResponsive");
			oRm.writeClasses();
			oRm.writeAttribute("viewBox", this._getSvgViewBoxProperties());
		} else {
			oRm.writeAttribute("width", this._oPath.size);
			oRm.writeAttribute("height", this._oPath.size);
		}
		oRm.writeAttribute("focusable", false);
		oRm.write(">");
		oRm.write("<g>");
		oRm.write("<circle");
		if (bRtl && oControl.getIsResponsive()) {
			oRm.writeAttribute("cx", HarveyBallMicroChartRenderer._iReferenceControlWidth - this._oPath.center);
		} else {
			oRm.writeAttribute("cx", this._oPath.center);
		}
		oRm.writeAttribute("cy", this._oPath.center);
		oRm.writeAttribute("r", (sap.ui.getCore().getConfiguration().getTheme() === "sap_hcb")
														? this._oPath.center - 1
														: this._oPath.center);
		oRm.addClass("sapSuiteHBMCSBall");
		oRm.writeClasses();
		oRm.write("/>");

		if (fValue && fValue >= fTotal) {
			oRm.write("<circle");
			oRm.writeAttribute("cx", this._oPath.center);
			oRm.writeAttribute("cy", this._oPath.center);
			oRm.writeAttribute("r", this._oPath.center - this._oPath.border);
			oRm.addClass("sapSuiteHBMCSgmnt");
			oRm.addClass(sColorClass);
			oRm.writeClasses();

			if (oControl.getColorPalette().length > 0) {
				oRm.addStyle("fill", jQuery.sap.encodeHTML(oControl.getColorPalette()[0]));
				oRm.writeStyles();
			}

			oRm.write("/>");
		} else if (fValue > 0) {
			oRm.write("<path");
			oRm.writeAttribute("id", oControl.getId() + "-segment");
			oRm.addClass("sapSuiteHBMCSgmnt");
			oRm.addClass(sColorClass);
			oRm.writeClasses();
			oRm.writeAttribute("d", this._serializePieChart());

			if (oControl.getColorPalette().length > 0) {
				oRm.addStyle("fill", jQuery.sap.encodeHTML(oControl.getColorPalette()[0]));
				oRm.writeStyles();
			}

			oRm.write("/>");
		}

		oRm.write("</g>");
		if (oControl.getIsResponsive()) {
			if (oControl.getShowFractions()) {
				oRm.write("<text");
				oRm.writeAttribute("id", "sapSuiteHBMCTopText");
				if (!bRtl) {
					oRm.writeAttribute("x", "80");
				} else if (sap.ui.Device.browser.msie || sap.ui.Device.browser.edge) {
					oRm.writeAttribute("x", "40");
				} else {
					oRm.writeAttribute("x", "88");
				}
				oRm.writeAttribute("y", "30");
				oRm.writeAttribute("text-anchor", "start");
				oRm.addClass("sapSuiteHBMCResponsive");
				oRm.addClass("sapSuiteHBMCValSclCnt");
				oRm.addClass(sColorClass);
				oRm.writeClasses();
				oRm.write(">");
				if (!bRtl) {
					this.renderFractionLabel(oRm, sValueLabel, bRtl);
					this.renderFractionScale(oRm, sValueScale, bRtl);
				} else {
					this.renderFractionScale(oRm, sValueScale, bRtl);
					this.renderFractionLabel(oRm, sValueLabel, bRtl);
				}
				oRm.write("</text>");
			}
			if (oControl.getShowTotal()) {
				oRm.write("<text");
				oRm.writeAttribute("id", "sapSuiteHBMCBottomText");
				if (!bRtl) {
					oRm.writeAttribute("x", HarveyBallMicroChartRenderer._iReferenceControlWidth);
				} else if (bRtl && (sap.ui.Device.browser.msie || sap.ui.Device.browser.edge)) {
					oRm.writeAttribute("x", "28");
				} else {
					oRm.writeAttribute("x", "0");
				}
				oRm.writeAttribute("y", "65");
				oRm.writeAttribute("text-anchor", "end");
				oRm.addClass("sapSuiteHBMCResponsive");
				oRm.addClass("sapSuiteHBMCTtl");
				oRm.addClass("sapSuiteHBMCTtlSclCnt");
				oRm.writeClasses();
				oRm.write(">");
				if (!bRtl) {
					this.renderTotalLabel(oRm, sTotalLabel, bRtl);
					this.renderTotalScale(oRm, sTotalScale, bRtl);
				} else {
					this.renderTotalScale(oRm, sTotalScale, bRtl);
					this.renderTotalLabel(oRm, sTotalLabel, bRtl);
				}
				oRm.write("</text>");
			}
		}
		oRm.write("</svg>");
		oRm.write("</div>");

		if (!oControl.getIsResponsive()){
			oRm.write("<div");
			oRm.addClass("sapSuiteHBMCValSclCnt");
			oRm.addClass(sSizeClass);
			oRm.addClass(sColorClass);

			if (sColorPaletteColor) {
				oRm.addClass("sapSuiteHBMCColorPaletteColor");
			}

			oRm.writeClasses();
			oRm.addStyle("display", oControl.getShowFractions() ? "inline - block" : "none");
			oRm.writeStyles();
			oRm.write(">");
			oRm.write("<p");
			oRm.write(">");
			this.renderLabel(oRm, oControl, [sColorClass, sSizeClass, "sapSuiteHBMCVal"], sValueLabel, "-fraction");
			this.renderLabel(oRm, oControl, [sColorClass, sSizeClass, "sapSuiteHBMCValScale"], sValueScale, "-fraction-scale");
			oRm.write("</p>");
			oRm.write("</div>");

			oRm.write("<div");
			oRm.addClass("sapSuiteHBMCTtlSclCnt");
			oRm.addClass(sSizeClass);
			oRm.writeClasses();
			if (bRtl) {
				oRm.addStyle("left", "0");
			} else {
				oRm.addStyle("right", "0");
			}
			oRm.addStyle("display", oControl.getShowTotal() ? "inline-block" : "none");
			oRm.writeStyles();
			oRm.write(">");
			this.renderLabel(oRm, oControl, [sColorClass, sSizeClass, "sapSuiteHBMCTtl"], sTotalLabel, "-total");
			this.renderLabel(oRm, oControl, [sColorClass, sSizeClass, "sapSuiteHBMCTtlScale"], sTotalScale, "-total-scale");
			oRm.write("</div>");
		}
		oRm.write("</div>");
	};

	HarveyBallMicroChartRenderer.renderFractionLabel = function(oRm, sFractionLabel, bRtl) {
		oRm.write("<tspan");
		if (bRtl) {
			// px is used instead of rem for IE compatibility reasons
			oRm.writeAttribute("dx", "4.8px");
		}
		oRm.write(">");
		oRm.write(sFractionLabel);
		oRm.write("</tspan>");
	};

	HarveyBallMicroChartRenderer.renderFractionScale = function(oRm, sFractionScale, bRtl) {
		oRm.write("<tspan");
		oRm.writeAttribute("font-size", "0.8rem");
		if (!bRtl) {
			// px is used instead of rem for IE compatibility reasons
			oRm.writeAttribute("dx", "4.8px");
		}
		oRm.write(">");
		oRm.write(sFractionScale);
		oRm.write("</tspan>");
	};

	HarveyBallMicroChartRenderer.renderTotalLabel = function(oRm, sTotalLabel, bRtl) {
		oRm.write("<tspan");
		if (bRtl) {
			// px is used instead of rem for IE compatibility reasons
			oRm.writeAttribute("dx", "4.8px");
		}
		oRm.write(">");
		oRm.write(sTotalLabel);
		oRm.write("</tspan>");
	};

	HarveyBallMicroChartRenderer.renderTotalScale = function(oRm, sTotalScale, bRtl) {
		oRm.write("<tspan");
		if (!bRtl) {
			// px is used instead of rem for IE compatibility reasons
			oRm.writeAttribute("dx", "4.8px");
		}
		oRm.write(">");
		oRm.write(sTotalScale);
		oRm.write("</tspan>");
	};

	HarveyBallMicroChartRenderer.renderLabel = function(oRm, oControl, aClasses, sLabel, sId) {
		oRm.write("<span");
		oRm.writeAttribute("id", oControl.getId() + sId);
		for (var i = 0; i < aClasses.length; i++) {
			oRm.addClass(aClasses[i]);
		}
		oRm.writeClasses();
		oRm.write(">");
		if (sLabel) {
			oRm.writeEscaped(sLabel);
		}
		oRm.write("</span>");

	};

	HarveyBallMicroChartRenderer._getSvgViewBoxProperties = function() {
		return "0 0 " + HarveyBallMicroChartRenderer._iReferenceControlWidth + " " + HarveyBallMicroChartRenderer._iReferenceControlHeight;
	};

	HarveyBallMicroChartRenderer._calculatePath = function(oControl) {
		var oSize = oControl.getSize();
		var fTot = oControl.getTotal();
		var fFrac = 0;
		if (oControl.getItems().length) {
			fFrac = oControl.getItems()[0].getFraction();
		}
		var bIsPhone = false;

		if (oSize == "Auto") {
			bIsPhone = jQuery("html").hasClass("sapUiMedia-Std-Phone");
		}

		if (oSize == "S" || oSize == "XS") {
			bIsPhone = true;
		}

		var iMediaSize = bIsPhone ? 56 : 72;
		if (oControl.getIsResponsive()){
			iMediaSize = HarveyBallMicroChartRenderer._iReferenceControlHeight;
		}
		var iCenter = iMediaSize / 2;
		var iBorder = 4;
		var bRtl = sap.ui.getCore().getConfiguration().getRTL();
		var bRtlResponsive;
		if (oControl.getIsResponsive() && bRtl) {
			bRtlResponsive = true;
		} else {
			bRtlResponsive = false;
		}
		this._oPath = {
			initial : {
				x : !bRtlResponsive ? iCenter : HarveyBallMicroChartRenderer._iReferenceControlWidth - iCenter,
				y : iCenter,
				x1 : !bRtlResponsive ? iCenter : HarveyBallMicroChartRenderer._iReferenceControlWidth - iCenter,
				y1 : iCenter
			},
			lineTo : {
				x : !bRtlResponsive ? iCenter : HarveyBallMicroChartRenderer._iReferenceControlWidth - iCenter,
				y : iBorder
			},
			arc : {
				x1 : iCenter - iBorder,
				y1 : iCenter - iBorder,
				xArc : 0,
				largeArc : 0,
				sweep : 1,
				x2 : "",
				y2 : ""
			},
			size : iMediaSize,
			border : iBorder,
			center : iCenter
		};

		var fAngle = fFrac / fTot * 360;
		if (fAngle < 10) {
			this._oPath.initial.x -= 1.5;
			this._oPath.initial.x1 += 1.5;
			this._oPath.arc.x2 = this._oPath.initial.x1;
			this._oPath.arc.y2 = this._oPath.lineTo.y;
		} else if (fAngle > 350 && fAngle < 360) {
			this._oPath.initial.x += 1.5;
			this._oPath.initial.x1 -= 1.5;
			this._oPath.arc.x2 = this._oPath.initial.x1;
			this._oPath.arc.y2 = this._oPath.lineTo.y;
		} else {
			var fRad = Math.PI / 180.0;
			var fRadius = this._oPath.center - this._oPath.border;
			var ix;
			if (!bRtlResponsive) {
				ix = fRadius * Math.cos((fAngle - 90) * fRad) + this._oPath.center;
			} else {
				ix = fRadius * Math.cos((fAngle - 90) * fRad) + HarveyBallMicroChartRenderer._iReferenceControlWidth - this._oPath.center;
			}
			var iy = this._oPath.size - (fRadius * Math.sin((fAngle + 90) * fRad) + this._oPath.center);
			this._oPath.arc.x2 = ix.toFixed(2);
			this._oPath.arc.y2 = iy.toFixed(2);
		}
		var iLargeArc = fTot / fFrac < 2 ? 1 : 0;

		this._oPath.arc.largeArc = iLargeArc;
	};

	HarveyBallMicroChartRenderer._serializePieChart = function() {
		var p = this._oPath;
		return ["M", p.initial.x, ",", p.initial.y, " L", p.initial.x, ",", p.lineTo.y, " A", p.arc.x1, ",", p.arc.y1,
				" ", p.arc.xArc, " ", p.arc.largeArc, ",", p.arc.sweep, " ", p.arc.x2, ",", p.arc.y2, " L", p.initial.x1,
				",", p.initial.y1, " z"].join("");
	};

	return HarveyBallMicroChartRenderer;

}, /* bExport */ true);
