import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Spinner } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCard, Spinner],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  featured = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private productService: ProductService,
    private cart: CartService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        // Take a handful of well-rated items for the featured strip.
        const sorted = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        this.featured.set(sorted.slice(0, 8));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load featured products right now. Please try again shortly.');
        this.loading.set(false);
      },
    });
  }

  onAddToCart(product: Product): void {
    this.cart.add(product);
    this.toast.show(`${product.name} added to your cart`, 'success');
  }
}
