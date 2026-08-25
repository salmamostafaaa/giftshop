import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { StarRating } from '../../shared/components/star-rating/star-rating';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Spinner } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, StarRating, ProductCard, Spinner],
  templateUrl: './product-detail.html',
})
export class ProductDetail implements OnInit {
  product = signal<Product | null>(null);
  related = signal<Product[]>([]);
  loading = signal(true);
  notFound = signal(false);
  quantity = signal(1);

  placeholderImage = 'https://placehold.co/600x600/E7F2EF/19183B?text=Aura';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cart: CartService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.loading.set(true);
      this.notFound.set(false);
      this.quantity.set(1);

      this.productService.getProductById(id).subscribe((product) => {
        if (!product) {
          this.notFound.set(true);
          this.loading.set(false);
          return;
        }
        this.product.set(product);
        this.loading.set(false);

        if (product.category) {
          this.productService.getByCategory(product.category).subscribe((list) => {
            this.related.set(list.filter((p) => p.id !== product.id).slice(0, 4));
          });
        }
      });
    });
  }

  increment(): void {
    this.quantity.update((q) => q + 1);
  }

  decrement(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;
    this.cart.add(product, this.quantity());
    this.toast.show(`${product.name} (x${this.quantity()}) added to your cart`, 'success');
  }

  onRelatedAddToCart(product: Product): void {
    this.cart.add(product);
    this.toast.show(`${product.name} added to your cart`, 'success');
  }
}
