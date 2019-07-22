sap.ui.jsview("web.home",
		{

			/**
			 * Specifies the Controller belonging to this View. In the case that
			 * it is not implemented, or that "null" is returned, this View does
			 * not have a Controller.
			 * 
			 */
			getControllerName : function() {
				return "web.home";
			},

			/**
			 * Is initially called once after the Controller has been
			 * instantiated. It is the place where the UI is constructed. Since
			 * the Controller is given to this method, its event handlers can be
			 * attached right away.
			 * 
			 * @memberOf bilaunchpad.test
			 */
			createContent : function(oController) {

				var page2 = new sap.m.Page({
					title : "Git Web Application",
					showNavButton : false,
					navButtonPress : function() {
						var myapp = sap.ui.getCore().byId('myapp');
						myapp.to("page1");
					}
				});

				var logoutbutton = new sap.m.Button("homelogoutbutton", {
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
					// contentLeft : [ new sap.m.Image( {
					// src : "images/saplogo2.png",
					// height : "45px"
					// }) ],

					contentMiddle : [ new sap.m.Label({
						text : "Git Web Application", // santhosh Edited
						textAlign : "Left",
						design : "Bold"
					}) ],

					contentRight : [ new sap.m.Label("userlabel1", {
						text : "Hi user",
						textAlign : "Left",
						design : "Bold"
					}), logoutbutton ]
				});

				page2.setCustomHeader(oBar);

				var oSearchField = new sap.m.SearchField({
					enableListSuggest : true,
					showListExpander : false,
					startSuggestion : 2,
					width : '560px',
					search : function() {
						var searchText = this.getValue();
						if (searchText.length > 0) {
							sap.ui.core.BusyIndicator.show();
							oController.getsearchData(searchText);
						}
					}
				});

				var searchhistory = new sap.m.Button({
					text : "Search History",
					type : "Default",
					press : function() {
						var myapp = sap.ui.getCore().byId('myapp');
						myapp.to("page3");
						
					}
				}).addStyleClass('sapUiMediumMarginBegin');

				var oSearchLayout = new sap.m.VBox();
				var hLayout = new sap.m.HBox()
						.addStyleClass('sapUiMediumMargin');
				hLayout.addItem(oSearchField);
				hLayout.addItem(searchhistory);
				oSearchLayout.addItem(hLayout);
				page2.addContent(oSearchLayout);

				var result = new sap.m.VBox()
						.addStyleClass('sapUiMediumMarginBegin');
				;

				var hbox1 = new sap.m.HBox();
				var lable = new sap.m.Label("searchresult", {
					text : "Search Results",
					textAlign : "Left",
					design : "Bold",
				})
				hbox1.addItem(lable);
				result.addItem(hbox1);

				var hbox2 = new sap.m.HBox()
						.addStyleClass('sapUiSmallMarginTop');
				var list = new sap.m.List("searchresultlist", {});
				list.setBackgroundDesign("Transparent");
				hbox2.addItem(list);
				result.addItem(hbox2);

				page2.addContent(result);
				return page2;
			},

			successData : function(data) {

				var model = sap.ui.getCore().getModel();
				var list = sap.ui.getCore().byId('searchresultlist');
				list.removeAllItems();
				var usertext = "User: ";
				var score = "Score: ";
				var userurl = "Url: ";

				if (data.items) {
					for (var i = 0; i < data.items.length; i++) {

						var vbox = new sap.m.VBox().addStyleClass('sapUiMediumMarginTop');
						var userlabel = new sap.m.Label({
							text : usertext + data.items[i].login,
						design: sap.m.LabelDesign.Bold,
						width: "600px",
						});
						var scorelabel = new sap.m.Label({
							text : score + data.items[i].score,
						//design: sap.m.LabelDesign.Bold
						}).addStyleClass('sapUiTinyMarginTop');
						var urllabel = new sap.m.Label({
							text : userurl + data.items[i].url,
						//design: sap.m.LabelDesign.Bold
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