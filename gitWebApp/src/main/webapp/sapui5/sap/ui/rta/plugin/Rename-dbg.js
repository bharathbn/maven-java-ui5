/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides class sap.ui.rta.plugin.Rename.
sap.ui.define(['jquery.sap.global', 'sap/ui/dt/Plugin', 'sap/ui/dt/ElementUtil', 'sap/ui/dt/OverlayUtil',
		'sap/ui/dt/OverlayRegistry', 'sap/ui/rta/Utils', 'sap/ui/dt/DOMUtil'],
		function(jQuery, Plugin, ElementUtil, OverlayUtil, OverlayRegistry, Utils, DOMUtil) {
	"use strict";

	/**
	 * Constructor for a new Rename.
	 *
	 * @param {string}
	 *          [sId] id for the new object, generated automatically if no id is given
	 * @param {object}
	 *          [mSettings] initial settings for the new object
	 *
	 * @class The Rename allows to create a set of Overlays above the root elements and theire public children and manage
	 *        their events.
	 * @extends sap.ui.dt.Plugin
	 *
	 * @author SAP SE
	 * @version 1.44.4
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.plugin.Rename
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Rename = Plugin.extend("sap.ui.rta.plugin.Rename", /** @lends sap.ui.rta.plugin.Rename.prototype */
	{
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.rta",
			properties : {
				oldValue : "string"
			},
			associations : {},
			events : {
				/** Fired when renaming is possible */
				"editable" : {},

				/** Fired when renaming is switched off */
				"nonEditable" : {}
			}
		}
	});

	/**
	 * @override
	 */
	Rename.prototype.exit = function() {
		Plugin.prototype.exit.apply(this, arguments);

		if (this._$oEditableControlDomRef) {
			this._stopEdit();
		}

		clearTimeout(this._iStopTimeout);
	};

	/**
	 * @override
	 */
	Rename.prototype.setDesignTime = function(oDesignTime) {
		this._aSelection = [];
		var oOldDesignTime = this.getDesignTime();

		if (oOldDesignTime) {
			oOldDesignTime.detachSelectionChange(this._onDesignTimeSelectionChange, this);
		}
		Plugin.prototype.setDesignTime.apply(this, arguments);

		if (oDesignTime) {
			oDesignTime.attachSelectionChange(this._onDesignTimeSelectionChange, this);
			this._aSelection = oDesignTime.getSelection();
		}
	};

	/**
	 * @private
	 */
	Rename.prototype._getEffectiveDesignTimeMetadata = function(oOverlay) {
		var oDesignTimeMetadata;
		if (oOverlay.isInHiddenTree()) {
			var oPublicParentAggregationOverlay = oOverlay.getPublicParentAggregationOverlay();
			if (oPublicParentAggregationOverlay) {
				oDesignTimeMetadata = oPublicParentAggregationOverlay.getDesignTimeMetadata();
			}
		} else {
			oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		}
		return oDesignTimeMetadata;
	};

	/**
	 * @private
	 */
	Rename.prototype._getRenameAction = function(oOverlay) {
		var oDesignTimeMetadata = this._getEffectiveDesignTimeMetadata(oOverlay);
		if (oDesignTimeMetadata && oDesignTimeMetadata.getAction) {
			return oDesignTimeMetadata.getAction("rename", oOverlay.getElementInstance());
		} else {
			return;
		}
	};

	/**
	 * Checks if rename is available for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @public
	 */
	Rename.prototype.isRenameAvailable = function(oOverlay) {
		var vRenameAction = this._getRenameAction(oOverlay);
		if (vRenameAction) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Checks if rename is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @public
	 */
	Rename.prototype.isRenameEnabled = function(oOverlay) {
		var oAction = this._getRenameAction(oOverlay);
		if (!oAction) {
			return false;
		}

		if (typeof oAction.isEnabled !== "undefined") {
			if (typeof oAction.isEnabled === "function") {
				return oAction.isEnabled(oOverlay.getElementInstance());
			} else {
				return oAction.isEnabled;
			}
		}
		return true;
	};

	/**
	 * @override
	 */
	Rename.prototype.registerElementOverlay = function(oOverlay) {
		oOverlay.attachEvent("editableChange", this._manageClickEvent, this);

		if (this.isRenameAvailable(oOverlay)) {
			oOverlay.setEditable(true);
		}
	};

	/**
	 * @override
	 */
	Rename.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachEvent("editableChange", this._manageClickEvent, this);
		oOverlay.detachBrowserEvent("click", this._onClick, this);
	};

	/**
	 * @private
	 */
	Rename.prototype._onClick = function(oEvent) {
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		if (this.isRenameEnabled(oOverlay)) {
			this.startEdit(oOverlay);
			oEvent.preventDefault();
		}
	};

	/**
	 * @override
	 */
	Rename.prototype._onDesignTimeSelectionChange = function(oEvent) {
		var that = this;
		var aSelection = oEvent.getParameter("selection");

		// merge all overlays from old and current selection together
		aSelection.forEach(function(oOverlay) {
			if (that._aSelection.indexOf(oOverlay) === -1) {
				that._aSelection.push(oOverlay);
			}
		});
		that._aSelection.forEach(this._manageClickEvent, this);
	};

	/**
	 * @override
	 */
	Rename.prototype._manageClickEvent = function(vEventOrElement) {
		var oOverlay = vEventOrElement.getSource ? vEventOrElement.getSource() : vEventOrElement;
		if (oOverlay.isSelected() && this.isRenameAvailable(oOverlay)) {
			oOverlay.attachBrowserEvent("click", this._onClick, this);
		} else {
			oOverlay.detachBrowserEvent("click", this._onClick, this);
		}
	};

	/**
	 * [startEdit description]
	 *
	 * @param {[type]}
	 *          oOverlay [description]
	 * @return {[type]} [description]
	 * @public
	 */
	Rename.prototype.startEdit = function(oOverlay) {

		this._oEditedOverlay = oOverlay;

		var oElement = oOverlay.getElementInstance();
		var oDesignTimeMetadata = this._getEffectiveDesignTimeMetadata(this._oEditedOverlay);
		var vDomRef = oDesignTimeMetadata.getAction("rename", oElement).domRef;

		var oEditableControlDomRef = oDesignTimeMetadata.getAssociatedDomRef(oElement, vDomRef);

		this._$oEditableControlDomRef = jQuery(oEditableControlDomRef);

		var oEditableControlOverlay = sap.ui.dt.OverlayRegistry.getOverlay(oEditableControlDomRef.id) || oOverlay;

		var oWrapper = jQuery("<div class='sapUiRtaEditableField'></div>").appendTo(oEditableControlOverlay.$());
		this._$editableField = jQuery("<div contentEditable='true'></div>").appendTo(oWrapper);

		// if label is empty, set a preliminary dummy text at the control to get an overlay
		if (this._$oEditableControlDomRef.text() === "") {
			this._$oEditableControlDomRef.text("_?_");
			this._$editableField.text("");
		} else {
			this._$editableField.text(this._$oEditableControlDomRef.text());
		}

		DOMUtil.copyComputedStyles(this._$oEditableControlDomRef, this._$editableField);
		this._$editableField.children().remove();

		// TODO : for all browsers
		this._$editableField.css({
			"-moz-user-modify" : "read-write",
			"-webkit-user-modify" : "read-write",
			"-ms-user-modify" : "read-write",
			"user-modify" : "read-write",
			"text-overflow" : "clip",
			"margin-top" : parseInt(this._$editableField.css("margin-top"), 10) - 1 + "px",
			"margin-left" : parseInt(this._$editableField.css("margin-left"), 10) - 1 + "px"
		});

		this._$oEditableControlDomRef.css("visibility", "hidden");

		this._$editableField.one("focus", this._onEditableFieldFocus.bind(this));

		this._$editableField.on("blur", this._onEditableFieldBlur.bind(this));
		this._$editableField.on("keydown", this._onEditableFieldKeydown.bind(this));
		this._$editableField.on("dragstart", this._stopPropagation.bind(this));
		this._$editableField.on("drag", this._stopPropagation.bind(this));
		this._$editableField.on("dragend", this._stopPropagation.bind(this));

		this._$editableField.on("click", this._stopPropagation.bind(this));
		this._$editableField.on("mousedown", this._stopPropagation.bind(this));

		this._$editableField.focus();

		this.setOldValue(this._getCurrentEditableFieldText());
	};

	/**
	 * @private
	 */
	Rename.prototype._stopPropagation = function(oEvent) {
		oEvent.stopPropagation();
	};

	/**
	 * @private
	 */
	Rename.prototype._onEditableFieldFocus = function(oEvent) {
		this._oEditedOverlay.setSelected(false);
		var el = oEvent.target;
		var range = document.createRange();
		range.selectNodeContents(el);
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	};

	/**
	 * @private
	 */
	Rename.prototype._stopEdit = function(bRestoreFocus) {
		// exchange the dummy text at the label with the genuine empty text (see start_edit function)
		if (this._$oEditableControlDomRef.text() === "_?_") {
			this._$oEditableControlDomRef.text("");
		}

		this._oEditedOverlay.$().find(".sapUiRtaEditableField").remove();
		this._$oEditableControlDomRef.css("visibility", "visible");

		if (bRestoreFocus) {
			var oOverlay = this._oEditedOverlay;

			// timeout is needed because of invalidation (test on bounded fields)
			this._iStopTimeout = setTimeout(function() {
				oOverlay.setSelected(true);
				oOverlay.focus();
			}, 0);
		}

		delete this._$editableField;
		delete this._$oEditableControlDomRef;
		delete this._oEditedOverlay;
	};

	/**
	 * @private
	 */
	Rename.prototype._onEditableFieldBlur = function(oEvent) {
		this._emitLabelChangeEvent();
		this._stopEdit();
	};

	/**
	 * @private
	 */
	Rename.prototype._onEditableFieldKeydown = function(oEvent) {
		if (oEvent.keyCode === jQuery.sap.KeyCodes.ENTER) {
			oEvent.preventDefault();

			this._emitLabelChangeEvent();
			this._stopEdit(true);
		} else if (oEvent.keyCode === jQuery.sap.KeyCodes.ESCAPE) {
			oEvent.preventDefault();
			this._stopEdit(true);
		}
	};

	/**
	 * @private
	 */
	Rename.prototype._emitLabelChangeEvent = function() {
		var sText = this._getCurrentEditableFieldText();
		if (this.getOldValue() !== sText) { //check for real change before creating a command
			this._$oEditableControlDomRef.text(sText);
			try {
				var oRenameCommand;
				var oElement;
				var oRenamedElement = this._oEditedOverlay.getElementInstance();
				var oDesignTimeMetadata = this._getEffectiveDesignTimeMetadata(this._oEditedOverlay);

				if (this._oEditedOverlay.isInHiddenTree()) {
					oElement = this._oEditedOverlay.getPublicParentElementOverlay().getElementInstance();
				} else {
					oElement = oRenamedElement;
				}

				oRenameCommand = this.getCommandFactory().getCommandFor(oElement, "rename", {
					renamedElement : oRenamedElement,
					newValue : sText
				}, oDesignTimeMetadata);
				this.fireElementModified({
					"command" : oRenameCommand
				});
			} catch (oError) {
				jQuery.sap.log.error("Error during rename : ", oError);
			}
		}
	};

	/**
	 * @private
	 */
	Rename.prototype._getCurrentEditableFieldText = function() {
		return this._$editableField.text();
	};

	return Rename;
}, /* bExport= */true);
