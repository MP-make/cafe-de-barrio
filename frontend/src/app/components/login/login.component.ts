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
    // Formulario de Inicio de Sesión
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Formulario de Registro
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  // Cambiar entre Cliente y Admin
  setMainTab(tab: 'CLIENTE' | 'ADMIN') {
    this.activeMainTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
    this.loginForm.reset();
  }

  // Cambiar entre Ingresar y Crear Cuenta
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
          this.authService.setToken(response.token);
          this.isSubmitting = false;
          
          // Redirección inteligente según el rol/pestaña
          if (this.activeMainTab === 'ADMIN') {
            this.router.navigate(['/admin/productos']);
          } else {
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
        password: this.registerForm.value.password,
        rol: 'CLIENTE' // Por defecto, los que se registran aquí son clientes
      };

      // ATENCIÓN: Necesitas tener un método register() en tu AuthService y Backend.
      if(typeof (this.authService as any).register === 'function') {
        (this.authService as any).register(newUser).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.successMessage = '¡Cuenta creada con éxito! Ahora puedes iniciar sesión.';
            this.setClientTab('LOGIN'); // Lo devolvemos al login automáticamente
          },
          error: (err: any) => {
            this.isSubmitting = false;
            this.errorMessage = 'Hubo un error. Es posible que el usuario ya exista.';
          }
        });
      } else {
        this.isSubmitting = false;
        this.errorMessage = '⚠️ Falta conectar el método register() en tu AuthService.';
      }
    }
  }
}