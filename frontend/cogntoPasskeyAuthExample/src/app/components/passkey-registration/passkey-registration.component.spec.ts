import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasskeyRegistrationComponent } from './passkey-registration.component';

describe('PasskeyRegistrationComponent', () => {
  let component: PasskeyRegistrationComponent;
  let fixture: ComponentFixture<PasskeyRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasskeyRegistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasskeyRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
