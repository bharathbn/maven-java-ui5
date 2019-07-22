/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.navpopover.NavigationPopoverHandler.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/comp/library', "sap/ui/base/ManagedObject", './SemanticObjectController', 'sap/ui/model/json/JSONModel', 'sap/ui/core/Control', './Factory', './NavigationPopover', './Util', 'sap/m/VBox', './LinkData', 'sap/m/MessageBox', 'sap/ui/comp/navpopover/SelectionController'
], function(jQuery, CompLibrary, ManagedObject, SemanticObjectController, JSONModel, Control, Factory, NavigationPopover, Util, VBox, LinkData, MessageBox, SelectionController) {
	"use strict";

	/**
	 * Constructor for a new navpopover/NavigationPopoverHandler.
	 * 
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The NavigationPopoverHandler control determines target navigations for a semantic object and shows them together with further
	 *        information in a Popover. Target navigations are determined via the
	 *        {@link sap.ushell.services.CrossApplicationNavigation CrossApplicationNavigation} service of the unified shell.
	 * @extends sap.ui.base.ManagedObject
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.navpopover.NavigationPopoverHandler
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NavigationPopoverHandler = ManagedObject.extend("sap.ui.comp.navpopover.NavigationPopoverHandler",
	/** @lends sap.ui.comp.navpopover.NavigationPopoverHandler.prototype */
	{
		metadata: {

			library: "sap.ui.comp",
			properties: {

				/**
				 * Name of semantic object which is used to determine target navigations.
				 * 
				 * @since 1.36.0
				 */
				semanticObject: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Names of additional semantic objects which are used to determine target navigations.
				 * 
				 * @since 1.42.0
				 */
				additionalSemanticObjects: {
					type: "string[]",
					defaultValue: []
				},

				/**
				 * The semantic object controller controls events for several NavigationPopoverHandler controls. If the controller is not set
				 * manually, it tries to find a SemanticObjectController in its parent hierarchy.
				 * 
				 * @since 1.36.0
				 */
				semanticObjectController: {
					type: "any",
					defaultValue: null
				},

				/**
				 * The metadata field name for this NavigationPopoverHandler control.
				 * 
				 * @since 1.36.0
				 */
				fieldName: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Shown title of semantic object.
				 * 
				 * @since 1.36.0
				 */
				semanticObjectLabel: {
					type: "string",
					defaultValue: null
				},

				/**
				 * If set to <code>false</code>, the NavigationPopoverHandler control will not replace its field name with the according
				 * <code>semanticObject</code> property during the calculation of the semantic attributes. This enables the usage of several
				 * NavigationPopoverHandler on the same semantic object. *
				 * 
				 * @since 1.36.0
				 */
				mapFieldToSemanticObject: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Internal map containing the semantic attributes calculated from the binding that will be used to retrieve the navigation targets.
				 * 
				 * @since 1.38.0
				 */
				semanticAttributes: {
					type: "object",
					visibility: "hidden",
					defaultValue: null
				},

				/**
				 * Navigation property that points from the current to the related entity type where the com.sap.vocabularies.Communication.v1.Contact
				 * annotation is defined, for example, <code>'to_Supplier'</code>. An empty string means that the related entity type is the
				 * current one.
				 * 
				 * @since 1.40.0
				 */
				contactAnnotationPath: {
					type: "string",
					defaultValue: undefined
				},

				/**
				 * Determines whether the personalization link is shown inside the NavigationPopover control.
				 * 
				 * @since 1.44.0
				 */
				enableAvailableActionsPersonalization: {
					type: "boolean",
					defaultValue: true
				}
			},
			associations: {
				/**
				 * The parent control.
				 * 
				 * @since 1.36.0
				 */
				control: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {

				/**
				 * Event is fired before the navigation popover opens and before navigation target links are getting retrieved. Event can be used to
				 * change the parameters used to retrieve the navigation targets. In case of NavigationPopoverHandler, the
				 * <code>beforePopoverOpens</code> is fired after the link has been clicked.
				 * 
				 * @since 1.36.0
				 */
				beforePopoverOpens: {
					parameters: {
						/**
						 * The semantic object for which the navigation targets will be retrieved.
						 */
						semanticObject: {
							type: "string"
						},

						/**
						 * Map containing the semantic attributes calculated from the binding that will be used to retrieve the navigation targets.
						 * 
						 * @deprecated Since 1.42.0. The parameter <code>semanticAttributes</code> is obsolete. Instead use the parameter
						 *             <code>semanticAttributesOfSemanticObjects</code>.
						 */
						semanticAttributes: {
							type: "object"
						},

						/**
						 * A map of semantic objects for which the navigation targets will be retrieved and it's semantic attributes calculated from
						 * the binding context. The semantic attributes will be used as parameters in order to retrieve the navigation targets.
						 * 
						 * @since 1.42.0
						 */
						semanticAttributesOfSemanticObjects: {
							type: "object"
						},

						/**
						 * This callback function enables you to define a changed semantic attributes map. Signatures:
						 * <code>setSemanticAttributes(oSemanticAttributesMap)</code> Parameter:
						 * <ul>
						 * <li>{object} oSemanticAttributesMap New map containing the semantic attributes</li>
						 * <li>{string} sSemanticObject Semantic Object for which the oSemanticAttributesMap belongs</li>
						 * </ul>
						 */
						setSemanticAttributes: {
							type: "function"
						},

						/**
						 * This callback function sets an application state key that is used over the cross-application navigation. Signatures:
						 * <code>setAppStateKey(sAppStateKey)</code> Parameter:
						 * <ul>
						 * <li>{string} sAppStateKey</li>
						 * </ul>
						 */
						setAppStateKey: {
							type: "function"
						},

						/**
						 * The ID of the NavigationPopoverHandler.
						 */
						originalId: {
							type: "string"
						},

						/**
						 * This callback function triggers the retrieval of navigation targets and leads to the opening of the navigation popover.
						 * Signatures: <code>open()</code> If the <code>beforePopoverOpens</code> has been registered, the <code>open</code>
						 * function has to be called manually in order to open the navigation popover.
						 */
						open: {
							type: "function"
						}
					}
				},

				/**
				 * After the navigation targets are retrieved, <code>navigationTargetsObtained</code> is fired and provides the possibility to
				 * change the targets.
				 * 
				 * @since 1.36.0
				 */
				navigationTargetsObtained: {
					parameters: {
						/**
						 * The main navigation object.
						 */
						mainNavigation: {
							type: "sap.ui.comp.navpopover.LinkData"
						},

						/**
						 * Array of available navigation target objects.
						 */
						actions: {
							type: "sap.ui.comp.navpopover.LinkData[]"
						},

						/**
						 * The navigation object for the own application. This navigation option is by default not visible on the popover.
						 */
						ownNavigation: {
							type: "sap.ui.comp.navpopover.LinkData"
						},

						/**
						 * Array containing contact data.
						 */
						popoverForms: {
							type: "sap.ui.layout.form.SimpleForm[]"
						},

						/**
						 * The semantic object for which the navigation targets have been retrieved.
						 */
						semanticObject: {
							type: "string"
						},

						/**
						 * Map containing the semantic attributes.
						 */
						semanticAttributes: {
							type: "object"
						},

						/**
						 * The ID of the NavigationPopoverHandler.
						 */
						originalId: {
							type: "string"
						},

						/**
						 * This callback function shows the actual navigation popover. If the <code>navigationTargetsObtained</code> has been
						 * registered, the <code>show</code> function has to be called manually in order to open the navigation popover. Signatures:
						 * <code>show()</code>
						 * <code>show(oMainNavigation, aAvailableActions, oAdditionalContent)</code> Parameters:
						 * <ul>
						 * <li>{sap.ui.comp.navpopover.LinkData | null | undefined} oMainNavigation The main navigation object. With
						 * <code>null</code> the main navigation object will be removed. With <code>undefined</code> the old object will remain.</li>
						 * <li>{sap.ui.comp.navpopover.LinkData[] | [] | undefined} aAvailableActions Array containing the cross application
						 * navigation links. With empty array all available links will be removed. With <code>undefined</code> the old links will
						 * remain.</li>
						 * <li>{sap.ui.core.Control | null | undefined} oAdditionalContent Control that will be displayed in extra content section on
						 * the popover. With <code>null</code> the main extra content object will be removed. With <code>undefined</code> the old
						 * object still remains.</li>
						 * </ul>
						 * <code>show(sMainNavigationId, oMainNavigation, aAvailableActions, oAdditionalContent)</code> Parameters:
						 * <ul>
						 * <li>{string | null | undefined} sMainNavigationId The visible description for the main navigation link. With
						 * <code>null</code>, the description for the main navigation link is calculated using binding context of given source
						 * object (for example SmartLink). With <code>undefined</code> the old description will remain.</li>
						 * <li>{sap.ui.comp.navpopover.LinkData | null | undefined} oMainNavigation The main navigation object. With
						 * <code>null</code> the main navigation object will be removed. With <code>undefined</code> the old object will remain.</li>
						 * <li>{sap.ui.comp.navpopover.LinkData[] | [] | undefined} aAvailableActions Array containing the cross application
						 * navigation links. With empty array all available links will be removed. With <code>undefined</code> the old links will
						 * remain.</li>
						 * <li>{sap.ui.core.Control | null | undefined} oAdditionalContent Control that will be displayed in extra content section on
						 * the popover. With <code>null</code> the main extra content object will be removed. With <code>undefined</code> the old
						 * object still remains.</li>
						 * </ul>
						 */
						show: {
							type: "function"
						}
					}
				},

				/**
				 * This event is fired after a navigation link on the navigation popover has been clicked. This event is only fired, if the user
				 * left-clicks the link. Right-clicking the link and selecting 'Open in New Window' etc. in the context menu does not fire the event.
				 * 
				 * @since 1.36.0
				 */
				innerNavigate: {
					parameters: {
						/**
						 * The UI text shown in the clicked link.
						 */
						text: {
							type: "string"
						},

						/**
						 * The navigation target of the clicked link.
						 */
						href: {
							type: "string"
						},

						/**
						 * The semantic object used to retrieve this target.
						 */
						semanticObject: {
							type: "string"
						},

						/**
						 * Map containing the semantic attributes used to retrieve this target.
						 */
						semanticAttributes: {
							type: "object"
						},

						/**
						 * The ID of the NavigationPopoverHandler.
						 */
						originalId: {
							type: "string"
						}
					}
				}
			}
		}
	});

	NavigationPopoverHandler.prototype.init = function() {
		this._oPopover = null;

		var oModel = new JSONModel({
			semanticObject: undefined,
			semanticObjectLabel: undefined,
			// 'semanticAttributes' of property 'semanticObject' which is default one
			semanticAttributes: undefined,
			appStateKey: undefined,
			mainNavigationId: undefined,
			contact: {
				exists: false,
				bindingPath: undefined,
				expand: undefined,
				select: undefined
			},
			navigationTarget: {
				mainNavigation: undefined,
				availableActionsPersonalizationText: undefined,
				extraContent: undefined
			},
			// Store internally the available links returned from FLP
			availableActions: []
		});
		oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		oModel.setSizeLimit(1000);
		this.setModel(oModel, "$sapuicompNavigationPopoverHandler");
	};

	NavigationPopoverHandler.prototype.applySettings = function(mSettings) {
		ManagedObject.prototype.applySettings.apply(this, arguments);
		// Initialize 'semanticAttributes' after all properties in constructor have been set
		this.setSemanticAttributes(this._calculateSemanticAttributes());
	};

	// ----------------------- Public Methods --------------------------

	/**
	 * Opens the Popover with target navigations in an asynchronous manner. If no content is to show, the Popover will not open.
	 * 
	 * @public
	 */
	NavigationPopoverHandler.prototype.openPopover = function() {
		var that = this;
		return new Promise(function(resolve) {
			that._getPopover().then(function(oPopover) {

				// Popover without content should not be opened.
				if (!oPopover.hasContent()) {
					that._showErrorDialog(sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_DETAILS_NAV_NOT_POSSIBLE"), sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_MSG_NAV_NOT_POSSIBLE"), oPopover);
					// Destroy popover with StableID.
					that._destroyPopover();
					return resolve();
				}

				var oLink = oPopover.getDirectLink();
				if (oLink) {
					that._fireInnerNavigate({
						text: oLink.getText(),
						href: oLink.getHref()
					});
					window.location.href = oLink.getHref();
					return resolve();
				}

				// Delay because addDependent will do an asynchronous re-rendering and the NavigationPopover will immediately close without it
				jQuery.sap.delayedCall(0, this, function() {
					oPopover.show();
					//that._oTimestampEnd = Date.now();
					//jQuery.sap.log.info("Performance measuer: " + (that._oTimestampEnd - that._oTimestampStart));

					return resolve();
				});
			});
		});
	};

	/**
	 * Gets the current value assigned to the field with the NavigationPopoverHandler's semantic object name.
	 * 
	 * @returns {object} The semantic object's value.
	 * @public
	 */
	NavigationPopoverHandler.prototype.getSemanticObjectValue = function() {
		var oSemanticAttributes = this.getSemanticAttributes();
		if (oSemanticAttributes) {
			return oSemanticAttributes[this.getSemanticObject()][this.getSemanticObject()];
		}
		return undefined;
	};

	/**
	 * Gets the stable id, if <code>semanticObject</code> property and component are set.
	 * 
	 * @returns {string | undefined}
	 * @private
	 */
	NavigationPopoverHandler.prototype.getNavigationPopoverStableId = function() {
		var oAppComponent = this._getAppComponent();
		var sSemanticObjectDefault = this.getModel("$sapuicompNavigationPopoverHandler").getProperty("/semanticObject");
		if (!oAppComponent || !sSemanticObjectDefault) {
			return undefined;
		}
		var aSemanticObjects = [
			sSemanticObjectDefault
		].concat(this.getAdditionalSemanticObjects());
		Util.sortArrayAlphabetical(aSemanticObjects);
		var sSemanticObjects = aSemanticObjects.join("--");

		return "sapuicompnavpopoverNavigationPopover---" + oAppComponent.getId() + "---" + sSemanticObjects;
	};

	// ----------------------- Overwrite Methods --------------------------

	NavigationPopoverHandler.prototype.updateBindingContext = function() {
		Control.prototype.updateBindingContext.apply(this, arguments);

		// Update 'semanticAttributes' due to new 'semanticObject'
		this.setSemanticAttributes(this._calculateSemanticAttributes());

		this._destroyPopover();
	};

	NavigationPopoverHandler.prototype.setSemanticObjectLabel = function(sLabel) {
		this.setProperty("semanticObjectLabel", sLabel);

		var oModel = this.getModel("$sapuicompNavigationPopoverHandler");
		oModel.setProperty("/semanticObjectLabel", sLabel);
		return this;
	};

	NavigationPopoverHandler.prototype.setSemanticObject = function(sSemanticObject) {

		this._destroyPopover();

		this.setProperty("semanticObject", sSemanticObject);

		var oModel = this.getModel("$sapuicompNavigationPopoverHandler");
		oModel.setProperty("/semanticObject", sSemanticObject);

		// Update 'semanticAttributes' due to new 'semanticObject'
		this.setSemanticAttributes(this._calculateSemanticAttributes());
		return this;
	};

	NavigationPopoverHandler.prototype.setSemanticAttributes = function(oSemanticAttributes) {
		this.setProperty("semanticAttributes", oSemanticAttributes);

		var oModel = this.getModel("$sapuicompNavigationPopoverHandler");
		oModel.setProperty("/semanticAttributes", oSemanticAttributes);
		return this;
	};

	NavigationPopoverHandler.prototype.setFieldName = function(sFieldName) {
		this.setProperty("fieldName", sFieldName);

		// Update 'semanticAttributes' due to new 'fieldName'
		this.setSemanticAttributes(this._calculateSemanticAttributes());

		return this;
	};

	NavigationPopoverHandler.prototype.setControl = function(oControl) {
		this.setAssociation("control", oControl);

		this.setModel(oControl.getModel());

		// TODO: SmartTable -> ControlProvider for each ObjectIdentifier there is only one NavigationPopoverHandler which gets set a new 'control'
		this._destroyPopover();

		this._updateSemanticObjectController();

		// Update 'semanticAttributes' due to new 'control'
		this.setSemanticAttributes(this._calculateSemanticAttributes());
		return this;
	};

	NavigationPopoverHandler.prototype.setMapFieldToSemanticObject = function(bMapFieldToSemanticObject) {
		this.setProperty("mapFieldToSemanticObject", bMapFieldToSemanticObject);

		// Update 'semanticAttributes' due to new 'mapFieldToSemanticObject'
		this.setSemanticAttributes(this._calculateSemanticAttributes());
		return this;
	};

	NavigationPopoverHandler.prototype.setSemanticObjectController = function(oSemanticObjectController) {
		this._updateSemanticObjectController(oSemanticObjectController);

		// Update 'semanticAttributes' due to new 'semanticObjectController'
		this.setSemanticAttributes(this._calculateSemanticAttributes());
		return this;
	};

	NavigationPopoverHandler.prototype.exit = function() {
		this._destroyPopover();

		// Disconnect from SemanticObjectController
		if (this.getSemanticObjectController()) {
			this.getSemanticObjectController().unregisterControl(this);
		}

		// destroy model and its data
		if (this.getModel("$sapuicompNavigationPopoverHandler")) {
			this.getModel("$sapuicompNavigationPopoverHandler").destroy();
		}
	};

	// -------------------------- Private Methods ------------------------------------

	/**
	 * @private
	 */
	NavigationPopoverHandler.prototype._initModel = function() {
		var that = this;

		// Determine 'semanticAttributes' as it is the latest point in time before passing it to the applications
		this.setSemanticAttributes(this._calculateSemanticAttributes());
		var oSemanticAttributes = this.getSemanticAttributes();
		var sSemanticObjectDefault = this.getSemanticObject();
		var aAdditionalSemanticObjects = this.getAdditionalSemanticObjects();

		// Priority rules: 1. own contact annotation path 2. contact annotation path of SemanticObjectController
		var sContactAssociationPath = this.getContactAnnotationPath();
		if (sContactAssociationPath === undefined && this.getSemanticObjectController() && this.getSemanticObjectController().getContactAnnotationPaths() && this.getSemanticObjectController().getContactAnnotationPaths()[this.getFieldName()] !== undefined) {
			sContactAssociationPath = this.getSemanticObjectController().getContactAnnotationPaths()[this.getFieldName()];
		}
		var oControl = sap.ui.getCore().byId(this.getControl());
		var sBindingPath = oControl && oControl.getBindingContext() ? oControl.getBindingContext().getPath() : null;
		var oODataModel = this.getModel();
		var oComponent = this._getComponent();

		var sId = oControl && oControl.getId();
		var sMainNavigationId, sSemanticObjectValue;

		// Default: show 'Define Links' link
		var bEnableAvailableActionsPersonalization = this.getEnableAvailableActionsPersonalization();
		// Application can overwrite to not show 'Define Links' link
		if (this.getSemanticObjectController() && this.getSemanticObjectController().getEnableAvailableActionsPersonalization() && this.getSemanticObjectController().getEnableAvailableActionsPersonalization()[this.getFieldName()] !== undefined) {
			bEnableAvailableActionsPersonalization = this.getSemanticObjectController().getEnableAvailableActionsPersonalization()[this.getFieldName()];
		}

		return new Promise(function(resolve) {

			// 1. Fire 'beforePopoverOpens' event. Here 'semanticAttributes' can be changed and 'appStateKey' can be set by application.
			that._fireBeforePopoverOpens(oSemanticAttributes, sSemanticObjectDefault, sId).then(function(oResultFromOpen) {
				// Set first semanticAttributes
				that.setSemanticAttributes(oResultFromOpen.semanticAttributes);
				// And then depending on semanticAttributes set the 'sMainNavigationId'
				sMainNavigationId = sSemanticObjectValue = that.getSemanticObjectValue();

				that.getModel("$sapuicompNavigationPopoverHandler").setProperty("/appStateKey", oResultFromOpen.appStateKey);

				// 2. Create Form reading OData Metadata with BindingContext and get navigationTargets from UShell service
				that._prepareFormsAndTargets(sSemanticObjectDefault, aAdditionalSemanticObjects, oResultFromOpen.appStateKey, oComponent, oResultFromOpen.semanticAttributes, sMainNavigationId, oODataModel, sBindingPath, sContactAssociationPath, sSemanticObjectValue).then(function(aResultFormsAndTargets) {

					// 3. Fire 'navigationTargetsObtained' event. Here 'Form' and 'navigationTargets' can be changed by application.
					that._fireNavigationTargetsObtained(sMainNavigationId, sSemanticObjectDefault, oResultFromOpen.semanticAttributes, sId, aResultFormsAndTargets[0].forms, aResultFormsAndTargets[1]).then(function(oResultFromNavigationObtained) {

						var oModel = that.getModel("$sapuicompNavigationPopoverHandler");
						oModel.setProperty("/mainNavigationId", oResultFromNavigationObtained.mainNavigationId);
						oModel.setProperty("/navigationTarget/mainNavigation", oResultFromNavigationObtained.mainNavigation);
						oModel.setProperty("/navigationTarget/extraContent", oResultFromNavigationObtained.extraContent);
						oModel.setProperty("/contact/exists", !!aResultFormsAndTargets[0].forms.length);
						oModel.setProperty("/contact/bindingPath", aResultFormsAndTargets[0].bindingPath);
						oModel.setProperty("/contact/expand", aResultFormsAndTargets[0].expand);
						oModel.setProperty("/contact/select", aResultFormsAndTargets[0].select);
						var aAvailableActions = that._updateVisibilityOfAvailableActions(LinkData.convert2Json(oResultFromNavigationObtained.availableActions));
						oModel.setProperty("/availableActions", aAvailableActions);
						oModel.setProperty("/navigationTarget/availableActionsPersonalizationText", bEnableAvailableActionsPersonalization ? sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_DEFINE_LINKS") : undefined);

						return resolve();
					});
				});
			});
		});
	};

	/**
	 * @private
	 */
	NavigationPopoverHandler.prototype._initPopover = function() {
		var that = this;

		return new Promise(function(resolve) {
			that._initModel().then(function() {
				var oModel = that.getModel("$sapuicompNavigationPopoverHandler");

				var oPopover = that._createPopover();

				// Read data only if needed
				if (oModel.getProperty("/contact/exists")) {
					var oControl = sap.ui.getCore().byId(that.getControl());
					var sBindingPath = oControl && oControl.getBindingContext() ? oControl.getBindingContext().getPath() : null;

					if (oModel.getProperty("/contact/bindingPath")) {
						oPopover.bindContext({
							path: oModel.getProperty("/contact/bindingPath"),
							events: {
								change: function() {
									oPopover.invalidate();
								}
							}
						});
					} else if (sBindingPath) {
						oPopover.bindContext({
							path: sBindingPath,
							parameters: {
								expand: oModel.getProperty("/contact/expand"),
								select: oModel.getProperty("/contact/select")
							},
							events: {
								change: function() {
									oPopover.invalidate();
								}
							}
						});
					}
				}
				return resolve(oPopover);
			});
		});
	};

	/**
	 * @private
	 */
	NavigationPopoverHandler.prototype._getPopover = function() {
		var that = this;
		return new Promise(function(resolve) {
			if (!that._oPopover) {
				that._initPopover().then(function(oPopover) {
					return resolve(oPopover);
				});
			} else {
				return resolve(that._oPopover);
			}
		});
	};

	/**
	 * @private
	 */
	NavigationPopoverHandler.prototype._destroyPopover = function() {
		if (this._oPopover) {
			this._oPopover.destroy();
			this._oPopover = null;
		}
	};

	/**
	 * Creates the NavigationPopover.
	 * 
	 * @private
	 */
	NavigationPopoverHandler.prototype._createPopover = function() {
		if (this._oPopover) {
			return this._oPopover;
		}
		var oModel = this.getModel("$sapuicompNavigationPopoverHandler");

		//this._oTimestampStart = Date.now();

		this._oPopover = new NavigationPopover(this.getNavigationPopoverStableId(), {
			title: "{$sapuicompNavigationPopoverHandler>/semanticObjectLabel}",
			mainNavigationId: "{$sapuicompNavigationPopoverHandler>/mainNavigationId}",
			semanticObjectName: "{$sapuicompNavigationPopoverHandler>/semanticObject}",
			semanticAttributes: "{$sapuicompNavigationPopoverHandler>/semanticAttributes}",
			appStateKey: "{$sapuicompNavigationPopoverHandler>/appStateKey}",
			mainNavigation: oModel.getProperty("/navigationTarget/mainNavigation"),
			availableActions: {
				path: '$sapuicompNavigationPopoverHandler>/availableActions',
				templateShareable: false,
				template: new LinkData({
					key: "{$sapuicompNavigationPopoverHandler>key}",
					href: "{$sapuicompNavigationPopoverHandler>href}",
					text: "{$sapuicompNavigationPopoverHandler>text}",
					target: "{$sapuicompNavigationPopoverHandler>target}",
					description: "{$sapuicompNavigationPopoverHandler>description}",
					visible: "{$sapuicompNavigationPopoverHandler>visible}"
				})
			},
			extraContent: oModel.getProperty("/navigationTarget/extraContent") ? oModel.getProperty("/navigationTarget/extraContent").getId() : undefined,
			availableActionsPersonalizationText: oModel.getProperty("/navigationTarget/availableActionsPersonalizationText"),
			source: this.getControl(),
			component: this._getComponent(),
			// targetsObtained: jQuery.proxy(this._onTargetsObtained, this), // DEPRECATED
			navigate: jQuery.proxy(this._onNavigate, this),
			availableActionsPersonalizationPress: jQuery.proxy(this._onAvailableActionsPersonalizationPress, this),
			afterClose: jQuery.proxy(this._destroyPopover, this)
		});

		// JSONModel
		this._oPopover.setModel(oModel, "$sapuicompNavigationPopoverHandler");
		// // ODataModel
		// this._oPopover.setModel(this.getModel());

		var oControl = sap.ui.getCore().byId(this.getControl());
		if (oControl) {
			oControl.addDependent(this._oPopover);
		}

		return this._oPopover;
	};

	/**
	 * @private
	 */
	NavigationPopoverHandler.prototype._prepareFormsAndTargets = function(sSemanticObjectDefault, aAdditionalSemanticObjects, sAppStateKey, oComponent, oSemanticAttributes, sMainNavigationId, oODataModel, sBindingPath, sContactAssociationPath, sSemanticObjectValue) {
		var oPromiseForm = new Promise(function(resolveForms) {
			Util.retrieveContactAnnotationData(oODataModel, sBindingPath, sContactAssociationPath).then(function(oContactAnnotationData) {
				var oParsedJson = Util.parseContactAnnotation(oContactAnnotationData);
				return resolveForms({
					bindingPath: oContactAnnotationData.entitySet ? "/" + oContactAnnotationData.entitySet + "('" + sSemanticObjectValue + "')" : undefined,
					expand: oParsedJson.expand,
					select: oParsedJson.select,
					forms: Util.createContactDetailForms(oParsedJson.groups)
				});
			});
		});
		var oPromiseNavigationTargets = new Promise(function(resolveTargets) {
			Util.retrieveNavigationTargets(sSemanticObjectDefault, aAdditionalSemanticObjects, sAppStateKey, oComponent, oSemanticAttributes, sMainNavigationId).then(function(oNavigationTargets) {
				return resolveTargets(oNavigationTargets);
			});
		});
		return Promise.all([
			oPromiseForm, oPromiseNavigationTargets
		]);
	};

	/**
	 * @private
	 */
	NavigationPopoverHandler.prototype._fireBeforePopoverOpens = function(oSemanticAttributes, sSemanticObjectDefault, sId) {
		var that = this;
		return new Promise(function(resolve) {
			var oResult = {
				semanticAttributes: oSemanticAttributes,
				appStateKey: undefined
			};
			if (!that.hasListeners("beforePopoverOpens")) {
				return resolve(oResult);
			}

			that.fireBeforePopoverOpens({
				originalId: sId,
				semanticObject: sSemanticObjectDefault,
				semanticAttributes: oSemanticAttributes ? oSemanticAttributes[sSemanticObjectDefault] : oSemanticAttributes,
				semanticAttributesOfSemanticObjects: oSemanticAttributes,
				setSemanticAttributes: function(aSemanticAttributes, sSemanticObject) {
					sSemanticObject = sSemanticObject || sSemanticObjectDefault;
					oResult.semanticAttributes = oResult.semanticAttributes || {};
					oResult.semanticAttributes[sSemanticObject] = aSemanticAttributes;
				},
				setAppStateKey: function(sAppStateKey) {
					oResult.appStateKey = sAppStateKey;
				},
				open: function() {
					return resolve(oResult);
				}
			});
		});
	};

	/**
	 * @private
	 */
	NavigationPopoverHandler.prototype._fireNavigationTargetsObtained = function(sMainNavigationId, sSemanticObjectDefault, oSemanticAttributes, sId, aForms, oNavigationTargets) {
		var that = this;

		return new Promise(function(resolve) {
			var oResult = {
				mainNavigationId: sMainNavigationId,
				mainNavigation: oNavigationTargets.mainNavigation,
				availableActions: oNavigationTargets.availableActions,
				ownNavigation: oNavigationTargets.ownNavigation,
				extraContent: aForms.length ? new VBox({
					items: aForms
				}) : undefined
			};
			if (!that.hasListeners("navigationTargetsObtained")) {
				return resolve(oResult);
			}

			that.fireNavigationTargetsObtained({
				mainNavigation: oNavigationTargets.mainNavigation,
				actions: oNavigationTargets.availableActions,
				ownNavigation: oNavigationTargets.ownNavigation,
				popoverForms: aForms,
				semanticObject: sSemanticObjectDefault,
				semanticAttributes: oSemanticAttributes ? oSemanticAttributes[sSemanticObjectDefault] : oSemanticAttributes,
				originalId: sId,
				show: function(sMainNavigationId, oMainNavigation, aAvailableActions, oAdditionalContent) {
					// Due to backward compatibility we have to support the use-case where only 3 parameters can be passed. The meaning for these
					// parameters is: [oMainNavigation, aAvailableActions, oAdditionalContent]
					if (!(typeof sMainNavigationId === "string" || oMainNavigation instanceof sap.ui.comp.navpopover.LinkData || jQuery.isArray(aAvailableActions)) && oAdditionalContent === undefined) {
						oAdditionalContent = aAvailableActions;
						aAvailableActions = oMainNavigation;
						oMainNavigation = sMainNavigationId;
						sMainNavigationId = undefined;
					}

					if (sMainNavigationId !== undefined && sMainNavigationId !== null) {
						oResult.mainNavigationId = sMainNavigationId;
					}
					if (oMainNavigation !== undefined) {
						oResult.mainNavigation = oMainNavigation;
					}
					if (aAvailableActions) {
						oResult.availableActions = aAvailableActions;
					}

					if (oAdditionalContent) {
						oResult.extraContent = oAdditionalContent;
					}
					return resolve(oResult);
				}
			});
		});
	};

	/**
	 * Eventhandler for NavigationPopover's navigate event, exposes event
	 * 
	 * @param {object} oEvent The event parameters
	 * @private
	 */
	NavigationPopoverHandler.prototype._onNavigate = function(oEvent) {
		var aParameters = oEvent.getParameters();

		this._fireInnerNavigate({
			text: aParameters.text,
			href: aParameters.href
		});
	};

	/**
	 * @private
	 */
	NavigationPopoverHandler.prototype._onAvailableActionsPersonalizationPress = function(oEvent) {
		var that = this;
		var oNavigationPopover = oEvent.getSource();
		var aVisibilityOfAvailableActionsOld = oNavigationPopover.getAvailableActions().map(function(oAvailablAction) {
			return {
				availableAction: oAvailablAction,
				visible: oAvailablAction.getVisible()
			};
		});

		var aMItems = Util.availableAction2MItems(oNavigationPopover);
		var aMColumnsItems = Util.availableAction2MColumnsItems(oNavigationPopover);

		this._oPopover.setModal(true);

		new SelectionController().openSelectionDialog(aMItems, aMColumnsItems, oNavigationPopover).then(function(oMDiffLinks) {
			that._oPopover.setModal(false);

			Factory.getService("FlexConnector").createAndSaveChangesForControl(oMDiffLinks, oNavigationPopover).then(function() {

			})['catch'](function(oError) {
				aVisibilityOfAvailableActionsOld.forEach(function(oOld) {
					oOld.availableAction.setVisible(oOld.visible);
					oNavigationPopover._syncAvailableAction(oOld.availableAction);
				});
				jQuery.sap.log.error("Changes could not be saved in LRep: " + oError);
			});

		})['catch'](function() {
			that._oPopover.setModal(false);
		});
	};

	/**
	 * @private
	 */
	NavigationPopoverHandler.prototype._fireInnerNavigate = function(aParameters) {
		var oControl = sap.ui.getCore().byId(this.getControl());
		var sSemanticObjectDefault = this.getSemanticObject();
		var oSemanticAttributes = this.getSemanticAttributes();

		this.fireInnerNavigate({
			text: aParameters.text,
			href: aParameters.href,
			originalId: oControl ? oControl.getId() : undefined,
			semanticObject: sSemanticObjectDefault,
			semanticAttributes: oSemanticAttributes ? oSemanticAttributes[sSemanticObjectDefault] : oSemanticAttributes
		});
	};

	/**
	 * Finds the parental component.
	 * 
	 * @private
	 * @returns {sap.ui.core.Component | null} the found parental component or null
	 */
	NavigationPopoverHandler.prototype._getComponent = function() {
		var oControl = sap.ui.getCore().byId(this.getControl());
		if (!oControl) {
			return null;
		}
		var oParent = oControl.getParent();
		while (oParent) {
			if (oParent instanceof sap.ui.core.Component) {
				// special case for SmartTemplating to reach the real appComponent
				if (oParent && oParent.getAppComponent) {
					oParent = oParent.getAppComponent();
				}
				return oParent;
			}
			oParent = oParent.getParent();
		}
		return null;
	};

	NavigationPopoverHandler.prototype._getAppComponent = function() {
		return Factory.getService("FlexConnector").getAppComponentForControl(sap.ui.getCore().byId(this.getControl()));
	};

	/**
	 * Gets the current binding context and creates a copied map where all empty and unnecessary data is deleted from.
	 * 
	 * @private
	 */
	NavigationPopoverHandler.prototype._calculateSemanticAttributes = function() {
		var oControl = sap.ui.getCore().byId(this.getControl());
		var oBindingContext = this.getBindingContext() || (oControl && oControl.getBindingContext());
		if (!oBindingContext) {
			return null;
		}

		var oResult = {};
		var sCurrentField = this.getFieldName();
		var oContext = oBindingContext.getObject(oBindingContext.getPath());

		for ( var sAttributeName in oContext) {
			// Ignore metadata
			if (sAttributeName === "__metadata") {
				continue;
			}
			// Ignore empty values
			if (!oContext[sAttributeName]) {
				continue;
			}

			// Map attribute name by semantic object name
			var sAttributeNameMapped = sAttributeName;
			if (this.getMapFieldToSemanticObject()) {
				sAttributeNameMapped = this._mapFieldToSemanticObject(sAttributeName);
			}

			// If more then one attribute fields maps to the same semantic object we take the value of the current binding path.
			var oAttributeValue = oContext[sAttributeName];
			if (oResult[sAttributeNameMapped]) {
				if (oContext[sCurrentField]) {
					oAttributeValue = oContext[sCurrentField];
				}
			}

			// Copy the value replacing the attribute name by semantic object name
			oResult[sAttributeNameMapped] = oAttributeValue;
		}

		// Multiply the result by all defined semantic objects
		var oResults = {};
		[
			"", this.getSemanticObject()
		].concat(this.getAdditionalSemanticObjects()).forEach(function(sSemanticObject) {
			oResults[sSemanticObject] = oResult;
		});
		return oResults;
	};

	/**
	 * Maps the given field name to the corresponding semantic object.
	 * 
	 * @param {string} sFieldName The field name which should be mapped to a semantic object
	 * @returns {string} Corresponding semantic object, or the original field name if semantic object is not available.
	 * @private
	 */
	NavigationPopoverHandler.prototype._mapFieldToSemanticObject = function(sFieldName) {
		// For own field return the semantic object if exists
		// Note: if the field is assigned to another semantic object in 'SemanticObject' annotation than in the 'semanticObject' property then the
		// property 'semanticObject' is preferred.
		if (this.getFieldName() === sFieldName && this.getSemanticObject()) {
			return this.getSemanticObject();
		}
		var oSOController = this.getSemanticObjectController();
		if (!oSOController) {
			return sFieldName;
		}
		var oMap = oSOController.getFieldSemanticObjectMap();
		if (!oMap) {
			return sFieldName;
		}
		return oMap[sFieldName] || sFieldName;
	};

	/**
	 * @private
	 */
	NavigationPopoverHandler.prototype._updateSemanticObjectController = function(oControllerNew) {
		// In case that 'semantiObjectController' has not been set, check if parent has a SemanticObjectController and take it as
		// 'semanticObjectController' property. This is especially needed when SmartLink is manually defined as column in view.xml and
		// SemanticObjectController is defined at the SmartTable. It is also needed in case of SmartField embedded into SmartForm which provides
		// 'semanticObjectController' aggregation.
		var oControllerOld = this.getProperty("semanticObjectController");
		var oControl = sap.ui.getCore().byId(this.getControl());
		oControllerNew = oControllerNew || this.getSemanticObjectController() || this._getSemanticObjectControllerOfControl(oControl);

		if (oControllerNew && oControl && oControllerNew.isControlRegistered(oControl)) {
			oControllerNew.unregisterControl(this);
		}

		if (oControllerNew !== oControllerOld && oControllerOld) {
			oControllerOld.unregisterControl(this);
		}

		this.setProperty("semanticObjectController", oControllerNew);

		// Register NavigationPopoverHandler if the SmartLink was not registered. In case of ObjectIdentifier the 'control' property is set later on.
		// In this case the 'control' is of type ObjectIdentifier.
		if (oControllerNew && !oControllerNew.isControlRegistered(oControl)) {
			oControllerNew.registerControl(this);
		}
	};

	/**
	 * @private
	 */
	NavigationPopoverHandler.prototype._getSemanticObjectControllerOfControl = function(oControl) {
		if (!oControl) {
			return undefined;
		}
		var oSemanticObjectController;
		var oParent = oControl.getParent();
		while (oParent) {
			if (oParent.getSemanticObjectController) {
				oSemanticObjectController = oParent.getSemanticObjectController();
				if (oSemanticObjectController) {
					this.setSemanticObjectController(oSemanticObjectController);
					break;
				}
			}
			oParent = oParent.getParent();
		}
		return oSemanticObjectController;
	};

	/**
	 * @private
	 */
	NavigationPopoverHandler.prototype._updateVisibilityOfAvailableActions = function(aAvailableActions) {

		// In case of many links do not show them as 'Related Apps'
		if (aAvailableActions.length > 10) {
			aAvailableActions.forEach(function(oAvailableAction) {
				oAvailableAction.visible = false;
			});
		}
		return aAvailableActions;
	};

	/**
	 * @private
	 */
	NavigationPopoverHandler.prototype._showErrorDialog = function(sText, sTitle, oControl) {
		MessageBox.show(sText, {
			icon: MessageBox.Icon.ERROR,
			title: sTitle,
			actions: [
				sap.m.MessageBox.Action.CLOSE
			],
			styleClass: (oControl.$() && oControl.$().closest(".sapUiSizeCompact").length) ? "sapUiSizeCompact navigationPopoverErrorDialog" : "navigationPopoverErrorDialog"
		});
	};

	return NavigationPopoverHandler;

}, /* bExport= */true);
