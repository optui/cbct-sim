import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ActorService } from '../../services/actor.service';
import { ActorCreate } from '../../interfaces/actor';

@Component({
  standalone: true,
  selector: 'app-actor-create',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label>Name:<input formControlName="name" /></label>
      <label>Type:
        <select formControlName="type" (change)="onTypeChange()">
          <option value="SimulationStatisticsActor">Simulation Statistics</option>
          <option value="DigitizerHitsCollectionActor">Digitizer Hits Collection</option>
          <option value="DigitizerProjectionActor">Digitizer Projection</option>
        </select>
      </label>
      
      <div *ngIf="form.get('type')?.value === 'SimulationStatisticsActor'">
        <label>Output Filename:<input formControlName="output_filename" /></label>
      </div>

      <div *ngIf="form.get('type')?.value === 'DigitizerHitsCollectionActor'">
        <label>Attached To:<input formControlName="attached_to" /></label>
        <label>Attributes (comma-separated):<input formControlName="attributes" /></label>
        <label>Output Filename:<input formControlName="output_filename" /></label>
      </div>

      <div *ngIf="form.get('type')?.value === 'DigitizerProjectionActor'">
        <label>Attached To:<input formControlName="attached_to" /></label>
        <label>Input Digi Collections (comma-separated):<input formControlName="input_digi_collections" /></label>
        <label>Spacing (x,y):<input type="number" formControlName="spacingX" />, <input type="number" formControlName="spacingY" /></label>
        <label>Size (x,y,z):<input type="number" formControlName="sizeX" />, <input type="number" formControlName="sizeY" />, <input type="number" formControlName="sizeZ" /></label>
        <label><input type="checkbox" formControlName="origin_as_image_center" /> Origin as Image Center</label>
        <label>Output Filename:<input formControlName="output_filename" /></label>
      </div>

      <button type="submit" [disabled]="form.invalid">Create</button>
      <button type="button" (click)="cancel()">Cancel</button>
    </form>
  `
})
export class ActorCreateComponent implements OnInit {
  form!: FormGroup;
  simulationId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private svc: ActorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.simulationId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      output_filename: '',
      attached_to: '',
      attributes: '',
      input_digi_collections: '',
      spacingX: null,
      spacingY: null,
      sizeX: null,
      sizeY: null,
      sizeZ: null,
      origin_as_image_center: false
    });
    this.onTypeChange();
  }

  onTypeChange(): void {
    const type = this.form.get('type')?.value;
    this.form.clearValidators();
    this.form.get('name')?.setValidators(Validators.required);
    switch(type) {
      case 'SimulationStatisticsActor':
        this.form.get('output_filename')?.setValidators(Validators.required);
        break;
      case 'DigitizerHitsCollectionActor':
        this.form.get('attached_to')?.setValidators(Validators.required);
        this.form.get('output_filename')?.setValidators(Validators.required);
        break;
      case 'DigitizerProjectionActor':
        this.form.get('attached_to')?.setValidators(Validators.required);
        this.form.get('input_digi_collections')?.setValidators(Validators.required);
        this.form.get('spacingX')?.setValidators(Validators.required);
        this.form.get('spacingY')?.setValidators(Validators.required);
        this.form.get('sizeX')?.setValidators(Validators.required);
        this.form.get('sizeY')?.setValidators(Validators.required);
        this.form.get('sizeZ')?.setValidators(Validators.required);
        this.form.get('output_filename')?.setValidators(Validators.required);
        break;
    }
    this.form.updateValueAndValidity();
  }

  submit(): void {
    if (!this.form.valid) return;
    const value = this.form.value;
    let payload: ActorCreate;

    switch(value.type) {
      case 'SimulationStatisticsActor':
        payload = {
          name: value.name,
          type: value.type,
          output_filename: value.output_filename
        };
        break;
      case 'DigitizerHitsCollectionActor':
        payload = {
          name: value.name,
          type: value.type,
          attached_to: value.attached_to,
          attributes: value.attributes?.split(',').map((s: string) => s.trim()) || [],
          output_filename: value.output_filename
        };
        break;
      case 'DigitizerProjectionActor':
        payload = {
          name: value.name,
          type: value.type,
          attached_to: value.attached_to,
          input_digi_collections: value.input_digi_collections?.split(',').map((s: string) => s.trim()) || [],
          spacing: [value.spacingX, value.spacingY],
          size: [value.sizeX, value.sizeY, value.sizeZ],
          origin_as_image_center: value.origin_as_image_center,
          output_filename: value.output_filename
        };
        break;
      default:
        return;
    }

    this.svc.create(this.simulationId, payload)
      .subscribe(() => this.router.navigate(['/simulations', this.simulationId]));
  }

  cancel(): void {
    this.router.navigate(['/simulations', this.simulationId]);
  }
}