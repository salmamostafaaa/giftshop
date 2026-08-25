import { Component, Input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  templateUrl: './star-rating.html',
})
export class StarRating {
  /** Rating value from 0–5, e.g. 4.3 */
  @Input() set rating(value: number | null | undefined) {
    this.ratingSignal.set(value ?? 0);
  }

  private ratingSignal = signal(0);

  stars = computed(() =>
    Array.from({ length: 5 }, (_, i) => {
      const filled = this.ratingSignal() - i;
      if (filled >= 1) return 'full';
      if (filled >= 0.5) return 'half';
      return 'empty';
    })
  );

  ratingText = computed(() => this.ratingSignal().toFixed(1));
}
