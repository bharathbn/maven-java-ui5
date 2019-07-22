/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/suite/ui/microchart/InteractiveLineChartPoint'],
	function(jQuery, library, Control, InteractiveLineChartPoint) {
	"use strict";

	/**
	 * Constructor for a new InteractiveLineChart control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class The InteractiveLineChart control belongs to the chart control group in the MicroChart library with less interactive features to provide more information on a chart value.
	 * By selecting a point you can get more details on the displayed value.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version 1.44.4
	 *
	 * @public
	 * @experimental Since 1.42.0 This is currently under development. The API could be changed at any point in time.
	 * @constructor
	 * @alias sap.suite.ui.microchart.InteractiveLineChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var InteractiveLineChart = Control.extend("sap.suite.ui.microchart.InteractiveLineChart", /** @lends sap.suite.ui.microchart.InteractiveLineChart.prototype */ {
		metadata : {
			library : "sap.suite.ui.microchart",
			properties : {
				/**
				 * The maximum number of points to be displayed on the chart.
				 */
				maxDisplayedPoints : {
					type : "int",
					group : "Appearance",
					defaultValue : 6
				},

				/**
				 * If this property is set to true, one or multiple points are selectable.
				 */
				selectionEnabled : {
					type : "boolean",
					group : "Behavior",
					defaultValue : true
				}
			},
			defaultAggregation: "points",
			aggregations : {
				/**
				 * Points displayed in the chart.
				 */
				points : {type : "sap.suite.ui.microchart.InteractiveLineChartPoint", multiple : true, bindable : "bindable"}
			},
			events : {
				/**
				 * Event is fired when a user has selected or deselected a point.
				 */
				selectionChanged : {
					parameters : {
						/**
						 * All points which are in selected state.
						 */
						selectedPoints : {type : "sap.suite.ui.microchart.InteractiveLineChartPoint[]"},

						/**
						 * The point which is pressed.
						 */
						point : {type : "sap.suite.ui.microchart.InteractiveLineChartPoint"},

						/**
						 * The selection state of the point which is pressed.
						 */
						selected : {type : "boolean"}
					}
				}
			},
			associations : {

			}
		}
	});

	InteractiveLineChart._MAX_SCALED_CANVAS_VALUE = 99;
	InteractiveLineChart._MIN_SCALED_CANVAS_VALUE = 1;

	InteractiveLineChart.prototype.init = function(){
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.microchart");
		this._aNormalisedValues = [];

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
	InteractiveLineChart.prototype._handleCoreInitialized = function() {
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
	InteractiveLineChart.prototype._handleThemeApplied = function() {
		this._bThemeApplied = true;
		this.invalidate();
		sap.ui.getCore().detachThemeChanged(this._handleThemeApplied, this);
	};

	InteractiveLineChart.prototype.onBeforeRendering = function() {
		if (!this.data("_parentRenderingContext") && jQuery.isFunction(this.getParent)) {
			this.data("_parentRenderingContext", this.getParent());
		}
		this._updateNormalizedValues();
	};

	InteractiveLineChart.prototype.onAfterRendering = function() {
		var $Control = this.$();
		this._adjustToParent($Control);
	};

	/**
	 * Handler for click
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	InteractiveLineChart.prototype.onclick = function (oEvent) {
		var $InteractionSection = jQuery(oEvent.target).parent();
		var iHasFocus, $Focusables = this.$().find(".sapSuiteILCInteractionArea");
		var iIndex = this.$().find(".sapSuiteILCSection").index($InteractionSection);
		if (iIndex >= 0) {
			this._toggleSelected(iIndex);
			iHasFocus = $Focusables.index(this.$().find(".sapSuiteILCInteractionArea[tabindex='0']"));
			this._switchTabindex(iHasFocus, iIndex, $Focusables);
		}
	};

	/**
	 * Handler for left arrow button event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	InteractiveLineChart.prototype.onsapleft = function(oEvent) {
		var $Focusables = this.$().find(".sapSuiteILCInteractionArea");
		var iIndex = $Focusables.index(oEvent.target);
		if ($Focusables.length > 0) {
			this._switchTabindex(iIndex, iIndex - 1, $Focusables);
		}
		oEvent.preventDefault();
		oEvent.stopImmediatePropagation();
	};

	/**
	 * Handler for right arrow button event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	InteractiveLineChart.prototype.onsapright = function(oEvent) {
		var $Focusables = this.$().find(".sapSuiteILCInteractionArea");
		var iIndex = $Focusables.index(oEvent.target);
		if ($Focusables.length > 0) {
			this._switchTabindex(iIndex, iIndex + 1, $Focusables);
		}
		oEvent.preventDefault();
		oEvent.stopImmediatePropagation();
	};

	/**
	 * Handler for up arrow button event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	InteractiveLineChart.prototype.onsapup = InteractiveLineChart.prototype.onsapleft;

	/**
	 * Handler for down arrow button event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	InteractiveLineChart.prototype.onsapdown = InteractiveLineChart.prototype.onsapright;

	/**
	 * Handler for enter button event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	InteractiveLineChart.prototype.onsapenter = function(oEvent) {
		var iIndex = this.$().find(".sapSuiteILCInteractionArea").index(oEvent.target);
		if (iIndex !== -1) {
			this._toggleSelected(iIndex);
		}
		oEvent.preventDefault();
		oEvent.stopImmediatePropagation();
	};

	/**
	 * Handler for space button event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	InteractiveLineChart.prototype.onsapspace = InteractiveLineChart.prototype.onsapenter;

	/**
	 * Handler for home button event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	InteractiveLineChart.prototype.onsaphome = function(oEvent) {
		var $Focusables = this.$().find(".sapSuiteILCInteractionArea");
		var iIndex = $Focusables.index(oEvent.target);
		if (iIndex !== 0 && $Focusables.length > 0) {
			this._switchTabindex(iIndex, 0, $Focusables);
		}
		oEvent.preventDefault();
		oEvent.stopImmediatePropagation();
	};

	/**
	 * Handler for end button event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	InteractiveLineChart.prototype.onsapend = function(oEvent) {
		var $Focusables = this.$().find(".sapSuiteILCInteractionArea");
		var iIndex = $Focusables.index(oEvent.target), iLength = $Focusables.length;
		if (iIndex !== iLength - 1 && iLength > 0) {
			this._switchTabindex(iIndex, iLength - 1, $Focusables);
		}
		oEvent.preventDefault();
		oEvent.stopImmediatePropagation();
	};

	/**
	 * Adjusts the height and width of the whole control if this is required depending on parent control.
	 *
	 * @private
	 * @param {Object} the control object
	 */
	InteractiveLineChart.prototype._adjustToParent = function($Control) {
		if (this.data("_parentRenderingContext") && this.data("_parentRenderingContext") instanceof sap.m.FlexBox) {
			// Subtracts two pixels, otherwise there's not enough space for the outline, and the chart won't be rendered properly
			var $Parent = this.data("_parentRenderingContext").$();
			var iParentWidth = parseFloat($Parent.width()) - 2;
			var iParentHeight = parseFloat($Parent.height()) - 2;
			$Control.outerWidth(iParentWidth);
			$Control.outerHeight(iParentHeight);
		}
	};

	/* =========================================================== */
	/* API methods */
	/* =========================================================== */

	/**
	 * Retrieves the selected point elements from the points aggregation and returns them.
	 *
	 * @public
	 * @returns {sap.suite.ui.microchart.InteractiveLineChartPoint[]} Array of sap.suite.ui.microchart.InteractiveLineChartPoint instances.
	 */
	InteractiveLineChart.prototype.getSelectedPoints = function() {
		var aSelectedPoints = [], aPoints = this.getAggregation("points");

		for (var i = 0; i < aPoints.length; i++) {
			if (aPoints[i].getSelected()) {
				aSelectedPoints.push(aPoints[i]);
			}
		}
		return aSelectedPoints;
	};

	/**
	 * Already selected points will be deselected and members of the selectedPoints attribute which are part of the points aggregation will be set to selected state.
	 *
	 * @public
	 * @param {sap.suite.ui.microchart.InteractiveLineChartPoint | sap.suite.ui.microchart.InteractiveLineChartPoint[]} selectedPoints A point element or an array of points for which the status should be set to selected.
	 * @returns {sap.suite.ui.microchart.InteractiveLineChart} this to allow method chaining
	 */
	InteractiveLineChart.prototype.setSelectedPoints = function(selectedPoints) {
		var aPoints = this.getAggregation("points"),
			i, iIndex;

		this._deselectAllSelectedPoints();
		if (!selectedPoints) {
			return this;
		}
		if (selectedPoints instanceof InteractiveLineChartPoint) {
			selectedPoints = [selectedPoints];
		}

		if (jQuery.isArray(selectedPoints)) {
			for (i = 0; i < selectedPoints.length; i++) {
				var iIndex = this.indexOfAggregation("points", selectedPoints[i]);
				if (iIndex >= 0) {
					aPoints[iIndex].setProperty("selected", true, true);
				} else {
					jQuery.sap.log.warning("setSelectedPoints method called with invalid InteractiveLineChartPoint element");
				}
			}
		}
		this.invalidate();
		return this;
	};

	/**
	 * Sets all the currently selected point elements as not selected.
	 *
	 * @private
	 */
	InteractiveLineChart.prototype._deselectAllSelectedPoints = function() {
		var aPoints = this.getPoints();
		for (var i = 0; i < aPoints.length; i++) {
			if (aPoints[i].getSelected()) {
				aPoints[i].setProperty("selected", false, true);
			}
		}
	};

	/**
	 * Adds and removes the tabindex between elements to support keyboard navigation.
	 *
	 * @param {int} oldIndex which is the column index whose tabindex is 0 previously.
	 * @param {int} newIndex which is the column index whose tabindex should be set to 0 this time.
	 * @param {JQuery} focusables all the elements who has tabindex attribute.
	 * @private
	 */
	InteractiveLineChart.prototype._switchTabindex = function(oldIndex, newIndex, focusables) {
		if (oldIndex >= 0 && oldIndex < focusables.length && newIndex >= 0 && newIndex < focusables.length) {
			focusables.eq(oldIndex).removeAttr("tabindex");
			focusables.eq(newIndex).attr("tabindex", "0");
			focusables.eq(newIndex).focus();
		}
	};

	/**
	 * Updates the selection state of the point element.
	 *
	 * @param {int} the index of the point element
	 * @private
	 */
	InteractiveLineChart.prototype._toggleSelected = function(index) {
		if (index < 0 || index >= this.getPoints().length) {
			return;
		}
		var oPoint = this.getPoints()[index],
			$SectionArea = this.$("point-area-" + index);
		if (oPoint.getSelected()) {
			$SectionArea.removeClass("sapSuiteILCSelected");
			oPoint.setProperty("selected", false, true);
		} else {
			$SectionArea.addClass("sapSuiteILCSelected");
			oPoint.setProperty("selected", true, true);
		}
		this.fireSelectionChanged({
			selectedPoints: this.getSelectedPoints(),
			point: oPoint,
			selected: oPoint.getSelected()
		});

	};

	/**
	 * Normalizes the values of the points on the scale 0 to 100.
	 * NA values are normalized to 0.
	 * If there is only one value except NAs then it is normalized to 50.
	 * The created values are written to the private array. The points aggregation remains unchanged.
	 *
	 * @private
	 */
	InteractiveLineChart.prototype._updateNormalizedValues = function() {
		var nMax, nMin, nScaledValue, nPointLength = this.getPoints().length;
		this._aNormalisedValues = [];
		for (var i = 0; i < nPointLength; i++) {
			if (!this.getPoints()[i]._bNullValue) {
				if (isNaN(nMax)) {
					nMax = this.getPoints()[i].getValue();
				} else {
					nMax = Math.max(nMax, this.getPoints()[i].getValue());
				}
				if (isNaN(nMin)) {
					nMin = this.getPoints()[i].getValue();
				} else {
					nMin = Math.min(nMin, this.getPoints()[i].getValue());
				}
			}
		}
		var nRange = nMax - nMin;

		for (var i = 0; i < nPointLength; i++) {
			if (this.getPoints()[i]._bNullValue) {
				this._aNormalisedValues.push(0);
			} else if (nRange) {
				nScaledValue = (this.getPoints()[i].getValue() - nMin) / nRange;
				nScaledValue = InteractiveLineChart._MIN_SCALED_CANVAS_VALUE + nScaledValue * (InteractiveLineChart._MAX_SCALED_CANVAS_VALUE - InteractiveLineChart._MIN_SCALED_CANVAS_VALUE);
				this._aNormalisedValues.push(nScaledValue);
			} else {
				this._aNormalisedValues.push(50);
			}
		}
	};

	return InteractiveLineChart;
});
