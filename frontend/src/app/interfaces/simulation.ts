export interface SimulationBase {
    name: string;
    num_runs: number;
    run_len: number;
}

export interface SimulationCreate extends SimulationBase { }

export interface SimulationUpdate {
    name?: string;
    num_runs?: number;
    run_len?: number;
}

export interface SimulationRead extends SimulationBase {
    id: number;
    created_at: string;
    output_dir: string;
    json_archive_filename: string;
}

export interface MessageResponse {
    message: string;
}
