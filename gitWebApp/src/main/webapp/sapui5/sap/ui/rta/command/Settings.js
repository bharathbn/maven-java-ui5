/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/rta/command/FlexCommand'],function(F){"use strict";var S=F.extend("sap.ui.rta.command.Settings",{metadata:{library:"sap.ui.rta",properties:{content:{type:"any"}},associations:{},events:{}}});S.FORWARD=true;S.BACKWARD=false;S.prototype._getSpecificChangeInfo=function(f){var s={changeType:this.getChangeType(),content:this.getContent()};return s;};S.prototype._getFlexChange=function(f){var s=this._getSpecificChangeInfo(f);var c=this._completeChangeContent(s);return{change:c,selectorElement:this._getElement()};};S.prototype._getForwardActionData=function(e){return this._getFlexChange(S.FORWARD);};S.prototype._getBackwardActionData=function(e){return this._getFlexChange(S.BACKWARD);};S.prototype.serialize=function(){return this._getSpecificChangeInfo(S.FORWARD);};S.prototype.execute=function(){if(this.getElement().getMetadata){F.prototype.execute.apply(this,arguments);}};S.prototype.undo=function(){if(this.getElement().getMetadata){F.prototype.undo.apply(this,arguments);}};return S;},true);
