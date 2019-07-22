sap.ui.jsview("web.login", {

	/**
	 * Specifies the Controller belonging to this View. In the case that it is
	 * not implemented, or that "null" is returned, this View does not have a
	 * Controller.
	 * 
	 */
	getControllerName : function() {
		return "web.login";
	},

	/**
	 * Is initially called once after the Controller has been instantiated. It
	 * is the place where the UI is constructed. Since the Controller is given
	 * to this method, its event handlers can be attached right away.
	 * 
	 * @memberOf bilaunchpad.test
	 */
	createContent : function(oController) {
		return new sap.m.Page({
			title : "Welcome to GitWebApp",
			showNavButton : false,
			content : new sap.m.Button({
				text : "Singn in with GitHub",
				type : "Accept",
				press : function() {
					var urlString = "https://github.com/login/oauth/authorize?client_id=3877043edc2505705220";
					var redirect_uri = window.location.href.split('?')[0];
					urlString = urlString + "&redirect_uri="+encodeURI(redirect_uri);
					window.location = urlString;
				}
			}).addStyleClass('centeralign')
		});
	},

	logoutpage : function() {
		var myapp = sap.ui.getCore().byId('myapp');
		sap.ui.core.BusyIndicator.hide();
		
	}

});