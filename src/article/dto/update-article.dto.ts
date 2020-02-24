import { IsString } from 'class-validator';

export class UpdateArticleDto {
    @IsString()
    readonly title: string;

    @IsString()
    readonly body: string;
}
