import {BaseEntity} from 'typeorm'

// omit ID and any BaseEntity methods to isolate the entity properties
export type CtorArgs<T> = Omit<T, 'id' | keyof BaseEntity>

// This is similar to BaseEntity.create but enforces required fields
function _make<T extends BaseEntity>(this: {
    new (): T;
} & typeof BaseEntity, args: CtorArgs<T>) { 
    const obj = new this()
    Object.assign(obj, args) 
    return obj as T
}

declare module 'typeorm' {
    export namespace BaseEntity {
        export let make: typeof _make
    }
}

BaseEntity.make = _make
