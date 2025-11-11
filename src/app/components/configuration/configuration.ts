import { Component, Output, EventEmitter, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';

import { PomodoroService } from '../../services/pomodoro';
import { PomodoroConfig, DEFAULT_CONFIG } from '../../models/pomodoro-config.model';
import { SessionStatus } from '../../models/pomodoro-session.model';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatStepperModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './configuration.html',
  styleUrl: './configuration.scss'
})
export class ConfigurationComponent implements OnInit {
  @Output() configurationSaved = new EventEmitter<PomodoroConfig>();
  
  private snackBar = inject(MatSnackBar);
  pomodoroService = inject(PomodoroService);
  
  // Configuración temporal para el stepper
  tempConfig: PomodoroConfig = {
    ...DEFAULT_CONFIG
  };

  // Estados de validación para cada step (solo 3 pasos ahora)
  step1Completed = signal(false);
  step2Completed = signal(false);
  step3Completed = signal(false);

  ngOnInit(): void {
    const current = this.pomodoroService.config();
    this.tempConfig = { ...current };
    this.validateAllSteps();
  }

  validateStep1() {
    const isValid = this.tempConfig.totalGoals >= 1 && this.tempConfig.totalGoals <= 20;
    this.step1Completed.set(isValid);
  }

  validateStep2() {
    const isValid = this.tempConfig.workDuration >= 1 && this.tempConfig.workDuration <= 60;
    this.step2Completed.set(isValid);
  }

  validateStep3() {
    const isValid = 
      this.tempConfig.shortBreakDuration >= 1 && this.tempConfig.shortBreakDuration <= 60 &&
      this.tempConfig.longBreakDuration >= 1 && this.tempConfig.longBreakDuration <= 60;
    this.step3Completed.set(isValid);
  }

  private validateAllSteps() {
    this.validateStep1();
    this.validateStep2();
    this.validateStep3();
  }

  nextStep(stepper: MatStepper) {
    stepper.next();
  }

  saveConfiguration() {
    // Validar toda la configuración antes de guardar
    if (this.step1Completed() && this.step2Completed() && this.step3Completed()) {
      this.pomodoroService.updateConfig(this.tempConfig);
      this.configurationSaved.emit(this.tempConfig);
      
      // Mostrar toast de confirmación
      this.snackBar.open(
        '✓ Configuración guardada correctamente', 
        'Cerrar', 
        {
          duration: 3000,
          panelClass: ['success-snackbar']
        }
      );
      
      console.log('Configuración guardada:', this.tempConfig);
    }
  }

  hasActiveSession(): boolean {
    const status = this.pomodoroService.session().status;
    return status !== SessionStatus.IDLE && status !== SessionStatus.COMPLETED;
  }
}
