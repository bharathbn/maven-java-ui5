/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";

	/**
	 * Constructor for InteractiveDonutChart control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class The InteractiveDonutChart control belongs to the chart control group in the MicroChart library with less interactive features to provide more information on a chart value.
	 * By selecting a segment you can get more details on the displayed value.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 *
	 * @public
	 * @experimental Since 1.42.0 This is currently under development. The API and the newly created less parameters for donut colors could be changed at any point in time. Please take this into account when using it.
	 * @constructor
	 * @alias sap.suite.ui.microchart.InteractiveDonutChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var InteractiveDonutChart = Control.extend("sap.suite.ui.microchart.InteractiveDonutChart", /** @lends sap.suite.ui.microchart.InteractiveDonutChart.prototype */ {
		metadata : {
			library : "sap.suite.ui.microchart",
			properties : {
				/**
				 * Number of segments to be displayed.
				 */
				"maxDisplayedSegments" : {type : "int", group : "Appearance", defaultValue : 3},
				/**
				 * Switch which enables or disables selection.
				 */
				"selectionEnabled" : {type : "boolean", group : "Behavior", defaultValue : true}
			},
			defaultAggregation: "segments",
			aggregations : {
				/**
				 * Aggregation which contains all segments.
				 */
				"segments" : {type : "sap.suite.ui.microchart.InteractiveDonutChartSegment", multiple : true,  bindable : "bindable"}
			},
			events : {
				/**
				 * Event is fired when a user has selected or deselected a segment or a legend entry.
				 */
				"selectionChanged" : {
					/**
					 * Contains all selected segments.
					 */
					"selectedSegments" : {type : "sap.suite.ui.microchart.InteractiveDonutChartSegment[]"},
					/**
					 * The segment whose selection state has changed.
					 */
					"segment" : {type : "sap.suite.ui.microchart.InteractiveDonutChartSegment"},
					/**
					 * Indicates whether the segment "segment" is selected or not.
					 */
					"selected" : {type : "boolean"}
				}
			},
			associations : {

			}
		}
	});

	//legend segment constants
	InteractiveDonutChart.SEGMENT_CSSCLASS_SELECTED = "sapSuiteIDCLegendSegmentSelected";

	//chart segment constants
	InteractiveDonutChart.CHART_SEGMENT = {
		HIDE: false,
		CSSCLASS: "sapSuiteIDCChartSegment",
		CSSCLASS_HIGHLIGHT: "sapSuiteIDCChartSegmentHighlight",
		CSSCLASS_SELECTED: "sapSuiteIDCChartSegmentSelected",
		CSSCLASS_SELECTED_HIGHLIGHT: "sapSuiteIDCChartSegmentSelectedHighlight"
	};
	//chart segment ghost constants
	InteractiveDonutChart.CHART_SEGMENT_GHOST = {
		HIDE: true,
		CSSCLASS: "sapSuiteIDCChartSegmentGhost",
		CSSCLASS_HIGHLIGHT: "sapSuiteIDCChartSegmentGhostHighlight",
		CSSCLASS_SELECTED: "sapSuiteIDCChartSegmentGhostSelected",
		CSSCLASS_SELECTED_HIGHLIGHT: "sapSuiteIDCChartSegmentGhostSelectedHighlight"
	};

	/* =========================================================== */
	/* API events */
	/* =========================================================== */
	/**
	 * Event handler for InteractiveDonutChart click event.
	 *
	 * Calls the method to update the selection change and fires selection changes event.
	 *
	 * @param {sap.ui.base.Event} oEvent Event which was fired
	 */
	InteractiveDonutChart.prototype.onclick = function(oEvent) {
		var $Target = jQuery(oEvent.target),
			iIndex = $Target.data("sap-ui-idc-selection-index"),
			aSegments = this.getAggregation("segments"),
			$Focusables = this.$().find(".sapSuiteIDCLegendSegment"),
			iHasFocus;

		if (!(iIndex >= 0)) {
			iIndex = $Target.closest(".sapSuiteIDCLegendSegment").data("sap-ui-idc-selection-index");
		}

		if (isNaN(iIndex) || iIndex < 0 || iIndex >= aSegments.length) {
			return;
		}
		this._toggleSelected(iIndex);

		//find out which segment has now tabindex = 0
		iHasFocus = $Focusables.index(this.$().find(".sapSuiteIDCLegendSegment[tabindex='0']"));
		this._switchTabindex(iHasFocus, iIndex, $Focusables);
	};

	/**
	 * Handler for up arrow button event
	 *
	 * @param {sap.ui.base.Event} oEvent Event which was fired
	 */
	InteractiveDonutChart.prototype.onsapup = function(oEvent) {
		var $Focusables = this.$().find(".sapSuiteIDCLegendSegment");
		var iIndex = $Focusables.index(oEvent.target);
		if ($Focusables.length > 0) {
			this._switchTabindex(iIndex, iIndex - 1, $Focusables);
		}
		oEvent.preventDefault();
		oEvent.stopImmediatePropagation();
	};

	/**
	 * Handler for down arrow button event
	 *
	 * @param {sap.ui.base.Event} oEvent Event which was fired
	 */
	InteractiveDonutChart.prototype.onsapdown = function(oEvent) {
		var $Focusables = this.$().find(".sapSuiteIDCLegendSegment");
		var iIndex = $Focusables.index(oEvent.target);
		if ($Focusables.length > 0) {
			this._switchTabindex(iIndex, iIndex + 1, $Focusables);
		}
		oEvent.preventDefault();
		oEvent.stopImmediatePropagation();
	};

	/**
	 * Handler for home button event
	 *
	 * @param {sap.ui.base.Event} oEvent Event which was fired
	 */
	InteractiveDonutChart.prototype.onsaphome = function(oEvent) {
		var $Focusables = this.$().find(".sapSuiteIDCLegendSegment");
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
	 * @param {sap.ui.base.Event} oEvent Event which was fired
	 */
	InteractiveDonutChart.prototype.onsapend = function(oEvent) {
		var $Focusables = this.$().find(".sapSuiteIDCLegendSegment");
		var iIndex = $Focusables.index(oEvent.target);
		var iLength = $Focusables.length;
		if (iIndex !== iLength - 1 && iLength > 0) {
			this._switchTabindex(iIndex, iLength - 1, $Focusables);
		}
		oEvent.preventDefault();
		oEvent.stopImmediatePropagation();
	};

	/**
	 * Handler for enter button event
	 *
	 * @param {sap.ui.base.Event} oEvent Event which was fired
	 */
	InteractiveDonutChart.prototype.onsapenter = function(oEvent) {
		var iIndex = this.$().find(".sapSuiteIDCLegendSegment").index(oEvent.target);
		if (iIndex !== -1) {
			this._toggleSelected(iIndex);
		}
		oEvent.preventDefault();
		oEvent.stopImmediatePropagation();
	};

	/**
	 * Handler for left arrow button event
	 *
	 * @param {sap.ui.base.Event} oEvent Event which was fired
	 */
	InteractiveDonutChart.prototype.onsapleft = InteractiveDonutChart.prototype.onsapup;

	/**
	 * Handler for right arrow button event
	 *
	 * @param {sap.ui.base.Event} oEvent Event which was fired
	 */
	InteractiveDonutChart.prototype.onsapright = InteractiveDonutChart.prototype.onsapdown;

	/**
	 * Handler for space button event
	 *
	 * @param {sap.ui.base.Event} oEvent Event which was fired
	 */
	InteractiveDonutChart.prototype.onsapspace = InteractiveDonutChart.prototype.onsapenter;

	/* =========================================================== */
	/* API methods */
	/* =========================================================== */
	/**
	 * Gets all selected segments or an empty array if there is no segment selected yet
	 *
	 * @public
	 * @returns {sap.suite.ui.microchart.InteractiveDonutChartSegment[]} All selected segments
	 */
	InteractiveDonutChart.prototype.getSelectedSegments = function() {
		var aSegments, aSelectedSegments;

		aSegments = this.getAggregation("segments");
		aSelectedSegments = [];
		for (var i = 0; i < aSegments.length; i++) {
			if (aSegments[i].getSelected()) {
				aSelectedSegments.push(aSegments[i]);
			}
		}

		return aSelectedSegments;
	};

	/**
	 * Already selected segments will be deselected and members of selectedSegments attribute which are part of the segments aggregation will be set to selected state.
	 *
	 * @public
	 * @param {sap.suite.ui.microchart.InteractiveDonutChartSegment | sap.suite.ui.microchart.InteractiveDonutChartSegment[]} selectedSegments A segment element or an array of segments for which the status should be set to selected
	 * @returns {sap.suite.ui.microchart.InteractiveDonutChart} The current object in order to allow method chaining
	 */
	InteractiveDonutChart.prototype.setSelectedSegments = function(selectedSegments) {
		var aSegments, iIndex, iSelectedSegments;

		aSegments = this.getAggregation("segments");

		this._deselectAllSelectedSegments();

		if (!selectedSegments) {
			return this;
		}
		//function is overloaded: selectedSegments can be an array or a single instance
		if (selectedSegments instanceof library.InteractiveDonutChartSegment) {
			selectedSegments = [ selectedSegments ];
		}

		if (jQuery.isArray(selectedSegments)) {
			iSelectedSegments = selectedSegments.length;
			for (var i = 0; i < iSelectedSegments; i++) {
				iIndex = this.indexOfAggregation("segments", selectedSegments[i]);
				if (iIndex >= 0 && aSegments[iIndex]) {
					aSegments[iIndex].setProperty("selected", true, true);
				} else {
					jQuery.sap.log.warning("Method setSelectedSegments called with invalid InteractiveDonutChartSegment element");
				}
			}
		}
		this.invalidate();

		return this;
	};

	/* =========================================================== */
	/* Protected methods */
	/* =========================================================== */
	InteractiveDonutChart.prototype.init = function() {
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.microchart");

		this._bThemeApplied = true;
		if (!sap.ui.getCore().isInitialized()) {
			this._bThemeApplied = false;
			sap.ui.getCore().attachInit(this._handleCoreInitialized.bind(this));
		} else {
			this._handleCoreInitialized();
		}
	};

	InteractiveDonutChart.prototype.onBeforeRendering = function() {
		var $Segments = this.$().find(".sapSuiteIDCChartSegment, .sapSuiteIDCLegendSegment");

		//remove all event handlers
		$Segments.off();

		if (!this.data("_parentRenderingContext") && jQuery.isFunction(this.getParent)) {
			this.data("_parentRenderingContext", this.getParent());
		}
	};

	InteractiveDonutChart.prototype.onAfterRendering = function() {
		if (sap.ui.Device.system.desktop) {
			this._attachHoverHandlers();
		}

		this._adjustToParent(this.$());
		this.getRenderer()._handleLegendEntrySizing(this);
	};

	/* =========================================================== */
	/* Private methods */
	/* =========================================================== */

	/**
	 * Handler for the core's init event. In order for the control to be rendered only if all themes
	 * are loaded and everything is properly initialized, we attach a theme check in here.
	 *
	 * @private
	 */
	InteractiveDonutChart.prototype._handleCoreInitialized = function() {
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
	InteractiveDonutChart.prototype._handleThemeApplied = function() {
		this._bThemeApplied = true;
		this.invalidate();
		sap.ui.getCore().detachThemeChanged(this._handleThemeApplied, this);
	};

	/**
	 * Deselects all selected segments.
	 *
	 * @private
	 */
	InteractiveDonutChart.prototype._deselectAllSelectedSegments = function() {
		var aSegments = this.getAggregation("segments");
		for (var i = 0; i < aSegments.length; i++) {
			if (aSegments[i].getSelected()) {
				aSegments[i].setProperty("selected", false, true);
			}
		}
	};

	/**
	 * Attaches hover handling functions to donut segments and legend entries.
	 */
	InteractiveDonutChart.prototype._attachHoverHandlers = function() {
		var that = this,
			$Segments = this.$().find(".sapSuiteIDCChartSegment, .sapSuiteIDCLegendSegment");

		$Segments.on("mousemove", function() {
			that._handleHoverSync(jQuery(this).data("sap-ui-idc-selection-index"));
		});

		$Segments.on("mouseleave", function() {
			that._handleHoverSync(jQuery(this).data("sap-ui-idc-selection-index"), true);
		});
	};

	/**
	 * Executes jQuery class assignments based on the current segment's state and mousein/mouseout interaction flag.
	 *
	 * @param {int} index The index of the legend item or donut segment
	 * @param {boolean} out Indicated whether the mouse has left or entered the segment
	 */
	InteractiveDonutChart.prototype._handleHoverSync = function(index, out) {
		//show segment selection ghost
		var aSegments = this.getAggregation("segments"),
			bSelected = aSegments[index].getSelected();

		this._setSegmentInteractionState(InteractiveDonutChart.CHART_SEGMENT, index, bSelected, out);
		this._setSegmentInteractionState(InteractiveDonutChart.CHART_SEGMENT_GHOST, index, bSelected, out);
		this._setLegendEntryInteractionState(index, bSelected, out);
	};

	/**
	 * Sets the interaction state of a particular segment based on parameters.
	 *
	 * @param {Object} segment The segment to have interaction classes assigned
	 * @param {boolean} selected Whether the segment is selected or not
	 * @param {boolean} out Whether the mouse has left or entered the segment
	 */
	InteractiveDonutChart.prototype._setSegmentInteractionState = function(segment, index, selected, out) {
		var $Segment = this.$().find("." + segment.CSSCLASS + "[data-sap-ui-idc-selection-index='" + index + "']");

		$Segment.removeClass(segment.CSSCLASS_SELECTED);
		$Segment.removeClass(segment.CSSCLASS_HIGHLIGHT);
		$Segment.removeClass(segment.CSSCLASS_SELECTED_HIGHLIGHT);

		if (!out && selected) { //mousein
			$Segment.addClass(segment.CSSCLASS_SELECTED_HIGHLIGHT);
		} else if (!out && !selected) {
			$Segment.addClass(segment.CSSCLASS_HIGHLIGHT);
			if (segment.HIDE) {
				$Segment.show();
			}
		} else if (out && selected) {
				$Segment.addClass(segment.CSSCLASS_SELECTED);
		} else {
			if (segment.HIDE) {
				$Segment.hide();
			}
		}
	};

	/**
	 * Sets the interaction state of a particular legend entry based on parameters.
	 *
	 * @param {int} index The index of the legend entry to have interaction classes assigned
	 * @param {boolean} selected Whether the entry is selected or not
	 * @param {boolean} out Whether the mouse has left or entered the legend entry
	 */
	InteractiveDonutChart.prototype._setLegendEntryInteractionState = function(index, selected, out) {
		var $Entry = this.$().find(".sapSuiteIDCLegendSegment[data-sap-ui-idc-selection-index='" + index + "']");
		$Entry.removeClass("sapSuiteIDCLegendSegmentHover sapSuiteIDCLegendSegmentSelectedHover");

		if (!out && selected) { //mousein
			$Entry.addClass("sapSuiteIDCLegendSegmentSelectedHover");
		} else if (!out && !selected) {
			$Entry.addClass("sapSuiteIDCLegendSegmentHover");
		} else if (out && selected) {
			$Entry.removeClass("sapSuiteIDCLegendSegmentSelectedHover");
		} else {
			$Entry.removeClass("sapSuiteIDCLegendSegmentHover");
		}
	};

	/**
	 * Looks for the class '.sapUiSizeCompact' on the control and its parents to determine whether to render cozy or compact density mode.
	 * @returns {boolean} Returns true if class 'sapUiSizeCompact' was found, otherwise false
	 * @private
	 */
	InteractiveDonutChart.prototype._isCompact = function() {
//		return this.$().closest(".sapUiSizeCompact").length > 0; //suspended: not working for first rendering
		return true;
	};

	/**
	 * Updates the selection state of the segment.
	 *
	 * @param {int} index The index of the segment
	 * @private
	 */
	InteractiveDonutChart.prototype._toggleSelected = function(index) {
		var oSegment = this.getSegments()[index],
			bSegmentSelected = !oSegment.getProperty("selected"), //new state is reversed
			$InteractionArea = this.$("interactionArea-" + index),
			$Segment = this.$().find("." + InteractiveDonutChart.CHART_SEGMENT.CSSCLASS + "[data-sap-ui-idc-selection-index='" + index + "']"),
			$Ghost = this.$().find("." + InteractiveDonutChart.CHART_SEGMENT_GHOST.CSSCLASS + "[data-sap-ui-idc-selection-index='" + index + "']");

		oSegment.setProperty("selected", bSegmentSelected, true);

		if (bSegmentSelected) {
			$InteractionArea.addClass(InteractiveDonutChart.SEGMENT_CSSCLASS_SELECTED);
			$Segment.addClass(InteractiveDonutChart.CHART_SEGMENT.CSSCLASS_SELECTED);
			$Ghost.addClass(InteractiveDonutChart.CHART_SEGMENT_GHOST.CSSCLASS_SELECTED).show();
		} else {
			$InteractionArea.removeClass(InteractiveDonutChart.SEGMENT_CSSCLASS_SELECTED);
			$Segment.removeClass(InteractiveDonutChart.CHART_SEGMENT.CSSCLASS_SELECTED);
			$Ghost.removeClass(InteractiveDonutChart.CHART_SEGMENT_GHOST.CSSCLASS_SELECTED).hide();
		}

		this.fireSelectionChanged({
			selectedSegments : this.getSelectedSegments(),
			segment : oSegment,
			selected : bSegmentSelected
		});
	};

	/**
	 * Adds and removes the tabindex between elements to support keyboard navigation.
	 *
	 * @param {int} oldIndex The bar index whose tabindex was 0 previously
	 * @param {int} newIndex The bar index whose tabindex should be now set to 0
	 * @param {JQuery} focusables All the elements who can have a tabindex attribute
	 * @private
	 */
	InteractiveDonutChart.prototype._switchTabindex = function(oldIndex, newIndex, focusables) {
		if (oldIndex !== newIndex && oldIndex >= 0 && oldIndex < focusables.length && newIndex >= 0 && newIndex < focusables.length) {
			focusables.eq(oldIndex).removeAttr("tabindex");
			focusables.eq(newIndex).attr("tabindex", "0");
			focusables.eq(newIndex).focus();
		}
	};

	/**
	 * Adjusts the height and width of the whole control, if this is required, depending on parent control.
	 *
	 * @private
	 * @param {Object} the control object
	 */
	InteractiveDonutChart.prototype._adjustToParent = function($Control) {
		var oParent = this.data("_parentRenderingContext");
		if (oParent && oParent instanceof sap.m.FlexBox) {
			var $Parent = oParent.$();
			var iParentWidth = parseFloat($Parent.innerWidth());
			var iParentHeight = parseFloat($Parent.innerHeight());
			$Control.outerWidth(iParentWidth, true);
			$Control.outerHeight(iParentHeight, true);
		}
	};

	return InteractiveDonutChart;
});
