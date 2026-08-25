import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { StarRating } from '../star-rating/star-rating';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, StarRating],
  templateUrl: './product-card.html',
})
export class ProductCard {
  /** The product to render — passed down from the parent (Products page). */
  @Input({ required: true }) product!: Product;

  /** Emits the product back up to the parent when "Add to cart" is clicked. */
  @Output() addToCart = new EventEmitter<Product>();

  onAddToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.addToCart.emit(this.product);
  }

  get placeholderImage(): string {
    return 'https://placehold.co/400x400/E7F2EF/19183B?text=Aura';
  }
}
