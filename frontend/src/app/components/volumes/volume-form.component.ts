import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { VolumeService } from '../../services/volume.service';
import {
  VolumeCreate,
  VolumeRead,
  VolumeType,
  BoxShape,
  SphereShape,
  DynamicParams
} from '../../interfaces/volume';

import { Axis, Unit, Vector3, Rotation } from '../../interfaces/primitives';

@Component({
  selector: 'app-volume-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: `volume-form.component.html`
})
export class VolumeFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  simulationId!: number;
  volumeName: string | null = null;

  readonly VolumeType = VolumeType;
  readonly shapeTypes = Object.values(VolumeType);
  readonly axisOptions = Object.values(Axis);
  readonly unitOptions = Object.values(Unit);

  private readonly volumeService = inject(VolumeService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.buildForm();

    this.simulationId = Number(this.route.snapshot.paramMap.get('simId'));
    this.volumeName = this.route.snapshot.paramMap.get('name');

    if (this.volumeName && this.volumeName !== 'new') {
      this.isEdit = true;
      this.loadVolume();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      mother: [],
      material: ['G4_AIR', Validators.required],
      translationX: [0],
      translationY: [0],
      translationZ: [0],
      translation_unit: [Unit.MM],
      rotationAxis: [Axis.X],
      rotationAngle: [0],
      shapeType: [VolumeType.BOX],
      shapeUnit: [Unit.MM],
      sizeX: [10],
      sizeY: [10],
      sizeZ: [10],
      rmin: [0],
      rmax: [1],
      dynamicEnabled: [false],
      translationEndX: [0],
      translationEndY: [0],
      translationEndZ: [0],
      angleEnd: [0]
    });
  }

  private loadVolume(): void {
    this.volumeService.getVolume(this.simulationId, this.volumeName!).subscribe((volume: VolumeRead) => {
      this.form.patchValue({
        name: volume.name,
        mother: volume.mother,
        material: volume.material,
        translationX: volume.translation[0],
        translationY: volume.translation[1],
        translationZ: volume.translation[2],
        translation_unit: volume.translation_unit,
        rotationAxis: volume.rotation.axis,
        rotationAngle: volume.rotation.angle,
        shapeType: volume.shape.type,
        shapeUnit: volume.shape.unit,
        dynamicEnabled: volume.dynamic_params.enabled
      });

      // Force update for shape-based fields
      this.form.get('shapeType')?.updateValueAndValidity();

      // Shape specific values
      if (volume.shape.type === VolumeType.BOX) {
        const box = volume.shape as BoxShape;
        this.form.patchValue({
          sizeX: box.size[0],
          sizeY: box.size[1],
          sizeZ: box.size[2]
        });
      }

      if (volume.shape.type === VolumeType.SPHERE) {
        const sphere = volume.shape as SphereShape;
        this.form.patchValue({
          rmin: sphere.rmin,
          rmax: sphere.rmax
        });
      }

      // Dynamic parameters
      if (volume.dynamic_params.enabled) {
        if (volume.dynamic_params.translation_end) {
          this.form.patchValue({
            translationEndX: volume.dynamic_params.translation_end[0],
            translationEndY: volume.dynamic_params.translation_end[1],
            translationEndZ: volume.dynamic_params.translation_end[2]
          });
        }
        if (volume.dynamic_params.angle_end !== undefined) {
          this.form.patchValue({
            angleEnd: volume.dynamic_params.angle_end
          });
        }
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const payload = this.preparePayload();

    if (this.isEdit && this.volumeName) {
      this.volumeService
        .updateVolume(this.simulationId, this.volumeName, payload)
        .subscribe(() => this.navigateBack());
    } else {
      this.volumeService
        .createVolume(this.simulationId, payload)
        .subscribe(() => this.navigateBack());
    }
  }

  private preparePayload(): VolumeCreate {
    const v = this.form.value;

    let shape: BoxShape | SphereShape;
    if (v.shapeType === VolumeType.BOX) {
      shape = {
        type: VolumeType.BOX,
        unit: v.shapeUnit,
        size: [v.sizeX, v.sizeY, v.sizeZ] as Vector3
      };
    } else {
      shape = {
        type: VolumeType.SPHERE,
        unit: v.shapeUnit,
        rmin: v.rmin,
        rmax: v.rmax
      };
    }

    const dynamicParams: DynamicParams = {
      enabled: v.dynamicEnabled
    };

    if (v.dynamicEnabled) {
      dynamicParams.translation_end = [
        v.translationEndX,
        v.translationEndY,
        v.translationEndZ
      ] as Vector3;
      dynamicParams.angle_end = v.angleEnd;
    }

    const rotation: Rotation = {
      axis: v.rotationAxis,
      angle: v.rotationAngle
    };

    return {
      name: v.name,
      mother: v.mother,
      material: v.material,
      translation: [v.translationX, v.translationY, v.translationZ] as Vector3,
      translation_unit: v.translation_unit,
      rotation,
      shape,
      dynamic_params: dynamicParams
    };
  }

  cancel(): void {
    this.navigateBack();
  }

  private navigateBack(): void {
    this.router.navigate(['/simulations', this.simulationId]);
  }

  // 🔁 Template getters for reactivity
  get isBox(): boolean {
    return this.form?.get('shapeType')?.value === VolumeType.BOX;
  }

  get isSphere(): boolean {
    return this.form?.get('shapeType')?.value === VolumeType.SPHERE;
  }

  get shapeUnitLabel(): string {
    return this.form?.get('shapeUnit')?.value ?? 'mm';
  }

  get translationUnitLabel(): string {
    return this.form?.get('translation_unit')?.value ?? 'mm';
  }
}
