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

  describe('Create article', () => {
    it('User successfully created an article', () => {
      const articleDto: CreateArticleDto = { title: mockTitle, body: mockBody };

      expect(controller.create(mockUserId, articleDto))
        .resolves
        .toEqual({ userId: mockUserId, title: mockTitle, body: mockBody });
    });
  });

  describe('Find one article', () => {
    it('A user can find one article by its slug', () => {
      const expectedResult: Partial<Article> = {
        title: mockTitle,
        slug: mockSlug,
        body: mockBody
      };

      expect(controller.findOne(mockSlug))
        .resolves
        .toEqual(expectedResult);
    });

    it('Not found error will be thrown when an article can not be found', () => {
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

  describe('Find articles by their ids', () => {
    it('A user can find articles by their ids', () => {
      const { articleIds }: FindArticlesByIdsDto = { articleIds: [4, 8] };

      expect(controller.findByIds({ articleIds }))
        .resolves
        .toEqual([
          { id: articleIds[0], title: mockTitle, slug: mockSlug, body: mockBody },
          { id: articleIds[1], title: mockTitle, slug: mockSlug, body: mockBody },
        ]);
    });
  });

  describe('Find articles by their author', () => {
    it('A user can find articles by their author', () => {
      expect(controller.findAllByUser(mockUserId))
        .resolves
        .toEqual([
          { userId: mockUserId, title: mockTitle, slug: mockSlug, body: mockBody },
          { userId: mockUserId, title: 'Title', slug: 'title', body: 'Body' },
        ]);
    });
  });

  describe('Update article', () => {
    it('A user can update their article', () => {
      const articleDto: UpdateArticleDto = { title: mockTitle, body: mockBody };

      expect(controller.update(mockSlug, articleDto))
        .resolves
        .toEqual({ title: mockTitle, slug: mockSlug, body: mockBody });
    });
  });

  describe('Delete article', () => {
    it('A user can delete their article', () => {
      expect(controller.delete(mockSlug))
        .resolves
        .toEqual(undefined);
    });
  });
});
