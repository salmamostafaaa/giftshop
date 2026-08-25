import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'danger' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private toastsSignal = signal<ToastMessage[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(text: string, type: ToastMessage['type'] = 'success'): void {
    const id = this.nextId++;
    this.toastsSignal.update((list) => [...list, { id, text, type }]);
    setTimeout(() => this.dismiss(id), 3500);
  }

  dismiss(id: number): void {
    this.toastsSignal.update((list) => list.filter((t) => t.id !== id));
  }
}
