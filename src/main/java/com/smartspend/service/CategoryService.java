package com.smartspend.service;

import com.smartspend.dto.ApiModels.CategoryRequest;
import com.smartspend.dto.ApiModels.CategoryView;
import com.smartspend.model.Category;
import com.smartspend.repository.BudgetRepository;
import com.smartspend.repository.CategoryRepository;
import com.smartspend.repository.ExpenseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    private final CategoryRepository categories;
    private final ExpenseRepository expenses;
    private final BudgetRepository budgets;

    public CategoryService(CategoryRepository categories, ExpenseRepository expenses, BudgetRepository budgets) {
        this.categories = categories;
        this.expenses = expenses;
        this.budgets = budgets;
    }

    @Transactional(readOnly = true)
    public List<CategoryView> getAll() {
        return categories.findAll().stream().map(this::toView).collect(Collectors.toList());
    }

    @Transactional
    public CategoryView create(CategoryRequest request) {
        String name = request.name.trim();
        if (categories.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A category with this name already exists.");
        }
        Category category = new Category();
        category.setName(name);
        category.setDescription(clean(request.description));
        return toView(categories.save(category));
    }

    @Transactional
    public CategoryView update(Long id, CategoryRequest request) {
        Category category = categories.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found."));
        String name = request.name.trim();
        if (categories.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A category with this name already exists.");
        }
        category.setName(name);
        category.setDescription(clean(request.description));
        return toView(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = categories.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found."));
        if (expenses.countByCategoryId(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This category has expenses and cannot be deleted.");
        }
        budgets.deleteByCategoryId(id);
        categories.delete(category);
    }

    private CategoryView toView(Category category) {
        CategoryView view = new CategoryView();
        view.id = category.getId();
        view.name = category.getName();
        view.description = category.getDescription();
        view.createdAt = category.getCreatedAt();
        return view;
    }

    private String clean(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }
}
