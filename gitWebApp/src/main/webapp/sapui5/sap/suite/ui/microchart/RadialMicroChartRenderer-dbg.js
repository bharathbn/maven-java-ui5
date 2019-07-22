 /*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

sap.ui.define(["jquery.sap.global", "sap/ui/Device"],
	function(jQuery, Device) {
	"use strict";

	/**
	* RadialMicroChartRenderer renderer.
	* @namespace
	* @since 1.36.0
	*/
	var RadialMicroChartRenderer = {};

	//Constants
	RadialMicroChartRenderer.FORM_RATIO = 1000; //Form ratio for the control, means the calculation base
	RadialMicroChartRenderer.BACKGROUND_CIRCLE_BORDER_WIDTH = 1;
	RadialMicroChartRenderer.BACKGROUND_CIRCLE_RADIUS = 500; //Calculated by: RadialMicroChartRenderer.FORM_RATIO * 0.5
	RadialMicroChartRenderer.CIRCLE_BORDER_WIDTH = 87.5; //Calculated by: RadialMicroChartRenderer.BACKGROUND_CIRCLE_RADIUS * 0.175<WHEEL_WIDTH_FACTOR>
	RadialMicroChartRenderer.CIRCLE_RADIUS = 441.75; //Calculated by: RadialMicroChartRenderer.BACKGROUND_CIRCLE_RADIUS * (1.0 - 0.029<EXTERNAL_OUTER_BORDER_WIDTH_FACTOR> - 0.175<WHEEL_WIDTH_FACTOR> / 2.0)
	RadialMicroChartRenderer.SVG_VIEWBOX_CENTER_FACTOR = "50%";
	RadialMicroChartRenderer.X_ROTATION = 0;
	RadialMicroChartRenderer.SWEEP_FLAG = 1;
	RadialMicroChartRenderer.PADDING_WIDTH = 0.22;//Should be 1 px
	RadialMicroChartRenderer.NUMBER_FONT_SIZE = 235; //Calculated by: RadialMicroChartRenderer.BACKGROUND_CIRCLE_RADIUS * 0.47<NUMBER_FONT_SIZE_FACTOR>
	RadialMicroChartRenderer.EDGE_CASE_SIZE_ACCESSIBLE_COLOR = 54; // this value corresponds to 14 px for text font size
	RadialMicroChartRenderer.EDGE_CASE_SIZE_SHOW_TEXT = 46;
	RadialMicroChartRenderer.EDGE_CASE_SIZE_MICRO_CHART = 24;

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render - Output - Buffer
	 * @param {sap.ui.core.Control} oControl the control to be rendered
	 */
	RadialMicroChartRenderer.render = function(oRm, oControl) {
		if (!oControl._bThemeApplied) {
			return;
		}

		// Write the HTML into the render manager
		this._writeDivStartElement(oControl, oRm);
		this._writeSVGStartElement(oControl, oRm);
		this._writeBackground(oRm);
		if (this._renderingOfInnerContentIsRequired(oControl)) {
			this._writeBorders(oRm);
			if (this._innerCircleRequired(oControl)) {
				this._writeCircle(oControl, oRm);
			} else {
				this._writeCircleWithPathElements(oControl, oRm);
			}
			this._writeText(oControl, oRm);
		}
		oRm.write("</svg>");
		oRm.write("</div>");
	};

	/* Rendering Write-Helpers */

	/**
	 * Writes the start tag for the surrounding div-element incl. ARIA text and required classes
	 *
	 * @private
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @param {sap.ui.core.RenderManager} oRm the render manager
	 */
	RadialMicroChartRenderer._writeDivStartElement = function(control, oRm) {
		oRm.write("<div");
		oRm.writeControlData(control);
		var sTooltip = control._getTooltipText();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.writeAttribute("role", "img");
		oRm.writeAttributeEscaped("aria-label", control._getAriaText());
		if (control.hasListeners("press")) {
			oRm.addClass("sapSuiteUiMicroChartPointer");
			oRm.writeAttribute("tabindex", "0");
		}
		oRm.addClass("sapSuiteRMC");
		var sSizeClass = "sapSuiteRMCSize" + control.getSize();
		oRm.addClass(sSizeClass);
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">");
	};

	/**
	 * Writes the start tag for the SVG element.
	 *
	 * @private
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @param {sap.ui.core.RenderManager} oRm the render manager
	 */
	RadialMicroChartRenderer._writeSVGStartElement = function(control, oRm) {
		var sPreserveAspectRatio;
		if (!sap.ui.getCore().getConfiguration().getRTL()) {
			sPreserveAspectRatio = "xMaxYMid meet";
		} else {
			sPreserveAspectRatio = "xMinYMid meet";
		}
		var sSizeClass = "sapSuiteRMCSize" + control.getSize();
		oRm.write("<svg class=\"sapSuiteRMC " + sSizeClass + "\" viewBox=\"0 0 " + RadialMicroChartRenderer.FORM_RATIO + ' ' + RadialMicroChartRenderer.FORM_RATIO + "\" preserveAspectRatio=\"" + sPreserveAspectRatio + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">");
	};

	/**
	 * Writes the background circle.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the render manager
	 */
	RadialMicroChartRenderer._writeBackground = function(oRm) {
		oRm.write("<circle class=\"sapSuiteRMCCircleBackground\" cx=\"" + RadialMicroChartRenderer.SVG_VIEWBOX_CENTER_FACTOR + "\" cy=\"" + RadialMicroChartRenderer.SVG_VIEWBOX_CENTER_FACTOR + "\" r=\"" + RadialMicroChartRenderer.BACKGROUND_CIRCLE_RADIUS + "\" stroke-width=\"" + this.BACKGROUND_CIRCLE_BORDER_WIDTH + "\" />");
	};

	/**
	 * Writes the Borders, required for HCB.
	 * In case of other themes, they are also available to avoid issues during switching themes.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the render manager
	 */
	RadialMicroChartRenderer._writeBorders = function(oRm) {
		oRm.write("<circle class=\"sapSuiteRMCHCBIncompleteBorder\" cx=\"" + RadialMicroChartRenderer.SVG_VIEWBOX_CENTER_FACTOR + "\" cy=\"" + RadialMicroChartRenderer.SVG_VIEWBOX_CENTER_FACTOR + "\" r=\"" + (RadialMicroChartRenderer.CIRCLE_RADIUS + RadialMicroChartRenderer.CIRCLE_BORDER_WIDTH / 2.0 - RadialMicroChartRenderer.BACKGROUND_CIRCLE_BORDER_WIDTH ) + "\" stroke-width=\"" + RadialMicroChartRenderer.BACKGROUND_CIRCLE_BORDER_WIDTH + "\" />");
		oRm.write("<circle class=\"sapSuiteRMCHCBIncompleteBorder\" cx=\"" + RadialMicroChartRenderer.SVG_VIEWBOX_CENTER_FACTOR + "\" cy=\"" + RadialMicroChartRenderer.SVG_VIEWBOX_CENTER_FACTOR + "\" r=\"" + (RadialMicroChartRenderer.CIRCLE_RADIUS - RadialMicroChartRenderer.CIRCLE_BORDER_WIDTH / 2.0 + RadialMicroChartRenderer.BACKGROUND_CIRCLE_BORDER_WIDTH ) + "\" stroke-width=\"" + RadialMicroChartRenderer.BACKGROUND_CIRCLE_BORDER_WIDTH + "\" />");
	};

	/**
	 * Writes the circle element, required for 0% and 100% cases.
	 *
	 * @private
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @param {sap.ui.core.RenderManager} oRm the render manager
	 */
	RadialMicroChartRenderer._writeCircle = function(control, oRm) {
		oRm.write("<circle class=\"" + this._getSVGStringForColor(this._getFullCircleColor(control), control) + "\" cx=\"" + RadialMicroChartRenderer.SVG_VIEWBOX_CENTER_FACTOR + "\" cy=\"" + RadialMicroChartRenderer.SVG_VIEWBOX_CENTER_FACTOR + "\" r=\"" + RadialMicroChartRenderer.CIRCLE_RADIUS + "\" fill=\"transparent\" stroke-width=\"" + RadialMicroChartRenderer.CIRCLE_BORDER_WIDTH + "px\" />");
	};

	/**
	 * Writes the two path elements, required for all cases between 1% and 99%.
	 * Keeps a padding of 1px between the paths.
	 *
	 * @private
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @param {sap.ui.core.RenderManager} oRm the render manager
	 */
	RadialMicroChartRenderer._writeCircleWithPathElements = function(control, oRm) {
		var iLargeArcFlag = control.getPercentage() > 50 ? 1 : 0;
		//decrease/increase the percentage to have a padding between paths
		var fPercentage = this._getPercentageForCircleRendering(control) - RadialMicroChartRenderer.PADDING_WIDTH;
		var aPathCoordinates = this._calculatePathCoordinates(control, fPercentage, false);
		this._writePath1(iLargeArcFlag, aPathCoordinates, control, oRm);
		fPercentage = this._getPercentageForCircleRendering(control) + RadialMicroChartRenderer.PADDING_WIDTH;
		aPathCoordinates = this._calculatePathCoordinates(control, fPercentage, true);
		this._writePath2(iLargeArcFlag, aPathCoordinates, control, oRm);
	};

	/**
	 * Writes the first path element for cases between 1% and 99%.
	 *
	 * @private
	 * @param {int} largeArcFlag for check of smaller or bigger than 180 degrees
	 * @param {float[]} pathCoordinates array containing specific coordinates for the path
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @param {sap.ui.core.RenderManager} oRm the render manager
	 */
	RadialMicroChartRenderer._writePath1 = function(largeArcFlag, pathCoordinates, control, oRm) {
		var sPathData1 = "M" + pathCoordinates[0] + " " + pathCoordinates[1] + " A " + RadialMicroChartRenderer.CIRCLE_RADIUS + " " + RadialMicroChartRenderer.CIRCLE_RADIUS +
		", " + RadialMicroChartRenderer.X_ROTATION + ", " + largeArcFlag + ", " + RadialMicroChartRenderer.SWEEP_FLAG + ", " + pathCoordinates[2] + " " + pathCoordinates[3];

		oRm.write("<path class=\"sapSuiteRMCPath" + this._getSVGStringForColor(this._getPathColor(control), control) + "d=\"" + sPathData1 + "\" fill=\"transparent\" stroke-width=\"" + RadialMicroChartRenderer.CIRCLE_BORDER_WIDTH + "px\" />");
	};

	/**
	 * Writes the second path element for cases between 1% and 99%.
	 *
	 * @private
	 * @param {int} largeArcFlag for check of smaller or bigger than 180 degrees
	 * @param {float[]} pathCoordinates array containing specific coordinates for the path
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @param {sap.ui.core.RenderManager} oRm the render manager
	 */
	RadialMicroChartRenderer._writePath2 = function(largeArcFlag, pathCoordinates, control, oRm) {
		var sPathData2 = "M" + pathCoordinates[2] + " " + pathCoordinates[3] + " A " + RadialMicroChartRenderer.CIRCLE_RADIUS + " " + RadialMicroChartRenderer.CIRCLE_RADIUS +
		", " + RadialMicroChartRenderer.X_ROTATION + ", " + (1 - largeArcFlag) + ", " + RadialMicroChartRenderer.SWEEP_FLAG + ", " + pathCoordinates[0] + " " + pathCoordinates[1];

		oRm.write("<path class=\"sapSuiteRMCPath sapSuiteRMCPathIncomplete\" d=\"" + sPathData2 + "\" fill=\"transparent\" stroke-width=\"" + RadialMicroChartRenderer.CIRCLE_BORDER_WIDTH + "px\" />");
	};

	/**
	 * Writes the text content inside the chart.
	 *
	 * @private
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @param {sap.ui.core.RenderManager} oRm the render manager
	 */
	RadialMicroChartRenderer._writeText = function(control, oRm) {
		oRm.write("<text class=\"sapSuiteRMCFont\" aria-hidden=\"true\" text-anchor=\"middle\" alignment-baseline=\"middle\"" + "\" font-size=\"" + RadialMicroChartRenderer.NUMBER_FONT_SIZE + "\" x=\"" + RadialMicroChartRenderer.SVG_VIEWBOX_CENTER_FACTOR + "\" y=\"" + this._getVerticalViewboxCenterFactorForText() + "\"> " + this._generateTextContent(control) + "</text>");
	};

	/* Helpers */

	/**
	 * Checks if rendering of inner content (circle or path-elements) is required.
	 *
	 * @private
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @returns {boolean} true if rendering is required, false if rendering is not required
	 */
	RadialMicroChartRenderer._renderingOfInnerContentIsRequired = function(control) {
		if (control._getPercentageMode() || (control.getTotal() !== 0)){
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Since the property valueColor can be a CSSColor or ValueColor, we need to add this parameter in different way to the path statement.
	 * For CSSColor, it's added straight to the statement as stroke.
	 * For valueColor it's added as a CSSClass.
	 *
	 * @private
	 * @param {sap.m.ValueColor|sap.ui.core.CSSColor} color of the chart
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @returns {string} value to add to the SVG string
	 */
	RadialMicroChartRenderer._getSVGStringForColor = function(color, control){
		if (control._isValueColorInstanceOfValueColor()) {
			return " " + color + "\"";
		} else if (color === "sapSuiteRMCPathIncomplete"){
			return " " + color + "\"";
		} else {
			return "\" stroke=\"" + color + "\"";
		}
	};

	/**
	 * Returns the center factor for the text element.
	 * Since browsers interpret the text differently, the constant SVG_VIEWBOX_CENTER_FACTOR can not be used.
	 *
	 * @private
	 * @returns {string} factor for vertical center of text
	 */
	RadialMicroChartRenderer._getVerticalViewboxCenterFactorForText = function() {
		if (Device.browser.msie || Device.browser.mozilla || Device.browser.edge) {
			return "57%";
		} else {
			return "51%";
		}
	};

	/**
	 * Checks if the inner circle is required. This is valid for 0% or 100% scenarios.
	 *
	 * @private
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @returns {boolean} true if inner circle has to be rendered, false if inner circle is not required
	 */
	RadialMicroChartRenderer._innerCircleRequired = function(control) {
		if (control.getPercentage() >= 100 || control.getPercentage() <= 0) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Generates the coordinates needed for drawing the two path elements.
	 *
	 * @private
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control - the current chart control
	 * @param {float} percentage - the calculated percentage value for bar rendering
	 * @param {boolean}isPadding - padding is required or not
	 * @returns {float[]} array with calculated coordinates
	 */
	RadialMicroChartRenderer._calculatePathCoordinates = function(control, percentage, isPadding) {
		var aCoordinates = [];
		var fPadding = 0;

		if (isPadding) {
			fPadding = 2 * RadialMicroChartRenderer.PADDING_WIDTH / 100 * 2 * Math.PI;
		}
		aCoordinates.push(RadialMicroChartRenderer.FORM_RATIO / 2 + RadialMicroChartRenderer.CIRCLE_RADIUS * Math.cos(-Math.PI / 2.0 - fPadding));
		aCoordinates.push(RadialMicroChartRenderer.FORM_RATIO / 2 + RadialMicroChartRenderer.CIRCLE_RADIUS * Math.sin(-Math.PI / 2.0 - fPadding));
		aCoordinates.push(RadialMicroChartRenderer.FORM_RATIO / 2 + RadialMicroChartRenderer.CIRCLE_RADIUS * Math.cos(-Math.PI / 2.0 + percentage / 100 * 2 * Math.PI));
		aCoordinates.push(RadialMicroChartRenderer.FORM_RATIO / 2 + RadialMicroChartRenderer.CIRCLE_RADIUS * Math.sin(-Math.PI / 2.0 + percentage / 100 * 2 * Math.PI));

		return aCoordinates;
	};

	/**
	 * Generates percentage value for rendering the circle.
	 * For edge cases (99% and 1%) a specific handling is implemented.
	 * For values between 99.0% - 99.9%, 99% will be retrieved to make sure the circle is not completely filled setting thos big values.
	 * For values between 0.1% - 0.9%, 1% will be returned to make sure the circle is not completely empty settings those small values.
	 * This is only used for painting the circle by path elements. For the text area, the value of the percentage property can be used.
	 *
	 * @private
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @returns {float} the calculated percentage value for bar rendering
	 */
	RadialMicroChartRenderer._getPercentageForCircleRendering = function(control) {
		var fPercentage = control.getPercentage();
		var fPercentageForEdgeCases = fPercentage;
		if (fPercentage > 99 - RadialMicroChartRenderer.PADDING_WIDTH) {
			fPercentageForEdgeCases = 99 - RadialMicroChartRenderer.PADDING_WIDTH;
		}
		if (fPercentage < 1 + RadialMicroChartRenderer.PADDING_WIDTH) {
			fPercentageForEdgeCases = 1 + RadialMicroChartRenderer.PADDING_WIDTH;
		}
		return fPercentageForEdgeCases;
	};

	/**
	 * Handles the UI specific stuff in onAfterRendering.
	 *
	 * @private
	 * @param {object} control instance of RadialMicroChart
	 */
	RadialMicroChartRenderer._handleOnAfterRendering = function(control) {
		var sParentWidth, sParentHeight;
		var $Text = control.$().find("text");
		var $Svg = control.$().children("svg");
		// Within a Generic Tile max-width was applied instead min-width in Chrome and IE, that's why we forced min-width to be applied in this block.
		if (control.getParent() instanceof sap.m.TileContent) {
			control._adjustToTileContent(control);
		} else {
			if (control.getSize() === "Responsive") {
				//Applies fixed size of parent to make SVG work in all browsers.
				if (control.getParent() !== undefined && control.getParent() !== null &&
						control.getParent().getHeight !== undefined && control.getParent().getHeight !== null) {
					// Two pixels are subtracted from the original value. Otherwise, there's not enough space for the outline and it won't render correctly.
					sParentHeight = parseFloat(control.getParent().$().height()) - 2;
					control.$().height(sParentHeight); //Required for rendering in page element. Otherwise element is cutted at the top.
					$Svg.height(sParentHeight);
				}
				if (control.getParent() !== undefined && control.getParent() !== null &&
						control.getParent().getWidth !== undefined && control.getParent().getWidth !== null) {
					// Two pixels are subtracted from the original value. Otherwise, there's not enough space for the outline and it won't render correctly.
					sParentWidth = parseFloat(control.getParent().$().width()) - 2;
					control.$().width(sParentWidth); //Required for rendering in page element. Otherwise element is cutted at the top.
					$Svg.width(sParentWidth);
				}
			}
		}
		if (control.getSize() === "Responsive") {
			//Hides control when threshold for visibility reached
			if (parseInt($Svg.css("height"), 10) < RadialMicroChartRenderer.EDGE_CASE_SIZE_MICRO_CHART ||
					parseInt($Svg.css("width"), 10) < RadialMicroChartRenderer.EDGE_CASE_SIZE_MICRO_CHART) {
				control.$().hide();
				return;
			}
			//Hides text element for small elements (<46px)
			if (parseInt($Svg.css("height"), 10) <= RadialMicroChartRenderer.EDGE_CASE_SIZE_SHOW_TEXT ||
					parseInt($Svg.css("width"), 10) <= RadialMicroChartRenderer.EDGE_CASE_SIZE_SHOW_TEXT) {
				$Text.hide();
			}
		}
		//Applies correct color classes
		var sTextColorClass = this._getTextColorClass(control); // Gets the correct color
		var sCurrentSVGClass = $Svg.attr("class") || ""; // Gets all the classes applied to the SVG element or uses an empty string if none are found
		if (sCurrentSVGClass.indexOf(sTextColorClass) < 0) {
			var sNewClasses = sCurrentSVGClass + " " + sTextColorClass;
			// If the SVG element is small, then additional class should be added indicating that small fonts are applied
			var iSvgElementHeight = parseInt($Svg.css("height"), 10);
			if (iSvgElementHeight <= RadialMicroChartRenderer.EDGE_CASE_SIZE_ACCESSIBLE_COLOR) {
				sNewClasses += " sapSuiteRMCSmallFont";
			}
			// Writes a new class attribute with all the other classes and the new correct color
			// SVG instead of Text element is used to work around a bug on mobile devices using the Edge browser
			$Svg.attr("class", sNewClasses );
		}
	};

	/**
	 * Returns the text color of the control. Also handles switch for accessibility features.
	 *
	 * @private
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @returns {string} value for CSS Text color class
	 */
	RadialMicroChartRenderer._getTextColorClass = function(control) {
		var iSize = parseInt(jQuery.sap.byId(control.getId()).children("svg").css("height"), 10);
		if (iSize <= RadialMicroChartRenderer.EDGE_CASE_SIZE_ACCESSIBLE_COLOR && (!control._isValueColorInstanceOfValueColor() || control.getValueColor() === sap.m.ValueColor.Neutral)){
			return "sapSuiteRMCAccessibleTextColor";
		} else {
			switch (control.getValueColor()){
				case sap.m.ValueColor.Good:
					return "sapSuiteRMCGoodTextColor";
				case sap.m.ValueColor.Error:
					return "sapSuiteRMCErrorTextColor";
				case sap.m.ValueColor.Critical:
					return "sapSuiteRMCCriticalTextColor";
				default:
					return "sapSuiteRMCNeutralTextColor";
			}
		}
	};

	/**
	 * Returns the color for full circles required for 100% or 0% charts.
	 *
	 * @private
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @returns {string} value for full circle CSS color class or css attribute
	 */
	RadialMicroChartRenderer._getFullCircleColor = function(control) {
		if (control.getPercentage() >= 100) {
			return this._getPathColor(control);
		}
		if (control.getPercentage() <= 0) {
			return "sapSuiteRMCPathIncomplete";
		}
	};

	/**
	 * Gets the CSS class or CSS attribute to apply the right color to the circle path
	 *
	 * @private
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @returns {string} containing the name of the CSS class or the CSS value
	 */
	RadialMicroChartRenderer._getPathColor = function(control) {
		var sValueColor = control.getValueColor();
		if (control._isValueColorInstanceOfValueColor()) {
			switch (sValueColor){
				case sap.m.ValueColor.Good:
					return "sapSuiteRMCPathGood";
				case sap.m.ValueColor.Error:
					return "sapSuiteRMCPathError";
				case sap.m.ValueColor.Critical:
					return "sapSuiteRMCPathCritical";
				default:
					return "sapSuiteRMCPathNeutral";
			}
		} else {
			return sValueColor;
		}
	};

	/**
	 * Generates the text content of the chart
	 *
	 * @private
	 * @param {sap.suite.ui.microchart.RadialMicroChart} control the current chart control
	 * @returns {string} value for text element in the chart
	 */
	RadialMicroChartRenderer._generateTextContent = function(control) {
		if (control.getPercentage() === 100) {
			return control._rb.getText("RADIALMICROCHART_PERCENTAGE_TEXT", [100]);
		}
		if (control.getPercentage() === 0) {
			return control._rb.getText("RADIALMICROCHART_PERCENTAGE_TEXT", [0]);
		}
		if (control.getPercentage() >= 100) {
			jQuery.sap.log.error("Values over 100%(" + control.getPercentage() + "%) are not supported");
			return control._rb.getText("RADIALMICROCHART_PERCENTAGE_TEXT", [100]);
		}
		if (control.getPercentage() <= 0) {
			jQuery.sap.log.error("Values below 0%(" + control.getPercentage() + "%) are not supported");
			return control._rb.getText("RADIALMICROCHART_PERCENTAGE_TEXT", [0]);
		}
		return control._rb.getText("RADIALMICROCHART_PERCENTAGE_TEXT", [control.getPercentage()]);
	};

	return RadialMicroChartRenderer;
}, /* bExport */ true);
