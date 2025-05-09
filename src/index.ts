import { _make } from "./helpers/entity-make";
import {
    BaseEntity, 
    EntityManager, 
    EntityTarget, 
    FindManyOptions, 
    FindOneOptions, 
    FindOptionsRelationsProperty
} from 'typeorm';
import { findAndCountIncludeRelations_BaseEntity, findAndCountIncludeRelations_EntityManager, findIncludeRelations_BaseEntity, findIncludeRelations_EntityManager, findOneIncludeRelations_BaseEntity, findOneIncludeRelations_EntityManager, findOneOrFailIncludeRelations_BaseEntity, findOneOrFailIncludeRelations_EntityManager, IncludeRelations } from "./helpers/include-relations";

declare module 'typeorm' {
    export namespace BaseEntity {
        export let make: typeof _make;
        export let findIncludeRelations: typeof findIncludeRelations_BaseEntity
        export let findAndCountIncludeRelations: typeof findAndCountIncludeRelations_BaseEntity
        export let findOneIncludeRelations: typeof findOneIncludeRelations_BaseEntity
        export let findOneOrFailIncludeRelations: typeof findOneOrFailIncludeRelations_BaseEntity
    }

    export interface EntityManager {
        findIncludeRelations<E extends BaseEntity, K extends keyof E = never>(
            entityTarget: EntityTarget<E>,
            findOptions: Omit<FindManyOptions<E>, 'relations'> 
                & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
          ): Promise<IncludeRelations<E, K>[]>;
        findAndCountIncludeRelations<E extends BaseEntity, K extends keyof E = never>(
            entityTarget: EntityTarget<E>,
            findOptions: Omit<FindManyOptions<E>, 'relations'> 
                & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>} 
          ): Promise<[IncludeRelations<E, K>[], number]>;
        findOneIncludeRelations<E extends BaseEntity, K extends keyof E = never>(
            entityTarget: EntityTarget<E>,
            findOptions: Omit<FindOneOptions<E>, 'relations'> 
                & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
          ): Promise<IncludeRelations<E, K> | null>;
        findOneOrFailIncludeRelations<E extends BaseEntity, K extends keyof E = never>(
            entityTarget: EntityTarget<E>,
            findOptions: Omit<FindOneOptions<E>, 'relations'> 
                & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
          ): Promise<IncludeRelations<E, K>>;
    }
}

BaseEntity.make = _make;

BaseEntity.findIncludeRelations = findIncludeRelations_BaseEntity;
BaseEntity.findAndCountIncludeRelations = findAndCountIncludeRelations_BaseEntity;
BaseEntity.findOneIncludeRelations = findOneIncludeRelations_BaseEntity;
BaseEntity.findOneOrFailIncludeRelations = findOneOrFailIncludeRelations_BaseEntity;

EntityManager.prototype.findIncludeRelations = findIncludeRelations_EntityManager;
EntityManager.prototype.findAndCountIncludeRelations = findAndCountIncludeRelations_EntityManager;
EntityManager.prototype.findOneIncludeRelations = findOneIncludeRelations_EntityManager;
EntityManager.prototype.findOneOrFailIncludeRelations = findOneOrFailIncludeRelations_EntityManager;

export {BaseEntity, EntityManager};
