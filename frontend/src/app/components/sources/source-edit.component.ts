import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SourceService } from '../../services/source.service';
import { GenericSourceUpdate, GenericSourceRead } from '../../interfaces/source';

@Component({
  standalone: true,
  selector: 'app-source-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <form *ngIf="form" [formGroup]="form" (ngSubmit)="submit()">
      <label>Name:<input formControlName="name" /></label>
      <!-- TODO: add other GenericSourceUpdate fields here -->
      <button type="submit" [disabled]="form.invalid">Save</button>
      <button type="button" (click)="cancel()">Cancel</button>
    </form>
  `
})
export class SourceEditComponent implements OnInit {
  form!: FormGroup;
  simulationId!: number;
  name!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private svc: SourceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.paramMap;
    this.simulationId = Number(params.get('id'));
    this.name = params.get('name')!;
    this.svc.get(this.simulationId, this.name)
      .subscribe((src: GenericSourceRead) => {
        this.form = this.fb.group({
          name: [src.name, Validators.required],
          // TODO: other controls initialized
        });
      });
  }

  submit(): void {
    if (!this.form.valid) return;
    const payload: GenericSourceUpdate = this.form.value;
    this.svc.update(this.simulationId, this.name, payload)
      .subscribe(() => this.router.navigate(['/simulations', this.simulationId]));
  }

  cancel(): void {
    this.router.navigate(['/simulations', this.simulationId]);
  }
}