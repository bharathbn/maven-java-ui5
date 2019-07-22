/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.smartfield.SmartLabel.
sap.ui.define([
	'jquery.sap.global', 'sap/m/Label', 'sap/m/LabelRenderer', 'sap/ui/comp/library', './BindingUtil', "./AnnotationHelper", "./SmartField"
], function(jQuery, Label, LabelRenderer, library, BindingUtil, AnnotationHelper, SmartField) {
	"use strict";

	/**
	 * Constructor for a new smartfield/SmartLabel.
	 * 
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The SmartLabel control extends {@link sap.m.Label sap.m.Label} and displays the label for
	 *        {@link sap.ui.comp.smartfield.SmartField SmartField}. It uses the annotations <code>sap:label</code> or
	 *        <code>com.sap.vocabularies.Common.v1.Label</code> for the label text and <code>sap:quickinfo</code> or
	 *        <code>com.sap.vocabularies.Common.v1.QuickInfo</code> for the tooltip. The mandatory indicator is obtained from the SmartField
	 *        control. The association with a SmartField control is built using the setLabelFor method.
	 * @extends sap.m.Label
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smartfield.SmartLabel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SmartLabel = Label.extend("sap.ui.comp.smartfield.SmartLabel", /** @lends sap.ui.comp.smartfield.SmartLabel.prototype */
	{
		metadata: {

			library: "sap.ui.comp"
		},
		renderer: LabelRenderer.render
	});

	SmartLabel.prototype.init = function() {

		this._sSmartFieldId = null;
		this._bMetaDataApplied = false;
		this._fInnerControlsCreatedHandlers = null;
	};

	/**
	 * Binds the required property to mandatory property of the assigned SmartField.
	 * 
	 * @private
	 */
	SmartLabel.prototype.bindRequiredPropertyToSmartField = function() {
		var oInfo = null, oBinding = null;

		var oSmartField = this._getField();

		if (oSmartField && oSmartField.getContextEditable() && oSmartField.getEditable()) {
			oBinding = new BindingUtil();
			oInfo = oSmartField.getBindingInfo("mandatory");
			if (oInfo) {
				if (!this.isBound("required")) {
					this.bindProperty("required", oBinding.toBinding(oInfo));
				}
			} else {
				this.setRequired(oSmartField.getMandatory());
			}
		} else {
			this.unbindProperty("required");
			this.setRequired(false);
		}
	};

	/**
	 * Binds the label properties.
	 * 
	 * @private
	 */
	SmartLabel.prototype._bindProperties = function() {

		var oSmartField = this._getField();

		if (oSmartField) {
			var oBinding = new BindingUtil();

			var oInfo = oSmartField.getBindingInfo("visible");
			if (oInfo) {
				this.bindProperty("visible", oBinding.toBinding(oInfo));
			} else {
				this.setVisible(oSmartField.getVisible());
			}

			this.bindRequiredPropertyToSmartField();

			oInfo = oSmartField.getBindingInfo("textLabel");
			if (oInfo) {
				this.bindProperty("text", oBinding.toBinding(oInfo));
			} else {
				if (!this.getBindingInfo("text")) {
					this.setText(oSmartField.getTextLabel());
				}
			}

			oInfo = oSmartField.getBindingInfo("tooltipLabel");
			if (oInfo) {
				this.bindProperty("tooltip", oBinding.toBinding(oInfo));
			} else {
				this.setTooltip(oSmartField.getTooltipLabel());
			}
		}

	};

	/**
	 * Triggers the obtainment of the meta data.
	 * 
	 * @private
	 */
	SmartLabel.prototype.getLabelInfo = function() {

		var oMetaDataProperty, oLabelInfo;

		var oSmartField = this._getField();

		if (oSmartField) {

			this._bindProperties();

			oMetaDataProperty = oSmartField.getDataProperty();
			if (oMetaDataProperty) {
				oLabelInfo = this._getLabelInfo(oMetaDataProperty);
				if (oLabelInfo) {
					if (oLabelInfo.text) {
						this._setProperty(this, "text", oLabelInfo.text);
					}
					if (oLabelInfo.quickinfo) {
						this._setProperty(this, "tooltip", oLabelInfo.quickinfo);
					}
				}
			}
		}
	};

	SmartLabel.prototype._setProperty = function(oObj, sProperty, sValue) {

		var sProp;

		if (oObj && sProperty) {

			if (sValue.match(/{@i18n>.+}/gi)) {
				oObj.bindProperty(sProperty, sValue.substring(1, sValue.length - 1));
			} else {
				sProp = sProperty.substring(0, 1).toUpperCase() + sProperty.substring(1);
				if (!oObj.getBindingInfo(sProperty) && !oObj["get" + sProp]()) {
					oObj["set" + sProp](sValue);
				}
			}
		}
	};

	/**
	 * Assigns SmartField.
	 * 
	 * @param {sap.ui.comp.smartfield.SmartField} oSmartField The associated SmartField control
	 * @public
	 */
	SmartLabel.prototype.setLabelFor = function(oSmartField) {

		if (oSmartField) {

			if (typeof oSmartField === 'string') {
				this._sSmartFieldId = oSmartField;
			} else {
				this._sSmartFieldId = oSmartField.getId();
			}

			this._setLabelFor();

			sap.m.Label.prototype.setLabelFor.apply(this, [
				oSmartField
			]);
		}
	};

	SmartLabel.prototype._getField = function() {

		if (this._sSmartFieldId) {
			return sap.ui.getCore().byId(this._sSmartFieldId);
		}

		return null;
	};

	SmartLabel.prototype._setLabelFor = function() {

		var oDataProperty, oSmartField;

		oSmartField = this._getField();
		if (oSmartField && !this._bMetaDataApplied) {
			this._bMetaDataApplied = true;
			if (oSmartField.getDataProperty) {
				oDataProperty = oSmartField.getDataProperty();
				if (oDataProperty) {
					this.getLabelInfo();
				} else {
					oSmartField.attachInitialise(jQuery.proxy(this.getLabelInfo, this));
					oSmartField.attachEvent("_change", function(oEvent) {
						if (oEvent.getParameter("name") === "textLabel") {
							this.getLabelInfo();
						} else if (oEvent.getParameter("name") === "mandatory") {
							if (this.isBound("required")) {
								this.updateProperty("required");
							}
						}
					}.bind(this));
				}

				this._lateUpdateLabelFor(oSmartField);
			}
		}
	};

	SmartLabel.prototype.updateLabelFor = function(aControls) {
		var aInnerControls = aControls.slice(0);
		if (aInnerControls && aInnerControls.length > 0) {
			sap.m.Label.prototype.setLabelFor.apply(this, [
				aInnerControls[0]
			]);
			aInnerControls.splice(0, 1);

			this.updateAriaLabeledBy(aInnerControls);
		}
	};

	SmartLabel.prototype.updateAriaLabeledBy = function(aControls) {

		if (aControls) {
			for (var i = 0; i < aControls.length; i++) {
				if (aControls[i].addAriaLabelledBy) {
					aControls[i].addAriaLabelledBy(this);
				}
			}
		}
	};

	SmartLabel.prototype.setText = function(sValue) {
		this.setProperty("text", sValue);
	};

	/**
	 * Retrieves all label related data from the OData property of a field
	 * 
	 * @param {object} oProperty the definition of a property of an OData entity.
	 * @returns {object} describing label specific data
	 * @private
	 */
	SmartLabel.prototype._getLabelInfo = function(oProperty) {

		var oAnnatotionHelper = new AnnotationHelper();

		if (oProperty && oProperty.property) {
			return {
				text: oAnnatotionHelper.getLabel(oProperty.property),
				quickinfo: oAnnatotionHelper.getQuickInfo(oProperty.property)
			};
		}
	};

	SmartLabel.prototype._delayUpdateLabelFor = function(oSmartField) {
		var that = this;
		if (oSmartField.attachInnerControlsCreated && !this._fInnerControlsCreatedHandlers) {
			this._fInnerControlsCreatedHandlers = function(oEvent) {
				that.updateLabelFor(oEvent.getParameters());
			};

			oSmartField.attachInnerControlsCreated(this._fInnerControlsCreatedHandlers);
		}
	};

	SmartLabel.prototype._lateUpdateLabelFor = function(oSmartField) {

		var aInnerControls;

		if (oSmartField && oSmartField instanceof SmartField) {
			aInnerControls = oSmartField.getInnerControls();
			if (aInnerControls && (aInnerControls.length > 0)) {
				this.updateLabelFor(aInnerControls);
			} else {
				this._delayUpdateLabelFor(oSmartField);
			}
		}
	};

	SmartLabel.prototype.onBeforeRendering = function() {

		if (this._sSmartFieldId) {
			var oSmartField = this._getField();

			if (!this._bMetaDataApplied || (oSmartField && oSmartField instanceof SmartField && oSmartField.getMandatory() != this.getRequired())) {
				this._bMetaDataApplied = false;
				if (this.isBound("required")) {
					this.unbindProperty("required");
				}
				this._setLabelFor();

				if (oSmartField.getId() === this.getLabelFor()) {
					this._lateUpdateLabelFor(oSmartField);
				}
			}
		}
	};

	/**
	 * Cleans up the resources associated with this element and all its children. After an element has been destroyed, it can no longer be used on the
	 * UI. Applications should call this method if they don't need the element any longer.
	 * 
	 * @param {boolean} bSuppressInvalidate If set to <code>true</code>, UI element is not marked for redraw
	 * @public
	 */
	SmartLabel.prototype.destroy = function(bSuppressInvalidate) {

		if (this._fInnerControlsCreatedHandlers) {
			var oSmartField = this._getField();
			if (oSmartField && oSmartField.detachInnerControlsCreated) {
				oSmartField.detachInnerControlsCreated(this._fInnerControlsCreatedHandlers);
				this._fInnerControlsCreatedHandlers = null;
			}
		}
		this._sSmartFieldId = null;

		Label.prototype.destroy.apply(this, [
			bSuppressInvalidate
		]);
	};

	return SmartLabel;

}, /* bExport= */true);
