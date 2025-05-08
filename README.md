# typeorm-helpers
Utility type augmentations for typeorm

### Make

A static function added to all types which extend `BaseEntity`, providing enforcement of property optionality.

Behaves evvectively the same as `BaseEntity.create({...})` except that `create` allows all properties to be optional.

#### Usage: 

Basic usage:

```
import { BaseEntity } from "typeorm-helpers";

class TestEntityNoId extends BaseEntity {
    requiredProp!: string
    optionalProp?: string
}

// valid
const testEntity1 = TestEntityNoId.make({requiredProp: 'req', optionalProp: 'opt'})
const testEntity2 = TestEntityNoId.make({requiredProp: 'req'})

// compiler error - make enforces required properties
// const testEntity3 = TestEntityNoId.make({})

// valid - create treats all properties as optional
const createdEntity = TestEntityNoId.create({})
```

The `id` property is treated specially, in that even a required `id` will be optional in the `make` params.

This is because, in many/most cases, the `id` is auto-generated on insert. Leaving it optional allows for cases of client-generated IDs.
```
class TestEntityStringId extends BaseEntity {
    id!: string
    requiredProp!: string
    optionalProp?: string
}

// valid
const testEntity4 = TestEntityStringId.make({id: 'id', requiredProp: 'req', optionalProp: 'opt'})
const testEntity5 = TestEntityStringId.make({id: 'id', requiredProp: 'req'})

// valid - id does not need to be set, since it is DB-generated in most cases
const testEntity6 = TestEntityStringId.make({requiredProp: 'req'})

class TestEntityIntId extends BaseEntity {
    id!: number
    requiredProp!: string
    optionalProp?: string
}

// valid
const testEntity7 = TestEntityIntId.make({id: 1, requiredProp: 'req', optionalProp: 'opt'})
const testEntity8 = TestEntityIntId.make({id: 2, requiredProp: 'req'})
const testEntity9 = TestEntityIntId.make({requiredProp: 'req'})
```
