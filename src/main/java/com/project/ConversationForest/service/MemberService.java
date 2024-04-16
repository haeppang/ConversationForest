package com.project.ConversationForest.service;

import com.project.ConversationForest.domain.Member;
import com.project.ConversationForest.repository.MemberRepository;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public class MemberService {
    private final MemberRepository memberRepository;

    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public String join(Member member) {
        extractedMember(member);
        memberRepository.save(member);
        return member.getEmail();
    }

    private void extractedMember(Member member) {
        memberRepository.findByEmail(member.getEmail())
                .ifPresent(m -> {
                    throw new IllegalStateException("이미 존재하는 회원입니다.");
                });
    }
}
