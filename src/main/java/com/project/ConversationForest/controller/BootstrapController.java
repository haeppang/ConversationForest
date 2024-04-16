package com.project.ConversationForest.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class BootstrapController {

    @GetMapping("/")
    public String home() {
        return "index";
    }
}
