export interface ActorBase {
    name: string;
}

export interface SimulationStatisticsActorConfig extends ActorBase {
    type: 'SimulationStatisticsActor';
    output_filename: string;
}

export interface DigitizerHitsCollectionActorConfig extends ActorBase {
    type: 'DigitizerHitsCollectionActor';
    attached_to: string;
    attributes?: string[];
    output_filename: string;
}

export interface DigitizerProjectionActorConfig extends ActorBase {
    type: 'DigitizerProjectionActor';
    attached_to: string;
    input_digi_collections: string[];
    spacing: [number, number];
    size: [number, number, number];
    origin_as_image_center?: boolean;
    output_filename: string;
}

export type ActorCreate =
    | SimulationStatisticsActorConfig
    | DigitizerHitsCollectionActorConfig
    | DigitizerProjectionActorConfig;

export type ActorRead = ActorCreate;

export interface SimulationStatisticsActorUpdateConfig {
    type: 'SimulationStatisticsActor';
    output_filename?: string;
}

export interface DigitizerHitsCollectionActorUpdateConfig {
    type: 'DigitizerHitsCollectionActor';
    attached_to?: string;
    attributes?: string[];
    output_filename?: string;
}

export interface DigitizerProjectionActorUpdateConfig {
    type: 'DigitizerProjectionActor';
    attached_to?: string;
    input_digi_collections?: string[];
    spacing?: number[];
    size?: number[];
    origin_as_image_center?: boolean;
    output_filename?: string;
}

export type ActorUpdateConfig =
    | SimulationStatisticsActorUpdateConfig
    | DigitizerHitsCollectionActorUpdateConfig
    | DigitizerProjectionActorUpdateConfig;

export interface ActorUpdate {
    name?: string;
    config?: ActorUpdateConfig;
}