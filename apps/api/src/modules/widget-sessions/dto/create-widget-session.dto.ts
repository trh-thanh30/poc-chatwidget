import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateWidgetSessionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  widgetId!: string;
}
