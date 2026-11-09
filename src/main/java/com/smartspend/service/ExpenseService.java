package com.smartspend.service;

import com.smartspend.dto.ApiModels.ExpenseRequest;
import com.smartspend.dto.ApiModels.ExpenseView;
import com.smartspend.model.Category;
import com.smartspend.model.Expense;
import com.smartspend.repository.CategoryRepository;
import com.smartspend.repository.ExpenseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {
    private final ExpenseRepository expenses;
    private final CategoryRepository categories;

    public ExpenseService(ExpenseRepository expenses, CategoryRepository categories) {
        this.expenses = expenses;
        this.categories = categories;
    }

    @Transactional(readOnly = true)
    public List<ExpenseView> getAll(Integer month, Integer year, Long categoryId) {
        LocalDate today = LocalDate.now();
        List<Expense> result;
        if (month == null && year == null) {
            result = expenses.findAll();
        } else {
            int selectedMonth = month == null ? today.getMonthValue() : month;
            int selectedYear = year == null ? today.getYear() : year;
            if (selectedMonth < 1 || selectedMonth > 12 || selectedYear < 2000 || selectedYear > 9999) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Month or year is out of range.");
            }
            LocalDate start = LocalDate.of(selectedYear, selectedMonth, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            result = categoryId == null
                    ? expenses.findByExpenseDateBetween(start, end)
                    : expenses.findByCategoryIdAndExpenseDateBetween(categoryId, start, end);
        }
        if (categoryId != null && (month == null && year == null)) {
            result = result.stream().filter(expense -> expense.getCategory().getId().equals(categoryId))
                    .collect(Collectors.toList());
        }
        return result.stream().map(this::toView).collect(Collectors.toList());
    }

    @Transactional
    public ExpenseView create(ExpenseRequest request) {
        Expense expense = new Expense();
        apply(expense, request);
        return toView(expenses.save(expense));
    }

    @Transactional
    public ExpenseView update(Long id, ExpenseRequest request) {
        Expense expense = expenses.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found."));
        apply(expense, request);
        return toView(expense);
    }

    @Transactional
    public void delete(Long id) {
        Expense expense = expenses.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found."));
        expenses.delete(expense);
    }

    private void apply(Expense expense, ExpenseRequest request) {
        Category category = categories.findById(request.categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found."));
        expense.setCategory(category);
        expense.setTitle(request.title.trim());
        expense.setAmount(request.amount);
        expense.setExpenseDate(request.expenseDate);
        expense.setDescription(request.description == null || request.description.trim().isEmpty()
                ? null : request.description.trim());
    }

    private ExpenseView toView(Expense expense) {
        ExpenseView view = new ExpenseView();
        view.id = expense.getId();
        view.categoryId = expense.getCategory().getId();
        view.categoryName = expense.getCategory().getName();
        view.title = expense.getTitle();
        view.amount = expense.getAmount();
        view.expenseDate = expense.getExpenseDate();
        view.description = expense.getDescription();
        return view;
    }
}
