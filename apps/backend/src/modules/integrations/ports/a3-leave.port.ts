export interface A3LeaveDto {
  userId: string;
  date: string;
  leaveTypeId: string;
  source: 'A3' | 'LOCAL';
  approved: boolean;
  externalRef?: string;
}

export abstract class A3LeavePort {
  abstract listLeaves(userExternalId: string, from: string, to: string): Promise<A3LeaveDto[]>;
  abstract verifyWebhook(signature: string, payload: string): Promise<boolean>;
}
