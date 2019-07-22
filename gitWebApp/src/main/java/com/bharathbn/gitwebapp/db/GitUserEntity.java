package com.bharathbn.gitwebapp.db;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class GitUserEntity {
	
	@Id
	@Column(name = "ACCESS_TOKEN")
	private String access_token;
	
	@Column(name = "OWNER_ID")
	private String ownerId;

	public String getAccess_token() {
		return access_token;
	}

	public void setAccess_token(String access_token) {
		this.access_token = access_token;
	}

	public String getOwnerId() {
		return ownerId;
	}

	public void setOwnerIdd(String ownerId) {
		this.ownerId = ownerId;
	}
}
