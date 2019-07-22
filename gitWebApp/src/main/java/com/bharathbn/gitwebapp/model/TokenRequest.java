package com.bharathbn.gitwebapp.model;

import org.springframework.beans.factory.annotation.Value;

public class TokenRequest {

	private String client_id;
	private String redirect_uri;
	private String client_secret;
	private String code;
	
	public TokenRequest(String code, String redirect_uri, String client_id, String client_secret) {
		this.code = code;
		this.redirect_uri = redirect_uri;
		this.client_id = client_id;
		this.client_secret = client_secret;
	}

	public String getClient_id() {
		return client_id;
	}

	public String getRedirect_uri() {
		// TODO Auto-generated method stub
		return redirect_uri;
	}

	public String getClient_secret() {
		// TODO Auto-generated method stub
		return client_secret;
	}

	public String getCode() {
		// TODO Auto-generated method stub
		return code;
	}
}
