/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global','sap/ui/comp/library','sap/ui/core/Element','sap/ui/model/FilterOperator'],function(q,l,E,F){"use strict";var S=E.extend("sap.ui.comp.smartfilterbar.SelectOption",{metadata:{library:"sap.ui.comp",properties:{sign:{type:"sap.ui.comp.smartfilterbar.SelectOptionSign",group:"Misc",defaultValue:'I'},operator:{type:"sap.ui.model.FilterOperator",group:"Misc",defaultValue:'EQ'},low:{type:"string",group:"Misc",defaultValue:null},high:{type:"string",group:"Misc",defaultValue:null}}}});S.SIGN=sap.ui.comp.smartfilterbar.SelectOptionSign;S.OPERATOR=F;return S;},true);
