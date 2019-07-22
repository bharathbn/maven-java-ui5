/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand'], function(FlexCommand) {
	"use strict";

	/**
	 * Reveal controls by setting visible to true or unstash them
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.44
	 * @alias sap.ui.rta.command.Reveal
	 * @experimental Since 1.44. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Reveal = FlexCommand.extend("sap.ui.rta.command.Reveal", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				revealedElementId : {
					type : "string"
				},
				hiddenParent : "object"
			}
		}
	});

	Reveal.prototype._getSpecificChangeInfo = function() {
		var mSpecificChangeInfo = {
			changeType : this.getChangeType()
		};
		if (this.getRevealedElementId()) {
			mSpecificChangeInfo.revealedElementId = this.getRevealedElementId();
		}
		return mSpecificChangeInfo;

	};

	/**
	 * @override
	 */
	Reveal.prototype._getFlexChange = function(oElement) {
		var oPreparedChange = this.getPreparedActionData();
		if (!oPreparedChange) {
			var mSpecificChangeInfo = this._getSpecificChangeInfo();
			var oRevealedElement = sap.ui.getCore().byId(this.getRevealedElementId());
			var oChange = this._completeChangeContent(mSpecificChangeInfo);
			oPreparedChange = {
				change : oChange,
				selectorElement : oRevealedElement
			};
		}
		return oPreparedChange;
	};

	/**
	 * @override
	 */
	Reveal.prototype._getForwardActionData = function(oElement) {
		return this._getFlexChange(oElement);
	};

	return Reveal;

}, /* bExport= */true);
