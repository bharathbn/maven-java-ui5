/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/base/ManagedObject','sap/ui/rta/command/Stack','sap/ui/fl/FlexControllerFactory'],function(M,C,F){"use strict";var L=M.extend("sap.ui.rta.command.LREPSerializer",{metadata:{library:"sap.ui.rta",associations:{"rootControl":{type:"sap.ui.core.Control"}},properties:{"commandStack":{type:"object"}},aggregations:{}}});L.prototype.saveCommands=function(){var c=this.getCommandStack();var r=sap.ui.getCore().byId(this.getRootControl());var f=F.createForControl(r);var a=c.getSerializableCommands();a.forEach(function(o,i){var e=o.getElement();var p=o.getPreparedActionData();if(p){f.addPreparedChange(p.change||p,e);}else{f.addChange(o.serialize(),e);}});var t=this;return f.saveAll().then(function(){jQuery.sap.log.info("UI adaptation successfully transfered changes to layered repository");t.getCommandStack().removeAllCommands();});};return L;},true);
