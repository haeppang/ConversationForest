package com.project.ConversationForest.controller;

import com.project.ConversationForest.domain.Member;
import com.project.ConversationForest.service.MemberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import jakarta.servlet.http.Cookie;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

@Controller
public class memberController {
    private final Logger log = LoggerFactory.getLogger(this.getClass().getSimpleName());
    private final MemberService memberService;
    private final PasswordEncoder passwordEncoder;


    public memberController(MemberService memberService, PasswordEncoder passwordEncoder) {
        this.memberService = memberService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("login")
    public String loginUser() {
        return "members/login";
    }

    @PostMapping("session_login")

    public String sesionLogin(MemberForm form, HttpServletRequest request, RedirectAttributes redirectAttributes, HttpServletResponse response) {
        Optional<Member> member = memberService.findUser(form.getEmail());


        if (member.isPresent() && passwordEncoder.matches(form.getPw(), member.get().getPw())) {
            // 로그인 성공 시 세션에 사용자 정보를 저장합니다.

            if (form.isCookie()) {
                Cookie cookie = new Cookie("cookie", form.getEmail());
                cookie.setMaxAge(24 * 30 * 60 * 60 * 1000); //30일간 저장
                response.addCookie(cookie);
            } else {
                Cookie cookie = new Cookie("cookie", "");
                cookie.setMaxAge(0);
                response.addCookie(cookie);
            }

            HttpSession session = request.getSession();
            session.setAttribute("session", member);
            return "redirect:/"; // 로그인 후 이동할 페이지를 지정합니다.
        } else {
            // 로그인 실패 시 에러 메시지를 전달합니다.
            redirectAttributes.addFlashAttribute("msg", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return "redirect:/login"; // 로그인 실패 시 다시 로그인 페이지로 이동합니다.
        }
    }

    @GetMapping("register")
    public String registerUser() {
        return "members/register";
    }

    @PostMapping("register")
    public String create(MemberForm memberForm, RedirectAttributes redirectAttributes) {
        Member member = new Member();
        member.setEmail(memberForm.getEmail());
        member.setPw(passwordEncoder.encode(memberForm.getPw()));
        member.setName(memberForm.getName());
        memberService.join(member);

        redirectAttributes.addFlashAttribute("msg", "회원가입이 완료되었습니다.");
        return "redirect:/login";
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
