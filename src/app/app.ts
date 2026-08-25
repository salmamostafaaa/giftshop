import { AfterViewChecked, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { ToastContainer } from './shared/components/toast/toast-container';

declare const bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewChecked {
  private tooltipsInitialized = new Set<Element>();

  ngAfterViewChecked(): void {
    // Activate any Bootstrap tooltips (e.g. product shade swatches) that appeared
    // after the latest render pass, without re-initializing existing ones.
    if (typeof bootstrap === 'undefined') return;

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
      if (!this.tooltipsInitialized.has(el)) {
        new bootstrap.Tooltip(el);
        this.tooltipsInitialized.add(el);
      }
    });
  }
}
