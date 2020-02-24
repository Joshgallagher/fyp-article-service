import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { JWKS, JWT, errors } from 'jose';
import { Article } from '../article.entity';

@Injectable()
export class ArticleGuard implements CanActivate {
    constructor() { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: any = context.switchToHttp().getRequest();
        const token: string = (request.get('Authorization') as string).split(' ')[1].trim();
        const slug: string = request.params.slug;

        let userId: string;
        let subject: string;

        try {
            const { sub } = JWT.decode(token) as any;

            subject = sub;
        } catch (e) {
            throw new UnauthorizedException();
        }

        try {
            const { user_id } = await getRepository(Article).findOneOrFail({
                where: { slug }
            });

            userId = user_id;
        } catch (e) {
            throw new NotFoundException('Article not found.');
        }

        if (userId !== subject) {
            throw new UnauthorizedException();
        }

        return true;
    }
}
