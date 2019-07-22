package com.bharathbn.gitwebapp.model;

import java.io.Serializable;
import java.util.Date;

public class UserData implements Serializable{
	
	String login;
	String name;
	String location;
	String repos_url;
	String company;
	String blog;
	String bio;
	
	public String getRepos_url() {
		return repos_url;
	}
	public void setRepos_url(String reposUrl) {
		this.repos_url = reposUrl;
	}
	public String getCompany() {
		return company;
	}
	public void setCompany(String company) {
		this.company = company;
	}
	public String getBlog() {
		return blog;
	}
	public void setBlog(String blog) {
		this.blog = blog;
	}
	public String getBio() {
		return bio;
	}
	public void setBio(String bio) {
		this.bio = bio;
	}
	public String getlogin() {
		return login;
	}
	public void setlogin(String login) {
		this.login = login;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}

}
