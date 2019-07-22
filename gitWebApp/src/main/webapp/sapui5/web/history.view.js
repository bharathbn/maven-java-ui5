sap.ui.jsview("web.history", {

	/**
	 * Specifies the Controller belonging to this View. In the case that it is
	 * not implemented, or that "null" is returned, this View does not have a
	 * Controller.
	 * 
	 * @memberOf bilaunchpad.test
	 */
	getControllerName : function() {
		return "web.history";
	},

	/**
	 * Is initially called once after the Controller has been instantiated. It
	 * is the place where the UI is constructed. Since the Controller is given
	 * to this method, its event handlers can be attached right away.
	 * 
	 */
	createContent : function(oController) {
		var page3 = new sap.m.Page("historypage", {
			title : "Git Web Application",
			showNavButton : true,
			navButtonPress : function() {
				var myapp = sap.ui.getCore().byId('myapp');
				myapp.to("page2");
			}
		});

		var logoutbutton = new sap.m.Button("historylogoutbutton", {
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
			contentLeft : [ new sap.m.Button("gohomefromhistory", {
				// text : "Logout",
				icon : "sap-icon://nav-back",
				press : function() {
					var myapp = sap.ui.getCore().byId('myapp');
					myapp.to("page2");
				}
			}) ],

			contentMiddle : [ new sap.m.Label({
				text : "Git Web Application", // santhosh Edited
				textAlign : "Left",
				design : "Bold"
			}) ],

			contentRight : [ new sap.m.Label("userlabel2", {
				text : "Hi user",
				textAlign : "Left",
				design : "Bold"
			}), logoutbutton ]
		});

		page3.setCustomHeader(oBar);

		var deleteHistory = new sap.m.Button("deleteHistory", {
			icon : "sap-icon://delete",
			enabled : false,
			press : function() {
				oController.deleteHistory();
			}
		
		});

		var TableHeader = new sap.m.Toolbar({
			content : [ new sap.m.Title({
				text : "Search History"
			}), new sap.m.ToolbarSpacer(), new sap.m.Button({
				icon : "sap-icon://refresh",
				press : function() {
					oController.getHistory();
				}
			}), deleteHistory ]
		});

		var Columns = [ new sap.m.Column({
			header : new sap.m.Label({
				text : "Search ID"
			}),
			mergeDuplicates : true
		}), new sap.m.Column({
			header : new sap.m.Label({
				text : "Search Item"
			})
		}), new sap.m.Column({
			header : new sap.m.Label({
				text : "Time"
			})
		}), new sap.m.Column({
			header : new sap.m.Label({
				text : "Select for Delete"
			})
		}) ];

		var page4 = new sap.m.Page("historypage2", {
			showHeader : false
		}).addStyleClass('sapUiSmallMarginTop');
		page3.addContent(page4);

		var testsTable = new sap.m.Table("historytable", {
			mode : sap.m.ListMode.None,
			growingThreshold : 10,
			growingScrollToLoad : true,
			columns : Columns,
			headerToolbar : TableHeader,
		});

		return page3;

	},

	successData : function(data) {
		var oController = this.getController();
		var model = sap.ui.getCore().getModel();
		var testpage = sap.ui.getCore().byId('historypage2');
		var testsTable = sap.ui.getCore().byId('historytable');
		testsTable.removeAllItems();
		// alert(JSON.stringify(data));
		var Template = new sap.m.ColumnListItem({
			vAlign : "Middle",
			type : 'Navigation',
			cells : [ new sap.m.Text({
				text : "{id}",
				wrapping : false
			}), new sap.m.Text({
				text : "{serachItem}",
				wrapping : false
			}), new sap.m.Text({
				text : "{time}",
				wrapping : false
			}),

			new sap.m.CheckBox({
				name : "{id}",
				// text : questionsData[i].option1,
				selected : false,
				select : function() {
					var currentid = this.getName();
					var model = sap.ui.getCore().getModel();
					var existing = model.getsearchIdstoDelete();
					var exist = false;
					if(existing != null && existing != undefined && existing.length >0 )
						{
							for(var i=0; i<existing.length; i++)
								{
									if(existing[i] == currentid)
										{
											existing[i] = "";
											exist = true;
										}
								}
							if(!exist) 
								{
									existing[existing.length] = currentid;
									$("[name="+currentid+"]").parent().addClass( "sapMCbMarkChecked" );
								}
						}
					else 
						{
						existing = [currentid]
						$("[name="+currentid+"]").parent().addClass( "sapMCbMarkChecked" );
						}
					
					if(existing.length > 0) sap.ui.getCore().byId('deleteHistory').setEnabled(true);
					else sap.ui.getCore().byId('deleteHistory').setEnabled(false);
					model.setsearchIdstoDelete(existing);
				}
			}),

			],
			press : function(e) {
				// model.setTestClicked((this.getCells())[0].mProperties.text);

				var path = e.getSource().getBindingContext().sPath;
				var model2 = testsTable.getModel();
				var obj = model2.getProperty(path);
				
				var model = sap.ui.getCore().getModel();
				model.setclickedSearch(obj.id);
				
				//alert(obj);
				
				var myapp = sap.ui.getCore().byId('myapp');
				myapp.to("page4");
				var page = myapp.getPage("page4");
				page.rerender();

			}
		});

		// var sItems = testsTable.getItems();
		var Model = model.getSearchHistory();
		testsTable.setModel(Model);
		testsTable.bindItems("/modelData", Template);

		testpage.addContent(testsTable);
		testpage.setShowHeader(false);
		

	}
});