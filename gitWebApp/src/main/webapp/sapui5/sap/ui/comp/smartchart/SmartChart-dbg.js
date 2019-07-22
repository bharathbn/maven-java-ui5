/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.smartchart.SmartChart.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/comp/library', 'sap/chart/Chart', 'sap/chart/library', 'sap/chart/data/Dimension', 'sap/chart/data/Measure', 'sap/m/SegmentedButton', 'sap/m/Button', 'sap/m/Text', 'sap/m/FlexItemData', 'sap/ui/core/Item', 'sap/m/OverflowToolbar', 'sap/m/OverflowToolbarButton', 'sap/m/ToolbarSeparator', 'sap/m/ToolbarDesign', 'sap/m/ToolbarSpacer', 'sap/m/VBox', 'sap/m/VBoxRenderer', 'sap/ui/comp/providers/ChartProvider', 'sap/ui/comp/smartfilterbar/FilterProvider', 'sap/ui/comp/smartvariants/SmartVariantManagement', 'sap/ui/model/Filter', 'sap/ui/model/FilterOperator', 'sap/ui/comp/personalization/Util', 'sap/ui/Device', 'sap/ui/comp/odata/ODataModelUtil', 'sap/ui/comp/odata/MetadataAnalyser'
], function(jQuery, library, Chart, ChartLibrary, Dimension, Measure, SegmentedButton, Button, Text, FlexItemData, Item, OverflowToolbar, OverflowToolbarButton, ToolbarSeparator, ToolbarDesign, ToolbarSpacer, VBox, VBoxRenderer, ChartProvider, FilterProvider, SmartVariantManagement, Filter, FilterOperator, PersoUtil, Device, ODataModelUtil, MetadataAnalyser) {
	"use strict";

	/**
	 * Constructor for a new smartchart/SmartChart.
	 * 
	 * @param {string} [sId] ID for the new control that is generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The SmartChart control creates a chart based on OData metadata and the configuration specified. The entitySet property must be specified
	 *        to use the control. This property is used to fetch fields from OData metadata, from which the chart UI will be generated. It can also be
	 *        used to fetch the actual chart data.<br>
	 *        Based on the chartType property, this control will render the corresponding chart.<br>
	 *        <b>Note:</b> Most of the attributes are not dynamic and cannot be changed once the control has been initialized.
	 * @extends sap.m.VBox
	 * @author Franz Mueller, Pavan Nayak
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartchart.SmartChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SmartChart = VBox.extend("sap.ui.comp.smartchart.SmartChart", /** @lends sap.ui.comp.smartchart.SmartChart.prototype */
	{
		metadata: {

			library: "sap.ui.comp",
			designTime: true,
			properties: {

				/**
				 * The entity set name from which to fetch data and generate the columns.<br>
				 * <b>Note</b> This is not a dynamic property.
				 */
				entitySet: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * ID of the corresponding SmartFilter control. If specified, the SmartChart control searches for the SmartFilter control (also in the
				 * closest parent view) and attaches to the relevant events of the SmartFilter control to fetch data, show overlay etc.
				 */
				smartFilterId: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * CSV of fields that must be ignored in the OData metadata by the SmartChart control.<br>
				 * <b>Note:</b> No validation is done. Please ensure that you do not add spaces or special characters.
				 */
				ignoredFields: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * CSV of fields that must be always requested by the backend system.<br>
				 * This property is mainly meant to be used if there is no PresentationVariant annotation.<br>
				 * If both this property and the PresentationVariant annotation exist, the select request sent to the backend would be a combination
				 * of both.<br>
				 * <b>Note:</b> No validation is done. Please ensure that you do not add spaces or special characters.
				 */
				requestAtLeastFields: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * CSV of fields that is not shown in the personalization dialog.<br>
				 * <b>Note:</b> No validation is done. Please ensure that you do not add spaces or special characters.
				 */
				ignoreFromPersonalisation: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies the type of chart to be created by the SmartChart control.
				 */
				chartType: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * CSV of fields that is not shown in the list of available chart types.<br>
				 * <b>Note:</b> No validation is done. Please ensure that you do not add spaces or special characters.
				 */
				ignoredChartTypes: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * If set to <code>true</code>, variants are used. As a prerequisite, you need to specify the persistencyKey property.
				 */
				useVariantManagement: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * If set to <code>true</code>, personalized chart settings are defined. If you want to persist the chart personalization, you need
				 * to specify the persistencyKey property.
				 */
				useChartPersonalisation: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Specifies header text that is shown in the chart.
				 */
				header: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Key used to access personalization data.
				 */
				persistencyKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Retrieves or applies the current variant.
				 */
				currentVariantId: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * If set to <code>true</code>, this enables automatic binding of the chart using the chartBindingPath (if it exists) or entitySet
				 * property. This happens right after the <code>initialise</code> event has been fired.
				 */
				enableAutoBinding: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Specifies the path that is used during the binding of the chart. If not specified, the entitySet property is used instead. (used
				 * only if binding is established internally/automatically - See enableAutoBinding)
				 */
				chartBindingPath: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Controls the visibility of the Drill Up and Drill Down buttons.
				 */
				showDrillButtons: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Controls the visibility of the Zoom In and Zoom Out buttons.
				 * 
				 * @since 1.36
				 */
				showZoomButtons: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Controls the visibility of the Navigation button
				 * 
				 * @since 1.36
				 */
				showSemanticNavigationButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				// false
				},
				/**
				 * Controls the visibility of the Variant Management.
				 * 
				 * @since 1.38
				 */
				showVariantManagement: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Controls the visibility of the chart print button.
				 * 
				 * @since 1.39
				 */
				/*
				 * showPrintButton: { type: "boolean", group: "Misc", defaultValue: true // false },
				 */
				/**
				 * Controls the visibility of the chart download button.
				 * 
				 * @since 1.39
				 */
				showDownloadButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},
				/**
				 * Controls the visibility of the Details button. If set to <code>true</code>, the datapoint tooltip will be disabled as the
				 * information of selected datapoints will be found in the details popover. This will also set the drill-down button to invisible.
				 * 
				 * @since 1.38
				 */
				showDetailsButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Controls the visibility of the Breadcrumbs control for drilling up within the visible dimensions. If set to <code>true</code>,
				 * the toolbar header will be replaced by the Breadcrumbs control. This will also set the drill-up button to invisible.
				 * 
				 * @since 1.38
				 */
				showDrillBreadcrumbs: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},
				/**
				 * Controls the visibility of the chart tooltip. If set to <code>true </code>, the chart tooltip will be shown when hovering over a
				 * data point.
				 * 
				 * @since 1.38
				 */
				showChartTooltip: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				// false
				},
				/**
				 * Controls the visibility of the Navigation button
				 * 
				 * @since 1.36
				 */
				showLegendButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Set chart's legend properties.
				 * 
				 * @since 1.36
				 */
				legendVisible: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Chart selection mode. Supported values are {@link sap.chart.SelectionMode.Single} or {@link sap.chart.SelectionMode.Multi}, case
				 * insensitive, always return in upper case. Unsupported values will be ignored.
				 * 
				 * @since 1.36
				 */
				selectionMode: {
					type: "sap.chart.SelectionMode",
					group: "Misc",
					defaultValue: sap.chart.SelectionMode.Multi
				},

				/**
				 * Controls the visibility of the FullScreen button.
				 * 
				 * @since 1.36
				 */
				showFullScreenButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Controls the usage either of the tooltip or the popover. If set to <code>true</code>, a tooltip will be displayed.
				 * 
				 * @since 1.36
				 */
				useTooltip: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Controls the visualization for chart type selection. If set to <code>true</code>, the list of available chart types will be
				 * displayed. If set to <code>false</code> and there are three or fewer available chart types, the chart types will be displayed as
				 * separate buttons in the toolbar. If there are more than three chart types, a list will be shown.
				 * 
				 * @since 1.38
				 */
				useListForChartTypeSelection: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				}
			},
			associations: {
				/**
				 * Identifies the SmartVariant control which should be used for the personalization. Will be ignored if the advanced mode is set.
				 * 
				 * @since 1.38
				 */
				smartVariant: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			aggregations: {

				/**
				 * A toolbar that can be added by the user to define their own custom buttons, icons, etc. If this is specified, the SmartChart
				 * control does not create an additional toolbar, but uses this one.
				 */
				toolbar: {
					type: "sap.m.Toolbar",
					multiple: false
				},

				/**
				 * The Semantic Object Controller allows the user to specify and overwrite functionality for semantic object navigation.
				 * 
				 * @since 1.36
				 */
				semanticObjectController: {
					type: "sap.ui.comp.navpopover.SemanticObjectController",
					multiple: false
				}
			},
			events: {

				/**
				 * This event is fired once the control has been initialized.
				 */
				initialise: {},

				/**
				 * This event is fired right before the binding is done.
				 * 
				 * @param {object} [bindingParams] The bindingParams object contains filters, sorters, and other binding-related information for the
				 *        chart
				 * @param {boolean} [bindingParams.preventChartBind] If set to <code>true</code> by the listener, binding is prevented
				 * @param {object} [bindingParams.filters] The combined filter array containing a set of sap.ui.model.Filter instances of the
				 *        SmartChart and SmartFilter controls; can be modified by users to influence filtering
				 * @param {object} [bindingParams.sorter] An array containing a set of sap.ui.model.Sorter instances of the SmartChart control
				 *        (personalization); can be modified by users to influence sorting
				 */
				beforeRebindChart: {},

				/**
				 * This event is fired when data is received after binding. This event is fired if the binding for the chart is done by the SmartChart
				 * control itself.
				 */
				dataReceived: {},

				/**
				 * This event is fired after the variant management in the SmartChart control has been initialized.
				 */
				afterVariantInitialise: {},

				/**
				 * This event is fired after a variant has been saved. This event can be used to retrieve the ID of the saved variant.
				 * 
				 * @param {string} [currentVariantId] ID of the currently selected variant
				 */
				afterVariantSave: {},

				/**
				 * This event is fired after a variant has been applied.
				 * 
				 * @param {string} [currentVariantId] ID of the currently selected variant
				 */
				afterVariantApply: {},

				/**
				 * This event is fired right before the overlay is shown.
				 * 
				 * @param {object} [overlay] Overlay object that contains information related to the overlay of the chart
				 * @param {boolean} [overlay.show] If set to code>false</code> by the listener, overlay is not shown
				 */
				showOverlay: {}
			}
		},

		renderer: VBoxRenderer.render
	});

	SmartChart.prototype.init = function() {
		sap.m.FlexBox.prototype.init.call(this);
		this.addStyleClass("sapUiCompSmartChart");
		this.setFitContainer(true);
		this._bUpdateToolbar = true;
		this._oChartTypeModel = null;

		this.setHeight("100%");

		var oModel = new sap.ui.model.json.JSONModel({
			items: []
		});
		this.setModel(oModel, "$smartChartTypes");

		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");

		this.sResizeListenerId = null;
		if (Device.system.desktop) {
			this.sResizeListenerId = sap.ui.core.ResizeHandler.register(this, jQuery.proxy(this._adjustHeight, this));
		} else {
			Device.orientation.attachHandler(this._adjustHeight, this);
			Device.resize.attachHandler(this._adjustHeight, this);
		}

	};

	SmartChart.prototype._getVariantManagementControl = function(oSmartVariantId) {
		var oSmartVariantControl = null;
		if (oSmartVariantId) {
			if (typeof oSmartVariantId === 'string') {
				oSmartVariantControl = sap.ui.getCore().byId(oSmartVariantId);
			} else {
				oSmartVariantControl = oSmartVariantId;
			}

			if (oSmartVariantControl) {
				if (!(oSmartVariantControl instanceof SmartVariantManagement)) {
					// jQuery.sap.log.error("Control with the id=" + oSmartVariantId.getId ? oSmartVariantId.getId() : oSmartVariantId + " not of
					// expected type");
					jQuery.sap.log.error("Control with the id=" + typeof oSmartVariantId.getId == "function" ? oSmartVariantId.getId() : oSmartVariantId + " not of expected type");
					return null;
				}
			}
		}

		return oSmartVariantControl;
	};

	/**
	 * instantiates the SmartVariantManagementControl
	 * 
	 * @private
	 */
	SmartChart.prototype._createVariantManagementControl = function() {

		// Do not create variant management when it is not needed!
		if (this._oVariantManagement || (!this.getUseVariantManagement() && !this.getUseChartPersonalisation()) || !this.getPersistencyKey()) {
			return;
		}

		// always create VariantManagementControl, in case it is not used, it will take care of persisting the personalisation
		// without visualization
		var oPersInfo = new sap.ui.comp.smartvariants.PersonalizableInfo({
			type: "chart",
			keyName: "persistencyKey",
			dataSource: this.getEntitySet()
		});

		oPersInfo.setControl(this);

		var sSmartVariantId = this.getSmartVariant();
		if (sSmartVariantId) {
			this._oVariantManagement = this._getVariantManagementControl(sSmartVariantId);
		} else if (this._oSmartFilter && this._oSmartFilter.data("pageVariantPersistencyKey")) {
			sSmartVariantId = this._oSmartFilter.getSmartVariant();
			if (sSmartVariantId) {
				this._oVariantManagement = this._getVariantManagementControl(sSmartVariantId);
			}
		} else {
			this._oVariantManagement = new SmartVariantManagement(this.getId() + "-variant", {
				showShare: true
			});
		}

		if (this._oVariantManagement) {

			if (!this._oVariantManagement.isPageVariant()) {
				this._oVariantManagement.setVisible(this.getShowVariantManagement());
			}

			this._oVariantManagement.addPersonalizableControl(oPersInfo);

			// Current variant could have been set already (before initialise) by the SmartVariant, in case of GLO/Industry specific variant
			// handling
			// this._oVariantManagement.attachInitialise(this._variantInitialised, this);
			this._oVariantManagement.attachSave(this._variantSaved, this);
			this._oVariantManagement.attachAfterSave(this._variantAfterSave, this);

			this._oVariantManagement.initialise(this._variantInitialised, this);
		}
	};

	/**
	 * event handler for variantmanagement save event
	 * 
	 * @private
	 */
	SmartChart.prototype._variantInitialised = function() {
		if (!this._oCurrentVariant) {
			this._oCurrentVariant = "STANDARD";
		}
		this.fireAfterVariantInitialise();
		/*
		 * If VariantManagement is disabled (no LRep connectivity) trigger the binding
		 */
		if (this._oVariantManagement && !this._oVariantManagement.getEnabled()) {
			this._checkAndTriggerBinding();
		}
	};

	SmartChart.prototype._variantSaved = function() {
		if (this._oPersController) {
			this._oPersController.setPersonalizationData(this._oCurrentVariant);
		}
	};

	SmartChart.prototype._variantAfterSave = function() {
		this.fireAfterVariantSave({
			currentVariantId: this.getCurrentVariantId()
		});
	};

	SmartChart.prototype.setUseChartPersonalisation = function(bUseChartPersonalisation) {
		this.setProperty("useChartPersonalisation", bUseChartPersonalisation, true);
		this._bUpdateToolbar = true;
	};

	SmartChart.prototype._createPopover = function() {
		if (!this._oPopover && this._oChart) {
			// assign Popover to chart
			jQuery.sap.require("sap.viz.ui5.controls.Popover");
			this._oPopover = new sap.viz.ui5.controls.Popover({});
			this._oPopover.connect(this._oChart.getVizUid());
		}
	};

	SmartChart.prototype._createTooltip = function() {
		if (this._oChart) {
			this._oChart.setVizProperties({
				"interaction": {
					"behaviorType": null
				},
				"tooltip": {
					"visible": true
				}
			});
		}
	};

	SmartChart.prototype._createTooltipOrPopover = function() {
		if (this.getUseTooltip()) {
			this._createTooltip();
		} else {
			this._createPopover();
		}
	};

	SmartChart.prototype._destroyPopover = function() {
		if (this._oPopover) {
			this._oPopover.destroy();
			this._oPopover = null;
		}
	};

	SmartChart.prototype.setUseVariantManagement = function(bUseVariantManagement) {
		this.setProperty("useVariantManagement", bUseVariantManagement, true);
		if (this._oPersController) {
			this._oPersController.setResetToInitialTableState(!bUseVariantManagement);
		}
		this._bUpdateToolbar = true;
	};

	SmartChart.prototype.setToolbar = function(oToolbar) {
		if (this._oToolbar) {
			this.removeItem(this._oToolbar);
		}
		this._oToolbar = oToolbar;
		this._bUpdateToolbar = true;
	};

	SmartChart.prototype.getToolbar = function() {
		return this._oToolbar;
	};

	SmartChart.prototype.setHeader = function(sText) {
		this.setProperty("header", sText, true);
		this._refreshHeaderText();
	};

	/**
	 * sets the header text
	 * 
	 * @private
	 */
	SmartChart.prototype._refreshHeaderText = function() {
		if (!this._headerText) {
			this._bUpdateToolbar = true;
			return;
		}
		var sText = this.getHeader();
		this._headerText.setText(sText);
	};

	/**
	 * creates the toolbar
	 * 
	 * @private
	 */
	SmartChart.prototype._createToolbar = function() {
		// If no toolbar exists --> create one
		if (!this._oToolbar) {
			this._oToolbar = new OverflowToolbar({
				design: ToolbarDesign.Transparent
			});
			this._oToolbar.addStyleClass("sapUiCompSmartChartToolbar");
		}
		this._oToolbar.setLayoutData(new sap.m.FlexItemData({
			shrinkFactor: 0
		}));
		this.insertItem(this._oToolbar, 0);
	};

	/**
	 * creates the toolbar content
	 * 
	 * @private
	 */
	SmartChart.prototype._createToolbarContent = function() {
		// insert the items in the custom toolbar in reverse order => insert always at position 0
		this._addDrillBreadcrumbs();
		this._addVariantManagementToToolbar();
		this._addSeparatorToToolbar();
		this._addHeaderToToolbar();

		// this._addDrillBreadcrumbs();

		// add spacer to toolbar
		this._addSpacerToToolbar();

		this._addSemanticNavigationButton();

		this._addDetailsButton();

		// Add Drill buttons
		this._addDrillUpDownButtons();

		// Add Legend button
		this._addLegendButton();

		// Add Zoom buttons
		this._addZoomInOutButtons();

		// this._addPrintButton();

		this._addDownloadButton();

		// Add Personalisation Icon
		this._addPersonalisationToToolbar();

		// Add Fullscreen Button
		this._addFullScrrenButton();

		// Add Chart Type Button
		this._addChartTypeToToolbar();

		// Seems like toolbar only contains spacer and is actually not needed - remove it
		if (this._oToolbar && (this._oToolbar.getContent().length === 0 || (this._oToolbar.getContent().length === 1 && this._oToolbar.getContent()[0] instanceof ToolbarSpacer))) {
			this.removeItem(this._oToolbar);
			this._oToolbar.destroy();
			this._oToolbar = null;
		}
	};

	SmartChart.prototype.setShowVariantManagement = function(bFlag) {
		this.setProperty("showVariantManagement", bFlag);

		if (this._oVariantManagement && this._oVariantManagement.isPageVariant()) {
			this._oVariantManagement.setVisible(bFlag);
		}
	};

	SmartChart.prototype.setShowDetailsButton = function(bFlag) {

		this.setProperty("showDetailsButton", bFlag);

		// Handle visibility of details button and chart tooltips
		if (this._oDetailsButton) {
			this._oDetailsButton.setVisible(bFlag);
			// this._toggleChartTooltipVisibility(!bFlag);
		}

		// Handle visibility of drill up button
		if (this._oDrillDownButton) {
			this._oDrillDownButton.setVisible(!bFlag);
		}
	};

	SmartChart.prototype.setShowDownloadButton = function(bFlag) {
		this.setProperty("showDownloadButton", bFlag);
		// Handle the visibility of the download button
		if (this._oDownloadButton) {
			this._oDownloadButton.setVisible(bFlag);
		}

	};

	SmartChart.prototype.setShowDrillBreadcrumbs = function(bFlag) {

		this.setProperty("showDrillBreadcrumbs", bFlag);

		// Handle visibility of breadcrumbs
		if (this._oDrillBreadcrumbs) {
			this._oDrillBreadcrumbs.setVisible(bFlag);
		}

		// Handle visibility of header text
		/*
		 * if (this._headerText) { this._headerText.setVisible(!bFlag); } else { this._addHeaderToToolbar(); }
		 */

		// Handle visibility of drill up button
		if (this._oDrillUpButton) {
			this._oDrillUpButton.setVisible(!bFlag);
		}

		// Handle visibility of separator
		/*
		 * if (this._oSeparator) { this._oSeparator.setVisible(!bFlag); }
		 */
	};

	SmartChart.prototype.setShowChartTooltip = function(bFlag) {
		this.setProperty("showChartTooltip", bFlag);
		this._toggleChartTooltipVisibility(bFlag);
	};

	/**
	 * adds breadcrumbs to the toolbar for drilling up in the selected dimensions
	 * 
	 * @private
	 */
	SmartChart.prototype._addDrillBreadcrumbs = function() {

		if (!this._oDrillBreadcrumbs /* && this.getShowDrillBreadcrumbs() */) {
			jQuery.sap.require("sap.m.Breadcrumbs");
			jQuery.sap.require("sap.m.Link");

			this._oDrillBreadcrumbs = new sap.m.Breadcrumbs(this.getId() + "-drillBreadcrumbs", {
				visible: this.getShowDrillBreadcrumbs()
			}).addStyleClass("sapUiCompSmartChartBreadcrumbs");
			// this._oToolbar.addContent(this._oDrillBreadcrumbs);
			this._oToolbar.insertContent(this._oDrillBreadcrumbs, 0);
			this._updateDrillBreadcrumbs();

			// Attach to the drill events in order to update the breadcrumbs
			this._oChart.attachDrilledUp(function(oEvent) {
				this._updateDrillBreadcrumbs();
			}.bind(this));

			this._oChart.attachDrilledDown(function(oEvent) {
				this._updateDrillBreadcrumbs();
			}.bind(this));
		}
	};
	/**
	 * updates the breadcrumbs control when drilled up or down within the dimensions
	 * 
	 * @private
	 */
	SmartChart.prototype._updateDrillBreadcrumbs = function() {

		// Get the currenct visible dimensions, copy array reverse it to reflect correct order of chart
		var aVisibleDimensionsRev = this._oChart.getVisibleDimensions().slice();

		// Clear aggregation before we rebuild it
		if (this._oDrillBreadcrumbs && this._oDrillBreadcrumbs.getLinks()) {
			this._oDrillBreadcrumbs.removeAllLinks();
		}

		// Reverse array to display right order of crumbs
		aVisibleDimensionsRev.reverse();
		aVisibleDimensionsRev.forEach(function(dim, index, array) {

			// Check if we have name information before creating a crumb
			if (typeof this._oChart.getDimensionByName(dim) != 'undefined') {

				// Create the bread crumbs and put the current dimension label as location text
				var sDimLabel = this._oChart.getDimensionByName(dim).getLabel();

				if (index == 0) {

					this._oDrillBreadcrumbs.setCurrentLocationText(sDimLabel);

				} else {

					var oCrumb = new sap.m.Link({
						text: sDimLabel,
						press: function(oEvent) {
							// OLD implementation before chart api improvement
							// get the currently visible dimensions
							/*
							 * var aDrilledDimensions = []; var aVisibleDimensions = this._oChart.getVisibleDimensions(); // copy all dimensions which
							 * were selected before including the selected one aVisibleDimensions.some(function(elem, index, array) {
							 * aDrilledDimensions.push(elem); if (this._oChart.getDimensionByName(elem).getLabel() === oEvent.getSource().getText()) {
							 * return true; } }.bind(this)); // get rid of the currently visible dimensions and set the new dimensions
							 * this._oChart.setVisibleDimensions([]); this._oChart.setVisibleDimensions(aDrilledDimensions); // get rid of details in
							 * the model this._oChart.fireDeselectData(oEvent); // don't forget to update the bread crumbs control
							 * this._updateDrillBreadcrumbs();
							 */

							// New Chart API allows for faster call of stack information
							var iLinkIndex = this._oDrillBreadcrumbs.indexOfLink(oEvent.getSource());
							this._oChart.drillUp(iLinkIndex + 1); // plus the position before this link regarding the visualization in bread crumb
							// get rid of entries in the details model
							this._oChart.fireDeselectData(oEvent);
							// don't forget to update the bread crumbs control itself
							this._updateDrillBreadcrumbs();

						}.bind(this)
					});

					this._oDrillBreadcrumbs.insertLink(oCrumb);
				}
			}
		}.bind(this));
	};

	/**
	 * adds the details button to the toolbar
	 * 
	 * @private
	 */
	SmartChart.prototype._addDetailsButton = function() {
		var that = this;

		if (!this._oDetailsButton /* && this.getShowDetailsButton() */) {
			this._oDetailsButton = new Button(this.getId() + "-btnDetails", {
				type: "Transparent",
				// text: this._oRb.getText("CHART_DETAILSBTN_LABEL"),
				tooltip: this._oRb.getText("CHART_DETAILSBTN_TOOLTIP"),
				visible: this.getShowDetailsButton(),
				layoutData: new sap.m.OverflowToolbarLayoutData({
					priority: sap.m.OverflowToolbarPriority.NeverOverflow
				}),
				enabled: true,
				press: function(oEvent) {
					that._openDetailsPopover(oEvent);
				}
			});

			// Create models to save detail data from selected chart datapoints
			this._aDetailsEntries = [];
			this._oDetailsModel = new sap.ui.model.json.JSONModel({
				items: this._aDetailsEntries
			});

			if (!this._oSemanticNavHandler) {
				jQuery.sap.require("sap.ui.comp.navpopover.NavigationPopoverHandler");
				this._oSemanticNavHandler = new sap.ui.comp.navpopover.NavigationPopoverHandler({});
			}

			// Change buttons label counter on data selection of chart
			this._oChart.attachSelectData(function(oEvent) {
				that._updateDetailsText(oEvent);
				that._updateDetailsModel(oEvent);
			});

			this._oChart.attachDeselectData(function(oEvent) {
				that._updateDetailsText(oEvent);
				that._updateDetailsModel(oEvent);
			});

			// Remember: Colums get deselected after drill up or down happened!
			this._oChart.attachDrilledUp(function(oEvent) {
				that._oChart.fireDeselectData(oEvent);
			});

			this._oChart.attachDrilledDown(function(oEvent) {
				that._oChart.fireDeselectData(oEvent);
			});
			// selectedRowCount is updated after renderer is finished
			this._oChart.attachRenderComplete(function(oEvent) {
				that._updateDetailsText(oEvent);
			});

			// this._updateDetailsText();
			this._oToolbar.addContent(this._oDetailsButton);
		}
	};

	/**
	 * adds a print button to the toolbar
	 */
	/*
	 * SmartChart.prototype._addPrintButton = function() { if (!this._oPrintButton && this.getShowPrintButton()) { this._oPrintButton = new
	 * Button(this.getId() + "-btnPrint", { type: "Transparent", tooltip: "Print Chart", icon: "sap-icon://print", layoutData: new
	 * sap.m.OverflowToolbarLayoutData({ priority: sap.m.OverflowToolbarPriority.NeverOverflow }), enabled: true, press: function(oEvent) {
	 * this._printChart(oEvent); }.bind(this) }); this._oToolbar.addContent(this._oPrintButton); } };
	 */

	/**
	 * adds a download button to the toolbar
	 */
	SmartChart.prototype._addDownloadButton = function() {
		if (!this._oDownloadButton) {
			this._oDownloadButton = new OverflowToolbarButton(this.getId() + "btnDownload", {
				type: "Transparent",
				text: this._oRb.getText("CHART_DOWNLOADBTN_TEXT"),
				tooltip: this._oRb.getText("CHART_DOWNLOADBTN_TOOLTIP"),
				icon: "sap-icon://download",
				/*
				 * layoutData: new sap.m.OverflowToolbarLayoutData({ priority: sap.m.OverflowToolbarPriority.NeverOverflow }),
				 */
				visible: this.getShowDownloadButton(),
				press: function(oEvent) {
					// Check for browser
					if (window.navigator && window.navigator.msSaveOrOpenBlob) {
						// Handle IE, User can either open or save the svg
						// Create a blob object containing the chart svg data
						var svgBlob = new window.Blob([
							this._getVizFrame().exportToSVGString()
						], {
							'type': "image/svg+xml"
						});
						window.navigator.msSaveOrOpenBlob(svgBlob);
					} else {

						this._downloadChartPNG();
					}

				}.bind(this)
			});
			this._oToolbar.addContent(this._oDownloadButton);
		}
	};

	/**
	 * opens an image of the currently displayed chart in a new tab and show browsers print dialog
	 */
	/*
	 * SmartChart.prototype._printChart = function() { // Create a blob object containing the chart svg data var svgBlob = new window.Blob([
	 * this._getVizFrame().exportToSVGString() ], { 'type': "image/svg+xml" }); // Check for browser if (window.navigator &&
	 * window.navigator.msSaveOrOpenBlob) { // Handle IE, User can either open or save the svg window.navigator.msSaveOrOpenBlob(svgBlob); } else { //
	 * Firefox, Chrome // Create a local url for the blob in order to have same origin. var url = window.URL.createObjectURL(svgBlob); // Open new
	 * window showing the svg image var svgWindow = window.open(url, "svg_win"); // We need to use own var as window.onfocus is not working correctly
	 * after print dialog is closed var tabIsFocused = false; // check if print is finished or cancelled setInterval(function() { if (tabIsFocused ===
	 * true) { svgWindow.close(); } }, 1); // Do the print svgWindow.onload = function() { // TODO: Should work on all Apple devices, but wee need to
	 * handle Android separately if (sap.ui.Device.os.name === "Android") { // do something } else { svgWindow.print(); // Print was done or cancelled
	 * tabIsFocused = true; } }; } };
	 */

	/**
	 * downloads a svg file of the currently displayed chart
	 */
	SmartChart.prototype._downloadChartSVG = function() {
		// Download a file
		var fileName = this.getHeader();
		var dl = document.createElement('a');
		dl.setAttribute('href', 'data:image/svg+xml,' + encodeURIComponent(this._getVizFrame().exportToSVGString()));
		dl.setAttribute('download', fileName ? fileName : 'Chart' + '.svg');
		dl.click();
	};

	/**
	 * downloads the chart as png file
	 */
	SmartChart.prototype._downloadChartPNG = function() {
		// Not working for IE, in this case we create a blob and call the IE notification bar for downloading the SVG
		// Create Image and then download (Chrome)
		var fileName = this.getHeader();
		var chartSVG = this._getVizFrame().exportToSVGString();
		var canvas = document.createElement('canvas'); // Not shown on page
		var context = canvas.getContext('2d');
		var loader = new Image(); // Not shown on page

		// getId() because vizFrame content changes id when selecting another chart type
		loader.width = canvas.width = document.getElementById(this._oChart.getId()).offsetWidth;
		loader.height = canvas.height = document.getElementById(this._oChart.getId()).offsetHeight;

		loader.onload = function() {
			context.drawImage(loader, 0, 0);

			var dl = document.createElement('a');
			dl.setAttribute('href', canvas.toDataURL());
			dl.setAttribute('download', fileName ? fileName : 'Chart' + '.png');
			dl.click();
		};
		loader.setAttribute('crossOrigin', 'anonymous');
		loader.src = 'data:image/svg+xml,' + encodeURIComponent(chartSVG);
	};
	/**
	 * opens the details popover when clicked on details button
	 * 
	 * @param {object} oEvent The event arguments
	 * @private
	 */
	SmartChart.prototype._openDetailsPopover = function(oEvent) {

		if (!this._oDetailsPopover) {

			jQuery.sap.require("sap.m.ResponsivePopover");
			jQuery.sap.require("sap.m.NavContainer");
			jQuery.sap.require("sap.m.VBox");
			jQuery.sap.require("sap.m.Page");
			jQuery.sap.require("sap.m.List");
			jQuery.sap.require("sap.m.StandardListItem");
			jQuery.sap.require("sap.m.ObjectListItem");
			jQuery.sap.require("sap.m.ObjectStatus");
			jQuery.sap.require("sap.m.ObjectAttribute");
			jQuery.sap.require("sap.m.ScrollContainer");

			this._oDetailsPopover = new sap.m.ResponsivePopover(this.getId() + "-popoverDetails", {
				showHeader: false,
				placement: "Bottom",
				contentWidth: "25rem",
				contentHeight: "20rem",
				verticalScrolling: false

			}).addStyleClass("sapUiCompSmartChartDetailsPopover").addStyleClass("navigationPopover");

			this._oDetailsPopover.addContent(this._createDetailsPopoverStructure());

			// Navigate back to DetailsMasterPage if nothing is selected
			// But stay on current details page if a datapoint is selected
			this._oDetailsPopover.attachAfterClose(function(oEvent) {
				// Nothing selected?
				// if (this._oChart.getSelectedDataPoints().count === 0) {

				// Already on detailsMasterPage?
				if (this._oDetailsNavContainer.getCurrentPage() !== this._oDetailsMasterPage) {
					this._oDetailsNavContainer.to(this._oDetailsMasterPage);
					this._oDetailsDrillInPage.setShowNavButton(true);
					this._oDrillInMasterList.getItems()[0].setVisible(true);
				}
				// }

			}.bind(this));
		}

		// Update content and then open the popover
		this._bindDetailsListAggregation();

		// On Phone we need a title for the page header
		if (this._oDetailsMasterPage.getShowHeader()) {
			this._updateDetailsText();
		}

		// if no datapoint is selected we navigate to the drill-in page immediately
		if (this._oChart.getSelectedDataPoints().count === 0) {
			this._oDetailsDrillInPage.setShowNavButton(false);

			this._oDrillInMasterList.getItems()[0].firePress();
		} else {
			// this._oDrillInMasterList.getItems()[0].setVisible(false);
		}
		this._oDetailsPopover.openBy(oEvent.getSource());
	};

	/**
	 * updates the details button text based on the selected data point count
	 * 
	 * @param {object} oEvent The event arguments
	 * @private
	 */
	SmartChart.prototype._updateDetailsText = function(oEvent) {
		var detailsText, selectedCategories = this._oChart.getSelectedDataPoints().count;
		if (selectedCategories > 0) {
			detailsText = this._oRb.getText("CHART_DETAILSBTN_LABEL", [
				selectedCategories
			]);
		} else {
			detailsText = this._oRb.getText("CHART_DRILLDOWNDETAILSPAGE_TITLE");
		}
		this._oDetailsButton.setText(detailsText);

		if (this._oDetailsMasterPage && this._oDetailsMasterPage.getShowHeader()) {
			this._oDetailsMasterPage.setTitle(detailsText);
		}
	};

	/**
	 * updates the details model based on the selected or deselected data points
	 * 
	 * @param {object} oEvent The event arguments
	 * @private
	 */
	SmartChart.prototype._updateDetailsModel = function(oEvent) {

		var aDataPoints = this._oChart.getSelectedDataPoints().dataPoints;

		// Clean the old entries
		this._aDetailsEntries = [];

		// Create new entries for each data object
		aDataPoints.forEach(function(dataPoint) {
			// Read measures and get rid of all but not the one on current index
			// Place same object with this measure on index again in array!
			var aMeasures = dataPoint.measures;

			aMeasures.forEach(function(sMeasure) {
				// Copy object and replace measures array with the correct value
				// Then push into details array, so that each measure is represented by an own object.
				var oDataPoint = jQuery.extend(true, {}, dataPoint.context.getObject());

				oDataPoint.measures = [
					sMeasure
				];
				this._aDetailsEntries.push(oDataPoint);
			}.bind(this));

			// Old implementation didn't handle multiple measures in a right way
			// this._aDetailsEntries.push(dataPoint.context.getObject());
		}.bind(this));

		// Set into model
		this._oDetailsModel.getData("items").items = this._aDetailsEntries;

		if (this._oDetailsNavContainer && this._oDetailsNavContainer.getCurrentPage() !== this._oDetailsMasterPage) {
			this._oDetailsNavContainer.back();
		}

	};

	// Obsolete, as the new function handles it directly
