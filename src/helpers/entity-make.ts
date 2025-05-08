import {BaseEntity} from 'typeorm';

// Omit 'id' and any BaseEntity methods to isolate the entity properties
// Make 'id' optional for cases where not DB-generated
export type CtorArgs<T> = Omit<T, 'id' | keyof BaseEntity> & {id?: 'id' extends keyof T ? T['id'] : never};

// This is similar to BaseEntity.create but enforces required fields
function _make<T extends BaseEntity>(this: {
    new (): T;
} & typeof BaseEntity, args: CtorArgs<T>) { 
    const obj = new this();
    Object.assign(obj, args);
    return obj as T;
}

declare module 'typeorm' {
    export namespace BaseEntity {
        export let make: typeof _make;
    }
}

BaseEntity.make = _make;
