import { Controller, Get, Param, ParseUUIDPipe, Post, Body } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Post()
    create(@Body() createArticleDto: CreateArticleDto): Promise<Article> {
        return this.articlesService.create(createArticleDto);
    }

    @Get()
    findAll(): Promise<Article[]> {
        return this.articlesService.findAll();
    }

    @Get(':slug')
    findOne(@Param('slug') slug: string): Promise<Article> {
        return this.articlesService.findOne(slug);
    }

    @Get(':userId')
    findAllByUser(
        @Param('userId', new ParseUUIDPipe()) userId: string
    ): Promise<Article[]> {
        return this.articlesService.findAllByUser(userId);
    }
}
