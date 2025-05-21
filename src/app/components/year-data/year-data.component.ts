// src/app/year-data.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { Nomination } from '../../../models/nomination.model';

interface GroupedNominations {
  [category: string]: Nomination[];
}

@Component({
  selector: 'app-year-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './year-data.component.html',
  styleUrl: './year-data.component.scss'
})
export class YearDataComponent implements OnChanges {
  @Input() year!: number | string;
  @Input() isImdb: boolean = false;

  groupedNominations: GroupedNominations = {};

  constructor(private dataService: DataService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['year'] && this.year) {
      this.loadDataForYear();
    }
  }

  loadDataForYear(): void {
    let yearToFetch: number | string;
    if (typeof this.year === 'number') {

      yearToFetch = this.year - 1;
    } else {

      switch (this.year) {
        case "1927-28":
          yearToFetch = 1927;
          break;
        case "1928-29":
          yearToFetch = 1928;
          break;
        case "1929-30":
          yearToFetch = 1929;
          break;
        case "1930-31":
          yearToFetch = 1930;
          break;
        case "1931-32":
          yearToFetch = 1931;
          break;
        case "1932-33":
          yearToFetch = 1932;
          break;
        default:
          console.warn(`Anno cerimonia speciale non riconosciuto: ${this.year}. Proverò a passarlo direttamente.`);
          yearToFetch = this.year; // Fallback, potrebbe non funzionare
      }
    }

    this.dataService.getDataByYear(yearToFetch).subscribe({ // Passa l'anno corretto al servizio
      next: (data: Nomination[]) => {
        this.groupedNominations = this.groupByCategory(data);
      },
      error: err => {
        console.error(`Errore nel caricamento dei dati per l'anno di eleggibilità ${yearToFetch}:`, err);
        this.groupedNominations = {};
      }
    });
  }

  private groupByCategory(nominations: Nomination[]): GroupedNominations {
    return nominations.reduce((acc: GroupedNominations, nomination) => {
      const category = nomination.CanonicalCategory || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(nomination);
      return acc;
    }, {});
  }

  getCategories(): string[] {
    return Object.keys(this.groupedNominations);
  }

  getNomineesWithLinks(nomination: any): { name: string, imdbId?: string }[] {
    const names: string[] = nomination.Nominees?.split(',').map((n: string) => n.trim()) || [];
    const ids: string[] = nomination.NomineeIds?.split(',').map((id: string) => id.trim()) || [];

    return names.map((name: string, index: number) => ({
      name,
      imdbId: ids[index] || undefined
    }));
  }
}