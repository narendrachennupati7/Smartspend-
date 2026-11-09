package com.smartspend.controller;

import com.smartspend.dto.ApiModels.CategorySummary;
import com.smartspend.dto.ApiModels.SummaryView;
import com.smartspend.service.SummaryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/summary")
public class SummaryController {
    private final SummaryService service;

    public SummaryController(SummaryService service) {
        this.service = service;
    }

    @GetMapping
    public SummaryView getSummary(@RequestParam(required = false) Integer month,
                                  @RequestParam(required = false) Integer year) {
        return service.monthly(month, year);
    }

    @GetMapping("/monthly")
    public SummaryView getMonthly(@RequestParam(required = false) Integer month,
                                  @RequestParam(required = false) Integer year) {
        return service.monthly(month, year);
    }

    @GetMapping("/category/{categoryId}")
    public CategorySummary getCategory(@PathVariable Long categoryId,
                                       @RequestParam(required = false) Integer month,
                                       @RequestParam(required = false) Integer year) {
        return service.category(categoryId, month, year);
    }
}
