package com.bharathbn.gitwebapp.controller;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import com.bharathbn.gitwebapp.db.GitUserSearchResultEntity;
import com.bharathbn.gitwebapp.db.UserDataEntity;
import com.bharathbn.gitwebapp.exception.GitHubException;
import com.bharathbn.gitwebapp.model.TokenRequest;
import com.bharathbn.gitwebapp.model.TokenResponse;
import com.bharathbn.gitwebapp.model.UserData;
import com.bharathbn.gitwebapp.service.GitHubAccessTokenService;
import com.bharathbn.gitwebapp.service.GitUserRepoService;
import com.bharathbn.gitwebapp.service.GitUserSearchResultRepoService;
import com.bharathbn.gitwebapp.service.UserDataRepoService;



@Controller
public class HomeController {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private UserDataRepoService userDataRepoService;

    @Autowired
    private GitHubAccessTokenService gitTokenService;
    
    @Autowired
    private GitUserRepoService gitUserRepoService;
    
    @Autowired
	private GitUserSearchResultRepoService gitUserSearchResultRepoService;

    private final String GITHUB_URL = "https://api.github.com/users";

    
    @RequestMapping("/gitWebApp")
	public String home() {
		return "index";
	}
    
    @Value("${client_id}")
	private String client_id;

	@Value("${client_secret}")
	private String client_secret;
	@RequestMapping(value = "/gitWebApp/search", method = RequestMethod.GET, produces = "application/json")
	public ResponseEntity<?> getProfile(@RequestParam(value = "name") String name,
			@RequestHeader("Authorization") String bearerToken) throws GitHubException, SQLException {
		UserDataEntity entityData = null;
		UserData data;
		String owner = null;
		if (bearerToken.isEmpty() || null == bearerToken) {
			return new ResponseEntity<String>("Please check the Bearer token", HttpStatus.BAD_REQUEST);
		} else {
			bearerToken = bearerToken.replace("Bearer", "").trim();
			owner = gitUserRepoService.getOwner(bearerToken);
			if (owner.isEmpty() || null == owner) {
				return new ResponseEntity<String>("User is not Authorized", HttpStatus.UNAUTHORIZED);
			} else {
				try {
					data = restTemplate.getForObject(GITHUB_URL + "/" + name, UserData.class);
					entityData = userDataRepoService.insertUserData(data, owner);
				} catch (HttpClientErrorException ex) {
					if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
						return new ResponseEntity<String>("User Not found", HttpStatus.OK);
					}
					throw new GitHubException(ex.getStatusText());
				}
				return new ResponseEntity<UserDataEntity>(entityData, HttpStatus.OK);
			}
		}
	}

	@RequestMapping(value = "/gitWebApp/login", method = RequestMethod.POST, produces = "application/json", consumes = "application/json")
	public ResponseEntity<?> getAccessToken(@RequestBody Map<String, String> map) {

		TokenResponse tokenResponse = null;
		TokenRequest tokenRequest = new TokenRequest(map.get("code"), map.get("redirect_uri"), client_id,
				client_secret);
		if (isValidTokenRequest(tokenRequest)) {
			try {
				tokenResponse = gitTokenService.getAccessToken(tokenRequest);
			} catch (HttpClientErrorException ex) {
				return new ResponseEntity<String>(ex.getMessage(), ex.getStatusCode());
			} catch (Exception e) {
				return new ResponseEntity<String>(e.getMessage(), ((HttpStatusCodeException) e).getStatusCode());
			}

			return new ResponseEntity<TokenResponse>(tokenResponse, HttpStatus.OK);

		} else {
			return new ResponseEntity<String>("Token request is not vaid", HttpStatus.BAD_REQUEST);
		}

	}
	
	@RequestMapping(value = "gitWebApp/logout", method = RequestMethod.POST)
	public ResponseEntity<?> logout(@RequestHeader("Authorization") String bearerToken) {

		if (bearerToken.isEmpty() || null == bearerToken) {
			return new ResponseEntity<String>("Please check the Bearer token", HttpStatus.BAD_REQUEST);
		} else {
			try {
			bearerToken = bearerToken.replace("Bearer", "").trim();
			gitUserRepoService.delete(bearerToken);
			return new ResponseEntity<String>(HttpStatus.OK);
			} catch (Exception e) {
				return new ResponseEntity<String>(e.getMessage(), ((HttpStatusCodeException) e).getStatusCode());
			}
		}
		

	}

	private boolean isValidTokenRequest(TokenRequest tokenRequest) {
		// TODO Auto-generated method stub
		return ((tokenRequest.getCode() != null && !tokenRequest.getCode().isEmpty())
				&& tokenRequest.getRedirect_uri() != null && !tokenRequest.getRedirect_uri().isEmpty());
	}

	@RequestMapping(value = "gitWebApp/search/users", method = RequestMethod.GET, produces = "application/json")
	public ResponseEntity<?> getUsers(@RequestParam(value = "q") String searchItem,
			@RequestHeader("Authorization") String bearerToken) {
		GitUserSearchResultEntity entity = null;
		String owner = null;
		if (bearerToken.isEmpty() || null == bearerToken) {
			return new ResponseEntity<String>("Please check the Bearer token", HttpStatus.BAD_REQUEST);
		} else {
			bearerToken = bearerToken.replace("Bearer", "").trim();
			owner = gitUserRepoService.getOwner(bearerToken);
			if (owner.isEmpty() || null == owner) {
				return new ResponseEntity<String>("User is not Authorized", HttpStatus.UNAUTHORIZED);
			} else {
				try {
					entity = restTemplate.getForObject("https://api.github.com/search/users?q=" + searchItem,
							GitUserSearchResultEntity.class);

					entity = gitUserSearchResultRepoService.insertSearchResult(entity, searchItem, owner);
				} catch (Exception e) {
					return new ResponseEntity<GitUserSearchResultEntity>(entity, HttpStatus.INTERNAL_SERVER_ERROR);
				}
			}
		}
		return new ResponseEntity<GitUserSearchResultEntity>(entity, HttpStatus.OK);
	}
	
	@RequestMapping(value = "gitWebApp/search/{id}", method = RequestMethod.GET, produces = "application/json")
	public ResponseEntity<?> getSearchResultForId(@PathVariable(value = "id") long id,
			@RequestHeader("Authorization") String bearerToken) {
		GitUserSearchResultEntity entity = null;
		String owner = null;
		if (bearerToken.isEmpty() || null == bearerToken) {
			return new ResponseEntity<String>("Please check the Bearer token", HttpStatus.BAD_REQUEST);
		} else {
			bearerToken = bearerToken.replace("Bearer", "").trim();
			owner = gitUserRepoService.getOwner(bearerToken);
			if (owner.isEmpty() || null == owner) {
				return new ResponseEntity<String>("User is not Authorized", HttpStatus.UNAUTHORIZED);
			} else {
				try {
					entity = gitUserSearchResultRepoService.getById(id);
				} catch (Exception e) {
					return new ResponseEntity<String>(e.getMessage(), ((HttpStatusCodeException) e).getStatusCode());
				}
			}
		}
		return new ResponseEntity<GitUserSearchResultEntity>(entity, HttpStatus.OK);
	}

	@RequestMapping(value = "gitWebApp/search/history", method = RequestMethod.GET, produces = "application/json")
	public ResponseEntity<?> getUserSearchHistroy(@RequestHeader("Authorization") String bearerToken) {
		List<GitUserSearchResultEntity> entityList = null;
		String owner = null;
		if (bearerToken.isEmpty() || null == bearerToken) {
			return new ResponseEntity<String>("Please check the Bearer token", HttpStatus.BAD_REQUEST);
		} else {
			bearerToken = bearerToken.replace("Bearer", "").trim();
			owner = gitUserRepoService.getOwner(bearerToken);
			if (owner.isEmpty() || null == owner) {
				return new ResponseEntity<String>("User is not Authorized", HttpStatus.UNAUTHORIZED);
			} else {
				try {
					entityList = gitUserSearchResultRepoService.getUserSearchHistory(owner);
					return new ResponseEntity<List<GitUserSearchResultEntity>>(entityList, HttpStatus.OK);
				} catch (Exception ex) {
					return new ResponseEntity<String>(ex.getMessage(), ((HttpStatusCodeException) ex).getStatusCode());
				}
			}
		}
	}

	@RequestMapping(value = "gitWebApp/search/history", method = RequestMethod.DELETE, consumes = "application/json", produces = "application/json")
	public ResponseEntity<?> deleteProfile(@RequestBody List<Long> ids,
			@RequestHeader("Authorization") String bearerToken) {

		if (bearerToken.isEmpty() || null == bearerToken) {
			return new ResponseEntity<String>("Please check the Bearer token", HttpStatus.BAD_REQUEST);
		} else {
			try {
				gitUserSearchResultRepoService.deleteHistory(ids);
				return new ResponseEntity<String>("Deleted sucessfully",HttpStatus.OK);
			} catch (Exception ex) {
				return new ResponseEntity<String>(ex.getMessage(), ((HttpStatusCodeException) ex).getStatusCode());
			}

		}
	}
}
