package com.project.ConversationForest.repository;

import com.project.ConversationForest.domain.Member;

import java.util.Optional;

public interface MemberRepository {
    Member save(Member member);

    Optional<Member>findByEmail(String email);
    Optional<Member> findByPw(String email);
}
