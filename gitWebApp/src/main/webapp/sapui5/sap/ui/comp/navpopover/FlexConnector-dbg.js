/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

/**
 * @namespace tbd
 * @name sap.ui.comp.personalization.FlexConnector
 * @author SAP SE
 * @version 1.44.4
 * @private
 * @since 1.44.0
 */
sap.ui.define([
	'sap/ui/comp/library', 'sap/ui/comp/navpopover/flexibility/changes/AddLink', 'sap/ui/comp/navpopover/flexibility/changes/RemoveLink', 'sap/ui/fl/Utils', 'sap/ui/fl/FlexControllerFactory', 'sap/ui/fl/ChangePersistenceFactory'
], function(CompLibrary, AddLink, RemoveLink, FlUtil, FlexControllerFactory, ChangePersistenceFactory) {
	"use strict";

	var FlexConnector = {

		/**
		 * Returns the Component that belongs to given control whose type is "application". If the control has no component, it walks up the control
		 * tree in order to find a control having one.
		 * 
		 * @param {sap.ui.core.Control} oControl
		 * @returns {sap.ui.base.Component} Component
		 * @private
		 */
		getAppComponentForControl: function(oControl) {
			return FlUtil.getAppComponentForControl(oControl);
		},

		/**
		 * Indicates if the VENDOR is selected
		 * 
		 * @returns {boolean} true if it's a VENDOR layer
		 * @private
		 */
		isVendorLayer: function() {
			return FlUtil.isVendorLayer();
		},

		/**
		 * Creates flexibility changes for <code>oMLinks</code> and save them immediately in 'USER' layer.
		 * 
		 * @param {object} oMLinks Object of format
		 * 
		 * <pre>
		 * {addedLinks:[{key: {string}, visible: {boolean}}], removedLinks:[{key: {string}, visible: {boolean}}]}
		 * </pre>
		 * 
		 * @param {sap.ui.core.Control} oControl
		 * @returns {Promise} A <code>Promise</code> for asynchronous execution
		 * @private
		 */
		createAndSaveChangesForControl: function(oMLinks, oControl) {
			var that = this;
			return new Promise(function(resolve, reject) {
				if (!oMLinks) {
					return resolve();
				}
				that.createChangesForControl(oMLinks.removedLinks, oControl, sap.ui.comp.navpopover.ChangeHandlerType.removeLink);
				that.createChangesForControl(oMLinks.addedLinks, oControl, sap.ui.comp.navpopover.ChangeHandlerType.addLink);

				that.saveChangesForControl(oControl).then(function(oResponse) {
					return resolve();
				})['catch'](function(oError) {
					return reject(oError);
				});
			});
		},

		/**
		 * Creates flexibility change for each element of <code>aMLinks</code> array with the <code>sChangeType</code> change type for
		 * <code>oControl</code> in 'USER' layer.
		 * 
		 * @param {array} aMLinks Array of objects of format {key: {string}, visible: {boolean}, index: {integer}}
		 * @param {sap.ui.core.Control} oControl
		 * @param {string} sChangeType
		 * @private
		 */
		createChangesForControl: function(aMLinks, oControl, sChangeType) {
			if (!aMLinks.length) {
				return;
			}
			if (!sChangeType) {
				throw new Error("sChangeType should be filled");
			}
			var oFlexController = FlexControllerFactory.createForControl(oControl);
			aMLinks.forEach(function(oMLink) {
				oFlexController.createAndApplyChange({
					changeType: sChangeType, // registry of ChangeHandler in sap.ui.comp.library.js
					content: oMLink,
					isUserDependent: true
				}, oControl);
			});
		},

		/**
		 * Saves all flexibility changes.
		 * 
		 * @param {sap.ui.core.Control} oControl
		 * @returns {Promise} A <code>Promise</code> for asynchronous execution
		 * @private
		 */
		saveChangesForControl: function(oControl) {
			return new Promise(function(resolve, reject) {
// return reject("Dummy reject");
				FlexControllerFactory.createForControl(oControl).saveAll().then(function(oResponse) {
					return resolve();
				})['catch'](function(oError) {
					return reject(oError);
				});
			});
		},

		/**
		 * Reads flexibility changes for the <code>sStableID</code>.
		 * 
		 * @param {string} sStableID
		 * @param {sap.ui.core.Control} oControl
		 * @returns {array} Array, empty array if no changes exist
		 * @private
		 */
		readChangesForControl: function(sStableID, oControl) {
			var oAppComponent = this.getAppComponentForControl(oControl);
			var sComponentName = FlUtil.getFlexReference(oAppComponent.getManifestObject());
			var oMapOfChanges = ChangePersistenceFactory.getChangePersistenceForComponent(sComponentName).getChangesMapForComponent();
			return oMapOfChanges[sStableID] ? oMapOfChanges[sStableID] : [];
		},

		/**
		 * Discards flexibility changes.
		 * 
		 * @param {array} aChanges
		 * @param {sap.ui.core.Control} oControl
		 * @returns {Promise} A <code>Promise</code> for asynchronous execution
		 * @private
		 */
		discardChangesForControl: function(aChanges, oControl) {
			return new Promise(function(resolve, reject) {
				if (!aChanges.length) {
					return resolve();
				}
				FlexControllerFactory.createForControl(oControl).discardChanges(aChanges).then(function() {
					return resolve();
				})['catch'](function(oError) {
					return reject(oError);
				});
			});
		},

		/**
		 * Activates a channel in order to collect statistics about flexibility changes which will be applied after the channel has been activated.
		 * 
		 * @private
		 */
		activateApplyChangeStatistics: function() {
			var that = this;
			this.aStatistics = [];
			var fWriteStatistics = function(oChange, oNavigationPopover) {
				if (that.aStatistics.findIndex(function(oStatistic) {
					return oStatistic.stableId === oNavigationPopover.getId() && oStatistic.changeId === oChange.getId();
				}) < 0) {
					var oAvailableAction = oNavigationPopover.getAvailableActions().find(function(oAvailableAction_) {
						return oAvailableAction_.getKey() === oChange.getContent().key;
					});
					that.aStatistics.push({
						stableId: oNavigationPopover.getId(),
						changeId: oChange.getId(),
						layer: oChange.getLayer(),
						key: oChange.getContent().key,
						text: oAvailableAction ? oAvailableAction.getText() : '',
						changeType: oChange.getChangeType()
					});
				}
			};

			// Monkey patch AddLink.applyChange
			var fApplyChangeOrigin = jQuery.proxy(AddLink.applyChange, AddLink);
			var fApplyChangeOverwritten = function(oChange, oNavigationPopover, mPropertyBag) {
				fWriteStatistics(oChange, oNavigationPopover);
				fApplyChangeOrigin(oChange, oNavigationPopover, mPropertyBag);
			};
			AddLink.applyChange = fApplyChangeOverwritten;

			// Monkey patch RemoveLink.applyChange
			var fRemoveChangeOrigin = jQuery.proxy(RemoveLink.applyChange, RemoveLink);
			var fRemoveChangeOverwritten = function(oChange, oNavigationPopover, mPropertyBag) {
				fWriteStatistics(oChange, oNavigationPopover);
				fRemoveChangeOrigin(oChange, oNavigationPopover, mPropertyBag);
			};
			RemoveLink.applyChange = fRemoveChangeOverwritten;
		},

		_formatStatistic: function(oStatistic) {
			var sLayer = oStatistic.layer;
			switch (oStatistic.layer) {
				case "VENDOR":
					sLayer = "" + sLayer;
					break;
				case "CUSTOMER":
					sLayer = "        " + sLayer;
					break;
				case "USER":
					sLayer = "                " + sLayer;
					break;
				default:
					sLayer = "" + sLayer;
			}
			var sValue;
			switch (oStatistic.changeType) {
				case sap.ui.comp.navpopover.ChangeHandlerType.addLink:
					sValue = "On";
					break;
				case sap.ui.comp.navpopover.ChangeHandlerType.removeLink:
					sValue = "Off";
					break;
				default:
					sValue = "";
			}
			return {
				formattedLayer: sLayer,
				formattedValue: sValue
			};
		},

		/**
		 * Shows statistics for a specific <code>sLinkText</code> in console collected since the activation has been started.
		 * 
		 * @private
		 */
		printStatisticOfText: function(sLinkText) {
			var that = this;
			jQuery.sap.log.info("VENDOR ------------ CUSTOMER ----------- USER --------------------------------------");
			this.aStatistics.filter(function(oStatistic) {
				return oStatistic.text === sLinkText;
			}).forEach(function(oStatistic) {
				var oFormattedStatistic = that._formatStatistic(oStatistic);
				jQuery.sap.log.info(oStatistic.stableId + " " + oFormattedStatistic.formattedLayer + " '" + oStatistic.text + "' " + oFormattedStatistic.formattedValue);
			});
		},

		/**
		 * Shows statistics for all applied links in console collected since the activation has been started.
		 * 
		 * @private
		 */
		printStatisticAll: function() {
			var that = this;
			jQuery.sap.log.info("idx - VENDOR ------------ CUSTOMER ----------- USER --------------------------------------");
			this.aStatistics.forEach(function(oStatistic, iIndex) {
				var oFormattedStatistic = that._formatStatistic(oStatistic);
				jQuery.sap.log.info(iIndex + " " + oStatistic.stableId + " " + oFormattedStatistic.formattedLayer + " '" + oStatistic.text + "' " + oFormattedStatistic.formattedValue);
			});
		},

		/**
		 * @param {sap.ui.comp.navpopover.SmartLink} oSmartLink
		 * @returns {string} StableID of NavigationPopover corresponding to <code>oSmartLink</code>
		 * @private
		 */
		getNavigationPopoverStableID: function(oSmartLink) {
			return oSmartLink.getNavigationPopoverHandler().getNavigationPopoverStableId();
		}
	};

	return FlexConnector;
}, /* bExport= */true);
