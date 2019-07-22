/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";

	/**
	 * Constructor for a new AreaMicroChart control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Chart that displays the history of values and target values as segmented lines and shows thresholds as colored background. This control replaces the deprecated sap.suite.ui.commons.MicroAreaChart.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 *
	 * @public
	 * @alias sap.suite.ui.microchart.AreaMicroChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AreaMicroChart = Control.extend("sap.suite.ui.microchart.AreaMicroChart", /** @lends sap.suite.ui.microchart.AreaMicroChart.prototype */ {
			metadata: {
				library: "sap.suite.ui.microchart",
				properties: {
					/**
					 * The width of the chart.
					 */
					width: {type: "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

					/**
					 * The height of the chart.
					 */
					height: {type: "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

					/**
					 * If this property is set it indicates the value X axis ends with.
					 */
					maxXValue: {type: "float", group : "Misc", defaultValue : null},

					/**
					 * If this property is set it indicates the value X axis ends with.
					 */
					minXValue: {type : "float", group : "Misc", defaultValue : null},

					/**
					 * If this property is set it indicates the value X axis ends with.
					 */
					maxYValue: {type: "float", group : "Misc", defaultValue : null},

					/**
					 * If this property is set it indicates the value X axis ends with.
					 */
					minYValue: {type: "float", group : "Misc", defaultValue : null},

					/**
					 * The view of the chart.
					 */
					view: {type: "sap.suite.ui.microchart.AreaMicroChartViewType", group : "Appearance", defaultValue : "Normal"},

					/**
					 * The color palette for the chart. If this property is set,
					 * semantic colors defined in AreaMicroChartItem are ignored.
					 * Colors from the palette are assigned to each line consequentially.
					 * When all the palette colors are used, assignment of the colors begins
					 * from the first palette color.
					 */
					colorPalette: {type: "string[]", group : "Appearance", defaultValue : [] },

					/**
					 * Determines if the labels are displayed or not.
					 */
					showLabel: { type: "boolean", group: "Misc", defaultValue: true },

					/**
					 * If this set to true, width and height of the control are determined by the width and height of the container in which the control is placed. Width and height properties are ignored in such case.
					 * @since 1.38.0
					 */
					isResponsive: {type: "boolean", group: "Appearance", defaultValue: false}

				},
				events : {

					/**
					 * The event is fired when the user chooses the micro area chart.
					 */
					press: {}

				},
				defaultAggregation : "lines",
				aggregations: {
					/**
					 * The configuration of the actual values line.
					 * The color property defines the color of the line.
					 * Points are rendered in the same sequence as in this aggregation.
					 */
					chart: { multiple: false, type: "sap.suite.ui.microchart.AreaMicroChartItem", bindable : "bindable" },

					/**
					 * The configuration of the max threshold area. The color property defines the color of the area above the max threshold line. Points are rendered in the same sequence as in this aggregation.
					 */
					maxThreshold: { multiple: false, type: "sap.suite.ui.microchart.AreaMicroChartItem" },

					/**
					 * The configuration of the upper line of the inner threshold area. The color property defines the color of the area between inner thresholds. For rendering of the inner threshold area, both innerMaxThreshold and innerMinThreshold aggregations must be defined. Points are rendered in the same sequence as in this aggregation.
					 */
					innerMaxThreshold: { multiple: false, type: "sap.suite.ui.microchart.AreaMicroChartItem" },

					/**
					 * The configuration of the bottom line of the inner threshold area. The color property is ignored. For rendering of the inner threshold area, both innerMaxThreshold and innerMinThreshold aggregations must be defined. Points are rendered in the same sequence as in this aggregation.
					 */
					innerMinThreshold: { multiple: false, type: "sap.suite.ui.microchart.AreaMicroChartItem" },

					/**
					 * The configuration of the min threshold area. The color property defines the color of the area below the min threshold line. Points are rendered in the same sequence as in this aggregation.
					 */
					minThreshold: { multiple: false, type: "sap.suite.ui.microchart.AreaMicroChartItem" },

					/**
					 * The configuration of the target values line. The color property defines the color of the line. Points are rendered in the same sequence as in this aggregation.
					 */
					target: { multiple: false, type: "sap.suite.ui.microchart.AreaMicroChartItem", bindable : "bindable" },

					/**
					 * The label on X axis for the first point of the chart.
					 */
					firstXLabel: { multiple: false, type: "sap.suite.ui.microchart.AreaMicroChartLabel" },

					/**
					 * The label on Y axis for the first point of the chart.
					 */
					firstYLabel: { multiple: false, type: "sap.suite.ui.microchart.AreaMicroChartLabel" },

					/**
					 * The label on X axis for the last point of the chart.
					 */
					lastXLabel: { multiple: false, type: "sap.suite.ui.microchart.AreaMicroChartLabel" },

					/**
					 * The label on Y axis for the last point of the chart.
					 */
					lastYLabel: { multiple: false, type: "sap.suite.ui.microchart.AreaMicroChartLabel" },

					/**
					 * The label for the maximum point of the chart.
					 */
					maxLabel: { multiple: false, type: "sap.suite.ui.microchart.AreaMicroChartLabel" },

					/**
					 * The label for the minimum point of the chart.
					 */
					minLabel: { multiple: false, type: "sap.suite.ui.microchart.AreaMicroChartLabel" },

					/**
					 * The set of lines.
					 */
					lines: { multiple: true, type: "sap.suite.ui.microchart.AreaMicroChartItem", bindable : "bindable" }
				}

		}
	});

	// Constants
	AreaMicroChart.EDGE_CASE_WIDTH_SHOWCHART = 32; // 2rem on the basis of design
	AreaMicroChart.EDGE_CASE_HEIGHT_SHOWCANVAS = 16; // 1rem on the basis of design
	AreaMicroChart.EDGE_CASE_HEIGHT_SHOWBOTTOMLABEL = 16; // 1rem on the basis of design
	AreaMicroChart.EDGE_CASE_HEIGHT_SHOWTOPLABEL = 32; // 2rem on the basis of design
	AreaMicroChart.EDGE_CASE_HEIGHT_SHOWLABEL = 16; // 1rem on the basis of design
	AreaMicroChart.EDGE_CASE_WIDTH_RESIZEFONT = 168; // Corresponds to M size 10.5rem
	AreaMicroChart.EDGE_CASE_HEIGHT_RESIZEFONT = 72; // Corresponds to M size 4.5rem
	AreaMicroChart.ITEM_NEUTRAL_COLOR = "sapSuiteAMCSemanticColorNeutral";
	AreaMicroChart.ITEM_NEUTRAL_NOTHRESHOLD_CSSCLASS = "sapSuiteAMCNeutralNoThreshold";

	AreaMicroChart.prototype.init = function(){
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.microchart");
		this.setAggregation("tooltip", "{AltText}", true);
		this._bThemeApplied = true;
		if (!sap.ui.getCore().isInitialized()) {
			this._bThemeApplied = false;
			sap.ui.getCore().attachInit(this._handleCoreInitialized.bind(this));
		} else {
			this._handleCoreInitialized();
		}
		if (sap.ui.Device.system.tablet || sap.ui.Device.system.phone) {
			sap.ui.Device.orientation.attachHandler(this._onOrientationChange, this);
		}
	};

	/**
	 * Handler for the core's init event. In order for the control to be rendered only if all themes
	 * are loaded and everything is properly initialized, we attach a theme check in here.
	 *
	 * @private
	 */
	AreaMicroChart.prototype._handleCoreInitialized = function() {
		this._bThemeApplied = sap.ui.getCore().isThemeApplied();
		if (!this._bThemeApplied) {
			sap.ui.getCore().attachThemeChanged(this._handleThemeApplied, this);
		}
	};

	/**
	 * The chart is not being rendered until the theme was applied. If the theme is applied,
	 * rendering starts by the control itself.
	 *
	 * @private
	 */
	AreaMicroChart.prototype._handleThemeApplied = function() {
		this._bThemeApplied = true;
		this.invalidate();
		sap.ui.getCore().detachThemeChanged(this._handleThemeApplied, this);
	};

	AreaMicroChart.prototype._getCssValues = function() {
		this._cssHelper.className = Array.prototype.slice.call(arguments).join(" ");
		var oCsses = window.getComputedStyle(this._cssHelper);

		if (oCsses.backgroundColor == undefined) {
			oCsses.backgroundColor = oCsses["background-color"];
		}

		if (oCsses.outlineStyle == undefined) {
			oCsses.outlineStyle = oCsses["outline-style"];
		}

		if (oCsses.outlineWidth == undefined) {
			oCsses.outlineWidth = oCsses["outline-width"];
		}
		return oCsses;
	};

	AreaMicroChart.prototype.__fillThresholdArea = function(c, aPoints1, aPoints2, color) {
		c.beginPath();
		c.moveTo(aPoints1[0].x, aPoints1[0].y);

		for (var i = 1, length = aPoints1.length; i < length; i++) {
			c.lineTo(aPoints1[i].x, aPoints1[i].y);
		}

		for (var j = aPoints2.length - 1; j >= 0; j--) {
			c.lineTo(aPoints2[j].x, aPoints2[j].y);
		}

		c.closePath();

		c.fillStyle = "white";
		c.fill();

		c.fillStyle = color;
		c.fill();

		c.lineWidth = 1;
		c.strokeStyle = "white";
		c.stroke();

		c.strokeStyle = color;
		c.stroke();
	};

	AreaMicroChart.prototype._renderDashedLine = function(c, aPoints, d, aDashes) {
		if (c.setLineDash) {
			c.setLineDash(aDashes);
			this._renderLine(c, aPoints, d);
			c.setLineDash([]);
		} else {
			c.beginPath();
			for (var i = 0, length = aPoints.length - 1; i < length; i++) {
				c._dashedLine(aPoints[i].x, aPoints[i].y, aPoints[i + 1].x, aPoints[i + 1].y, aDashes);
			}
			c.stroke();
		}
	};

	AreaMicroChart.prototype._renderLine = function(c, aPoints, d) {
		c.beginPath();
		c.moveTo(aPoints[0].x, aPoints[0].y);

		for (var i = 1, length = aPoints.length; i < length; i++) {
			c.lineTo(aPoints[i].x, aPoints[i].y);
		}

		c.stroke();
	};

	/**
	 * Defines the color class based on the threshold values.
	 *
	 * @private
	 * @param {object} canvasDimensions - the canvas' calculated dimensions object
	 * @returns {String} - the CSS class used for line color
	 */
	AreaMicroChart.prototype._getItemColor = function(canvasDimensions) {
		var sItemColor;
		if (this.getTarget()) {
			sItemColor = "sapSuiteAMCSemanticColor" + this.getTarget().getColor();
		}
		if ((sItemColor === AreaMicroChart.ITEM_NEUTRAL_COLOR) && !this._isThresholdPresent(canvasDimensions)) {
			return AreaMicroChart.ITEM_NEUTRAL_NOTHRESHOLD_CSSCLASS;
		} else {
			return sItemColor;
		}
	};

	/**
	 * Identifies if the control has thresholds based on the threshold's number of elements.
	 *
	 * @private
	 * @param {object} canvasDimensions - the canvas' calculated dimensions object
	 * @returns {boolean} - flag showing if thresholds exist
	 */
	AreaMicroChart.prototype._isThresholdPresent = function(canvasDimensions) {
		var aThreshold = [canvasDimensions.minThreshold.length, canvasDimensions.maxThreshold.length, canvasDimensions.innerMinThreshold.length, canvasDimensions.innerMaxThreshold.length];
		for (var i = 0; i < aThreshold.length; i++) {
			if (aThreshold[i] > 1) {
				return true;
			}
		}

		return false;
	};

	AreaMicroChart.prototype._renderTarget = function(c, d) {
		if (d.target.length > 1) {
			var sColorClass = this._getItemColor(d);
			var oCsses = this._getCssValues("sapSuiteAMCTarget", sColorClass);
			c.strokeStyle = oCsses.color;
			c.lineWidth = parseFloat(oCsses.width);

			if (oCsses.outlineStyle == "dotted") {
				this._renderDashedLine(c, d.target, d, [parseFloat(oCsses.outlineWidth), 3]);
			} else {
				this._renderLine(c, d.target, d);
			}
		} else if (d.target.length == 1) {
			jQuery.sap.log.warning("Target is not rendered because only 1 point was given");
		}
	};

	AreaMicroChart.prototype._renderThresholdLine = function(c, aPoints, d) {
		if (aPoints && aPoints.length) {
			var oCsses = this._getCssValues("sapSuiteAMCThreshold");

			c.strokeStyle = oCsses.color;
			c.lineWidth = oCsses.width;
			this._renderLine(c, aPoints, d);
		}
	};

	AreaMicroChart.prototype._fillMaxThreshold = function(c, d) {
		if (d.maxThreshold.length > 1) {
			var oCsses = this._getCssValues("sapSuiteAMCThreshold", "sapSuiteAMCSemanticColor" + this.getMaxThreshold().getColor());
			this.__fillThresholdArea(c, d.maxThreshold, [
				{x: d.maxThreshold[0].x, y: d.minY},
				{x: d.maxThreshold[d.maxThreshold.length - 1].x, y: d.minY}
			], oCsses.backgroundColor);
			this._renderThresholdLine(c, d.maxThreshold, d);
		} else if (d.maxThreshold.length == 1) {
			jQuery.sap.log.warning("Max Threshold is not rendered because only 1 point was given");
		}
	};

	AreaMicroChart.prototype._fillMinThreshold = function(c, d) {
		if (d.minThreshold.length > 1) {
			var oCsses = this._getCssValues("sapSuiteAMCThreshold", "sapSuiteAMCSemanticColor" + this.getMinThreshold().getColor());
			this.__fillThresholdArea(c, d.minThreshold, [
				{x: d.minThreshold[0].x, y: d.maxY},
				{x: d.minThreshold[d.minThreshold.length - 1].x, y: d.maxY}
			], oCsses.backgroundColor);
		} else if (d.minThreshold.length == 1) {
			jQuery.sap.log.warning("Min Threshold is not rendered because only 1 point was given");
		}
	};

	AreaMicroChart.prototype._fillThresholdArea = function(c, d) {
		if (d.minThreshold.length > 1 && d.maxThreshold.length > 1) {
			var oCsses = this._getCssValues("sapSuiteAMCThreshold", "sapSuiteAMCSemanticColorCritical");

			this.__fillThresholdArea(c, d.maxThreshold, d.minThreshold, oCsses.backgroundColor);
		}
	};

	AreaMicroChart.prototype._fillInnerThresholdArea = function(c, d) {
		if (d.innerMinThreshold.length > 1 && d.innerMaxThreshold.length > 1) {
			var oCsses = this._getCssValues("sapSuiteAMCThreshold", "sapSuiteAMCSemanticColor" + this.getInnerMaxThreshold().getColor());

			this.__fillThresholdArea(c, d.innerMaxThreshold, d.innerMinThreshold, oCsses.backgroundColor);
		} else if (d.innerMinThreshold.length || d.innerMaxThreshold.length) {
			jQuery.sap.log.warning("Inner threshold area is not rendered because inner min and max threshold were not correctly set");
		}
	};

	AreaMicroChart.prototype._renderChart = function(c, d) {
		if (d.chart.length > 1) {
			var sColorClass = this._getItemColor(d);
			var oCsses = this._getCssValues("sapSuiteAMCChart", sColorClass);
			c.strokeStyle = oCsses.color;
			c.lineWidth = parseFloat(oCsses.width);

			this._renderLine(c, d.chart, d);
		} else if (d.chart.length == 1) {
			jQuery.sap.log.warning("Actual values are not rendered because only 1 point was given");
		}
	};

	AreaMicroChart.prototype._renderLines = function(c, d) {
		var iCpLength = this.getColorPalette().length;
		var iCpIndex = 0;
		var that = this;

		var fnNextColor = function() {
			if (iCpLength) {
				if (iCpIndex == iCpLength) {
					iCpIndex = 0;
				}
				return that.getColorPalette()[iCpIndex++];
			}
		};

		var oCsses = this._getCssValues("sapSuiteAMCLine");
		c.lineWidth = parseFloat(oCsses.width);

		var iLength = d.lines.length;
		for (var i = 0; i < iLength; i++) {
			if (d.lines[i].length > 1) {
				if (iCpLength) {
					c.strokeStyle = fnNextColor();
				} else {
					oCsses = this._getCssValues("sapSuiteAMCLine", "sapSuiteAMCSemanticColor" + this.getLines()[i].getColor());
					c.strokeStyle = oCsses.color;
				}
				this._renderLine(c, d.lines[i], d);
			}
		}
	};

	/**
	 * Renders the canvas.
	 *
	 * @private
	 * @param {Object} $Control The chart control object
	 */
	AreaMicroChart.prototype._renderCanvas = function($Control) {
		this._cssHelper = document.getElementById(this.getId() + "-css-helper");

		var sLabelsWidth = this.$().find(".sapSuiteAMCSideLabels").css("width");
		$Control.find(".sapSuiteAMCCanvas, .sapSuiteAMCLabels").css("right", sLabelsWidth).css("left", sLabelsWidth);

		var canvas = document.getElementById(this.getId() + "-canvas");
		var canvasSettings = window.getComputedStyle(canvas);

		var fWidth = parseFloat(canvasSettings.width);
		canvas.setAttribute("width", fWidth ? fWidth : 360);

		var fHeight = parseFloat(canvasSettings.height);
		canvas.setAttribute("height", fHeight ? fHeight : 242);

		var c = canvas.getContext("2d");

		c.lineJoin = "round";

		c._dashedLine = function(x, y, x2, y2, dashArray) {
			var dashCount = dashArray.length;
			this.moveTo(x, y);
			var dx = (x2 - x), dy = (y2 - y);
			var slope = dx ? dy / dx : 1e15;
			var distRemaining = Math.sqrt(dx * dx + dy * dy);
			var dashIndex = 0, draw = true;
			while (distRemaining >= 0.1) {
				var dashLength = dashArray[dashIndex++ % dashCount];
				if (dashLength > distRemaining) {
					dashLength = distRemaining;
				}
				var xStep = Math.sqrt(dashLength * dashLength / (1 + slope * slope));
				if (dx < 0) {
					xStep = -xStep;
				}
				x += xStep;
				y += slope * xStep;
				this[draw ? 'lineTo' : 'moveTo'](x, y);
				distRemaining -= dashLength;
				draw = !draw;
			}
		};
		var d = this._calculateDimensions(canvas.width, canvas.height);

		if (this._isThresholdPresent(d)) {
			$Control.find(".sapSuiteAMCCanvas").addClass("sapSuiteAMCWithThreshold");
		}

		this._fillMaxThreshold(c, d);
		this._fillMinThreshold(c, d);
		this._fillThresholdArea(c, d);
		this._renderThresholdLine(c, d.minThreshold, d);
		this._renderThresholdLine(c, d.maxThreshold, d);
		this._fillInnerThresholdArea(c, d);
		this._renderThresholdLine(c, d.innerMinThreshold, d);
		this._renderThresholdLine(c, d.innerMaxThreshold, d);
		this._renderTarget(c, d);
		this._renderChart(c, d);
		this._renderLines(c, d);
	};

	/**
	 * Calculates dimensions
	 *
	 * @param fWidth
	 * @param fHeight
	 * @returns {object}
	 */
	AreaMicroChart.prototype._calculateDimensions = function(fWidth, fHeight) {
		var maxX, maxY, minX, minY;
		maxX = maxY = minX = minY = undefined;
		var that = this;

		function calculateExtremums() {
			if (!that._isMinXValue || !that._isMaxXValue || !that._isMinYValue || !that._isMaxYValue) {
				var lines = that.getLines();
				if (that.getMaxThreshold()) {
					lines.push(that.getMaxThreshold());
				}

				if (that.getMinThreshold()) {
					lines.push(that.getMinThreshold());
				}

				if (that.getChart()) {
					lines.push(that.getChart());
				}

				if (that.getTarget()) {
					lines.push(that.getTarget());
				}

				if (that.getInnerMaxThreshold()) {
					lines.push(that.getInnerMaxThreshold());
				}

				if (that.getInnerMinThreshold()) {
					lines.push(that.getInnerMinThreshold());
				}

				for (var i = 0, numOfLines = lines.length; i < numOfLines; i++) {
					var aPoints = lines[i].getPoints();

					for (var counter = 0, a = aPoints.length; counter < a; counter++) {
						var tmpVal = aPoints[counter].getXValue();
						if (tmpVal > maxX || maxX === undefined) {
							maxX = tmpVal;
						}
						if (tmpVal < minX || minX === undefined) {
							minX = tmpVal;
						}

						tmpVal = aPoints[counter].getYValue();
						if (tmpVal > maxY || maxY === undefined) {
							maxY = tmpVal;
						}
						if (tmpVal < minY || minY === undefined) {
							minY = tmpVal;
						}
					}
				}
			}
			if (that._isMinXValue) {
				minX = that.getMinXValue();
			}

			if (that._isMaxXValue) {
				maxX = that.getMaxXValue();
			}

			if (that._isMinYValue) {
				minY = that.getMinYValue();
			}

			if (that._isMaxYValue) {
				maxY = that.getMaxYValue();
			}
		}

		calculateExtremums();

		var oResult = {
			minY: 0,
			minX: 0,
			maxY: fHeight,
			maxX: fWidth,
			lines: []
		};

		var kx;
		var fDeltaX = maxX - minX;

		if (fDeltaX > 0) {
			kx = fWidth / fDeltaX;
		} else if (fDeltaX == 0) {
			kx = 0;
			oResult.maxX /= 2;
		} else {
			jQuery.sap.log.warning("Min X is more than max X");
		}

		var ky;
		var fDeltaY = maxY - minY;

		if (fDeltaY > 0) {
			ky = fHeight / (maxY - minY);
		} else if (fDeltaY == 0) {
			ky = 0;
			oResult.maxY /= 2;
		} else {
			jQuery.sap.log.warning("Min Y is more than max Y");
		}

		function calculateCoordinates(line) {
			var bRtl = sap.ui.getCore().getConfiguration().getRTL();

			var fnCalcX = function(fValue) {
				var x = kx * (fValue - minX);

				if (bRtl) {
					x = oResult.maxX - x;
				}
				return x;
			};

			var fnCalcY = function(fValue) {
				return oResult.maxY - ky * (fValue - minY);
			};

			var aResult = [];
			if (line && kx != undefined && ky != undefined) {
				var aPoints = line.getPoints();
				var iLength = aPoints.length;
				var xi, yi, tmpXValue, tmpYValue;

				if (iLength == 1) {
					tmpXValue = aPoints[0].getXValue();
					tmpYValue = aPoints[0].getYValue();

					if (tmpXValue == undefined ^ tmpYValue == undefined) {
						var xn, yn;
						if (tmpXValue == undefined) {
							yn = yi = fnCalcY(tmpYValue);
							xi = oResult.minX;
							xn = oResult.maxX;
						} else {
							xn = xi = fnCalcX(tmpXValue);
							yi = oResult.minY;
							yn = oResult.maxY;
						}

						aResult.push({x: xi, y: yi}, {x: xn, y: yn});
					} else {
						jQuery.sap.log.warning("Point with coordinates [" + tmpXValue + " " + tmpYValue + "] ignored");
					}
				} else {
					for (var i = 0; i < iLength; i++) {
						tmpXValue = aPoints[i].getXValue();
						tmpYValue = aPoints[i].getYValue();

						if (tmpXValue != undefined && tmpYValue != undefined) {
							xi = fnCalcX(tmpXValue);
							yi = fnCalcY(tmpYValue);

							aResult.push({x: xi, y: yi});
						} else {
							jQuery.sap.log.warning("Point with coordinates [" + tmpXValue + " " + tmpYValue + "] ignored");
						}
					}
				}
			}
			return aResult;
		}

		oResult.maxThreshold = calculateCoordinates(that.getMaxThreshold());
		oResult.minThreshold = calculateCoordinates(that.getMinThreshold());
		oResult.chart = calculateCoordinates(that.getChart());
		oResult.target = calculateCoordinates(that.getTarget());
		oResult.innerMaxThreshold = calculateCoordinates(that.getInnerMaxThreshold());
		oResult.innerMinThreshold = calculateCoordinates(that.getInnerMinThreshold());

		var iLength = that.getLines().length;
		for (var i = 0; i < iLength; i++) {
			oResult.lines.push(calculateCoordinates(that.getLines()[i]));
		}
		return oResult;
	};

	/**
	 * Property setter for the Min X value
	 *
	 * @param {float} value - new value Min X
	 * @param {boolean} bSuppressInvalidate - Suppress in validate
	 * @returns {void}
	 * @public
	 */
	AreaMicroChart.prototype.setMinXValue = function(value, bSuppressInvalidate) {
		this._isMinXValue = this._isNumber(value);

		return this.setProperty("minXValue", this._isMinXValue ? value : NaN, bSuppressInvalidate);
	};

	/**
	 * Property setter for the Max X value
	 *
	 * @param {float} value - new value Max X
	 * @param {boolean} bSuppressInvalidate - Suppress in validate
	 * @returns {void}
	 * @public
	 */
	AreaMicroChart.prototype.setMaxXValue = function(value, bSuppressInvalidate) {
		this._isMaxXValue = this._isNumber(value);

		return this.setProperty("maxXValue", this._isMaxXValue ? value : NaN, bSuppressInvalidate);
	};

	/**
	 * Property setter for the Min Y value
	 *
	 * @param {float} value - new value Min Y
	 * @param {boolean} bSuppressInvalidate - Suppress in validate
	 * @returns {void}
	 * @public
	 */
	AreaMicroChart.prototype.setMinYValue = function(value, bSuppressInvalidate) {
		this._isMinYValue = this._isNumber(value);

		return this.setProperty("minYValue", this._isMinYValue ? value : NaN, bSuppressInvalidate);
	};

	/**
	 * Property setter for the Max Y value
	 *
	 * @param {float} value - new value Max Y
	 * @param {boolean} bSuppressInvalidate - Suppress in validate
	 * @returns {void}
	 * @public
	 */
	AreaMicroChart.prototype.setMaxYValue = function(value, bSuppressInvalidate) {
		this._isMaxYValue = this._isNumber(value);

		return this.setProperty("maxYValue", this._isMaxYValue ? value : NaN, bSuppressInvalidate);
	};

	AreaMicroChart.prototype._isNumber = function(n) {
		return typeof n === 'number' && !isNaN(n) && isFinite(n);
	};

	AreaMicroChart.prototype.onBeforeRendering = function() {
		if (this._bUseIndex) {
			this._indexChartItems();
		}
		if (this.getIsResponsive() && !this.data("_parentRenderingContext") && jQuery.isFunction(this.getParent)) {
			this.data("_parentRenderingContext", this.getParent());
		}
		if (library._isInGenericTile(this)) {
			this.setIsResponsive(true);
			library._removeStandardMargins(this);
		}
	};

	AreaMicroChart.prototype.onAfterRendering = function() {
		var $Control = this.$();
		// Handles  responsiveness
		if (this.getIsResponsive()) {
			this._onResize($Control);
		} else {
			this._renderCanvas($Control);
		}
	};

	AreaMicroChart._CHARTITEM_AGGREGATIONS = ["chart", "target", "minThreshold", "maxThreshold", "innerMinThreshold", "innerMaxThreshold"];

	/**
	 * Applies numeric indices to the x-coordinates of all points in all AreaMicroChartItem aggregations in order to have them be enumerable.
	 * This simple enumeration causes an equidistant point distribution on the x-axis.
	 *
	 * @private
	 */
	AreaMicroChart.prototype._indexChartItems = function() {
		var oChartItem, n = AreaMicroChart._CHARTITEM_AGGREGATIONS.length;
		for (var i = 0; i < n; i++) {
			oChartItem = this.getAggregation(AreaMicroChart._CHARTITEM_AGGREGATIONS[i]);
			if (oChartItem) {
				this._indexChartItemPoints(oChartItem);
			}
		}
	};

	/**
	 * Sets the property "x" of all points in the given AreaMicroChartItem to their respective index in the "points" aggregation.
	 *
	 * @param {sap.suite.ui.microchart.AreaMicroChartItem} chartItem The AreaMicroChartItem whose points are to be indexed.
	 * @private
	 */
	AreaMicroChart.prototype._indexChartItemPoints = function(chartItem) {
		var oPoints = chartItem.getPoints();
		for (var i = 0; i < oPoints.length; i++) {
			oPoints[i].setProperty("x", i, true);
		}
	};

	/**
	 * Enables x-values of all points are automatically indexed with numeric, equidistant values.
	 *
	 * @param {boolean} useIndex
	 * @protected
	 */
	AreaMicroChart.prototype.enableXIndexing = function(useIndex) {
		this._bUseIndex = useIndex;
	};

	/**
	 * Handles the responsiveness.
	 *
	 * @private
	 * @param {Object} $Control The chart control object
	 */
	AreaMicroChart.prototype._onResize = function($Control) {
		$Control.addClass("sapSuiteMicroChartsResponsive");
		this._adjustToParent($Control);
		this._resizeHorizontally($Control);
		this._resizeVertically($Control);
	};

	/**
	 * Handles the orientation change. The position and width of the canvas need to be
	 * recalculated after an orientation change.
	 *
	 * @private
	 */
	AreaMicroChart.prototype._onOrientationChange = function() {
		this._renderCanvas(this.$());
	};

	/**
	 * Adjusts the height and width of the whole control if this is required depending on parent control.
	 *
	 * @private
	 * @param {Object} the control object
	 */
	AreaMicroChart.prototype._adjustToParent = function($Control) {
		if (this.data("_parentRenderingContext") && this.data("_parentRenderingContext") instanceof sap.m.FlexBox) {
			// Subtracts two pixels, otherwise there's not enough space for the outline, and the chart won't be rendered properly
			var $Parent = this.data("_parentRenderingContext").$();
			var iParentWidth = parseFloat($Parent.width()) - 2;
			var iParentHeight = parseFloat($Parent.height()) - 2;
			$Control.outerWidth(iParentWidth);
			$Control.outerHeight(iParentHeight);
		}
	};

	/**
	 * Resizes the chart vertically. If the height of the chart is less or equal to min-height (less), it hides the chart. Assuming that all the css has already been loaded and are available.
	 *
	 * @private
	 * @param {Object} $Control The chart control object
	 */
	AreaMicroChart.prototype._resizeVertically = function($Control) {
		var iCurrentControlHeight = parseFloat($Control.css("height")),
		$Canvas = $Control.find(".sapSuiteAMCCanvas"),
		iCurrentCanvasContentHeight = parseFloat($Canvas.css("height"));

		// Hides the canvas' content if needed
		if (iCurrentCanvasContentHeight <= AreaMicroChart.EDGE_CASE_HEIGHT_SHOWCANVAS) {
			$Canvas.hide();
		} else {
			this._renderCanvas($Control);
		}
		// Resizes the fonts
		if (iCurrentControlHeight <= AreaMicroChart.EDGE_CASE_HEIGHT_RESIZEFONT) {
			$Control.addClass("sapSuiteAMCSmallFont");
		}
		// Hides the top labels EDGE_CASE_HEIGHT_SHOWBOTTOMLABEL
		if (iCurrentControlHeight <= AreaMicroChart.EDGE_CASE_HEIGHT_SHOWTOPLABEL) {
			$Control.find(".sapSuiteAMCPositionTop.sapSuiteAMCLabels").hide();
		}
		// Hides the bottom labels
		if (iCurrentControlHeight <= AreaMicroChart.EDGE_CASE_HEIGHT_SHOWBOTTOMLABEL) {
			$Control.find(".sapSuiteAMCPositionBtm.sapSuiteAMCLabels").hide();
		}
	};

	/**
	 * Resizes the chart horizontally. If the width of the chart is less or equal to min-width (less), it hides the chart. Assumes that all the css has already been loaded and are available.
	 *
	 * @private
	 * @param {Object} $Control The chart control object
	 */
	AreaMicroChart.prototype._resizeHorizontally = function($Control) {
		var iCurrentControlWidth = parseFloat($Control.css("width"));
		var $TopLabelContainer = $Control.find(".sapSuiteAMCPositionTop.sapSuiteAMCLabels");
		var $BottomLabelContainer = $Control.find(".sapSuiteAMCPositionBtm.sapSuiteAMCLabels");
		// Hides the chart if needed
		if (iCurrentControlWidth <= AreaMicroChart.EDGE_CASE_WIDTH_SHOWCHART){
			$Control.hide();
		} else {
			this._renderCanvas($Control);
			// Resizes the fonts
			if (iCurrentControlWidth <= AreaMicroChart.EDGE_CASE_WIDTH_RESIZEFONT) {
				$Control.addClass("sapSuiteAMCSmallFont");
			}
			// Hides the labels if truncated
			this._isTruncatedLabel($Control, $TopLabelContainer);
			this._isTruncatedLabel($Control, $BottomLabelContainer);
		}
	};

	/**
	 * If any label within the given label container is truncated, first tries to decrease the font used in the whole chart. If any truncated label found afterwards, hides given parent container.
	 * @private
	 */
	AreaMicroChart.prototype._isTruncatedLabel = function($Control, $LabelContainer) {
		var $Labels = $LabelContainer.find(".sapSuiteAMCLbl");
		for (var i = 0; i < $Labels.size(); i++){
			if ($Labels[i].offsetWidth < $Labels[i].scrollWidth){
				$Control.addClass("sapSuiteAMCSmallFont");
			}
			if ($Labels[i].offsetWidth < $Labels[i].scrollWidth){
				$LabelContainer.hide();
				return;
			}
		}
	};

	AreaMicroChart.prototype.ontap = function(oEvent) {
		if (sap.ui.Device.browser.internet_explorer) {
			this.$().focus();
		}
		this.firePress();
	};

	AreaMicroChart.prototype.onkeydown = function(oEvent) {
		if (oEvent.which == jQuery.sap.KeyCodes.SPACE) {
			oEvent.preventDefault();
		}
	};

	AreaMicroChart.prototype.onkeyup = function(oEvent) {
		if (oEvent.which == jQuery.sap.KeyCodes.ENTER || oEvent.which == jQuery.sap.KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	AreaMicroChart.prototype.attachEvent = function(sEventId, oData, fnFunction, oListener) {
		sap.ui.core.Control.prototype.attachEvent.call(this, sEventId, oData, fnFunction, oListener);

		if (this.hasListeners("press")) {
			this.$().attr("tabindex", 0).addClass("sapSuiteUiMicroChartPointer");
		}

		return this;
	};

	AreaMicroChart.prototype.detachEvent = function(sEventId, fnFunction, oListener) {
		sap.ui.core.Control.prototype.detachEvent.call(this, sEventId, fnFunction, oListener);

		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex").removeClass("sapSuiteUiMicroChartPointer");
		}
		return this;
	};

	AreaMicroChart.prototype._getLocalizedColorMeaning = function(sColor) {
		return this._oRb.getText(("SEMANTIC_COLOR_" + sColor).toUpperCase());
	};

	AreaMicroChart.prototype.getAltText = function() {
		var sAltText = "";
		var oFirstXLabel = this.getFirstXLabel();
		var oFirstYLabel = this.getFirstYLabel();
		var oLastXLabel = this.getLastXLabel();
		var oLastYLabel = this.getLastYLabel();
		var oMinLabel = this.getMinLabel();
		var oMaxLabel = this.getMaxLabel();
		var oActual = this.getChart();
		var oTarget = this.getTarget();
		var bIsFirst = true;
		if (oFirstXLabel && oFirstXLabel.getLabel() || oFirstYLabel && oFirstYLabel.getLabel()) {
			sAltText += (bIsFirst ? "" : "\n") + this._oRb.getText(("AREAMICROCHART_START")) + ": " + (oFirstXLabel ? oFirstXLabel.getLabel() : "") + " " + (oFirstYLabel ? oFirstYLabel.getLabel()  + " " + this._getLocalizedColorMeaning(oFirstYLabel.getColor()) : "");
			bIsFirst = false;
		}
		if (oLastXLabel && oLastXLabel.getLabel() || oLastYLabel && oLastYLabel.getLabel()) {
			sAltText += (bIsFirst ? "" : "\n") + this._oRb.getText(("AREAMICROCHART_END")) + ": " + (oLastXLabel ? oLastXLabel.getLabel() : "") + " " + (oLastYLabel ? oLastYLabel.getLabel()  + " " + this._getLocalizedColorMeaning(oLastYLabel.getColor()) : "");
			bIsFirst = false;
		}
		if (oMinLabel && oMinLabel.getLabel()) {
			sAltText += (bIsFirst ? "" : "\n") + this._oRb.getText(("AREAMICROCHART_MINIMAL_VALUE")) + ": " + oMinLabel.getLabel() + " " + this._getLocalizedColorMeaning(oMinLabel.getColor());
			bIsFirst = false;
		}
		if (oMaxLabel && oMaxLabel.getLabel()) {
			sAltText += (bIsFirst ? "" : "\n") + this._oRb.getText(("AREAMICROCHART_MAXIMAL_VALUE")) + ": " + oMaxLabel.getLabel() + " " + this._getLocalizedColorMeaning(oMaxLabel.getColor());
			bIsFirst = false;
		}
		if (oActual && oActual.getPoints() && oActual.getPoints().length > 0) {
			sAltText += (bIsFirst ? "" : "\n") + this._oRb.getText(("AREAMICROCHART_ACTUAL_VALUES")) + ":";
			bIsFirst = false;
			var aActual = oActual.getPoints();
			for (var i = 0; i < aActual.length; i++) {
				sAltText += " " + aActual[i].getY();
			}
		}
		if (oTarget && oTarget.getPoints() && oTarget.getPoints().length > 0) {
			sAltText += (bIsFirst ? "" : "\n") + this._oRb.getText(("AREAMICROCHART_TARGET_VALUES")) + ":";
			var aTarget = oTarget.getPoints();
			for (var j = 0; j < aTarget.length; j++) {
				sAltText += " " + aTarget[j].getY();
			}
		}

		for (var k = 0; k < this.getLines().length; k++) {
			var oLine = this.getLines()[k];
			if (oLine.getPoints() && oLine.getPoints().length > 0) {
				sAltText += (bIsFirst ? "" : "\n") + oLine.getTitle() + ":";
				var aLine = oLine.getPoints();
				for (var y = 0; y < aLine.length; y++) {
					sAltText += " " + aLine[y].getY();
				}

				if (this.getColorPalette().length == 0) {
					sAltText += " " + this._getLocalizedColorMeaning(oLine.getColor());
				}
			}
		}
		return sAltText;
	};



	AreaMicroChart.prototype.getTooltip_AsString = function() {
		var oTooltip = this.getTooltip();
		var sTooltip = this.getAltText();

		if (typeof oTooltip === "string" || oTooltip instanceof String) {
			sTooltip = oTooltip.split("{AltText}").join(sTooltip).split("((AltText))").join(sTooltip);
			return sTooltip;
		} else if (this.isBound("tooltip") && !oTooltip) {
			return sTooltip;
		}
		return oTooltip ? oTooltip : "";
	};

	AreaMicroChart.prototype.clone = function(sIdSuffix, aLocalIds, oOptions) {
		var oClone = sap.ui.core.Control.prototype.clone.apply(this, arguments);
		oClone._isMinXValue = this._isMinXValue;
		oClone._isMaxXValue = this._isMaxXValue;
		oClone._isMinYValue = this._isMinYValue;
		oClone._isMaxYValue = this._isMaxYValue;
		return oClone;
	};

	AreaMicroChart.prototype.exit = function() {
		if (sap.ui.Device.system.tablet || sap.ui.Device.system.phone) {
			sap.ui.Device.orientation.detachHandler(this._onOrientationChange, this);
		}
	};
	return AreaMicroChart;

});
