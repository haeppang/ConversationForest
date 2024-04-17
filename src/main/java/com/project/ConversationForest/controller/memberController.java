package com.project.ConversationForest.controller;

import com.project.ConversationForest.domain.Member;
import com.project.ConversationForest.service.MemberService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class memberController {
    private final Logger log = LoggerFactory.getLogger(this.getClass().getSimpleName());
    private final MemberService memberService;

    public memberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping("login")
    public String loginUser() {
        return "members/login";
    }

    @GetMapping("register")
    public String registerUser() {
        return "members/register";
    }
    @PostMapping("register")
    public String create(MemberForm memberForm) {
        Member member = new Member();
        member.setEmail(memberForm.getEmail());
        member.setPw(memberForm.getPw());
        member.setName(memberForm.getName());
        memberService.join(member);

        return "redirect:/";
    }

    @PostMapping("duplicate")
    public ResponseEntity<Boolean> duplicate(@RequestParam("email") String email) {
        Member member = new Member();
        member.setEmail(email);
        boolean res = true;

        if (email.trim().isEmpty()) {
            res = false;
        }
        if (!memberService.extractedMember(member)) {
            res = false;
        }

        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}