/*
 * SmartChart.prototype._insertDetailsIntoModel = function(aDataPoints) { var that = this; aDataPoints.forEach(function(dataPoint) { // Put it into
 * the Model that._aDetailsEntries.push(dataPoint.data); }); };
 */

/*
 * SmartChart.prototype._removeDetailsFromModel = function(aDataPoints) { var that = this; aDataPoints.forEach(function(dataPoint) { // Remove from
 * the model var index = that._aDetailsEntries.indexOf(dataPoint.data); that._aDetailsEntries.splice(index, 1); }); };
 */

	/**
	 * binds the items aggregation of the details master list
	 * 
	 * @private
	 */
	SmartChart.prototype._bindDetailsListAggregation = function() {
		// If no dataPoints selected, hide the list
		if (this._aDetailsEntries.length > 0) {
			this._oDetailsMasterListScrollContainer.setVisible(true);
		} else {
			this._oDetailsMasterListScrollContainer.setVisible(false);
		}

		var aDimensions = this._oChart.getVisibleDimensions();
		var aMeasures = this._oChart.getVisibleMeasures();

		// Check if dimensions and measurements are in these entries and build dynamic template
		// Bind the model entries against the list aggregation
		this._oDetailsMasterList.bindAggregation("items", "/items", function(sId, oContext) {

			var measure;
			var tecMeasureName;
			var displayMeasureName;
			var measureUnit;
			var dimNames = "";

			// Find the specific measure and its value for this oContext and use it in template
			aMeasures.some(function(m) {
				// Old implementation didn't handle multiple measures in a correct way.
				/*
				 * if (oContext.getProperty(m)) { measure = oContext.getProperty(m); measureName = m; return true; }
				 */

				// Check value in measures array of oContet object and if we have a match, copy the value for the list item.
				if (oContext.getObject().measures[0] == m) {
					measure = oContext.getProperty(m);
					tecMeasureName = m;
					displayMeasureName = this._oChart.getMeasureByName(tecMeasureName).getUnitBinding();

					// Get the measureUnit for the measure
					if (displayMeasureName) {
						measureUnit = oContext.getProperty(displayMeasureName);

						// Put the measure unit behind the value
						if (measureUnit) {
							measure = measure.concat(" ", measureUnit);
						}
					}
					return true;
				}

			}.bind(this));

			// Get all dimensions except for the last one as we show this one in the title of the item
			for (var i = 0; i < aDimensions.length - 1; i++) {

				dimNames += oContext.getProperty(aDimensions[i]);
				if (i < aDimensions.length - 2) {
					dimNames += " / ";
				}
			}

			// Build an item template with all needed values
			var oDetailsItemTemplate = new sap.m.ObjectListItem({
				title: oContext.getProperty(aDimensions[aDimensions.length - 1]),// last and hence deepest currently visible dimension
				// type: "Navigation",
				type: (function() {
					// Check if we have semantic objects for this this data point context
					if (this._determineSemanticObjects(oContext.getObject(), oContext).length > 0) {
						return sap.m.ListType.Navigation;
					} else {
						return sap.m.ListType.Inactive;
					}
				}.bind(this)()),
				number: measure,
				numberUnit: tecMeasureName,
				attributes: [
					new sap.m.ObjectAttribute({
						text: dimNames
					})
				]
			});

			// Attach the semantic object navigation to each item
			oDetailsItemTemplate.attachPress(function(oEvent) {
				this._navigateToSemanticObjectDetails(oEvent);
			}.bind(this));

			return oDetailsItemTemplate;

		}.bind(this));
	};

	/**
	 * returns the currently visible dimensions as string in a comma separated order
	 * 
	 * @returns {string} The currently visible dimensions in a comma separated order
	 * @private
	 */
