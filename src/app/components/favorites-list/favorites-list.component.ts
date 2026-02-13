// src/app/components/favorites-list/favorites-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FavoritesService } from '../../services/favorites.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './favorites-list.component.html',
  styleUrls: ['./favorites-list.component.css']
})
export class FavoritesListComponent {
  // Variable para saber qué personaje se está editando (almacena su ID)
  editingNotesId: number | null = null;
  
  // Variable temporal para guardar lo que el usuario escribe antes de darle a "Guardar"
  updatedNotes: string = '';

  // Inyectamos el servicio como 'public' para que el HTML pueda acceder directamente a la lista de favoritos
  constructor(public favoritesService: FavoritesService) {}

  /**
   * Activa el modo edición para un personaje específico.
   * @param favorite El objeto del personaje favorito seleccionado.
   */
  startEditing(favorite: any): void {
    // Marcamos el ID para que el HTML sepa qué fila o tarjeta debe mostrar el cuadro de texto
    this.editingNotesId = favorite.id;
    // Cargamos la nota actual en el cuadro de texto para que el usuario pueda verla
    this.updatedNotes = favorite.notes || '';
  }

  /**
   * Guarda los cambios realizados en la nota.
   * @param favorite El objeto del personaje que estamos actualizando.
   */
  saveNotes(favorite: any): void {
    // Si el usuario escribió algo (evitamos guardar espacios vacíos)
    if (this.updatedNotes.trim()) {
      // Llamamos al servicio para que actualice la información de forma permanente
      this.favoritesService.updateFavoriteNotes(favorite.id, this.updatedNotes);
    }
    // Cerramos el modo edición poniendo el ID en null
    this.editingNotesId = null;
  }

  /**
   * Cancela la edición y descarta los cambios no guardados.
   */
  cancelEditing(): void {
    this.editingNotesId = null;
  }
}