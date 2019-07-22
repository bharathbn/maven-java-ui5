package com.bharathbn.gitwebapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity.HeadersBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.bharathbn.gitwebapp.model.TokenRequest;
import com.bharathbn.gitwebapp.model.TokenResponse;
import com.bharathbn.gitwebapp.model.UserData;



@Service
public class GitHubAccessTokenService {

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	private GitUserRepoService gitUserRepoService;
	private final String GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
	private final String GIT_CURRENT_CURRENT = "https://api.github.com/user";

	public TokenResponse getAccessToken(TokenRequest tokenRequest) {

		TokenResponse tokenResponse = null;

		String uri = GITHUB_ACCESS_TOKEN_URL + "?client_id=" + tokenRequest.getClient_id() + "&redirect_uri="
				+ tokenRequest.getRedirect_uri() + "&client_secret=" + tokenRequest.getClient_secret() + "&code="
				+ tokenRequest.getCode();
		try {
			tokenResponse = restTemplate.postForObject(uri, null, TokenResponse.class);
			String currentUser = getCurrentUser(tokenResponse.getAccess_token());
			tokenResponse.setUser(currentUser);
			// Insert the Current user as owner
			if (tokenResponse.getAccess_token() != null) {
				gitUserRepoService.insertGitUser(tokenResponse.getAccess_token(), currentUser);
			}
		} catch (Exception ex) {
			throw ex;
		}
		return tokenResponse;
	}

	private String getCurrentUser(String accessToken) {

		HttpHeaders header = new HttpHeaders();
		header.setBearerAuth(accessToken);
		HttpEntity<String> entity = new HttpEntity(header);
		ResponseEntity<UserData> data = restTemplate.exchange(GIT_CURRENT_CURRENT, HttpMethod.GET, entity,
				UserData.class);
		return data.getBody().getlogin();
	}

}
