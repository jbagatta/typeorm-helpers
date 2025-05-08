import {BaseEntity} from 'typeorm';

// Omit 'id' and any BaseEntity methods to isolate the entity properties
// Make 'id' optional for cases where not DB-generated
type _CtorArgs<T> = Omit<T, 'id' | keyof BaseEntity> & {id?: 'id' extends keyof T ? T['id'] : never};
export type CtorArgs<T> = 'id' extends keyof T ? _CtorArgs<T> : Omit<_CtorArgs<T>, 'id'>

// This is similar to BaseEntity.create but enforces required fields
export function _make<T extends BaseEntity>(this: {
    new (): T;
} & typeof BaseEntity, args: CtorArgs<T>) { 
    const obj = new this();
    Object.assign(obj, args);
    return obj as T;
}
