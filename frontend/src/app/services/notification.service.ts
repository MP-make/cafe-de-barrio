import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSubject = new BehaviorSubject<{ id: number, message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number }[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private toasts: { id: number, message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number }[] = [];
  private toastCounter = 0;

  constructor() {}

  showSuccess(message: string, duration: number = 3000) {
    this.addToast(message, 'success', duration);
  }

  showError(message: string, duration: number = 5000) {
    this.addToast(message, 'error', duration);
  }

  showWarning(message: string, duration: number = 4000) {
    this.addToast(message, 'warning', duration);
  }

  showInfo(message: string, duration: number = 3000) {
    this.addToast(message, 'info', duration);
  }

  private addToast(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number) {
    const id = ++this.toastCounter;
    this.toasts.push({ id, message, type, duration });
    this.toastsSubject.next([...this.toasts]);
    setTimeout(() => this.removeToast(id), duration);
  }

  removeToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  getToasts() {
    return this.toasts;
  }
}