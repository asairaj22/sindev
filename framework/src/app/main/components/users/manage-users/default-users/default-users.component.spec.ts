import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultUsersComponent } from './default-users.component';

describe('DefaultUsersComponent', () => {
  let component: DefaultUsersComponent;
  let fixture: ComponentFixture<DefaultUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
