/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Element'],function(q,l,E){"use strict";var B=E.extend("sap.suite.ui.microchart.BulletMicroChartData",{metadata:{library:"sap.suite.ui.microchart",properties:{value:{type:"float",group:"Misc",defaultValue:"0"},color:{type:"sap.m.ValueColor",group:"Misc",defaultValue:"Neutral"}}}});B.prototype.setValue=function(v,s){this._isValueSet=this._fnIsNumber(v);return this.setProperty("value",this._isValueSet?v:NaN,s);};B.prototype._fnIsNumber=function(n){return typeof n=='number'&&!isNaN(n)&&isFinite(n);};B.prototype.clone=function(i,L,o){var c=sap.ui.core.Control.prototype.clone.apply(this,arguments);c._isValueSet=this._isValueSet;return c;};return B;});
