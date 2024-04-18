package com.project.ConversationForest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude={SecurityAutoConfiguration.class})
public class ConversationForestApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConversationForestApplication.class, args);
	}

}
