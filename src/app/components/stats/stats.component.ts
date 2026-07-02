import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { Nomination } from '../../../models/nomination.model';

interface StatItem {
  id: string;
  name: string;
  count: number;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnChanges {
  @Input() nominations: Nomination[] = [];

  filmNominations: StatItem[] = [];
  filmWins: StatItem[] = [];
  peopleNominations: StatItem[] = [];
  peopleWins: StatItem[] = [];

  ngOnChanges(): void {
    this.filmNominations = this.getTopFilmNominations();
    this.filmWins = this.getTopFilmWins();
    this.peopleNominations = this.getTopPeopleNominations();
    this.peopleWins = this.getTopPeopleWins();
  }

  get hasStats(): boolean {
    return this.filmNominations.length > 0 ||
      this.filmWins.length > 0 ||
      this.peopleNominations.length > 0 ||
      this.peopleWins.length > 0;
  }

  getTopFilmNominations(): StatItem[] {
    const stats = new Map<string, StatItem>();

    this.nominations.forEach(nomination => {
      this.incrementStat(
        stats,
        this.normalizeValue(nomination.FilmId),
        this.normalizeValue(nomination.Film)
      );
    });

    return this.mapToTopList(stats);
  }

  getTopFilmWins(): StatItem[] {
    const stats = new Map<string, StatItem>();

    this.nominations
      .filter(nomination => this.isWinner(nomination))
      .forEach(nomination => {
        this.incrementStat(
          stats,
          this.normalizeValue(nomination.FilmId),
          this.normalizeValue(nomination.Film)
        );
      });

    return this.mapToTopList(stats);
  }

  getTopPeopleNominations(): StatItem[] {
    const stats = new Map<string, StatItem>();

    this.nominations.forEach(nomination => {
      this.getPeopleFromNomination(nomination).forEach(person => {
        this.incrementStat(stats, person.id, person.name);
      });
    });

    return this.mapToTopList(stats);
  }

  getTopPeopleWins(): StatItem[] {
    const stats = new Map<string, StatItem>();

    this.nominations
      .filter(nomination => this.isWinner(nomination))
      .forEach(nomination => {
        this.getPeopleFromNomination(nomination).forEach(person => {
          this.incrementStat(stats, person.id, person.name);
        });
      });

    return this.mapToTopList(stats);
  }

  private normalizeValue(value: string): string {
    return String(value ?? '').trim().replace(/\s+/g, ' ');
  }

  private splitValues(value: string): string[] {
    const normalized = value || '';

    if (normalized.includes('|')) {
      return normalized
        .split('|')
        .map(item => this.normalizeValue(item))
        .filter(Boolean);
    }

    return normalized
      .split(',')
      .map(item => this.normalizeValue(item))
      .filter(Boolean);
  }

  private getPeopleFromNomination(nomination: Nomination): { id: string; name: string }[] {
    const ids = this.splitValues(nomination.NomineeIds);
    const names = this.splitValues(nomination.Nominees);

    if (ids.length === 0) {
      return [];
    }

    return ids
      .map((id, index) => ({
        id,
        name: names[index] || id
      }))
      .filter(person => person.id);
  }

  private incrementStat(map: Map<string, StatItem>, id: string, name: string): void {
    if (!id) {
      return;
    }

    const existing = map.get(id);

    if (existing) {
      existing.count += 1;
    } else {
      map.set(id, {
        id,
        name: name || id,
        count: 1
      });
    }
  }

  private mapToTopList(map: Map<string, StatItem>): StatItem[] {
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 10);
  }

  private isWinner(nomination: Nomination): boolean {
    return String(nomination.Winner ?? '').trim().length > 0;
  }
}
