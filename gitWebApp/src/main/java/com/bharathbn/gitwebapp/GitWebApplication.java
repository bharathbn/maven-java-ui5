package com.bharathbn.gitwebapp;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class GitWebApplication extends SpringBootServletInitializer{

	public static void main(String[] args) {
		SpringApplication.run(GitWebApplication.class, args);
	}
	
	@Override
	  protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
	      return builder.sources(GitWebApplication.class);
	  }
	
	@Bean
    public RestTemplate restTemplate() {

           return new RestTemplate();

    }
}