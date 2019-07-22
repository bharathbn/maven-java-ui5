 /*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

sap.ui.define([],
	function() {
	"use strict";

	/**
	* InteractiveBarChartRenderer renderer.
	* @namespace
	*/
	var InteractiveBarChartRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render - Output - Buffer
	 * @param {sap.ui.core.Control} oControl the control to be rendered
	 */
	InteractiveBarChartRenderer.render = function(oRm, oControl) {
		if (!oControl._bThemeApplied) {
			return;
		}

		var i, iBarsNum,
			oBars, sLabel;
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapSuiteIBC");
		oRm.writeClasses();
		oRm.write(">");
		iBarsNum = oControl.getMaxDisplayedBars();
		oBars = oControl.getAggregation("bars");
		if (iBarsNum > oBars.length) {
			iBarsNum = oBars.length;
		}
		if (!oControl.getSelectionEnabled()) {
			this.renderDisabledOverlay(oRm, oControl);
		}
		for (i = 0; i < iBarsNum; i++) {
			oRm.write("<div");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-interactionArea-" + i);
			oRm.addClass("sapSuiteIBCBarInteractionArea");
			if (!!oBars[i].getSelected()) {
				oRm.addClass("sapSuiteIBCBarSelected");
			}
			// the first bar has tabindex at the first rendering
			if (i === 0 && oControl.getSelectionEnabled()) {
				oRm.writeAttribute("tabindex", "0");
			}
			oRm.writeStyles();
			oRm.writeClasses();
			oRm.write(">");
			sLabel = oBars[i].getLabel();
			oRm.write("<span");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-label-" + i);
			oRm.addClass("sapSuiteIBCBarLabel");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(sLabel);
			oRm.write("</span>");
			if (oControl._bMinMaxValid) {
				oRm.write("<span");
				oRm.writeAttributeEscaped("id", oControl.getId() + "-bar-" + i);
				oRm.addClass("sapSuiteIBCBar");
				oRm.writeClasses();
				oRm.write(">");
				this._renderDisplayedValue(oRm, oControl, oBars[i], oControl.getId(), i);
				oRm.write("</span>");
			}
			oRm.write("</div>");
		}
		oRm.write("</div>");
	};

	InteractiveBarChartRenderer._renderDisplayedValue = function(oRm, oControl, oBar, sControlId, i) {
		var sValue;
		oRm.write("<span");
		sValue = this._getValueToBeDisplayed(oBar, oControl);
		oRm.writeAttributeEscaped("id", sControlId + "-displayedValue-" + i);
		oRm.addClass("sapSuiteIBCBarValue");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(sValue);
		oRm.write("</span>");
	};

	InteractiveBarChartRenderer.renderDisabledOverlay = function(oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapSuiteIBCDisabledOverlay");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");
	};

	InteractiveBarChartRenderer._getValueToBeDisplayed = function(oBar, oControl) {
		var sValue, fValue;
		sValue = oBar.getDisplayedValue();
		fValue = oBar.getValue();
		if (oBar._bNullValue) {
			sValue = oControl._oRb.getText("INTERACTIVECHART_NA"); // 'N/A' is displayed if value does not exist (regardless of whether the displayedValue exists or not)
		} else if (!sValue) {
			sValue = fValue.toString();
		}
		return sValue;
	};
	return InteractiveBarChartRenderer;

}, /* bExport */ true);
