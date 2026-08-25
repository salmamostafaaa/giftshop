import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

/** Max number of items kept per category once the catalog is curated. */
const MAX_ITEMS_PER_CATEGORY = 5;

@Injectable({ providedIn: 'root' })
export class ProductService {
  /** Cached stream so every page/component shares one HTTP call instead of re-fetching. */
  private products$?: Observable<Product[]>;

  constructor(private http: HttpClient) {}

  /**
   * Fetches the product catalog from the public Makeup API.
   * If the live API is unreachable (it runs on a free Heroku-style host and can
   * occasionally sleep or go offline), we transparently fall back to a bundled
   * JSON dataset served from /assets — still a real HTTP request, never a
   * hard-coded in-memory array.
   *
   * The raw API returns 1000+ products, many with no real photo (image_link is
   * null or a broken placeholder). Before it reaches any page, the catalog is
   * curated here: products without a usable image are dropped entirely, and
   * each category is capped at MAX_ITEMS_PER_CATEGORY so the site stays a
   * tight, browsable shop instead of dozens of near-duplicate pages.
   */
  getProducts(): Observable<Product[]> {
    if (!this.products$) {
      this.products$ = this.http.get<Product[]>(environment.makeupApiUrl).pipe(
        catchError(() => {
          console.warn('Makeup API unavailable — using bundled fallback dataset.');
          return this.http.get<Product[]>('/assets/data/fallback-products.json');
        }),
        map((list) => list.map((p) => this.normalize(p))),
        map((list) => this.curate(list)),
        shareReplay(1)
      );
    }
    return this.products$;
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

  /** The live Makeup API occasionally returns null for array fields — guard against that here. */
  private normalize(p: Product): Product {
    return {
      ...p,
      tag_list: p.tag_list ?? [],
      product_colors: p.product_colors ?? [],
    };
  }

  /** A product only counts as "real" if it has a usable, non-empty image URL. */
  private hasUsableImage(p: Product): boolean {
    const link = p.image_link?.trim();
    return !!link && /^https?:\/\//i.test(link);
  }

  /** Drops image-less products and caps each category at MAX_ITEMS_PER_CATEGORY. */
  private curate(list: Product[]): Product[] {
    const withImages = list.filter((p) => this.hasUsableImage(p));
    const perCategory = new Map<string, Product[]>();

    for (const p of withImages) {
      const key = p.category ?? 'uncategorized';
      const bucket = perCategory.get(key) ?? [];
      if (bucket.length < MAX_ITEMS_PER_CATEGORY) {
        bucket.push(p);
        perCategory.set(key, bucket);
      }
    }

    return Array.from(perCategory.values()).flat();
  }
}
