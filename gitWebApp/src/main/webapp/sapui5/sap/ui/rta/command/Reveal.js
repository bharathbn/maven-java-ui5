/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand'],function(F){"use strict";var R=F.extend("sap.ui.rta.command.Reveal",{metadata:{library:"sap.ui.rta",properties:{revealedElementId:{type:"string"},hiddenParent:"object"}}});R.prototype._getSpecificChangeInfo=function(){var s={changeType:this.getChangeType()};if(this.getRevealedElementId()){s.revealedElementId=this.getRevealedElementId();}return s;};R.prototype._getFlexChange=function(e){var p=this.getPreparedActionData();if(!p){var s=this._getSpecificChangeInfo();var r=sap.ui.getCore().byId(this.getRevealedElementId());var c=this._completeChangeContent(s);p={change:c,selectorElement:r};}return p;};R.prototype._getForwardActionData=function(e){return this._getFlexChange(e);};return R;},true);
