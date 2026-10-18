package com.nova.commerce.config;

import com.nova.commerce.catalog.*;
import java.math.BigDecimal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class DemoData {
  @Bean CommandLineRunner seed(CategoryRepository categories, ProductRepository products) { return args -> { if (products.count() > 0) return;
    Category tech=new Category("Electronics"), gaming=new Category("Gaming"), wear=new Category("Wearables"), lifestyle=new Category("Lifestyle"); categories.saveAll(java.util.List.of(tech,gaming,wear,lifestyle));
    products.saveAll(java.util.List.of(
      new Product("Aether One Headphones", "Adaptive spatial audio in a sculpted acoustic shell.", new BigDecimal("349.00"), new BigDecimal("399.00"), 16, 4.8, 95, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", tech),
      new Product("Nova Arc Keyboard", "Low-profile mechanical keys with a precision aluminum frame.", new BigDecimal("179.00"), null, 9, 4.7, 88, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80", gaming),
      new Product("Orbit Smartwatch", "A focused health companion with an always-on edge display.", new BigDecimal("249.00"), new BigDecimal("289.00"), 23, 4.6, 82, "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80", wear),
      new Product("Halo Desk Light", "Responsive ambient lighting for your creative workspace.", new BigDecimal("129.00"), null, 0, 4.5, 67, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80", lifestyle),
      new Product("Vector Pro Controller", "Hall-effect controls and tactile triggers for competitive play.", new BigDecimal("99.00"), null, 31, 4.9, 98, "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80", gaming),
      new Product("Prism Mini Speaker", "Room-filling wireless sound in a compact geometric form.", new BigDecimal("139.00"), new BigDecimal("159.00"), 14, 4.4, 70, "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=800&q=80", tech)
    ));
  }; }
}
