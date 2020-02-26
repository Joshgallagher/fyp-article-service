import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude, classToPlain } from 'class-transformer';

@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    @Exclude({ toPlainOnly: true })
    id: number;

    @Column()
    user_id: string;

    @Column()
    slug: string;

    @Column()
    title: string;

    @Column()
    body: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

    toJSON() {
        return classToPlain(this);
    }
}
