import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WoocommerceService, Product } from '../../services/woocommerce';
import { ProductCardComponentMini } from '../product-card copy/product-card';

@Component({
  selector: 'app-cake-products',
  imports: [CommonModule, ProductCardComponentMini],
  templateUrl: './mini-products.html',
  styleUrl: './mini-products.scss'
})
export class MiniOsusProduct implements OnInit {
  products: Product[] = [];
  loading = false;
  pageTitle = 'ميني أسس';
  selectedCategory: 'mini' | 'cake' = 'mini';

  private readonly MINI_CATEGORY_ID = 44;
  private readonly CAKE_CATEGORY_ID = 69;
  private readonly MIN_LOADING_MS = 700;
  private requestId = 0;

  constructor(private woocommerceService: WoocommerceService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  selectCategory(category: 'mini' | 'cake'): void {
    if (this.selectedCategory === category) return;

    this.selectedCategory = category;
    this.pageTitle = category === 'mini' ? 'ميني أسس' : 'الكيك';
    // إفراغ القسم السابق وإظهار شاشة التحميل فوراً قبل إرسال الطلب.
    this.products = [];
    this.loading = true;
    this.loadProducts();
  }

  private loadProducts(): void {
    const categoryId = this.getSelectedCategoryId();
    const currentRequest = ++this.requestId;
    const loadingStartedAt = Date.now();

    this.woocommerceService.getProductsByCategory(categoryId, { per_page: 50 }).subscribe({
      next: products => {
        const remainingLoadingTime = Math.max(0, this.MIN_LOADING_MS - (Date.now() - loadingStartedAt));
        setTimeout(() => {
          if (currentRequest !== this.requestId || this.getSelectedCategoryId() !== categoryId) return;
          this.products = products;
          this.loading = false;
        }, remainingLoadingTime);
      },
      error: error => {
        console.error('Error loading products:', error);
        const remainingLoadingTime = Math.max(0, this.MIN_LOADING_MS - (Date.now() - loadingStartedAt));
        setTimeout(() => {
          if (currentRequest !== this.requestId || this.getSelectedCategoryId() !== categoryId) return;
          this.products = [];
          this.loading = false;
        }, remainingLoadingTime);
      }
    });
  }

  private getSelectedCategoryId(): number {
    return this.selectedCategory === 'mini'
      ? this.MINI_CATEGORY_ID
      : this.CAKE_CATEGORY_ID;
  }
}
