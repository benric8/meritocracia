import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SafeResourceUrl } from '@angular/platform-browser';

export interface VistaPreviaDocumentoDialogData {
  titulo: string;
}

@Component({
  selector: 'app-vista-previa-documento-dialog',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './vista-previa-documento-dialog.html',
  styleUrl: './vista-previa-documento-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VistaPreviaDocumentoDialog {
  private readonly dialogRef = inject(MatDialogRef<VistaPreviaDocumentoDialog>);
  protected readonly data = inject<VistaPreviaDocumentoDialogData>(MAT_DIALOG_DATA);

  protected readonly cargando = signal(true);
  protected readonly url = signal<SafeResourceUrl | null>(null);

  mostrarDocumento(urlSegura: SafeResourceUrl): void {
    this.url.set(urlSegura);
    this.cargando.set(false);
  }

  protected cerrar(): void {
    this.dialogRef.close();
  }
}
