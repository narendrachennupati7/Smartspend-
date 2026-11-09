package com.smartspend.controller;

import com.smartspend.dto.ApiModels.ExpenseRequest;
import com.smartspend.dto.ApiModels.ExpenseView;
import com.smartspend.service.ExpenseService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/expenses")
public class ExpenseController {
    private final ExpenseService service;

    public ExpenseController(ExpenseService service) {
        this.service = service;
    }

    @GetMapping
    public List<ExpenseView> getAll(@RequestParam(required = false) Integer month,
                                    @RequestParam(required = false) Integer year,
                                    @RequestParam(required = false) Long categoryId) {
        return service.getAll(month, year, categoryId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseView create(@Valid @RequestBody ExpenseRequest request) { return service.create(request); }

    @PutMapping("/{id}")
    public ExpenseView update(@PathVariable Long id, @Valid @RequestBody ExpenseRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
