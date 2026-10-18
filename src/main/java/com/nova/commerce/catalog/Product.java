package com.nova.commerce.catalog;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products", indexes = {@Index(name = "idx_product_name", columnList = "name"), @Index(name = "idx_product_category", columnList = "category_id")})
public class Product {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false, length = 140) private String name;
  @Column(nullable = false, length = 1200) private String description;
  @Column(nullable = false, precision = 12, scale = 2) private BigDecimal price;
  @Column(precision = 12, scale = 2) private BigDecimal originalPrice;
  @Column(nullable = false) private int stock;
  @Column(nullable = false) private double rating;
  @Column(nullable = false) private int popularity;
  @Column(nullable = false, length = 300) private String imageUrl;
  @ManyToOne(optional = false, fetch = FetchType.LAZY) private Category category;
  @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
  protected Product() {}
  public Product(String name, String description, BigDecimal price, BigDecimal originalPrice, int stock, double rating, int popularity, String imageUrl, Category category) { this.name=name; this.description=description; this.price=price; this.originalPrice=originalPrice; this.stock=stock; this.rating=rating; this.popularity=popularity; this.imageUrl=imageUrl; this.category=category; }
  public Long getId(){return id;} public String getName(){return name;} public String getDescription(){return description;} public BigDecimal getPrice(){return price;} public BigDecimal getOriginalPrice(){return originalPrice;} public int getStock(){return stock;} public double getRating(){return rating;} public int getPopularity(){return popularity;} public String getImageUrl(){return imageUrl;} public Category getCategory(){return category;} public Instant getCreatedAt(){return createdAt;}
}
