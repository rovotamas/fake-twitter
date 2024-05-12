import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { User } from '../shared/model/User';
import { UserService } from '../shared/services/user.service';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {DialogComponent} from '../shared/components/dialog/dialog.component';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {SignupComponent} from '../signup/signup.component';
import {SignupAdminComponent} from '../signup-admin/signup-admin.component';
import {DialogUpdateComponent} from '../shared/components/dialog-update-user/dialog-update.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatDialogModule, MatSnackBarModule, SignupComponent, SignupAdminComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  users!: User[];
  columns = ['email', 'name', 'birthDate', 'isActive', 'update', 'delete'];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: (data) => {
        console.log(data);
        this.router.navigateByUrl('/login');
      }, error: (err) => {
        console.log(err);
      }
    })
  }

  updateUser(id: string, n: number) {
    const dialogRef = this.dialog.open(DialogUpdateComponent);

    dialogRef.afterClosed().subscribe({
      next: (data) => {
        if (data) {
          // user deletion
          console.log(data);
          this.userService.updateUserIsActive(id).subscribe({
            next: (data) => {
              console.log(data);
              this.users?.splice(n, 1);
              this.users = [...this.users];
              this.openSnackBar('User updated successfully.', 3000);
            }, error: (err) => {
              console.log(err);
            }
          });
        }
      }, error: (err) => {
        console.log(err);
      }
    })
  }

  deleteUser(id: string, n: number) {
    const dialogRef = this.dialog.open(DialogComponent);

    dialogRef.afterClosed().subscribe({
      next: (data) => {
        if (data) {
          // user deletion
          console.log(data);
          this.userService.delete(id).subscribe({
            next: (data) => {
              console.log(data);
              this.users?.splice(n, 1);
              this.users = [...this.users];
              this.openSnackBar('User deleted successfully.', 3000);
            }, error: (err) => {
              console.log(err);
            }
          });
        }
      }, error: (err) => {
        console.log(err);
      }
    })
  }

  openSnackBar(message: string, duration: number) {
    this.snackBar.open(message, undefined, { duration: duration });
  }
}
