package com.smartspend.repository;

import com.smartspend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    long countByCategoryId(Long categoryId);
    List<Expense> findByExpenseDateBetween(LocalDate start, LocalDate end);
    List<Expense> findByCategoryIdAndExpenseDateBetween(Long categoryId, LocalDate start, LocalDate end);
}
