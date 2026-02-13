import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('App', () => {
  // Configuración previa a cada prueba
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Declaramos el componente que vamos a testear
      declarations: [AppComponent],
      // Proveedor para detectar cambios sin depender de Zone.js (mejor rendimiento)
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  // Primera prueba: Verifica que el componente se instancie correctamente
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // Segunda prueba: Verifica que el HTML renderice el título esperado
  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); // Dispara la detección de cambios para pintar el HTML
    const compiled = fixture.nativeElement as HTMLElement;
    // Comprueba que el texto del h1 coincida con el nombre del proyecto
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, Rick-and-morty');
  });
});