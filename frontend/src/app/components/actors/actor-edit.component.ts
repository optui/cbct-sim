import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ActorService } from '../../services/actor.service';
import { ActorUpdate, ActorRead } from '../../interfaces/actor';

@Component({
  standalone: true,
  selector: 'app-actor-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <form *ngIf="form" [formGroup]="form" (ngSubmit)="submit()">
      <label>Name:<input formControlName="name" /></label>
      <!-- TODO: other ActorUpdate fields -->
      <button type="submit" [disabled]="form.invalid">Save</button>
      <button type="button" (click)="cancel()">Cancel</button>
    </form>
  `
})
export class ActorEditComponent implements OnInit {
  form!: FormGroup;
  simulationId!: number;
  name!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private svc: ActorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.paramMap;
    this.simulationId = Number(params.get('id'));
    this.name = params.get('name')!;
    this.svc.get(this.simulationId, this.name)
      .subscribe((actor: ActorRead) => {
        this.form = this.fb.group({
          name: [actor.name, Validators.required],
          // TODO: other controls
        });
      });
  }

  submit(): void {
    if (!this.form.valid) return;
    const payload: ActorUpdate = this.form.value;
    this.svc.update(this.simulationId, this.name, payload)
      .subscribe(() => this.router.navigate(['/simulations', this.simulationId]));
  }

  cancel(): void {
    this.router.navigate(['/simulations', this.simulationId]);
  }
}
