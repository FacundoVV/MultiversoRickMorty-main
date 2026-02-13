import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component'; 

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Al ser un componente Standalone, lo incluimos directamente en 'imports'
      imports: [RegisterComponent] 
    })
    .compileComponents();

    // Creamos la instancia del componente para realizar las pruebas
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Ejecutamos la detección de cambios inicial de Angular
  });

  // Prueba unitaria: Verifica que el componente se instancie correctamente en el entorno de pruebas
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});