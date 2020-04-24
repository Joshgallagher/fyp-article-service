import { Injectable, NotFoundException, Body } from '@nestjs/common';
import { Article } from './article.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FindArticlesByIdsDto } from './dto/find-articles-by-ids.dto';

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(Article)
        private readonly articlesRepository: Repository<Article>,
    ) { }

    async create(userId: string, createArticleDto: CreateArticleDto): Promise<Article> {
        const { title, body } = createArticleDto;

        let article = new Article();
        article.userId = userId;
        article.title = title;
        article.body = body;

        let savedArticle = await this.articlesRepository.save(article);
        savedArticle.slug = `${savedArticle.slug}-${savedArticle.id}`;

        return savedArticle;
    }

    async findOne(slug: string): Promise<Article> {
        try {
            return await this.articlesRepository.findOneOrFail({
                where: { slug }
            });
        } catch (e) {
            throw new NotFoundException('Article not found');
        }
    }

    async findAll(): Promise<Article[]> {
        return await this.articlesRepository.find({
            order: { id: 'DESC' }
        });
    }

    async findByIds(findArticlesByIdsDto: FindArticlesByIdsDto): Promise<Article[]> {
        const { articleIds } = findArticlesByIdsDto;

        return await this.articlesRepository.findByIds(articleIds);
    }

    async findAllByUser(userId: string): Promise<Article[]> {
        return await this.articlesRepository.find({
            where: { userId },
            order: { id: 'DESC' }
        });
    }

    async update(slug: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
        const { title, body } = updateArticleDto;

        let article = await this.articlesRepository.findOne({ where: { slug } });

        article.title = title;
        article.body = body;

        const updatedArticle = await this.articlesRepository.save(article);

        return updatedArticle;
    }

    async delete(slug: string): Promise<void> {
        const { id } = await this.articlesRepository.findOne({
            where: { slug }
        });

        await this.articlesRepository.delete(id);
    }
}
