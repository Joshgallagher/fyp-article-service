import { Controller, Get, Param } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './article.entity';

@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Get()
    findAll(): Promise<Article[]> {
        return this.articlesService.findAll();
    }

    @Get(':userId')
    findAllByUser(@Param('userId') userId: string): Promise<Article[]> {
        return this.articlesService.findAllByUser(userId);
    }
}
