package com.bharathbn.gitwebapp.db;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface UserDataRepository extends CrudRepository<UserDataEntity, Long>{
	
	@Query("select u from UserDataEntity u where u.login like %?1")
	UserDataEntity findByLogin(String login); 
	
	@Query("select u from UserDataEntity u where u.ownerId like %?1")
	List<UserDataEntity> findByOwner(String ownerId); 

}
