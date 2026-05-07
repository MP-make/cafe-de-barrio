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
      console.log('Enviando credenciales al backend...'); // Para la consola
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          console.log('¡Respuesta recibida del backend!', response);
          this.authService.setToken(response.token);
          this.isSubmitting = false; // Apagamos el circulito
          
          const userRole = this.authService.getRole();

          if (this.activeMainTab === 'ADMIN') {
            if (userRole === 'ADMIN') {
              this.router.navigate(['/admin/productos']);
            } else {
              this.authService.logout(); 
              this.errorMessage = 'Acceso denegado. Esta cuenta no tiene permisos de Administrador.';
            }
          } else {
            this.router.navigate(['/catalogo']);
          }
        },
        error: (err) => {
          console.error('💥 Error detectado en el Login:', err);
          this.isSubmitting = false; // APAGAMOS EL CIRCULITO PASE LO QUE PASE
          
          // Mensajes de error inteligentes:
          if (err.status === 0) {
            this.errorMessage = 'El servidor está despertando o hay un error de conexión. Espera 40 seg y vuelve a intentar.';
          } else if (err.status === 401 || err.status === 403) {
            this.errorMessage = 'Usuario o contraseña incorrectos.';
          } else {
            this.errorMessage = 'Error del servidor (Código ' + err.status + '). Revisa la consola.';
          }
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