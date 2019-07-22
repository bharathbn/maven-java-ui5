/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/fl/Utils','jquery.sap.global','sap/ui/fl/changeHandler/Base'],function(U,q,B){"use strict";var R={};R.applyChange=function(c,C,p){var m=p.modifier;var c=c.getDefinition();if(c.texts&&c.texts.groupLabel&&this._isProvided(c.texts.groupLabel.value)){if(!C){throw new Error("no Control provided for renaming");}var g=c.texts.groupLabel.value;if(U.isBinding(g)){m.setPropertyBinding(C,"label",g);}else{m.setProperty(C,"label",g);}return true;}else{U.log.error("Change does not contain sufficient information to be applied: ["+c.layer+"]"+c.namespace+"/"+c.fileName+"."+c.fileType);}};R.completeChangeContent=function(c,s){var C=c.getDefinition();if(this._isProvided(s.value)){B.setTextInChange(C,"groupLabel",s.value,"XFLD");}else{throw new Error("oSpecificChangeInfo.value attribute required");}};R._isProvided=function(s){return typeof(s)==="string";};return R;},true);
