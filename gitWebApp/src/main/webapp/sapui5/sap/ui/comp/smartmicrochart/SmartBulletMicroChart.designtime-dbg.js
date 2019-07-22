/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides the Design Time Metadata for the sap.ui.comp.smartmicrochart.SmartBulletMicroChart control.
sap.ui.define([], function() {
	"use strict";
	return {
		annotations: {

		},

		customData: {
			/**
			 * Defines whether a Qualifier needs to be considered or not. If provided the value of the customData is the qualifier value without hashtag ("#").
			 */
			chartQualifier : {
				type : "string",
				defaultValue : null,
				group : ["Appearance"],
				since : "1.42.0"
			}
		}
	};
}, /* bExport= */false);