/*
 * SmartChart.prototype._getCurrentDimensionsText = function() { var dimText = ""; this._oChart.getVisibleDimensions().forEach(function(dimension,
 * index, array) { dimText += dimension; if (index + 1 != array.length) { dimText += ", "; } }); return dimText; };
 */

	/**
	 * updates the master list item for drill in functionality to show currently visible dimensions
	 * 
	 * @param {object} oEvent The event arguments
	 * @private
	 */
/*
 * SmartChart.prototype._updateDrillInMasterListItem = function(oEvent) { if (this._oDrillInMasterList) {
 * this._oDrillInMasterList.getItems()[0].setDescription(this._getCurrentDimensionsText()); } };
 */

	/**
	 * creates the inner nav container structure of the details popover containing all necessary lists and pages to provide new details functionality
	 * 
	 * @returns {sap.m.NavContainer} nav container for the details popover
	 * @private
	 */
	SmartChart.prototype._createDetailsPopoverStructure = function() {

		// NavContainer
		this._oDetailsNavContainer = new sap.m.NavContainer(this.getId() + "-navContainerDetails");

		// ScrollContainer
		this._oDetailsMasterListScrollContainer = new sap.m.ScrollContainer({
			vertical: true,
			horizontal: false
		}).addStyleClass("sapUiCompSmartChartDetailsScrollContainer");

		// Layouts
		this._oDetailsVBox = new sap.m.VBox(this.getId() + "-vBoxDetails", {
		// height:"20rem"
		});

		// Pages
		this._oDetailsMasterPage = new sap.m.Page(this.getId() + "-navMasterPageDetails", {
			showHeader: jQuery.device.is.phone,
			enableScrolling: false
		});
		// On Phone we need a title for the page header
		/*
		 * if (this._oDetailsMasterPage.getShowHeader()) { this._oDetailsMasterPage.setTitle(this._oRb.getText("CHART_DETAILSBTN_LABEL")); }
		 */

		this._oDetailsDrillInPage = new sap.m.Page(this.getId() + "-navDrillInPageDetails", {
			title: this._oRb.getText("CHART_DRILLDOWNDETAILSPAGE_TITLE"),
			showHeader: true,
			showNavButton: true,
			navButtonPress: function() {
				this._oDetailsNavContainer.back();
			}.bind(this)
		});

		this._oDetailsSemanticPage = new sap.m.Page(this.getId() + "-navSemanticPageDetails", {
			showHeader: true,
			showNavButton: true,
			navButtonPress: function() {
				this._oDetailsNavContainer.back();
			}.bind(this)
		});

		this._oDetailsSemanticPageMulti = new sap.m.Page(this.getId() + "-navSemanticPageMultiDetails", {
			showHeader: true,
			showNavButton: true,
			navButtonPress: function() {
				this._oDetailsNavContainer.back();
			}.bind(this)
		});

		// Master Lists
		this._oDetailsMasterList = new sap.m.List(this.getId() + "-navMasterListDetails", {

		});

		this._oDrillInMasterList = new sap.m.List(this.getId() + "-navMasterListDrillIn", {
			items: [
				new sap.m.StandardListItem({
					title: this._oRb.getText("CHART_DRILLDOWNMASTERLIST_ITEM_TITLE"),
					// description: this._getCurrentDimensionsText(),
					type: "Navigation",
					press: function(oEvent) {
						this._navigateToDrillDetailsList(oEvent);
					}.bind(this)
				})
			]
		});

		this._oRelatedAppsMasterList = new sap.m.List(this.getId() + "-navMasterListRelatedApps", {
			items: [
				new sap.m.StandardListItem({
					title: this._oRb.getText("CHART_RELATEDAPPSMASTERLIST_ITEM_TITLE"),
					type: "Navigation"
				})
			]
		});

		// Set Models
		this._oDetailsMasterList.setModel(this._oDetailsModel);

		// Create semantic Object Handling
		this._initSemanticNavigationHandling();

		// Put things together
		this._oDetailsMasterListScrollContainer.addContent(this._oDetailsMasterList);
		this._oDetailsVBox.addItem(/* this._oDetailsMasterList */this._oDetailsMasterListScrollContainer).addItem(this._oDrillInMasterList);// .addItem(this._oRelatedAppsMasterList);
		this._oDetailsMasterPage.addContent(this._oDetailsVBox);
		this._oDetailsNavContainer.addPage(this._oDetailsMasterPage).addPage(this._oDetailsDrillInPage).addPage(this._oDetailsSemanticPage).addPage(this._oDetailsSemanticPageMulti);

		return this._oDetailsNavContainer;
	};

	/**
	 * adds the full-screen button to the toolbar
	 * 
	 * @private
	 */
	SmartChart.prototype._addFullScrrenButton = function() {
		var oFullScreenButton;
		if (this.getShowFullScreenButton()) {
			oFullScreenButton = new OverflowToolbarButton(this.getId() + "-btnFullScreen", {
				type: "Transparent",
				press: function() {
					this._toggleFullScreen(!this.bFullScreen);
				}.bind(this)
			});
			this.oFullScreenButton = oFullScreenButton;
			this._toggleFullScreen(this.bFullScreen, true);
			this._oToolbar.addContent(oFullScreenButton);
		}
	};

	/**
	 * adds the zoom-in / zoom-out buttons to the toolbar
	 * 
	 * @private
	 */
	SmartChart.prototype._addZoomInOutButtons = function() {

		var that = this;
		this._oZoomInButton = new OverflowToolbarButton(this.getId() + "-btnZoomIn", {
			type: "Transparent",
			text: this._oRb.getText("CHART_ZOOMINBTN_TEXT"),
			tooltip: this._oRb.getText("CHART_ZOOMINBTN_TOOLTIP"),
			icon: "sap-icon://zoom-in",
			press: function() {
				if (that._oChart) {
					that._oChart.zoom({
						direction: "in"
					});
				}
			},
			visible: this.getShowZoomButtons()
		});

		this._oZoomOutButton = new OverflowToolbarButton(this.getId() + "-btnZoomOut", {
			type: "Transparent",
			text: this._oRb.getText("CHART_ZOOMOUTBTN_TEXT"),
			tooltip: this._oRb.getText("CHART_ZOOMOUTBTN_TOOLTIP"),
			icon: "sap-icon://zoom-out",
			press: function() {
				if (that._oChart) {
					that._oChart.zoom({
						direction: "out"
					});
				}
			},
			visible: this.getShowZoomButtons()
		});

		this._oToolbar.addContent(this._oZoomInButton);
		this._oToolbar.addContent(this._oZoomOutButton);
	};

	/**
	 * Sets the zoom-in / zoom-out buttons visibility state.
	 * 
	 * @param {boolean} bFlag true to display the zoom-in / zoom-out buttons
	 */
	SmartChart.prototype.setShowZoomButtons = function(bFlag) {

		this.setProperty("showZoomButtons", bFlag);

		if (this._oZoomInButton) {
			this._oZoomInButton.setVisible(bFlag);
		}
		if (this._oZoomOutButton) {
			this._oZoomOutButton.setVisible(bFlag);
		}
	};

	/**
	 * Sets the chart legend visibility state.
	 * 
	 * @param {boolean} bFlag true to display the chart legend
	 */
	SmartChart.prototype.setLegendVisible = function(bFlag) {

		this.setProperty("legendVisible", bFlag);

		this._setLegendVisible(bFlag);
	};

	/**
	 * Sets the chart legend visibility state.
	 * 
	 * @param {boolean} bFlag true to display the chart legend
	 * @private
	 */
	SmartChart.prototype._setLegendVisible = function(bFlag) {

		var oVizFrame = this._getVizFrame();
		if (oVizFrame) {
			oVizFrame.setLegendVisible(bFlag);
		}

	};

	/**
	 * Returns the charts _vizFrame aggregation.
	 * 
	 * @returns {object} charts _vizFrame aggregation object
	 * @private
	 */
	SmartChart.prototype._getVizFrame = function() {

		var oVizFrame = null;
		if (this._oChart) {
			oVizFrame = this._oChart.getAggregation("_vizFrame");
		}

		return oVizFrame;
	};

	/**
	 * adds the legend button to the toolbar
	 * 
	 * @private
	 */
	SmartChart.prototype._addLegendButton = function() {

		var that = this;
		this._oLegendButton = new OverflowToolbarButton(this.getId() + "-btnLegend", {
			type: "Transparent",
			text: this._oRb.getText("CHART_LEGENDBTN_TEXT"),
			tooltip: this._oRb.getText("CHART_LEGENDBTN_TOOLTIP"),
			icon: "sap-icon://legend",
			press: function() {
				that.setLegendVisible(!that.getLegendVisible());
			},
			visible: this.getShowLegendButton()
		});

		this._oToolbar.addContent(this._oLegendButton);
	};

	/**
	 * Sets the legend button visibility state.
	 * 
	 * @param {boolean} bFlag true to display the legend button
	 */
	SmartChart.prototype.setShowLegendButton = function(bFlag) {

		this.setProperty("showLegendButton", bFlag);

		if (this._oLegendButton) {
			this._oLegendButton.setVisible(bFlag);
		}
	};

	/**
	 * Sets the semantic navigation button visibility state.
	 * 
	 * @param {boolean} bFlag true to display the semantic navigation button
	 */
	SmartChart.prototype.setShowSemanticNavigationButton = function(bFlag) {

		this.setProperty("showSemanticNavigationButton", bFlag);

		if (this._oSemanticalNavButton) {
			this._oSemanticalNavButton.setVisible(bFlag);
		} else {
			/* eslint-disable no-lonely-if */
			if (bFlag) {
				this._addSemanticNavigationButton();
			}
			/* eslint-enable no-lonely-if */
		}
	};

	/**
	 * adds the semantical navigation button to the toolbar
	 * 
	 * @private
	 */
	SmartChart.prototype._addSemanticNavigationButton = function() {
		var that = this, aSemanticObjects;

		if (!this._oSemanticalNavButton && this.getShowSemanticNavigationButton() && this._oToolbar) {
			this._oSemanticalNavButton = new Button(this.getId() + "-btnNavigation", {
				type: "Transparent",
				text: this._oRb.getText("CHART_SEMNAVBTN"),
				tooltip: this._oRb.getText("CHART_SEMNAVBTN_TOOLTIP"),
				visible: this.getShowSemanticNavigationButton(),
				enabled: false
			});

			jQuery.sap.require("sap.ui.comp.navpopover.NavigationPopoverHandler");

			var oNavHandler = new sap.ui.comp.navpopover.NavigationPopoverHandler({
				control: this._oSemanticalNavButton
			});

			var oSemanticObjectController = this.getSemanticObjectController();
			if (oSemanticObjectController) {
				oNavHandler.setSemanticObjectController(oSemanticObjectController);
			}

			this._oSemanticalNavButton.attachPress(function(oEvent) {

				if (aSemanticObjects && (aSemanticObjects.length > 0)) {

					if (aSemanticObjects.length === 1) {
						var oSemanticObjects = MetadataAnalyser.getSemanticObjectsFromProperty(aSemanticObjects[0]);
						if (oSemanticObjects) {
							oNavHandler.setSemanticObject(oSemanticObjects.defaultSemanticObject);
							oNavHandler.setAdditionalSemanticObjects(oSemanticObjects.additionalSemanticObjects);
							oNavHandler.setSemanticObjectLabel(aSemanticObjects[0].fieldLabel);
							oNavHandler.openPopover();
						}
					} else {
						that._semanticObjectList(aSemanticObjects, oNavHandler);
					}
				}
			});
			if (this._oChart) {

				this._oChart.attachDeselectData(function(oEvent) {
					aSemanticObjects = that._setSelectionDataPointHandling(oNavHandler);
				});

				this._oChart.attachSelectData(function(oEvent) {
					aSemanticObjects = that._setSelectionDataPointHandling(oNavHandler);
				});
			}

			var iSpacerIdx = this._indexOfSpacerOnToolbar();
			this._oToolbar.insertContent(this._oSemanticalNavButton, iSpacerIdx + 1);
		}
	};

	/**
	 * Sets the handling of selected data points in order to resolve a semantical object when semantic navigation button is pressed
	 * 
	 * @param {sap.ui.comp.navpopover.NavigationPopoverHandler} oNavHandler The navigation handler for the semantical object navigation
	 * @returns {array} The semantic objects for selected data points
	 * @private
	 */
	SmartChart.prototype._setSelectionDataPointHandling = function(oNavHandler) {
		var aSemanticObjects = this._setSelectionDataPoint(oNavHandler);
		if (aSemanticObjects && aSemanticObjects.length > 0) {
			this._oSemanticalNavButton.setEnabled(true);
		} else {
			this._oSemanticalNavButton.setEnabled(false);
		}

		return aSemanticObjects;
	};

	/**
	 * Sets the semantical object context for each selected data point when details button is used
	 * 
	 * @param {object} oEvent The event arguments
	 * @returns {array} The semantic objects for selected data points
	 * @private
	 */
	SmartChart.prototype._setSemanticObjectsContext = function(oEvent) {
		var oDataContext, oData, aSemanticObjects = null;

		// Get binding context
		oDataContext = oEvent.getSource().getBindingContext();
		if (oDataContext) {
			// Get data object from context
			oData = oDataContext.getObject();
			if (oData) {
				// Retrieve semantical objects
				aSemanticObjects = this._determineSemanticObjects(oData, oDataContext);
				if (aSemanticObjects && (aSemanticObjects.length > 0)) {
					// Set context on navHandler
					this._oSemanticNavHandler.setBindingContext(oDataContext);
				}
			}
		}
		return aSemanticObjects;
	};

	/**
	 * Sets the semantical object context for each selected data point when semantical nav button is used
	 * 
	 * @param {sap.ui.comp.navpopover.NavigationPopoverHandler} oNavHandler The navigation handler for the semantical object navigation
	 * @returns {array} The semantic objects for selected data points
	 * @private
	 */
	SmartChart.prototype._setSelectionDataPoint = function(oNavHandler) {
		var oDataContext, oData, aSemanticObjects = null, aDataContext;

		var aSelectedDataPoints = this._oChart.getSelectedDataPoints();

		if (!aSelectedDataPoints || !aSelectedDataPoints.dataPoints || (aSelectedDataPoints.dataPoints.length === 0)) {
			return aSemanticObjects;
		}

		if (aSelectedDataPoints.dataPoints.length === 1) {
			oDataContext = aSelectedDataPoints.dataPoints[0].context;
			if (oDataContext) {
				oData = oDataContext.getObject();

				if (oData) {
					aSemanticObjects = this._determineSemanticObjects(oData, oDataContext);
					if (aSemanticObjects && (aSemanticObjects.length > 0)) {
						oNavHandler.setBindingContext(oDataContext);
					}
				}
			}

			return aSemanticObjects;
		}

		aDataContext = [];
		for (var i = 0; i < aSelectedDataPoints.dataPoints.length; i++) {
			oDataContext = aSelectedDataPoints.dataPoints[i].context;
			if (oDataContext) {
				oData = oDataContext.getObject();

				if (oData) {
					aDataContext.push(oData);
				}
			}
		}

		if (aDataContext && aDataContext.length > 0) {
			aSemanticObjects = this._condensBasedOnSameValue(aDataContext);
			if (aSemanticObjects && aSemanticObjects.length > 0) {
				oNavHandler.setBindingContext(aSelectedDataPoints.dataPoints[aSelectedDataPoints.dataPoints.length - 1].context);
			}
		}

		return aSemanticObjects;
	};

	/**
	 * Condenses data point contexts which are based on same values.
	 * 
	 * @param {array} aData The data contexts of selected data points
	 * @returns {array} The semantic objects for selected data points
	 * @private
	 */
	SmartChart.prototype._condensBasedOnSameValue = function(aData) {

		var aSemObj = null, aResultSemObj, oSemObj, sName;

		// expectation: all datapoint have the same semantical objects
		aSemObj = this._determineSemanticObjects(aData[0]);

		if (aSemObj && aSemObj.length > 0) {
			for (var i = 0; i < aSemObj.length; i++) {
				oSemObj = aSemObj[i];
				sName = oSemObj.name;

				if (this._bAllValuesAreEqual(aData, sName)) {
					if (!aResultSemObj) {
						aResultSemObj = [];
					}

					aResultSemObj.push(oSemObj);
				}
			}

			aSemObj = aResultSemObj;
		}

		return aSemObj;
	};
	/**
	 * Checks if all values of a data point context are equal.
	 * 
	 * @param {array} aData The data contexts of selected data points
	 * @param {string} sFieldName The field name against whose value should be checked
	 * @returns {boolean} True if all values are equals, false otherwise
	 * @private
	 */
	SmartChart.prototype._bAllValuesAreEqual = function(aData, sFieldName) {
		var oData, sValue;
		for (var i = 0; i < aData.length; i++) {
			oData = aData[i];

			if (i === 0) {
				sValue = oData[sFieldName];
				continue;
			}

			if (sValue != oData[sFieldName]) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Creates a semantical object list for selected data points which resolve in more than one semantical object when semantical nav button is used.
	 * 
	 * @param {array} aSemanticObjects The semantical objects for a selected data point
	 * @param {sap.ui.comp.navpopover.NavigationPopoverHandler} oNavHandler The navigation handler for the semantical object navigation
	 * @private
	 */
	SmartChart.prototype._semanticObjectList = function(aSemanticObjects, oNavHandler) {
		jQuery.sap.require("sap.m.List");
		jQuery.sap.require("sap.m.ListType");
		jQuery.sap.require("sap.m.PlacementType");
		jQuery.sap.require("sap.m.StandardListItem");
		jQuery.sap.require("sap.m.ResponsivePopover");

		var oPopover, oList, oListItem, oSemanticObject;

		if (this._oChart) {

			oList = new sap.m.List({
				mode: sap.m.ListMode.SingleSelectMaster,
				selectionChange: function(oEvent) {
					if (oEvent && oEvent.mParameters && oEvent.mParameters.listItem) {
						var oSemanticObjects = oEvent.mParameters.listItem.data("semObj");
						if (oSemanticObjects) {
							oNavHandler.setSemanticObject(oSemanticObjects.defaultSemanticObject);
							oNavHandler.setAdditionalSemanticObjects(oSemanticObjects.additionalSemanticObjects);
							oNavHandler.setSemanticObjectLabel(oEvent.mParameters.listItem.getTitle());

							oNavHandler.openPopover();
						}
					}

					oPopover.close();
				}
			});

			for (var i = 0; i < aSemanticObjects.length; i++) {
				oSemanticObject = aSemanticObjects[i];
				oListItem = new sap.m.StandardListItem({
					title: oSemanticObject.fieldLabel,
					type: sap.m.ListType.Active
				});

				oListItem.data("semObj", MetadataAnalyser.getSemanticObjectsFromProperty(oSemanticObject));
				oList.addItem(oListItem);
			}

			oPopover = new sap.m.ResponsivePopover({
				title: this._oRb.getText("CHART_SEMNAVBTN"),
				showHeader: false,
				contentWidth: "12rem",
				placement: sap.m.PlacementType.Left
			});

			oPopover.addContent(oList);

			oPopover.openBy(this._oSemanticalNavButton);
		}
	};

	/**
	 * Creates a semantical object list for selected data points which resolve in more than one semantical object when details button is used
	 * 
	 * @param {array} aSemanticObjects The semantical objects for a selected data point
	 * @param {sap.ui.comp.navpopover.NavigationPopoverHandler} oNavHandler The navigation handler for the semantical object navigation
	 * @returns {sap.m.List} list containing items for the semantical objects for a selected data point
	 * @private
	 */
	SmartChart.prototype._semanticObjectListForDetails = function(aSemanticObjects, oNavHandler) {
		jQuery.sap.require("sap.m.List");
		jQuery.sap.require("sap.m.ListType");
		jQuery.sap.require("sap.m.PlacementType");
		jQuery.sap.require("sap.m.StandardListItem");
		jQuery.sap.require("sap.m.ResponsivePopover");

		var oList, oListItem, oSemanticObject;
		var that = this;

		if (this._oChart) {

			oList = new sap.m.List({
				mode: sap.m.ListMode.SingleSelectMaster,
				selectionChange: function(oEvent) {
					if (oEvent && oEvent.mParameters && oEvent.mParameters.listItem) {
						var oSemanticObjects = oEvent.mParameters.listItem.data("semObj");
						if (oSemanticObjects) {
							oNavHandler.setSemanticObject(oSemanticObjects.defaultSemanticObject);
							oNavHandler.setAdditionalSemanticObjects(oSemanticObjects.additionalSemanticObjects);
							oNavHandler.setSemanticObjectLabel(oEvent.mParameters.listItem.getTitle());

							that._oSemanticNavHandler._getPopover().then(function(oPopover) {

								// Destroy old objects and set fresh content
								that._oDetailsSemanticPage.destroyContent();

								oPopover.getContent().forEach(function(elem) {
									that._oDetailsSemanticPage.addContent(elem);
								});

								// Navigate to semantic Details Page
								that._oDetailsNavContainer.to(that._oDetailsSemanticPage);
								that._oDetailsPopover.focus(); // set focus again as we lost it somehow onPress

							}, function(oError) {
								window.console.log("NavigationPopover could not be determined");
							});
						}
					}
				}
			});

			for (var i = 0; i < aSemanticObjects.length; i++) {
				oSemanticObject = aSemanticObjects[i];
				oListItem = new sap.m.StandardListItem({
					title: oSemanticObject.fieldLabel,
					type: sap.m.ListType.Navigation
				});

				oListItem.data("semObj", MetadataAnalyser.getSemanticObjectsFromProperty(oSemanticObject));
				oList.addItem(oListItem);
			}

			return oList;
		}
	};

	/**
	 * Determines the semantical object for a given context of a selected data point
	 * 
	 * @param{object} mData data of a selected data point object
	 * @param{object} oDataContext binding context of a selected data point
	 * @returns {array} semantical objects
	 */
	SmartChart.prototype._determineSemanticObjects = function(mData, oDataContext) {
		var n, oField, aSematicObjects = [];
		if (mData) {
			for (n in mData) {
				if (n) {
					oField = this._getField(n);
					if (oField && oField.isDimension && oField.isSemanticObject) {
						aSematicObjects.push(oField);
					}
				}
			}
		}

		if (aSematicObjects) {
			aSematicObjects.sort(function(a, b) {
				return a.fieldLabel.localeCompare(b.fieldLabel);
			});
		}

		return aSematicObjects;
	};
	/**
	 * Checks if semantical nav button is existing
	 * 
	 * @param {boolean} bFlag true to enable the button, otherwise false
	 * @private
	 */
	SmartChart.prototype._checkSemanticNavigationButton = function(bFlag) {

		if (this._oSemanticalNavButton) {
			this._oSemanticalNavButton.setEnabled(bFlag);
		}
	};
	/**
	 * Add the drill-up and drill-down button to the toolbar
	 * 
	 * @private
	 */
	SmartChart.prototype._addDrillUpDownButtons = function() {

		if (this.getShowDrillButtons()) {

			var that = this;

			this._oDrillUpButton = new OverflowToolbarButton(this.getId() + "-btnDrillUp", {
				type: "Transparent",
				tooltip: this._oRb.getText("CHART_DRILLUPBTN_TOOLTIP"),
				text: this._oRb.getText("CHART_DRILLUPBTN_TEXT"),
				icon: "sap-icon://drill-up",
				press: function() {
					if (that._oChart) {
						that._oChart.drillUp();
					}
				},
				visible: !this.getShowDrillBreadcrumbs()
			});

			this._oDrillDownButton = new OverflowToolbarButton(this.getId() + "-btnDrillDown", {
				type: "Transparent",
				tooltip: this._oRb.getText("CHART_DRILLDOWNBTN_TOOLTIP"),
				text: this._oRb.getText("CHART_DRILLDOWNBTN_TEXT"),
				icon: "sap-icon://drill-down",
				press: function(oEvent) {
					that._drillDown(oEvent);
				},
				visible: !this.getShowDetailsButton()

			});
			this._oToolbar.addContent(this._oDrillUpButton);
			this._oToolbar.addContent(this._oDrillDownButton);
		}
	};

	/**
	 * Sets the drill-up button and drill-down button visibility state
	 * 
	 * @param {boolean} bFlag true to display the drill-up and drill-down buttons, false otherwise
	 */
	SmartChart.prototype.setShowDrillButtons = function(bFlag) {

		this.setProperty("showDrillButtons", bFlag);

		if (this._oDrillUpButton) {
			this._oDrillUpButton.setVisible(bFlag);
		}
		if (this._oDrillDownButton) {
			this._oDrillDownButton.setVisible(bFlag);
		}
	};

	/**
	 * Triggers a search in the drill-down popover
	 * 
	 * @param {object} oEvent The event arguments
	 * @param {sap.m.List} oList The list to search in
	 * @private
	 */
	SmartChart.prototype._triggerSearchInPopover = function(oEvent, oList) {

		var parameters, i, sTitle, sTooltip, sValue, aItems;

		if (!oEvent || !oList) {
			return;
		}

		parameters = oEvent.getParameters();
		if (!parameters) {
			return;
		}

		sValue = parameters.newValue ? parameters.newValue.toLowerCase() : "";

		if (this._oChart) {
			aItems = oList.getItems();
			for (i = 0; i < aItems.length; i++) {

				sTooltip = aItems[i].getTooltip();
				sTitle = aItems[i].getTitle();

				if ((sTitle && (sTitle.toLowerCase().indexOf(sValue) > -1)) || (sTooltip && (sTooltip.toLowerCase().indexOf(sValue) > -1))) {
					aItems[i].setVisible(true);
				} else {
					aItems[i].setVisible(false);
				}
			}
		}
	};

	/**
	 * Opens the drill-down popover and shows a list of available dimensions for drilling in.
	 * 
	 * @param {object} oEvent The event arguments
	 * @private
	 */
	SmartChart.prototype._drillDown = function(oEvent) {
		jQuery.sap.require("sap.m.Bar");
		jQuery.sap.require("sap.m.List");
		jQuery.sap.require("sap.m.ListType");
		jQuery.sap.require("sap.m.SearchField");
		jQuery.sap.require("sap.m.PlacementType");
		jQuery.sap.require("sap.m.StandardListItem");
		jQuery.sap.require("sap.m.ResponsivePopover");

		var that = this, oPopover, aIgnoreDimensions, aDimensions, oDimension, oListItem, oList, oSubHeader, oSearchField, i, sTooltip;

		if (this._oChart) {

			oList = new sap.m.List({
				mode: sap.m.ListMode.SingleSelectMaster,
				selectionChange: function(oEvent) {
					if (oEvent && oEvent.mParameters && oEvent.mParameters.listItem) {

						if (oEvent.mParameters.listItem.getType() === sap.m.ListType.Inactive) {
							return;
						}

						var oDimension = oEvent.mParameters.listItem.data("dim");
						if (oDimension) {
							that._oChart.drillDown(oDimension);
						}
					}

					oPopover.close();
				}
			});

			oSubHeader = new sap.m.Bar();
			oSearchField = new sap.m.SearchField({
				placeholder: this._oRb.getText("CHART_DRILLDOWN_SEARCH")
			});
			oSearchField.attachLiveChange(function(oEvent) {
				that._triggerSearchInPopover(oEvent, oList);
			});
			oSubHeader.addContentRight(oSearchField);

			oPopover = new sap.m.ResponsivePopover({
				title: this._oRb.getText("CHART_DRILLDOWN_TITLE"),
				contentWidth: "25rem",
				contentHeight: "20rem",
				placement: sap.m.PlacementType.Bottom,
				subHeader: oSubHeader
			});

			oPopover.addContent(oList);

			aIgnoreDimensions = this._oChart.getVisibleDimensions();
			aDimensions = this._getSortedDimensions();

			if (aDimensions.length < 7) {
				oSubHeader.setVisible(false);
			}

			for (i = 0; i < aDimensions.length; i++) {

				if (aIgnoreDimensions.indexOf(aDimensions[i].getName()) > -1) {
					continue;
				}

				oDimension = aDimensions[i];
				oListItem = new sap.m.StandardListItem({
					title: oDimension.getLabel(),
					type: sap.m.ListType.Active
				});

				oListItem.data("dim", oDimension);

				sTooltip = this._getFieldTooltip(oDimension.name);
				if (sTooltip) {
					oListItem.setTooltip(sTooltip);
				}

				if (aIgnoreDimensions.indexOf(aDimensions[i].getName()) > -1) {
					oListItem.setType(sap.m.ListType.Inactive);
				}

				oList.addItem(oListItem);
			}

			oPopover.openBy(oEvent.getSource());
		}
	};

	/**
	 * Navigates to the drill-down details page within details popover and shows drill-down list with available dimensions for drilling in.
	 * 
	 * @param {object} oEvent The event arguments
	 * @private
	 */
	SmartChart.prototype._navigateToDrillDetailsList = function(oEvent) {
		jQuery.sap.require("sap.m.Bar");
		jQuery.sap.require("sap.m.List");
		jQuery.sap.require("sap.m.ListType");
		jQuery.sap.require("sap.m.SearchField");
		jQuery.sap.require("sap.m.PlacementType");
		jQuery.sap.require("sap.m.StandardListItem");
		jQuery.sap.require("sap.m.ResponsivePopover");

		var that = this, aIgnoreDimensions, aDimensions, oDimension, oListItem, oList, oSubHeader, oSearchField, i, sTooltip;

		if (this._oChart) {

			oList = new sap.m.List({
				mode: sap.m.ListMode.SingleSelectMaster,
				selectionChange: function(oEvent) {
					if (oEvent && oEvent.mParameters && oEvent.mParameters.listItem) {

						if (oEvent.mParameters.listItem.getType() === sap.m.ListType.Inactive) {
							return;
						}

						var oDimension = oEvent.mParameters.listItem.data("dim");
						if (oDimension) {
							that._oChart.drillDown(oDimension);
						}
					}
					that._oDetailsNavContainer.back();
					that._oDetailsPopover.close();
				}
			});

			oSubHeader = new sap.m.Bar();
			oSearchField = new sap.m.SearchField({
				placeholder: this._oRb.getText("CHART_DRILLDOWN_SEARCH")
			});
			oSearchField.attachLiveChange(function(oEvent) {
				that._triggerSearchInPopover(oEvent, oList);
			});
			oSubHeader.addContentRight(oSearchField);

			aIgnoreDimensions = this._oChart.getVisibleDimensions();
			aDimensions = this._getSortedDimensions();

			if (aDimensions.length < 7) {
				oSubHeader.setVisible(false);
			}

			for (i = 0; i < aDimensions.length; i++) {

				if (aIgnoreDimensions.indexOf(aDimensions[i].getName()) > -1) {
					continue;
				}

				oDimension = aDimensions[i];
				oListItem = new sap.m.StandardListItem({
					title: this._oRb.getText("CHART_DRILLDOWNDETAILSLIST_ITEM_TITLE_DIM", [
						oDimension.getLabel()
					]),
					type: sap.m.ListType.Active
				});

				oListItem.data("dim", oDimension);

				sTooltip = this._getFieldTooltip(oDimension.name);
				if (sTooltip) {
					oListItem.setTooltip(sTooltip);
				}

				if (aIgnoreDimensions.indexOf(aDimensions[i].getName()) > -1) {
					oListItem.setType(sap.m.ListType.Inactive);
				}
				oList.addItem(oListItem);
			}

			this._oDetailsDrillInPage.setSubHeader(oSubHeader);
			this._oDetailsDrillInPage.removeAllContent();// Clear the page content before we set the list again.
			this._oDetailsDrillInPage.addContent(oList);
			this._oDetailsNavContainer.to(this._oDetailsDrillInPage, "show");
		}
	};

	/**
	 * Navigates to the semantic object directly or to a list of available semantic objects of one details entry within the details popover
	 * 
	 * @param {object} oEvent The event arguments
	 * @private
	 */
	SmartChart.prototype._navigateToSemanticObjectDetails = function(oEvent) {

		// update semantic objects based on details item press
		var aSemanticObjects = this._setSemanticObjectsContext(oEvent);

		if (aSemanticObjects && (aSemanticObjects.length > 0)) {

			if (aSemanticObjects.length === 1) {
				var oSemanticObjects = MetadataAnalyser.getSemanticObjectsFromProperty(aSemanticObjects[0]);
				if (oSemanticObjects) {
					this._oSemanticNavHandler.setSemanticObject(oSemanticObjects.defaultSemanticObject);
					this._oSemanticNavHandler.setAdditionalSemanticObjects(oSemanticObjects.additionalSemanticObjects);
					this._oSemanticNavHandler.setSemanticObjectLabel(aSemanticObjects[0].fieldLabel);

					this._oSemanticNavHandler._getPopover().then(function(oPopover) {

						// Destroy old objects and set fresh content
						this._oDetailsSemanticPage.destroyContent();

						oPopover.getContent().forEach(function(elem) {
							this._oDetailsSemanticPage.addContent(elem);
						}.bind(this));

						// Navigate to semantic Details Page
						this._oDetailsPopover.focus();
						this._oDetailsNavContainer.to(this._oDetailsSemanticPage);
						// this._oDetailsPopover.focus(); // set focus again as we lost it somehow onPress

					}.bind(this), function(oError) {
						window.console.log("NavigationPopover could not be determined");
					});
				}
			} else {
				// Call this function if we use the details section instead of the button for semantic navigation
				var oList = this._semanticObjectListForDetails(aSemanticObjects, this._oSemanticNavHandler);

				this._oDetailsSemanticPageMulti.destroyContent();
				this._oDetailsSemanticPageMulti.addContent(oList);
				this._oDetailsSemanticPageMulti.setTitle(this._oRb.getText("CHART_SEMNAVBTN"));
				this._oDetailsNavContainer.to(this._oDetailsSemanticPageMulti);
			}
		}
	};

	/**
	 * Initializes the semantical object navigation handling
	 * 
	 * @private
	 */
	SmartChart.prototype._initSemanticNavigationHandling = function() {

		var oSemanticObjectController = this.getSemanticObjectController();
		if (oSemanticObjectController) {
			this._oSemanticNavHandler.setSemanticObjectController(oSemanticObjectController);
		}
	};

	/**
	 * Sets the semantic objects based on the selected data points
	 * 
	 * @private
	 */
	SmartChart.prototype._setSemanticObjects = function() {

		this._aSemanticObjects = this._setSelectionDataPoint(this._oSemanticNavHandler);
	};

	/**
	 * adds the header line to the toolbar
	 * 
	 * @private
	 */
	SmartChart.prototype._addHeaderToToolbar = function() {

		if (this.getHeader() && this._oToolbar) {
			if (!this._headerText) {
				this._headerText = new Text({
				// Only show header when breadcrumbs are disabled
				// visible: !this.getShowDrillBreadcrumbs()
				});
				this._headerText.addStyleClass("sapMH4Style");
				this._headerText.addStyleClass("sapUiCompSmartChartHeader");
			}
			this._refreshHeaderText();
			this._oToolbar.insertContent(this._headerText, 0);
		} else if (this._headerText && this._oToolbar) {
			this._oToolbar.removeContent(this._headerText);
		}
	};

	/**
	 * adds a separator between header and variantmanagement to the toolbar
	 * 
	 * @private
	 */
	SmartChart.prototype._addSeparatorToToolbar = function() {

		if (this.getHeader() && this.getUseVariantManagement() && this._oVariantManagement && !this._oVariantManagement.isPageVariant()) {
			this._oSeparator = new ToolbarSeparator();
			this._oToolbar.insertContent(this._oSeparator, 0);
			// Also set the height to 3rem when no height is explicitly specified
			if (!this._oToolbar.getHeight()) {
				this._oToolbar.setHeight("3rem");
			}
		} else if (this._oSeparator) {
			this._oToolbar.removeContent(this._oSeparator);
		}
	};

	/**
	 * adds the VarientManagement to the toolbar
	 * 
	 * @private
	 */
	SmartChart.prototype._addVariantManagementToToolbar = function() {

		if (this._oVariantManagement && !this._oVariantManagement.isPageVariant()) {

			if (this.getUseVariantManagement()) {
				this._oToolbar.insertContent(this._oVariantManagement, 0);
			} else if (this._oVariantManagement) {
				this._oToolbar.removeContent(this._oVariantManagement);
			}
		}
	};

	/**
	 * adds a spacer to the toolbar
	 * 
	 * @private
	 */
	SmartChart.prototype._addSpacerToToolbar = function() {
		if (this._indexOfSpacerOnToolbar() === -1) {
			this._oToolbar.addContent(new ToolbarSpacer());
		}
	};

	SmartChart.prototype._indexOfSpacerOnToolbar = function() {
		var aItems = this._oToolbar.getContent(), i, iLength;
		if (aItems) {
			iLength = aItems.length;
			i = 0;
			for (i; i < iLength; i++) {
				if (aItems[i] instanceof ToolbarSpacer) {
					return i;
				}
			}
		}

		return -1;
	};

	/**
	 * adds the Personalisation button to the toolbar
	 * 
	 * @private
	 */
	SmartChart.prototype._addPersonalisationToToolbar = function() {
		if (this.getUseChartPersonalisation()) {
			if (!this._oChartPersonalisationButton) {
				this._oChartPersonalisationButton = new OverflowToolbarButton(this.getId() + "-btnPersonalisation", {
					type: "Transparent",
					icon: "sap-icon://action-settings",
					text: this._oRb.getText("CHART_PERSOBTN_TEXT"),
					tooltip: this._oRb.getText("CHART_PERSOBTN_TOOLTIP"),
					press: jQuery.proxy(function(oEvent) {
						this._oPersController.openDialog({
							dimeasure: {
								visible: true,
								payload: {
									availableChartTypes: this._getAvailableChartTypes()
								}
							},
							sort: {
								visible: true
							},
							filter: {
								visible: true
							}
						});
					}, this)
				});
			}
			this._oToolbar.addContent(this._oChartPersonalisationButton);
		} else if (this._oChartPersonalisationButton) {
			this._oToolbar.removeContent(this._oChartPersonalisationButton);
		}
	};

	/**
	 * Adds the chart type button to the toolbar
	 * 
	 * @private
	 */
	SmartChart.prototype._addChartTypeToToolbar = function() {

		// Use a OverflowToolbarButton regarding new UX re-design
		this._oChartTypeButton = this._createChartTypeButton();
		this._oToolbar.addContent(this._oChartTypeButton);
	};

	/**
	 * Creates a OverflowToolbarButton for selecting a specific chart type.
	 * 
	 * @returns {sap.m.SegementedButton} The segmented button for chart type selection
	 * @private
	 */
	SmartChart.prototype._createChartTypeButton = function() {
		// Create a button for selecting chart types
		var oChartTypeButton = new OverflowToolbarButton(this.getId() + "-btnChartType", {

			type: "Transparent",
			layoutData: new sap.m.OverflowToolbarLayoutData({
				priority: sap.m.OverflowToolbarPriority.NeverOverflow
			}),
			press: function(oEvent) {
				this._displayChartTypes(oEvent);
			}.bind(this)
		});

		// Initial enrichment of button
		this._enreachPassedButton(oChartTypeButton, this._oChart.getChartType());

		return oChartTypeButton;
	};

	/**
	 * Displays a popover which shows all available chart types
	 * 
	 * @param {object} oEvent The event arguments
	 * @private
	 */
	SmartChart.prototype._displayChartTypes = function(oEvent) {
		jQuery.sap.require("sap.m.Bar");
		jQuery.sap.require("sap.m.List");
		jQuery.sap.require("sap.m.ListType");
		jQuery.sap.require("sap.ui.core.ListItem");
		jQuery.sap.require("sap.m.SearchField");
		jQuery.sap.require("sap.m.PlacementType");
		jQuery.sap.require("sap.m.StandardListItem");
		jQuery.sap.require("sap.m.ResponsivePopover");

		var that = this, oPopover, oList, oSubHeader, oSearchField, bDoNotUpdate = false;

		if (this._bAvailableChartListIsOpen) {
			return;
		}

		if (this._oChart && oEvent) {
			var oButton = oEvent.getSource();

			var oItemTemplate = new sap.m.StandardListItem({
				title: "{$smartChartTypes>text}",
				icon: "{$smartChartTypes>icon}",
				selected: "{$smartChartTypes>selected}"
			});

			oList = new sap.m.List({
				mode: sap.m.ListMode.SingleSelectMaster,
				items: {
					path: "$smartChartTypes>/items",
					template: oItemTemplate
				},
				selectionChange: function(oEvent) {
					if (oEvent && oEvent.mParameters && oEvent.mParameters.listItem) {
						var oBinding = oEvent.mParameters.listItem.getBinding("title");
						if (oBinding) {
							var oCtx = oBinding.getContext();
							if (oCtx) {
								var oObj = oCtx.getObject();
								if (oObj && oObj.key) {
									// Set the chart type on the inner chart
									that._setChartType(oObj.key);
									// update the chart type buttons icon and tooltip
									that._enreachPassedButton(that._oChartTypeButton, that._oChart.getChartType());
								}
							}
						}
					}
					bDoNotUpdate = true;
					oPopover.close();
				}
			});

			oSubHeader = new sap.m.Bar();
			oSearchField = new sap.m.SearchField({
				placeholder: this._oRb.getText("CHART_TYPE_SEARCH")
			});
			oSearchField.attachLiveChange(function(oEvent) {
				that._triggerSearchInPopover(oEvent, oList);
			});
			oSubHeader.addContentRight(oSearchField);

			oPopover = new sap.m.ResponsivePopover({
				// title: this._oRb.getText("CHART_TYPE_TITLE"),
				placement: sap.m.PlacementType.Bottom,
				subHeader: oSubHeader,
				showHeader: false,// true
				contentWidth: "25rem"
			});

			oPopover.attachAfterClose(function(oEvent) {
				if (!bDoNotUpdate) {
					// that._updateVisibilityOfChartTypes(that._oChartTypeButton);
				}
				that._bAvailableChartListIsOpen = false;
			});

			oPopover.setModel(this.getModel("$smartChartTypes"), "$smartChartTypes");

			oPopover.addContent(oList);

			if (oList.getItems().length < 7) {
				oSubHeader.setVisible(false);
			}

			this._bAvailableChartListIsOpen = true;
			oPopover.openBy(oButton);
		}
	};

	var mMatchingIcon = {
		"bar": "sap-icon://horizontal-bar-chart",
		"bullet": "sap-icon://horizontal-bullet-chart",
		"bubble": "sap-icon://bubble-chart",
		"column": "sap-icon://vertical-bar-chart",
		"combination": "sap-icon://business-objects-experience",
		"dual_bar": "sap-icon://horizontal-bar-chart",
		"dual_column": "sap-icon://vertical-bar-chart",
		"dual_combination": "sap-icon://business-objects-experience",
		"dual_line": "sap-icon://line-chart",
		"dual_stacked_bar": "sap-icon://full-stacked-chart",
		"dual_stacked_column": "sap-icon://vertical-stacked-chart",
		"dual_stacked_combination": "sap-icon://business-objects-experience",
		"donut": "sap-icon://donut-chart",
		"heatmap": "sap-icon://heatmap-chart",
		"horizontal_stacked_combination": "sap-icon://business-objects-experience",
		"line": "sap-icon://line-chart",
		"pie": "sap-icon://pie-chart",
		"scatter": "sap-icon://scatter-chart",
		"stacked_bar": "sap-icon://full-stacked-chart",
		"stacked_column": "sap-icon://vertical-stacked-chart",
		"stacked_combination": "sap-icon://business-objects-experience",
		"treemap": "sap-icon://Chart-Tree-Map", // probably has to change
		"vertical_bullet": "sap-icon://vertical-bullet-chart",
		"100_dual_stacked_bar": "sap-icon://full-stacked-chart",
		"100_dual_stacked_column": "sap-icon://vertical-stacked-chart",
		"100_stacked_bar": "sap-icon://full-stacked-chart",
		"100_stacked_column": "sap-icon://full-stacked-column-chart"
	};

	/**
	 * Returns a matching icon for a specific chart type
	 * 
	 * @param {string} sCharType The chart type
	 * @returns{string} sIcon The icon url
	 * @private
	 */
	SmartChart.prototype._getMatchingIcon = function(sCharType) {
		var sIcon = mMatchingIcon[sCharType];
		if (!sIcon) {
			sIcon = "";
		}

		return sIcon;
	};

	/**
	 * Enriches a passed button with the needed information of the selcted chart type
	 * 
	 * @param {sap.m.OverflowToolbarButton} oButton The button which shall be enriched
	 * @param {string} sKey The key of an available chart type
	 * @param {string} sText The text of an available chart type
	 * @private
	 */
	SmartChart.prototype._enreachPassedButton = function(oButton, sKey, sText) {

		if (!oButton) {
			return;
		}

		if (sText === undefined) {

			sText = sKey;
			var oKey = this._retrieveChartTypeDescription(sKey);
			if (oKey && oKey.text) {
				sText = oKey.text;
			}
		}

		oButton.data("chartType", sKey);

		var sSelectedChartTypeIcon = this._getMatchingIcon(sKey);
		oButton.setIcon(sSelectedChartTypeIcon ? sSelectedChartTypeIcon : "sap-icon://vertical-bar-chart");

		var sTextKey = (this._oChart.getChartType() === sKey) ? "CHART_TYPE_TOOLTIP" : "CHART_TYPE_UNSEL_TOOLTIP";
		oButton.setTooltip(this._oRb.getText(sTextKey, [
			sText
		]));
	};

	/**
	 * Updates the available chart types model
	 * 
	 * @private
	 */
	SmartChart.prototype._updateAvailableChartType = function() {
		var that = this, oModel, mData, aItems = [];

		oModel = this.getModel("$smartChartTypes");
		if (!oModel) {
			return;
		}

		mData = {
			items: aItems
		};

		var sSelectedChartType = this._oChart.getChartType();
// var sSelectedChartTypeDescription = "";
		this._getAvailableChartTypes().forEach(function(chartType) {

			var oItem = {
				key: chartType.key,
				text: chartType.text,
				icon: that._getMatchingIcon(chartType.key),
				selected: sSelectedChartType === chartType.key
			};

			aItems.push(oItem);

// if (oItem.selected) {
// sSelectedChartTypeDescription = oItem.text;
// }
		});

		oModel.setData(mData);

		if (this._oSegmentedButton) {
			this._updateVisibilityOfChartTypes(this._oSegmentedButton);
		}
	};

	/**
	 * creates the personalization controller if not yet done
	 * 
	 * @private
	 */
	SmartChart.prototype._createPersonalizationController = function() {
		if (this._oPersController || !this.getUseChartPersonalisation()) {
			return;
		}

		var oSettings = this.data("p13nDialogSettings");
		if (typeof oSettings === "string") {
			try {
				oSettings = JSON.parse(oSettings);
			} catch (e) {
				oSettings = null;
				// Invalid JSON!
			}
		}

		oSettings = this._setIgnoreFromPersonalisationToSettings(oSettings);

		oSettings = oSettings || {};

		jQuery.sap.require("sap.ui.comp.personalization.Controller");
		var oChartWrapper = PersoUtil.createChartWrapper(this._oChart, this._oChart.data("p13nData"));
		if (this.$() && this.$().closest(".sapUiSizeCompact").length > 0) {
			this._oChart.addStyleClass("sapUiSizeCompact");
		}

		this._oPersController = new sap.ui.comp.personalization.Controller({
			table: oChartWrapper,
			setting: oSettings,
			resetToInitialTableState: !this.getUseVariantManagement(),
			afterP13nModelDataChange: jQuery.proxy(this._personalisationModelDataChange, this)
		});
	};

	/**
	 * adds the ignoreFromPersonalisation fields to the given setting
	 * 
	 * @param {object} oSettings the former settings object
	 * @private
	 * @returns {object} the changed settings object
	 */
	SmartChart.prototype._setIgnoreFromPersonalisationToSettings = function(oSettings) {
		var aIgnoreFields = PersoUtil.createArrayFromString(this.getIgnoreFromPersonalisation());
		if (aIgnoreFields.length) {
			if (!oSettings) {
				oSettings = {};
			}

			var fSetArray = function(sSubName) {
				if (!oSettings[sSubName]) {
					oSettings[sSubName] = {};
				}
				oSettings[sSubName].ignoreColumnKeys = aIgnoreFields;
			};

			fSetArray("dimeasure");
			fSetArray("filter");
			fSetArray("sort");
		}
		return oSettings;
	};

	/**
	 * eventhandler for personalisation changed
	 * 
	 * @param {object} oEvent The event arguments
	 * @private
	 */
	SmartChart.prototype._personalisationModelDataChange = function(oEvent) {
		this._oCurrentVariant = oEvent.getParameter("persistentData");
		var oChangeInfo = oEvent.getParameter("changeType");
		var changeStatus = this._getChangeStatus(oChangeInfo);

		if (changeStatus === sap.ui.comp.personalization.ChangeType.Unchanged) {
			return;
		}

		if (!this._bApplyingVariant) {
			if (!this.getUseVariantManagement()) {
				this._persistPersonalisation();
			} else if (this._oVariantManagement) {
				this._oVariantManagement.currentVariantSetModified(true);
			}
		}

		if (changeStatus === sap.ui.comp.personalization.ChangeType.TableChanged) {
			if (this._oCurrentVariant.dimeasure && this._oCurrentVariant.dimeasure.chartTypeKey) {
				this._updateAvailableChartType();
			}
			if (this._oSemanticalNavButton) {
				this._oSemanticalNavButton.setEnabled(false);
			}
		} else if (changeStatus === sap.ui.comp.personalization.ChangeType.ModelChanged && this._bIsChartBound) {
			// Check if chart was bound already &&:
			// If a SmartFilter is associated with SmartChart - trigger search on the SmartFilter
			if (this._oSmartFilter) {
				this._oSmartFilter.search();
			} else {
				// Rebind Chart only if data was set on it once or no smartFilter is attached!
				this._reBindChart();
			}
		}
		// Reflect changes from the Personalization Controller to the Breadcrumbs control
		if (this._oDrillBreadcrumbs) {
			this._updateDrillBreadcrumbs();
		}
	};

	/**
	 * returns the current filter and sorting options from the table personalisation/variants
	 * 
	 * @private
	 * @param {object} oChangeInfo The change info given by the personalization controller
	 * @returns {sap.ui.comp.personalization.ChangeType} the merged change status
	 */
	SmartChart.prototype._getChangeStatus = function(oChangeInfo) {
		if (!oChangeInfo) {
			// change info not provided return ModelChanged to indicate that we need to update everything internally
			return sap.ui.comp.personalization.ChangeType.ModelChanged;
		}

		if (oChangeInfo.sort === sap.ui.comp.personalization.ChangeType.ModelChanged || oChangeInfo.filter === sap.ui.comp.personalization.ChangeType.ModelChanged || oChangeInfo.dimeasure === sap.ui.comp.personalization.ChangeType.ModelChanged || oChangeInfo.group === sap.ui.comp.personalization.ChangeType.ModelChanged) {
			// model has changed and was not applied to table
			return sap.ui.comp.personalization.ChangeType.ModelChanged;
		}

		if (oChangeInfo.sort === sap.ui.comp.personalization.ChangeType.TableChanged || oChangeInfo.filter === sap.ui.comp.personalization.ChangeType.TableChanged || oChangeInfo.dimeasure === sap.ui.comp.personalization.ChangeType.TableChanged || oChangeInfo.group === sap.ui.comp.personalization.ChangeType.TableChanged) {
			// change was already applied to table
			return sap.ui.comp.personalization.ChangeType.TableChanged;
		}

		return sap.ui.comp.personalization.ChangeType.Unchanged;
	};

	/**
	 * The entity set name in the OData metadata against which the chart must be bound.
	 * 
	 * @param {string} sEntitySetName The entity set
	 * @public
	 */
	SmartChart.prototype.setEntitySet = function(sEntitySetName) {
		this.setProperty("entitySet", sEntitySetName);
		this._initialiseMetadata();
	};

	/**
	 * It could happen that the entity type information is set already in the view, but there is no model attached yet. This method is called once the
	 * model is set on the parent and can be used to initialise the metadata, from the model, and finally create the chart controls.
	 * 
	 * @private
	 */
	SmartChart.prototype.propagateProperties = function() {
		VBox.prototype.propagateProperties.apply(this, arguments);
		this._initialiseMetadata();
	};

	/**
	 * Initialises the OData metadata necessary to create the chart
	 * 
	 * @private
	 */
	SmartChart.prototype._initialiseMetadata = function() {
		if (!this.bIsInitialised) {
			ODataModelUtil.handleModelInit(this, this._onMetadataInitialised);
		}
	};

	/**
	 * Called once the necessary Model metadata is available
	 * 
	 * @private
	 */
	SmartChart.prototype._onMetadataInitialised = function() {
		this._bMetaModelLoadAttached = false;
		if (!this.bIsInitialised) {
			this._createChartProvider();
			if (this._oChartProvider) {
				this._oChartViewMetadata = this._oChartProvider.getChartViewMetadata();
				if (this._oChartViewMetadata) {

					// Indicates the control is initialised and can be used in the initialise event/otherwise!
					this.bIsInitialised = true;
					this._listenToSmartFilter();
					this._createVariantManagementControl(); // creates VariantMngmntCtrl if useVariantManagement OR useChartPersonalisation is true.
					// Control is only added to toolbar if useVariantManagement is set otherwise it acts as
					// hidden persistance helper
					this._assignData();

					this._createContent();

					this._createToolbarContent();

					this._createPersonalizationController();

					this.fireInitialise();
					// Trigger initial binding if no Variant exists -or- if it is already initialised
					if (!this._oVariantManagement || (this._oVariantManagement && this._bVariantInitialised)) {
						this._checkAndTriggerBinding();
					}
				}
			}
		}
	};

	/**
	 * Check if control needs to be bound and trigger binding accordingly.
	 * 
	 * @private
	 */
	SmartChart.prototype._checkAndTriggerBinding = function() {
		if (!this._bAutoBindingTriggered) {
			this._bAutoBindingTriggered = true;
			if (this.getEnableAutoBinding()) {
				if (this._oSmartFilter) {
					this._oSmartFilter.search();
				} else {
					this._reBindChart();
				}
			}
		}
	};

	/**
	 * Creates an instance of the chart provider
	 * 
	 * @private
	 */
	SmartChart.prototype._createChartProvider = function() {
		var oModel, sEntitySetName;
		sEntitySetName = this.getEntitySet();
		oModel = this.getModel();

		// The SmartChart might also needs to work for non ODataModel models; hence we now create the chart independent
		// of ODataModel.
		if (oModel && !this._bChartCreated) {
			this._aAlwaysSelect = [];
			this._createToolbar();
			this._createChart();
			this._bChartCreated = true;
		}
		if (oModel && sEntitySetName) {
			this._oChartProvider = new ChartProvider({
				entitySet: sEntitySetName,
				ignoredFields: this.getIgnoredFields(),
				dateFormatSettings: this.data("dateFormatSettings"),
				currencyFormatSettings: this.data("currencyFormatSettings"),
				defaultDropDownDisplayBehaviour: this.data("defaultDimensionDisplayBehaviour"),
				useSmartField: this.data("useSmartField"),
				skipAnnotationParse: this.data("skipAnnotationParse"),
				chartQualifier: this.data("chartQualifier"),
				presentationVariantQualifier: this.data("presentationVariantQualifier"),
				model: oModel
			});
		}
	};

	/**
	 * Listen to changes on the corresponding SmartFilter (if any)
	 * 
	 * @private
	 */
	SmartChart.prototype._listenToSmartFilter = function() {
		var sSmartFilterId = null;
		// Register for SmartFilter Search
		sSmartFilterId = this.getSmartFilterId();

		this._oSmartFilter = this._findControl(sSmartFilterId);

		if (this._oSmartFilter) {
			this._oSmartFilter.attachSearch(this._reBindChart, this);
			this._oSmartFilter.attachFilterChange(this._filterChangeEvent, this);
			this._oSmartFilter.attachCancel(this._cancelEvent, this);
		}
	};

	SmartChart.prototype._filterChangeEvent = function() {
		if (this._bIsChartBound && this._oSmartFilter && !this._oSmartFilter.getLiveMode()) {
			this._showOverlay(true);
		}
	};

	SmartChart.prototype._cancelEvent = function() {
		if (this._oSmartFilter && !this._oSmartFilter.getLiveMode()) {
			this._showOverlay(false);
		}
	};

	SmartChart.prototype._renderOverlay = function(bShow) {

		if (this._oChart) {

			var $this = this._oChart.$(), $overlay = $this.find(".sapUiCompSmartChartOverlay");
			if (bShow && $overlay.length === 0) {
				$overlay = jQuery("<div>").addClass("sapUiOverlay sapUiCompSmartChartOverlay").css("z-index", "1");
				$this.append($overlay);
			} else if (!bShow) {
				$overlay.remove();
			}
		}
	};

	/**
	 * sets the ShowOverlay property on the inner chart, fires the ShowOverlay event
	 * 
	 * @param {boolean} bShow true to display the overlay, otherwise false
	 * @private
	 */
	SmartChart.prototype._showOverlay = function(bShow) {
		if (bShow) {
			var oOverlay = {
				show: true
			};
			this.fireShowOverlay({
				overlay: oOverlay
			});
			bShow = oOverlay.show;
		}

		this._renderOverlay(bShow);
	};

	/**
	 * searches for a certain control by its ID
	 * 
	 * @param {string} sId the control's ID
	 * @returns {sap.ui.core.Control} The control found by the given Id
	 * @private
	 */
	SmartChart.prototype._findControl = function(sId) {
		var oResultControl, oView;
		if (sId) {
			// Try to get SmartFilter from Id
			oResultControl = sap.ui.getCore().byId(sId);

			// Try to get SmartFilter from parent View!
			if (!oResultControl) {
				oView = this._getView();

				if (oView) {
					oResultControl = oView.byId(sId);
				}
			}
		}

		return oResultControl;
	};

	/**
	 * searches for the controls view
	 * 
	 * @returns {sap.ui.core.mvc.View} The found parental View
	 * @private
	 */
	SmartChart.prototype._getView = function() {
		if (!this._oView) {
			var oObj = this.getParent();
			while (oObj) {
				if (oObj instanceof sap.ui.core.mvc.View) {
					this._oView = oObj;
					break;
				}
				oObj = oObj.getParent();
			}
		}
		return this._oView;
	};

	/**
	 * This can be used to trigger binding on the chart used in the SmartChart
	 * 
	 * @protected
	 */
	SmartChart.prototype.rebindChart = function() {
		this._reBindChart();
	};

	/**
	 * Re-binds the chart
	 * 
	 * @private
	 */
	SmartChart.prototype._reBindChart = function() {
		var sRequestAtLeastFields, aAlwaysSelect, aSelect, mChartPersonalisationData, aSmartFilters, aProcessedFilters = [], aFilters, oExcludeFilters, aSorters, mParameters = {}, mBindingParams = {
			preventChartBind: false
		};

		mChartPersonalisationData = this._getChartPersonalisationData() || {};

		aFilters = mChartPersonalisationData.filters;
		oExcludeFilters = mChartPersonalisationData.excludeFilters;
		aSorters = mChartPersonalisationData.sorters;

		// Get Filters and parameters from SmartFilter
		if (this._oSmartFilter) {
			aSmartFilters = this._oSmartFilter.getFilters();
			mParameters = this._oSmartFilter.getParameters() || {};
		}

		// If filters from SmartFilter exist --> process them first with SmartChart exclude filters
		// since we need to manually AND multiple multi filters!
		if (aSmartFilters && aSmartFilters.length) {
			if (oExcludeFilters) {
				aProcessedFilters = [
					new sap.ui.model.Filter([
						aSmartFilters[0], oExcludeFilters
					], true)
				];
			} else {
				aProcessedFilters = aSmartFilters;
			}
		} else if (oExcludeFilters) {
			aProcessedFilters = [
				oExcludeFilters
			];
		}
		// Combine the resulting processed filters with SmartChart include filters
		if (aFilters) {
			aFilters = aProcessedFilters.concat(aFilters);
		} else {
			aFilters = aProcessedFilters;
		}

		sRequestAtLeastFields = this.getRequestAtLeastFields();
		if (sRequestAtLeastFields) {
			aAlwaysSelect = sRequestAtLeastFields.split(",");
		} else {
			aAlwaysSelect = [];
		}
		aAlwaysSelect = aAlwaysSelect.concat(this._aAlwaysSelect);

		// provide all dimensions set during instantiation or provided by service for inResultDimensions property of chart control
		// remove duplicate entries before we re-set the property
		function arrayUnique(array) {
			var a = array.concat();
			for (var i = 0; i < a.length; ++i) {
				for (var j = i + 1; j < a.length; ++j) {
					if (a[i] === a[j]) {
						a.splice(j--, 1);
					}
				}
			}
			return a;
		}

		// Check if we have visible dimensions and remove them from inResult dimensions
		var aVisibleDim = this._oChart.getVisibleDimensions();
		var aInResultDim = aAlwaysSelect.slice();

		aInResultDim = aInResultDim.filter(function(el) {
			return aVisibleDim.indexOf(el) < 0;
		});
		// Enrich inResultDimensions of inner chart control
		var aChartInResultDimenions = arrayUnique(this._oChart.getInResultDimensions().concat(aInResultDim));

		this._oChart.setInResultDimensions(aChartInResultDimenions);

		// aSelect = this._oChart.getVisibleDimensions().concat(this._oChart.getVisibleMeasures());
		// handle fields that shall always be selected
		if (!aSelect || !aSelect.length) {
			aSelect = aAlwaysSelect;
		} else {
			for (var i = 0; i < aAlwaysSelect.length; i++) {
				if (aSelect.indexOf(aAlwaysSelect[i]) < 0) {
					aSelect.push(aAlwaysSelect[i]);
				}
			}
		}
		if (aSelect && aSelect.length) {
			mParameters["select"] = aSelect.toString();
		}

		// Enable some default parameters
		mParameters["entitySet"] = this.getEntitySet();
		if (!aSorters) {
			aSorters = [];
		}

		mBindingParams.filters = aFilters;
		mBindingParams.sorter = aSorters;
		mBindingParams.parameters = mParameters;

		// fire event to enable user modification of certain binding options (Ex: Filters)
		this.fireBeforeRebindChart({
			bindingParams: mBindingParams
		});

		if (!mBindingParams.preventChartBind) {
			aSorters = mBindingParams.sorter;
			aFilters = mBindingParams.filters;

			this._oChart.setBusy(true);

			this._bDataLoadPending = true;
			this._oChart.bindData({
				path: this.getChartBindingPath() || ("/" + this.getEntitySet()),
				parameters: mParameters,
				filters: aFilters,
				sorter: aSorters,
				events: {
					dataReceived: function(mEventParams) {

						// AnalyticalBinding fires dataReceived too early
						if (mEventParams && mEventParams.getParameter && mEventParams.getParameter("__simulateAsyncAnalyticalBinding")) {
							return;
						}

						this._onDataLoadComplete(mEventParams, true);
						// notify any listeners
						this.fireDataReceived(mEventParams);
					}.bind(this),
					change: this._onDataLoadComplete.bind(this)
				}
			});

			this._showOverlay(false);

			// Flag to indicate if Chart was bound (data fetch triggered) at least once
			this._bIsChartBound = true;
		}
	};

	SmartChart.prototype._onDataLoadComplete = function(mEventParams, bForceUpdate) {

		if (this._oSemanticalNavButton) {
			this._oSemanticalNavButton.setEnabled(false);
		}

		if (this._bDataLoadPending || bForceUpdate) {
			this._bDataLoadPending = false;

			this._updateAvailableChartType();
			this._oChart.setBusy(false);
		}
	};

	SmartChart.prototype._assignData = function() {
		if (this._oChartViewMetadata && this._oChart) {
			if (this._oChartViewMetadata.measureFields && (this._oChartViewMetadata.measureFields.length > 0)) {
				this._oChart.setVisibleMeasures(this._oChartViewMetadata.measureFields);
			}

			if (this._oChartViewMetadata.dimensionFields && (this._oChartViewMetadata.dimensionFields.length > 0)) {
				this._oChart.setVisibleDimensions(this._oChartViewMetadata.dimensionFields);
			}

			if (!this.getChartType() && this._oChartViewMetadata.chartType) {
				this._setChartType(this._oChartViewMetadata.chartType);
			}

			if (this._oChartViewMetadata.semantics === "aggregate") {
				this._oChart.setIsAnalytical(true);
			}
		}
	};

	SmartChart.prototype._createP13nObject = function(oField) {

		return {
			columnKey: oField.name,
			leadingProperty: oField.name, // used to fetch data, by adding this to $select param of OData request
			additionalProperty: oField.additionalProperty, // additional data to fetch in $select
			sortProperty: oField.sortable ? oField.name : undefined,
			filterProperty: oField.filterable ? oField.name : undefined,
			type: oField.filterType,
			maxLength: oField.maxLength,
			precision: oField.precision,
			scale: oField.scale,
			isMeasure: oField.isMeasure,
			isDimension: oField.isDimension,
			aggregationRole: oField.aggregationRole,
			label: oField.fieldLabel,
			tooltip: oField.quickInfo
		};

	};

	/**
	 * Creates the content based on the metadata/configuration
	 * 
	 * @private
	 */
	SmartChart.prototype._createContent = function() {

		jQuery.sap.require("sap.ui.comp.util.FormatUtil");

		var i, iLen = 0, oField, oChartObject, mProperties, aSortFilterableItems = [], oP13nDataObj, that = this;

		iLen = this._oChartViewMetadata.fields.length;
		for (i = 0; i < iLen; i++) {

			oChartObject = null;

			oField = this._oChartViewMetadata.fields[i];

			oP13nDataObj = this._createP13nObject(oField);

			mProperties = {
				name: oField.name,
				label: oField.fieldLabel
			};
			if (oField.inResult) {
				this._aAlwaysSelect.push(oField.name);
			}

			if (oField.isDimension) {
				oChartObject = new Dimension(mProperties);
				this._oChart.addDimension(oChartObject);

				if (oField.description) {
					oChartObject.setTextProperty(oField.description);

					/* eslint-disable no-loop-func */
					oChartObject.setTextFormatter(function(sKey, sText) {
						var sName = this.getIdentity();
						var sDisplayBehaviour = that._getDisplayBehaviour(sName);
						return sap.ui.comp.util.FormatUtil.getFormattedExpressionFromDisplayBehaviour(sDisplayBehaviour, sKey, sText);
					});
					/* eslint-enable no-loop-func */
				}

			} else if (oField.isMeasure) {
				oChartObject = new Measure(mProperties);
				this._oChart.addMeasure(oChartObject);

				if (oField.unit) {
					oChartObject.setUnitBinding(oField.unit);
				}
			} else if (oField.sortable || oField.filterable) {
				aSortFilterableItems.push(oP13nDataObj);
			}

			if (oChartObject) {
				if (oField.role) {
					oChartObject.setRole(oField.role);
				}
				oChartObject.data("p13nData", oP13nDataObj);
			}
		}

		if (this._oChart) {
			this._oChart.data("p13nData", aSortFilterableItems);
		}
	};

	SmartChart.prototype._getDisplayBehaviour = function(sName) {

		var oField = this._getField(sName);
		if (oField) {
			return oField.displayBehaviour;
		}

		return "";
	};

	SmartChart.prototype._getField = function(sName) {
		var oField, i, iLen;

		if (sName && this._oChartViewMetadata && this._oChartViewMetadata.fields) {
			iLen = this._oChartViewMetadata.fields.length;
			for (i = 0; i < iLen; i++) {
				oField = this._oChartViewMetadata.fields[i];
				if (oField.name === sName) {
					return oField;
				}
			}
		}

		return null;
	};
	/**
	 * Creates a Chart based on the configuration, if necessary. This also prepares the methods to be used based on the chart type.
	 * 
	 * @private
	 */
	SmartChart.prototype._createChart = function() {
		var aContent = this.getItems(), iLen = aContent ? aContent.length : 0, oChart;
		// Check if a Chart already exists in the content (Ex: from view.xml)
		while (iLen--) {
			oChart = aContent[iLen];
			if (oChart instanceof Chart) {
				break;
			}
			oChart = null;
		}
		// If a Chart exists use it, else create one!
		if (oChart) {
			this._oChart = oChart;
		} else {
			this._oChart = new Chart({
				uiConfig: {
					applicationSet: 'fiori'
				},
				vizProperties: {
					title: {
						text: ''
					}
				},
				selectionMode: this.getSelectionMode(),
				width: "100%"
			});
			// Override the standard tooltip handling in order to prevent the tooltip from getting visible
			// Only when detail button is activated, normal tooltip otherwise
			// if (this.getShowDetailsButton()) {
			/*
			 * this._oChart.setVizProperties({ interaction: { decorations: [ { name: 'showDetail', fn: this._showDetailTooltip }, { name:
			 * 'hideDetail', fn: this._hideDetailTooltip } ] } });
			 */
			// this._toggleChartTooltipVisibility(false);
			this._toggleChartTooltipVisibility(this.getShowChartTooltip());
			// }
			this.insertItem(this._oChart, 2);
		}

		if (!this._oChart.getLayoutData()) {
			this._oChart.setLayoutData(new sap.m.FlexItemData({
				growFactor: 1,
				baseSize: "0%"
			}));
		}

		this._setChartType(this.getChartType());

		this._createTooltipOrPopover();
	};

	SmartChart.prototype._toggleChartTooltipVisibility = function(bFlag) {
		var oInteraction = {
			interaction: {
				decorations: []
			}
		};
		// If we want to hide the tooltip we have to overwrite the standard viz decoration for it
		if (!bFlag) {

			var oShowDetail = {
				name: 'showDetail',
				fn: this._showDetailTooltip
			};

			var oHideDetail = {
				name: 'hideDetail',
				fn: this._hideDetailTooltip
			};
			oInteraction.interaction.decorations.push(oShowDetail);
			oInteraction.interaction.decorations.push(oHideDetail);
		}
		if (this._oChart) {
			this._oChart.setVizProperties(oInteraction);
		}
	};

	/**
	 * Handles the details information of a hovered datapoint on mouseover
	 * 
	 * @param {object} oDetails The tooltip params
	 * @private
	 */
	SmartChart.prototype._showDetailTooltip = function(oDetails) {
		// currently we don't need the tooltip information
	};
	/**
	 * Handles the details information of a hovered datapoint
	 * 
	 * @param {object} oDetails The tooltip params
	 * @private
	 */
	SmartChart.prototype._hideDetailTooltip = function(oDetails) {
		// currently we don't need the tooltip information
	};

	/**
	 * Returns the chart object used internally.
	 * 
	 * @public
	 * @returns {object} The chart
	 */
	SmartChart.prototype.getChart = function() {
		return this._oChart;
	};

	SmartChart.prototype._getChartTypes = function() {
		var mChartTypes;
		try {
			mChartTypes = sap.chart.api.getChartTypes(); // Chart.getChartTypes();
		} catch (ex) {
			mChartTypes = {};
			jQuery.sap.log.error("sap.chart.api..getChartTypes throws an exception.\n" + ex.toString());
		}

		return mChartTypes;
	};

	SmartChart.prototype._getAvailableChartTypes = function() {
		var i, sKey, aAvailableChartTypes = [], aChartTypes, mChartTypes = {}, aIgnoredChartTypes;

		if (this._oChart) {

			aIgnoredChartTypes = PersoUtil.createArrayFromString(this.getIgnoredChartTypes());

			mChartTypes = this._getChartTypes();
			aChartTypes = this._oChart.getAvailableChartTypes().available;
			if (aChartTypes) {
				for (i = 0; i < aChartTypes.length; i++) {
					sKey = aChartTypes[i].chart;
					if (aIgnoredChartTypes.indexOf(sKey) < 0) {
						aAvailableChartTypes.push({
							key: sKey,
							text: mChartTypes[sKey]
						});
					}
				}
			}
		}

		return aAvailableChartTypes;
	};

	SmartChart.prototype._getAllChartTypes = function() {
		var sKey, aAllChartTypes = [], mChartTypes, aIgnoredChartTypes;

		aIgnoredChartTypes = PersoUtil.createArrayFromString(this.getIgnoredChartTypes());

		mChartTypes = this._getChartTypes();

		for (sKey in mChartTypes) {
			if (sKey) {
				if (aIgnoredChartTypes.indexOf(sKey) < 0) {
					aAllChartTypes.push({
						key: sKey,
						text: mChartTypes[sKey]
					});
				}
			}
		}

		return aAllChartTypes;
	};

	SmartChart.prototype._retrieveChartTypeDescription = function(sCharType) {
		var mChartTypes = this._getChartTypes();
		return ({
			key: sCharType,
			text: mChartTypes[sCharType]
		});
	};

	SmartChart.prototype._setChartType = function(sChartType) {

		if (this._oChart) {
			this._oChart.setChartType(sChartType);
		}
	};

	SmartChart.prototype._getDimensions = function() {
		var aDimensions = [];

		if (this._oChart) {
			aDimensions = this._oChart.getDimensions();
		}

		return aDimensions;
	};

	SmartChart.prototype._getVisibleDimensions = function() {
		var aVisibleDimensions = [];

		if (this._oChart) {
			aVisibleDimensions = this._oChart.getVisibleDimensions();
		}

		return aVisibleDimensions;
	};

	SmartChart.prototype._getMeasures = function() {
		var aMeasures = [];

		if (this._oChart) {
			aMeasures = this._oChart.getMeasures();
		}

		return aMeasures;
	};

	SmartChart.prototype._getVisibleMeasures = function() {
		var aVisibleMeasures = [];

		if (this._oChart) {
			aVisibleMeasures = this._oChart.getVisibleMeasures();
		}

		return aVisibleMeasures;
	};

	SmartChart.prototype._getSortedDimensions = function() {
		var aDimensions = [];
		if (this._oChart) {
			aDimensions = this._oChart.getDimensions();
			if (aDimensions) {
				aDimensions.sort(function(a, b) {
					if (a.getLabel() && b.getLabel()) {
						return a.getLabel().localeCompare(b.getLabel());
					}
					// return a.getLabel().localeCompare(b.getLabel());
				});
			}
		}

		return aDimensions;
	};

	/**
	 * Interface function for the SmartVariantManagement control that returns the currently used variant data.
	 * 
	 * @public
	 * @returns {json} The currently used variant
	 */
	SmartChart.prototype.fetchVariant = function() {
		if (this._oCurrentVariant === "STANDARD" || this._oCurrentVariant === null) {
			return {};
		}

		return this._oCurrentVariant;
	};

	/**
	 * Interface function for SmartVariantManagement control that applies the current variant.
	 * 
	 * @param {Object} oVariantJSON The variant JSON
	 * @param {string} sContext Describes the context in which the variant has been applied
	 * @public
	 */
	SmartChart.prototype.applyVariant = function(oVariantJSON, sContext) {
		this._oCurrentVariant = oVariantJSON;
		if (this._oCurrentVariant === "STANDARD") {
			this._oCurrentVariant = null;
		}

		// Context STANDARD here specifies that this is a custom application variant for Globalisation/Industry!
		// This would be called just once in the beginning!
		if (sContext === "STANDARD") {
			this._oApplicationDefaultVariant = this._oCurrentVariant;
		}
		// if an application default variant exists --> extend all the other variants based on this!
		// Changes to the industry should be taken over --> but first we only take over non conflicting changes
		// if the user already has some changes --> just use those
		if (this._oApplicationDefaultVariant && !sContext) {
			this._oCurrentVariant = jQuery.extend(true, {}, this._oApplicationDefaultVariant, oVariantJSON);
		}

		// Set instance flag to indicate that we are currently in the process of applying the changes
		this._bApplyingVariant = true;

		if (this._oPersController) {
			if (this._oCurrentVariant === null || jQuery.isEmptyObject(this._oCurrentVariant)) {
				this._oPersController.resetPersonalization(sap.ui.comp.personalization.ResetType.ResetFull);
			} else {
				this._oPersController.setPersonalizationData(this._oCurrentVariant);
			}
		}

		// Clear apply variant flag!
		this._bApplyingVariant = false;

		this.fireAfterVariantApply({
			currentVariantId: this.getCurrentVariantId()
		});
	};

	/**
	 * Interface function for SmartVariantManagment control. It indicates, that the variant management is fully initialized.
	 * 
	 * @internal
	 */
	SmartChart.prototype.variantsInitialized = function() {
		this._bVariantInitialised = true;
		this._checkAndTriggerBinding();
	};

	SmartChart.prototype._getFieldTooltip = function(sKey) {
		var oField = this._getFieldByKey(sKey);
		if (oField) {
			return oField.quickInfo;
		}

		return "";
	};
	SmartChart.prototype._getFieldByKey = function(sKey) {

		var i, oField = null;

		if (this._oChartViewMetadata && this._oChartViewMetadata.fields) {
			for (i = 0; i < this._oChartViewMetadata.fields.length; i++) {

				oField = this._oChartViewMetadata.fields[i];
				if (sKey === oField.name) {
					return oField;
				}
			}

			return null;
		}
	};

	/**
	 * Returns the column for the given column key
	 * 
	 * @param {array} aArray list of chart objects
	 * @param {string} sKey - the column key for the required column
	 * @returns {object} The found column or null
	 * @private
	 */
	SmartChart.prototype._getByKey = function(aArray, sKey) {
		var i, iLength, oCharObj, oCustomData;

		if (aArray) {
			iLength = aArray.length;
			for (i = 0; i < iLength; i++) {
				oCharObj = aArray[i];
				oCustomData = oCharObj.data("p13nData");
				if (oCustomData && oCustomData.columnKey === sKey) {
					return oCharObj;
				}
			}
		}

		return null;
	};

	SmartChart.prototype._getDimensionByKey = function(sKey) {
		if (this._oChart) {
			return this._getByKey(this._oChart.getDimensions(), sKey);
		}

		return null;
	};

	SmartChart.prototype._getMeasureByKey = function(sKey) {
		if (this._oChart) {
			return this._getByKey(this._oChart.getMeasures(), sKey);
		}

		return null;
	};

	SmartChart.prototype._getChartObjByKey = function(sKey) {
		var oChartObj = this._getDimensionByKey(sKey);
		if (!oChartObj) {
			oChartObj = this._getMeasureByKey(sKey);
		}

		return oChartObj;
	};

	/**
	 * Retrieves the path for the specified property and column key from the array of table columns
	 * 
	 * @param {string} sColumnKey - the column key specified on the table
	 * @param {string} sProperty - the property path that needs to be retrieved from the column
	 * @returns {string} The path that can be used by sorters, filters etc.
	 * @private
	 */
	SmartChart.prototype._getPathFromColumnKeyAndProperty = function(sColumnKey, sProperty) {
		var sPath = null, oChartObj, oCustomData;
		oChartObj = this._getChartObjByKey(sColumnKey);

		// Retrieve path from the property
		if (oChartObj) {
			oCustomData = oChartObj.data("p13nData");
			if (oCustomData) {
				sPath = oCustomData[sProperty];
			}
		}

		return sPath;
	};

	/**
	 * returns the current filter and sorting options from the table personalisation/variants
	 * 
	 * @private
	 * @returns {object} current variant's filter and sorting options
	 */
	SmartChart.prototype._getChartPersonalisationData = function() {
		if (!this._oCurrentVariant) {
			return null;
		}
		var aSorters = [], aFilters = [], aExcludeFilters = [], oExcludeFilters, aSortData, sPath;

		// Sort handling
		if (this._oCurrentVariant.sort) {
			aSortData = this._oCurrentVariant.sort.sortItems;
		} else {
			aSortData = this._aInitialSorters;
		}

		if (aSortData) {
			aSortData.forEach(function(oModelItem) {
				var bDescending = oModelItem.operation === "Descending"; // sap.m.P13nConditionOperation.Descending;
				sPath = oModelItem.columnKey; // this._getPathFromColumnKeyAndProperty(oModelItem.columnKey, "sortProperty");
				aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));

			}, this);
		}

		// Filter Handling
		if (this._oCurrentVariant.filter) {
			this._oCurrentVariant.filter.filterItems.forEach(function(oModelItem) {
				var oValue1 = oModelItem.value1, oValue2 = oModelItem.value2;
				// Filter path has be re-calculated below
				sPath = oModelItem.columnKey; // this._getPathFromColumnKeyAndProperty(oModelItem.columnKey, "filterProperty");

				if (oValue1 instanceof Date && this._oChartProvider && this._oChartProvider.getIsUTCDateHandlingEnabled()) {
					oValue1 = FilterProvider.getDateInUTCOffset(oValue1);
					oValue2 = oValue2 ? FilterProvider.getDateInUTCOffset(oValue2) : oValue2;
				}
				if (oModelItem.exclude) {
					aExcludeFilters.push(new Filter(sPath, FilterOperator.NE, oValue1));
				} else {
					aFilters.push(new Filter(sPath, oModelItem.operation, oValue1, oValue2));
				}
			}, this);

			if (aExcludeFilters.length) {
				oExcludeFilters = new Filter(aExcludeFilters, true);
			}
		}

		return {
			filters: aFilters,
			excludeFilters: oExcludeFilters,
			sorters: aSorters
		};
	};

	/**
	 * triggers (hidden) VariantManagementControl to persist personalisation this function is called in case no VariantManagementControl is used
	 * 
	 * @private
	 */
	SmartChart.prototype._persistPersonalisation = function() {
		var that = this;
		if (this._oVariantManagement && !this._oVariantManagement.isPageVariant()) {
			this._oVariantManagement.getVariantsInfo(function(aVariants) {
				var sPersonalisationVariantKey = null;
				if (aVariants && aVariants.length > 0) {
					sPersonalisationVariantKey = aVariants[0].key;
				}

				var bOverwrite = sPersonalisationVariantKey !== null;

				var oParams = {
					name: "Personalisation",
					global: false,
					overwrite: bOverwrite,
					key: sPersonalisationVariantKey,
					def: true
				};
				that._oVariantManagement.fireSave(oParams);
			});
		}
	};

	/**
	 * Returns the ID of the currently selected variant.
	 * 
	 * @public
	 * @returns {string} ID of the currently selected variant
	 */
	SmartChart.prototype.getCurrentVariantId = function() {
		var sKey = "";

		if (this._oVariantManagement) {
			sKey = this._oVariantManagement.getCurrentVariantId();
		}

		return sKey;
	};

	/**
	 * Applies the current variant based on the sVariantId parameter. If an empty string or null or undefined have been passed, the standard variant
	 * will be used. The standard variant will also be used if the passed sVariantId cannot be found. If the flexibility variant, the content for the
	 * standard variant, or the personalizable control cannot be obtained, no changes will be made.
	 * 
	 * @public
	 * @param {string} sVariantId ID of the currently selected variant
	 */
	SmartChart.prototype.setCurrentVariantId = function(sVariantId) {
		if (this._oVariantManagement && !this._oVariantManagement.isPageVariant()) {
			this._oVariantManagement.setCurrentVariantId(sVariantId);
		} else {
			jQuery.sap.log.error("sap.ui.comp.smartchart.SmartChart.prototype.setCurrentVariantId: VariantManagement does not exist or is a page variant");
		}
	};

	SmartChart.prototype._adjustHeight = function() {

		if (this._oChart) {
			var iToolbarHeight = 0;
			// Only save height when not in full-screen mode
			if (!this.bFullScreen) {
				this._iHeight = this.getDomRef().offsetHeight;
			}

			if (this._iHeight === 0) {
				return;
			}

			if (this._oToolbar && this._oToolbar.getDomRef()) {
				iToolbarHeight = this._oToolbar.getDomRef().offsetHeight;
			}

			// CORRECTION VALUE FOR CHART
			var iCorrection = 0;
// if (Device.system.desktop) {
// iCorrection = this.bFullScreen ? 0 : 30;
// }
			this._oChart.setHeight((this._iHeight - iToolbarHeight - iCorrection) + "px");
		}
	};

	SmartChart.prototype._toggleFullScreen = function(bValue, bForced) {
		if (!this.oFullScreenButton || (bValue === this.bFullScreen && !bForced)) {
			return;
		}
		this.bFullScreen = bValue;
		if (!this._oFullScreenUtil) {
			this._oFullScreenUtil = sap.ui.requireSync("sap/ui/comp/util/FullScreenUtil");
		}
		this._oFullScreenUtil.toggleFullScreen(this, this.bFullScreen, this.oFullScreenButton);

		this.oFullScreenButton.setTooltip(this.bFullScreen ? this._oRb.getText("CHART_MINIMIZEBTN_TOOLTIP") : this._oRb.getText("CHART_MAXIMIZEBTN_TOOLTIP"));
		this.oFullScreenButton.setText(this.bFullScreen ? this._oRb.getText("CHART_MINIMIZEBTN_TEXT") : this._oRb.getText("CHART_MAXIMIZEBTN_TEXT"));
		this.oFullScreenButton.setIcon(this.bFullScreen ? "sap-icon://exit-full-screen" : "sap-icon://full-screen");
	};

	/**
	 * Checks whether the control is initialised
	 * 
	 * @returns {boolean} returns whether control is already initialised
	 * @protected
	 */
	SmartChart.prototype.isInitialised = function() {
		return !!this.bIsInitialised;
	};

	/**
	 * Cleans up the control.
	 * 
	 * @protected
	 */
	SmartChart.prototype.exit = function() {

		this._oRb = null;

		if (this._oSmartFilter) {
			this._oSmartFilter.detachSearch(this._reBindChart, this);
			this._oSmartFilter.detachFilterChange(this._filterChangeEvent, this);
			this._oSmartFilter.detachCancel(this._cancelEvent, this);
		}

		if (this._oChartProvider && this._oChartProvider.destroy) {
			this._oChartProvider.destroy();
		}
		this._oChartProvider = null;

		if (this._oPersController && this._oPersController.destroy) {
			this._oPersController.destroy();
		}

		if (this._oSegmentedButton) {
			this._oSegmentedButton.removeAllButtons();
			this._oButtonChart1.destroy();
			this._oButtonChart2.destroy();
			this._oButtonChart3.destroy();
			this._oButtonChart4.destroy();
			this._oButtonChart5.destroy();

			this._oButtonChart1 = null;
			this._oButtonChart2 = null;
			this._oButtonChart3 = null;
			this._oButtonChart4 = null;
			this._oButtonChart5 = null;
		}

		this._oPersController = null;
		if (this._oVariantManagement) {

			this._oVariantManagement.detachSave(this._variantSaved, this);
			this._oVariantManagement.detachAfterSave(this._variantAfterSave, this);

			if (!this._oVariantManagement.isPageVariant() && this._oVariantManagement.destroy) {
				this._oVariantManagement.destroy();
			}
		}
		this._oVariantManagement = null;

		this._destroyPopover();

		if (this._oFullScreenUtil) {
			this._oFullScreenUtil.cleanUpFullScreen(this);
			this._oFullScreenUtil = null;
		}
		
		if (this._oDetailsPopover) {
			this._oDetailsPopover.destroy();
			// This is not part of the popover until we have several semantic objects resolved for
			// a selected data point
			if (this._oRelatedAppsMasterList) {
				this._oRelatedAppsMasterList.destroy();
			}
		}

		if (Device.system.desktop && this.sResizeListenerId) {
			sap.ui.core.ResizeHandler.deregister(this.sResizeListenerId);
			this.sResizeListenerId = null;
		} else {
			Device.orientation.detachHandler(this._adjustHeight, this);
			Device.resize.detachHandler(this._adjustHeight, this);
		}

		this._oCurrentVariant = null;
		this._oApplicationDefaultVariant = null;
		this._oChartViewMetadata = null;
		this._aAlwaysSelect = null;
		this._oSmartFilter = null;
		this._oToolbar = null;
		this._oChartPersonalisationButton = null;
		this._oView = null;
		this._oChart = null;
	};

	return SmartChart;

}, /* bExport= */true);
