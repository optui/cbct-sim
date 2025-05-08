import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
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
      <div *ngIf="actorType === 'SimulationStatisticsActor'">
        <label>Output Filename:<input formControlName="output_filename" /></label>
      </div>
      <div *ngIf="actorType === 'DigitizerHitsCollectionActor'">
        <label>Attached To:<input formControlName="attached_to" /></label>
        <label>Attributes (comma-separated):<input formControlName="attributes" /></label>
        <label>Output Filename:<input formControlName="output_filename" /></label>
      </div>
      <div *ngIf="actorType === 'DigitizerProjectionActor'">
        <label>Attached To:<input formControlName="attached_to" /></label>
        <label>Input Digi Collections (comma-separated):<input formControlName="input_digi_collections" /></label>
        <label>Spacing (x,y):<input type="number" formControlName="spacingX" />, <input type="number" formControlName="spacingY" /></label>
        <label>Size (x,y,z):<input type="number" formControlName="sizeX" />, <input type="number" formControlName="sizeY" />, <input type="number" formControlName="sizeZ" /></label>
        <label><input type="checkbox" formControlName="origin_as_image_center" /> Origin as Image Center</label>
        <label>Output Filename:<input formControlName="output_filename" /></label>
      </div>
      <button type="submit" [disabled]="form.invalid">Save</button>
      <button type="button" (click)="cancel()">Cancel</button>
    </form>
  `
})
export class ActorEditComponent implements OnInit {
  form!: FormGroup;
  simulationId!: number;
  name!: string;
  actorType!: string;

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
        this.actorType = actor.type;
        this.initializeForm(actor);
      });
  }

  initializeForm(actor: ActorRead): void {
    let formConfig: any = {
      name: [actor.name, Validators.required]
    };

    switch(actor.type) {
      case 'SimulationStatisticsActor':
        formConfig.output_filename = [actor.output_filename, Validators.required];
        break;
      case 'DigitizerHitsCollectionActor':
        formConfig.attached_to = [actor.attached_to, Validators.required];
        formConfig.attributes = [actor.attributes?.join(', ') || ''];
        formConfig.output_filename = [actor.output_filename, Validators.required];
        break;
      case 'DigitizerProjectionActor':
        formConfig.attached_to = [actor.attached_to, Validators.required];
        formConfig.input_digi_collections = [actor.input_digi_collections?.join(', ') || '', Validators.required];
        formConfig.spacingX = [actor.spacing[0], Validators.required];
        formConfig.spacingY = [actor.spacing[1], Validators.required];
        formConfig.sizeX = [actor.size[0], Validators.required];
        formConfig.sizeY = [actor.size[1], Validators.required];
        formConfig.sizeZ = [actor.size[2], Validators.required];
        formConfig.origin_as_image_center = [actor.origin_as_image_center || false];
        formConfig.output_filename = [actor.output_filename, Validators.required];
        break;
    }

    this.form = this.fb.group(formConfig);
  }

  submit(): void {
    if (!this.form.valid) return;
    const value = this.form.value;
    let payload: ActorUpdate = {};

    if (value.name !== this.name) payload.name = value.name;

    switch(this.actorType) {
      case 'SimulationStatisticsActor':
        payload.config = {
          type: this.actorType,
          output_filename: value.output_filename
        };
        break;
      case 'DigitizerHitsCollectionActor':
        payload.config = {
          type: this.actorType,
          attached_to: value.attached_to,
          attributes: value.attributes?.split(',').map((s: string) => s.trim()) || [],
          output_filename: value.output_filename
        };
        break;
      case 'DigitizerProjectionActor':
        payload.config = {
          type: this.actorType,
          attached_to: value.attached_to,
          input_digi_collections: value.input_digi_collections?.split(',').map((s: string) => s.trim()) || [],
          spacing: [value.spacingX, value.spacingY],
          size: [value.sizeX, value.sizeY, value.sizeZ],
          origin_as_image_center: value.origin_as_image_center,
          output_filename: value.output_filename
        };
        break;
    }

    this.svc.update(this.simulationId, this.name, payload)
      .subscribe(() => this.router.navigate(['/simulations', this.simulationId]));
  }

  cancel(): void {
    this.router.navigate(['/simulations', this.simulationId]);
  }
}