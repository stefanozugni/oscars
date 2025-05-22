// scroll-to-top.component.ts
import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss']
})
export class ScrollToTopComponent {
  scrollPercent = 0;

  get conicGradient() {
    return `conic-gradient(#00e054 ${this.scrollPercent}%, #e6e6e6 ${this.scrollPercent}%)`;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    this.scrollPercent = Math.round((scrollTop / docHeight) * 100);
    const btn = document.querySelector('.scroll-to-top') as HTMLElement;
    if (btn) {
      btn.classList.toggle('show', scrollTop > 100);
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
