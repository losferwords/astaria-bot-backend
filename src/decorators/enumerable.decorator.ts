export function enumerable(value: boolean) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}
