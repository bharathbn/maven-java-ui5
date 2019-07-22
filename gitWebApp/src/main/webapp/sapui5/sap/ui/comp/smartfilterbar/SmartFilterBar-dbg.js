/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.smartfilterbar.SmartFilterBar.
sap.ui.define([
	'jquery.sap.global', 'sap/m/MessageBox', 'sap/ui/comp/filterbar/FilterBar', 'sap/ui/comp/filterbar/FilterGroupItem', 'sap/ui/comp/filterbar/FilterItem', 'sap/ui/comp/library', './AdditionalConfigurationHelper', './ControlConfiguration', './FilterProvider', './GroupConfiguration', 'sap/ui/comp/smartvariants/PersonalizableInfo', 'sap/ui/comp/smartvariants/SmartVariantManagement', 'sap/ui/comp/odata/ODataModelUtil'
], function(jQuery, MessageBox, FilterBar, FilterGroupItem, FilterItem, library, AdditionalConfigurationHelper, ControlConfiguration, FilterProvider, GroupConfiguration, PersonalizableInfo, SmartVariantManagement, ODataModelUtil) {
	"use strict";

	/**
	 * Constructor for a new smartfilterbar/SmartFilterBar.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The SmartFilterBar control uses the OData metadata of an entity in order to create a filter bar.<br>
	 *        Whether a field is visible on the filter bar, supports type-ahead and value help, for example, is automatically determined. When you use
	 *        control configurations and group configurations it is possible to configure the filter bar and adapt it according to your needs.<br>
	 *        <b><i>Note:</i></b><br>
	 *        Most of the attributes/properties are not dynamic and cannot be changed once the control has been initialized.
	 * @extends sap.ui.comp.filterbar.FilterBar
	 * @author Pavan Nayak, Thomas Biesemann
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartfilterbar.SmartFilterBar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SmartFilterBar = FilterBar.extend("sap.ui.comp.smartfilterbar.SmartFilterBar", /** @lends sap.ui.comp.smartfilterbar.SmartFilterBar.prototype */
	{
		metadata: {

			library: "sap.ui.comp",
			designTime: true,
			properties: {

				/**
				 * The OData entity type whose metadata is used to create the SmartFilterBar. Note: Changing this value after the SmartFilterBar is
				 * initialized (initialise event was fired) has no effect.
				 * 
				 * @deprecated Since 1.40. Use entitySet property instead of this one, to enable V4 annotation support
				 */
				entityType: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * The OData entity set whose metadata is used to create the SmartFilterBar. Note: Changing this value after the SmartFilterBar is
				 * initialized (initialise event was fired) has no effect.
				 */
				entitySet: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Optional. The OData service URL. If it is not specified, the service URL from the OData model (this.getModel()) will be used. Note:
				 * Changing this value after the SmartFilterBar is initialized (initialise event was fired) has no effect.
				 * 
				 * @deprecated Since 1.29. Set an ODataModel as the main model on your control/view instead
				 */
				resourceUri: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Name of the field that is the focus of the basic search.
				 */
				basicSearchFieldName: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Enables the basic search field. The entered value can be accessed with
				 * {@link sap.ui.comp.smartfilterbar.SmartFilterBar#getParameters}. <b>Note:</b> When the SmartFilterBar control is used with a
				 * {@link sap.ui.comp.smarttable.SmartTable} control the parameters are handled automatically. Therefore, this must only be enabled
				 * for OData service entities that support basic search.
				 */
				enableBasicSearch: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * If set the search will be automatically triggered, when a filter value was set via the <B>change</B> event.
				 * 
				 * @since 1.40
				 */
				liveMode: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * If set to <code>false</code> eventual errors during the search, will not be displayed in a messagebox
				 * 
				 * @since 1.40
				 */
				showMessages: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Indicates if the analytical parameters (SelectionVariant) must be taken into consideration.
				 * 
				 * @experimental since 1.42.0 This property is NOT stable yet. Use at your own risk.
				 * @since 1.42.0
				 */
				considerAnalyticalParameters: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}

			},

			associations: {
				/**
				 * Identifies the SmartVariant control which should be used for the personalization.
				 * 
				 * @since 1.38
				 */
				smartVariant: {
					type: "sap.ui.comp.smartvariants.SmartVariantManagement",
					multiple: false
				}
			},

			aggregations: {

				/**
				 * Using control configurations you can add additional configuration to filter fields, for example set custom labels, change the order
				 * of fields, or change the filter field control type. Note: Changing the values here after the SmartFilter is initialized (initialise
				 * event was fired) has no effect.
				 */
				controlConfiguration: {
					type: "sap.ui.comp.smartfilterbar.ControlConfiguration",
					multiple: true,
					singularName: "controlConfiguration"
				},

				/**
				 * Provides the possibility to add additional configuration to groups. Groups are used to show fields in the advanced area of the
				 * SmartFilterBar. With additional configuration, you can for example set custom labels or change the order of groups. Note: Changing
				 * the values here after the SmartFilter is initialized (initialise event was fired) has no effect.
				 */
				groupConfiguration: {
					type: "sap.ui.comp.smartfilterbar.GroupConfiguration",
					multiple: true,
					singularName: "groupConfiguration"
				}
			},

			events: {

				/**
				 * This event is fired after the pending state of the FilterBar control changes.
				 * 
				 * @since 1.36
				 */
				pendingChange: {
					/**
					 * The current pending value.
					 */
					pendingValue: {
						type: "boolean"
					}
				}
			}
		},

		renderer: function(oRm, oControl) {
			FilterBar.getMetadata().getRenderer().render(oRm, oControl);
		}

	});

	SmartFilterBar.LIVE_MODE_INTERVAL = 300;

	/**
	 * Retrieves the currently visible filters and the values for storing them as variants. The result will be passed on as a JSON object to the
	 * callee smart variant control.
	 * 
	 * @name sap.ui.comp.smartfilterbar.SmartFilterBar#fetchVariant
	 * @function
	 * @type object
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * Applies the current variant as opposed to fetchVariant. The variant is retrieved via the flex layer.
	 * 
	 * @name sap.ui.comp.smartfilterbar.SmartFilterBar#applyVariant
	 * @function
	 * @param {object} oVariant The variant that must be applied. oVariant must contain a valid JSON object.
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * Init
	 * 
	 * @private
	 */
	SmartFilterBar.prototype.init = function() {
		this._aFilterBarViewMetadata = null;
		this.isRunningInValueHelpDialog = false;
		FilterBar.prototype.init.apply(this); // Call base class

		sap.ui.getCore().getMessageManager().registerObject(this, true);
	};

	/**
	 * Initialises the OData metadata necessary to create the filter bar
	 * 
	 * @private
	 */
	SmartFilterBar.prototype._initializeMetadata = function() {
		if (!this.bIsInitialised) {
			ODataModelUtil.handleModelInit(this, this._onMetadataInitialised);
		}
	};

	/**
	 * Called once the necessary Model metadata is available
	 * 
	 * @private
	 */
	SmartFilterBar.prototype._onMetadataInitialised = function() {
		this._bMetaModelLoadAttached = false;
		if (!this.bIsInitialised) {
			this._createFilterProvider();
			if (this._oFilterProvider) {
				this._aFilterBarViewMetadata = this._oFilterProvider.getFilterBarViewMetadata();
				if (this._aFilterBarViewMetadata) {
					this._attachAdditionalConfigurationChanged();
					// Indicates the control is initialised and can be used in the initialise event/otherwise!
					this.bIsInitialised = true;
					this.setModel(this._oFilterProvider.oModel, this._oFilterProvider.sFilterModelName);

					// required for the new UI-Design
					this.registerGetFiltersWithValues(jQuery.proxy(this.getFiltersWithValues, this));

					// Variant Handling - Registrations
					this.registerFetchData(jQuery.proxy(this.getFilterDataAsString, this, true));
					this.registerApplyData(jQuery.proxy(function(sJson) {
						this.setFilterDataAsString(sJson, true);
					}, this));

					this._initializeVariantManagement();
				}
			}
		}
	};

	/**
	 * Get the filterable fields.
	 * 
	 * @returns {Array} array of filter view metadata containing filter fields
	 * @internal
	 */
	SmartFilterBar.prototype.getFilterBarViewMetadata = function() {
		return this._aFilterBarViewMetadata;
	};

	/**
	 * Get the analytical parameters
	 * 
	 * @returns {Array} array of analytical parameter metadata
	 * @internal
	 */
	SmartFilterBar.prototype.getAnalyticalParameters = function() {
		return this._oFilterProvider ? this._oFilterProvider.getAnalyticParameters() : [];
	};

	/**
	 * Creates an instance of the filter provider
	 * 
	 * @private
	 */
	SmartFilterBar.prototype._createFilterProvider = function() {
		var sResourceUri, oModel, sEntityTypeName, sEntitySet;
		oModel = this.getModel();
		sResourceUri = this.getResourceUri();
		sEntityTypeName = this.getEntityType();
		sEntitySet = this.getEntitySet();

		if ((oModel || sResourceUri) && (sEntityTypeName || sEntitySet)) {
			this._oFilterProvider = new sap.ui.comp.smartfilterbar.FilterProvider({
				basicSearchFieldName: this.getBasicSearchFieldName(),
				enableBasicSearch: this.getEnableBasicSearch(),
				entityType: sEntityTypeName,
				entitySet: sEntitySet,
				serviceUrl: sResourceUri,
				isRunningInValueHelpDialog: this.isRunningInValueHelpDialog,
				model: oModel,
				additionalConfiguration: this.getAdditionalConfiguration(),
				defaultDropDownDisplayBehaviour: this.data("defaultDropDownDisplayBehaviour"),
				defaultTokenDisplayBehaviour: this.data("defaultTokenDisplayBehaviour"),
				dateFormatSettings: this.data("dateFormatSettings"),
				useContainsAsDefaultFilter: this.data("useContainsAsDefaultFilter"),
				smartFilter: this,
				considerAnalyticalParameters: this.getConsiderAnalyticalParameters()
			});

			this._oFilterProvider.attachPendingChange(function(oEvent) {
				this.firePendingChange({
					pendingValue: oEvent.getParameter("pending")
				});
			}.bind(this));
		}
	};

	/**
	 * Attaches to events from the control configuration. For example the visiblity of a filter field can be changed dynamically
	 * 
	 * @private
	 */
	SmartFilterBar.prototype._attachAdditionalConfigurationChanged = function() {
		var aControlConfiguration, aGroupConfiguration, i, length;

		// Group Configuration
		aGroupConfiguration = this.getGroupConfiguration();
		length = aGroupConfiguration.length;
		for (i = 0; i < length; i++) {
			aGroupConfiguration[i].attachChange(this._handleGroupConfigurationChanged.bind(this));
		}

		// Control Configuration
		aControlConfiguration = this.getControlConfiguration();
		length = aControlConfiguration.length;
		for (i = 0; i < length; i++) {
			aControlConfiguration[i].attachChange(this._handleControlConfigurationChanged.bind(this));
		}
	};

	/**
	 * Event Handler for changed events from control configuration
	 * 
	 * @private
	 * @param {Object} oEvent - then event object
	 */
	SmartFilterBar.prototype._handleControlConfigurationChanged = function(oEvent) {
		var sPropertyName, oControlConfiguration, oFilterItem, sKey, sValue;

		sPropertyName = oEvent.getParameter("propertyName");
		oControlConfiguration = oEvent.oSource;

		if (!oControlConfiguration) {
			return;
		}

		sKey = oControlConfiguration.getKey();
		oFilterItem = this._getFilterItemByName(sKey);
		if (!oFilterItem) {
			return;
		}

		if (sPropertyName === "visible") {
			sValue = oControlConfiguration.getVisible();
			oFilterItem.setVisible(sValue);
		} else if (sPropertyName === "label") {
			sValue = oControlConfiguration.getLabel();
			oFilterItem.setLabel(sValue);
		} else if (sPropertyName === "visibleInAdvancedArea") {
			sValue = oControlConfiguration.getVisibleInAdvancedArea();
			if (oFilterItem.setVisibleInAdvancedArea) {
				oFilterItem.setVisibleInAdvancedArea(sValue);
			}
		}
	};

	/**
	 * Event Handler for changed events from control configuration
	 * 
	 * @private
	 * @param {Object} oEvent - then event object
	 */
	SmartFilterBar.prototype._handleGroupConfigurationChanged = function(oEvent) {
		var sPropertyName, oGroupConfiguration;

		sPropertyName = oEvent.getParameter("propertyName");
		oGroupConfiguration = oEvent.oSource;
		if (sPropertyName === "label") {
			this._handleGroupConfigurationLabelChanged(oGroupConfiguration);
		}
	};

	/**
	 * Handle the event of a changed label of a group configuration. Find the corresponding FilterGroupItem and sets its label accordingly.
	 * 
	 * @private
	 * @param {object} oGroupConfiguration - GroupConfiguration where the label as changed
	 */
	SmartFilterBar.prototype._handleGroupConfigurationLabelChanged = function(oGroupConfiguration) {
		var oFilterGroupItem, sKey, sLabel;

		if (!oGroupConfiguration) {
			return;
		}

		sLabel = oGroupConfiguration.getLabel();
		sKey = oGroupConfiguration.getKey();
		oFilterGroupItem = this._getFilterGroupItemByGroupName(sKey);
		if (oFilterGroupItem) {
			oFilterGroupItem.setGroupTitle(sLabel);
		}
	};

	/**
	 * Returns a filter item or filter group item having the specified name. Returns undefined if there are no filter items or filter group items
	 * having the specified name.
	 * 
	 * @private
	 * @param {string} sName of the filter
	 * @returns {object} the found filter item
	 */
	SmartFilterBar.prototype._getFilterItemByName = function(sName) {
		var aFilterItem, length, i;
		aFilterItem = this.getFilterItems();
		aFilterItem.push.apply(aFilterItem, this.getFilterGroupItems());

		length = aFilterItem.length;
		for (i = 0; i < length; i++) {
			if (aFilterItem[i].getName() === sName) {
				return aFilterItem[i];
			}
		}
	};

	/**
	 * Returns a filter group item having the specified group name. Returns undefined if there is no filter group items having the specified name.
	 * 
	 * @private
	 * @param {string} sName filter group name
	 * @returns {object} the found group item
	 */
	SmartFilterBar.prototype._getFilterGroupItemByGroupName = function(sName) {
		var aFilterItem, length, i;
		aFilterItem = this.getFilterGroupItems();

		length = aFilterItem.length;
		for (i = 0; i < length; i++) {
			if (aFilterItem[i].getGroupName() === sName) {
				return aFilterItem[i];
			}
		}
	};

	/**
	 * Returns an Object containing all information from the additional configuration (controlConfiguration, groupConfiguration).
	 * 
	 * @returns {object} the additional configuration
	 * @internal
	 */
	SmartFilterBar.prototype.getAdditionalConfiguration = function() {
		return new AdditionalConfigurationHelper(this.getControlConfiguration(), this.getGroupConfiguration());
	};

	/**
	 * The entity type name from OData metadata, for which the filter bar is created.
	 * 
	 * @deprecated Since 1.40. Use entitySet property instead of this one, to enable V4 annotation support
	 * @param {string} sEntityTypeName type name
	 * @public
	 */
	SmartFilterBar.prototype.setEntityType = function(sEntityTypeName) {
		this.setProperty("entityType", sEntityTypeName);
		this._initializeMetadata();
	};

	/**
	 * Uses the provided resource URI to fetch the OData metadata instead of using the default ODataModel (getModel()). You should only set this if
	 * you intend to get the metadata for the filter bar from elsewhere!
	 * 
	 * @param {string} sResourceUri - The URI of the oData service from which the metadata would be read
	 * @deprecated Since 1.29. Set an ODataModel as the main model on your control/view instead
	 * @public
	 */
	SmartFilterBar.prototype.setResourceUri = function(sResourceUri) {
		this.setProperty("resourceUri", sResourceUri);
		this._initializeMetadata();
	};

	/**
	 * It could happen that the entity type information is set already in the view, but there is no model attached yet. This method is called once the
	 * model is set on the parent and can be used to initialise the metadata, from the model, and finally create the filter controls.
	 * 
	 * @private
	 */
	SmartFilterBar.prototype.propagateProperties = function() {
		FilterBar.prototype.propagateProperties.apply(this, arguments);
		this._initializeMetadata();
	};

	/**
	 * Provides filter information for lazy instantiation (Overridden from FilterBar)
	 * 
	 * @private
	 * @returns {array} of filter information
	 */
	SmartFilterBar.prototype._getFilterInformation = function() {
		var oFilterGroup, i, j, iLen = 0, iFieldLen = 0, aFilterFields, aFields = [], oField;
		if (this._aFilterBarViewMetadata) {
			iLen = this._aFilterBarViewMetadata.length;
			for (i = 0; i < iLen; i++) {
				oFilterGroup = this._aFilterBarViewMetadata[i];
				aFilterFields = oFilterGroup.fields;
				iFieldLen = aFilterFields.length;
				for (j = 0; j < iFieldLen; j++) {
					oField = aFilterFields[j];
					if (oField.name === FilterProvider.BASIC_SEARCH_FIELD_ID) {
						this.setBasicSearch(oField.control);
						this._attachToBasicSearch(oField.control);
						continue;
					} else if (oFilterGroup.groupName === FilterProvider.BASIC_FILTER_AREA_ID) {
						this._createFieldInBasicArea(oField);

					} else {
						this._createFieldInAdvancedArea(oFilterGroup.groupName, oFilterGroup.groupLabel, oField);
					}
					aFields.push(oField);
				}
			}

			var aParameters = this.getAnalyticalParameters();
			iLen = aParameters.length;
			for (i = 0; i < iLen; i++) {
				oField = aParameters[i];
				this._createAnalyticParameter(oField);
				aFields.push(oField);
			}
		}
		return aFields;
	};

	/**
	 * Check if any controls are in error state or if search has to be prevented and return a flag, if search can continue
	 * 
	 * @private
	 * @returns {Boolean} true when there are no errors or when search is not pending
	 */
	SmartFilterBar.prototype._validateState = function() {
		var aFilterItems = null, iLen, oControl, bInError = false;
		aFilterItems = this.getAllFilterItems(true);
		if (aFilterItems) {
			iLen = aFilterItems.length;
			while (iLen--) {
				oControl = this.determineControlByFilterItem(aFilterItems[iLen]);
				if (oControl) {
					if (oControl.getValueState && oControl.getValueState() === sap.ui.core.ValueState.Error && !oControl.data("__mandatoryEmpty")) {
						bInError = true;
						break;
					} else if (oControl.__bValidatingToken) {
						// If a token validation is pending hold back the search until validation is through
						this.bIsSearchPending = true;
						// Set dummy error flag to prevent search
						bInError = true;
						break;
					}
				}
			}
		}
		if (this._oFilterProvider) {
			return !bInError && !this._oFilterProvider._validateConditionTypeFields();
		} else {
			return !bInError;
		}
	};

	/**
	 * For every control in error state, trigger <code>checkUpdate(true)</code>
	 * 
	 * @private
	 */
	SmartFilterBar.prototype._clearErroneusControlValues = function() {
		var aFilterItems = null, iLen, oControl, oValueBinding;
		aFilterItems = this.getAllFilterItems(true);
		if (aFilterItems) {
			iLen = aFilterItems.length;
			while (iLen--) {
				oControl = this.determineControlByFilterItem(aFilterItems[iLen]);
				if (oControl) {
					if (oControl.getValueState && oControl.getValueState() === sap.ui.core.ValueState.Error) {
						oValueBinding = oControl.getBinding("value");
						if (oValueBinding) {
							oValueBinding.checkUpdate(true);
						}
					}
				}
			}
		}

	};

	/**
	 * Handling of change and search for Basic Search field (used in value helps)
	 * 
	 * @private
	 * @param {Object} oBasicSearchControl the basic search control
	 */
	SmartFilterBar.prototype._attachToBasicSearch = function(oBasicSearchControl) {

		if (oBasicSearchControl) {
			oBasicSearchControl.attachSearch((jQuery.proxy(function() {
				if (!this.getLiveMode() && !this.isDialogOpen()) {
					this.search();
				}
			}, this)));

			// Basic search doesn't have a change event, so we attach to live change instead!
			oBasicSearchControl.attachLiveChange(jQuery.proxy(this._onChange, this));
		}
	};

	/**
	 * Called when change need to be triggered on the Smart Filter
	 * 
	 * @private
	 * @param {Object} oEvent - then event object
	 */
	SmartFilterBar.prototype._onChange = function(oEvent) {
		var oControl = oEvent.getSource();
		// Clear mandatory empty error state and flag, when control value changes
		if (oControl.data("__mandatoryEmpty")) {
			oControl.data("__mandatoryEmpty", null);
			oControl.setValueState(sap.ui.core.ValueState.None);
		}
		// Clear validation error when no value is in the input
		if (oControl.data("__validationError") && !oControl.getValue()) {
			oControl.data("__validationError", null);
			oControl.setValueState(sap.ui.core.ValueState.None);
		}
		// Don't fire change event while the filter data is being created/updated!
		if (this._oFilterProvider._bUpdatingFilterData || this._oFilterProvider._bCreatingInitialModel) {
			return;
		}
		// If the token is being validated do not trigger the change event!
		if (!oControl || (oControl && !oControl.__bValidatingToken)) {
			this.fireFilterChange(oEvent);
			this._oFilterProvider._updateConditionTypeFields(oEvent.getParameter("filterChangeReason"));
		}

		if (this.getLiveMode()) {
			this.search();
		}
	};

	/**
	 * Listen to the change event to set the search button state and raise an event
	 * 
	 * @param {object} oControl - the control on which change would be triggered
	 * @private
	 */
	SmartFilterBar.prototype._handleChange = function(oControl) {
		if (oControl) {
			if (oControl.attachChange) {
				oControl.attachChange(jQuery.proxy(this._onChange, this));
			}
		}
	};

	/**
	 * Handles the enter event on the control to trigger Search
	 * 
	 * @param {object} oControl - the control on which enter has to be handled
	 * @private
	 */
	SmartFilterBar.prototype._handleEnter = function(oControl) {

		/*
		 * do not trigger search in live mode, since it will be triggered via the change event
		 */
		if (this.getLiveMode()) {
			return;
		}

		/*
		 * @Hack: Search should not be triggered while a suggest is in progress (i.e. user presses enter key on the SuggestionList popup). Since the
		 * SuggestionPopup is always closed before the keyup event is raised and we cannot use the keydown event alone, we now listen to both key up
		 * and keydown events and set flags on the control to overcome the issue. Perhaps if sapUI5 provides a new event/does not propagate the keyUp
		 * event/sets a flag we can remove this hack TODO: Clarify this with sapUI5 colleagues.
		 */
		oControl.attachBrowserEvent("keydown", function(e) {
			if (e.which === 13) {
				oControl.__bSuggestInProgress = (oControl._oSuggestionPopup && oControl._oSuggestionPopup.isOpen());
			}
		});
		oControl.attachBrowserEvent("keyup", jQuery.proxy(function(e) {
			if (e.which === 13 && !oControl.__bSuggestInProgress) {
				this.search();
			}
		}, this));
	};

	/**
	 * Creates the control used in the filter item lazily
	 * 
	 * @private
	 * @param {object} oField filter metadata
	 */
	SmartFilterBar.prototype._createFilterFieldControl = function(oField) {
		if (oField.conditionType) {
			this._createConditionTypeItem(oField);
		} else if (!oField.control && oField.fCreateControl) {
			oField.fCreateControl(oField);
			delete oField.fCreateControl;
		}
		// The control might already be present e.g. for custom field - so also register for enter & change events!
		this._handleEnter(oField.control);
		this._handleChange(oField.control);
	};

	/**
	 * Creates a new control based on the Custom implementation given in oField.conditionType
	 * 
	 * @private
	 * @param {object} oField filter metadata
	 */
	SmartFilterBar.prototype._createConditionTypeItem = function(oField) {
		if (!oField.conditionType) {
			return;
		}
		jQuery.sap.require("sap.m.HBox");
		var oLayout = new sap.m.HBox(), iSpan = 1;
		oField.conditionType.initializeFilterItem(this.getFilterContainerWidth(), oLayout);
		oField._iSpan = iSpan + 1;
		oField.control = oLayout;
	};

	/**
	 * Creates a new paramater and adds it to the filter bar Basic Area, based on the metadata provided by the FilterProvider
	 * 
	 * @private
	 * @param {object} oParameter filter metadata
	 * @returns {object} oField filter metadata
	 */
	SmartFilterBar.prototype._createAnalyticParameter = function(oParameter) {
		oParameter.factory = function() {
			this._createFilterFieldControl(oParameter);
			if (!oParameter.control) {
				return;
			}
			var oParamItem = new FilterGroupItem({
				labelTooltip: oParameter.quickInfo,
				label: oParameter.label,
				name: oParameter.fieldName,
				mandatory: oParameter.isMandatory,
				visible: oParameter.isVisible,
				control: oParameter.control,
				hiddenFilter: false
			});

			this._addParameter(oParamItem);
		}.bind(this);

		// FilterBar needs this information
		oParameter.groupName = FilterBar.INTERNAL_GROUP;

		return oParameter;
	};

	/**
	 * Creates a new field and adds it to the filter bar Basic Area, based on the metadata provided by the FilterProvider
	 * 
	 * @private
	 * @param {object} oField filter metadata
	 * @returns {object} oField filter metadata
	 */
	SmartFilterBar.prototype._createFieldInBasicArea = function(oField) {
		oField.factory = function() {
			this._createFilterFieldControl(oField);
			if (!oField.control) {
				return;
			}
			var oFilterItem = new FilterItem({
				labelTooltip: oField.quickInfo,
				label: oField.label,
				name: oField.fieldName,
				mandatory: oField.isMandatory,
				visible: oField.isVisible,
				control: oField.control,
				hiddenFilter: oField.hiddenFilter
			});

			if (oField._iSpan) {
				oFilterItem._iSpan = oField._iSpan;
			}

			if (oField.isCustomFilterField) {
				oFilterItem.data("isCustomField", true);
			}
			this.addFilterItem(oFilterItem);
		}.bind(this);

		// FilterBar needs this information
		oField.groupName = FilterBar.INTERNAL_GROUP;

		return oField;
	};

	/**
	 * Creates a new field and adds it to the filter bar into the AdvancedSearchArea, based on the metadata provided by the FilterProvider
	 * 
	 * @private
	 * @param {string} sGroupName of the filter
	 * @param {string} sGroupLabel of the filter
	 * @param {object} oField filter metadata
	 * @returns {object} oField filter metadata
	 */
	SmartFilterBar.prototype._createFieldInAdvancedArea = function(sGroupName, sGroupLabel, oField) {
		oField.factory = function() {
			this._createFilterFieldControl(oField);
			var oFilterGroupItem = new FilterGroupItem({
				labelTooltip: oField.quickInfo,
				label: oField.label,
				name: oField.fieldName,
				groupName: sGroupName,
				groupTitle: sGroupLabel,
				mandatory: oField.isMandatory,
				visible: oField.isVisible,
				visibleInAdvancedArea: oField.visibleInAdvancedArea,
				control: oField.control,
				hiddenFilter: oField.hiddenFilter
			});
			if (oField._iSpan) {
				oFilterGroupItem._iSpan = oField._iSpan;
			}
			if (oField.isCustomFilterField) {
				oFilterGroupItem.data("isCustomField", true);
			}
			this.addFilterGroupItem(oFilterGroupItem);
		}.bind(this);

		// FilterBar needs this information
		oField.groupName = sGroupName;
		oField.groupTitle = sGroupLabel;

		return oField;
	};

	/**
	 * Returns an array of filters (sap.ui.model.Filter instances), for visible fields, that can be used to restrict the query result from OData.<br>
	 * The result of this method can directly be used during aggregation binding or OData read.
	 * 
	 * @param {string[]} [aFieldNames] optional array of field names that filters should be returned, if not given all visible filters are returned
	 * @returns {sap.ui.model.Filter[]} array of sap.ui.model.Filter or multi-filters
	 * @public
	 */
	SmartFilterBar.prototype.getFilters = function(aFieldNames) {
		if (!aFieldNames || !aFieldNames.length) {
			aFieldNames = this._getVisibleFieldNames(true);
		}

		return this._oFilterProvider ? this._oFilterProvider.getFilters(aFieldNames) : [];
	};

	/**
	 * Returns a parameter object that can be used to restrict the result of an OData service request if a basic search is performed. <caption>Example
	 * of a returned object:</caption>
	 * 
	 * <pre>
	 * {
	 * 	&quot;custom&quot;: {
	 * 		&quot;search-focus&quot;: &quot;MySearchFocusFieldName&quot;,
	 * 		&quot;search&quot;: &quot;MySearchString&quot;
	 * 	}
	 * }
	 * </pre>
	 * 
	 * These parameters can be handed over as custom parameters, for example, to the {@link sap.ui.model.odata.v2.ODataListBinding}.
	 * 
	 * @returns {object} A parameter object containing OData query parameters
	 * @public
	 */
	SmartFilterBar.prototype.getParameters = function() {
		return this._oFilterProvider ? this._oFilterProvider.getParameters() : {};
	};

	/**
	 * Returns the binding paths for the analytic paramaters
	 * 
	 * @experimental since 1.42.0 The API is NOT stable yet. Use at your own risk.
	 * @public
	 * @returns {string} Binding path of the analytical paramaters
	 */
	SmartFilterBar.prototype.getAnalyticBindingPath = function() {
		var sBindingPath = "";
		if (this._oFilterProvider && this.getConsiderAnalyticalParameters()) {
			sBindingPath = this._oFilterProvider.getAnalyticBindingPath();
		}

		return sBindingPath;
	};

	/**
	 * Returns the control (if any) with the specified key (Property name in OData entity). Use just the property name as the key when getting a
	 * control from the basic area. Example: "CompanyCode" & Use "EntityName/GroupName.FieldName" format to get controls from groups.
	 * Example:"Account.CompanyCode"
	 * 
	 * @param {string} sKey The key as present in the OData property name/control configuration
	 * @returns {object|sap.ui.core.Control} The control in the filter bar, if any
	 * @public
	 */
	SmartFilterBar.prototype.getControlByKey = function(sKey) {
		return this.determineControlByName(sKey);
	};

	/**
	 * Returns an array of visible field names
	 * 
	 * @private
	 * @param {bool} bIgnoreParameters indicationg if the analytic paramaters should be omitted
	 * @returns {Array} aFieldNames - array of field names
	 */
	SmartFilterBar.prototype._getVisibleFieldNames = function(bIgnoreParameters) {
		var aFieldNames = [], aVisibleFilterItems = this.getAllFilterItems(true), iLen = aVisibleFilterItems.length, oItem;
		iLen = aVisibleFilterItems.length;
		// loop through all the visible filter items and get their names
		while (iLen--) {
			oItem = aVisibleFilterItems[iLen];
			if (oItem) {
				if (bIgnoreParameters && oItem._isParameter()) {
					continue;
				}

				aFieldNames.push(oItem.getName());
			}
		}
		return aFieldNames;
	};

	/**
	 * Returns the data currently set in the filter data model.
	 * 
	 * @param {boolean} bAllFilterData Also include empty/invisible fields filter data
	 * @returns {object} The JSON data in the filter bar
	 * @public
	 */
	SmartFilterBar.prototype.getFilterData = function(bAllFilterData) {
		var oData = null;
		if (this._oFilterProvider) {
			if (bAllFilterData) {
				oData = this._oFilterProvider.getFilterData();
			} else {
				oData = this._oFilterProvider.getFilledFilterData(this._getVisibleFieldNames());
			}
		}
		return oData;
	};

	/**
	 * checks the value of the custom data
	 * 
	 * @private
	 * @param {Object} oCustomData custom data
	 * @returns {boolean} has value/or not
	 */
	SmartFilterBar.prototype._checkHasValueData = function(oCustomData) {
		if (oCustomData) {
			if (typeof oCustomData === "boolean") {
				return oCustomData;
			} else if (typeof oCustomData === "string") {
				if (oCustomData.toLowerCase() === "true") {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * checks if the current filter has a value
	 * 
	 * @param {Object} oData data as returned by the oData-service
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem representing the filter
	 * @param {sap.ui.core.Control} oControl the control as described by the oFilterItem
	 * @returns {boolean} true if the filter item has a value
	 * @private
	 */
	SmartFilterBar.prototype._checkForValues = function(oData, oFilterItem, oControl) {
		var sValue = null;
		if (oData && oFilterItem && oControl) {
			if (!oFilterItem.data("isCustomField")) {
				// Check if Data exists in the filter model for internal fields
				sValue = oData[oFilterItem.getName()];
			} else {

				var oCustomData = oControl.data("hasValue");
				if ((oCustomData !== undefined) && (oCustomData != null)) {
					return this._checkHasValueData(oCustomData);
				} else {
					/* eslint-disable no-lonely-if */
					if (oControl.getValue) {
						// Check if getValue is present and filled
						sValue = oControl.getValue();
					} else if (oControl.getSelectedKey) { // new mechanism with 1.25. Has to be provided by the custom field
						// Check if getSelectedKey is set
						sValue = oControl.getSelectedKey();
					}
					/* eslint-enable no-lonely-if */
				}
			}
		}

		return sValue ? true : false;
	};

	/**
	 * Returns all filter items containing a value
	 * 
	 * @returns {array} filter items containing a value
	 * @private
	 */
	SmartFilterBar.prototype.getFiltersWithValues = function() {
		var aFilterItemsWithValue = [];

		// logic from check _validateMandatoryFields
		var aFilterItems = this.getAllFilterItems(true), oFilterItem, oData = this.getFilterData(), iLen = 0, oControl;
		if (aFilterItems && oData) {
			iLen = aFilterItems.length;
			// Loop through the mandatory field names
			while (iLen--) {
				oFilterItem = aFilterItems[iLen];
				// Get the control from filter item name
				oControl = this.determineControlByFilterItem(oFilterItem, true);
				if (this._checkForValues(oData, oFilterItem, oControl)) {
					aFilterItemsWithValue.push(oFilterItem);
				}
			}
		}

		return aFilterItemsWithValue.reverse();
	};

	/**
	 * Returns the data currently set in the filter data model as string.
	 * 
	 * @param {boolean} bAllFilterData Also include empty/invisible fields filter data
	 * @returns {string} The JSON data string
	 * @public
	 */
	SmartFilterBar.prototype.getFilterDataAsString = function(bAllFilterData) {
		var oData = null;
		if (this._oFilterProvider) {
			if (bAllFilterData) {
				oData = this._oFilterProvider.getFilterDataAsString();
			} else {
				oData = this._oFilterProvider.getFilledFilterDataAsString(this._getVisibleFieldNames());
			}
		}
		return oData;
	};

	/**
	 * Sets the data in the filter data model. The follow-on filterChange event is only triggered when none _CUSTOM data is set.
	 * 
	 * @param {object} oJson The JSON data in the filter bar
	 * @param {boolean} bReplace Replace existing filter data
	 * @public
	 */
	SmartFilterBar.prototype.setFilterData = function(oJson, bReplace) {
		if (this._oFilterProvider) {
			this._oFilterProvider.setFilterData(oJson, bReplace);
		}

		if (oJson && (Object.keys(oJson).length === 1) && oJson._CUSTOM) {
			// in case only _CUSTOM information is available do not trigger filterChange-event
			return;
		}

		// The internal controls do not fire change event in this scenario
		// So, we fire it manually once here
		this.fireFilterChange({
			afterFilterDataUpdate: true
		});
	};

	/**
	 * Sets the data in the filter data model as string.
	 * 
	 * @param {string} sJson The JSON data in the filter bar
	 * @param {boolean} bReplace Replace existing filter data
	 * @public
	 */
	SmartFilterBar.prototype.setFilterDataAsString = function(sJson, bReplace) {
		if (sJson) {
			this.setFilterData(JSON.parse(sJson), bReplace);
		}
	};

	/**
	 * Overwrites method from base class. Called when user clicks the clear button of the FilterBar. Clears all filter fields and fires clear event.
	 * 
	 * @private
	 */
	SmartFilterBar.prototype.fireClear = function() {
		this._clearFilterFields();
		this.fireEvent("clear", arguments);
	};

	/**
	 * Clears the values of all filter fields. Applies default values if applicable.
	 * 
	 * @private
	 */
	SmartFilterBar.prototype._clearFilterFields = function() {
		if (this._oFilterProvider) {
			this._oFilterProvider.clear();

			this._clearErroneusControlValues();
		}
		// The internal controls do not fire change event in this scenario
		// So, we fire it manually once here
		this.fireFilterChange({
			afterFilterDataUpdate: true
		});
	};

	/**
	 * Overwrites method from base class. Called when user clicks the reset button of the FilterBar. Clears all filter fields and fires reset event.
	 * 
	 * @private
	 */
	SmartFilterBar.prototype.fireReset = function() {
		this._resetFilterFields();
		this.fireEvent("reset", arguments);
	};

	/**
	 * Clears the values of all filter fields. Applies default values if applicable.
	 * 
	 * @private
	 */
	SmartFilterBar.prototype._resetFilterFields = function() {
		if (this._oFilterProvider) {
			this._oFilterProvider.reset();

			this._clearErroneusControlValues();
		}
		// The internal controls do not fire change event in this scenario
		// So, we fire it manually once here
		this.fireFilterChange({
			afterFilterDataUpdate: true
		});
	};

	/**
	 * Triggers a search with the specified timeout or simple in a 0 delayed call - so that, current execution stack is done before the search is
	 * executed
	 * 
	 * @param {int} iDelay Delay time in milliseconds
	 * @private
	 */
	SmartFilterBar.prototype.triggerSearch = function(iDelay) {
		this._clearDelayedSearch();
		this._iDelayedSearchId = jQuery.sap.delayedCall(iDelay || 0, this, "_search");
	};

	/**
	 * Overwrites method from base class. Called when user clicks the search button of the FilterBar. The search is executed asynchronously per
	 * default, but can be forced to synchronously execution by providing the <code>bSync</code> set to <code>true</code>. Synchronous mode is
	 * only supported for non live mode scenarios. In the synchroneous mode a mandatory check prior to the search execution is made.
	 * 
	 * @public
	 * @params {boolean} bSync indicates if the search should be triggerd synchronously.
	 * @returns {boolean|undefined} true indicates that there are no validation problems. In async mode the return is always true.
	 */
	SmartFilterBar.prototype.search = function(bSync) {
		var bLiveMode = this.getLiveMode();

		if (bSync && !bLiveMode) {
			return this._search();
		} else {
			this.triggerSearch(bLiveMode ? SmartFilterBar.LIVE_MODE_INTERVAL : 0);
		}
		return true;
	};

	SmartFilterBar.prototype._search = function() {
		var parameter = [], oObj = {}, bContinue, bInValidationError = false, sErrorMessage;
		delete this.bIsSearchPending;
		// First check for validation errors or if search should be prevented
		bContinue = this._validateState();

		if (!bContinue) {
			if (this.bIsSearchPending) {
				// if Search is pending.. do nothing
				return;
			} else {
				// validation errors exist
				bInValidationError = true;
			}
		} else {
			// Then check if any mandatory control is empty
			bContinue = this._validateMandatoryFields();
		}

		if (this.isPending() && !this._bIsPendingChangeAttached) {
			var fnHandler = function(oEvent) {
				if (oEvent.getParameter("pendingValue") === false) {
					this.detachPendingChange(fnHandler);
					this._bIsPendingChangeAttached = false;
					this._search();
				}
			}.bind(this);
			this._bIsPendingChangeAttached = true;
			this.attachPendingChange(fnHandler);
			return;
		}

		// clear eventual delayed search
		this._clearDelayedSearch();

		if (bContinue) {
			oObj.selectionSet = this._retrieveCurrentSelectionSet();
			parameter.push(oObj);
			this.fireSearch(parameter);
		} else {
			if (!this._oResourceBundle) {
				this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");
			}

			if (!bInValidationError) {
				if (!this._sMandatoryErrorMessage) {
					this._sMandatoryErrorMessage = this._oResourceBundle.getText("EMPTY_MANDATORY_MESSAGE");
				}
				sErrorMessage = this._sMandatoryErrorMessage;
			} else {
				if (!this._sValidationErrorMessage) {
					this._sValidationErrorMessage = this._oResourceBundle.getText("VALIDATION_ERROR_MESSAGE");
				}
				sErrorMessage = this._sValidationErrorMessage;
			}

			if (this.getShowMessages()) {
				try {
					MessageBox.error(sErrorMessage, {
						styleClass: (this.$() && this.$().closest(".sapUiSizeCompact").length) ? "sapUiSizeCompact" : "",
						onClose: this._setFocusOnFirstErroneousField.bind(this)
					});
				} catch (x) {
					return;
				}
			} else {
				this._setFocusOnFirstErroneousField();
				jQuery.sap.log.warning("search was not triggered. " + sErrorMessage);
			}

			// Opens the more area if error message is shown and if empty mandatory fields are present in the advanced filter area!
			if (this._bExpandAdvancedFilterArea && this.rerenderFilters) {
				this.rerenderFilters(true);
			}
		}
		return bContinue;
	};

	/**
	 * Sets focus on the first field having an error message
	 * 
	 * @private
	 */
	SmartFilterBar.prototype._setFocusOnFirstErroneousField = function() {
		var aFilterItems = null, iLen, oControl, i;
		aFilterItems = this.getAllFilterItems(true);
		if (aFilterItems) {
			iLen = aFilterItems.length;
			for (i = 0; i < iLen; i++) {
				oControl = this.determineControlByFilterItem(aFilterItems[i]);
				if (oControl && oControl.getValueState && oControl.getValueState() === sap.ui.core.ValueState.Error) {
					jQuery.sap.delayedCall(0, oControl, "focus");
					break;
				}
			}
		}
	};

	/**
	 * Sets the live mode. The live mode only operates on non-phone scenarios.
	 * 
	 * @public
	 * @param {boolean} bFlag sets the live mode
	 */
	SmartFilterBar.prototype.setLiveMode = function(bFlag) {
		if (!this._isPhone()) {
			if (bFlag) {
				this.hideGoButton();
			} else {
				this.restoreGoButton();
			}
		}

		this.setProperty("liveMode", bFlag);
	};

	/**
	 * Gets the live mode. The live mode only operates on non-phone scenarios.
	 * 
	 * @public
	 * @returns {boolean} The live mode setting
	 */
	SmartFilterBar.prototype.getLiveMode = function() {
		if (this._isPhone()) {
			return false;
		}

		return this.getProperty("liveMode");
	};

	SmartFilterBar.prototype._clearDelayedSearch = function() {
		if (this._iDelayedSearchId) {
			jQuery.sap.clearDelayedCall(this._iDelayedSearchId);
			this._iDelayedSearchId = null;
		}
	};

	/**
	 * Checks the pending state of the FilterBar control
	 * 
	 * @public
	 * @returns {boolean} true if at least one FilterItem element of the FilterBar control is pending
	 */
	SmartFilterBar.prototype.isPending = function() {
		if (!this._oFilterProvider) {
			return false;
		}
		return this._oFilterProvider.isPending();
	};

	/**
	 * Checks if the values of all mandatory filter fields are filled and returns true if they are; else returns false. If no fields and data exist
	 * true is returned! ErrorMessage/ErrorState is set on the fields accordingly.
	 * 
	 * @private
	 * @returns {boolean} true when no errors exist
	 */
	SmartFilterBar.prototype._validateMandatoryFields = function() {
		var bFilled = true, aFilterItems = this.determineMandatoryFilterItems(), oFilterItem, oData = this.getFilterData(), iLen = 0, oControl;
		this._bExpandAdvancedFilterArea = false;
		if (aFilterItems && oData) {
			iLen = aFilterItems.length;
			// Loop through the mandatory field names
			while (iLen--) {
				oFilterItem = aFilterItems[iLen];

				// sField = oFilterItem.getName();
				// Get the control from filter item name
				oControl = this.determineControlByFilterItem(oFilterItem, true);
				if (oControl && oControl.setValueState) {

					if (this._checkForValues(oData, oFilterItem, oControl)) {
						// Clear error state only if it was set due to mandatory check
						if (oControl.data("__mandatoryEmpty")) {
							oControl.data("__mandatoryEmpty", null);
							oControl.setValueState(sap.ui.core.ValueState.None);
						}
					} else {
						bFilled = false;
						// If field has a value property and it is empty --> show error
						oControl.setValueState(sap.ui.core.ValueState.Error);
						// set flag if error state was set due to mandatory check
						oControl.data("__mandatoryEmpty", true);
						// GroupName method exists only on FilterGroupItem --> part of advanced filter area
						if (oFilterItem.getGroupName) {
							this._bExpandAdvancedFilterArea = true; // !!!! TODO: expand the filter area
						}
					}
				}
			}
		}
		return bFilled;
	};

	SmartFilterBar.prototype._setSmartVariant = function(sSmartVariant) {
		if (sSmartVariant) {
			var oSmartVariantControl = sap.ui.getCore().byId(sSmartVariant);
			if (oSmartVariantControl) {
				if (oSmartVariantControl instanceof SmartVariantManagement) {

					if (this._oVariantManagement && !this._oVariantManagement.isPageVariant()) {
						this._replaceVariantManagement(oSmartVariantControl);
						this._oSmartVariantManagement = oSmartVariantControl;
					}

				} else {
					jQuery.sap.log.error("Control with the id=" + sSmartVariant + " not of expected type");
				}
			} else {
				jQuery.sap.log.error("Control with the id=" + sSmartVariant + " not found");
			}
		}
	};

	SmartFilterBar.prototype.setSmartVariant = function(sSmartVariant) {

		if (this.getAdvancedMode()) {
			jQuery.sap.log.error("not supported for the advanced mode");
			return;
		}

		this.setAssociation("smartVariant", sSmartVariant);
		this._setSmartVariant(sSmartVariant);
	};

	SmartFilterBar.prototype.getSmartVariant = function() {

		if (this.getAdvancedMode()) {
			jQuery.sap.log.error("not supported for the advanced mode");
			return null;
		}

		var sSmartVariantId = this.getAssociation("smartVariant");
		if (sSmartVariantId) {
			return sap.ui.getCore().byId(sSmartVariantId);

		}

		return this._oSmartVariantManagement;
	};

	/**
	 * creates the smart variant-management control
	 * 
	 * @private
	 * @returns {SmartVariantManagement} the newly created variant control
	 */
	SmartFilterBar.prototype._createVariantManagement = function() {

		this._oSmartVariantManagement = null;

		if (this.getAdvancedMode()) {
			return FilterBar.prototype._createVariantManagement.apply(this);
		}

		var sSmartVariant = this.getSmartVariant();
		this._setSmartVariant(sSmartVariant);

		if (!this._oSmartVariantManagement) {

			this._oSmartVariantManagement = new SmartVariantManagement(this.getId() + "-variant", {
				showExecuteOnSelection: true,
				showShare: true
			});
		}

		return this._oSmartVariantManagement;
	};

	/**
	 * initializes the variant management, when the prerequisites are full filled. In this case the initialise-event will be triggered lated, after
	 * the variant management initialization. Triggers the initialise-event immediately, in case the pre-requisits are not full filled
	 * 
	 * @private
	 */
	SmartFilterBar.prototype._initializeVariantManagement = function() {
		// initialise SmartVariant stuff only if it is necessary! (Ex: has a persistencyKey)
		if (!this.isRunningInValueHelpDialog && this._oSmartVariantManagement && this.getPersistencyKey()) {
			var oPersInfo = new PersonalizableInfo({
				type: "filterBar",
				keyName: "persistencyKey",
				dataSource: this.getEntitySet() || this.getEntityType()
			});
			oPersInfo.setControl(this);

			this._oSmartVariantManagement.addPersonalizableControl(oPersInfo);

			var bValue = this._checkHasValueData(this.data("executeStandardVariantOnSelect"));
			if (bValue) {
				this._oSmartVariantManagement._executeOnSelectForStandardVariantByXML(bValue);
			}

			FilterBar.prototype._initializeVariantManagement.apply(this, arguments);

		} else {

			this.fireInitialise();
		}
	};

	/**
	 * Returns an instance of the control for the basic search.
	 * 
	 * @returns {object} Basic search control
	 * @public
	 */
	SmartFilterBar.prototype.getBasicSearchControl = function() {
		return sap.ui.getCore().byId(this.getBasicSearch());
	};

	/**
	 * Searches for the filter field having the specified OData key and adds this filter field to the advanced area. If there is no corresponding
	 * field in the OData metadata, this method has no effect.
	 * 
	 * @param {string} sKey The key like specified in the OData metadata
	 * @public
	 */
	SmartFilterBar.prototype.addFieldToAdvancedArea = function(sKey) {
		var oFilterItem;
		oFilterItem = this._getFilterItemByName(sKey);
		if (oFilterItem && oFilterItem.setVisibleInAdvancedArea) {
			oFilterItem.setVisibleInAdvancedArea(true);
		}
	};

	SmartFilterBar.prototype.getConditionTypeByKey = function(sKey) {
		if (this._oFilterProvider._mConditionTypeFields[sKey]) {
			return this._oFilterProvider._mConditionTypeFields[sKey].conditionType;
		}
	};

	/**
	 * Checks whether the control is initialised
	 * 
	 * @returns {boolean} returns whether control is already initialised
	 * @protected
	 */
	SmartFilterBar.prototype.isInitialised = function() {
		return !!this.bIsInitialised;
	};

	/**
	 * Destroys the control.
	 * 
	 * @public
	 */
	SmartFilterBar.prototype.destroy = function() {
		this._clearDelayedSearch();

		FilterBar.prototype.destroy.apply(this, arguments);

		sap.ui.getCore().getMessageManager().unregisterObject(this);

		if (this._oFilterProvider && this._oFilterProvider.destroy) {
			this._oFilterProvider.destroy();
		}
		this._oFilterProvider = null;
		this._aFilterBarViewMetadata = null;
		this._bExpandAdvancedFilterArea = null;
		this._oResourceBundle = null;
		this._sMandatoryErrorMessage = null;
		this._sValidationErrorMessage = null;

		this._oSmartVariantManagement = null;
	};

	return SmartFilterBar;

}, /* bExport= */true);
