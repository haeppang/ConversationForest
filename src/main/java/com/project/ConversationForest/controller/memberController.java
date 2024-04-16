package com.project.ConversationForest.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class memberController {

    @GetMapping("register")
    public String registerUser() {
        return "members/register";
    }

    @GetMapping("login")
    public String loginUser() {
        return "members/login";
    }
}
