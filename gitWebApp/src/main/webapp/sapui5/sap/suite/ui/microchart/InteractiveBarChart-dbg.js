/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";

	/**
	 * Constructor for a new InteractiveBarChart control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The InteractiveBarChart control belongs to the chart control group in the MicroChart library with less interactive features to provide more information on a chart value.
	 * By selecting a bar you can get more details on the displayed value.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 *
	 * @public
	 * @experimental Since 1.42.0 This control is currently under development. The API could be changed at any point in time.
	 * @constructor
	 * @alias sap.suite.ui.microchart.InteractiveBarChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 *
	 */
	var InteractiveBarChart = Control.extend("sap.suite.ui.microchart.InteractiveBarChart", /** @lends sap.suite.ui.microchart.InteractiveBarChart.prototype */ {
		metadata : {
			library : "sap.suite.ui.microchart",
			properties : {
				/**
				 * Maximal number of displayed bars.
				 */
				maxDisplayedBars : {type : "int", group : "Appearance", defaultValue : 3},

				/**
				 * Enables the selection in the chart.
				 */
				selectionEnabled : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * Begin of displayed scale.
				 */
				min: {type : "float", group : "Appearance"},

				/**
				 * End of displayed scale.
				 */
				max: {type : "float", group : "Appearance"}
			},
			defaultAggregation : "bars",
			aggregations : {
				/**
				 * Bars displayed on the chart.
				 */
				bars : {type : "sap.suite.ui.microchart.InteractiveBarChartBar", multiple : true, bindable : "bindable"}
			},
			events : {
				/**
				 * Event is fired when user has selected or deselected a bar.
				 */
				selectionChanged : {
					parameters : {
						/**
						 * All bars which are in selected state.
						 */
						selectedBars : {type : "sap.suite.ui.microchart.InteractiveBarChartBar[]"},

						/**
						 * The bar being selected or deselected.
						 */
						bar : {type : "sap.suite.ui.microchart.InteractiveBarChartBar"},

						/**
						 * The selection state of the bar being selected or deselected.
						 */
						selected : {type : "boolean"}
					}
				}
			},
			associations : {

			}
		}
	});

	/* Constants */
	InteractiveBarChart.MIN_BARS_TO_DISPLAY = 3; // 3 bar areas are displayed even if there are few bars available
	InteractiveBarChart.BAR_AREA_WIDTH = 60; // 60% of the chart is for the bars
	InteractiveBarChart.BAR_PADDING_RIGHT_IN_PX = 8; // right padding next to bar in px
	InteractiveBarChart.MIN_BAR_WIDTH_IN_PX = 1; // minimum bar width for small values in px
	InteractiveBarChart.LABEL_PADDING_IN_PX = 8; // right label padding in px
	InteractiveBarChart.LABEL_AREA_WIDTH = 40; // 40% of the chart is for the label
	InteractiveBarChart.BAR_VALUE_PADDING_LEFT_IN_PX = 4; // 0.25rem space between the bar and the displayed value in case of the value is displayed outside of the bar
	InteractiveBarChart.BAR_VALUE_PADDING_RIGHT_IN_PX = 4; // 0.25rem space between the displayed value and the end of the bar
	InteractiveBarChart.SELECTION_AREA_PADDING_BOTTOM_IN_PX = 4; // 0.25rem space between the selection areas

	InteractiveBarChart.prototype.init = function() {
		/* Internal properties */
		this._iVisibleBars = 0;
		this._bMinMaxValid = null;
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.microchart");

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
	InteractiveBarChart.prototype._handleCoreInitialized = function() {
		this._bThemeApplied = sap.ui.getCore().isThemeApplied();
		if (!this._bThemeApplied) {
			sap.ui.getCore().attachThemeChanged(this._handleThemeApplied, this);
		}
	};

	/**
	 * The chart is not being rendered until the theme was applied.
	 * If the theme is applied, rendering starts by the control itself.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._handleThemeApplied = function() {
		this._bThemeApplied = true;
		this.invalidate();
		sap.ui.getCore().detachThemeChanged(this._handleThemeApplied, this);
	};

	InteractiveBarChart.prototype.onBeforeRendering = function() {
		this._bMinMaxValid = this._checkIfMinMaxValid();
		if (this.getAggregation("bars") && this.getProperty("maxDisplayedBars")) {
			this._iVisibleBars = Math.min(this.getAggregation("bars").length, this.getProperty("maxDisplayedBars"));
		}
		if (!this.data("_parentRenderingContext") && jQuery.isFunction(this.getParent)) {
			this.data("_parentRenderingContext", this.getParent());
		}
		this._deregisterResizeHandler();
	};

	InteractiveBarChart.prototype.onAfterRendering = function() {
		var $Control = this.$();
		this._sResizeHandlerId = sap.ui.core.ResizeHandler.register(this, this._onResize.bind(this));
		this._adjustToParent($Control);
		this._calcBarsWidth();
		this._onResize();
	};

	InteractiveBarChart.prototype.exit = function() {
		this._deregisterResizeHandler();
	};

	/* =========================================================== */
	/* API events */
	/* =========================================================== */
	/**
	 * Event handler for click
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onclick = function(event) {
		var sId = event.target.id,
			$Focusables = this.$().find(".sapSuiteIBCBarInteractionArea"),
			iIndex, iHasFocus;
		if (sId) {
			iIndex = sId.substring(sId.lastIndexOf("-") + 1);
			if (isNaN(iIndex)) {
				return;
			} else {
				iIndex = parseInt(iIndex, 10);
			}
			this._toggleSelected(iIndex);
			// find out which bar has tabindex = 0 at this moment
			iHasFocus = $Focusables.index(this.$().find(".sapSuiteIBCBarInteractionArea[tabindex='0']"));
			this._switchTabindex(iHasFocus, iIndex, $Focusables);
		}
	};

	/**
	 * Handler for enter button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsapenter = function(event) {
		var iIndex = this.$().find(".sapSuiteIBCBarInteractionArea").index(event.target);
		if (iIndex !== -1) {
			this._toggleSelected(iIndex);
		}
		event.preventDefault();
		event.stopImmediatePropagation();
	};

	/**
	 * Handler for space button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsapspace = InteractiveBarChart.prototype.onsapenter;

	/**
	 * Handler for up arrow button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsapup = function(event) {
		var $Focusables = this.$().find(".sapSuiteIBCBarInteractionArea");
		var iIndex = $Focusables.index(event.target);
		if ($Focusables.length > 0) {
			this._switchTabindex(iIndex, iIndex - 1, $Focusables);
		}
		event.preventDefault();
		event.stopImmediatePropagation();
	};

	/**
	 * Handler for down arrow button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsapdown = function(event) {
		var $Focusables = this.$().find(".sapSuiteIBCBarInteractionArea");
		var iIndex = $Focusables.index(event.target);
		if ($Focusables.length > 0) {
			this._switchTabindex(iIndex, iIndex + 1, $Focusables);
		}
		event.preventDefault();
		event.stopImmediatePropagation();
	};

	/**
	 * Handler for home button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsaphome = function(event) {
		var $Focusables = this.$().find(".sapSuiteIBCBarInteractionArea");
		var iIndex = $Focusables.index(event.target);
		if (iIndex !== 0 && $Focusables.length > 0) {
			this._switchTabindex(iIndex, 0, $Focusables);
		}
		event.preventDefault();
		event.stopImmediatePropagation();
	};

	/**
	 * Handler for end button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsapend = function(event) {
		var $Focusables = this.$().find(".sapSuiteIBCBarInteractionArea"),
			iIndex = $Focusables.index(event.target),
			iLength = $Focusables.length;
		if (iIndex !== iLength - 1 && iLength > 0) {
			this._switchTabindex(iIndex, iLength - 1, $Focusables);
		}
		event.preventDefault();
		event.stopImmediatePropagation();
	};

	/**
	 * Handler for left arrow button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsapleft = InteractiveBarChart.prototype.onsapup;

	/**
	 * Handler for right arrow button event
	 *
	 * @param {sap.ui.base.Event} event which was fired
	 */
	InteractiveBarChart.prototype.onsapright = InteractiveBarChart.prototype.onsapdown;

	/* =========================================================== */
	/* API methods */
	/* =========================================================== */
	/**
	 * Gets all selected bars.
	 *
	 * @public
	 * @returns {sap.suite.ui.microchart.InteractiveBarChartBar[]} All selected bars
	 */
	InteractiveBarChart.prototype.getSelectedBars = function() {
		var aBars = this.getAggregation("bars"),
			aSelectedBars = [], i;

		for (i = 0; i < aBars.length; i++) {
			if (aBars[i].getSelected()) {
				aSelectedBars.push(aBars[i]);
			}
		}
		return aSelectedBars;
	};

	/**
	 * Already selected bars will be deselected and members of the selectedBars attribute which are part of the bars aggregation will be set to selected state.
	 *
	 * @public
	 * @param {sap.suite.ui.microchart.InteractiveBarChartBar | sap.suite.ui.microchart.InteractiveBarChartBar[]} selectedBars A bar element or an array of bars for which the status should be set to selected.
	 * @returns {sap.suite.ui.microchart.InteractiveBarChart} this to allow method chaining
	 */
	InteractiveBarChart.prototype.setSelectedBars = function(selectedBars) {
		var aBars = this.getAggregation("bars"),
			i, iIndex;
		this._deselectAllSelectedBars();
		if (!selectedBars) {
			return this;
		}
		if (selectedBars instanceof library.InteractiveBarChartBar) {
			selectedBars = [selectedBars];
		}
		if (jQuery.isArray(selectedBars)) {
			for (i = 0; i < selectedBars.length; i++) {
				iIndex = this.indexOfAggregation("bars", selectedBars[i]);
				if (iIndex >= 0) {
					aBars[iIndex].setProperty("selected", true, true);
				} else {
					jQuery.sap.log.warning("setSelectedBars method called with invalid InteractiveBarChartBar element");
				}
			}
		}
		this.invalidate();
		return this;
	};

	/* =========================================================== */
	/* Private methods */
	/* =========================================================== */
	/**
	 * Adjusts the height and width of the whole control if this is required depending on parent control.
	 *
	 * @private
	 * @param {Object} $Control the control object
	 */
	InteractiveBarChart.prototype._adjustToParent = function($Control) {
		if (this.data("_parentRenderingContext") && this.data("_parentRenderingContext") instanceof sap.m.FlexBox) {
			// Subtracts two pixels, otherwise there's not enough space for the outline, and the chart won't be rendered properly
			var $Parent = this.data("_parentRenderingContext").$();
			var iParentWidth = $Parent.width() - 2;
			var iParentHeight = $Parent.height() - 2;
			$Control.outerWidth(iParentWidth);
			$Control.outerHeight(iParentHeight);
		}
	};

	/**
	 * Calculates the width of the bars.
	 *
	 * @private
	 * @returns {sap.suite.ui.microchart.InteractiveBarChart} this to allow method chaining
	 */
	InteractiveBarChart.prototype._calcBarsWidth = function() {
		var fMin = this.getProperty("min"),
			fMax = this.getProperty("max"),
			iContainerWidth = this.$().width(),
			fDelta,
			fRightBarPaddingInPercent, fBarActualSpaceInPercent, fBarActualSpaceInPixel,
			fLabelPaddingInPercent, fLabelActualSpace,
			fValue;
		if (!this._bMinMaxValid) {
			return this;
		}
		fDelta = fMax - fMin;
		fRightBarPaddingInPercent = InteractiveBarChart.BAR_PADDING_RIGHT_IN_PX / iContainerWidth * 100;
		fBarActualSpaceInPercent = InteractiveBarChart.BAR_AREA_WIDTH - fRightBarPaddingInPercent;
		fBarActualSpaceInPixel = fBarActualSpaceInPercent / 100 * iContainerWidth;
		fLabelPaddingInPercent = InteractiveBarChart.LABEL_PADDING_IN_PX / iContainerWidth * 100;
		fLabelActualSpace = (InteractiveBarChart.LABEL_AREA_WIDTH - 2 * fLabelPaddingInPercent).toFixed(2);

		function calcPercent(fValue) {
			var fRelativeValue = fValue - fMin,
				// relative value divided by scale, multiplied by ratio of actual width
				fResult = (fRelativeValue / fDelta * fBarActualSpaceInPercent).toFixed(2);
			if (fRelativeValue > 0 && (fResult / 100 * fBarActualSpaceInPixel) < 1) {
				return InteractiveBarChart.MIN_BAR_WIDTH_IN_PX + "px"; // bar width should be at least 1 px, if value is higher than min
			}
			return fResult + "%";
		}

		for (var i = 0; i < this._iVisibleBars; i++) {
			this.$("label-" + i).css("width", fLabelActualSpace + "%");
			fValue = this.getBars()[i].getValue();
			if (this.getBars()[i]._bNullValue) { // no value provided
				this.$("bar-" + i).css("width", "0%");
			} else {
				fValue = Math.min(fValue, fMax);
				this.$("bar-" + i).css("width", calcPercent(Math.abs(fValue)));
			}
		}
		return this;
	};

	/**
	 * Deselects all selected bars.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._deselectAllSelectedBars = function() {
		var aBars = this.getAggregation("bars"),
			iBarsCount = aBars.length, i;

		for (i = 0; i < iBarsCount; i++) {
			aBars[i].setProperty("selected", false, true);
		}
	};

	/**
	 * Toggles the selection state of the bar element.
	 *
	 * @param {int} index The index of the bar element
	 * @private
	 */
	InteractiveBarChart.prototype._toggleSelected = function(index) {
		var aBars = this.getAggregation("bars"),
			oBar = aBars[index];

		if (index < 0 || index >= aBars.length) {
			return;
		}
		var $interArea = this.$("interactionArea-" + index);
		if (oBar.getSelected()) {
			$interArea.removeClass("sapSuiteIBCBarSelected");
			oBar.setProperty("selected", false, true);
		} else {
			$interArea.addClass("sapSuiteIBCBarSelected");
			oBar.setProperty("selected", true, true);
		}
		this.fireSelectionChanged({
			selectedBars: this.getSelectedBars(),
			bar: oBar,
			selected: oBar.getSelected()
		});
	};

	/**
	 * Sets the displayed value outside of the bar if there is not enough space in the bar.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._showValueOutsideBar = function() {
		var $Bars, $BarValues, iValueShift, i,
			$Control = this.$();

		$Bars = $Control.find(".sapSuiteIBCBar");
		$BarValues = $Control.find(".sapSuiteIBCBarValue");
		if ($Bars.length === 0 || $BarValues.length === 0) {
			return;
		}
		for (i = 0; i < this._iVisibleBars; i++) {
			if ((jQuery($BarValues[i]).width() + 2 * InteractiveBarChart.BAR_VALUE_PADDING_LEFT_IN_PX) > jQuery($Bars[i]).width()) {
				//bar value width plus margins don't fit into the bar
				iValueShift = jQuery($Bars[i]).width() + InteractiveBarChart.BAR_VALUE_PADDING_LEFT_IN_PX;
				jQuery($BarValues[i]).css({ "right": "auto" });
				jQuery($BarValues[i]).css({ "left": iValueShift });
				jQuery($BarValues[i]).addClass("sapSuiteIBCBarValueOutside");
			} else {
				jQuery($BarValues[i]).css({ "left": "" });
				jQuery($BarValues[i]).css({ "right": InteractiveBarChart.BAR_VALUE_PADDING_RIGHT_IN_PX });
				jQuery($BarValues[i]).removeClass("sapSuiteIBCBarValueOutside");
			}
		}
	};

	/**
	 * Checks if min and max properties contain valid data.
	 *
	 * @private
	 * @returns {boolean} flag for valid min / max data
	 */
	InteractiveBarChart.prototype._checkIfMinMaxValid = function() {
		var fMin = this.getMin(),
			fMax = this.getMax();
		if (isNaN(fMin) || isNaN(fMax)) {
			jQuery.sap.log.warning("Min or Max value for InteractiveBarChart is not provided.");
			return false;
		}
		if (fMin > fMax) {
			jQuery.sap.log.warning("Min value for InteractiveBarChart is larger than Max value.");
			return false;
		}
		if (fMin < 0 || fMax < 0) {
			jQuery.sap.log.warning("Min or Max value for InteractiveBarChart are negative.");
			return false;
		}
		return true;
	};

	/**
	 * Adds and removes the tabindex between elements to support keyboard navigation.
	 *
	 * @param {int} oldIndex which is the bar index whose tabindex is 0 previously.
	 * @param {int} newIndex which is the bar index whose tabindex should be set to 0 this time.
	 * @param {JQuery} focusables all the elements who can have tabindex attribute.
	 * @private
	 */
	InteractiveBarChart.prototype._switchTabindex = function(oldIndex, newIndex, focusables) {
		if (oldIndex >= 0 && oldIndex < focusables.length && newIndex >= 0 && newIndex < focusables.length) {
			focusables.eq(oldIndex).removeAttr("tabindex");
			focusables.eq(newIndex).attr("tabindex", "0");
			focusables.eq(newIndex).focus();
		}
	};

	/**
	 * Resizes the chart vertically. If the height of the chart is less or equal to min-height (less), it hides the chart.
	 * Assuming that all the css has already been loaded and is available.
	 *
	 * @private
	 * @param {Object} Control The chart control object
	 */
	InteractiveBarChart.prototype._resizeVertically = function() {
		var i, iCurrentContentHeight,
			$Control = this.$(),
			$SelectionAreas = $Control.find(".sapSuiteIBCBarInteractionArea"),
			iCurrentControlHeight = $Control.height();

		for (i = 0; i < this._iVisibleBars; i++) {
			iCurrentContentHeight = ($SelectionAreas.height() + InteractiveBarChart.SELECTION_AREA_PADDING_BOTTOM_IN_PX) * (i + 1); //number of selection areas plus margins
			if (iCurrentContentHeight > iCurrentControlHeight) {
				jQuery($SelectionAreas[i]).hide();
			} else {
				jQuery($SelectionAreas[i]).show();
			}
		}
	};

	/**
	 * Handles the responsiveness.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._onResize = function() {
		this._showValueOutsideBar();
		this._resizeVertically();
	};

	/**
	 * Deregisters all handlers.
	 *
	 * @private
	 */
	InteractiveBarChart.prototype._deregisterResizeHandler = function() {
		if (this._sResizeHandlerId) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeHandlerId);
			this._sResizeHandlerId = null;
		}
	};
	return InteractiveBarChart;
});
