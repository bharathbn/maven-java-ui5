/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";var O={handleModelInit:function(s,m){var l=false,M;if(s&&!s._bMetaModelLoadAttached&&m){M=s.getModel();if(M){if(M.getMetadata()&&M.getMetadata().getName()==="sap.ui.model.odata.v2.ODataModel"){l=true;}else if(M.bLoadMetadataAsync||(M.getServiceMetadata&&!M.getServiceMetadata())){l=true;}s._bMetaModelLoadAttached=true;if(l&&M.getMetaModel()&&M.getMetaModel().loaded){M.getMetaModel().loaded().then(m.bind(s));}else{m.apply(s);}}}}};return O;},true);
