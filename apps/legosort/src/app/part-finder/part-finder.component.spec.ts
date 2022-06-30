import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartFinderComponent } from './part-finder.component';

describe('PartFinderComponent', () => {
  let component: PartFinderComponent;
  let fixture: ComponentFixture<PartFinderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartFinderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
