/* global QUnit */
/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/ComponentContainer", "sap/ui/core/mvc/XMLView",
	"sap/ui/rta/command/CommandFactory", "sap/ui/dt/ElementUtil", "sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/fl/ChangePersistenceFactory", "sap/ui/fl/ChangePersistence"],
	function(UIComponent, ComponentContainer, XMLView,
		CommandFactory, ElementUtil, ElementDesignTimeMetadata,
		ChangePersistenceFactory, ChangePersistence){

		"use strict";

		/**
		 * Utility function which builds and registers QUnit tests to check if a SAPUI5 control is ready for UI adaptation at runtime (RTA)
		 *
		 * See <code>RTAControlEnabling.qunit.html<\code> and <code>RTAControlEnabling.qunit.js<\code> as an example on how to use.
		 *
		 * During development you may insert ".skip" to ommit processing of a specific control enabling check:
		 * <code>controlEnablingCheck.skip(...);<\code> instead of <code>controlEnablingCheck(...);<\code>.
		 *
		 * Use <code>controlEnablingCheck.only( sMsgSubstring );<\code> to specify that only some tests are to be executed:
		 * E.g. <code>controlEnablingCheck.only("Remove");<\code>
		 *
		 * @author SAP SE
		 * @version 1.44.4
		 *
		 * @static
		 * @since 1.42
		 * @alias sap.ui.rta.test.controlEnablingCheck
		 *
		 * @param {string}   sMsg - name of QUnit test - e.g. Checking the move action for the sap.ui.comp.smartform.GroupElement control
		 * @param {object}   mOptions - configuration for this controlEnablingCheck
		 * @param {string}   mOptions.xmlView - XML view to adapt
		 * @param {string}   [mOptions.placeAt="content"] - Id of tag to place view at runtime
		 * @param {object}   mOptions.action - action to operate on <code>mOptions.xmlView</code>
		 * @param {string}   mOptions.action.name - name of the action - e.g. 'remove', 'move', 'rename'
		 * @param {string}   mOptions.action.controlId - id of the control the action is executed with - may be the parent of the control beeing 'touched'
		 * @param {function} mOptions.action.parameter - function(oView) returning the parameter object of the action to be executed
		 * @param {function} mOptions.afterAction - function(oUiComponent, oView, assert) which checks the outcome of the action
		 * @param {function} mOptions.afterUndo - function(oUiComponent, oView, assert) which checks the execution of the action and an immediate undo
		 * @param {function} mOptions.afterRedo - function(oUiComponent, oView, assert) which checks the outcome of action with immediate undo and redo
		 */
		var controlEnablingCheck = function(sMsg, mOptions){

			// Return if controlEnablingCheck.only() has been used to exclude this call
			if (controlEnablingCheck._only && (sMsg.indexOf(controlEnablingCheck._only) < 0)) { return; }

			// Do QUnit tests
			QUnit.module(sMsg, {});

			QUnit.test("When using the 'controlEnablingCheck' function to test if your control is ready for UI adaptation at runtime", function(assert){
				assert.ok(mOptions.afterAction, "then you implement a function to check if your action has been successful: See the afterAction parameter.");
				assert.ok(mOptions.afterUndo, "then you implement a function to check if the undo has been successful: See the afterUndo parameter.");
				assert.ok(mOptions.afterRedo, "then you implement a function to check if the redo has been successful: See the afterRedo parameter.");
				assert.ok(mOptions.xmlView, "then you provide an XML view to test on: See the.xmlView parameter.");

				var oXmlView = new DOMParser().parseFromString(mOptions.xmlView, "application/xml").childNodes[0];
				assert.ok(oXmlView.tagName.match( "View$"),"then you use the sap.ui.core.mvc View tag as the first tag in your view");

				assert.ok(mOptions.action, "then you provide an action: See the action parameter.");
				assert.ok(mOptions.action.name, "then you provide an action name: See the action.name parameter.");
				assert.ok(mOptions.action.controlId, "then you provide the id of the control to operate the action on: See the action.controlId.");
				assert.ok(mOptions.action.parameter, "then you provide parameters for the action: See the action.parameter object.");
			});

			QUnit.module(sMsg, {
				beforeEach : function(assert){
					var that = this;

					// Create UI component containing the view to adapt
					var Comp = UIComponent.extend("sap.ui.rta.control.enabling.comp",{
						metadata: {
							manifest : {
								"sap.app": {
									"id": "sap.ui.rta.control.enabling.comp",
									"type": "application"
								}
							}
						},
						createContent : function() {
							// store it in outer scope
							that.oView = sap.ui.xmlview({
								 id : this.createId("view"),
								 viewContent : mOptions.xmlView
							 });
							 return that.oView;
						}

					});
					this.oUiComponent = new Comp("comp");

					// Place component in container and display
					this.oUiComponentContainer = new ComponentContainer({
						component : this.oUiComponent
					});
					this.oUiComponentContainer.placeAt(mOptions.placeAt || "content");

					sap.ui.getCore().applyChanges();

					// Fetch command to operate - as well as its parameters, its control with design time meta data
					this.oControl = this.oView.byId(mOptions.action.controlId);
					return ElementUtil.loadDesignTimeMetadata(this.oControl).then(function(oDesignTimeMetadata) {
						var oElementDesignTimeMetadata = new ElementDesignTimeMetadata({ data : oDesignTimeMetadata});

						var mParameter =  mOptions.action.parameter(that.oView);
						that.oCommand = CommandFactory.getCommandFor(that.oControl, mOptions.action.name, mParameter, oElementDesignTimeMetadata);

						assert.ok(that.oCommand, "then the underlying command is available");
					});
				},
				afterEach : function(){
					this.oUiComponentContainer.destroy();
				}
			});

			/*
			// Apply change on XML view
			// Commented as not yet supported by sap.ui.fl library and XML view processing of SAPUI5 core

			QUnit.test("When applying the change directly on the XMLView", function(assert){

				// Register prepocessor of sap.ui.fl library for xml view processing to support ui changes
				XMLView.registerPreprocessor('viewxml', "sap.ui.fl.Preprocessor", true); // false);

				// Activate UI change
				var oChange = this.oCommand.getPreparedActionData();
				var aChanges = [ oChange ];
				var sUiComponentName = "sap.ui.rta.control.enabling.componentWithChangedXmlView";
				var oChangePersistence = new ChangePersistence(sUiComponentName);
				this.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);
				var oChangePersistenceMock = this.stub(oChangePersistence, "getChangesForComponent").returns(Promise.resolve(aChanges));  // returns(aChanges); //returns(Promise.resolve(aChanges));

				// Instantiate xml view with UI change
				var that = this;
				var UiComponentWithChangedXmlView = UIComponent.extend(sUiComponentName,{
					metadata: {
						manifest : {
							"sap.app": {
								"id": sUiComponentName,
								"type": "application"
							}
						}
					},
					createContent : function() {
						// store it in outer scope
						that.oViewFromChangedXml = sap.ui.xmlview({
							 id : this.createId("viewFromChangedXml"),
							 viewContent : mOptions.xmlView,
							 async : true
						 });
						 return that.oViewFromChangedXml;
					}

				});
				this.oUiComponentWithChangedXmlView = new UiComponentWithChangedXmlView("componentWithChangedXmlView");

				// Put view in UI component within UI component container and display
				this.oUiComponentContainer = new ComponentContainer({
					component : this.oUiComponentWithChangedXmlView
				});
				this.oUiComponentContainer.placeAt(mOptions.placeAt || "content");

				sap.ui.getCore().applyChanges();

				// Verify that UI change has been applied on XML view
				mOptions.afterAction(this.oUiComponent, that.oViewFromChangedXml, assert);
			});
			*/

			/*
			Alternate approach to apply a change on an XML view: Here the check is to be done with the XMLTreeModifier
			sap.ui.define(	[ ... "sap/ui/core/XMLTemplateProcessor", ..., "sap/ui/fl/changeHandler/XmlTreeModifier", "sap/ui/fl/changeHandler/JsControlTreeModifier" ],
				function(... XMLTemplateProcessor, ..., XmlTreeModifier, JsControlTreeModifier) {...
			QUnit.test("When applying the change directly on the XMLView", function(assert){

					// Create parsed xml view with extended ids
					var oXmlView = new DOMParser().parseFromString(mOptions.xmlView, "application/xml").childNodes[0];
					var oXmlViewWithExtendedIds = XMLTemplateProcessor.enrichTemplateIds( oXmlView, this.oView);

					// Apply change on xml view
					var oChange = this.oCommand.getPreparedActionData();
					var oChangeHandler = this.oCommand.getChangeHandler();
					var oXmlControl = XmlTreeModifier.bySelector(oChange.getSelector(), this.oUiComponent, oXmlViewWithExtendedIds);
					oChangeHandler.applyChange(oChange, oXmlControl, { modifier : XmlTreeModifier, appComponent : this.oUiComponent, view : oXmlViewWithExtendedIds });
					sap.ui.getCore().applyChanges();

					// Verify result
					mOptions.afterAction(this.oUiComponent, oXmlViewWithExtendedIds, XmlTreeModifier, assert);
			});
			... );
			*/

			QUnit.test("When executing the underlying command on the control at runtime", function(assert){

				// Execute the command
				this.oCommand.execute();
				sap.ui.getCore().applyChanges();

				// Verfify result
				mOptions.afterAction(this.oUiComponent, this.oView, assert);
			});

			QUnit.test("When executing and undoing the command", function(assert){
				this.oCommand.execute();
				this.oCommand.undo();
				sap.ui.getCore().applyChanges();
				mOptions.afterUndo(this.oUiComponent, this.oView, assert);
			});

			QUnit.test("When executing, undoing and redoing the command", function(assert){
				this.oCommand.execute();
				this.oCommand.undo();
				sap.ui.getCore().applyChanges();
				this.oCommand.execute();
				mOptions.afterRedo(this.oUiComponent, this.oView, assert);

			});

		 };

		controlEnablingCheck.skip = function() {};
		controlEnablingCheck.only = function(sMsgSubstring) { controlEnablingCheck._only = sMsgSubstring; };

		return controlEnablingCheck;

	},
	/* bExport= */ true
);
