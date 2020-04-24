import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateArticleDto {
    @IsNotEmpty()
    @IsString()
    readonly title: string;

    @IsNotEmpty()
    @IsString()
    readonly body: string;
}
