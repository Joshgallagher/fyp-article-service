import { Injectable, NotFoundException, Body } from '@nestjs/common';
import { Article } from './article.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(Article)
        private readonly articlesRepository: Repository<Article>,
    ) { }

    async create(createArticleDto: CreateArticleDto): Promise<Article> {
        const { user_id, title, body } = createArticleDto;

        let article = new Article();
        article.user_id = user_id;
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
}
