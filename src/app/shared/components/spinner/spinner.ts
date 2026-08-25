import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="d-flex flex-column align-items-center justify-content-center py-5 text-slate">
      <div class="spinner-border text-sage" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 mb-0">{{ message }}</p>
    </div>
  `,
})
export class Spinner {
  @Input() message = 'Loading, please wait...';
}
