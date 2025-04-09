import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SimulationService } from '../../../services/simulation.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'create.component.html',
  styleUrl: 'create.component.scss'
})
export class CreateComponent {
  private fb = inject(FormBuilder);
  private simulationService = inject(SimulationService);
  private router = inject(Router);

  form: FormGroup = this.fb.nonNullable.group({
    name: ['', Validators.required],
    num_runs: [1, [Validators.required, Validators.min(1)]],
    run_len: [1.0, [Validators.required, Validators.min(0.01)]]
  });  

  submit() {
    if (this.form.invalid) return;

    this.simulationService.create(this.form.value).subscribe({
      next: (created) => this.router.navigate(['read', created.id])
    });
  }

  cancel() {
    this.router.navigate(['']);
  }
}
