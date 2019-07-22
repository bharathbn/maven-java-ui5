package com.bharathbn.gitwebapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bharathbn.gitwebapp.db.GitUserEntity;
import com.bharathbn.gitwebapp.db.GitUserRepository;


@Service
public class GitUserRepoService {

	@Autowired
	private GitUserRepository gitUserRepository;

	public void insertGitUser(String accessToken, String ownerId) {
		GitUserEntity entity = new GitUserEntity();
		entity.setAccess_token(accessToken);
		entity.setOwnerIdd(ownerId);
		gitUserRepository.save(entity);
	}

	public String getOwner(String access_token) {
		GitUserEntity entity = null;
		try {
			entity = gitUserRepository.findByToken(access_token);
		} catch (Exception e) {
			e.printStackTrace();
		}
		if (entity == null)
			return "";
		else
			return entity.getOwnerId();
	}

	public void delete(String access_token) {
		GitUserEntity entity = null;
		entity = gitUserRepository.findByToken(access_token);
		if (entity != null) {
			gitUserRepository.delete(entity);
		}
	}

}
