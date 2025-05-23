// src/app/home/home.component.ts
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, HostBinding } from '@angular/core'; // Aggiungi HostBinding
import { FormsModule } from '@angular/forms';
import { YearDataComponent } from "../year-data/year-data.component";
import { ScrollToTopComponent } from '../scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, YearDataComponent, ScrollToTopComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'] // Assicurati che sia styleUrls e non styleUrl
})
export class HomeComponent implements OnInit {
  @ViewChild('yearsContainer') yearsContainer!: ElementRef;
  years: (number | string)[] = [];
  selectedYear!: string | number;
  startYearCeremony = 1929;
  endYearCeremony = new Date().getFullYear();

  isImdb: boolean = false;

  @HostBinding('class.dark-theme') isDarkMode: boolean = false; // Applica la classe 'dark-theme' all'host element

  constructor() {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    }
  }

  ngOnInit() {
    for (let y = this.endYearCeremony; y >= this.startYearCeremony; y--) {
      if (y >= 1934) {
        this.years.push(y);
      }
    }

    const specialCeremonyYears = [
      "1932-33", "1931-32", "1930-31", "1929-30", "1928-29", "1927-28"
    ];

    this.years = [...this.years.filter(y => typeof y === 'number'), ...specialCeremonyYears];
    this.years.sort((a, b) => {
      if (typeof a === 'string' && typeof b === 'number') return 1;
      if (typeof a === 'number' && typeof b === 'string') return -1;
      if (typeof a === 'string' && typeof b === 'string') {
        return 0;
      }
      return (b as number) - (a as number);
    });

    this.selectedYear = this.endYearCeremony;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  selectYear(year: string | number) {
    this.selectedYear = year;
  }

  scrollLeft() {
    this.yearsContainer.nativeElement.scrollBy({
      left: -200,
      behavior: 'smooth'
    });
  }

  scrollRight() {
    this.yearsContainer.nativeElement.scrollBy({
      left: 200,
      behavior: 'smooth'
    });
  }
}