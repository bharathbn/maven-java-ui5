var usermodel = function() {

	var token = new sap.ui.model.json.JSONModel({
		token : null
	});
	
	
	var clickedSearch = new sap.ui.model.json.JSONModel({
		id : null
	});
	
	
	
	var searchIdstoDelete = new sap.ui.model.json.JSONModel({
		ids : []
	});
	
	
	var searchHistory = new sap.ui.model.json.JSONModel();
	
	
    
	
	this.getclickedSearch = function(){
        return clickedSearch.id;
    };
    
    
    this.setclickedSearch = function(data){
    	clickedSearch.id = data;
    };
	
	
	
	
    
    this.setsearchIdstoDelete = function(data){
    	searchIdstoDelete.ids = data;
    };
    
    this.getsearchIdstoDelete = function(){
        return searchIdstoDelete.ids;
    };
    
    

	this.getToken = function(){
        return token.token;
    };
    
    
    this.setToken = function(data){
    	token.token = data;
    };
    
    
    this.setSearchHistory = function(data){
    	searchHistory.setData({modelData: data});
    };
    
    this.getSearchHistory = function(){
        return searchHistory;
    };
    

};