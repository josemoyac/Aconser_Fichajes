export interface BCProjectDto {
  externalId: string;
  code: string;
  name: string;
  active: boolean;
}

export abstract class BCProjectsPort {
  abstract listProjects(): Promise<BCProjectDto[]>;
  abstract getProjectByExternalId(externalId: string): Promise<BCProjectDto | null>;
  abstract verifyWebhook(signature: string, payload: string): Promise<boolean>;
}
