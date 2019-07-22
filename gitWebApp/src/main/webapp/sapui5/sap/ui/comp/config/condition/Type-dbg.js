/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides sap.ui.comp.config.condition.Type.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/base/EventProvider', 'sap/ui/model/json/JSONModel', 'sap/m/Select'
], function(jQuery, EventProvider, JSONModel, Select) {
	"use strict";

	var Type = EventProvider.extend("sap.ui.comp.config.condition.Type", /* @lends "sap.ui.comp.config.condition.Type.prototype */ {
		constructor : function(sFieldName, oFilterProvider, oFieldMetadata) {
			EventProvider.call(this);
			this.oFilterProvider = oFilterProvider;
			//create basic data
			var oData = {
					condition: {
						operation: "",
						value1: null,
						value2: null,
						key: sFieldName
					},
					operations: [],
					controls: [],
					currentoperation: {},
					pending: false
			};
			this.oModel = new JSONModel(oData);

			var fCheckUpdate = this.oModel.checkUpdate;
			this.oModel.suspend = function() {
				this.bSuspended = true;
				this.checkUpdate = function(){};
			};
			this.oModel.resume = function() {
				this.bSuspended = false;
				this.checkUpdate = fCheckUpdate;
				this.checkUpdate();
			};

			this.oContext = this.oModel.getContext("/");
			this.oConditionContext = this.oModel.getContext("/condition");
			this.sFieldName = sFieldName;
			var oOperationChangeBinding = this.oModel.bindProperty("operation", this.oConditionContext),
				that = this;
			oOperationChangeBinding.attachChange(function() {
				var sOperation = that.oModel.getProperty("operation", that.getConditionContext()),
					oOperation = that.getOperation(sOperation);
				
				if (!that.bIgnoreBindingChange) {				
					var aDefaultValues = that.getDefaultValues(oOperation);
					that.setDefaultValues(aDefaultValues[0], aDefaultValues[1]);
				}
				
				that.setControls([]); //remove the control from the model, before we can create new controls for the current operation 
				that.setControls(that.getControls(oOperation));
				
				if (oOperation) {
					if (oOperation.getValueList) {
						oOperation.valueList = oOperation.getValueList();
					}
					that.oModel.setProperty("/currentoperation", oOperation);
				}
				if (!that.bIgnoreBindingChange) {				
					that.serialize();
				}
			});
			var oValueChangeBinding = this.oModel.bindProperty("value1", this.oConditionContext);
			oValueChangeBinding.attachChange(function() {
				if (!that.bIgnoreBindingChange) {
					that.serialize();
				}
			});
			var oValue2ChangeBinding = this.oModel.bindProperty("value2", this.oConditionContext);
			oValue2ChangeBinding.attachChange(function() {
				if (!that.bIgnoreBindingChange) {
					that.serialize();
				}
			});

			var oPendingChangeBinding = this.oModel.bindProperty("pending", this.oContext);
			oPendingChangeBinding.attachChange(function() {
				if (that.bAsync) {
					if (that._iPendingTimer) {
						jQuery.sap.clearDelayedCall(that._iPendingTimer);
					}
					that._iPendingTimer = jQuery.sap.delayedCall(10, that, "fireEvent",["PendingChange",{oSource: that, pending: that.oModel.getProperty("/pending")}]);
				}
			});
			this.oOperationSelect = null;
			this.oFieldMetadata = oFieldMetadata;
			this.oOperationFilter  = null;
			this.bAsync = false;
		}
	});

	Type._createStableId = function(oInstance, suffix) {
		if (oInstance && oInstance.oFilterProvider && oInstance.oFieldMetadata) {
			return oInstance.oFilterProvider._createFilterControlId(oInstance.oFieldMetadata) + (suffix ? suffix : "");
		} else {
			return undefined;
		}
	};
	
	Type.getTranslatedText = function(sTextKey, sResourceBundle) {
		if (typeof sTextKey === "object") {
			sResourceBundle = sTextKey.bundle;
			sTextKey = sTextKey.key;
		}
		if (!sResourceBundle) {
			sResourceBundle = "sap.ui.comp";
		}
		return sap.ui.getCore().getLibraryResourceBundle(sResourceBundle).getText(sTextKey) || sTextKey;
	};
	Type.prototype.getTranslatedText = Type.getTranslatedText;

	Type.prototype.applySettings = function(oSettings) {
		if (oSettings && oSettings.operations && oSettings.operations.filter) {
			this.oOperationFilter  = oSettings.operations.filter;
		} else {
			this.oOperationFilter = null;
		}
	};

	Type.prototype.getParent = function() {
		return this.oFilterProvider._oSmartFilter;
	};

	Type.prototype.getModel = function() {
		return this.oModel;
	};

	Type.prototype.getConditionContext = function() {
		return this.oConditionContext;
	};

	Type.prototype.setDefaultValues = function(oValue1, oValue2) {
		this.oModel.setProperty("value1", oValue1, this.getConditionContext(), true);
		this.oModel.setProperty("value2", oValue2, this.getConditionContext(), true);
	};

	Type.prototype.getContext = function() {
		return this.oContext;
	};

	Type.prototype.getControls = function(oOperation) {
		return [];
	};

	Type.prototype.getOperations = function() {
		return [];
	};

	Type.prototype.isPending = function() {
		return this.getModel().getProperty("pending", this.getContext());
	};

	Type.prototype.attachPendingChange = function(fHandler) {
		this.attachEvent("PendingChange",fHandler);
	};

	Type.prototype.detachPendingChange = function(fHandler) {
		this.detachEvent("PendingChange",fHandler);
	};


	Type.prototype.setPending = function(bValue) {
		if (this.bAsync) {
			this.getModel().setProperty("pending", bValue, this.getContext());
		}
	};

	Type.prototype._filterOperation = function(oOperation) {
		if (!this.oOperationFilter) {
			return true;
		}
		var oFilter = this.oOperationFilter,
			sValue = oOperation[oFilter.path];
		if (oFilter.path && oFilter.contains && sValue) {
			var bExclude = oFilter.exclude || false,
				aFilterValues = (typeof oFilter.contains === "string") ? oFilter.contains.split(",") : oFilter.contains,
				bResult = bExclude;
			for (var j = 0; j < aFilterValues.length; j++) {
				if (bExclude && sValue.indexOf(aFilterValues[j]) > -1) {
					bResult = false;
				} else if (!bExclude && sValue.indexOf(aFilterValues[j]) > -1) {
					bResult = true;
				}
			}
		}
		return bResult;
	};

	Type.prototype._updateOperation = function(oOperation) {
		if (!oOperation.textValue) {
			oOperation.textValue = "";
		}
		if (!oOperation.languageText && oOperation.textKey) {
			oOperation.languageText = this.getTranslatedText(oOperation.textKey);
		}
	};

	Type.prototype.updateOperations = function() {
		this.oModel.setProperty("operations", [], this.getContext());
	};

	Type.prototype.getOperation = function(sOperationName) {
		var aOperations = this.oModel.getProperty("operations", this.getContext()) || [];
		for (var i = 0; i < aOperations.length; i++) {
			if (sOperationName === aOperations[i].key) {
				return aOperations[i];
			}
		}
		return null;
	};

	Type.prototype.getDefaultOperation = function() {
		var aOperations = this.getOperations();
		if (!aOperations || aOperations.length === 0) {
			return null;
		}
		for (var i = 0; i < aOperations.length; i++) {
			if (aOperations[i].defaultOperation) {
				return aOperations[i];
			}
		}
		return aOperations[0];
	};

	Type.prototype.setLabel = function(oLabel) {
		this._oLabel = oLabel;

		if (this.oLayout) { // update the labelFor and ariaLabelledBy references
			this._assignLabelToControls(this.oLayout.getItems());
		}
	};

	Type.prototype.setControls = function(aControls) {
		var aOldControls = this.oModel.getProperty("controls", this.getContext());
		if (aOldControls) {
			for (var i = 0; i < aOldControls.length; i++) {
				aOldControls[i].destroy();
			}
		}
		this.oModel.setProperty("controls", aControls, this.getContext());
		if (aControls) {
			for (var i = 0; i < aControls.length; i++) {
				aControls[i].setBindingContext(this.getConditionContext(), "$smartEntityFilter");
			}
		}

		if (this.oLayout) { // update the labelFor and ariaLabelledBy references
			this._assignLabelToControls(this.oLayout.getItems());
		}

	};

	Type.prototype._assignLabelToControls = function(aControls) {
		if (this._oLabel) {
			for (var i = 0; i < aControls.length; i++) {
				if (i === 0) {
					this._oLabel.setLabelFor(aControls[i]);
				}

				if (aControls[i].addAriaLabelledBy) {
					aControls[i].addAriaLabelledBy(this._oLabel);
				}
			}
		}
	};

	Type.prototype.setOperation = function(sOperation) {
		var oOperation = this.getOperation(sOperation);
		if (oOperation) {
			this.setCondition({
				operation : oOperation.key,
				key: this.sFieldName,
				value1: oOperation.defaultValues[0] || null,
				value2: oOperation.defaultValues[1] || null
			});
			this.getModel().checkUpdate(true);
		} else {
			//log error -> operation is not possible
		}
	};

	Type.prototype.isValidCondition = function() {
		return false;
	};

	Type.prototype.setCondition = function(oCondition) {
		this.oModel.setProperty("key", oCondition.key, this.oConditionContext);
		this.oModel.setProperty("operation", oCondition.operation, this.oConditionContext);
		this.oModel.setProperty("value1", oCondition.value1, this.oConditionContext);
		this.oModel.setProperty("value2", oCondition.value2, this.oConditionContext);
		this.oModel.setProperty("tokenText", this.getTokenText(oCondition), this.oConditionContext);
		return this;
	};

	Type.prototype.setAsync = function(bAsync) {
		this.bAsync = bAsync;
	};

	Type.prototype.getAsync = function(bAsync) {
		return this.bAsync;
	};

	Type.prototype.initialize = function(oJson) {
		this.updateOperations();
	};

	Type.prototype.serialize = function() {
	};

	Type.prototype.validate = function(bForceError) {
		this._bForceError = bForceError !== false;

		if (!this.isPending() && this.oFieldMetadata && this.oFieldMetadata.isMandatory && !this.isValidCondition() && this._bForceError) {
			this.getModel().setProperty("inputstate", "ERROR", this.getContext());
			return false;
		}
		this.getModel().setProperty("inputstate", "NONE", this.getContext());
		return true;
	};


	Type.prototype.getCondition = function() {
		var oCondition = jQuery.extend({}, this.oModel.getProperty("", this.oConditionContext));
		return oCondition;
	};

	Type.prototype.providerDataUpdated = function(aUpdatedFieldNames, oData) {
	};

	Type.prototype.getFilter = function(oFilter) {
		return null;
	};

	Type.prototype.getFilterRanges = function(oProviderData) {
		return null;
	};

	Type.prototype.getTokenText = function(oOperation) {
		return "";
	};

	Type.prototype.getName = function() {
		return this.getMetadata().getName();
	};

	Type.prototype.getType = function() {
		return "Edm";
	};

	Type.prototype.initializeFilterItem = function(sWidth, oLayout) {
		var oSelect = new sap.m.Select(Type._createStableId(this), {
			width: sWidth
		});
		this.oOperationSelect = oSelect;
		this.sWidth = sWidth;
		oSelect.bindProperty("selectedKey", {
			path: "$smartEntityFilter>condition/operation"
		});
		oSelect.bindAggregation("items", {
			path: "$smartEntityFilter>operations",
			template: new sap.ui.core.ListItem({
				text: {
					path: "$smartEntityFilter>languageText"
				},
				key: {
					path: "$smartEntityFilter>key"
				},
				additionalText: {
					path: "$smartEntityFilter>textValue"
				}
			})
		});

		//TODO: Remove once Select supports a public API
		if (oSelect._oList && oSelect._oList.setShowSecondaryValues) {
			oSelect._oList.setShowSecondaryValues(true);
		}

		oSelect.setBindingContext(this.getContext(), "$smartEntityFilter");
		var oList = this.getModel().bindList("controls", this.getContext());
		oList.attachChange(function() {
			var aNewControls = oList.getModel().getProperty("controls", oList.getContext());
			if (!aNewControls) {
				return;
			}
			for (var i = 0; i < aNewControls.length; i++) {
				aNewControls[i].setLayoutData(new sap.m.FlexItemData({
					alignSelf: sap.m.FlexAlignSelf.Center
				}));
				//aNewControls[i].bindProperty("busy",{path: "$smartEntityFilter>/pending"});
				oLayout.addItem(aNewControls[i]);
			}
		});
		// The filter definition has own more than 1 operation
		oLayout.addItem(oSelect);
		//oSelect.bindProperty("busy",{path: "$smartEntityFilter>/pending"});
		oLayout.setModel(this.getModel(), "$smartEntityFilter");
		this.getModel().checkUpdate(true);
		this.oLayout = oLayout;
	};

	Type.prototype.destroy = function() {
		this.setControls([]);
		EventProvider.prototype.destroy.apply(this, arguments);
	};
	
	return Type;
}, /* bExport= */true);
