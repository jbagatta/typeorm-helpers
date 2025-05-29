# typeorm-helpers
Utility type magic and helper augmentations for TypeORM

### IncludeRelations

TypeORM allows for joined querying using the functions `find`, `findOne`, `findOneOrFail`, and `findAndCount`. Best practice when defining joined relations on an entity class is to leave them optional, since the relations will not always be requested. The downside of this is that, when they *are* requested, typescript lacks the insight to determine that the relevant joined parameters are no longer optional.

The `IncludeRelations` typing fixes this behavior - joined entities requested as `relations` within the relevant `find*` queries have their optionality removed, which allows the code to skip pointless `if(entity)` checks and ugly `entity!.id` bang usage.

An object of type `IncludeRelations<EntityType, ...>` is a superset of the original `EntityType` type and can be used as such anywhere.

Consider the following entities:

```typescript
class OneToOneRelation extends BaseEntity {
    id!: string
    testEntityId!: string
    recursiveRelation?: RecursiveRelation
}

class RecursiveRelation extends BaseEntity {
    id!: string
    testEntityId!: string
}

class OneToOneNullableRelation extends BaseEntity {
    id!: string
    testEntityId!: string
}

class ManyToOneRelation extends BaseEntity {
    id!: string
    testEntityId!: string
}

class TestEntity extends BaseEntity {
    id!: string
    oneToOneRelation?: OneToOneRelation
    oneToOneNullableRelation?: OneToOneNullableRelation | null
    manyToOneRelations?: ManyToOneRelation[]
}
```

The standard behavior for a `find` query is to load no relations. This behavior is preserved in the `IncludeRelations` functions:

```typescript
// No relations, type = IncludeRelations<TestEntity, never>
const testEntity1 = await TestEntity.findOneOrFailIncludeRelations({where: {id: 'id'}})

// undefined
testEntity1.oneToOneRelation

// undefined
testEntity1.oneToOneNullableRelation

// undefined
testEntity1.manyToOneRelations
```

However, when relations are requested, the typing on the returned object is modified to match.

For a non-optional one-to-one relation, the type is now explicit:

```typescript
// Required one to one relation, type = IncludeRelations<TestEntity, "oneToOneRelation">
const testEntity2 = await TestEntity.findOneOrFailIncludeRelations({where: {id: 'id'}, relations: {oneToOneRelation: true}})

// OneToOneRelation
testEntity2.oneToOneRelation
```

For an optional one-to-one relation, nullability is kept to account for nonexistent relations, but optionality is removed:

```typescript
// Nullable one to one relation, type = IncludeRelations<TestEntity, "oneToOneNullableRelation">
const testEntity3 = await TestEntity.findOneOrFailIncludeRelations({where: {id: 'id'}, relations: {oneToOneNullableRelation: true}})

// OneToOneNullableRelation | null - relation not guaranteed to exist
testEntity3.oneToOneNullableRelation
```

For a many-to-one relation, the array type is no longer optional (though the array can of course be empty):

```typescript
// Many to one relations, type = IncludeRelations<TestEntity, "manyToOneRelations">
const testEntity4 = await TestEntity.findOneOrFailIncludeRelations({where: {id: 'id'}, relations: {manyToOneRelations: true}})

// ManyToOneRelation[]
testEntity4.manyToOneRelations
```

Recursive relations can be loaded as well, although it is important to note that `IncludeRelations` typing is NOT recursive - the type magic does not extend past the first layer of joining. *(TODO - make this work recursively in the future)*

```typescript
// type = IncludeRelations<TestEntity, "oneToOneRelation">
const testEntity5 = await TestEntity.findOneOrFailIncludeRelations({where: {id: 'id'}, relations: {oneToOneRelation: {recursiveRelation: true}}})

// OneToOneRelation
testEntity5.oneToOneRelation

// RecursiveRelation | undefined 
// recursive relation is still loaded, but the typing is unchanged
testEntity5.oneToOneRelation.recursiveRelation
```

#### Supported Queries

The library provides `IncludeRelations` functions for all `BaseEntity.find*` operations in which relations are supported:

