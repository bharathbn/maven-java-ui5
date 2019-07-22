package com.bharathbn.gitwebapp.model;

import java.io.Serializable;

public class GitUsersSearch implements Serializable {

	private String login;
	private String url;
	private String score;
	
	public String getLogin() {
		return login;
	}

	public void setLogin(String login) {
		this.login = login;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getScore() {
		return score;
	}

	public void setScore(String score) {
		this.score = score;
	}

}
