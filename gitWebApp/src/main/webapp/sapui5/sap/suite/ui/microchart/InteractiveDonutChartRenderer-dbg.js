 /*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(["jquery.sap.global", './library', "sap/ui/core/theming/Parameters"],
	function(jQuery, library, Parameters) {
	"use strict";

	/**
	 * InteractiveDonutChartRenderer renderer.
	 * @namespace
	 */
	var InteractiveDonutChartRenderer = {};
	InteractiveDonutChartRenderer.SEGMENT_COLORS = [
		"sapSuiteIDCColor1",
		"sapSuiteIDCColor2",
		"sapSuiteIDCColor3",
		"sapSuiteIDCColor4"
	];

	InteractiveDonutChartRenderer.TOTAL_RADIUS_ABSOLUTE = 3.625;
	InteractiveDonutChartRenderer.OUTER_RADIUS_ABSOLUTE = 3.25;
	InteractiveDonutChartRenderer.SELECTION_THICKNESS_ABSOLUTE = 0.375;
	InteractiveDonutChartRenderer.HOLE_SIZE_RATIO_COMPACT = 0.48;
	InteractiveDonutChartRenderer.HOLE_SIZE_RATIO_COZY = 0.3; //donut hole: 30% of diameter
	InteractiveDonutChartRenderer.SEGMENT_HALF_GAP_SIZE = 0.5; // gap width between segments equal to 1px

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @public
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 */
	InteractiveDonutChartRenderer.render = function(oRm, oControl) {
		if (!oControl._bThemeApplied) {
			return;
		}

		oRm.write("<div");
		oRm.addClass("sapSuiteIDC");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");

		this._aSegments = oControl.getAggregation("segments");
		this._renderDonut(oRm, oControl);
		this._renderLegend(oRm, oControl);

		oRm.write("</div>");
	};

	/**
	 * Sets max-width of legend labels in order to have them truncated when legend item space is not sufficient.
	 *
	 * @param {sap.ui.core.Control} oControl The control having been rendered
	 */
	InteractiveDonutChartRenderer._handleLegendEntrySizing = function(oControl) {
		var $Legend = oControl.$().find(".sapSuiteIDCLegend"),
			$Labels = $Legend.find(".sapSuiteIDCLegendLabel"),
			$Values = $Legend.find(".sapSuiteIDCLegendValue"),
			iValueWidthMax = 0;

		$Values.each(function() {
			var iValueWidth = jQuery(this).outerWidth(true); //outer width including margins
			iValueWidthMax = Math.max(iValueWidthMax, iValueWidth);
		});

		$Labels.css("width", "calc(100% - " + iValueWidthMax + "px)");
		$Values.css("width", iValueWidthMax + "px");
	};

	/**
	 * Renders the HTML for the donut.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 */
	InteractiveDonutChartRenderer._renderDonut = function(oRm, oControl) {
		var oSegment, fSum, fStart, sSegmentPath, iTotalRadius, iInnerRadius, iOuterRadius, iHoverThickness;

		var iMaxDisplayedSegments = oControl.getProperty("maxDisplayedSegments");
		var bCompact = oControl._isCompact();

		oRm.write("<div");
		oRm.addClass("sapSuiteIDCChart");
		oRm.writeClasses();
		oRm.write(">");

		//adds an extra overlay for a disabled chart
		if (!oControl.getSelectionEnabled()) {
			this._renderDisabledOverlay(oRm, oControl);
		}

		oRm.write("<svg");
		oRm.addClass("sapSuiteIDCChartSVG");
		oRm.writeClasses();
		oRm.writeAttribute("viewBox", "-2 -2 104 104");
		oRm.write(">");
		oRm.write("<g");
		// the shift in fractional parts is added to avoid pixel rastering issues that
		// are caused by defining the width of the separating line between segments being equal to 1 px.
		oRm.writeAttribute("transform", "translate(50.5 50.5)");
		oRm.write(">");

		//size calculations to convert absolute units to SVG-units
		iTotalRadius = 50; //radius including hover ghost thickness (in relative SVG-units)
		iOuterRadius = (this.OUTER_RADIUS_ABSOLUTE / this.TOTAL_RADIUS_ABSOLUTE) * iTotalRadius;
		if (bCompact) {
			//compact mode
			iInnerRadius = this.HOLE_SIZE_RATIO_COMPACT * iOuterRadius;
		} else {
			//cozy mode
			iInnerRadius = this.HOLE_SIZE_RATIO_COZY * iOuterRadius;
		}
		iHoverThickness = iTotalRadius * (this.SELECTION_THICKNESS_ABSOLUTE / this.TOTAL_RADIUS_ABSOLUTE);

		//render segments ghosts, i.e. the highlighting paths for selection
		fSum = this._calculateSum(oControl);
		fStart = 0.0;
		var i;
		for (i = 0; i < this._aSegments.length && i < iMaxDisplayedSegments; i++) {
			oSegment = this._aSegments[i];
			if (oSegment.getValue() > 0) {
				sSegmentPath = this._calculateSegmentPath(fSum, oSegment.getValue(), fStart, iOuterRadius + iHoverThickness, iInnerRadius - iHoverThickness);

				oRm.write("<path");
				oRm.writeAttribute("d", sSegmentPath);
				if (!oSegment.getSelected()) {
					oRm.addStyle("display", "none"); //hide ghost from the beginning
				}
				oRm.writeAttribute("data-sap-ui-idc-selection-index", i);
				oRm.addClass(library.InteractiveDonutChart.CHART_SEGMENT_GHOST.CSSCLASS);
				if (oSegment.getSelected()) {
					oRm.addClass(library.InteractiveDonutChart.CHART_SEGMENT_GHOST.CSSCLASS_SELECTED);
				}
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.write("/>");

				fStart += this._aSegments[i].getValue();
			}
		}

		//render donut segments
		fStart = 0.0;
		for (i = 0; i < this._aSegments.length && i < iMaxDisplayedSegments; i++) {
			oSegment = this._aSegments[i];
			if (oSegment.getValue() > 0) {
				sSegmentPath = this._calculateSegmentPath(fSum, oSegment.getValue(), fStart, iOuterRadius, iInnerRadius);

				oRm.write("<path");
				oRm.writeAttribute("d", sSegmentPath);
				oRm.writeAttribute("fill", this._getSegmentColor(i));
				oRm.writeAttribute("cursor", "pointer");
				oRm.writeAttribute("data-sap-ui-idc-selection-index", i);
				oRm.addClass(library.InteractiveDonutChart.CHART_SEGMENT.CSSCLASS);
				if (oSegment.getSelected()) {
					oRm.addClass(library.InteractiveDonutChart.CHART_SEGMENT.CSSCLASS_SELECTED);
				}
				oRm.writeClasses();
				oRm.write("/>");

				fStart += this._aSegments[i].getValue();
			}
		}
		oRm.write("</g>");
		oRm.write("</svg>");

		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the legend.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 */
	InteractiveDonutChartRenderer._renderLegend = function(oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapSuiteIDCLegend");
		oRm.writeClasses();
		oRm.write(">");

		//adds an extra overlay for a disabled chart
		if (!oControl.getSelectionEnabled()) {
			this._renderDisabledOverlay(oRm, oControl);
		}

		if (this._aSegments) {
			var iMaxDisplayedSegments = oControl.getProperty("maxDisplayedSegments");
			for (var i = 0; i < this._aSegments.length && i < iMaxDisplayedSegments; i++) {
				this._renderLegendSegment(oRm, oControl, i);
			}
		}

		oRm.write("</div>");
	};

	/**
	 * Renders the legend area for the given control.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 * @param {int} index The index inside segments aggregation
	 */
	InteractiveDonutChartRenderer._renderLegendSegment = function(oRm, oControl, index) {
		var oSegment = this._aSegments[index],
		sLabel = oSegment.getLabel(),
		sDisplayedValue = oSegment.getDisplayedValue() || String(oSegment.getValue());

		if (oSegment._bNullValue) {
			sDisplayedValue = oControl._oRb.getText("INTERACTIVECHART_NA");
		}

		oRm.write("<div");
		oRm.writeAttributeEscaped("id", oControl.getId() + "-interactionArea-" + index);
		oRm.writeAttributeEscaped("data-sap-ui-idc-selection-index", index);
		oRm.addClass("sapSuiteIDCLegendSegment");
		if (oSegment.getSelected()) {
			oRm.addClass(library.InteractiveDonutChart.SEGMENT_CSSCLASS_SELECTED);
		}
		//the first segment has tabindex 0
		if (index === 0 && oControl.getSelectionEnabled()) {
			oRm.writeAttribute("tabindex", "0");
		}
		oRm.writeClasses();
		oRm.write(">");

		//writes the square marker
		oRm.write("<div");
		oRm.addClass("sapSuiteIDCLegendMarker");
		oRm.writeClasses();
		oRm.writeAttribute("style", "background-color: " + this._getSegmentColor(index));
		oRm.write(">");
		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapSuiteIDCLegendLabelValue");
		oRm.writeClasses();
		oRm.write(">");

		//writes the label
		oRm.write("<div");
		oRm.addClass("sapSuiteIDCLegendLabel");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(sLabel);
		oRm.write("</div>");

		//writes the value with unit
		oRm.write("<div");
		oRm.addClass("sapSuiteIDCLegendValue");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(sDisplayedValue);
		oRm.write("</div>");

		oRm.write("</div>"); //.sapSuiteIDCLegendLabelValue

		oRm.write("</div>"); //.sapSuiteIDCLegendSegment
	};

	/**
	 * Returns the color value of the less parameter for the segment at the given position
	 * of the color palette.
	 *
	 * @private
	 * @param {int} position The position in the color palette array
	 * @returns {string} The color of the segment
	 */
	InteractiveDonutChartRenderer._getSegmentColor = function(position) {
		return Parameters.get(this.SEGMENT_COLORS[position % this.SEGMENT_COLORS.length]) || "white"; //fallback to white
	};

	/**
	 * Creates the object needed for SVG containing the necessary values.
	 * Based on scalable units from 0 to 100 the attributes of the SVG are computed. We assume to
	 * have an outer radius of 50 and an inner radius of 30, which corresponds to 60% of diameter for
	 * the donut hole.
	 *
	 * @private
	 * @param {float} sum The sum for the complete circle
	 * @param {float} segmentValue The proportional value
	 * @param {float} start The start point inside the circle
	 * @param {float} outerRadius The radius of the outer circle (whole size)
	 * @param {float} innerRadius The radius of the inner circle (hole size)
	 * @returns {string} The segment path in the form of a string
	 */
	InteractiveDonutChartRenderer._calculateSegmentPath = function(sum, segmentValue, start, outerRadius, innerRadius) {
		var iMinimumValue = 0.01,
			sSVGData,
			oLinePointA,
			oLinePointB,
			oLinePointC,
			oLinePointD,
			fStartAngle,
			fEndAngle,
			fSegmentAngle,
			bLargeAngle,
			fGapSizeSqr = Math.pow(2 * this.SEGMENT_HALF_GAP_SIZE, 2),
			fGapRadiusInner,
			fGapRadiusOuter,
			fGapAngleInner,
			fGapAngleOuter;

		outerRadius = this._formatFloat(outerRadius); //format float to only contain 2 digits
		innerRadius = this._formatFloat(innerRadius); //format float to only contain 2 digits

		fStartAngle = this._calculateCircleFraction(sum, start);
		fEndAngle = this._calculateCircleFraction(sum, start + segmentValue);
		fSegmentAngle = this._calculateCircleFraction(sum, segmentValue);
		/* bLargeAngle: If the segment angle is <= PI, SVG has to render a small arc (bLargeAngle = 0)
		 * and if the segment angle is > PI, it has to render a large arc (bLargeAngle = 1) */
		if (fSegmentAngle <= Math.PI) {
			bLargeAngle = 0;
		} else {
			bLargeAngle = 1;
		}

		//calculations for 1 unit gap between segments
		if (sum === segmentValue) { //only one segment is to be displayed
			fGapRadiusInner = innerRadius;
			fGapRadiusOuter = outerRadius;
			fGapAngleInner = 0;
			fGapAngleOuter = 0;
		} else {
			fGapRadiusInner = Math.sqrt(Math.pow(innerRadius, 2) + fGapSizeSqr);
			fGapRadiusOuter = Math.sqrt(Math.pow(outerRadius, 2) + fGapSizeSqr);
			fGapAngleInner = Math.atan(this.SEGMENT_HALF_GAP_SIZE / innerRadius);
			fGapAngleOuter = Math.atan(this.SEGMENT_HALF_GAP_SIZE / outerRadius);
		}

		oLinePointA = {
			"x" : this._formatFloat(fGapRadiusInner * Math.sin(fStartAngle + fGapAngleInner)),
			"y" : this._formatFloat(-fGapRadiusInner * Math.cos(fStartAngle + fGapAngleInner))
		};
		oLinePointB = {
			"x" : this._formatFloat(fGapRadiusOuter * Math.sin(fStartAngle + fGapAngleOuter)),
			"y" : this._formatFloat(-fGapRadiusOuter * Math.cos(fStartAngle + fGapAngleOuter))
		};
		// subtract the minimum coordinate value (0.01) from x values of point C & D to avoid having start and end at the same point
		oLinePointC = {
			"x" : this._formatFloat(outerRadius * Math.sin(fEndAngle - fGapAngleOuter) - iMinimumValue),
			"y" : this._formatFloat(-outerRadius * Math.cos(fEndAngle - fGapAngleOuter))
		};
		oLinePointD = {
			"x" : this._formatFloat(innerRadius * Math.sin(fEndAngle - fGapAngleInner) - iMinimumValue),
			"y" : this._formatFloat(-innerRadius * Math.cos(fEndAngle - fGapAngleInner))
		};

		sSVGData = "";
		// Draw a line from A (inner circle start) to B (outer circle start)
		sSVGData += "M" + oLinePointA.x + " " + oLinePointA.y + " ";
		sSVGData += "L" + oLinePointB.x + " " + oLinePointB.y + " ";
		// Draw an arc from B (outer circle start) to C (outer circle end), clockwise
		sSVGData += "A" + outerRadius + "," + outerRadius + " 0 " + bLargeAngle + ",1" +
			" " + oLinePointC.x + "," + oLinePointC.y + " ";
		// Draw a line from C (outer circle end) to D (inner circle end)
		sSVGData += "L" + oLinePointD.x + " " + oLinePointD.y + " ";
		// Draw the arc back from D (inner circle end) to A (inner circle start), counterclockwise
		sSVGData += "A" + innerRadius + "," + innerRadius + " 0 " + bLargeAngle + ",0" +
			" " + oLinePointA.x + "," + oLinePointA.y;

		return sSVGData;
	};

	/**
	 * First formats the given value to two places after the decimal point, then parses the result to float.
	 *
	 * @private
	 * @param {float} value The value which is formatted and parsed
	 * @returns {float} The result as float value
	 */
	InteractiveDonutChartRenderer._formatFloat = function(value) {
		return parseFloat(value.toFixed(2));
	};

	/**
	 * Calculates the sum of the values of the first maxDisplayedSegments.
	 *
	 * @private
	 * @param {sap.suite.ui.microchart.InteractiveDonutChart} oControl The control to be rendered
	 * @returns {float} The sum of the values of the first maxDisplayedSegments
	 */
	InteractiveDonutChartRenderer._calculateSum = function(oControl) {
		var fSum = 0;
		var iMaxDisplayedSegments = oControl.getProperty("maxDisplayedSegments");

		for (var i = 0; i < this._aSegments.length && i < iMaxDisplayedSegments; i++) {
			fSum += Math.max(0, this._aSegments[i].getValue());
		}

		return fSum;
	};

	/**
	 * Calculates the fraction of the current segment.
	 *
	 * @private
	 * @param {float} sum The sum of all segment values
	 * @param {float} segmentValue The value of the current segment
	 * @returns {float} The fraction based on segmentValue
	 */
	InteractiveDonutChartRenderer._calculateCircleFraction = function(sum, segmentValue) {
		return (2 * Math.PI * segmentValue) / sum;
	};

	/**
	 * Adds an extra disabling overlay
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm RenderManager It can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl The control to be rendered
	 */
	InteractiveDonutChartRenderer._renderDisabledOverlay = function(oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapSuiteIDCDisabledOverlay");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");
	};

	return InteractiveDonutChartRenderer;

}, /* bExport= */ true);
