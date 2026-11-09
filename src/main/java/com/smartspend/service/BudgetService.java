package com.smartspend.service;

import com.smartspend.dto.ApiModels.BudgetRequest;
import com.smartspend.dto.ApiModels.BudgetView;
import com.smartspend.model.Budget;
import com.smartspend.model.Category;
import com.smartspend.repository.BudgetRepository;
import com.smartspend.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetService {
    private final BudgetRepository budgets;
    private final CategoryRepository categories;

    public BudgetService(BudgetRepository budgets, CategoryRepository categories) {
        this.budgets = budgets;
        this.categories = categories;
    }

    @Transactional(readOnly = true)
    public List<BudgetView> getMonthly(Integer month, Integer year) {
        LocalDate now = LocalDate.now();
        int selectedMonth = month == null ? now.getMonthValue() : month;
        int selectedYear = year == null ? now.getYear() : year;
        validateMonthYear(selectedMonth, selectedYear);
        return budgets.findByMonthAndYear(selectedMonth, selectedYear).stream()
                .map(this::toView).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BudgetView> getAll() {
        return budgets.findAll().stream().map(this::toView).collect(Collectors.toList());
    }

    @Transactional
    public BudgetView create(BudgetRequest request) {
        validateMonthYear(request.month, request.year);
        Category category = findCategory(request.categoryId);
        if (budgets.existsByCategoryIdAndMonthAndYear(request.categoryId, request.month, request.year)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A budget already exists for this category and month. Update it instead.");
        }
        Budget budget = new Budget();
        apply(budget, request, category);
        return toView(budgets.save(budget));
    }

    @Transactional
    public BudgetView update(Long id, BudgetRequest request) {
        validateMonthYear(request.month, request.year);
        Budget budget = budgets.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found."));
        Category category = findCategory(request.categoryId);
        if (budgets.findByCategoryIdAndMonthAndYearAndIdNot(
                request.categoryId, request.month, request.year, id).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A budget already exists for this category and month.");
        }
        apply(budget, request, category);
        return toView(budget);
    }

    private void apply(Budget budget, BudgetRequest request, Category category) {
        budget.setCategory(category);
        budget.setAllocatedAmount(request.allocatedAmount);
        budget.setMonth(request.month);
        budget.setYear(request.year);
    }

    private Category findCategory(Long id) {
        return categories.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found."));
    }

    private void validateMonthYear(int month, int year) {
        if (month < 1 || month > 12 || year < 2000 || year > 9999) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Month or year is out of range.");
        }
    }

    private BudgetView toView(Budget budget) {
        BudgetView view = new BudgetView();
        view.id = budget.getId();
        view.categoryId = budget.getCategory().getId();
        view.categoryName = budget.getCategory().getName();
        view.allocatedAmount = budget.getAllocatedAmount();
        view.month = budget.getMonth();
        view.year = budget.getYear();
        return view;
    }
}
