import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  template: `
    <button (click)="toggleTheme()" class="theme-toggle">
      <i-moon *ngIf="isDarkMode; else sunIcon"></i-moon>
      <ng-template #sunIcon>
        <i-sun></i-sun>
      </ng-template>
    </button>
  `
})
export class HeaderComponent implements OnInit {
  isDarkMode = false;

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
      this.isDarkMode = true;
      document.body.classList.add('dark-theme');
    }
  }
}
