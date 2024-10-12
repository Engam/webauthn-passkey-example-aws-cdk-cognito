import { TestBed } from '@angular/core/testing';

import { PasskeyRegistrationService } from './passkey-registration.service';

describe('PasskeyRegistrationService', () => {
  let service: PasskeyRegistrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasskeyRegistrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
