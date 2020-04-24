import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { HttpService, NotFoundException, HttpStatus } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { FindArticlesByIdsDto } from './dto/find-articles-by-ids.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

const mockUserId: string = 'a uuid';
const mockTitle: string = 'Test Title';
const mockSlug: string = 'test-title';
const mockBody: string = 'Lorem ipsum dolor sit amet';

describe('Articles Controller', () => {
  let controller: ArticlesController;
  let service: ArticlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: {
            create: jest.fn()
              .mockImplementation((userId: string, article: CreateArticleDto) =>
                Promise.resolve({ userId, ...article }),
              ),
            findOne: jest.fn()
              .mockImplementation((slug: string) =>
                Promise.resolve({ title: mockTitle, slug, body: mockBody }),
              ),
            findAll: jest.fn()
              .mockResolvedValue([
                { title: mockTitle, slug: mockSlug, body: mockBody },
                { title: 'Title', slug: 'title', body: 'Body' },
              ]),
            findByIds: jest.fn()
              .mockImplementation((ids: FindArticlesByIdsDto) => {
                const { articleIds } = ids;
                const articles: object[] = [];

                for (let id in articleIds) {
                  articles.push({
                    id: articleIds[id],
                    title: mockTitle,
                    slug: mockSlug,
                    body: mockBody
                  });
                }

                return Promise.resolve(articles);
              }),
            findAllByUser: jest.fn()
              .mockImplementation((userId: string) =>
                Promise.resolve([
                  { userId, title: mockTitle, slug: mockSlug, body: mockBody },
                  { userId, title: 'Title', slug: 'title', body: 'Body' },
                ]),
              ),
            update: jest.fn()
              .mockImplementation((slug: string, article: UpdateArticleDto) =>
                Promise.resolve({ slug, ...article }),
              ),
            delete: jest.fn()
              .mockImplementation((_slug: string) => Promise.resolve(undefined))
          }
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

  describe('create', () => {
    it('Create an article', () => {
      const articleDto: CreateArticleDto = { title: mockTitle, body: mockBody };

      expect(controller.create(mockUserId, articleDto))
        .resolves
        .toEqual({ userId: mockUserId, title: mockTitle, body: mockBody });
    });
  });

  describe('findOne', () => {
    it('Find an article by its slug', () => {
      const expectedResult: Partial<Article> = {
        title: mockTitle,
        slug: mockSlug,
        body: mockBody
      };

      expect(controller.findOne(mockSlug))
        .resolves
        .toEqual(expectedResult);
    });

    it('Not found error when an article can not be found', () => {
      const serviceSpy = jest.spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Article not found'));

      const controllerCall = controller.findOne(mockSlug);

      expect(controllerCall)
        .rejects
        .toMatchObject({
          message: {
            error: 'Not Found',
            message: 'Article not found',
            statusCode: HttpStatus.NOT_FOUND,
          }
        });
      expect(controllerCall).rejects.toBeInstanceOf(NotFoundException);
      expect(serviceSpy).toBeCalledWith(mockSlug);
      expect(serviceSpy).toBeCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('Find all articles', async () => {
    });
  });

  describe('findByIds', () => {
    it('Find articles by their IDs', () => {
      const { articleIds }: FindArticlesByIdsDto = { articleIds: [4, 8] };

      expect(controller.findByIds({ articleIds }))
        .resolves
        .toEqual([
          { id: articleIds[0], title: mockTitle, slug: mockSlug, body: mockBody },
          { id: articleIds[1], title: mockTitle, slug: mockSlug, body: mockBody },
        ]);
    });
  });

  describe('findAllByUser', () => {
    it('Find all articles by an author', () => {
      expect(controller.findAllByUser(mockUserId))
        .resolves
        .toEqual([
          { userId: mockUserId, title: mockTitle, slug: mockSlug, body: mockBody },
          { userId: mockUserId, title: 'Title', slug: 'title', body: 'Body' },
        ]);
    });
  });

  describe('update', () => {
    it('Update an article', () => {
      const articleDto: UpdateArticleDto = { title: mockTitle, body: mockBody };

      expect(controller.update(mockSlug, articleDto))
        .resolves
        .toEqual({ title: mockTitle, slug: mockSlug, body: mockBody });
    });
  });

  describe('delete', () => {
    it('Delete an article', () => {
      expect(controller.delete(mockSlug))
        .resolves
        .toEqual(undefined);
    });
  });
});
