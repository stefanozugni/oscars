import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearDataComponent } from './year-data.component';

describe('YearDataComponent', () => {
  let component: YearDataComponent;
  let fixture: ComponentFixture<YearDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YearDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
