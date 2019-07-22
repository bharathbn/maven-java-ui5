/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides default renderer for control sap.ui.rta.ToolsMenu
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	/**
	 * @author SAP SE
	 * @class ToolsMenu renderer.
	 * @static
	 */
	var ToolsMenuRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ToolsMenuRenderer.render = function(oRm, oControl) {

		if (oControl.getToolbars().length !== 0){
			oControl.getToolbars().forEach(function(oCtrl){
				oRm.renderControl(oCtrl);
			});
		}
	};
	return ToolsMenuRenderer;

}, /* bExport= */ true);