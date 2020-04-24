import { EventSubscriber, EntitySubscriberInterface, InsertEvent, Like } from 'typeorm';
import slugify from 'slugify';
import { Article } from './article.entity';
import { getRepository } from 'typeorm';

@EventSubscriber()
export class ArticleSubscriber implements EntitySubscriberInterface<Article> {
    /**
     * Indicates that this subscriber only listens to Article events.
     */
    listenTo() {
        return Article;
    }

    async afterInsert(event: InsertEvent<Article>) {
        const { entity } = event;
        const id = entity.id;

        const article = await event.manager.findOne(Article, id);
        article.slug = `${entity.slug}-${entity.id}`;

        await event.manager.save(article);
    }

    /**
     * Called before Article insertion.
     */
    async beforeInsert(event: InsertEvent<Article>) {
        const { entity } = event;

        entity.slug = slugify(entity.title, {
            replacement: '-',
            remove: null,
            lower: true
        });
    }
}
