import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  /** Cached stream so every page/component shares one HTTP call instead of re-fetching. */
  private products$?: Observable<Product[]>;

  constructor(private http: HttpClient) {}

  /**
   * Fetches the product catalog from our own curated dataset bundled in
   * /assets. The public Makeup API this project used to call is old and
   * abandoned — many of its image links are dead and some products have no
   * price at all, so we no longer depend on it. Every product below is
   * guaranteed to have a working image and a real price.
   */
  /** Max number of products kept per category, to keep the catalog small and curated. */
  private static readonly MAX_PER_CATEGORY = 5;

  getProducts(): Observable<Product[]> {
    if (!this.products$) {
      this.products$ = this.http.get<Product[]>('assets/data/fallback-products.json').pipe(
        map((list) => list.map((p) => this.normalize(p))),
        map((list) => this.curate(list)),
        shareReplay(1)
      );
    }
    return this.products$;
  }

  /** The live Makeup API occasionally returns null for array fields — guard against that here. */
  private normalize(p: Product): Product {
    return {
      ...p,
      tag_list: p.tag_list ?? [],
      product_colors: p.product_colors ?? [],
    };
  }

  /**
   * Drops products with no real image (so the UI never has to fall back to the
   * generic "Aura" placeholder), then caps each category at MAX_PER_CATEGORY
   * items so the catalog stays small (e.g. lipstick: 122 -> 5).
   */
  private curate(list: Product[]): Product[] {
    const withImages = list.filter((p) => !!p.image_link && p.image_link.trim().length > 0);

    const perCategoryCount = new Map<string, number>();
    const result: Product[] = [];

    for (const p of withImages) {
      const key = (p.category ?? '').toLowerCase();
      const count = perCategoryCount.get(key) ?? 0;
      if (count >= ProductService.MAX_PER_CATEGORY) continue;
      perCategoryCount.set(key, count + 1);
      result.push(p);
    }

    return result;
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.getProducts().pipe(map((list) => list.find((p) => p.id === id)));
  }

  getByCategory(category: string): Observable<Product[]> {
    return this.getProducts().pipe(
      map((list) => list.filter((p) => (p.category ?? '').toLowerCase() === category.toLowerCase()))
    );
  }

  getCategories(): Observable<string[]> {
    return this.getProducts().pipe(
      map((list) => {
        const set = new Set(list.map((p) => p.category).filter((c): c is string => !!c));
        return Array.from(set).sort();
      })
    );
  }

  getBrands(): Observable<string[]> {
    return this.getProducts().pipe(
      map((list) => {
        const set = new Set(list.map((p) => p.brand).filter((b): b is string => !!b));
        return Array.from(set).sort();
      })
    );
  }
}
