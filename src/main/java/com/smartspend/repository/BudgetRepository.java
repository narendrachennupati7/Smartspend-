package com.smartspend.repository;

import com.smartspend.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByMonthAndYear(int month, int year);
    Optional<Budget> findByCategoryIdAndMonthAndYearAndIdNot(
            Long categoryId, int month, int year, Long id);
    boolean existsByCategoryIdAndMonthAndYear(Long categoryId, int month, int year);
    void deleteByCategoryId(Long categoryId);
}
