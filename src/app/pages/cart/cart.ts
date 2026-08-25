import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CartItem } from '../../core/models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './cart.html',
})
export class Cart {
  subtotal(item: CartItem): number {
    return Number(item.product.price) * item.quantity;
  }

  constructor(
    public cart: CartService,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  updateQuantity(productId: number, value: string): void {
    const qty = Number(value);
    if (!Number.isNaN(qty)) {
      this.cart.updateQuantity(productId, qty);
    }
  }

  remove(productId: number): void {
    this.cart.remove(productId);
  }

  confirmClear(): void {
    this.cart.clear();
    this.toast.show('Cart cleared', 'info');
  }

  checkout(): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.show('Please log in to checkout', 'info');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }
    this.cart.clear();
    this.toast.show('Order placed! Thank you for shopping with us.', 'success');
    this.router.navigate(['/profile']);
  }
}
