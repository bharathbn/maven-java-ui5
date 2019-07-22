package com.bharathbn.gitwebapp.db;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface GitUserRepository extends CrudRepository<GitUserEntity, Long>{

	@Query("select u from GitUserEntity u where u.access_token like %?1")
	GitUserEntity findByToken(String access_token);

}
