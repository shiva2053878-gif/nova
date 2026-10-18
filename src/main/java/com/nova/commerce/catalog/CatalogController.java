package com.nova.commerce.catalog;

import java.math.BigDecimal;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.criteria.JoinType;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api")
@Transactional(readOnly = true)
public class CatalogController {
  private final ProductRepository products; private final CategoryRepository categories;
  CatalogController(ProductRepository products, CategoryRepository categories) { this.products=products; this.categories=categories; }
  @GetMapping("/categories") public java.util.List<Category> categories() { return categories.findAll(Sort.by("name")); }
  @GetMapping("/products")
  public Page<ProductResponse> list(@RequestParam(required=false) String q, @RequestParam(required=false) String category, @RequestParam(required=false) BigDecimal minPrice, @RequestParam(required=false) BigDecimal maxPrice, @RequestParam(required=false) Double minRating, @RequestParam(required=false) Boolean inStock, @RequestParam(defaultValue="newest") String sort, @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="12") int size) {
    Specification<Product> spec = Specification.where(null);
    if (q != null && !q.isBlank()) { String term="%"+q.trim().toLowerCase()+"%"; spec=spec.and((root, query, cb)->cb.or(cb.like(cb.lower(root.get("name")),term),cb.like(cb.lower(root.get("description")),term))); }
    if (category != null && !category.isBlank()) spec=spec.and((root, query, cb)->cb.equal(root.join("category", JoinType.INNER).get("name"),category));
    if (minPrice != null) spec=spec.and((root,query,cb)->cb.greaterThanOrEqualTo(root.get("price"),minPrice));
    if (maxPrice != null) spec=spec.and((root,query,cb)->cb.lessThanOrEqualTo(root.get("price"),maxPrice));
    if (minRating != null) spec=spec.and((root,query,cb)->cb.greaterThanOrEqualTo(root.get("rating"),minRating));
    if (Boolean.TRUE.equals(inStock)) spec=spec.and((root,query,cb)->cb.greaterThan(root.get("stock"),0));
    Sort ordering = switch(sort) { case "price-asc" -> Sort.by("price").ascending(); case "price-desc" -> Sort.by("price").descending(); case "popular" -> Sort.by("popularity").descending(); default -> Sort.by("createdAt").descending(); };
    return products.findAll(spec, PageRequest.of(Math.max(page,0), Math.min(Math.max(size,1),48), ordering)).map(ProductResponse::from);
  }
  @GetMapping("/products/{id}") public ProductResponse one(@PathVariable Long id) { return ProductResponse.from(products.findById(id).orElseThrow(() -> new ProductNotFoundException(id))); }
}
