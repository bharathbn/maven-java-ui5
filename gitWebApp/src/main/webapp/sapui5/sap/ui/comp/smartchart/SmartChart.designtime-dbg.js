/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2016 SAP SE. All rights reserved
*/

// Provides the Design Time Metadata for the sap.ui.comp.smartchart.SmartChart control.
sap.ui.define([], function() {
	"use strict";
	return {
		annotations: {
			/**
			 * Defines a name of the <code>SemanticObject</code> that can be represented with an <code>EntitySet</code>, <code>EntityType</code>
			 * or identified by a <code>Property</code>.
			 * With this annotation in place, the <code>SemanticObjectController</code> will provide all the available features for the <code>SmartChart</code> control.
			 *
			 * <i>XML Example of OData V4 with SemanticObject on ProductName</i>
			 * <pre>
			 *    &lt;Annotations Target="ProductName"&gt;
			 *      &lt;Annotation Term="com.sap.vocabularies.Common.v1.SemanticObject" String="SemanticObjectName" /&gt;
			 *   &lt;/Annotations&gt;
			 * </pre>
			 */
			semanticObject: {
				namespace: "com.sap.vocabularies.Common.v1",
				annotation: "SemanticObject",
				target: ["EntitySet", "EntityType", "Property"],
				defaultValue: null,
				appliesTo: ["text"],
				group: ["Behavior"],
				since: "1.34.1"
			},

			/**
			 * Defines whether a field in the SmartChart control is visible.
			 * The SmartChart interprets the <code>EnumMember</code> <code>FieldControlType/Hidden</code> of the <code>FieldControl</code> annotation for setting the visibility.
			 *
			 * <b>Note:</b> Currently only <code>FieldControlType/Hidden</code> is supported for statically hiding the fields.
			 *
			 * <i>XML Example of OData V4 with hidden Customer and CompanyCode Properties</i>
			 * <pre>
			 *    &lt;Property Name="Customer"&gt;
			 *      &lt;Annotation Term="UI.FieldControlType/Hidden"/&gt;
			 *    &lt;/Property&gt;
			 *    &lt;Property Name="CompanyCode"&gt;
			 *      &lt;Annotation Term="UI.FieldControlTpye/Hidden"/&gt;
			 *    &lt;/Property&gt;
			 * </pre>
			 *
			 * For OData v2 the <code>sap:visible</code> annotation on the <code>Property</code> can be used to assign visibility.
			 * <pre>
			 *    &lt;Property Name="Customer" ... sap:visible="false"/&gt;
			 *    &lt;Property Name="CompanyCode" ... sap:visible="false"/&gt;
			 * </pre>
			 */
			fieldVisible: {
				namespace: "com.sap.vocabularies.Common.v1",
				annotation: "FieldControlType/Hidden",
				target: ["Property"],
				defaultValue: false,
				appliesTo: ["field/#/visible"],
				group: ["Behavior"],
				since: "1.34.1"
			},

			/**
			 * Renders the initial chart fields for the SmartChart control.
			 * A <code>PropertyPath</code> and an <code>AnnotationPath</code> can be used for constructing PresentationVariant annotation.
			 *
			 * <i>XML Example of OData V4 with Customer and CompanyCode Properties as PresentationVariant</i>
			 * <pre>
			 *    &lt;Annotation Term="com.sap.vocabularies.UI.v1.PresentationVariant"&gt;
			 *      &lt;Record&gt;
			 *        &lt;PropertyValue Property="Visualizations"&gt;
			 *          &lt;Collection&gt;
			 *            &lt;AnnotationPath&gt;@UI.LineItem&lt;/AnnotationPath&gt;
			 *          &lt;/Collection&gt;
			 *        &lt;/PropertyValue&gt;
			 *        &lt;PropertyValue Property="RequestAtLeast"&gt;
			 *          &lt;Collection&gt;
			 *            &lt;PropertyPath&gt;Customer&lt;/PropertyPath&gt;
			 *            &lt;PropertyPath&gt;CompanyCode&lt;/PropertyPath&gt;
			 *          &lt;/Collection&gt;
			 *        &lt;/PropertyValue&gt;
			 *          &lt;PropertyValue Property="SortOrder"&gt;
			 *            &lt;Collection&gt;
			 *              &lt;Record&gt;
			 *                &lt;PropertyValue Property="Property" PropertyPath="CompanyCode"/&gt;
			 *                &lt;PropertyValue Property="Descending" Bool="true"/&gt;
			 *              &lt;/Record&gt;
			 *              &lt;Record&gt;
			 *                &lt;PropertyValue Property="Property" PropertyPath="Customer"/&gt;
			 *              &lt;/Record&gt;
			 *            &lt;/Collection&gt;
			 *          &lt;/PropertyValue&gt;
			 *        &lt;/Record&gt;
			 *      &lt;/Annotation&gt;
			 * </pre>
			 */
			presentationVariant: {
				namespace: "com.sap.vocabularies.UI.v1",
				annotation: "PresentationVariant",
				target: ["EntitySet", "EntityType"],
				defaultValue: null,
				appliesTo: ["chartFields"],
				group: ["Behavior"],
				since: "1.34.1"
			},

			/**
			 * Renders a chart based on the information that is provided within the <code>Chart</code> annotation.
			 * <code>Chart</code> annotation must be defined for an </code>EntityType</code>
			 *
			 * <i>XML Example of OData V4 with Chart Annotation</i>
			 * <pre>
			 *    &lt;Annotations Target="Item" xmlns="http://docs.oasis-open.org/odata/ns/edm"&gt;
			 *      &lt;Annotation Term="com.sap.vocabularies.UI.v1.Chart"&gt;
			 *        &lt;Record&gt;
			 *          &lt;PropertyValue Property="Title" String="Line Items" /&gt;
			 *          &lt;PropertyValue Property="ChartType"
			 *             EnumMember="com.sap.vocabularies.UI.v1.ChartType/Column" /&gt;
			 *          &lt;PropertyValue Property="Dimensions"&gt;
			 *            &lt;Collection&gt;
			 *              &lt;PropertyPath&gt;CompanyCode&lt;/PropertyPath&gt;
			 *              &lt;PropertyPath&gt;Customer&lt;/PropertyPath&gt;
			 *            &lt;/Collection&gt;
			 *          &lt;/PropertyValue&gt;
			 *          &lt;PropertyValue Property="Measures"&gt;
			 *            &lt;Collection&gt;
			 *              &lt;PropertyPath&gt;AmountInCompanyCodeCurrency&lt;/PropertyPath&gt;
			 *              &lt;PropertyPath&gt;AmountInTransactionCurrency&lt;/PropertyPath&gt;
			 *            &lt;/Collection&gt;
			 *          &lt;/PropertyValue&gt;
			 *        &lt;/Record&gt;
			 *      &lt;/Annotation&gt;
			 *    &lt;/Annotations&gt;
			 * </pre>
			 */
			chart: {
				namespace: "com.sap.vocabularies.UI.v1",
				annotation: "Chart",
				target: ["EntityType"],
				defaultValue: null,
				appliesTo: ["chart"],
				group: ["Behavior"],
				since: "1.34.1"
			},

			/**
			 * Renders a chart based on the ChartType information that is provided within <code>Chart</code>
			 * The <code>Chart</code> annotation contains an <code>EnumMember</code> where the <code>ChartType</code> must be defined.
			 * The annotation is defined as a parameter in the <code>PropertyValue</code>.
			 *
			 * <i>XML Example of OData V4 with ChartType as Column Chart</i>
			 * <pre>
			 *    &lt;Annotations Target="Item" xmlns="http://docs.oasis-open.org/odata/ns/edm"&gt;
			 *      &lt;Annotation Term="com.sap.vocabularies.UI.v1.Chart"&gt;
			 *        &lt;Record&gt;
			 *          &lt;PropertyValue Property="Title" String="Line Items" /&gt;
			 *          &lt;PropertyValue Property="ChartType"
			 *             EnumMember="com.sap.vocabularies.UI.v1.ChartType/Column" /&gt;
			 *          &lt;PropertyValue Property="Dimensions"&gt;
			 *            &lt;Collection&gt;
			 *              &lt;PropertyPath&gt;CompanyCode&lt;/PropertyPath&gt;
			 *              &lt;PropertyPath&gt;Customer&lt;/PropertyPath&gt;
			 *            &lt;/Collection&gt;
			 *          &lt;/PropertyValue&gt;
			 *          &lt;PropertyValue Property="Measures"&gt;
			 *            &lt;Collection&gt;
			 *              &lt;PropertyPath&gt;AmountInCompanyCodeCurrency&lt;/PropertyPath&gt;
			 *              &lt;PropertyPath&gt;AmountInTransactionCurrency&lt;/PropertyPath&gt;
			 *            &lt;/Collection&gt;
			 *          &lt;/PropertyValue&gt;
			 *        &lt;/Record&gt;
			 *      &lt;/Annotation&gt;
			 *    &lt;/Annotations&gt;
			 * </pre>
			 */
			chartType: {
				namespace: "com.sap.vocabularies.UI.v1",
				annotation: "Chart/ChartType",
				target: ["PropertyValue"],
				defaultValue: null,
				appliesTo: ["chartType"],
				group: ["Behavior"],
				since: "1.34.1"
			}
		},
		customData: {

		},
		properties: {

			entitySet: {
				ignore: true
			},

			smartFilterId: {
				ignore: true
			},

			ignoredFields: {
				ignore: true
			},

			requestAtLeastFields: {
				ignore: true
			},

			ignoreFromPersonalisation: {
				ignore: true
			},

			chartType: {
				ignore: true
			},

			ignoredChartTypes: {
				ignore: false
			},

			useVariantManagement: {
				ignore: true
			},

			useChartPersonalisation: {
				ignore: true
			},

			header: {
				ignore: false
			},

			persistencyKey: {
				ignore: true
			},

			currentVariantId: {
				ignore: false
			},

			enableAutoBinding: {
				ignore: true
			},

			chartBindingPath: {
				ignore: false
			},

			showDrillButtons: {
				ignore: false
			},	

			showZoomButtons: {
				ignore: false
			},

			showSemanticNavigationButton: {
				ignore: false
			},

			showVariantManagement: {
				ignore: false
			},

			showDownloadButton: {
				ignore: false
			},

			showDetailsButton: {
				ignore: false
			},

			showDrillBreadcrumbs: {
				ignore: false
			},

			showChartTooltip: {
				ignore: false
			},

			showLegendButton: {
				ignore: false
			},

			legendVisible: {
				ignore: false
			},

			selectionMode: {
				ignore: true
			},

			showFullScreenButton: {
				ignore: true
			},

			useTooltip: {
				ignore: true
			},

			useListForChartTypeSelection: {
				ignore: true
			}
		}
	};
}, /* bExport= */false);
