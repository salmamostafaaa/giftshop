import { Injectable, computed, signal } from '@angular/core';
import { CartItem, Product } from '../models/product.model';

const CART_KEY = 'giftshop_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSignal = signal<CartItem[]>(this.readCart());

  readonly items = computed(() => this.itemsSignal());
  readonly totalCount = computed(() => this.itemsSignal().reduce((sum, i) => sum + i.quantity, 0));
  readonly totalPrice = computed(() =>
    this.itemsSignal().reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0)
  );

  add(product: Product, quantity = 1): void {
    const items = [...this.itemsSignal()];
    const existing = items.find((i) => i.product.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ product, quantity });
    }

    this.persist(items);
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    const items = this.itemsSignal().map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    this.persist(items);
  }

  remove(productId: number): void {
    this.persist(this.itemsSignal().filter((i) => i.product.id !== productId));
  }

  clear(): void {
    this.persist([]);
  }

  private persist(items: CartItem[]): void {
    this.itemsSignal.set(items);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  private readCart(): CartItem[] {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  }
}