```typescript
// IncludeRelations<TestEntity, "oneToOneNullableRelation" | "oneToOneRelation"> | null
const a = TestEntity.findOneIncludeRelations({
    where: {id: 'a'}, relations: {oneToOneNullableRelation: true, oneToOneRelation: true}
})

// IncludeRelations<TestEntity, "oneToOneNullableRelation" | "oneToOneRelation">
const b = TestEntity.findOneOrFailIncludeRelations({
    where: {id: 'b'}, relations: {oneToOneNullableRelation: true, oneToOneRelation: true}
})

// IncludeRelations<TestEntity, "oneToOneNullableRelation" | "oneToOneRelation">[]
const c = TestEntity.findIncludeRelations({
    where: {id: 'c'}, relations: {oneToOneNullableRelation: true, oneToOneRelation: true}
})

// [IncludeRelations<TestEntity, "oneToOneNullableRelation" | "oneToOneRelation">[], number]
const d = TestEntity.findAndCountIncludeRelations({
    where: {id: 'd'}, relations: {oneToOneNullableRelation: true, oneToOneRelation: true}
})
```

as well as the equivalent operations on `EntityManager` (e.g. transactions):

```typescript
async function loadResources(db: DataSource, id: string) {
  await db.transaction(async (txn) => {
    // IncludeRelations<TestEntity, "oneToOneNullableRelation" | "oneToOneRelation"> | null
    const a = txn.findOneIncludeRelations(TestEntity, {
        where: {id}, relations: {oneToOneNullableRelation: true, oneToOneRelation: true}
    })

    // IncludeRelations<TestEntity, "oneToOneNullableRelation" | "oneToOneRelation">
    const b = txn.findOneOrFailIncludeRelations(TestEntity, {
        where: {id}, relations: {oneToOneNullableRelation: true, oneToOneRelation: true}
    })

    // IncludeRelations<TestEntity, "oneToOneNullableRelation" | "oneToOneRelation">[]
    const c = txn.findIncludeRelations(TestEntity, {
        where: {id}, relations: {oneToOneNullableRelation: true, oneToOneRelation: true}
    })

    // [IncludeRelations<TestEntity, "oneToOneNullableRelation" | "oneToOneRelation">[], number]
    const d = txn.findAndCountIncludeRelations(TestEntity, {
        where: {id}, relations: {oneToOneNullableRelation: true, oneToOneRelation: true}
    })
  })
}
```


## Make

A static function added to all types which extend `BaseEntity`.

Behaves effectively the same as `BaseEntity.create({...})` except that `create` allows all properties to be optional, whereas `make` provides enforcement of property optionality, and will yield compilation errors if all required parameters on the entity are not provided.

#### Usage: 

```typescript
import { BaseEntity } from "typeorm-helpers";

class TestEntityNoId extends BaseEntity {
    requiredProp!: string
    optionalProp?: string
}

// valid
const testEntity1 = TestEntityNoId.make({requiredProp: 'req', optionalProp: 'opt'});

const testEntity2 = TestEntityNoId.make({requiredProp: 'req'});

// compiler error - make enforces required properties
// const testEntity3 = TestEntityNoId.make({});

// valid - create treats all properties as optional
const createdEntity = TestEntityNoId.create({});
```

#### ID

The `id` property is treated as a special case, in that even a required `id` will be optional in the `make` params.

This is because, in many/most cases, the `id` is auto-generated on insert by the database. Leaving it optional allows for setting in cases of client-generated IDs without requiring it.

```typescript
class TestEntityStringId extends BaseEntity {
    id!: string
    requiredProp!: string
    optionalProp?: string
}

// valid
const testEntity4 = TestEntityStringId.make({id: 'id', requiredProp: 'req', optionalProp: 'opt'});

const testEntity5 = TestEntityStringId.make({id: 'id', requiredProp: 'req'});

// valid - id does not need to be set, since it is DB-generated in most cases
const testEntity6 = TestEntityStringId.make({requiredProp: 'req'});

class TestEntityIntId extends BaseEntity {
    id!: number
    requiredProp!: string
    optionalProp?: string
}

// valid
const testEntity7 = TestEntityIntId.make({id: 1, requiredProp: 'req', optionalProp: 'opt'});

const testEntity8 = TestEntityIntId.make({id: 2, requiredProp: 'req'});

const testEntity9 = TestEntityIntId.make({requiredProp: 'req'});
```
