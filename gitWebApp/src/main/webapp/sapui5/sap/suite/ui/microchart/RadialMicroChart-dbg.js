/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

// This file defines the behavior for the control.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/suite/ui/microchart/RadialMicroChartRenderer', 'sap/ui/Device'],
	function(jQuery, library, Control, Renderer, Device) {
	"use strict";

	/**
	 * Describes the configuration of the graphic element on the chart.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Displays a ring chart highlighting a current status. The status is displayed with a semantically colored radial bar and a percentage value.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 * @since 1.36.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.microchart.RadialMicroChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RadialMicroChart = Control.extend("sap.suite.ui.microchart.RadialMicroChart", /** @lends sap.suite.ui.microchart.RadialMicroChart.prototype */ {
		constructor : function(sId, mSettings) {
			var bPercentageMode;
			if (mSettings && typeof mSettings.percentage === "number"){
				bPercentageMode = true;
			} else if (sId && typeof sId.percentage === "number") {
				bPercentageMode = true;
			} else {
				bPercentageMode = false;
			}
			try {
				Control.apply(this, arguments);
				this._bPercentageMode = bPercentageMode;
			} catch (e) {
				this.destroy();
				throw e;
			}
		},

		metadata : {
			library: "sap.suite.ui.microchart",
			properties: {
				/**
				 * The total value. This is taken as 360 degrees value on the chart.
				 */
				total: {group:"Data", type:"float", defaultValue: null},

				/**
				 * The fraction of the total value that is displayed.
				 */
				fraction: {group:"Data", type:"float", defaultValue: null},

				/**
				 * The percentage that is displayed.
				 * When a percentage is set, properties total and fraction are not considered.
				 */
				percentage: {group:"Data", type:"float", defaultValue: null},

				/**
				 * The color shown in the completed path.
				 */
				valueColor: {group: "Appearance", type: "sap.m.ValueCSSColor", defaultValue: "Neutral"},

				/**
				 *The size of the chart. If it is not set, the Responsive size is used.
				 *Size XS is not supported
				 *@since 1.44.0
				 */
				size: {group:"Misc", type:"sap.m.Size", defaultValue:"Responsive"}
			},
			events: {
				/**
				 * The event is fired when the user chooses the control.
				 */
				press: {}
			}
		}
	});

	/* --- Lifecycle Handling --- */

	/**
	 * Init function for the control
	 */
	RadialMicroChart.prototype.init = function() {
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.microchart");
		this._bPercentageMode; // Flag for tracking if the application is using percentage or fraction and total

		this._bThemeApplied = true;
		if (!sap.ui.getCore().isInitialized()) {
			this._bThemeApplied = false;
			sap.ui.getCore().attachInit(this._handleCoreInitialized.bind(this));
		} else {
			this._handleCoreInitialized();
		}
	};

	/**
	 * Handler for the core's init event. In order for the control to be rendered only if all themes
	 * are loaded and everything is properly initialized, we attach a theme check in here.
	 *
	 * @private
	 */
	RadialMicroChart.prototype._handleCoreInitialized = function() {
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
	RadialMicroChart.prototype._handleThemeApplied = function() {
		this._bThemeApplied = true;
		this.invalidate();
		sap.ui.getCore().detachThemeChanged(this._handleThemeApplied, this);
	};

	RadialMicroChart.prototype.onBeforeRendering = function() {
		if (library._isInGenericTile(this)) {
			library._removeStandardMargins(this);
		}
		Device.orientation.detachHandler(this._adjustToTileContent, this);
		if (!this._bPercentageMode) {
			if (this.getTotal() === 0) {
				jQuery.sap.log.error("Total can not be 0, please add a valid total value");
			} else {
				this.setProperty("percentage", Math.round((this.getFraction() * 100 / this.getTotal()) * 10) / 10, true);
			}
		}
	};

	RadialMicroChart.prototype.onAfterRendering = function() {
		Renderer._handleOnAfterRendering(this);
		if (library._isInGenericTile(this)) {
			Device.orientation.attachHandler(this._adjustToTileContent, this);
		}
	};

	RadialMicroChart.prototype.exit = function() {
		Device.orientation.detachHandler(this._adjustToTileContent, this);
	};

	/**
	 * Performs the necessary adjustments in case of chart located inside of GenericTile control.
	 *
	 * @private
	 */
	RadialMicroChart.prototype._adjustToTileContent = function() {
		var sParentWidth = this.getParent().$().css("min-width");
		this.getParent().$().width(sParentWidth);
		this.$().width("100%");
	};

	/* --- Event Handling --- */

	RadialMicroChart.prototype.ontap = function(oEvent) {
		if (sap.ui.Device.browser.internet_explorer) {
			this.$().focus();
		}
		this.firePress();
	};

	RadialMicroChart.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			oEvent.preventDefault();
		}
	};

	RadialMicroChart.prototype.onkeyup = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ENTER || oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	RadialMicroChart.prototype.attachEvent = function(eventId, data, functionToCall, listener) {
		sap.ui.core.Control.prototype.attachEvent.call(this, eventId, data, functionToCall, listener);
		if (eventId === "press") {
			this.rerender();
		}
		return this;
	};

	RadialMicroChart.prototype.detachEvent = function(eventId, functionToCall, listener) {
		sap.ui.core.Control.prototype.detachEvent.call(this, eventId, functionToCall, listener);
		if (eventId === "press") {
			this.rerender();
		}
		return this;
	};

	/* --- Getters and Setters --- */

	/**
	 * Getter for internal property _bPercentageMode.
	 * Percentage mode is configured by setting a percentage value on definition of the control.
	 * If Fraction and Total is used, this property is false since percentage gets calculated automatically by the control.
	 *
	 * @private
	 * @returns {boolean} true if chart is in percentage mode, false if not.
	 */
	RadialMicroChart.prototype._getPercentageMode = function() {
		return this._bPercentageMode;
	};

	RadialMicroChart.prototype.setPercentage = function(percentage) {
		if (percentage) {
			if (percentage !== this.getPercentage()) {
				this._bPercentageMode = true;
				this.setProperty("percentage", percentage);
			}
		} else {
			this._bPercentageMode = false;
			this.setProperty("percentage", null);
		}
	};

	RadialMicroChart.prototype.getTooltip_AsString = function() {
		return this._getTooltipText();
	};

	/* --- Helpers --- */

	/**
	 * Check if the valueColor property is an instance of sap.m.ValueColor
	 * @returns {boolean} True if valueColor property is an instance of sap.m.ValueColor, false otherwise.
	 * @private
	 */
	RadialMicroChart.prototype._isValueColorInstanceOfValueColor = function() {
		var sValue = this.getValueColor();
		for (var sValueColor in sap.m.ValueColor){
			if (sValueColor === sValue) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Returns the tooltip for the given chart.
	 * If tooltip was set to an empty string (using whitespaces) by the application,
	 * the tooltip will be set to an empty string. If tooltip was not set (null/undefined),
	 * a tooltip gets generated by the control.
	 *
	 * @private
	 * @returns {string} tooltip for the given control
	 */
	RadialMicroChart.prototype._getTooltipText = function() {
		var sTooltip = this.getTooltip_Text();
		if (!sTooltip) { //Tooltip will be set by control
			sTooltip = this._getAriaAndTooltipText();
		} else if (this._isTooltipSuppressed()) {
			sTooltip = null;
		}
		return sTooltip;
	};

	/**
	 * Returns text for ARIA label.
	 * If tooltip was set to an empty string (using whitespaces) by the application or
	 * the tooltip was not set (null/undefined), the ARIA text gets generated by the control.
	 * Otherwise, the given tooltip will also be set as ARIA text.
	 *
	 * @private
	 * @returns {String} ARIA text for the given control
	 */
	RadialMicroChart.prototype._getAriaText = function() {
		var sAriaText = this.getTooltip_Text();
		if (!sAriaText || this._isTooltipSuppressed()) { //ARIA label will be set by control. Otherwise (else), version generated by control will be used.
			sAriaText = this._getAriaAndTooltipText();
		}
		return sAriaText;
	};

	/**
	 * Returns value that indicates if the tooltip was configured as empty string (e.g. one whitespace).
	 *
	 * @private
	 * @returns {boolean} value that indicates true, if whitespace was set, false in any other case, also null/undefined
	 */
	RadialMicroChart.prototype._isTooltipSuppressed = function() {
		var sTooltip = this.getTooltip_Text();
		if (sTooltip && jQuery.trim(sTooltip).length === 0) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Returns the part of the tooltip and ARIA text which is equal.
	 *
	 * @private
	 * @returns {string} value containing the tooltip and ARIA text
	 */
	RadialMicroChart.prototype._getAriaAndTooltipText = function() {
		var sTextValue;
		var fPercentage = this.getPercentage();
		if (fPercentage > 100) {
			fPercentage = 100;
		} else if (fPercentage < 0) {
			fPercentage = 0;
		}
		if (this._isValueColorInstanceOfValueColor()) {
			sTextValue = this._rb.getText("RADIALMICROCHART_ARIA_LABEL", [this.getPercentage(), this._getStatusText()]);
		} else {
			sTextValue = this._rb.getText("RADIALMICROCHART_ARIA_LABEL", [fPercentage, sap.m.ValueColor.Neutral]);
		}
		return sTextValue;
	};

	/**
	 * Returns the status text based on color value (to be available for other languages also)
	 *
	 * @private
	 * @returns {string} value containing the status text
	 */
	RadialMicroChart.prototype._getStatusText = function() {
		var sValueColor = this.getValueColor();
		switch (sValueColor) {
			case sap.m.ValueColor.Error:
				return this._rb.getText("SEMANTIC_COLOR_ERROR");
			case sap.m.ValueColor.Critical:
				return this._rb.getText("SEMANTIC_COLOR_CRITICAL");
			case sap.m.ValueColor.Good:
				return this._rb.getText("SEMANTIC_COLOR_GOOD");
			default:
				return this._rb.getText("SEMANTIC_COLOR_NEUTRAL");
		}
	};

	return RadialMicroChart;
});
