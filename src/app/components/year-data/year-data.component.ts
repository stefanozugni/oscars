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
    return nominations.reduce((acc: GroupedNominations, nomination) => {
      if (!acc[nomination.category]) {
        acc[nomination.category] = [];
      }
      acc[nomination.category].push(nomination);
      return acc;
    }, {});
  }

  getCategories(): string[] {
    return Object.keys(this.groupedNominations);
  }
}
