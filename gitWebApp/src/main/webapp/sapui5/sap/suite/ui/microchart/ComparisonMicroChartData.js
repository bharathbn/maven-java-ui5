/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Element'],function(q,l,E){"use strict";var C=E.extend("sap.suite.ui.microchart.ComparisonMicroChartData",{metadata:{library:"sap.suite.ui.microchart",properties:{value:{type:"float",group:"Misc",defaultValue:"0"},color:{type:"sap.m.ValueColor",group:"Misc",defaultValue:"Neutral"},title:{type:"string",group:"Misc",defaultValue:""},displayValue:{type:"string",group:"Misc",defaultValue:""}},events:{press:{}}}});C.prototype.setValue=function(v,s){this._isValueSet=this._fnIsNumber(v);return this.setProperty("value",this._isValueSet?v:NaN,s);};C.prototype._fnIsNumber=function(n){return typeof n=='number'&&!isNaN(n)&&isFinite(n);};C.prototype.clone=function(i,L,o){var c=sap.ui.core.Control.prototype.clone.apply(this,arguments);c._isValueSet=this._isValueSet;return c;};C.prototype.attachEvent=function(e,d,f,L){sap.ui.core.Control.prototype.attachEvent.call(this,e,d,f,L);if(this.getParent()){this.getParent().setBarPressable(this.getParent().getData().indexOf(this),true);}return this;};C.prototype.detachEvent=function(e,f,L){sap.ui.core.Control.prototype.detachEvent.call(this,e,f,L);if(this.getParent()){this.getParent().setBarPressable(this.getParent().getData().indexOf(this),false);}return this;};return C;});
