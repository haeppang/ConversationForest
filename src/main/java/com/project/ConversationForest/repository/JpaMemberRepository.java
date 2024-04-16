package com.project.ConversationForest.repository;

import com.project.ConversationForest.domain.Member;
import jakarta.persistence.EntityManager;

import java.util.Optional;

public class JpaMemberRepository implements MemberRepository {

    private final EntityManager em;

    public JpaMemberRepository(EntityManager em) {
        this.em = em;
    }

    @Override
    public Member save(Member member) {
        em.persist(member);
        return member;
    }

    @Override
    public Optional<Member> findByEmail(String email) {
        Member member = em.find(Member.class, email);
        return Optional.ofNullable(member);
    }

    @Override
    public Optional<Member> findByPw(String email) {
        return Optional.empty();
    }
}
