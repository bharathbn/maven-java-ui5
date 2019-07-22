package com.bharathbn.gitwebapp.exception;

public class GitHubException extends Exception{
	private String errorMessage;

	public String getErrorMessage() {
		return errorMessage;
	}

	public GitHubException(String errorMessage) {
		super(errorMessage);
		this.errorMessage = errorMessage;
	}
	
	public GitHubException() {
		super();
	}

}
