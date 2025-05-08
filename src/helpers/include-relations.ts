import {
    BaseEntity, 
    EntityManager, 
    EntityTarget, 
    FindManyOptions, 
    FindOneOptions, 
    FindOptionsRelations, 
    FindOptionsRelationsProperty
} from 'typeorm';

// Replace the specified entity relations (assumed optional in the Entity) 
// with required ones when requested in the query's joined relations
export type IncludeRelations<E extends BaseEntity, K extends keyof E = never> = E & {[Key in K]-?: E[Key]};
 
// BaseEntity find augmentations

export async function findIncludeRelations_BaseEntity<E extends BaseEntity, K extends keyof E = never>(
    this: {new (): E;} & typeof BaseEntity,
    findOptions: Omit<FindManyOptions<E>, 'relations'> 
        & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
  ): Promise<IncludeRelations<E, K>[]> {
  const entities = await this.find({
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  });

  return entities.map((e) => asIncludeRelations(e, findOptions.relations));
}

export async function findAndCountIncludeRelations_BaseEntity<E extends BaseEntity, K extends keyof E = never>(
    this: {new (): E;} & typeof BaseEntity,
    findOptions: Omit<FindManyOptions<E>, 'relations'> 
        & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
  ): Promise<[IncludeRelations<E, K>[], number]> {
  const entities = await this.findAndCount({
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  });

  return [entities[0].map((e) => asIncludeRelations(e, findOptions.relations)), entities[1]];
}

export async function findOneIncludeRelations_BaseEntity<E extends BaseEntity, K extends keyof E = never>(
    this: {new (): E;} & typeof BaseEntity,
    findOptions: Omit<FindOneOptions<E>, 'relations'> 
        & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
  ): Promise<IncludeRelations<E, K> | null> {
  const entity = await this.findOne({
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  });

  return entity ? asIncludeRelations(entity, findOptions.relations) : null;
}

export async function findOneOrFailIncludeRelations_BaseEntity<E extends BaseEntity, K extends keyof E = never>(
    this: {new (): E;} & typeof BaseEntity,
    findOptions: Omit<FindOneOptions<E>, 'relations'> 
        & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
  ): Promise<IncludeRelations<E, K>> {
  const entity = await this.findOneOrFail({
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  });

  return asIncludeRelations(entity, findOptions.relations);
}

// EntityManager find augmentations

export async function findIncludeRelations_EntityManager<E extends BaseEntity, K extends keyof E = never>(
    this: EntityManager,
    entityTarget: EntityTarget<E>,
    findOptions: Omit<FindManyOptions<E>, 'relations'> 
        & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
): Promise<IncludeRelations<E, K>[]> {
  const entities = await this.find<E>(entityTarget, {
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  });

  return entities.map((e) => asIncludeRelations(e, findOptions.relations));
}

export async function findAndCountIncludeRelations_EntityManager<E extends BaseEntity, K extends keyof E = never>(
    this: EntityManager,
    entityTarget: EntityTarget<E>,
    findOptions: Omit<FindManyOptions<E>, 'relations'> 
        & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
): Promise<[IncludeRelations<E, K>[], number]> {
  const entities = await this.findAndCount<E>(entityTarget, {
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  });

  return [entities[0].map((e) => asIncludeRelations(e, findOptions.relations)), entities[1]];
}

export async function findOneIncludeRelations_EntityManager<E extends BaseEntity, K extends keyof E = never>(
    this: EntityManager,
    entityTarget: EntityTarget<E>,
    findOptions: Omit<FindOneOptions<E>, 'relations'> 
        & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
): Promise<IncludeRelations<E, K> | null> {
  const entity = await this.findOne<E>(entityTarget, {
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  });

  return entity ? asIncludeRelations(entity, findOptions.relations) : null;
}

export async function findOneOrFailIncludeRelations_EntityManager<E extends BaseEntity, K extends keyof E = never>(
    this: EntityManager,
    entityTarget: EntityTarget<E>,
    findOptions: Omit<FindOneOptions<E>, 'relations'> 
        & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
): Promise<IncludeRelations<E, K>> {
  const entity = await this.findOneOrFail<E>(entityTarget, {
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  });

  return asIncludeRelations(entity, findOptions.relations);
}

function buildFindOptionsRelations<E extends BaseEntity, K extends keyof E = never>(
    relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>> | K[]
) {
    const findOptionsRelations: FindOptionsRelations<E> = {};

    if (Array.isArray(relations)) {
        for (const key of relations) {
            findOptionsRelations[key] = true as any;
        }
    } else {
        for (const key in relations) {
            findOptionsRelations[key] = relations[key] as any;
        }
    }

    return findOptionsRelations;
}

function asIncludeRelations<E extends BaseEntity, K extends keyof E = never>(
    entity: E,
    relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>> | K[]
) {
    if (Array.isArray(relations)) {
        assertHasRelations(entity, relations);
    } else {
        assertHasRelations(
            entity, 
            Object.entries(relations ?? {})
                .filter(([_, x]) => !!x)
                .map(([r, _]) => r) as Array<K>
        );
    }

    return entity;
}

function assertHasRelations<E extends BaseEntity, K extends keyof E = never>(
    entity: E,
    relations: K[]
): asserts entity is IncludeRelations<E,K> {
    for (const subKey of relations) {
        if (entity[subKey] === undefined) {
            throw new Error(`Relation ${subKey.toString()} not present in Entity`);
        }
    }
}