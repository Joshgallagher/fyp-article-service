import { Injectable, NotFoundException, Body } from '@nestjs/common';
import { Article } from './article.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(Article)
        private readonly articlesRepository: Repository<Article>,
    ) { }

    async create(userId: string, createArticleDto: CreateArticleDto): Promise<Article> {
        const { title, body } = createArticleDto;

        let article = new Article();
        article.user_id = userId;
        article.title = title;
        article.body = body;

        return await this.articlesRepository.save(article);
    }

    async findAll(): Promise<Article[]> {
        return this.articlesRepository.find();
    }

    async findOne(slug: string): Promise<Article> {
        try {
            return await this.articlesRepository.findOneOrFail({
                where: { slug }
            });
        } catch (e) {
            throw new NotFoundException("Article not found.");
        }
    }

    async findAllByUser(userId: string): Promise<Article[]> {
        return this.articlesRepository.find({
            where: { user_id: userId }
        });
    }

    async update(
        slug: string,
        updateArticleDto: UpdateArticleDto
    ): Promise<Article> {
        const { title, body } = updateArticleDto;

        let article = await this.articlesRepository.findOne({
            where: { slug }
        });

        article.title = title;
        article.body = body;

        const updatedArticle = await this.articlesRepository.save(article);

        return updatedArticle;
    }

    async delete(slug: string): Promise<void> {
        let article = await this.articlesRepository.findOne({
            where: { slug }
        });

        await this.articlesRepository.delete(article.id);
    }
}
