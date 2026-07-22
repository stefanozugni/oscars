// src/app/year-data.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { Nomination } from '../../../models/nomination.model';

interface GroupedNominations {
  [category: string]: Nomination[];
}

interface YearFilmStat {
  filmId: string;
  film: string;
  wins: number;
  categories: string[];
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
  @Input() isLetterboxd: boolean = false;

  nominations: Nomination[] = [];
  groupedNominations: GroupedNominations = {};
  showYearStats = false;

  private categoryOrder: string[] = [
    "BEST PICTURE",
    "ACTOR IN A LEADING ROLE",
    "ACTRESS IN A LEADING ROLE",
    "ACTOR IN A SUPPORTING ROLE",
    "ACTRESS IN A SUPPORTING ROLE",
    "DIRECTING",
    "WRITING (ORIGINAL SCREENPLAY)",
    "WRITING / ORIGINAL SCREENPLAY",
    "ORIGINAL SCREENPLAY",
    "WRITING (ADAPTED SCREENPLAY)",
    "WRITING / ADAPTED SCREENPLAY",
    "ADAPTED SCREENPLAY",
    "INTERNATIONAL FEATURE FILM",
    "ANIMATED FEATURE FILM",
    "DOCUMENTARY FEATURE FILM",
    "CINEMATOGRAPHY",
    "FILM EDITING",
    "SOUND",
    "VISUAL EFFECTS",
    "MUSIC (ORIGINAL SCORE)",
    "MUSIC / ORIGINAL SCORE",
    "ORIGINAL SCORE",
    "MUSIC (ORIGINAL SONG)",
    "MUSIC / ORIGINAL SONG",
    "ORIGINAL SONG",
    "PRODUCTION DESIGN",
    "COSTUME DESIGN",
    "MAKEUP AND HAIRSTYLING",
    "SHORT FILM (ANIMATED)",
    "SHORT FILM (LIVE ACTION)",
    "DOCUMENTARY SHORT FILM"
  ];

  // Definisci le categorie speciali qui
  private specialCategories: string[] = [
    "SCIENTIFIC AND TECHNICAL AWARD (Technical Achievement Award)",
    "SCIENTIFIC AND TECHNICAL AWARD (Scientific and Engineering Award)",
    "IRVING G. THALBERG MEMORIAL AWARD",
    "HONORARY AWARD",
    "JEAN HERSHOLT HUMANITARIAN AWARD",
    "GORDON E. SAWYER AWARD",
    "AWARD OF COMMENDATION",
    "JOHN A. BONNER MEDAL OF COMMENDATION",
    "SPECIAL AWARD",
    "SCIENTIFIC AND TECHNICAL AWARD (Academy Award of Merit)",
    "SCIENTIFIC AND TECHNICAL AWARD (Special Award)",
    "MEDAL OF COMMENDATION",
    "SCIENTIFIC OR TECHNICAL AWARD (Class III)",
    "SCIENTIFIC OR TECHNICAL AWARD (Class II)",
    "SCIENTIFIC OR TECHNICAL AWARD (Class I)"
  ];

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
      yearToFetch = this.year;
    }

    this.dataService.getDataByYear(yearToFetch).subscribe({
      next: (data: Nomination[]) => {
        this.nominations = data;
        this.groupedNominations = this.groupByCategory(data);
      },
      error: err => {
        console.error(`Errore nel caricamento dei dati per l'anno di eleggibilità ${yearToFetch}:`, err);
        this.nominations = [];
        this.groupedNominations = {};
      }
    });
  }

  toggleYearStats(): void {
    this.showYearStats = !this.showYearStats;
  }

  getTopAwardedFilmsForYear(): YearFilmStat[] {
    const filmsById = new Map<string, YearFilmStat>();

    for (const nomination of this.nominations) {
      const filmId = nomination.FilmId?.trim();
      const film = nomination.Film?.trim();

      if (!filmId || !film || !nomination.Winner || !String(nomination.Winner).trim()) {
        continue;
      }

      const existingStat = filmsById.get(filmId);

      if (existingStat) {
        existingStat.wins += 1;

        const category = nomination.CanonicalCategory?.trim();
        if (category && !existingStat.categories.includes(category)) {
          existingStat.categories.push(category);
        }
      } else {
        const category = nomination.CanonicalCategory?.trim();
        filmsById.set(filmId, {
          filmId,
          film,
          wins: 1,
          categories: category ? [category] : []
        });
      }
    }

    const awardedFilms = Array.from(filmsById.values())
      .filter(stat => stat.wins >= 2)
      .sort((a, b) => b.wins - a.wins || a.film.localeCompare(b.film));

    if (awardedFilms.length <= 5) {
      return awardedFilms;
    }

    const cutoffWins = awardedFilms[4].wins;
    return awardedFilms.filter(stat => stat.wins >= cutoffWins);
  }

  private groupByCategory(nominations: Nomination[]): GroupedNominations {
    return nominations.reduce((acc: GroupedNominations, nomination) => {
      // Usa CanonicalCategory o Category, a seconda di quale contiene i nomi esatti
      // delle categorie speciali. Dal tuo JSON, sembra essere CanonicalCategory.
      const category = nomination.CanonicalCategory || nomination.Category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(nomination);
      return acc;
    }, {});
  }

  getCategories(): string[] {
    return Object.keys(this.groupedNominations).sort((a, b) => {
      const indexA = this.categoryOrder.indexOf(a.toUpperCase());
      const indexB = this.categoryOrder.indexOf(b.toUpperCase());

      if (indexA === -1 && indexB === -1) {
        return a.localeCompare(b);
      }

      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });
  }

  // Nuova funzione per controllare se una categoria è speciale
  isSpecialCategory(categoryName: string): boolean {
    return this.specialCategories.includes(categoryName);
  }

  isWinner(nomination: Nomination): boolean {
    return !!nomination.Winner && String(nomination.Winner).trim().length > 0;
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
