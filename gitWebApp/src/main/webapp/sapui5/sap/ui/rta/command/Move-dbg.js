/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/rta/command/FlexCommand'], function(jQuery, FlexCommand) {
	"use strict";

	/**
	 * Move Element from one place to another
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.44.4
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.Move
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Move = FlexCommand.extend("sap.ui.rta.command.Move", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				movedElements : {
					type : "array"
				},
				target : {
					type : "object"
				},
				source : {
					type : "object"
				}
			},
			associations : {},
			events : {}
		}
	});

	Move.prototype._getSpecificChangeInfo = function(bForward) {

		var mSource = bForward ? this.getSource() : this.getTarget();
		var mTarget = bForward ? this.getTarget() : this.getSource();
		var oSourceParent = mSource.parent || sap.ui.getCore().byId(mSource.id);

		// replace elements by their id, unify format and help with serialization
		if (mSource.parent) {
			mSource.id = mSource.parent.getId();
			delete mSource.parent;
		}
		if (mTarget.parent) {
			mTarget.id = mTarget.parent.getId();
			delete mTarget.parent;
		}
		var mSpecificInfo = {
			changeType : this.getChangeType(),
			selector : {
				id : oSourceParent.getId()
			},
			source : mSource,
			target : mTarget,
			movedElements : []
		};

		this.getMovedElements().forEach(function(mMovedElement) {
			mSpecificInfo.movedElements.push({
				id : mMovedElement.id || mMovedElement.element.getId(),
				sourceIndex : bForward ? mMovedElement.sourceIndex : mMovedElement.targetIndex,
				targetIndex : bForward ? mMovedElement.targetIndex : mMovedElement.sourceIndex
			});
		});

		var ChangeHandler = this.getChangeHandler();

		return ChangeHandler.buildStableChangeInfo(mSpecificInfo);
	};

	Move.prototype._getFlexChange = function(bForward) {
		var oPreparedChange = this.getPreparedActionData(bForward);
		if (!oPreparedChange) {
			var mSpecificChangeInfo = this._getSpecificChangeInfo(bForward);
			oPreparedChange = this._completeChangeContent(mSpecificChangeInfo);
		}
		return oPreparedChange;
	};

	/**
	 * @override
	 */
	Move.prototype._getForwardActionData = function(oElement) {
		return this._getFlexChange(FlexCommand.FORWARD);
	};

	/**
	 * @override
	 */
	Move.prototype._getBackwardActionData = function(oElement) {
		return this._getFlexChange(FlexCommand.BACKWARD);
	};

	/**
	 * @override
	 */
	Move.prototype.serialize = function() {
		return this._getSpecificChangeInfo(FlexCommand.FORWARD);
	};

	return Move;

}, /* bExport= */true);
