import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/api.services';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styles: [`
    .fondo { min-height: 100vh; display: grid; place-items: center; background: linear-gradient(135deg, #eef2ff 0%, #f6f7fb 60%); padding: 1rem; }
    .caja { width: 100%; max-width: 420px; }
    .logo { width: 52px; height: 52px; border-radius: .8rem; background: var(--bs-primary); color: #fff; display: grid; place-items: center; font-size: 1.6rem; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  cargando = signal(false);
  error = signal<string | null>(null);
  verPassword = signal(false);

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    if (this.auth.estaAutenticado()) this.router.navigate(['/dashboard']);
  }

  invalido(campo: 'username' | 'password'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }

  ingresar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.cargando.set(true);
    this.error.set(null);
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e: HttpErrorResponse) => { this.error.set(mensajeError(e)); this.cargando.set(false); }
    });
  }
}
