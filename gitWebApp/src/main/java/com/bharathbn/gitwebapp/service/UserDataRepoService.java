package com.bharathbn.gitwebapp.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bharathbn.gitwebapp.db.UserDataEntity;
import com.bharathbn.gitwebapp.db.UserDataRepository;
import com.bharathbn.gitwebapp.model.UserData;



@Service
public class UserDataRepoService {

	@Autowired
	UserDataRepository userDataRepository;
	
	public UserDataEntity insertUserData(UserData userData, String ownerId) {
		UserDataEntity entity = new UserDataEntity();
		entity.setLogin(userData.getlogin());
		entity.setLocation(userData.getLocation());
		entity.setName(userData.getName());
		entity.setSearchTime(new Date());
		entity.setOwnerId(ownerId);
		userDataRepository.save(entity);
		return entity;
	}
	
	public void deleteEntities(List<Long> ids) {
		userDataRepository.deleteAll(userDataRepository.findAllById(ids));
	}
	
	public List<UserDataEntity> getUserHistory(String ownerId) {
		return userDataRepository.findByOwner(ownerId);
	}
}
