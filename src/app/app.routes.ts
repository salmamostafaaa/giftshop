import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'Aura Gift & Beauty Shop — Home',
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products').then((m) => m.Products),
    title: 'Shop All Products',
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
    title: 'Product Details',
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories').then((m) => m.Categories),
    title: 'Shop by Category',
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
    title: 'Your Cart',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    title: 'Login',
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
    title: 'Register',
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
    title: 'My Account',
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Page Not Found',
  },
];
