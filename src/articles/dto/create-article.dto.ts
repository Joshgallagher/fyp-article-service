import { IsNotEmpty, IsString } from 'class-validator';

export class CreateArticleDto {
    @IsNotEmpty()
    @IsString()
    readonly title: string;

    @IsNotEmpty()
    @IsString()
    readonly body: string;
}
