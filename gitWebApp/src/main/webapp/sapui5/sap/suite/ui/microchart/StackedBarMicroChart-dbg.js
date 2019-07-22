/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.microchart.StackedBarMicroChart.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/Size', 'sap/m/ValueColor', 'sap/ui/Device'],
	function(jQuery, library, Control, Size, ValueColor, Device) {
	"use strict";

	/**
	 * Constructor for a new StackedBarMicroChart control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Illustrates values as stacked and colored bar charts displaying numeric values (as absolute values or percentages) inside the bars.
	 * @extends sap.ui.core.Control
	 *
	 * @version 1.44.4
	 *
	 * @public
	 * @alias sap.suite.ui.microchart.StackedBarMicroChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var StackedBarMicroChart = Control.extend("sap.suite.ui.microchart.StackedBarMicroChart", /** @lends sap.suite.ui.microchart.StackedBarMicroChart.prototype */ {
		metadata : {
			library: "sap.suite.ui.microchart",
			properties: {
				/**
				 * The size of the chart. If not set, the default size is applied based on the size of the device tile.
				 */
				size: {type: "sap.m.Size", group: "Appearance", defaultValue: "Auto"},
				/**
				 * The maximum scale value for the chart
				 */
				maxValue: {type: "float", group: "Appearance", defaultValue: null},
				/**
				 * The precision of the rounding for the calculated percentage values of the bars. It defines how many digits after the decimal point are displayed. The default is set to 1 digit.
				 */
				precision: {type: "int", group: "Appearance", defaultValue: 1}
			},
			defaultAggregation : "bars",
			aggregations: {
				/**
				 * The stacked bar chart items.
				 */
				bars: {type: "sap.suite.ui.microchart.StackedBarMicroChartBar", multiple: true, bindable : "bindable"}
			},
			events: {
				/**
				 * The event is fired when the user chooses the microchart.
				 */
				press : {}
			}
		}});

	StackedBarMicroChart.EDGE_CASE_HIDE_CHART = 12; // 0.75rem
	StackedBarMicroChart.EDGE_CASE_HEIGHT_SHOW_VALUES = 14; // 0.875rem
	StackedBarMicroChart.BAR_COLOR_PARAM_DEFAULT = "sapUiChart";
	StackedBarMicroChart.BAR_LABEL_CSSCLASS = ".sapSuiteStackedMCBarLabel";
	StackedBarMicroChart.BAR_CSSCLASS = ".sapSuiteStackedMCBar";

	/* =========================================================== */
	/* API events */
	/* =========================================================== */
	StackedBarMicroChart.prototype.attachEvent = function(sEventId, oData, fnFunction, oListener) {
		Control.prototype.attachEvent.call(this, sEventId, oData, fnFunction, oListener);
		if (this.hasListeners("press")) {
			this.$().attr("tabindex", 0).addClass("sapSuiteUiMicroChartPointer");
		}

		return this;
	};

	StackedBarMicroChart.prototype.detachEvent = function(sEventId, fnFunction, oListener) {
		Control.prototype.detachEvent.call(this, sEventId, fnFunction, oListener);
		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex").removeClass("sapSuiteUiMicroChartPointer");
		}
		return this;
	};

	/**
	 * Handler for click button event
	 */
	StackedBarMicroChart.prototype.onclick = function(oEvent) {
		if (Device.browser.msie || Device.browser.edge) {
			this.$().focus();
		}
		this.firePress();
	};

	/**
	 * Handler for space button event
	 */
	StackedBarMicroChart.prototype.onsapspace = StackedBarMicroChart.prototype.onclick;

	/**
	 * Handler for enter button event
	 */
	StackedBarMicroChart.prototype.onsapenter = StackedBarMicroChart.prototype.onclick;

	/* =========================================================== */
	/* API methods */
	/* =========================================================== */
	StackedBarMicroChart.prototype.setMaxValue = function(fMaxValue) {
		var bMaxValueValid = jQuery.isNumeric(fMaxValue);
		this.setProperty("maxValue", bMaxValueValid ? fMaxValue : null);
		return this;
	};

	StackedBarMicroChart.prototype.setTooltip = function(tooltip) {
		this._title = null;
		this.setAggregation("tooltip", tooltip, true);
	};

	StackedBarMicroChart.prototype.getTooltip_AsString = function() {
		var aChartData = this._calculateChartData();
		return this._getTooltip(aChartData);
	};

	/* =========================================================== */
	/* Protected methods */
	/* =========================================================== */
	StackedBarMicroChart.prototype.init = function() {
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.microchart");
		this.setAggregation("tooltip", "{AltText}", true);
		this._bThemeApplied = true;
		if (!sap.ui.getCore().isInitialized()) {
			this._bThemeApplied = false;
			sap.ui.getCore().attachInit(this._handleCoreInitialized.bind(this));
		} else {
			this._handleCoreInitialized();
		}
	};

	/**
	 * Handler for the core's init event. In order for the control to be rendered only if all themes are loaded
	 * and everything is properly initialized, we attach a theme check in here.
	 *
	 * @private
	 */
	StackedBarMicroChart.prototype._handleCoreInitialized = function() {
		this._bThemeApplied = sap.ui.getCore().isThemeApplied();
		if (!this._bThemeApplied) {
			sap.ui.getCore().attachThemeChanged(this._handleThemeApplied, this);
		}
	};

	/**
	 * The StackedBarMicroChart is not being rendered until the theme was applied.
	 * If the theme is applied, rendering starts by the control itself.
	 *
	 * @private
	 */
	StackedBarMicroChart.prototype._handleThemeApplied = function() {
		this._bThemeApplied = true;
		this.invalidate();
		sap.ui.getCore().detachThemeChanged(this._handleThemeApplied, this);
	};

	StackedBarMicroChart.prototype.onBeforeRendering = function() {
		if (library._isInGenericTile(this)) {
			library._removeStandardMargins(this);
		}

		this.$().unbind("mouseenter", this._addTitleAttribute);
		this.$().unbind("mouseleave", this._removeTitleAttribute);
	};

	StackedBarMicroChart.prototype.onAfterRendering = function() {
		Device.media.attachHandler(this._onResize, this);
		this._onResize();

		//attaches handler for mouse enter event
		this.$().bind("mouseenter", this._addTitleAttribute.bind(this));
		this.$().bind("mouseleave", this._removeTitleAttribute.bind(this));
	};

	/* =========================================================== */
	/* Private methods */
	/* =========================================================== */
	/**
	 * Returns the localized text corresponding to the semantic color
	 *
	 * @private
	 * @param {String} color The semantic color
	 * @returns {String} localized semantic color text
	 */
	StackedBarMicroChart.prototype._getLocalizedColorMeaning = function(color) {
		return this._oRb.getText(("SEMANTIC_COLOR_" + color).toUpperCase());
	};

	/**
	 * Calculates the width in percents of chart bars' elements accordingly with provided chart values.
	 *
	 * @private
	 * @returns {Array} array of calculated values for each chart bar.
	 */
	StackedBarMicroChart.prototype._calculateChartData = function() {
		var aCalculatedData = [];
		var aData = this.getBars();
		var iItemsCount = aData.length;
		var iCPLength = 12;
		var iCPIndex = 1;
		var iPrecision = this.getPrecision();

		var fnNextColor = function() {
			if (iCPLength) {
				if (iCPIndex === iCPLength) {
					iCPIndex = 1;
				}
				return StackedBarMicroChart.BAR_COLOR_PARAM_DEFAULT + (iCPIndex++);
			}
		};

		// calculates the max width
		var fTotalValue = 0;
		var fMaxValue = this.getMaxValue();
		for (var i = 0; i < iItemsCount; i++) {
			if (!isNaN(aData[i].getValue())) {
				fTotalValue = fTotalValue + aData[i].getValue();
			}
		}
		var fTotal = Math.max(fMaxValue, fTotalValue);
		var bValidMaxValue = fMaxValue >= fTotalValue;

		// calculates the items percentages
		var fPercTotal = 0;
		var fWidthPercTotal = 0;
		for (var i = 0; i < iItemsCount; i++) {
			var oItem = {};
			oItem.oBarData = aData[i];

			// color
			oItem.color = aData[i].getValueColor();
			if (!oItem.color) {
				oItem.color = fnNextColor();
			}

			// value
			var fItemValue = isNaN(aData[i].getValue()) ? 0 : aData[i].getValue();
			var fValueNotRounded = fTotal === 0 ? 0 : fItemValue * 100 / fTotal;
			oItem.value = this._roundFloat(fValueNotRounded, iPrecision);
			oItem.width = this._roundFloat(fValueNotRounded, 2);
			// increase total
			fPercTotal = fPercTotal + oItem.value;
			fWidthPercTotal = fWidthPercTotal + oItem.width;

			// display value
			if (bValidMaxValue) {
				// absolute value
				oItem.displayValue = aData[i].getDisplayValue() || String(fItemValue);
			} else {
				// percentage value
				oItem.displayValue = aData[i].getDisplayValue() || String(oItem.value + "%");
			}

			aCalculatedData.push(oItem);
		}
		fPercTotal = this._roundFloat(fPercTotal, iPrecision);
		fWidthPercTotal = this._roundFloat(fWidthPercTotal, 2);

		// total > 100% (can make problems by displaying the bars on the same line)
		if (fWidthPercTotal > 100 && aCalculatedData.length > 0) {
			var oMax = aCalculatedData.slice(0).sort(function(a, b) { return b.width - a.width; })[0];
			oMax.width = this._roundFloat(oMax.width - fWidthPercTotal + 100, 2);
		}

		// calculates the transparent bar percentage
		if (fMaxValue > fTotalValue) {
			var oItem = {};
			oItem.value = this._roundFloat(100 - fPercTotal, iPrecision);
			oItem.width = this._roundFloat(100 - fWidthPercTotal, 2);
			aCalculatedData.push(oItem);
		} else if (aCalculatedData.length > 0 && fWidthPercTotal < 100) {
			// total < 100%: avoiding empty space
			var oMax = aCalculatedData.slice(0).sort(function(a, b) { return b.width - a.width; })[0];
			oMax.width = this._roundFloat(oMax.width - fWidthPercTotal + 100, 2);
		}

		return aCalculatedData;
	};

	/**
	 * Rounds the number to float with the specified precision
	 *
	 * @private
	 * @param {Object} number The number to be rounded
	 * @param {Int} precision The rounding precision
	 * @returns {Object} the rounded object
	 */
	StackedBarMicroChart.prototype._roundFloat = function(number, precision) {
		return parseFloat(number.toFixed(precision));
	};

	/**
	 * Conducts size adjustments that are necessary if the dimensions of the chart change.
	 *
	 * @private
	 */
	StackedBarMicroChart.prototype._onResize = function() {
		var $Control = this.$();
		if (this.getSize() === Size.Responsive) {
			this._adjustToParent($Control);
		}
		this._resizeVertically($Control);
		this._resizeHorizontally($Control);
	};

	/**
	 * Adjusts the height and width of the whole control depending on parent control.
	 *
	 * @private
	 * @param {Object} the control object
	 */
	StackedBarMicroChart.prototype._adjustToParent = function($Control) {
		var sParentHeight, sParentWidth;
		var oParent = this.getParent();
		if (!oParent) {
			return;
		}

		if (oParent instanceof sap.m.FlexBox) {
			sParentHeight = parseInt(oParent.$().height(), 10);
			sParentWidth = parseInt(oParent.$().width(), 10);
		} else if (oParent instanceof sap.m.TileContent) {
			sParentHeight = parseInt(oParent.$().children().height(), 10);
			sParentWidth = parseInt(oParent.$().children().width(), 10);
		} else if (jQuery.isFunction(oParent.getRootNode)) {
			sParentHeight = Math.round(jQuery(oParent.getRootNode()).height());
			sParentWidth = Math.round(jQuery(oParent.getRootNode()).width());
		}
		if (sParentHeight > 0) {
			$Control.height(sParentHeight);
		}
		if (sParentWidth > 0) {
			$Control.width(sParentWidth);
		}
	};

	/**
	 * Performs vertical responsiveness adjustment.
	 *
	 * @private
	 * @param {Object} the control object
	 */
	StackedBarMicroChart.prototype._resizeVertically = function($Control) {
		var iBarHeight = parseFloat($Control.find(StackedBarMicroChart.BAR_CSSCLASS).height(), 10);
		var iChartHeight = parseFloat($Control.height(), 10);

		if (iChartHeight < StackedBarMicroChart.EDGE_CASE_HIDE_CHART) {
			$Control.hide();
			return;
		}
		if (iChartHeight > iBarHeight) {
			$Control.height(iBarHeight);
		}
		if (iBarHeight < StackedBarMicroChart.EDGE_CASE_HEIGHT_SHOW_VALUES) {
			$Control.find(StackedBarMicroChart.BAR_LABEL_CSSCLASS).hide();
		} else {
			$Control.find(StackedBarMicroChart.BAR_LABEL_CSSCLASS).css("line-height", iBarHeight + "px");
		}
	};

	/**
	 * Performs horizontal responsiveness adjustment.
	 *
	 * @private
	 * @param {Object} the control object
	 */
	StackedBarMicroChart.prototype._resizeHorizontally = function($Control) {
		var iWidth = parseFloat($Control.width(), 10);

		if (iWidth < StackedBarMicroChart.EDGE_CASE_HIDE_CHART) {
			$Control.hide();
		}
		this._hideTruncatedLabel($Control, StackedBarMicroChart.BAR_LABEL_CSSCLASS);
	};

	/**
	 * Checks if any label of the specified CSS class on the chart is truncated or not matching inside the area;
	 * If yes, do not show the label
	 *
	 * @private
	 * @param {Object} $Control The control object
	 * @param {String} classSelector The class selector
	 */
	StackedBarMicroChart.prototype._hideTruncatedLabel = function($Control, classSelector) {
		var $Labels = $Control.find(classSelector);
		for (var i = 0; i < $Labels.length; i++) {
			if ($Labels[i].offsetWidth < $Labels[i].scrollWidth - 1) {
				$Control.find($Labels[i]).hide();
			}
		}
	};

	/**
	 * Returns text for ARIA label.
	 * If tooltip was set to an empty string (using whitespaces) by the application or the tooltip was not set (null/undefined),
	 * the ARIA text gets generated by the control. Otherwise, the given tooltip will also be set as ARIA text.
	 *
	 * @private
	 * @param {Object} classSelector The class selector
	 * @returns {String} chartData The data needed for the chart to be displayed
	 */
	StackedBarMicroChart.prototype._createTooltipText = function(chartData) {
		var sTooltipText = "";
		if (this._isTooltipSuppressed()) {
			return sTooltipText;
		}
		for (var i = 0; i < chartData.length; i++) {
			var oData = chartData[i];
			if (oData.displayValue) {
				sTooltipText += ((i === 0) ? "" : "\n") + oData.displayValue;
				if (ValueColor[oData.color]) {
					sTooltipText += " " + this._getLocalizedColorMeaning(oData.color);
				}
			}
		}

		return sTooltipText;
	};

	/**
	 * Returns the tooltip for the given chart.
	 * If tooltip was set to an empty string (using whitespaces) by the application, the tooltip will be set to an empty string.
	 * If tooltip was not set (null/undefined), a tooltip gets generated by the control.
	 *
	 * @private
	 * @param {String} chartData The data needed for the chart to be displayed
	 * @returns {string} tooltip for the given control
	 */
	StackedBarMicroChart.prototype._getTooltip  = function(chartData) {
		if (this._isTooltipSuppressed()) {
			return null;
		}
		var oTooltip = this.getTooltip();
		var sTooltip = this._createTooltipText(chartData);

		if (typeof oTooltip === "string" || oTooltip instanceof String) {
			sTooltip = oTooltip.split("{AltText}").join(sTooltip).split("((AltText))").join(sTooltip);
			return sTooltip;
		} else if (this.isBound("tooltip") && !oTooltip) {
			return sTooltip;
		}
		return oTooltip;
	};

	/**
	 * Returns value that indicates if the tooltip was configured as empty string (e.g. one whitespace).
	 *
	 * @private
	 * @returns {boolean} value that indicates true, if whitespace was set, false in any other case, also null/undefined
	 */
	StackedBarMicroChart.prototype._isTooltipSuppressed = function() {
		var sTooltip = this.getTooltip();
		if (sTooltip && jQuery.trim(sTooltip).length === 0) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Adds title attribute to show tooltip when the mouse enters chart.
	 *
	 * @private
	 */
	StackedBarMicroChart.prototype._addTitleAttribute = function() {
		if (this.$().attr("title")) {
			return;
		}
		if (!this._title) {
			var aChartData = this._calculateChartData();
			this._title = this._getTooltip(aChartData);
		}
		if (this._title) {
			this.$().attr("title", this._title);
		}
	};

	/**
	 * Removes title attribute to let tooltip disappear when the mouse left the chart.
	 *
	 * @private
	 */
	StackedBarMicroChart.prototype._removeTitleAttribute = function() {
		if (this.$().attr("title")) {
			this._title = this.$().attr("title");
			this.$().removeAttr("title");
		}
	};

	return StackedBarMicroChart;

});