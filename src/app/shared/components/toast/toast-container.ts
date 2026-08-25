import { Component } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  templateUrl: './toast-container.html',
})
export class ToastContainer {
  constructor(public toastService: ToastService) {}
}
