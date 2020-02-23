import { EventSubscriber, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import slugify from 'slugify';
import { Article } from './article.entity';

@EventSubscriber()
export class ArticleSubscriber implements EntitySubscriberInterface<Article> {
    /**
     * Indicates that this subscriber only listens to Article events.
     */
    listenTo() {
        return Article;
    }

    /**
     * Called before Article insertion.
     */
    beforeInsert({ entity }: InsertEvent<Article>) {
        entity.slug = slugify(entity.title, {
            replacement: '_',
            remove: null,
            lower: true
        });
    }
}
