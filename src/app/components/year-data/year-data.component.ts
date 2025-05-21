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
  this.dataService.getDataByYear(this.year).subscribe({
    next: (data: Nomination[]) => {
      this.groupedNominations = this.groupByCategory(data);
    },
    error: err => {
      console.error(`Errore nel caricamento dei dati per l'anno ${this.year}:`, err);
      this.groupedNominations = {};
    }
  });
}

  private groupByCategory(nominations: Nomination[]): GroupedNominations {
  const grouped: GroupedNominations = {};

  for (const n of nominations) {
    const category = n.CanonicalCategory;
    if (!grouped[category]) grouped[category] = [];

    grouped[category].push({
      category: n.CanonicalCategory,
      year: n.Year,
      nominees: n.Nominees ? n.Nominees.split(',').map(s => s.trim()) : [],
      movies: n.Film ? [{ title: n.Film, imdb_id: n.FilmId }] : [],
      won: !!n.Winner || n.Winner === '1' || n.Winner === '*'
    });
  }

  return grouped;
}


  getCategories(): string[] {
    return Object.keys(this.groupedNominations);
  }
}
