import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SimulationService } from '../../services/simulation.service';
import {
  SimulationCreate,
  SimulationRead,
  SimulationUpdate,
} from '../../interfaces/simulation';

@Component({
  selector: 'app-simulation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: `simulation-form.component.html`,
  styles: [`
    .form-label {
      font-weight: 500;
    }

    .form-check-input {
      cursor: pointer;
    }

    button i {
      vertical-align: middle;
    }
  `]
})
export class SimulationFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  private simulationId: number | null = null;
  private readonly simulationService = inject(SimulationService);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = idParam !== 'new';
      if (this.isEdit) {
        this.simulationId = Number(idParam);
        this.simulationService
          .readSimulation(this.simulationId)
          .subscribe((data) => this.patchForm(data));
      }
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      num_runs: [180, [Validators.required, Validators.min(1)]],
      run_len: [1, [Validators.required, Validators.min(1)]],
      actor: this.fb.group({
        attached_to: ['world', Validators.required],
        spacing0: [1, Validators.required],
        spacing1: [1, Validators.required],
        size0: [256, Validators.required],
        size1: [256, Validators.required],
        origin_as_image_center: [true],
      }),
    });
  }

  private patchForm(sim: SimulationRead): void {
    this.form.patchValue({
      name: sim.name,
      num_runs: sim.num_runs,
      run_len: sim.run_len,
      actor: {
        attached_to: sim.actor.attached_to,
        spacing0: sim.actor.spacing[0],
        spacing1: sim.actor.spacing[1],
        size0: sim.actor.size[0],
        size1: sim.actor.size[1],
        origin_as_image_center: sim.actor.origin_as_image_center,
      },
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const actorGroup = this.form.get('actor')!;
    const payloadBase = {
      name: this.form.value.name,
      num_runs: this.form.value.num_runs,
      run_len: this.form.value.run_len,
      actor: {
        attached_to: actorGroup.value.attached_to,
        spacing: [actorGroup.value.spacing0, actorGroup.value.spacing1] as [
          number,
          number,
        ],
        size: [actorGroup.value.size0, actorGroup.value.size1] as [
          number,
          number,
        ],
        origin_as_image_center: actorGroup.value.origin_as_image_center,
      },
    } as SimulationCreate;

    if (this.isEdit && this.simulationId != null) {
      this.simulationService
        .updateSimulation(this.simulationId, payloadBase as SimulationUpdate)
        .subscribe(() => this.router.navigate(['/simulations', this.simulationId]));
    } else {
      this.simulationService
        .createSimulation(payloadBase)
        .subscribe(() => this.router.navigate(['/simulations']));
    }
  }

  cancel(): void {
    this.router.navigate(['/simulations']);
  }
}
