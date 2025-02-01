import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { YearDataComponent } from "../year-data/year-data.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, YearDataComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  @ViewChild('yearsContainer') yearsContainer!: ElementRef;

  years: number[] = [];
  selectedYear!: number;

  startYear = 2000;
  endYear = new Date().getFullYear();

  ngOnInit() {
    for (let y = this.endYear - 2; y >= this.startYear; y--) {
      this.years.push(y);
    }
    this.selectedYear = this.endYear - 2;
  }

  selectYear(year: number) {
    this.selectedYear = year;
    console.log('Selected year:', year);
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
