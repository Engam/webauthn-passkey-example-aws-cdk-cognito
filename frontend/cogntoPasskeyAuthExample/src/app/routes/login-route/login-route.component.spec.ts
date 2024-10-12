import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginRouteComponent } from './login-route.component';

describe('LoginRouteComponent', () => {
  let component: LoginRouteComponent;
  let fixture: ComponentFixture<LoginRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginRouteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
