sap.ui.jsview("web.historydetails", {

	/**
	 * Specifies the Controller belonging to this View. In the case that it is
	 * not implemented, or that "null" is returned, this View does not have a
	 * Controller.
	 * 
	 * @memberOf bilaunchpad.test
	 */
	getControllerName : function() {
		return "web.historydetails";
	},

	/**
	 * Is initially called once after the Controller has been instantiated. It
	 * is the place where the UI is constructed. Since the Controller is given
	 * to this method, its event handlers can be attached right away.
	 * 
	 */
	createContent : function(oController) {
		var page3 = new sap.m.Page({
			title : "GitHub Web Application",
			showNavButton : true,
			navButtonPress : function() {
				var myapp = sap.ui.getCore().byId('myapp');
				myapp.to("page3");
			}
		});

		var logoutbutton = new sap.m.Button("historydetailslogoutbutton", {
			text : "Logout",
			press : function() {
				var name = "access_token";
				document.cookie = name+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
				oController.logout();
			}
		});

		var oBar = new sap.m.Bar({
			design : sap.m.BarDesign.Header,
			// design: sap.m.BarDesign.SubHeader,
			contentLeft : [ new sap.m.Button("gobackfromhistorydetails", {
				// text : "Logout",
				icon : "sap-icon://nav-back",
				press : function() {
					var myapp = sap.ui.getCore().byId('myapp');
					myapp.to("page3");
				}
			}) ],

			contentMiddle : [ new sap.m.Label({
				text : "GitHub Web Application", // santhosh Edited
				textAlign : "Left",
				design : "Bold"
			}) ],

			contentRight : [ new sap.m.Label("userlabel3", {
				text : "Hi user",
				textAlign : "Left",
				design : "Bold"
			}), logoutbutton ]
		});

		page3.setCustomHeader(oBar);

		var hbox2 = new sap.m.HBox().addStyleClass('sapUiMediumMarginBegin');
		var list = new sap.m.List("searchresultlist2", {});
		list.setBackgroundDesign("Transparent");
		hbox2.addItem(list);

		page3.addContent(hbox2);
		
		return page3;

	},

	successData : function(data) {

		var model = sap.ui.getCore().getModel();
		var list = sap.ui.getCore().byId('searchresultlist2');
		list.removeAllItems();
		var usertext = "User: ";
		var score = "Score: ";
		var userurl = "Url: ";

		if (data.items) {
			for (var i = 0; i < data.items.length; i++) {

				var vbox = new sap.m.VBox()
						.addStyleClass('sapUiMediumMarginTop');
				var userlabel = new sap.m.Label({
					text : usertext + data.items[i].login,
					design : sap.m.LabelDesign.Bold,
					width : "600px",
				});
				var scorelabel = new sap.m.Label({
					text : score + data.items[i].score,
				// design: sap.m.LabelDesign.Bold
				}).addStyleClass('sapUiTinyMarginTop');
				var urllabel = new sap.m.Label({
					text : userurl + data.items[i].url,
				// design: sap.m.LabelDesign.Bold
				}).addStyleClass('sapUiTinyMarginTop');
				vbox.addItem(userlabel);
				vbox.addItem(scorelabel);
				vbox.addItem(urllabel);

				var oCustomItem = new sap.m.CustomListItem({
					content : [ vbox ]
				});
				list.addItem(oCustomItem);
			}

		}
		list.rerender();
		sap.ui.core.BusyIndicator.hide();
	}

});