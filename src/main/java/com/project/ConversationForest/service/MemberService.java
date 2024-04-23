package com.project.ConversationForest.service;



import com.project.ConversationForest.domain.Member;
import com.project.ConversationForest.repository.MemberRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;

@Transactional
public class MemberService {
    private final MemberRepository memberRepository;

    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public String join(Member member) {
        if (extractedMember(member)) {
            memberRepository.save(member);
            return member.getEmail();
        } else {
            throw new IllegalStateException("이미 존재하는 회원입니다.");
        }
    }

    public boolean extractedMember(Member member) {
        AtomicBoolean res = new AtomicBoolean(true);

        memberRepository.findByEmail(member.getEmail())
                .ifPresent(m -> {
                    res.set(false);
                });
        return res.get();
    }

    public Optional<Member> findUser(String email) {
        return memberRepository.findByUser(email);
    }
}

