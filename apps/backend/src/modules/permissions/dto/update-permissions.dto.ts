import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class UpdatePermissionsDto {
  @IsString()
  userId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  projectIds!: string[];
}
