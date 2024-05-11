import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) { }

  login() {
    if (this.email && this.password) {
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Form is empty.';
    }
  }

  navigate(to: string) {
    this.router.navigateByUrl(to);
  }

}
