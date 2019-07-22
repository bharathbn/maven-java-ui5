jQuery.sap.require("web.usermodel");
sap.ui.controller("web.login", {

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
	 */
	onBeforeRendering : function() {
		sap.ui.getCore().setModel(new usermodel());
		var url_string = window.location.href;
		var url = new URL(url_string);
		var code = url.searchParams.get("code");
		var model = sap.ui.getCore().getModel();
		var name = "access_token";
		var name2 = "user";
		var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		 var match2 = document.cookie.match(new RegExp('(^| )' + name2 + '=([^;]+)'));
		 if (match && match2) 
			 {
			 var access_token =  match[2]; 
			 var user =  match2[2]; 
				sap.ui.core.BusyIndicator.hide();
				model.setToken(access_token);
				var myapp = sap.ui.getCore().byId('myapp');
				var userlabel1 = sap.ui.getCore().byId('userlabel1');
				userlabel1.setText("Hi "+ user);
				var userlabel2 = sap.ui.getCore().byId('userlabel2');
				userlabel2.setText("Hi "+ user);
				var userlabel3 = sap.ui.getCore().byId('userlabel3');
				userlabel3.setText("Hi "+ user);
				myapp.to("page2");
			 }
		
		 else 
		if (code) {
			sap.ui.core.BusyIndicator.show();
			this.login(code);
		}
		 
	},

	login : function(code) {
		var model = sap.ui.getCore().getModel();
		inputdata = {};
		var url = window.location.href.split('?')[0];
		if (url.endsWith("/")){
			url = url.substring(0,url.length-1);
		}
		inputdata.code = code;
		inputdata.redirect_uri = url;
		var that = this;
		$.ajax({
			url : url + "/login",
			data : JSON.stringify(inputdata),
			method : "POST",
			contentType : "application/json",
			accept : "application/json",
			success : function(data) {
				if (data.access_token) {
					
					
					var date = new Date();
					date.setTime(date.getTime() + (60 * 10000));
					var expires = "expires="+ date.toUTCString();
					document.cookie = "access_token="+data.access_token+ ";" + expires + ";path=/";
					document.cookie = "user="+data.user+ ";" + expires + ";path=/";
					
					sap.ui.core.BusyIndicator.hide();
					model.setToken(data.access_token);
					var myapp = sap.ui.getCore().byId('myapp');
					var userlabel1 = sap.ui.getCore().byId('userlabel1');
					userlabel1.setText("Hi "+ data.user);
					var userlabel2 = sap.ui.getCore().byId('userlabel2');
					userlabel2.setText("Hi "+ data.user);
					var userlabel3 = sap.ui.getCore().byId('userlabel3');
					userlabel3.setText("Hi "+ data.user);
					myapp.to("page2");
				} else {
					sap.ui.core.BusyIndicator.hide();
					alert("Session Expired. Please sign in again.")
					window.location = url;
				}
			},
			error:function(){
				sap.ui.core.BusyIndicator.hide();
				alert("Session Expired. Please sign in again.")
				window.location = url;
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