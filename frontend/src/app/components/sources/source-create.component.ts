import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SourceService } from '../../services/source.service';
import { GenericSourceCreate } from '../../interfaces/source';

@Component({
  standalone: true,
  selector: 'app-source-create',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label>Name:<input formControlName="name" /></label>
      <!-- TODO: add other GenericSourceCreate fields here -->
      <button type="submit" [disabled]="form.invalid">Create</button>
      <button type="button" (click)="cancel()">Cancel</button>
    </form>
  `
})
export class SourceCreateComponent implements OnInit {
  form!: FormGroup;
  simulationId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private svc: SourceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.simulationId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = this.fb.group({
      name: ['', Validators.required],
      // TODO: other controls
    });
  }

  submit(): void {
    if (!this.form.valid) return;
    const payload: GenericSourceCreate = this.form.value;
    this.svc.create(this.simulationId, payload)
      .subscribe(() => this.router.navigate(['/simulations', this.simulationId]));
  }

  cancel(): void {
    this.router.navigate(['/simulations', this.simulationId]);
  }
}