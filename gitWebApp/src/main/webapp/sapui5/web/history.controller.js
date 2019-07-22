sap.ui.controller("web.history", {

	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf bilaunchpad.test
	 */
	// onInit: function() {
	//
	// },
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the
	 * controller's View is re-rendered (NOT before the first rendering!
	 * onInit() is used for that one!).
	 * 
	 * @memberOf bilaunchpad.test
	 */
	onBeforeRendering : function() {

		 var that = this;
			var viewId = that.getView();
			var model = sap.ui.getCore().getModel();
			var url = window.location.href.split('?')[0];
			if (url.endsWith("/")){
				url = url.substring(0,url.length-1);
			}
			var result = null;
			var that = this;
			var auth = "Bearer " + model.getToken();
			$.ajax({
				url : url + "/search/history",
				//data : JSON.stringify(inputdata),
				method : "GET",
				"headers": {
				    "Accept": "application/json",
				    "Content-Type": "application/json",
				    "Authorization":auth },
				success : function(data) {
					result = data;
					 model.setSearchHistory(data);
	                 viewId.successData(data);
					
				},
				error:function(){
					sap.ui.core.BusyIndicator.hide();
					alert("error accured")
				}
			});
	},
	
	
	getHistory : function() {

		 var that = this;
			var viewId = that.getView();
			var model = sap.ui.getCore().getModel();
			var url = window.location.href.split('?')[0];
			if (url.endsWith("/")){
				url = url.substring(0,url.length-1);
			}
			var result = null;
			var that = this;
			var auth = "Bearer " + model.getToken();
			
			
			
			$.ajax({
				url : url + "/search/history",
				//data : JSON.stringify(inputdata),
				method : "GET",
				"headers": {
				    "Accept": "application/json",
				    "Content-Type": "application/json",
				    "Authorization":auth },
				success : function(data) {
					result = data;
					 model.setSearchHistory(data);
					 sap.ui.getCore().byId("historytable").getModel().refresh(true);
					 setTimeout(function(){
							$( "div" ).removeClass( "sapMCbMarkChecked" );
							$( "div" ).prop( 'aria-checked' ,'false' );
						}, 10);
				},
				error:function(){
					sap.ui.core.BusyIndicator.hide();
					alert("error accured")
				}
			});
	},
	
	
	deleteHistory : function() {

		 var that = this;
			var viewId = that.getView();
			var model = sap.ui.getCore().getModel();
			var url = window.location.href.split('?')[0];
			if (url.endsWith("/")){
				url = url.substring(0,url.length-1);
			}
			var result = null;
			var that = this;
			
			var ids = model.getsearchIdstoDelete();
			if(ids == null && ids==undefined) return;
			var inputdata = ids;
			model.setsearchIdstoDelete(null);
			sap.ui.getCore().byId('deleteHistory').setEnabled(false);
			
			
			var auth = "Bearer " + model.getToken();
			$.ajax({
				url : url + "/search/history",
				data : JSON.stringify(inputdata),
				method : "DELETE",
				"headers": {
				    "Accept": "application/json",
				    "Content-Type": "application/json",
				    "Authorization":auth },
				success : function(data) {
					
						 viewId.getController().getHistory();
				},
				error:function(){
					viewId.getController().getHistory();
					
				}
			});
	},

	
	
	logout: function(data)
	{
		 var that = this;
		var viewId = that.getView();
		var model = sap.ui.getCore().getModel();
		var url = window.location.href.split('?')[0];
		if (url.endsWith("/")){
			url = url.substring(0,url.length-1);
		}
		var result = null;
		var that = this;
		var auth = "Bearer " + model.getToken();
		$.ajax({
			url : url + "/logout",
			//data : JSON.stringify(inputdata),
			method : "POST",
			"headers": {
			    "Accept": "application/json",
			    "Content-Type": "application/json",
			    "Authorization":auth },
			success : function(data) {
				window.location = window.location.href.split('?')[0];
			},
			error:function(){
				window.location = window.location.href.split('?')[0];
			}
		});
	}
	
	
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf bilaunchpad.test
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf bilaunchpad.test
 */
// onExit: function() {
//
// }
});