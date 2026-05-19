import { IsDateString, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateAttendanceDto {
  @IsDateString()
  checkInTime: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumberString()
  latitude?: string;

  @IsOptional()
  @IsNumberString()
  longitude?: string;

  @IsOptional()
  @IsString()
  locationLabel?: string;
}
