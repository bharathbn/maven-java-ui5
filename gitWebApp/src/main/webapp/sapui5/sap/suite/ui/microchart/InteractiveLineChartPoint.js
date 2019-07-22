/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Element'],function(q,l,E){"use strict";var I=E.extend("sap.suite.ui.microchart.InteractiveLineChartPoint",{metadata:{library:"sap.suite.ui.microchart",properties:{label:{type:"string",group:"Misc",defaultValue:null},selected:{type:"boolean",group:"Appearance",defaultValue:false},value:{type:"float",group:"Data",defaultValue:null},displayedValue:{type:"string",group:"Data",defaultValue:null}}}});I.prototype.init=function(){this._bNullValue=true;};I.prototype.validateProperty=function(p,v){if(p==="value"&&(v===null||v===undefined)){this._bNullValue=true;}else if(p==="value"){this._bNullValue=false;}return E.prototype.validateProperty.apply(this,arguments);};return I;});
