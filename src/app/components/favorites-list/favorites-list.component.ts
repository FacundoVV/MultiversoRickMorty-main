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
  editingNotesId: number | null = null;
  updatedNotes: string = '';

  constructor(public favoritesService: FavoritesService) {}

  startEditing(favorite: any): void {
    this.editingNotesId = favorite.id;
    this.updatedNotes = favorite.notes || '';
  }

  saveNotes(favorite: any): void {
    if (this.updatedNotes.trim()) {
      this.favoritesService.updateFavoriteNotes(favorite.id, this.updatedNotes);
    }
    this.editingNotesId = null;
  }

  cancelEditing(): void {
    this.editingNotesId = null;
  }
}