import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, CameraPhoto } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences'; // Cambiar a @capacitor/preferences
import { Foto } from '../models/foto.interface'; // Asegúrate de que la interfaz esté correctamente importada

@Injectable({
  providedIn: 'root'
})
export class FotosService {
  // Arreglo de fotos
  public fotos: Foto[] = [];

  // Declarar PHOTO_STORAGE como una constante o propiedad de la clase
  private PHOTO_STORAGE: string = 'photos'; // Puedes cambiar el nombre de la clave según tus necesidades

  constructor() { }

  public async addNewToGallery() {
    // Proceso para tomar una foto
    const fotoCapturada = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const savedImageFile = await this.savePicture(fotoCapturada);
    this.fotos.unshift(savedImageFile);

    // Guardar el arreglo actualizado de fotos en el almacenamiento
    await Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.fotos),
    });
  }

  private async savePicture(cameraPhoto: CameraPhoto): Promise<Foto> {
    // Convertir la imagen a base64 para guardarla
    const base64Data = await this.readAsBase64(cameraPhoto);

    // Escribir la foto en el directorio
    const fileName = 'Foto_app_' + new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    return {
      filepath: fileName,
      webviewPath: cameraPhoto.webPath,
    };
  }

  private async readAsBase64(cameraPhoto: CameraPhoto): Promise<string> {
    // Convertir blob a base64
    const response = await fetch(cameraPhoto.webPath!);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64 = (blob: Blob): Promise<string | ArrayBuffer> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });

  public async loadSave() {
    try {
      // Recuperar las fotos del almacenamiento
      const listaFotos = await Preferences.get({ key: this.PHOTO_STORAGE });

      // Si listaFotos.value es null, se asigna un array vacío
      this.fotos = JSON.parse(listaFotos.value || '[]');

      // Leer los archivos y actualizar webviewPath para cada foto
      for (let foto of this.fotos) {
        // Leer el archivo desde el sistema de archivos
        const readFile = await Filesystem.readFile({
          path: foto.filepath,
          directory: Directory.Data,
        });

        // Solo para web: carga la imagen en base64
        foto.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }

    } catch (error) {
      console.error('Error al cargar las fotos guardadas:', error);
      // Manejar el error adecuadamente
      this.fotos = [];
    }
  }
}
