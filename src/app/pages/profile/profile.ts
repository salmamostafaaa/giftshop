import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

interface MockOrder {
  id: string;
  date: string;
  items: number;
  total: string;
  status: 'Delivered' | 'Processing' | 'Shipped';
  progress: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgClass],
  templateUrl: './profile.html',
})
export class Profile {
  orders: MockOrder[] = [
    { id: '#AU-1042', date: 'Aug 12, 2026', items: 3, total: '$58.40', status: 'Delivered', progress: 100 },
    { id: '#AU-1077', date: 'Aug 20, 2026', items: 1, total: '$19.99', status: 'Shipped', progress: 70 },
    { id: '#AU-1091', date: 'Aug 24, 2026', items: 2, total: '$34.20', status: 'Processing', progress: 30 },
  ];

  constructor(public auth: AuthService, private router: Router, private toast: ToastService) {}

  statusBadgeClass(status: MockOrder['status']): string {
    switch (status) {
      case 'Delivered': return 'bg-success';
      case 'Shipped': return 'bg-info text-dark';
      case 'Processing': return 'bg-warning text-dark';
    }
  }

  logout(): void {
    this.auth.logout();
    this.toast.show('You have been logged out', 'info');
    this.router.navigate(['/']);
  }
}
