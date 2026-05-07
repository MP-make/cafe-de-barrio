import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  // Control de Pestañas
  activeMainTab: 'CLIENTE' | 'ADMIN' = 'CLIENTE';
  activeClientTab: 'LOGIN' | 'REGISTER' = 'LOGIN';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  setMainTab(tab: 'CLIENTE' | 'ADMIN') {
    this.activeMainTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
    this.loginForm.reset();
  }

  setClientTab(tab: 'LOGIN' | 'REGISTER') {
    this.activeClientTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
    this.loginForm.reset();
    this.registerForm.reset();
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          // 1. Guardamos el token
          this.authService.setToken(response.token);
          this.isSubmitting = false;
          
          // 2. Extraemos el rol del token (CLIENTE o ADMIN)
          const userRole = this.authService.getRole();

          // 3. Verificamos si está intentando entrar por la puerta correcta
          if (this.activeMainTab === 'ADMIN') {
            
            if (userRole === 'ADMIN') {
              // Es Admin de verdad, lo dejamos pasar
              this.router.navigate(['/admin/productos']);
            } else {
              // Es un Cliente intentando hacerse pasar por Admin
              this.authService.logout(); // Le borramos el token
              this.errorMessage = 'Acceso denegado. Esta cuenta no tiene permisos de Administrador.';
            }

          } else {
            // Está en la pestaña de Cliente
            this.router.navigate(['/catalogo']);
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = 'Credenciales inválidas. Verifica tu usuario y contraseña.';
        }
      });
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const newUser = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        rol: 'CLIENTE' 
      };

      if(typeof (this.authService as any).register === 'function') {
        (this.authService as any).register(newUser).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.successMessage = '¡Cuenta creada con éxito! Ahora puedes iniciar sesión.';
            this.setClientTab('LOGIN'); 
          },
          error: (err: any) => {
            this.isSubmitting = false;
            this.errorMessage = 'Hubo un error. Es posible que el usuario o correo ya existan.';
          }
        });
      }
    }
  }
}