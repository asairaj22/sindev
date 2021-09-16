import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubHeaderMenuComponent } from './sub-header-menu.component';

describe('SubHeaderMenuComponent', () => {
  let component: SubHeaderMenuComponent;
  let fixture: ComponentFixture<SubHeaderMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubHeaderMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubHeaderMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
