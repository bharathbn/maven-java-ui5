/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

sap.ui.define([
	"sap/ui/rta/util/FakeLrepLocalStorage"
	], function(
	FakeLrepLocalStorage) {
	"use strict";

	/**
	 * Class for SAP RTA Fake Lrep changes in localStorage
	 *
	 * @class
	 * Utility functionality for SAP RTA Fake Lrep localStorage
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 *
	 * @private
	 * @static
	 * @since 1.34
	 * @alias sap.ui.rta.FakeLrepConnectorLocalStorage
	 */

	var FakeLrepConnectorLocalStorage = {};

	/**
	 * Creates a Fake Lrep change in localStorage
	 * @param  {Object|Array} vChange - the change array/object
	 * @returns {Promise} Returns a promise to the result of the request
	 */
	FakeLrepConnectorLocalStorage.create = function(vChange) {
		
		if (Array.isArray(vChange)) {
			vChange.forEach(function(elem) {
				FakeLrepLocalStorage.saveChange(elem.fileName, elem);
			});
		} else {
			FakeLrepLocalStorage.saveChange(vChange.fileName, vChange);	
		}
		return Promise.resolve();
	};

	/**
	 * Deletes a Fake Lrep change in localStorage
	 * @param  {Object} oChange - the change Object
	 * @returns {Promise} Returns a promise to the result of the request
	 */
	FakeLrepConnectorLocalStorage.deleteChange = function(oChange) {

		FakeLrepLocalStorage.deleteChange(oChange.sChangeName);

		return Promise.resolve({
			response: undefined,
			status: "nocontent"
		});
	};

	/**
	 * Deletes all Fake Lrep changes in localStorage
	 * @returns {Promise} Returns a promise to the result of the request
	 */
	FakeLrepConnectorLocalStorage.deleteChanges = function() {

		FakeLrepLocalStorage.deleteChanges();

		return Promise.resolve({
			response: undefined,
			status: "nocontent"
		});
	};

	/**
	 * Loads the changes for the given Component class name
	 * from the FakeLrepLocalStorage
	 * and also loads the mandatory FakeLrepConnector.json file.
	 * The settings are take from the JSON file, but changes are replaced with
	 * the changes from the local storage.
	 * 
	 * @param {String} sComponentClassName - Component class name
	 * @returns {Promise} Returns a Promise with the changes and componentClassName
	 * @public
	 */
	FakeLrepConnectorLocalStorage.loadChanges = function(sComponentClassName) {

		var aChanges = FakeLrepLocalStorage.getChanges(),
			initialComponentJsonPath = this.sInitialComponentJsonPath;

		return new Promise(function(resolve, reject){
			jQuery.getJSON(initialComponentJsonPath).done(function(oResponse){
				oResponse.changes = aChanges;
				var result = {
					changes: oResponse,
					componentClassName: sComponentClassName
				};
				resolve(result);
			}).fail(function(error){
				reject(error);
			});
		});

	};

	return FakeLrepConnectorLocalStorage;

}, /* bExport= */ true);