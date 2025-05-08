import {
    BaseEntity, 
    EntityManager, 
    EntityTarget, 
    FindManyOptions, 
    FindOneOptions, 
    FindOptionsRelations, 
    FindOptionsRelationsProperty
} from 'typeorm'

// replace the specified join relations (assumed optional in the Entity) with required ones
export type IncludeRelations<E extends BaseEntity, K extends keyof E = never> = E & {[Key in K]-?: E[Key]}
 
declare module 'typeorm' {
    export interface BaseEntity {
        find_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
            this: {new (): E;} & typeof BaseEntity,
            findOptions: Omit<FindManyOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
          ): Promise<IncludeRelations<E, K>[]>
        findAndCount_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
            this: {new (): E;} & typeof BaseEntity,
            findOptions: Omit<FindManyOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
          ): Promise<[IncludeRelations<E, K>[], number]>
        findOne_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
            this: {new (): E;} & typeof BaseEntity,
            findOptions: Omit<FindOneOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
          ): Promise<IncludeRelations<E, K> | null>
        findOneOrFail_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
            this: {new (): E;} & typeof BaseEntity,
            findOptions: Omit<FindOneOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
          ): Promise<IncludeRelations<E, K>>
    }

    export interface EntityManager {
        find_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
            entityTarget: EntityTarget<E>,
            findOptions: Omit<FindManyOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
          ): Promise<IncludeRelations<E, K>[]>
        findAndCount_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
            entityTarget: EntityTarget<E>,
            findOptions: Omit<FindManyOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>} 
          ): Promise<[IncludeRelations<E, K>[], number]>
        findOne_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
            entityTarget: EntityTarget<E>,
            findOptions: Omit<FindOneOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
          ): Promise<IncludeRelations<E, K> | null>
        findOneOrFail_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
            entityTarget: EntityTarget<E>,
            findOptions: Omit<FindOneOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
          ): Promise<IncludeRelations<E, K>>
    }
}

BaseEntity.prototype.find_IncludeRelations = find2_IncludeRelations
export async function find2_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
    this: {new (): E;} & typeof BaseEntity,
    findOptions: Omit<FindManyOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
  ): Promise<IncludeRelations<E, K>[]> {
  const entities = await this.find({
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  })

  return entities.map((e) => asIncludeRelations(e, findOptions.relations))
}

EntityManager.prototype.find_IncludeRelations = find_IncludeRelations
export async function find_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
    this: EntityManager,
    entityTarget: EntityTarget<E>,
    findOptions: Omit<FindManyOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
): Promise<IncludeRelations<E, K>[]> {
  const entities = await this.find<E>(entityTarget, {
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  })

  return entities.map((e) => asIncludeRelations(e, findOptions.relations))
}

BaseEntity.prototype.findAndCount_IncludeRelations = findAndCount2_IncludeRelations
export async function findAndCount2_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
    this: {new (): E;} & typeof BaseEntity,
    findOptions: Omit<FindManyOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
  ): Promise<[IncludeRelations<E, K>[], number]> {
  const entities = await this.findAndCount({
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  })

  return [entities[0].map((e) => asIncludeRelations(e, findOptions.relations)), entities[1]]
}

EntityManager.prototype.findAndCount_IncludeRelations = findAndCount_IncludeRelations
export async function findAndCount_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
    this: EntityManager,
    entityTarget: EntityTarget<E>,
    findOptions: Omit<FindManyOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
): Promise<[IncludeRelations<E, K>[], number]> {
  const entities = await this.findAndCount<E>(entityTarget, {
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  })

  return [entities[0].map((e) => asIncludeRelations(e, findOptions.relations)), entities[1]]
}

BaseEntity.prototype.findOne_IncludeRelations = findOne2_IncludeRelations
export async function findOne2_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
    this: {new (): E;} & typeof BaseEntity,
    findOptions: Omit<FindOneOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
  ): Promise<IncludeRelations<E, K> | null> {
  const entity = await this.findOne({
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  })

  return entity ? asIncludeRelations(entity, findOptions.relations) : null
}

EntityManager.prototype.findOne_IncludeRelations = findOne_IncludeRelations
export async function findOne_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
    this: EntityManager,
    entityTarget: EntityTarget<E>,
    findOptions: Omit<FindOneOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
): Promise<IncludeRelations<E, K> | null> {
  const entity = await this.findOne<E>(entityTarget, {
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  })

  return entity ? asIncludeRelations(entity, findOptions.relations) : null
}

BaseEntity.prototype.findOneOrFail_IncludeRelations = findOneOrFail2_IncludeRelations as any
export async function findOneOrFail2_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
    this: {new (): E;} & typeof BaseEntity,
    findOptions: Omit<FindOneOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
  ): Promise<IncludeRelations<E, K>> {
  const entity = await this.findOneOrFail({
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  })

  return asIncludeRelations(entity, findOptions.relations)
}

EntityManager.prototype.findOneOrFail_IncludeRelations = findOneOrFail_IncludeRelations
export async function findOneOrFail_IncludeRelations<E extends BaseEntity, K extends keyof E = never>(
    this: EntityManager,
    entityTarget: EntityTarget<E>,
    findOptions: Omit<FindOneOptions<E>, 'relations'> & {relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>>}
): Promise<IncludeRelations<E, K>> {
  const entity = await this.findOneOrFail<E>(entityTarget, {
    ...findOptions,
    relations: buildFindOptionsRelations(findOptions.relations)
  })

  return asIncludeRelations(entity, findOptions.relations)
}

function buildFindOptionsRelations<E extends BaseEntity, K extends keyof E = never>(
    relations?: Record<K, FindOptionsRelationsProperty<NonNullable<E[K]>>> | K[]
) {
    const findOptionsRelations: FindOptionsRelations<E> = {}

    if (Array.isArray(relations)) {
        for (const key of relations) {
            findOptionsRelations[key] = true as any
        }
    } else {
        for (const key in relations) {
            findOptionsRelations[key] = relations[key] as any
        }
    }

    return findOptionsRelations
}

function asIncludeRelations<E extends BaseEntity, K extends keyof E = never>(
    entity: E,
    relations?: Record<K, any> | K[]
) {
    if (Array.isArray(relations)) {
        assertHasRelations(entity, relations)
    } else {

        assertHasRelations(
            entity, 
            Object.entries(relations ?? {})
                .filter(([_, x]) => !!x)
                .map(([r, _]) => r) as Array<K>
        )
    }
    return entity
}

function assertHasRelations<E extends BaseEntity, K extends keyof E = never>(
    entity: E,
    relations: K[]
): asserts entity is IncludeRelations<E,K> {
    for (const subKey of relations) {
        if (entity[subKey] === undefined) {
            throw new Error(`Relation ${subKey.toString()} not present in Entity`)
        }
    }
}