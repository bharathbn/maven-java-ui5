package com.bharathbn.gitwebapp.db;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface GitUserSearchResultRepository extends CrudRepository<GitUserSearchResultEntity, Long>{
	
	@Query("select u from GitUserSearchResultEntity u where u.owner like %?1")
	List<GitUserSearchResultEntity> findByOwner(String owner);

	GitUserSearchResultEntity findAllById(long id);
	
	List<GitUserSearchResultEntity> findAllById(List<Long> ids);

}
