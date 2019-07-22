/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

// This file defines behavior for the control.
sap.ui.define([ 'jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/Size' ],
	function(jQuery, library, Control, Size) {
	"use strict";

	/**
	 * The configuration of the graphic element on the chart.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Displays a pie chart with highlighted sectors.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 *
	 * @public
	 * @alias sap.suite.ui.microchart.HarveyBallMicroChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var HarveyBallMicroChart = Control.extend("sap.suite.ui.microchart.HarveyBallMicroChart", /** @lends sap.suite.ui.microchart.HarveyBallMicroChart.prototype */ {
		metadata : {
			library: "sap.suite.ui.microchart",
			properties: {

				/**
				 * The total value. This is taken as 360 degrees value on the chart.
				 */
				total: {group:"Misc", type:"float", defaultValue: null},

				/**
				 * The total label. If specified, it is displayed instead of the total value.
				 */
				totalLabel: {group:"Misc", type:"string"},

				/**
				The scaling factor that is displayed next to the total value.
				*/
				totalScale: {group:"Misc", type:"string"},

				/**
				If set to true, the totalLabel parameter is considered as the combination of the total value and its scaling factor. The default value is false. It means that the total value and the scaling factor are defined separately by the total and the totalScale properties accordingly.
				*/
				formattedLabel: {group:"Misc", type:"boolean", defaultValue:false},

				/**
				If it is set to true, the total value is displayed next to the chart. The default setting is true.
				*/
				showTotal: {group:"Misc", type:"boolean", defaultValue:true},

				/**
				If it is set to true, the fraction values are displayed next to the chart. The default setting is true.
				*/
				showFractions: {group:"Misc", type:"boolean", defaultValue:true},

				/**
				The size of the chart. If it is not set, the default size is applied based on the device type.
				*/
				size: {group:"Misc", type:"sap.m.Size", defaultValue:"Auto"},

				/**
				The color palette for the chart. If this property is set, semantic colors defined in HarveyBallMicroChart are ignored. Colors from the palette are assigned to each slice consequentially. When all the palette colors are used, assignment of the colors begins from the first palette color.
				*/
				colorPalette: {type: "string[]", group : "Appearance", defaultValue : [] },

				/**
				The width of the chart. If it is not set, the size of the control is defined by the size property.
				*/
				width: {group:"Misc", type:"sap.ui.core.CSSSize"},

				/**
				 * If this set to true, width and height of the control are determined by the width and height of the container in which the control is placed. Size and Width properties are ignored in such case.
				 * @since 1.38.0
				 */
				isResponsive: {type: "boolean", group: "Appearance", defaultValue: false}
			},
			events: {
				/**
				 * The event is fired when the user chooses the control.
				 */
				press: {}
			},
			defaultAggregation : "items",
			aggregations: {
				/**
				 * The set of points for this graphic element.
				 */
				"items": { multiple: true, type: "sap.suite.ui.microchart.HarveyBallMicroChartItem", bindable : "bindable" }
			}
		}
	});

	HarveyBallMicroChart._iSmallestChartSize = 24;
	HarveyBallMicroChart._iSmallestFontSize = 12;

	///**
	// * This file defines behavior for the control,
	// */
	HarveyBallMicroChart.prototype.getAltText = function() {
		var sAltText = "";
		var bIsFirst = true;

		var aItems = this.getItems();
		for (var i = 0; i < aItems.length; i++) {
			var oItem = aItems[i];
			var sColor = (this.getColorPalette().length == 0) ? this._rb.getText(("SEMANTIC_COLOR_" + oItem.getColor()).toUpperCase()) : "";
			var sLabel = oItem.getFractionLabel();
			var sScale = oItem.getFractionScale();
			if (!sLabel && sScale) {
				sLabel = oItem.getFormattedLabel() ? oItem.getFraction() : oItem.getFraction() + oItem.getFractionScale().substring(0,3);
			} else if (!oItem.getFormattedLabel() && oItem.getFractionLabel()) {
				sLabel += oItem.getFractionScale().substring(0,3);
			}

			sAltText += (bIsFirst ? "" : "\n") + sLabel + " " + sColor;
			bIsFirst = false;
		}

		if (this.getTotal()) {
			var sTLabel = this.getTotalLabel();
			if (!sTLabel) {
				sTLabel = this.getFormattedLabel() ? this.getTotal() : this.getTotal() + this.getTotalScale().substring(0,3);
			} else if (!this.getFormattedLabel()) {
				sTLabel += this.getTotalScale().substring(0,3);
			}

			sAltText += (bIsFirst ? "" : "\n") + this._rb.getText("HARVEYBALLMICROCHART_TOTAL_TOOLTIP") + " " + sTLabel;
		}
		return sAltText;
	};

	HarveyBallMicroChart.prototype.getTooltip_AsString = function() {
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

	HarveyBallMicroChart.prototype.init = function() {
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.microchart");
		this.setAggregation("tooltip", "{AltText}", true);
		sap.ui.Device.media.attachHandler(this.rerender, this, sap.ui.Device.media.RANGESETS.SAP_STANDARD);
		this._sChartResizeHandlerId = null;
		this._$Control = null;
		this._$ParentContainer = null;
		this._bThemeApplied = true;
		if (!sap.ui.getCore().isInitialized()) {
			this._bThemeApplied = false;
			sap.ui.getCore().attachInit(this._handleCoreInitialized.bind(this));
		} else {
			this._handleCoreInitialized();
		}
	};

	HarveyBallMicroChart.prototype.setSize = function(size) {
		if (size === Size.Responsive) {
			this.setIsResponsive(true);
		} else {
			this.setIsResponsive(false);
		}
		return this.setProperty("size", size, true);
	};

	/**
	 * Handler for the core's init event. In order for the control to be rendered only if all themes are loaded
	 * and everything is properly initialized, we attach a theme check in here.
	 *
	 * @private
	 */
	HarveyBallMicroChart.prototype._handleCoreInitialized = function() {
		this._bThemeApplied = sap.ui.getCore().isThemeApplied();
		if (!this._bThemeApplied) {
			sap.ui.getCore().attachThemeChanged(this._handleThemeApplied, this);
		}
	};

	/**
	 * The ColumnMicroChart is not being rendered until the theme was applied.
	 * If the theme is applied, rendering starts by the control itself.
	 *
	 * @private
	 */
	HarveyBallMicroChart.prototype._handleThemeApplied = function() {
		this._bThemeApplied = true;
		this.invalidate();
		sap.ui.getCore().detachThemeChanged(this._handleThemeApplied, this);
	};

	HarveyBallMicroChart.prototype.onBeforeRendering = function() {
		if (library._isInGenericTile(this)) {
			this.setIsResponsive(true);
			library._removeStandardMargins(this);
		}
	};

	HarveyBallMicroChart.prototype.onAfterRendering = function() {
		if (this.getIsResponsive()) {
			if (library._isInGenericTile(this)) {
				this._resizeForTileContent();
			} else {
				this._adjustToParent();
			}
			// If chart is smaller than 24, hides the chart
			if (this.$().width() < HarveyBallMicroChart._iSmallestChartSize || this.$().height() < HarveyBallMicroChart._iSmallestChartSize) {
				this.$().hide();
			}
			// If the font size is lower than 12, hides the texts
			if (!this._hideLabels()) {
				library._checkControlIsVisible(this, this._hideLabels);
			}
		}
	};

	HarveyBallMicroChart.prototype._adjustToParent = function() {
		// Checks that there's a getParent method available
		if (!jQuery.isFunction(this.getParent)) {
			return;
		}
		var oParent = this.getParent();
		if (jQuery.isFunction(oParent.getHeight)) {
			// Two pixels are subtracted from the original value. Otherwise, there's not enough space for the outline and it won't render correctly.
			var sParentHeight = parseFloat(oParent.$().height()) - 2;
			this.$().height(sParentHeight); //Required for rendering in page element. Otherwise element is cutted at the top.
			this.$().find("svg").height(sParentHeight);
		}
		if (jQuery.isFunction(oParent.getWidth)) {
			// Two pixels are subtracted from the original value. Otherwise, there's not enough space for the outline and it won't render correctly.
			var sParentWidth = parseFloat(oParent.$().width()) - 2;
			this.$().width(sParentWidth); //Required for rendering in page element. Otherwise element is cutted at the top.
			this.$().find("svg").width(sParentWidth);
		}
	};

	HarveyBallMicroChart.prototype._resizeForTileContent = function() {
		var sParentWidth = this.getParent().$().css("min-width");
		this.getParent().$().width(sParentWidth);
		if (sap.ui.Device.browser.msie || sap.ui.Device.browser.edge || sap.ui.Device.browser.chrome) {
			// 16 pixels are removed to compensate the margin and the padding.
			// Needs to be done for IE and Chrome because in some cases it is rendered only once.
			this.$().width(parseInt(sParentWidth, 10) - 16);
		}
	};

	HarveyBallMicroChart.prototype._hideLabels = function() {
		// Gets the font size of the two texts
		var iTextTopFontSize;
		var iTextBottomFontSize;
		var $TextTop = this.$().find("#sapSuiteHBMCTopText");
		var $TextBottom = this.$().find("#sapSuiteHBMCBottomText");
		if ($TextTop.length > 0) {
			iTextTopFontSize = $TextTop[0].getBoundingClientRect().height;
		}
		if ($TextBottom.length > 0) {
			iTextBottomFontSize = $TextBottom[0].getBoundingClientRect().height;
		}
		// If the font size is lower than 12, hides the texts
		if (iTextTopFontSize < HarveyBallMicroChart._iSmallestFontSize || iTextBottomFontSize < HarveyBallMicroChart._iSmallestFontSize) {
			this.$().find("text").hide();
			return true;
		}
	};

	HarveyBallMicroChart.prototype._parseFormattedValue = function(sValue) {
		return {
			scale: sValue.replace(/.*?([^+-.,\d]*)$/g, "$1").trim(),
			value: sValue.replace(/(.*?)[^+-.,\d]*$/g, "$1").trim()
		};
	};

	HarveyBallMicroChart.prototype.ontap = function(oEvent) {
		if (sap.ui.Device.browser.internet_explorer) {
			this.$().focus();
		}
		this.firePress();
	};

	HarveyBallMicroChart.prototype.onkeydown = function(oEvent) {
		if (oEvent.which == jQuery.sap.KeyCodes.SPACE) {
			oEvent.preventDefault();
		}
	};

	HarveyBallMicroChart.prototype.onkeyup = function(oEvent) {
		if (oEvent.which == jQuery.sap.KeyCodes.ENTER
				|| oEvent.which == jQuery.sap.KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	HarveyBallMicroChart.prototype.attachEvent = function(
			sEventId, oData, fnFunction, oListener) {
		sap.ui.core.Control.prototype.attachEvent.call(this, sEventId, oData,
				fnFunction, oListener);
		if (this.hasListeners("press")) {
			this.$().attr("tabindex", 0).addClass("sapSuiteUiMicroChartPointer");
		}
		return this;
	};

	HarveyBallMicroChart.prototype.detachEvent = function(
			sEventId, fnFunction, oListener) {
		sap.ui.core.Control.prototype.detachEvent.call(this, sEventId, fnFunction,
				oListener);
		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex").removeClass("sapSuiteUiMicroChartPointer");
		}
		return this;
	};

	HarveyBallMicroChart.prototype.exit = function(oEvent) {
		sap.ui.Device.media.detachHandler(this.rerender, this, sap.ui.Device.media.RANGESETS.SAP_STANDARD);
	};

	return HarveyBallMicroChart;

});
