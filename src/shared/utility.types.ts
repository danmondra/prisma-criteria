type Without<T, U> = (T | U) extends object
  ? { [K in Exclude<keyof T, keyof U>]?: never }
  : never

export type XOR<T, U> = (T | U) extends object
  ? Without<T, U> & U | Without<U, T> & T
  : T | U

export type ObjectValues<
  T extends object,
  NestedObjectProp extends keyof T | undefined = undefined
> =
  NestedObjectProp extends string
    ? T[NestedObjectProp][keyof T[NestedObjectProp]]
    : T[keyof T]

export type Prettify<T extends Object> = {
  [k in keyof T]: T[k]
} & {}
