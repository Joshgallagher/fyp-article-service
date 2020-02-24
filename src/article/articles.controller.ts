import { Controller, Get, Param, ParseUUIDPipe, Post, Body, UseGuards, UseInterceptors, Headers } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserIdHeaderInterceptor } from 'src/common/interceptors/user-id-header.interceptor';
import { ArticleGuard } from './guards/article.guard';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(UserIdHeaderInterceptor)
    create(
        @Headers('x-user-id') userId: string,
        @Body() createArticleDto: CreateArticleDto
    ): Promise<Article> {
        return this.articlesService.create(userId, createArticleDto);
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

    @Post(':slug')
    @UseGuards(ArticleGuard)
    update(@Param('slug') slug: string, @Body() updateArticleDto: UpdateArticleDto): Promise<Article> {
        return this.articlesService.update(slug, updateArticleDto);
    }
}
