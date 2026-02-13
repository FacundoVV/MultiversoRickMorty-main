import { TestBed } from '@angular/core/testing';

// Importamos el servicio que queremos poner a prueba
import { FavoritesService } from './favorites.service'; 

/**
 * 'describe' define una "Suite de Pruebas". 
 * Es un contenedor que agrupa todas las pruebas relacionadas con el FavoritesService.
 */
describe('FavoritesService', () => {
  // Declaramos una variable para guardar la instancia del servicio
  let service: FavoritesService;

  /**
   * 'beforeEach' se ejecuta antes de cada prueba individual.
   * Sirve para reiniciar el estado y que una prueba no afecte a la siguiente.
   */
  beforeEach(() => {
    // TestBed es un "entorno de laboratorio" que simula un módulo de Angular
    TestBed.configureTestingModule({
      // Aquí irían los mocks o servicios de los que depende FavoritesService
    });
  
    // Inyectamos el servicio dentro de nuestro entorno de pruebas
    service = TestBed.inject(FavoritesService); 
  });

  /**
   * Esta es la prueba más básica: "Debería ser creado".
   * Verifica que Angular sea capaz de instanciar el servicio sin errores.
   */
  it('should be created', () => {
    // 'expect' es la afirmación: esperamos que la variable 'service' sea verdadera (exista)
    expect(service).toBeTruthy();
  });
});