import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileComponent } from './profile.component'; 

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Al ser un componente Standalone, lo incluimos en 'imports'
      imports: [ProfileComponent] 
    })
    .compileComponents();

    // Creamos la instancia del componente para la prueba
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Forzamos la detección de cambios inicial
  });

  // Prueba básica: Verifica que el componente se cree correctamente en memoria
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});