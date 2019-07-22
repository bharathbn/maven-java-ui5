/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
 */

// Provides the Design Time Metadata for the sap.ui.comp.smartfilerbar.SmartFilterBar control.
sap.ui.define([], function() {
	"use strict";
	return {
		annotations: {
			/**
			 * Defines whether a <code>Property</code> can be used for filtering data. All properties are filterable by default. In order to disable
			 * filtering capability, these properties must be excluded. <b>Note:</b> Support for V4 annotation is added since SAPUI5 version 1.40.
			 * <i>XML Example of OData V4 with Excluded Customer and CompanyCode Properties</i>
			 * 
			 * <pre>
			 *    &lt;Annotation Term=&quot;Org.OData.Capabilities.V1.FilterRestrictions&quot;&gt;
			 *      &lt;PropertyValue Property=&quot;NonFilterableProperties&quot;&gt;
			 *        &lt;Collection&gt;
			 *          &lt;PropertyPath&gt;Customer&lt;/PropertyPath&gt;
			 *          &lt;PropertyPath&gt;CompanyCode&lt;/PropertyPath&gt;
			 *        &lt;/Collection&gt;
			 *      &lt;/PropertyValue&gt;
			 *    &lt;/Annotation&gt;
			 * </pre>
			 * 
			 * For OData v2 the <code>sap:filterable</code> annotation on the <code>Property</code> can be used to exclude properties from
			 * filtering.
			 * 
			 * <pre>
			 *    &lt;Property Name=&quot;Customer&quot; ... sap:filterable=&quot;false&quot;/&gt;
			 *    &lt;Property Name=&quot;CompanyCode&quot; ... sap:filterable=&quot;false&quot;/&gt;
			 * </pre>
			 */
			filterable: {
				namespace: "Org.OData.Capabilities.V1",
				annotation: "FilterRestrictions/NonFilterableProperties",
				target: [
					"EntitySet"
				],
				defaultValue: true,
				interpretation: "exclude",
				appliesTo: [
					"filterItem/#/value"
				],
				group: [
					"Behavior"
				],
				since: "1.28.1"
			},

			/**
			 * Defines a group for a filter field. The value can be provided as a fixed or dynamic value of an enumeration by referencing another
			 * <code>Property</code> within the same <code>EntityType</code>. <i>XML Example for OData V4 with CompanyName and CompanyCode
			 * Properties</i>
			 * 
			 * <pre>
			 *    &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.FieldGroup&quot; Qualifier=&quot;FieldGroup1&quot;&gt;
			 *      &lt;Record&gt;
			 *        &lt;PropertyValue Property=&quot;Label&quot; String=&quot;my Field Group 1&quot; /&gt;
			 *        &lt;PropertyValue Property=&quot;Data&quot;&gt;
			 *          &lt;Collection&gt;
			 *            &lt;PropertyPath&gt;CompanyName&lt;/PropertyPath&gt;
			 *            &lt;PropertyPath&gt;CompanyCode&lt;/PropertyPath&gt;
			 *          &lt;/Collection&gt;
			 *        &lt;/PropertyValue&gt;
			 *      &lt;/Record&gt;
			 *    &lt;/Annotation&gt;
			 * </pre>
			 */
			fieldGroup: {
				namespace: "com.sap.vocabularies.UI.v1",
				annotation: "FieldGroup",
				target: [
					"EntityType"
				],
				defaultValue: null,
				appliesTo: [
					"filterGroupItem"
				],
				group: [
					"Behavior"
				],
				since: "1.28.1"
			},

			/**
			 * Describes the arrangement of a code value and its text. The value can be provided as a fixed or dynamic value of an enumeration by
			 * referencing another <code>Property</code> within the same <code>EntityType</code>. The enumeration members can have the following
			 * values:
			 * <ul>
			 * <li><code>com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst</code><br>
			 * The underlying control is represented with the specified description followed by its ID. </li>
			 * <li><code>com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly</code><br>
			 * The underlying control is represented with the specified description only. </li>
			 * </ul>
			 * <i>XML Example of OData V4 with EntityType ProductType</i>
			 * 
			 * <pre>
			 *    &lt;Annotations Target=&quot;ProductType&quot;&gt;
			 *      &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.TextArrangement&quot; EnumMember=&quot;com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst&quot;/&gt;
			 *    &lt;/Annotations&gt;
			 * </pre>
			 */
			textArrangement: {
				namespace: "com.sap.vocabularies.UI.v1",
				annotation: "TextArrangement",
				target: [
					"EntityType"
				],
				defaultValue: null,
				appliesTo: [
					"text"
				],
				group: [
					"Appearance", "Behavior"
				],
				since: "1.32.1"
			},

			/**
			 * Defines whether the filter is visible. The SmartFilterBar interprets the <code>EnumMember</code> <code>FieldControlType/Hidden</code>
			 * of the <code>FieldControl</code> annotation for setting the visibility. <b>Note:</b> Currently only
			 * <code>FieldControlType/Hidden</code> is supported for statically hiding the filter fields. <i>XML Example of OData V4 with Hidden
			 * Customer and CompanyCode Properties</i>
			 * 
			 * <pre>
			 *    &lt;Property Name=&quot;Customer&quot;&gt;
			 *      &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.FieldControlType/Hidden&quot;/&gt;
			 *    &lt;/Property&gt;
			 *    &lt;Property Name=&quot;CompanyCode&quot;&gt;
			 *      &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.FieldControlTpye/Hidden&quot;/&gt;
			 *    &lt;/Property&gt;
			 * </pre>
			 * 
			 * For OData v2 the <code>sap:visible</code> annotation on the <code>Property</code> can be used to assign visibility.
			 * 
			 * <pre>
			 *    &lt;Property Name=&quot;Customer&quot; ... sap:visible=&quot;false&quot;/&gt;
			 *    &lt;Property Name=&quot;CompanyCode&quot; ... sap:visible=&quot;false&quot;/&gt;
			 * </pre>
			 */
			filterVisible: {
				namespace: "com.sap.vocabularies.Common.v1",
				annotation: "FieldControlType/Hidden",
				target: [
					"Property"
				],
				defaultValue: false,
				appliesTo: [
					"filterItem/#/visible"
				],
				group: [
					"Behavior"
				],
				since: "1.32.1"
			},

			/**
			 * Contains annotations that provide information for rendering a <code>ValueHelpList</code> that are set on the <code>Property</code>.
			 * Each Parameter on the <code>ValueList</code> annotation has maximum of two properties:
			 * <ol>
			 * <li>LocalDataProperty - Path to the property on the local entity that triggered the ValueList.</li>
			 * <li>ValueListProperty - Path to property in on the ValueList entity.</li>
			 * </ol>
			 * <i>XML Example of OData V4 with Category having ValueList</i>
			 * 
			 * <pre>
			 *    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.ValueList&quot;&gt;
			 *      &lt;Record&gt;
			 *        &lt;PropertyValue Property=&quot;Label&quot; String=&quot;Category&quot; /&gt;
			 *        &lt;PropertyValue Property=&quot;CollectionPath&quot; String=&quot;Category&quot; /&gt;
			 *        &lt;PropertyValue Property=&quot;SearchSupported&quot; Bool=&quot;true&quot; /&gt;
			 *        &lt;PropertyValue Property=&quot;Parameters&quot;&gt;
			 *        &lt;Collection&gt;
			 *          &lt;Record Type=&quot;com.sap.vocabularies.Common.v1.ValueListParameterOut&quot;&gt;
			 *            &lt;PropertyValue Property=&quot;LocalDataProperty&quot; PropertyPath=&quot;Category&quot; /&gt;
			 *            &lt;PropertyValue Property=&quot;ValueListProperty&quot; String=&quot;Description&quot; /&gt;
			 *          &lt;/Record&gt;
			 *          &lt;Record Type=&quot;com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly&quot;&gt;
			 *            &lt;PropertyValue Property=&quot;ValueListProperty&quot; String=&quot;CategoryName&quot; /&gt;
			 *          &lt;/Record&gt;
			 *        &lt;/Collection&gt;
			 *      &lt;/Record&gt;
			 *    &lt;/Annotation&gt;
			 * </pre>
			 */
			valueList: {
				namespace: "com.sap.vocabularies.Common.v1",
				annotation: "ValueList",
				target: [
					"Property", "Parameter"
				],
				defaultValue: null,
				appliesTo: [
					"filterItem/#/fieldHelp"
				],
				group: [
					"Behavior"
				],
				since: "1.28.1"
			},

			/**
			 * A short, human-readable text suitable for the filter's name. The <code>com.sap.vocabularies.Common.v1.Label</code> annotation is
			 * defined on the <code>Property</code>. If the <code>com.sap.vocabularies.Common.v1.Label</code> annotation is given, it has
			 * precedence. If none of the annotations are given, then the label will be the Property name. <i>XML Example for OData V4 where
			 * CustomerName is the Label assigned to Customer</i>
			 * 
			 * <pre>
			 *    &lt;Property Name=&quot;Customer&quot; /&gt;
			 *    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.Label&quot; Path=&quot;Customer&quot; String=&quot;Customer Name&quot;/&gt;
			 * </pre>
			 * 
			 * For OData v2 the <code>sap:label</code> annotation on the <code>Property</code> can be used to define the label of the column.
			 * 
			 * <pre>
			 *    &lt;Property Name=&quot;Customer&quot; ... sap:label=&quot;Customer Name&quot;/&gt;
			 * </pre>
			 */
			filterLabelOnProperty: {
				namespace: "com.sap.vocabularies.Common.v1",
				annotation: "Label",
				target: [
					"Property", "PropertyPath"
				],
				defaultValue: null,
				appliesTo: [
					"filterItem/label"
				],
				group: [
					"Behavior"
				],
				since: "1.28.1"
			},

			/**
			 * A short, human-readable text suitable for the filter's name. The
			 * <code>Label<code> annotation of <code>com.sap.vocabularies.UI.v1.DataFieldAbstract</code> is defined within <code>com.sap.vocabularies.UI.v1.LineItem</code> annotation.
			 * If the <code>com.sap.vocabularies.Common.v1.Label</code> annotation is given, it has precedence.
			 * If none of the annotations are given, then the label will be the Property name of the column.
			 *
			 * <i>XML Example for OData V4 where CustomerName is the Label assigned to Customer</i>
			 * <pre>
			 *    &lt;Property Name=&quot;Customer&quot;&gt;
			 *     &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.Label&quot; Path=&quot;CustomerName&quot; /&gt;
			 *    &lt;/Property&gt;
			 *    &lt;Property Name=&quot;CustomerName&quot; type=&quot;Edm.String&quot; /&gt;
			 * </pre>
			 *
			 * For OData v2 the <code>sap:label</code> annotation on the <code>Property</code> can be used to define the label of the column.
			 * <pre>
			 *    &lt;Property Name=&quot;Customer&quot; ... sap:label=&quot;My Customer&quot;/&gt;
			 * </pre>
			 */
			filterLabelOnLineItem: {
				namespace: "com.sap.vocabularies.UI.v1",
				annotation: "LineItem/Label",
				target: [
					"Property", "Parameter"
				],
				appliesTo: [
					"filterItem/label"
				],
				group: [
					"Behavior"
				],
				since: "1.28.1"
			},

			/**
			 * Defines the filter field as mandatory filter. Filter fields having this annotation must be a part of the <code>$filter</code> request
			 * sent to the back-end. <b>Note:</b> Support for V4 annotation is added since SAPUI5 version 1.40. <i>XML Example of OData V4 with
			 * Required CompanyCode Filter</i>
			 * 
			 * <pre>
			 *    &lt;Annotation Term=&quot;Org.OData.Capabilities.V1.FilterRestrictions&quot;&gt;
			 *      &lt;Record&gt;
			 *          &lt;PropertyValue Property=&quot;RequiresFilter&quot; Bool=&quot;true&quot;/&gt;
			 *          &lt;PropertyValue Property=&quot;RequiredProperties&quot;&gt;
			 *           &lt;Collection&gt;
			 *              &lt;PropertyPath&gt;CompanyCode&lt;/PropertyPath&gt;
			 *           &lt;/Collection&gt;
			 *        &lt;/PropertyValue&gt;
			 *      &lt;/Record&gt;
			 *    &lt;/Annotation&gt;
			 * </pre>
			 * 
			 * For OData v2 the <code>sap:required-in-filter</code> annotation on the <code>Property</code> can be used for setting the filter as
			 * a mandatory filter field.
			 * 
			 * <pre>
			 *    &lt;Property Name=&quot;Customer&quot; ... sap:required-in-filter=&quot;true&quot;/&gt;
			 *    &lt;Property Name=&quot;CompanyCode&quot; ... sap:required-in-filter=&quot;true&quot;/&gt;
			 * </pre>
			 */
			requiredInFilter: {
				namespace: "Org.OData.Capabilities.V1",
				annotation: "FilterRestrictions/RequiredProperties",
				target: [
					"EntitySet"
				],
				defaultValue: true,
				appliesTo: [
					"filterItem/#/value"
				],
				group: [
					"Behavior"
				],
				since: "1.28.1"
			},

			/**
			 * Defines whether multiple values can be used in a single filter. With multi-value filtering, more that one "equals" condition can be
			 * defined for filtering the data. <b>Note:</b> Support for V4 annotation is added since SAPUI5 version 1.40. <i>XML Example of OData V4
			 * with Multi-value Customer and CompanyCode Properties</i>
			 * 
			 * <pre>
			 *    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.FilterExpressionRestriction&quot;
			 *      EnumMember=&quot;com.sap.vocabularies.Common.v1.FilterExpressionType/MultiValue&gt;
			 *      &lt;Record&gt;
			 *        &lt;Collection&gt;
			 *          &lt;PropertyPath&gt;Customer&lt;/PropertyPath&gt;
			 *          &lt;PropertyPath&gt;CompanyCode&lt;/PropertyPath&gt;
			 *        &lt;/Collection&gt;
			 *      &lt;/Record&gt;
			 *    &lt;/Annotation&gt;
			 * </pre>
			 * 
			 * For OData v2 the <code>sap:filter-restriction="multi-value"</code> annotation on the <code>Property</code> can be used for
			 * rendering multi-value filter field.
			 * 
			 * <pre>
			 *    &lt;Property Name=&quot;Customer&quot; ... sap:filter-restriction=&quot;multi-value&quot;/&gt;
			 *    &lt;Property Name=&quot;CompanyCode&quot; ... sap:filter-restriction=&quot;multi-value&quot;/&gt;
			 * </pre>
			 */
			multiValueFilter: {
				namespace: "com.sap.vocabularies.Common.v1",
				annotation: "FilterExpressionType/MultiValue",
				target: [
					"EntitySet"
				],
				defaultValue: null,
				appliesTo: [
					"filterItem/#/input"
				],
				group: [
					"Behavior"
				],
				since: "1.28.1"
			},

			/**
			 * Restricts the filter to only <b>one</b> single value entry. With single-value filtering, you cannot define more than one "equals"
			 * condition for filtering the data. <b>Note:</b> Support for V4 annotation is added since SAPUI5 version 1.40. <i>XML Example of OData
			 * V4 with Single-value Customer and CompanyCode Properties</i>
			 * 
			 * <pre>
			 *    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.FilterExpressionRestriction&quot;
			 *      EnumMember=&quot;com.sap.vocabularies.Common.v1.FilterExpressionType/SingleValue&gt;
			 *      &lt;Record&gt;
			 *        &lt;Collection&gt;
			 *          &lt;PropertyPath&gt;Customer&lt;/PropertyPath&gt;
			 *          &lt;PropertyPath&gt;CompanyCode&lt;/PropertyPath&gt;
			 *        &lt;/Collection&gt;
			 *      &lt;/Record&gt;
			 *    &lt;/Annotation&gt;
			 * </pre>
			 * 
			 * For OData v2 the <code>sap:filter-restriction="single-value"</code> annotation on the <code>Property</code> can be used for
			 * rendering a single-value filter field.
			 * 
			 * <pre>
			 *    &lt;Property Name=&quot;Customer&quot; ... sap:filter-restriction=&quot;single-value&quot;/&gt;
			 *    &lt;Property Name=&quot;CompanyCode&quot; ... sap:filter-restriction=&quot;single-value&quot;/&gt;
			 * </pre>
			 */
			singleValueFilter: {
				namespace: "com.sap.vocabularies.Common.v1",
				annotation: "FilterExpressionType/SingleValue",
				target: [
					"EntitySet"
				],
				defaultValue: null,
				appliesTo: [
					"filterItem/#/input"
				],
				group: [
					"Behavior"
				],
				since: "1.28.1"
			},

			/**
			 * Restricts the filter to specify an interval, for example, a date interval for filtering the data present between the given dates.
			 * <b>Note:</b> Support for V4 annotation is added since SAPUI5 version 1.40. <i>XML Example of OData V4 with Interval Restriction on
			 * DocumentDate Property</i>
			 * 
			 * <pre>
			 *    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.FilterExpressionRestriction&quot;
			 *      EnumMember=&quot;com.sap.vocabularies.Common.v1.FilterExpressionType/SingleInterval&gt;
			 *      &lt;Record&gt;
			 *        &lt;Collection&gt;
			 *          &lt;PropertyPath&gt;DocumentDate&lt;/PropertyPath&gt;
			 *        &lt;/Collection&gt;
			 *      &lt;/Record&gt;
			 *    &lt;/Annotation&gt;
			 * </pre>
			 * 
			 * For OData v2 the <code>sap:filter-restriction="interval"</code> annotation on the <code>Property</code> can be used for rendering
			 * an interval filter field.
			 * 
			 * <pre>
			 *    &lt;Property Name=&quot;DocumentDate&quot; ... sap:filter-restriction=&quot;interval&quot;/&gt;
			 * </pre>
			 */
			singleIntervalFilter: {
				namespace: "com.sap.vocabularies.Common.v1",
				annotation: "FilterExpressionType/SingleInterval",
				target: [
					"EntitySet"
				],
				defaultValue: null,
				appliesTo: [
					"filterItem/#/input"
				],
				group: [
					"Behavior"
				],
				since: "1.28.1"
			},

			/**
			 * Defines whether certain fields should be initially visible in the <code>SmartFilterBar</code> control. The fields will be rendered in
			 * the order that is specified in this annotation. <b>Note:</b> This annotation is supported since SAPUI5 version 1.40. <i>XML Example of
			 * OData V4 with SelectionFields annotation.</i>
			 * 
			 * <pre>
			 *   &lt;Annotations Target=&quot;Product&quot;&gt;
			 *     &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.SelectionFields&quot;&gt;
			 *       &lt;Collection&gt;
			 *         &lt;PropertyPath&gt;ProductCategory&lt;/PropertyPath&gt;
			 *         &lt;PropertyPath&gt;Supplier&lt;/PropertyPath&gt;
			 *         &lt;PropertyPath&gt;Product&lt;/PropertyPath&gt;
			 *       &lt;/Collection&gt;
			 *     &lt;/Annotation&gt;
			 *   &lt;/Annotations&gt;
			 * </pre>
			 */
			selectionFields: {
				namespace: "com.sap.vocabularies.UI.v1",
				annotation: "SelectionFields",
				target: [
					"EntityType"
				],
				defaultValue: null,
				appliesTo: [
					"filterItem/#/value"
				],
				group: [
					"Behavior"
				],
				since: "1.40.1"
			},

			/**
			 * Defines whether certain fields should be hidden in the <code>SmartFilterBar</code> control. <i>XML Example for OData V4 where
			 * ProductPictureURL should never be visible on the UI</i>
			 * 
			 * <pre>
			 *    &lt;Annotations Target=&quot;ProductPictureURL&quot;
			 *     &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.HiddenFilter&quot;/&gt;
			 *    &lt;/Annotations&gt;
			 * </pre>
			 */
			filterHidden: {
				namespace: "com.sap.vocabularies.UI.v1",
				annotation: "HiddenFilter",
				target: [
					"Property"
				],
				appliesTo: [
					"filterItem/hidden"
				],
				group: [
					"Behavior"
				],
				since: "1.44.0"
			}
		},
		properties: {
			entitySet: {
				ignore: true
			},
			entityType: {
				ignore: true
			},
			// deprecated
			resourceUri: {
				ignore: true
			},
			basicSearchFieldName: {
				ignore: true
			},
			enableBasicSearch: {
				ignore: true
			},
			considerAnalyticalParameters: {
				ignore: true
			},
			liveMode: {
				ignore: false
			},
			showMessages: {
				ignore: false
			}
		},
		customData: {

		}
	};
}, /* bExport= */false);
