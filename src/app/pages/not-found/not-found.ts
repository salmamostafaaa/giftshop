import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container py-5 text-center">
      <i class="bi bi-emoji-frown display-1 text-sage"></i>
      <h1 class="display-5 mt-3">Page Not Found</h1>
      <p class="text-slate mb-4">The page you're looking for doesn't exist or has moved.</p>
      <a routerLink="/" class="btn btn-sage btn-lg">Back to Home</a>
    </div>
  `,
})
export class NotFound {}
