package com.project.ConversationForest.service;

import com.project.ConversationForest.repository.JpaMemberRepository;
import com.project.ConversationForest.repository.MemberRepository;
import jakarta.persistence.EntityManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class SpringConfig {
    private final EntityManager em;

    public SpringConfig(DataSource dataSource, EntityManager em) {
        this.em = em;
    }

    @Bean
    public MemberService memberService() {
        return new MemberService(memberRepository());
    }
    @Bean
    public MemberRepository memberRepository() {
        return new JpaMemberRepository(em);
    }
}