import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { HttpService } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { ConfigService } from '@nestjs/config';
import { FindArticlesByIdsDto } from './dto/find-articles-by-ids.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

const mockUserId: string = 'a uuid';
const mockTitle: string = 'Test Title';
const mockSubtitle: string = 'Test Subtitle';
const mockSlug: string = 'test-title';
const mockBody: string = 'Lorem ipsum dolor sit amet';

describe('Articles Controller', () => {
  let controller: ArticlesController;
  let service: ArticlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        ConfigService,
        {
          provide: ArticlesService,
          useFactory: () => ({
            create: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            findByIds: jest.fn(),
            findAllByUser: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          }),
        },
        {
          provide: HttpService,
          useFactory: () => ({
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
          }),
        },
        {
          provide: getRepositoryToken(Article),
          useClass: Repository,
        }
      ]
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
    service = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('Create an article', () => {
      const articleDto: CreateArticleDto = {
        title: mockTitle,
        subtitle: mockSubtitle,
        body: mockBody
      };

      controller.create(mockUserId, articleDto);

      expect(service.create).toHaveBeenCalledWith(mockUserId, articleDto);
    });
  });

  describe('findOne', () => {
    it('Find an article by its slug', () => {
      controller.findOne(mockSlug);

      expect(service.findOne).toHaveBeenCalledWith(mockSlug);
    });
  });

  describe('findAll', () => {
    it('Find all articles', () => {
      controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByIds', () => {
    it('Find articles by their IDs', () => {
      const { articleIds }: FindArticlesByIdsDto = { articleIds: [4, 8] };

      controller.findByIds({ articleIds });

      expect(service.findByIds).toHaveBeenCalledWith({ articleIds });
    });
  });

  describe('findAllByUser', () => {
    it('Find all articles by an author', () => {
      controller.findAllByUser(mockUserId);

      expect(service.findAllByUser).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('update', () => {
    it('Update an article', () => {
      const articleDto: UpdateArticleDto = {
        title: mockTitle,
        subtitle: mockSubtitle,
        body: mockBody
      };

      controller.update(mockSlug, articleDto);

      expect(service.update).toHaveBeenCalledWith(mockSlug, articleDto);
    });
  });

  describe('delete', () => {
    it('Delete an article', () => {
      controller.delete(mockSlug);

      expect(service.delete).toHaveBeenCalled();
    });
  });
});
