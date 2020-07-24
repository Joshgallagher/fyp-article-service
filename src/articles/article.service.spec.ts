import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { Article } from './article.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { FindArticlesByIdsDto } from './dto/find-articles-by-ids.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryService } from '@nestjs/core';
import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

const mockId: number = 1;
const mockUserId: string = 'a uuid';
const mockTitle: string = 'Test Title';
const mockSubtitle: string = 'Test Subtitle';
const mockSlug: string = 'test-title';
const mockBody: string = 'Lorem ipsum dolor sit amet';

describe('ArticleService', () => {
  let service: ArticlesService;
  let repository: Repository<Article>;
  let queue: AmqpConnection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        DiscoveryService,
        RabbitMQModule,
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: {
            create: jest.fn(() => true),
            find: jest.fn(() => true),
            findOne: jest.fn(() => true),
            findOneOrFail: jest.fn(() => true),
            findByIds: jest.fn(() => true),
            save: jest.fn(() => true),
            delete: jest.fn(() => true),
          }
        },
        {
          provide: AmqpConnection,
          useValue: {
            publish: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    repository = module.get<Repository<Article>>(getRepositoryToken(Article));
    queue = module.get<AmqpConnection>(AmqpConnection);
  });

  describe('create', () => {
    it('Create an article', async () => {
      const articleDto: CreateArticleDto = {
        title: mockTitle,
        subtitle: mockSubtitle,
        body: mockBody
      };

      repository.save = jest.fn()
        .mockReturnValue(() => ({ id: mockId, slug: mockSlug }));
      await service.create(mockUserId, articleDto);

      expect(repository.save)
        .toHaveBeenCalledWith(Object.assign(new Article, {
          userId: mockUserId,
          ...articleDto
        }));
    });
  });

  describe('findOne', () => {
    it('Find an article by its slug', async () => {
      repository.findOneOrFail = jest.fn();
      await service.findOne(mockSlug);

      expect(repository.findOneOrFail)
        .toHaveBeenCalledWith({ where: { slug: mockSlug } });
    });

    it('Not found error when an article can not be found', () => {
      repository.findOneOrFail = jest.fn()
        .mockRejectedValue(new Error());
      const error = service.findOne(mockSlug);

      expect(repository.findOneOrFail)
        .toHaveBeenCalledWith({ where: { slug: mockSlug } });
      expect(error).rejects.toBeInstanceOf(NotFoundException);
      expect(error).rejects.toMatchObject({
        message: {
          error: 'Not Found',
          message: 'Article not found',
          statusCode: HttpStatus.NOT_FOUND,
        }
      });
    });
  });

  describe('findAll', () => {
    it('Find all articles', async () => {
      repository.find = jest.fn();
      await service.findAll();

      expect(repository.find)
        .toHaveBeenCalledWith({ order: { id: 'DESC' } });
    });
  });

  describe('findByIds', () => {
    it('Find articles by their IDs', async () => {
      const ids: FindArticlesByIdsDto = { articleIds: [1, 2, 3] };

      repository.findByIds = jest.fn();
      await service.findByIds(ids);

      expect(repository.findByIds)
        .toHaveBeenCalledWith(ids.articleIds);
    });
  });

  describe('findAllByUser', () => {
    it('Find all articles by an author', async () => {
      repository.find = jest.fn();
      await service.findAllByUser(mockUserId);

      expect(repository.find)
        .toHaveBeenCalledWith({
          where: { userId: mockUserId },
          order: { id: 'DESC' }
        });
    });
  });

  describe('update', () => {
    it('Update an article', async () => {
      const article: UpdateArticleDto = {
        title: mockTitle,
        subtitle: mockSubtitle,
        body: mockBody
      };

      repository.findOne = jest.fn()
        .mockReturnValue(article);
      repository.save = jest.fn();
      await service.update(mockSlug, article);

      expect(repository.findOne)
        .toHaveBeenCalledWith({ where: { slug: mockSlug } });
      expect(repository.save)
        .toHaveBeenCalledWith(Object.assign(new Article, { ...article }));
    });
  });

  describe('delete', () => {
    it('Delete an article', async () => {
      repository.findOne = jest.fn()
        .mockResolvedValue({ id: mockId });
      repository.delete = jest.fn()
        .mockResolvedValue({ affected: 1 });
      await service.delete(mockSlug);

      expect(repository.findOne)
        .toHaveBeenCalledWith({ where: { slug: mockSlug } });
      expect(repository.delete)
        .toHaveBeenCalledWith(mockId);
      expect(queue.publish).toHaveBeenCalledTimes(1);
    });
  });

  it('No articles to delete', async () => {
    repository.findOne = jest.fn()
      .mockResolvedValue({ id: mockId });
    repository.delete = jest.fn()
      .mockResolvedValue({ affected: null });
    await service.delete(mockSlug);

    expect(repository.findOne)
      .toHaveBeenCalledWith({ where: { slug: mockSlug } });
    expect(repository.delete)
      .toHaveBeenCalledWith(mockId);
    expect(queue.publish).toHaveBeenCalledTimes(0);
  });
});
