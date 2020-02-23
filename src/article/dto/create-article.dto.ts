import { IsUUID, IsString } from 'class-validator';

export class CreateArticleDto {
    @IsUUID()
    readonly user_id: string;

    @IsString()
    readonly title: string;

    @IsString()
    readonly body: string;
}
