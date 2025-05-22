// scroll-to-top.component.ts
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss']
})
export class ScrollToTopComponent implements AfterViewInit {
  scrollPercent = 0;
  private ticking = false;
  private btnElement!: HTMLElement;
  private progressElement!: SVGCircleElement;

  constructor(private elRef: ElementRef) { }

  ngAfterViewInit(): void {
    this.btnElement = this.elRef.nativeElement.querySelector('.scroll-to-top');
    this.progressElement = this.elRef.nativeElement.querySelector('.progress-ring__circle');
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.updateScroll();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  private updateScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    this.scrollPercent = Math.round((scrollTop / docHeight) * 100);

    if (this.btnElement) {
      this.btnElement.classList.toggle('show', scrollTop > 100);
    }

    if (this.progressElement) {
      const radius = this.progressElement.r.baseVal.value;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (this.scrollPercent / 100) * circumference;
      this.progressElement.style.strokeDashoffset = offset.toString();
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
