
// tab1.page.ts
import { Component } from '@angular/core';
import { FotosService } from '../services/fotos.service'; // Ruta correcta al servicio

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  // Inyecta el servicio correctamente en el constructor
  constructor(public fotosService: FotosService) {}

  // Método que llama al servicio
  public addNewToGallery() {
    this.fotosService.addNewToGallery(); // Llamada al método del servicio
  }
  async ngOnInit(){
    await this.fotosService.loadSave()
  }
}
