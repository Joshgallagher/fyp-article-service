import { Injectable } from '@nestjs/common';
import { Article } from './article.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
    ) { }

    async findAll(): Promise<Article[]> {
        return this.articleRepository.find();
    }
}
