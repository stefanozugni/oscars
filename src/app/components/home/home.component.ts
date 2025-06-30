import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { YearDataComponent } from "../year-data/year-data.component";
import { ScrollToTopComponent } from '../scroll-to-top/scroll-to-top.component';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, YearDataComponent, ScrollToTopComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('yearsContainer') yearsContainer!: ElementRef;
  years: (number | string)[] = [];
  selectedYear!: string | number;
  startYearCeremony = 1929;
  endYearCeremony = new Date().getFullYear();

  decades: string[] = [];
  selectedDecade: string = '';

  isLetterboxd: boolean = false;

  isDarkMode: boolean = false;

  constructor(private analytics: AnalyticsService) {
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

    const decadesSet = new Set<number>();
    this.years.forEach(y => {
      if (typeof y === 'number') {
        const decadeStart = Math.floor(y / 10) * 10;
        decadesSet.add(decadeStart);
      }
    });
    this.decades = Array.from(decadesSet).sort((a, b) => b - a).map(d => `${d}s`);

    this.selectedYear = this.endYearCeremony;
    this.selectedDecade = `${Math.floor(this.selectedYear as number / 10) * 10}s`;
  }

  selectDecade(decade: string) {
    this.selectedDecade = decade;
    const decadeStart = parseInt(decade.slice(0, 4));
    const decadeEnd = decadeStart + 9;

    const targetIndex = this.years.findIndex(y => {
      if (typeof y === 'number') {
        return y >= decadeStart && y <= decadeEnd;
      }
      if (typeof y === 'string') {
        const startYear = parseInt(y.split('-')[0]);
        return startYear >= decadeStart && startYear <= decadeEnd;
      }
      return false;
    });

    if (targetIndex !== -1) {
      const targetYear = this.years[targetIndex];
      this.selectYear(targetYear);
    }
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
    if (typeof year === 'number') {
      this.selectedDecade = `${Math.floor(year / 10) * 10}s`;
    }
    this.analytics.logEvent('selected_year', { year });
    this.scrollYearsToSelected(year);
  }

  scrollYearsToSelected(year: string | number) {
    const index = this.years.findIndex(y => y === year);
    if (index !== -1) {
      const button = this.yearsContainer.nativeElement.querySelectorAll('.year-btn')[index] as HTMLElement;
      if (button) {
        button.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
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