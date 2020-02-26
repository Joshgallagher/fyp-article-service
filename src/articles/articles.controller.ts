import { Controller, Get, Param, ParseUUIDPipe, Post, Body, UseGuards, UseInterceptors, Headers, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserIdHeaderInterceptor } from 'src/common/interceptors/user-id-header.interceptor';
import { ArticleGuard } from './guards/article.guard';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ValidationPipe } from 'src/common/pipes/validation.pipe';

@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(UserIdHeaderInterceptor)
    create(
        @Headers('x-user-id') userId: string,
        @Body(new ValidationPipe()) createArticleDto: CreateArticleDto
    ): Promise<Article> {
        return this.articlesService.create(userId, createArticleDto);
    }

    @Get()
    findAll(): Promise<Article[]> {
        return this.articlesService.findAll();
    }

    @Get('user/:userId')
    findAllByUser(
        @Param('userId', new ParseUUIDPipe()) userId: string
    ): Promise<Article[]> {
        return this.articlesService.findAllByUser(userId);
    }

    @Get(':slug')
    findOne(@Param('slug') slug: string): Promise<Article> {
        return this.articlesService.findOne(slug);
    }

    @Put(':slug')
    @UseGuards(ArticleGuard)
    update(
        @Param('slug') slug: string,
        @Body(new ValidationPipe()) updateArticleDto: UpdateArticleDto
    ): Promise<Article> {
        return this.articlesService.update(slug, updateArticleDto);
    }

    @Delete(':slug')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(ArticleGuard)
    delete(@Param('slug') slug: string): Promise<void> {
        return this.articlesService.delete(slug);
    }
}
