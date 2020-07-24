import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Article } from './article.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FindArticlesByIdsDto } from './dto/find-articles-by-ids.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ArticlesService {
    constructor(
        @Inject('ConfigService')
        private readonly configService: ConfigService,
        @InjectRepository(Article)
        private readonly articlesRepository: Repository<Article>,
        private readonly queue: AmqpConnection
    ) { }

    async create(userId: string, createArticleDto: CreateArticleDto): Promise<Article> {
        const { title, subtitle, body } = createArticleDto;

        let article = new Article();
        article.userId = userId;
        article.title = title;
        article.subtitle = subtitle;
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
        const { title, subtitle, body } = updateArticleDto;

        let article = await this.articlesRepository.findOne({ where: { slug } });

        article.title = title;
        article.subtitle = subtitle;
        article.body = body;

        const updatedArticle = await this.articlesRepository.save(article);

        return updatedArticle;
    }

    async delete(slug: string): Promise<void> {
        const { id } = await this.articlesRepository.findOne({
            where: { slug }
        });

        const { affected } = await this.articlesRepository.delete(id);

        if (affected !== null) {
            await this.queue.publish(
                this.configService.get<string>('AMQP_EXCHANGE'),
                'article.deleted',
                { id }
            );
        }
    }
}
