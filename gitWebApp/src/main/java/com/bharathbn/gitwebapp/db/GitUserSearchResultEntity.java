package com.bharathbn.gitwebapp.db;

import java.util.Date;
import java.util.List;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Id;

import com.bharathbn.gitwebapp.model.GitUsersSearch;


@Entity
public class GitUserSearchResultEntity {

private String owner;
	
	public String getOwner() {
		return owner;
	}

	public void setOwner(String owner) {
		this.owner = owner;
	}
	@Id
	private long id;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	
	private String serachItem;

	private Date time;

	public Date getTime() {
		return time;
	}

	public void setTime(Date time) {
		this.time = time;
	}

	private int total_count;

	public String getSerachItem() {
		return serachItem;
	}

	public void setSerachItem(String serachItem) {
		this.serachItem = serachItem;
	}

	public int getTotal_count() {
		return total_count;
	}

	public void setTotal_count(int total_count) {
		this.total_count = total_count;
	}

	public boolean isIncomplete_results() {
		return incomplete_results;
	}

	public void setIncomplete_results(boolean incomplete_results) {
		this.incomplete_results = incomplete_results;
	}

	public List<GitUsersSearch> getItems() {
		return items;
	}

	public void setItems(List<GitUsersSearch> items) {
		this.items = items;
	}

	private boolean incomplete_results;

	@ElementCollection(targetClass = GitUsersSearch.class)
	private List<GitUsersSearch> items;

}
