import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
  templateUrl: './dialog-update.component.html',
  styleUrl: './dialog-update.component.scss'
})
export class DialogUpdateComponent {

  constructor(private dialogRef: MatDialogRef<DialogUpdateComponent>) {

  }

  onNoClick() {
    this.dialogRef.close();
  }

}
