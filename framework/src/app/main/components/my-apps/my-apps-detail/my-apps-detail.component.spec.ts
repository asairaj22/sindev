import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAppsDetailComponent } from './my-apps-detail.component';

describe('MyAppsDetailComponent', () => {
  let component: MyAppsDetailComponent;
  let fixture: ComponentFixture<MyAppsDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyAppsDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyAppsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
