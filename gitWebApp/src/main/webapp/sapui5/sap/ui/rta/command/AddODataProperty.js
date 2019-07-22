/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/rta/command/FlexCommand','sap/ui/rta/controlAnalyzer/ControlAnalyzerFactory',"sap/ui/fl/Utils","sap/ui/fl/changeHandler/BaseTreeModifier"],function(q,F,C,a,B){"use strict";var A=F.extend("sap.ui.rta.command.AddODataProperty",{metadata:{library:"sap.ui.rta",properties:{index:{type:"int"},newControlId:{type:"string"},label:{type:"string"},bindingString:{type:"string"}}}});A.prototype._getSpecificChangeInfo=function(){return{changeType:this.getChangeType(),index:this.getIndex(),newControlId:this.getNewControlId(),label:this.getLabel(),bindingPath:this.getBindingString()};};A.prototype._getFlexChange=function(){var s=this._getSpecificChangeInfo();var c=this._completeChangeContent(s);return{change:c,selectorElement:this._getElement()};};A.prototype._getForwardActionData=function(e){return this._getFlexChange();};A.prototype.undo=function(){var s=this.getNewControlId();var o=sap.ui.getCore().byId(s);if(o){o.destroy();}};A.prototype.serialize=function(){return this._getSpecificChangeInfo();};return A;},true);
