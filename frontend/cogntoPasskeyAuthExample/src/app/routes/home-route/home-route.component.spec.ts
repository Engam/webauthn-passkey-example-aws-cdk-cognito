import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeRouteComponent } from './home-route.component';

describe('HomeRouteComponent', () => {
  let component: HomeRouteComponent;
  let fixture: ComponentFixture<HomeRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeRouteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
