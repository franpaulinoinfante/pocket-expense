import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMovimientoPage } from './add-movimiento.page';

describe('AddMovimientoPage', () => {
  let component: AddMovimientoPage;
  let fixture: ComponentFixture<AddMovimientoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMovimientoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
