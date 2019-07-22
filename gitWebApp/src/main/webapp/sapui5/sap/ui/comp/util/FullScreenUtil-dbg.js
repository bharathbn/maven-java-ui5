/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// ------------------------------------------------------------------------------------------
// Utility class used by smart controls for switching a control to full-screen mode and back.
// ------------------------------------------------------------------------------------------
sap.ui.define([
	"jquery.sap.global", "sap/m/Dialog", "sap/ui/core/HTML"
], function(jQuery, Dialog, HTML) {
	"use strict";

	/**
	 * Utility class used by smart controls for switching a control to fullscreen
	 * 
	 * @private
	 * @experimental This module is only for internal/experimental use!
	 */
	var FullScreenUtil = {
		/**
		 * Static function that toggles a control to full screen mode.<br>
		 * Please ensure that you call the clean up function when the control (enabled here for full screen) is destroyed!
		 * 
		 * @param {Object} oControl - the control which can be toggled to full screen
		 * @param {boolean} bEnterFullScreen - whether the control should be enter/exit full screen mode
		 * @param {Object} oFullscreenButton - full screen button of the control which can be toggled to full screen
		 * @private
		 */
		toggleFullScreen: function(oControl, bEnterFullScreen, oFullScreenButton) {
			// Switch to full-screen mode
			if (bEnterFullScreen) {
				// save get the dom reference of the control on it's instance
				oControl._$content = oControl.$();
				if (oControl._$content) {
					// Create an HTML element to add the controls DOM content in the FullScreen dialog
					if (!oControl._oHTML) {
						oControl._oHTML = new HTML();
					}
					// Create and set a fullscreen Dialog (without headers) on the registered control instance
					if (!oControl._oFullScreenDialog) {
						oControl._oFullScreenDialog = new Dialog({
							showHeader: false,
							stretch: true,
							content: [
								oControl._oHTML
							]
						});
						//Set focus back on full-screen button of control
						if (oFullScreenButton) {
							oControl._oFullScreenDialog.attachAfterOpen(function() {
								oFullScreenButton.focus();
							});
							oControl._oFullScreenDialog.attachAfterClose(function() {
								oFullScreenButton.focus();
							});
						}
						// add the style class from control to the dialog
						oControl._oFullScreenDialog.addStyleClass(oControl._$content.closest(".sapUiSizeCompact").length ? "sapUiSizeCompact" : "");
						// add style class to make the scroll container height as 100% (required to stretch UI to 100% e.g. for SmartChart)
						oControl._oFullScreenDialog.addStyleClass("sapUiCompSmartFullScreenDialog");
						// Disable "Escape" handling
						if (oControl._oFullScreenDialog.oPopup) {
							oControl._oFullScreenDialog.oPopup.onsapescape = null;
						}
					}
					// create a dummy div node (place holder)
					oControl._$placeHolder = jQuery(document.createElement("div"));
					// Set the place holder before the current content
					oControl._$content.before(oControl._$placeHolder);
					// Add the content to the HTML controls DOM
					oControl._oHTML.setDOMContent(oControl._$content);
				}
				// open the full screen Dialog
				oControl._oFullScreenDialog.open();
				// Switch back from full-screen mode
			} else if (oControl._$placeHolder && oControl._$content) {
				// Replace the place holder with the referenced content
				oControl._$placeHolder.replaceWith(oControl._$content);
				// close the full screen Dialog
				if (oControl._oFullScreenDialog) {
					oControl._oFullScreenDialog.close();
				}
				oControl._$placeHolder = null;
				oControl._$content = null;
			}
		},
		/**
		 * Static function that cleans up resources created for full-screen mode.<br>
		 * 
		 * @param {Object} oControl - the control which can be toggled to full screen
		 * @private
		 */
		cleanUpFullScreen: function(oControl) {
			// Destroy the Dialog and hence the containing HTML control
			if (oControl._oFullScreenDialog) {
				oControl._oFullScreenDialog.destroy();
				oControl._oFullScreenDialog = null;
			}
			// clean up instance variables created for full screen mode
			oControl._$placeHolder = null;
			oControl._$content = null;
			oControl._oHTML = null;
		}
	};

	return FullScreenUtil;

}, /* bExport= */true);
