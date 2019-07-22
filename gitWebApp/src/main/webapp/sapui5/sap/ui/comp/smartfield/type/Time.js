/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/model/odata/type/Time"],function(T){"use strict";var a=T.extend("sap.ui.comp.smartfield.type.Time",{constructor:function(f,c){T.apply(this,[f,c]);this.oFieldControl=null;}});a.prototype.parseValue=function(v,s){var r=T.prototype.parseValue.apply(this,[v,s]);this.oFieldControl(v,s);return r;};a.prototype.getName=function(){return"sap.ui.comp.smartfield.type.Time";};return a;});
