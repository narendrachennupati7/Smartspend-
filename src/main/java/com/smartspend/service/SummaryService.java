package com.smartspend.service;

import com.smartspend.dto.ApiModels.CategorySummary;
import com.smartspend.dto.ApiModels.SummaryView;
import com.smartspend.model.Budget;
import com.smartspend.model.Category;
import com.smartspend.model.Expense;
import com.smartspend.repository.BudgetRepository;
import com.smartspend.repository.CategoryRepository;
import com.smartspend.repository.ExpenseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SummaryService {
    private final CategoryRepository categories;
    private final BudgetRepository budgets;
    private final ExpenseRepository expenses;

    public SummaryService(CategoryRepository categories, BudgetRepository budgets, ExpenseRepository expenses) {
        this.categories = categories;
        this.budgets = budgets;
        this.expenses = expenses;
    }

    @Transactional(readOnly = true)
    public SummaryView monthly(Integer month, Integer year) {
        LocalDate today = LocalDate.now();
        int selectedMonth = month == null ? today.getMonthValue() : month;
        int selectedYear = year == null ? today.getYear() : year;
        validateMonthYear(selectedMonth, selectedYear);

        LocalDate start = LocalDate.of(selectedYear, selectedMonth, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        Map<Long, BigDecimal> allocations = new HashMap<Long, BigDecimal>();
        for (Budget budget : budgets.findByMonthAndYear(selectedMonth, selectedYear)) {
            allocations.put(budget.getCategory().getId(), budget.getAllocatedAmount());
        }

        Map<Long, BigDecimal> spending = new HashMap<Long, BigDecimal>();
        for (Expense expense : expenses.findByExpenseDateBetween(start, end)) {
            Long categoryId = expense.getCategory().getId();
            spending.put(categoryId, spending.getOrDefault(categoryId, BigDecimal.ZERO).add(expense.getAmount()));
        }

        SummaryView summary = new SummaryView();
        summary.month = selectedMonth;
        summary.year = selectedYear;
        summary.totalAllocated = BigDecimal.ZERO;
        summary.totalSpent = BigDecimal.ZERO;
        summary.remaining = BigDecimal.ZERO;
        summary.categories = new ArrayList<CategorySummary>();

        for (Category category : categories.findAll()) {
            BigDecimal allocated = allocations.getOrDefault(category.getId(), BigDecimal.ZERO);
            BigDecimal spent = spending.getOrDefault(category.getId(), BigDecimal.ZERO);
            CategorySummary item = toCategorySummary(category, allocated, spent);
            summary.categories.add(item);
            summary.totalAllocated = summary.totalAllocated.add(allocated);
            summary.totalSpent = summary.totalSpent.add(spent);
            summary.remaining = summary.remaining.add(item.remaining);
        }
        summary.categoryCount = summary.categories.size();
        return summary;
    }

    @Transactional(readOnly = true)
    public CategorySummary category(Long categoryId, Integer month, Integer year) {
        Category category = categories.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found."));
        SummaryView monthly = monthly(month, year);
        for (CategorySummary summary : monthly.categories) {
            if (summary.categoryId.equals(categoryId)) {
                return summary;
            }
        }
        return toCategorySummary(category, BigDecimal.ZERO, BigDecimal.ZERO);
    }

    private CategorySummary toCategorySummary(Category category, BigDecimal allocated, BigDecimal spent) {
        CategorySummary summary = new CategorySummary();
        summary.categoryId = category.getId();
        summary.categoryName = category.getName();
        summary.allocated = allocated;
        summary.spent = spent;
        summary.remaining = allocated.subtract(spent).max(BigDecimal.ZERO);
        summary.exceeded = spent.subtract(allocated).max(BigDecimal.ZERO);
        if (allocated.signum() == 0) {
            summary.utilizationPercent = BigDecimal.ZERO;
            summary.status = "NO_BUDGET";
        } else {
            summary.utilizationPercent = spent.multiply(BigDecimal.valueOf(100))
                    .divide(allocated, 2, RoundingMode.HALF_UP);
            if (summary.utilizationPercent.compareTo(BigDecimal.valueOf(100)) >= 0) {
                summary.status = "OVER_BUDGET";
            } else if (summary.utilizationPercent.compareTo(BigDecimal.valueOf(75)) >= 0) {
                summary.status = "APPROACHING";
            } else {
                summary.status = "WITHIN_BUDGET";
            }
        }
        return summary;
    }

    private void validateMonthYear(int month, int year) {
        if (month < 1 || month > 12 || year < 2000 || year > 9999) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Month or year is out of range.");
        }
    }
}
