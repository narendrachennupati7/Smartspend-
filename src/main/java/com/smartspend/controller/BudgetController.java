package com.smartspend.controller;

import com.smartspend.dto.ApiModels.BudgetRequest;
import com.smartspend.dto.ApiModels.BudgetView;
import com.smartspend.service.BudgetService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {
    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @GetMapping
    public List<BudgetView> getAll(@RequestParam(required = false) Integer month,
                                   @RequestParam(required = false) Integer year) {
        return month == null && year == null ? service.getAll() : service.getMonthly(month, year);
    }

    @GetMapping("/monthly")
    public List<BudgetView> getMonthly(@RequestParam(required = false) Integer month,
                                       @RequestParam(required = false) Integer year) {
        return service.getMonthly(month, year);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetView create(@Valid @RequestBody BudgetRequest request) { return service.create(request); }

    @PutMapping("/{id}")
    public BudgetView update(@PathVariable Long id, @Valid @RequestBody BudgetRequest request) {
        return service.update(id, request);
    }
}
