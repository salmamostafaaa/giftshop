import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Spinner } from '../../shared/components/spinner/spinner';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating-desc';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, RouterLink, ProductCard, Spinner],
  templateUrl: './products.html',
})
export class Products implements OnInit {
  allProducts = signal<Product[]>([]);
  categories = signal<string[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);
  sortBy = signal<SortOption>('default');
  currentPage = signal(1);

  filtered = computed(() => {
    let items = this.allProducts();

    const category = this.selectedCategory();
    if (category) {
      items = items.filter((p) => p.category === category);
    }

    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.brand ?? '').toLowerCase().includes(term)
      );
    }

    switch (this.sortBy()) {
      case 'price-asc':
        items = [...items].sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        items = [...items].sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'rating-desc':
        items = [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
    }

    return items;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));

  pagedResults = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  constructor(
    private productService: ProductService,
    private cart: CartService,
    private toast: ToastService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Support ?category=xyz coming from the Categories page.
    const initialCategory = this.route.snapshot.queryParamMap.get('category');
    if (initialCategory) {
      this.selectedCategory.set(initialCategory);
    }

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load the product catalog. Please refresh the page to try again.');
        this.loading.set(false);
      },
    });

    this.productService.getCategories().subscribe((cats) => this.categories.set(cats));
  }

  selectCategory(category: string | null): void {
    this.selectedCategory.set(category);
    this.currentPage.set(1);
  }

  setSort(sort: SortOption): void {
    this.sortBy.set(sort);
    this.currentPage.set(1);
  }

  onSearchChange(): void {
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onAddToCart(product: Product): void {
    this.cart.add(product);
    this.toast.show(`${product.name} added to your cart`, 'success');
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set(null);
    this.sortBy.set('default');
    this.currentPage.set(1);
  }
}
