import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  catchError,
  filter,
  forkJoin,
  from,
  map,
  mergeMap,
  of,
  shareReplay,
  switchMap,
  take,
  toArray,
} from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

/** Max number of items kept per category once the catalog is curated. */
const MAX_ITEMS_PER_CATEGORY = 5;
/** How many candidates per category we're willing to test before giving up. */
const IMAGE_CHECK_POOL_SIZE = 20;
/** How many images we verify in parallel at once. */
const IMAGE_CHECK_CONCURRENCY = 6;
/** How long we wait for a single image to load/fail before treating it as dead. */
const IMAGE_CHECK_TIMEOUT_MS = 4000;

@Injectable({ providedIn: 'root' })
export class ProductService {
  /** Cached stream so every page/component shares one HTTP call instead of re-fetching. */
  private products$?: Observable<Product[]>;

  constructor(private http: HttpClient) {}

  /**
   * Fetches the product catalog from the public Makeup API.
   * If the live API is unreachable, or once it's reached, we curate the result:
   *
   *  - Products with no price (or a $0 placeholder price) are dropped.
   *  - Products whose image URL is missing/malformed are dropped.
   *  - For the API's remaining candidates, each image is actually test-loaded
   *    in the browser (the Makeup API's image host is unreliable and often
   *    returns broken links even when the URL "looks" valid) — only products
   *    whose photo genuinely loads are kept.
   *  - Each category is capped at MAX_ITEMS_PER_CATEGORY so the site stays a
   *    tight, browsable shop instead of dozens of pages of near-duplicates.
   *
   * The bundled fallback dataset (used only if the live API is down) already
   * ships with verified working images, so it skips the load-testing step.
   */
  getProducts(): Observable<Product[]> {
    if (!this.products$) {
      this.products$ = this.http.get<Product[]>(environment.makeupApiUrl).pipe(
        map((list) => ({ list: list.map((p) => this.normalize(p)), verifyImages: true })),
        catchError(() => {
          console.warn('Makeup API unavailable — using bundled fallback dataset.');
          return this.http.get<Product[]>('/assets/data/fallback-products.json').pipe(
            map((list) => ({ list: list.map((p) => this.normalize(p)), verifyImages: false }))
          );
        }),
        switchMap(({ list, verifyImages }) => this.curate(list, verifyImages)),
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

  private hasUsableImageUrl(p: Product): boolean {
    const link = p.image_link?.trim();
    return !!link && /^https?:\/\//i.test(link);
  }

  private hasRealPrice(p: Product): boolean {
    const value = Number(p.price);
    return !Number.isNaN(value) && value > 0;
  }

  /**
   * Groups candidates by category, drops price-less/image-less products, and —
   * when verifyImages is true — actually test-loads each candidate photo,
   * keeping only the first MAX_ITEMS_PER_CATEGORY per category whose image
   * genuinely loads.
   */
  private curate(list: Product[], verifyImages: boolean): Observable<Product[]> {
    const candidates = list.filter((p) => this.hasUsableImageUrl(p) && this.hasRealPrice(p));

    const byCategory = new Map<string, Product[]>();
    for (const p of candidates) {
      const key = p.category ?? 'uncategorized';
      const bucket = byCategory.get(key) ?? [];
      bucket.push(p);
      byCategory.set(key, bucket);
    }

    const categoryGroups = Array.from(byCategory.values());
    if (categoryGroups.length === 0) return of([]);

    const perCategory$ = categoryGroups.map((group) =>
      verifyImages
        ? this.pickVerified(group, MAX_ITEMS_PER_CATEGORY)
        : of(group.slice(0, MAX_ITEMS_PER_CATEGORY))
    );

    return forkJoin(perCategory$).pipe(map((groups) => groups.flat()));
  }

  /** Tests candidate images in parallel and keeps the first `limit` that actually load. */
  private pickVerified(products: Product[], limit: number): Observable<Product[]> {
    const pool = products.slice(0, IMAGE_CHECK_POOL_SIZE);
    if (pool.length === 0) return of([]);

    return from(pool).pipe(
      mergeMap(
        (p) => from(this.verifyImageLoads(p.image_link!)).pipe(map((ok) => (ok ? p : null))),
        IMAGE_CHECK_CONCURRENCY
      ),
      filter((p): p is Product => p !== null),
      take(limit),
      toArray()
    );
  }

  /** Resolves true only if the browser can actually load the image before the timeout. */
  private verifyImageLoads(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      const timer = setTimeout(() => resolve(false), IMAGE_CHECK_TIMEOUT_MS);

      img.onload = () => {
        clearTimeout(timer);
        resolve(true);
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(false);
      };
      img.src = url;
    });
  }
}
