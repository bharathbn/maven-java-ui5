/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(["jquery.sap.global", "sap/ui/fl/changeHandler/JsControlTreeModifier", "sap/ui/fl/Utils"],
		function(jQuery, JsControlTreeModifier, Utils) {
			"use strict";

			/**
			 * Change handler for moving of a elements.
			 *
			 * @alias sap.ui.fl.changeHandler.MoveElements
			 * @author SAP SE
			 * @version 1.44.4
			 * @experimental Since 1.34.0
			 */
			var MoveSimpleForm = {};

			MoveSimpleForm.CHANGE_TYPE_MOVE_FIELD = "moveSimpleFormField";
			MoveSimpleForm.CHANGE_TYPE_MOVE_GROUP = "moveSimpleFormGroup";
			MoveSimpleForm.sTypeTitle = "sap.ui.core.Title";
			MoveSimpleForm.sTypeToolBar = "sap.m.Toolbar";
			MoveSimpleForm.sTypeLabel = "sap.m.Label";
			MoveSimpleForm.CONTENT_AGGREGATION = "content";

			/**
			 * Moves an element from one aggregation to another.
			 *
			 * @param {sap.ui.fl.Change}
			 *          oChangeWrapper change object with instructions to be applied on the control map
			 * @param {sap.ui.core.Control}
			 *          oSourceParent control that matches the change selector for applying the change, which is the source of
			 *          the move
			 * @param {object}
			 *          mPropertyBag map containing the control modifier object (either sap.ui.fl.changeHandler.JsControlTreeModifier or
	         *          sap.ui.fl.changeHandler.XmlTreeModifier), the view object where the controls are embedded and the application component
			 * @public
			 */
			MoveSimpleForm.applyChange = function(oChangeWrapper, oSimpleForm, mPropertyBag) {
				var oModifier = mPropertyBag.modifier;
				var oView = mPropertyBag.view;
				var oAppComponent = mPropertyBag.appComponent;

				var oContent = oChangeWrapper.getContent();
				var mMovedElement = oContent.movedElements[0];
				var aContent = oModifier.getAggregation(oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION);

				if (oChangeWrapper.getChangeType() === MoveSimpleForm.CHANGE_TYPE_MOVE_FIELD) {
					// !important : element was used in 1.40, do not remove for compatibility!
					var oSourceField = oModifier.bySelector(mMovedElement.elementSelector || mMovedElement.element, oAppComponent, oView);
					var iSourceFieldIndex = aContent.indexOf(oSourceField);
					var iSourceFieldLength = fnGetFieldLength(oModifier, aContent, iSourceFieldIndex);

					// Compute the fields target index
					// !important : groupId was used in 1.40, do not remove for compatibility!
					var oTargetGroup = oModifier.bySelector(mMovedElement.target.groupSelector || mMovedElement.target.groupId, oAppComponent, oView);
					var iTargetGroupIndex = aContent.indexOf(oTargetGroup);
					// !important : groupId was used in 1.40, do not remove for compatibility!
					var oSourceGroup = oModifier.bySelector(mMovedElement.source.groupSelector || mMovedElement.source.groupId, oAppComponent, oView);
					var iSourceGroupIndex = aContent.indexOf(oSourceGroup);

					var iTargetFieldIndex = fnMapFieldIndexToContentAggregationIndex(oModifier, aContent, iTargetGroupIndex,
							mMovedElement.target.fieldIndex, (iSourceGroupIndex === iTargetGroupIndex)
									&& (mMovedElement.source.fieldIndex < mMovedElement.target.fieldIndex));
					var iTargetFieldLength = fnGetFieldLength(oModifier, aContent, iTargetFieldIndex);

					var aContentClone = aContent.slice();
					var aFieldElements = aContentClone.slice(iSourceFieldIndex, iSourceFieldIndex + iSourceFieldLength);

					var aSegmentBeforeSource, aSegmentBeforeTarget, aSegmentBetweenSourceAndTarget, aSegmentTillEnd;
					if (iSourceFieldIndex < iTargetFieldIndex) {
						aSegmentBeforeSource = aContentClone.slice(0, iSourceFieldIndex);
						aSegmentBetweenSourceAndTarget = aContentClone.slice(iSourceFieldIndex + iSourceFieldLength, iTargetFieldIndex
								+ iTargetFieldLength);
						aSegmentTillEnd = aContentClone.slice(iTargetFieldIndex + iTargetFieldLength, aContentClone.length);
						aContentClone = aSegmentBeforeSource.concat(aSegmentBetweenSourceAndTarget.concat(aFieldElements.concat(aSegmentTillEnd)));
					} else if (iSourceFieldIndex > iTargetFieldIndex) {
						aSegmentBeforeTarget = aContentClone.slice(0, iTargetFieldIndex + iTargetFieldLength);
						aSegmentBetweenSourceAndTarget = aContentClone.slice(iTargetFieldIndex + iTargetFieldLength, iSourceFieldIndex);
						aSegmentTillEnd = aContentClone.slice(iSourceFieldIndex + iSourceFieldLength, aContentClone.length);
						aContentClone = aSegmentBeforeTarget.concat(aFieldElements.concat(aSegmentBetweenSourceAndTarget.concat(aSegmentTillEnd)));
					}

					if (iSourceFieldIndex != iTargetFieldIndex) {
						oModifier.removeAllAggregation(oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION);
						for (var i = 0; i < aContentClone.length; ++i) {
							oModifier.insertAggregation(oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION, aContentClone[i], i);
						}
					}

				} else if (oChangeWrapper.getChangeType() === MoveSimpleForm.CHANGE_TYPE_MOVE_GROUP) {

					var aStopGroupToken = [MoveSimpleForm.sTypeTitle, MoveSimpleForm.sTypeToolBar];
					// !important : element was used in 1.40, do not remove for compatibility!
					var oMovedGroup = oModifier.bySelector(mMovedElement.elementSelector || mMovedElement.element, oAppComponent, oView);
					var iMovedGroupIndex = aContent.indexOf(oMovedGroup);

					var iTargetIndex = fnMapGroupIndexToContentAggregationIndex(oModifier, aStopGroupToken, aContent,
							mMovedElement.target.groupIndex);
					var oTargetGroup = aContent[iTargetIndex];
					var iTargetLength = fnMeasureLengthOfSequenceUntilStopToken(oModifier, iTargetIndex, aContent,
							aStopGroupToken);

					var iMovedLength = fnMeasureLengthOfSequenceUntilStopToken(oModifier, iMovedGroupIndex, aContent,
							aStopGroupToken);
					var aContentClone = aContent.slice();
					// Cut the moved group from the result array...
					aContentClone.splice(iMovedGroupIndex, iMovedLength);

					iTargetIndex = aContentClone.indexOf(oTargetGroup);

					var iOffset = mMovedElement.source.groupIndex < mMovedElement.target.groupIndex ? iTargetLength : 0;
					// and insert it at the target index
					aContentClone = fnArrayRangeCopy(aContent, iMovedGroupIndex, aContentClone, iTargetIndex + iOffset,
							iMovedLength);

					oModifier.removeAllAggregation(oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION);
					for (var i = 0; i < aContentClone.length; ++i) {
						oModifier.insertAggregation(oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION, aContentClone[i], i);
					}

				} else {
					jQuery.sap.log.warning("Unknown change type detected. Cannot apply to SimpleForm");
				}

				return true;

			};

			// To be removed
			MoveSimpleForm.buildStableChangeInfo = function(mSpecificChangeInfo) {
				return mSpecificChangeInfo;
			};

			/**
			 * Completes the change by adding change handler specific content
			 *
			 * @param {sap.ui.fl.Change}
			 *          oChangeWrapper change object to be completed
			 * @param {object}
			 *          mSpecificChangeInfo as an empty object since no additional attributes are required for this operation
			 * @param {object}
			 *          mPropertyBag map containing the application component
			 * @public
			 */
			MoveSimpleForm.completeChangeContent = function(oChangeWrapper, mSpecificChangeInfo, mPropertyBag) {
				var mStableChangeInfo;

				var oSimpleForm = mSpecificChangeInfo.source.publicParent;
				var aMovedElements = mSpecificChangeInfo.movedElements;
				if (aMovedElements.length > 1) {
					jQuery.sap.log.warning("Moving more than 1 Formelement is not yet supported.");
				}
				var mMovedElement = aMovedElements[0];
				mMovedElement.element = sap.ui.getCore().byId(mMovedElement.id);
				var oSource = jQuery.extend({}, mSpecificChangeInfo.source);
				var oTarget = jQuery.extend({}, mSpecificChangeInfo.target);
				if (!oTarget.parent) {
					oTarget.parent = sap.ui.getCore().byId(oTarget.id);
				}
				if (!oSource.parent) {
					oSource.parent = sap.ui.getCore().byId(oSource.id);
				}
				if (oSimpleForm && mMovedElement.element && oTarget.parent) {
					if (mSpecificChangeInfo.changeType === "moveSimpleFormGroup") {
						mStableChangeInfo = fnMoveFormContainer(oSimpleForm, mMovedElement, oSource, oTarget, mPropertyBag);
					} else if (mSpecificChangeInfo.changeType === "moveSimpleFormField") {
						mStableChangeInfo = fnMoveFormElement(oSimpleForm, mMovedElement, oSource, oTarget, mPropertyBag);
					}
				} else {
					jQuery.sap.log.error("Element not found. This may caused by an instable id!");
				}

				var mChangeData = oChangeWrapper.getDefinition();
				mChangeData.content.targetSelector = mStableChangeInfo.targetSelector;
				mChangeData.content.movedElements = mStableChangeInfo.movedElements;
			};

			var fnMapGroupIndexToContentAggregationIndex = function(oModifier, aStopToken, aContent, iGroupIndex) {
				var oResult;
				var iCurrentGroupIndex = -1;
				for (var i = 0; i < aContent.length; i++) {
					var sType = oModifier.getControlType(aContent[i]);
					if (aStopToken.indexOf(sType) > -1) {
						iCurrentGroupIndex++;
						if (iCurrentGroupIndex === iGroupIndex) {
							oResult = aContent[i];
							break;
						}
					}
				}
				return aContent.indexOf(oResult);
			};

			var fnIsTitleOrToolbar = function(aElements, iIndex) {
				if (iIndex >= aElements.length) {
					return true;
				}
				var sType = aElements[iIndex].getMetadata().getName();
				return (MoveSimpleForm.sTypeTitle === sType || MoveSimpleForm.sTypeToolBar === sType);
			};

			var fnMeasureLengthOfSequenceUntilStopToken = function(oModifier, iMovedElementIndex, aContent, aStopToken) {
				var i = 0;
				for (i = iMovedElementIndex + 1; i < aContent.length; ++i) {
					var sType = oModifier.getControlType(aContent[i]);
					if (aStopToken.indexOf(sType) > -1) {
						break;
					}
				}
				return i - iMovedElementIndex;
			};

			var fnGetFieldLength = function(oModifier, aElements, iIndex) {
				return fnMeasureLengthOfSequenceUntilStopToken(oModifier, iIndex, aElements, [MoveSimpleForm.sTypeTitle,
						MoveSimpleForm.sTypeToolBar, MoveSimpleForm.sTypeLabel]);
			};

			var fnMapFieldIndexToContentAggregationIndex = function(oModifier, aContent, iGroupStart, iFieldIndex, bUp) {
				if (!fnIsTitleOrToolbar(aContent, iGroupStart)) {
					jQuery.sap.log.error("Illegal argument. iIndex has to point to a Label.");
				} else {
					iFieldIndex = bUp ? iFieldIndex + 1 : iFieldIndex;
					var iCurrentRelativeFieldIndex = 0;
					var iAbsolutIndex = iGroupStart;
					var iActLength;
					while (iAbsolutIndex < aContent.length && iCurrentRelativeFieldIndex < iFieldIndex) {
						++iCurrentRelativeFieldIndex;
						iActLength = fnGetFieldLength(oModifier, aContent, iAbsolutIndex);
						iAbsolutIndex += iActLength;
					}
					return iAbsolutIndex;
				}
			};

			var fnArrayRangeCopy = function(aSource, iSourceIndex, aTarget, iTargetIndex, iMovedLength) {
				var aResult = aTarget;
				for (var i = 0; i < iMovedLength; i++) {
					aResult.splice(iTargetIndex + i, 0, aSource[iSourceIndex + i]);
				}
				return aResult;
			};

			var fnMoveFormContainer = function(oSimpleForm, mMovedElement, oSource, oTarget, mPropertyBag) {

				var oMovedGroupTitle = fnGetGroupHeader(mMovedElement.element);
				var oSimpleFormSelector = JsControlTreeModifier.getSelector(oSimpleForm, mPropertyBag.appComponent);
				var mMovedSimpleFormElement = {
					elementSelector : JsControlTreeModifier.getSelector(oMovedGroupTitle, mPropertyBag.appComponent),
					source : {
						groupIndex : mMovedElement.sourceIndex
					},
					target : {
						groupIndex : mMovedElement.targetIndex
					}
				};

				return {
					changeType : MoveSimpleForm.CHANGE_TYPE_MOVE_GROUP,
					targetSelector : oSimpleFormSelector,
					movedElements : [mMovedSimpleFormElement]
				};

			};

			var fnGetGroupHeader = function(oHeader) {
				var oResult = oHeader.getTitle();
				if (!oResult) {
					oResult = oHeader.getToolbar();
				}
				return oResult;
			};

			var fnMoveFormElement = function(oSimpleForm, mMovedElement, oSource, oTarget, mPropertyBag) {

				var oSimpleFormSelector = JsControlTreeModifier.getSelector(oSimpleForm, mPropertyBag.appComponent);
				var oLabelSelector = JsControlTreeModifier.getSelector(mMovedElement.element.getLabel(), mPropertyBag.appComponent);
				var oTargetGroupHeader = fnGetGroupHeader(oTarget.parent);
				var oSourceGroupHeader = fnGetGroupHeader(oSource.parent);
				var oTargetGroupSelector = JsControlTreeModifier.getSelector(oTargetGroupHeader, mPropertyBag.appComponent);
				var oSourceGroupSelector = JsControlTreeModifier.getSelector(oSourceGroupHeader, mPropertyBag.appComponent);

				var oMovedElement = {
					element : oLabelSelector,
					source : {
						groupSelector : oSourceGroupSelector,
						fieldIndex : mMovedElement.sourceIndex
					},
					target : {
						groupSelector : oTargetGroupSelector,
						fieldIndex : mMovedElement.targetIndex
					}
				};

				return {
					changeType : MoveSimpleForm.CHANGE_TYPE_MOVE_FIELD,
					targetSelector : oSimpleFormSelector,
					movedElements : [oMovedElement]
				};

			};

			return MoveSimpleForm;
		},
		/* bExport= */true);
