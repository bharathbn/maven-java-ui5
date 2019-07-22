/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

/**
 * Initialization Code and shared classes of library sap.suite.ui.microchart.
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/library', 'sap/ui/core/Core', 'sap/m/library'],
	function(jQuery, coreLibrary, Core, mLibrary) {
	"use strict";

	/**
	 * UI5 library: sap.suite.ui.microchart.
	 *
	 * @namespace
	 * @name sap.suite.ui.microchart
	 * @public
	 */

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.suite.ui.microchart",
		version: "1.44.4",
		// library dependencies
		dependencies : ["sap.ui.core", "sap.m"],
		types: [
			"sap.suite.ui.microchart.AreaMicroChartViewType",
			"sap.suite.ui.microchart.BulletMicroChartModeType",
			"sap.suite.ui.microchart.CommonBackgroundType",
			"sap.suite.ui.microchart.ComparisonMicroChartViewType",
			"sap.suite.ui.microchart.LoadStateType"
		],
		interfaces: [],
		controls: [
			"sap.suite.ui.microchart.AreaMicroChart",
			"sap.suite.ui.microchart.BulletMicroChart",
			"sap.suite.ui.microchart.ColumnMicroChart",
			"sap.suite.ui.microchart.ComparisonMicroChart",
			"sap.suite.ui.microchart.DeltaMicroChart",
			"sap.suite.ui.microchart.HarveyBallMicroChart",
			"sap.suite.ui.microchart.InteractiveBarChart",
			"sap.suite.ui.microchart.InteractiveDonutChart",
			"sap.suite.ui.microchart.InteractiveLineChart",
			"sap.suite.ui.microchart.RadialMicroChart",
			"sap.suite.ui.microchart.StackedBarMicroChart"
		],
		elements: [
			"sap.suite.ui.microchart.AreaMicroChartPoint",
			"sap.suite.ui.microchart.AreaMicroChartItem",
			"sap.suite.ui.microchart.AreaMicroChartLabel",
			"sap.suite.ui.microchart.BulletMicroChartData",
			"sap.suite.ui.microchart.ColumnMicroChartData",
			"sap.suite.ui.microchart.ColumnMicroChartLabel",
			"sap.suite.ui.microchart.ComparisonMicroChartData",
			"sap.suite.ui.microchart.HarveyBallMicroChartItem",
			"sap.suite.ui.microchart.InteractiveBarChartBar",
			"sap.suite.ui.microchart.InteractiveDonutChartSegment",
			"sap.suite.ui.microchart.InteractiveLineChartPoint",
			"sap.suite.ui.microchart.StackedBarMicroChartBar"
		]
	});

	/**
	 * Enum of available views for the area micro chart concerning the position of the labels.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.suite.ui.microchart.AreaMicroChartViewType = {

		/**
		 * The view with labels on the top and bottom.
		 * @public
		 */
		Normal : "Normal",

		/**
		 * The view with labels on the left and right.
		 * @public
		 */
		Wide : "Wide"

	};

	/**
	 * Defines if the horizontal bar represents a current value only or if it represents the delta between a current value and a threshold value.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.suite.ui.microchart.BulletMicroChartModeType = {
		/**
		 * Displays the Actual value.
		 * @public
		 */
		Actual: "Actual",

		/**
		 * Displays delta between the Actual and Threshold values.
		 * @public
		 */
		Delta: "Delta"
	};

	/**
	 * Lists the available theme-specific background colors.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.suite.ui.microchart.CommonBackgroundType = {
		/**
		 * The lightest background color.
		 * @public
		 */
		Lightest: "Lightest",

		/**
		 * Extra light background color.
		 * @public
		 */
		ExtraLight: "ExtraLight",

		/**
		 * Light background color.
		 * @public
		 */
		Light: "Light",

		/**
		 * Medium light background color.
		 * @public
		 */
		MediumLight: "MediumLight",

		/**
		 * Medium background color.
		 * @public
		 */
		Medium: "Medium",

		/**
		 * Dark background color.
		 * @public
		 */
		Dark: "Dark",

		/**
		 * Extra dark background color.
		 * @public
		 */
		ExtraDark: "ExtraDark",

		/**
		 * The darkest background color.
		 * @public
		 */
		Darkest: "Darkest",

		/**
		 * The transparent background color.
		 * @public
		 */
		Transparent: "Transparent"
	};

	/**
	 * Lists the views of the comparison micro chart concerning the position of titles and labels.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.suite.ui.microchart.ComparisonMicroChartViewType = {
		/**
		 * Titles and values are displayed above the bars.
		 * @public
		 */
		Normal: "Normal",

		/**
		 * Titles and values are displayed in the same line with the bars.
		 * @public
		 */
		Wide: "Wide"
	};

	sap.suite.ui.microchart.LoadStateType = {

			/**
			 * LoadableView is loading the control.
			 * @public
			 */
			Loading: "Loading",

			/**
			 * LoadableView has loaded the control.
			 * @public
			 */
			Loaded: "Loaded",

			/**
			 * LoadableView failed to load the control.
			 * @public
			 */
			Failed: "Failed",

			/**
			 * LoadableView disabled to load the control.
			 * @public
			 */
			Disabled: "Disabled"
	};
	sap.suite.ui.microchart._aStandardMarginClassNames = ["sapUiTinyMargin", "sapUiSmallMargin", "sapUiMediumMargin", "sapUiLargeMargin", "sapUiTinyMarginBeginEnd", "sapUiTinyMarginTopBottom", "sapUiSmallMarginBeginEnd", "sapUiSmallMarginTopBottom",
							"sapUiMediumMarginBeginEnd", "sapUiMediumMarginTopBottom", "sapUiLargeMarginBeginEnd", "sapUiLargeMarginTopBottom", "sapUiTinyMarginTop", "sapUiTinyMarginBottom", "sapUiTinyMarginBegin", "sapUiTinyMarginEnd",
							"sapUiSmallMarginTop", "sapUiSmallMarginBottom", "sapUiSmallMarginBegin", "sapUiSmallMarginEnd", "sapUiMediumMarginTop", "sapUiMediumMarginBottom", "sapUiMediumMarginBegin", "sapUiMediumMarginEnd", "sapUiLargeMarginTop",
							"sapUiLargeMarginBottom", "sapUiLargeMarginBegin", "sapUiLargeMarginEnd", "sapUiResponsiveMargin", "sapUiNoMargin", "sapUiNoMarginTop", "sapUiNoMarginBottom", "sapUiNoMarginBegin",  "sapUiNoMarginEnd"];

	/**
	 * Checks if the chart is in the GenericTile.
	 * @param {Object} oChart The microchart control instance that has to be checked whether it is in the GenericTile.
	 * @private
	 */
	sap.suite.ui.microchart._isInGenericTile = function (oChart) {
		var oParent = oChart.getParent();
		if (!oParent) {
			return false;
		}
		if (oParent instanceof sap.m.TileContent || oParent instanceof sap.m.GenericTile) {
			if (oParent instanceof sap.m.TileContent) {
				if (this._isInGenericTile(oParent)) {
					return true;
				}
			}
			if (oParent instanceof sap.m.GenericTile) {
				return true;
			}
		} else if (this._isInGenericTile(oParent)) {
			return true;
		}
	};

	/**
	 * Removes all SAP standard margin classes from control.
	 * @param {Object} oChart The microchart control instance that may have sapMargins as a custom style.
	 * @private
	 */
	sap.suite.ui.microchart._removeStandardMargins = function (oChart) {
		for (var i = 0;i < sap.suite.ui.microchart._aStandardMarginClassNames.length; i++) {
			if (oChart.hasStyleClass(sap.suite.ui.microchart._aStandardMarginClassNames[i])) {
				oChart.removeStyleClass(sap.suite.ui.microchart._aStandardMarginClassNames[i]);
			}
		}
	};

	/**
	 * Passes the parent container context to the child of the chart.
	 * @param {object} oChart
	 * @private
	 */
	sap.suite.ui.microchart._passParentContextToChild = function (oChart, oChildChart) {
		if (oChart.data("_parentRenderingContext")) {
			oChildChart.data("_parentRenderingContext", oChart.data("_parentRenderingContext"));
		} else if (jQuery.isFunction(oChart.getParent)) {
			oChildChart.data("_parentRenderingContext", oChart.getParent());
		}
	};

	/**
	 * Checks the given control's visibility in an increasing interval and calls the given callback function when the control becomes visible.
	 * If the timeout of 500ms is reached, the timeoutCallback function is invoked.
	 *
	 * @param {sap.ui.core.Control} control The control whose visibility is to be checked
	 * @param {function} callback The callback function to be called when the control becomes visible
	 * @private
	 */
	sap.suite.ui.microchart._checkControlIsVisible = function (control, callback) {
		var iPassedTime = 10,
			iDelay = 10,
			iTimeout = 500;

		/**
		 * Checks the control's visibility after the given delay.
		 */
		function doVisibilityCheck() {
			if (control.getVisible() && control.getDomRef() && control.$().is(":visible")) {
				callback.call(control);
			} else if (iPassedTime < iTimeout) {
				iDelay *= 2;
				iPassedTime += iDelay;
				doDelayedCheck(iDelay);
			}
		}

		/**
		 * @param {int} delay The delay in milliseconds
		 */
		function doDelayedCheck(delay) {
			jQuery.sap.delayedCall(delay, null, doVisibilityCheck);
		}

		doDelayedCheck(iDelay);
	};

	return sap.suite.ui.microchart;
});
