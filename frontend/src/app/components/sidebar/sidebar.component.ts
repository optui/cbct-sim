import { Component, OnInit } from '@angular/core';
import { Simulation, SimulationService } from '../../services/simulation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <nav>
      <h1>ProjeCT</h1>

      <div id="simulations-header">
        <h3>Simulations</h3>
        <span (click)="openCreateModal()" class="add-button">+</span>
      </div>

      <ul id="simulations">
        <li *ngFor="let sim of simulations" class="simulation-item" (click)="viewSimulationDetail(sim.id!)">
          <div class="sim-header">
            <strong>{{ sim.name }}</strong>
          </div>
          <div class="sim-controls">
            <button (click)="runSim(sim.id)" class="btn btn-run">Run</button>
            <button (click)="viewSim(sim.id)" class="btn btn-view">View</button>
            <button (click)="openDeleteModal(sim)" class="btn btn-delete">Delete</button>
          </div>
        </li>
      </ul>

    <!-- Create Simulation Modal -->
    <div *ngIf="showCreateModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Create Simulation</h3>
          <span class="close-btn" (click)="closeCreateModal()">×</span>
        </div>
        <div class="modal-content">
          <input [(ngModel)]="newSimName" placeholder="Simulation name" />
          <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
          <div class="modal-actions">
            <button (click)="addSimulation()" class="btn btn-confirm">Create</button>
            <button (click)="closeCreateModal()" class="btn btn-cancel">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Simulation Modal -->
    <div *ngIf="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Confirm Deletion</h3>
          <span class="close-btn" (click)="closeDeleteModal()">×</span>
        </div>
        <div class="modal-content">
          <p>Do you want to delete "{{ simToDelete?.name }}"?</p>
          <div class="modal-actions">
            <button (click)="deleteSimulation()" class="btn btn-confirm">Delete</button>
            <button (click)="closeDeleteModal()" class="btn btn-cancel">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </nav>
  `,
  styles: `
  /* Minimalist styles */
  nav {
    height: 100%;
    min-width: fit-content;
    width: 20%;
    background-color: #111;
    padding: 2rem;
    color: #eee;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  nav h1 {
    font-size: 28px;
    margin-bottom: 2rem;
    text-align: center;
    letter-spacing: 1px;
    color: #fff;
  }

  #simulations-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    border-bottom: 1px solid #333;
    padding-bottom: 0.5rem;
  }

  #simulations-header h3 {
    margin: 0;
    font-weight: 500;
    color: #ddd;
  }

  .add-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgb(57, 114, 4);
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .add-button:hover {
    transform: scale(1.1);
    background: rgb(67, 134, 4);
  }

  #simulations {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .simulation-item {
    margin-top: 0.75rem;
    padding: 0.75rem;
    border-radius: 4px;
    border-bottom: 1px solid #333;
    transition: background-color 0.2s ease;
  }

  .simulation-item:hover {
    background-color: #1a1a1a;
  }

  .sim-header {
    margin-bottom: 0.5rem;
  }

  .sim-controls {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #fff;
  }

  .btn-run {
    background: #2c5282;
  }

  .btn-run:hover {
    background: #3182ce;
  }

  .btn-view {
    background: #2d3748;
  }

  .btn-view:hover {
    background: #4a5568;
  }

  .btn-delete {
    background: #822727;
  }

  .btn-delete:hover {
    background: #e53e3e;
  }

  .btn-confirm {
    background: rgb(57, 114, 4);
  }

  .btn-confirm:hover {
    background: rgb(67, 134, 4);
  }

  .btn-cancel {
    background: rgb(131, 38, 10);
  }

  .btn-cancel:hover {
    background: rgb(151, 48, 20);
  }

  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s;
    z-index: 1000;
  }

  .modal {
    background: #111;
    border-radius: 8px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.5);
    width: 300px;
    overflow: hidden;
    animation: slideIn 0.3s ease;
  }

  .modal-header {
    background: #1a1a1a;
    padding: 0.8rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #333;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
  }

  .close-btn {
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .close-btn:hover {
    color: #f56565;
  }

  .modal-content {
    padding: 1.2rem;
  }

  .modal input {
    width: 100%;
    padding: 0.5rem;
    background: #222;
    color: #eee;
    border: 1px solid #444;
    border-radius: 4px;
    margin: 0.5rem 0 1rem;
    font-size: 0.9rem;
    transition: border-color 0.2s ease;
  }

  .modal input:focus {
    outline: none;
    border-color: #3182ce;
  }

  .modal-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
    justify-content: flex-end;
  }

  .error-message {
    color: #e53e3e;
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  `
})
export class SidebarComponent implements OnInit {
  simulations: Simulation[] = [];
  showInput = false;
  newSimName = '';
  showCreateModal = false;
  showDeleteModal = false;
  simToDelete: Simulation | null = null;
errorMessage: any;

  constructor(private simService: SimulationService, private router: Router) {}

  ngOnInit() {
    this.simService.getSimulations().subscribe((data) => this.simulations = data);
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.showInput = false;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  addSimulation() {
    const name = this.newSimName.trim();
    if (!name) return;

    this.simService.createSimulation({ name }).subscribe({
      next: (sim) => {
        this.simulations.push(sim);
        this.newSimName = '';
        this.showCreateModal = false;
      },
      error: (err) => {
        if (err.status === 409) {
          alert(`Error: ${err.error.detail}`);
        } else {
          alert('An unexpected error occurred. Please try again later.');
        }
      }
    });
  }

  openDeleteModal(sim: Simulation) {
    this.simToDelete = sim;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.simToDelete = null;
  }

  deleteSimulation() {
    if (!this.simToDelete) return;
    this.simService.deleteSimulation(this.simToDelete.id!).subscribe(() => {
      this.simulations = this.simulations.filter(s => s.id !== this.simToDelete?.id);
      this.closeDeleteModal();
    });
  }

  runSim(id?: number) {
    if (id) this.simService.runSimulation(id).subscribe();
  }

  viewSim(id?: number) {
    if (id) this.simService.viewSimulation(id).subscribe();
  }

  // Navigate to the simulation detail page
  viewSimulationDetail(id: number) {
    this.router.navigate(['/simulations', id]);
  }
}