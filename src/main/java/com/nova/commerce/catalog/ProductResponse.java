package com.nova.commerce.catalog;
import java.math.BigDecimal;
import java.time.Instant;
public record ProductResponse(Long id, String name, String description, BigDecimal price, BigDecimal originalPrice, int stock, double rating, String imageUrl, String category, Instant createdAt) {
  static ProductResponse from(Product p) { return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.getOriginalPrice(), p.getStock(), p.getRating(), p.getImageUrl(), p.getCategory().getName(), p.getCreatedAt()); }
}
