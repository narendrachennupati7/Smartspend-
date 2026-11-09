package com.smartspend.dto;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class ApiModels {
    private ApiModels() { }

    public static class CategoryRequest {
        @NotBlank
        @Size(max = 100)
        public String name;
        @Size(max = 500)
        public String description;
    }

    public static class BudgetRequest {
        @NotNull
        public Long categoryId;
        @NotNull
        @DecimalMin(value = "0.01")
        public BigDecimal allocatedAmount;
        @Min(1)
        @Max(12)
        public int month;
        @Min(2000)
        public int year;
    }

    public static class ExpenseRequest {
        @NotNull
        public Long categoryId;
        @NotBlank
        @Size(max = 150)
        public String title;
        @NotNull
        @DecimalMin(value = "0.01")
        public BigDecimal amount;
        @NotNull
        public LocalDate expenseDate;
        @Size(max = 500)
        public String description;
    }

    public static class CategoryView {
        public Long id;
        public String name;
        public String description;
        public LocalDateTime createdAt;
    }

    public static class BudgetView {
        public Long id;
        public Long categoryId;
        public String categoryName;
        public BigDecimal allocatedAmount;
        public int month;
        public int year;
    }

    public static class ExpenseView {
        public Long id;
        public Long categoryId;
        public String categoryName;
        public String title;
        public BigDecimal amount;
        public LocalDate expenseDate;
        public String description;
    }

    public static class CategorySummary {
        public Long categoryId;
        public String categoryName;
        public BigDecimal allocated;
        public BigDecimal spent;
        public BigDecimal remaining;
        public BigDecimal exceeded;
        public BigDecimal utilizationPercent;
        public String status;
    }

    public static class SummaryView {
        public int month;
        public int year;
        public BigDecimal totalAllocated;
        public BigDecimal totalSpent;
        public BigDecimal remaining;
        public int categoryCount;
        public List<CategorySummary> categories;
    }

    public static class ErrorView {
        public String message;

        public ErrorView(String message) {
            this.message = message;
        }
    }
}
