import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudServicesComponent } from './cloud-services.component';

describe('CloudServicesComponent', () => {
  let component: CloudServicesComponent;
  let fixture: ComponentFixture<CloudServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
