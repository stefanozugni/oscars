import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { YearDataComponent } from "../year-data/year-data.component";
import { ScrollToTopComponent } from '../scroll-to-top/scroll-to-top.component';
import { AnalyticsService } from '../../../services/analytics.service';
import { DataService } from '../../../services/data.service';
import { Nomination } from '../../../models/nomination.model';
import { ArchiveMode } from '../../../models/archive-mode.model';
import { StatsComponent } from '../stats/stats.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, YearDataComponent, ScrollToTopComponent, StatsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('yearsContainer') yearsContainer!: ElementRef;
  archiveMode: ArchiveMode = 'oscars';
  years: (number | string)[] = [];
  selectedYear!: string | number;
  startYearCeremony = 1929;
  endYearCeremony = new Date().getFullYear();

  decades: string[] = [];
  selectedDecade: string = '';

  isLetterboxd: boolean = true; //a false per imdb di default

  isDarkMode: boolean = false;

  searchQuery: string = '';
  searchResults: Nomination[] = [];
  allNominations: Nomination[] = [];
  isSearchDataLoaded: boolean = false;
  isLoadingSearchData: boolean = false;
  showStats: boolean = false;
  private searchDebounce?: ReturnType<typeof setTimeout>;
  private lastLoggedSearchQuery: string = '';

  constructor(
    private analytics: AnalyticsService,
    private dataService: DataService
  ) {
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
    this.updateSelectedDecadeFromYear(year);
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

  loadSearchDataIfNeeded(): void {
    if (this.isSearchDataLoaded || this.isLoadingSearchData) {
      return;
    }

    this.isLoadingSearchData = true;
    this.dataService.getAllDataByYears(this.years).subscribe({
      next: nominations => {
        this.allNominations = nominations;
        this.isSearchDataLoaded = true;
        this.isLoadingSearchData = false;
        this.performSearch();
      },
      error: () => {
        this.allNominations = [];
        this.isSearchDataLoaded = true;
        this.isLoadingSearchData = false;
      }
    });
  }

  onSearchFocus(): void {
    this.loadSearchDataIfNeeded();
  }

  onSearchInput(): void {
    this.loadSearchDataIfNeeded();

    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }

    this.searchDebounce = setTimeout(() => {
      this.performSearch();
    }, 275);
  }

  performSearch(): void {
    const query = this.normalizeSearchValue(this.searchQuery).toLowerCase();

    if (query.length < 2 || !this.isSearchDataLoaded) {
      this.searchResults = [];
      return;
    }

    const seen = new Set<string>();
    const results: Nomination[] = [];

    for (const nomination of this.allNominations) {
      if (!this.nominationMatchesQuery(nomination, query)) {
        continue;
      }

      const duplicateKey = [
        nomination.Year,
        nomination.CanonicalCategory,
        nomination.Category,
        nomination.Film,
        nomination.Name,
        nomination.Nominees,
        nomination.Winner
      ].map(value => this.normalizeSearchValue(value)).join('|').toLowerCase();

      if (seen.has(duplicateKey)) {
        continue;
      }

      seen.add(duplicateKey);
      results.push(nomination);

      if (results.length === 8) {
        break;
      }
    }

    this.searchResults = results;
    this.logSearchUsed(query);
  }

  selectSearchResult(result: Nomination): void {
    const resultYear = this.getSelectableYear(result.Year);
    this.analytics.logEvent('search_result_click', {
      query: this.searchQuery,
      year: result.Year,
      category: result.CanonicalCategory,
      film: result.Film,
      name: result.Name || result.Nominees
    });

    this.selectYear(resultYear);
    this.searchQuery = '';
    this.searchResults = [];

    setTimeout(() => {
      const dataSection = document.querySelector('app-year-data');
      dataSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  toggleStats(): void {
    this.showStats = !this.showStats;

    if (this.showStats) {
      this.analytics.logEvent('stats_opened');
      this.loadSearchDataIfNeeded();
    }
  }

  getResultTitle(result: Nomination): string {
    const query = this.normalizeSearchValue(this.searchQuery).toLowerCase();

    if (query && this.normalizeSearchValue(result.Film).toLowerCase().includes(query)) {
      return this.normalizeSearchValue(result.Film);
    }

    if (query && this.normalizeSearchValue(result.Nominees).toLowerCase().includes(query)) {
      return this.normalizeSearchValue(result.Nominees);
    }

    if (query && this.normalizeSearchValue(result.Name).toLowerCase().includes(query)) {
      return this.normalizeSearchValue(result.Name);
    }

    return this.normalizeSearchValue(result.Film) ||
      this.normalizeSearchValue(result.Nominees) ||
      this.normalizeSearchValue(result.Name) ||
      'N/A';
  }

  getResultMeta(result: Nomination): string {
    const status = String(result.Winner ?? '').trim() ? 'Winner' : 'Nomination';
    return `${result.Year} · ${result.CanonicalCategory || result.Category} · ${status}`;
  }

  updateSelectedDecadeFromYear(year: string | number): void {
    const parsedYear = typeof year === 'number'
      ? year
      : parseInt(year.toString().split('-')[0], 10);

    if (!isNaN(parsedYear)) {
      this.selectedDecade = `${Math.floor(parsedYear / 10) * 10}s`;
    }
  }

  private nominationMatchesQuery(nomination: Nomination, query: string): boolean {
    return [
      nomination.Film,
      nomination.Nominees,
      nomination.Name,
      nomination.CanonicalCategory,
      nomination.Category,
      nomination.Year
    ].some(value => this.normalizeSearchValue(value).toLowerCase().includes(query));
  }

  private getSelectableYear(year: string | number): string | number {
    if (this.years.includes(year)) {
      return year;
    }

    const numericYear = typeof year === 'number' ? year : Number(year);
    if (!isNaN(numericYear) && this.years.includes(numericYear)) {
      return numericYear;
    }

    return year;
  }

  private normalizeSearchValue(value: string | number | boolean): string {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  private logSearchUsed(query: string): void {
    if (query.length < 3 || query === this.lastLoggedSearchQuery) {
      return;
    }

    this.lastLoggedSearchQuery = query;
    this.analytics.logEvent('search_used', {
      query: this.searchQuery.slice(0, 80)
    });
  }
}
