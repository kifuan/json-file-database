import { connect, createObjectFile, Database, DatabaseOptions, RequiredCollectionOptions } from '../src'

export function sleep(delay: number) : Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, delay)
    })
}

export type Obj = {
    id: number
    name: string
}

export const COMPARATOR = (o1: Pick<Obj, 'id'>, o2: Pick<Obj, 'id'>) => o2.id - o1.id

export const OBJS_ARRAY = [
    { id: 123, name: 'San Zhang' },
    { id: 456, name: 'Si Li' },
    { id: 789, name: 'Wu Wang' }
].sort(COMPARATOR)

export function connectDatabase(options?: Partial<DatabaseOptions>) {
    options ||= {}
    return connect({
        file: createObjectFile({ objs: OBJS_ARRAY }),
        ...options
    })
}

export function getObjs(db: Database, options?: Partial<RequiredCollectionOptions<Obj, 'id'>>) {
    options ||= {}
    return db<Obj, 'id'>({
        name: 'objs',
        comparator: COMPARATOR,
        ...options
    })
}
