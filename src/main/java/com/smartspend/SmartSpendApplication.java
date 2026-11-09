package com.smartspend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import com.smartspend.model.Category;
import com.smartspend.repository.CategoryRepository;

import java.util.Arrays;

@SpringBootApplication
public class SmartSpendApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartSpendApplication.class, args);
    }

    @Bean
    public CommandLineRunner addDefaultCategories(CategoryRepository categories) {
        return args -> {
            for (String name : Arrays.asList("Food", "Travel", "Shopping", "Education")) {
                if (!categories.existsByNameIgnoreCase(name)) {
                    Category category = new Category();
                    category.setName(name);
                    categories.save(category);
                }
            }
        };
    }
}
