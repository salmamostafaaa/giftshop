import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Spinner } from '../../shared/components/spinner/spinner';

interface CategorySummary {
  name: string;
  count: number;
  sampleImage: string | null;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink, Spinner],
  templateUrl: './categories.html',
})
export class Categories implements OnInit {
  categories = signal<CategorySummary[]>([]);
  loading = signal(true);

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        const map = new Map<string, CategorySummary>();
        for (const p of products) {
          if (!p.category) continue;
          const existing = map.get(p.category);
          if (existing) {
            existing.count++;
          } else {
            map.set(p.category, { name: p.category, count: 1, sampleImage: p.image_link });
          }
        }
        this.categories.set(Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToCategory(category: string): void {
    this.router.navigate(['/products'], { queryParams: { category } });
  }

  placeholderFor(name: string): string {
    return `https://placehold.co/500x300/A1C2BD/19183B?text=${encodeURIComponent(name)}`;
  }
}
