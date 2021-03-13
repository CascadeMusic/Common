import { GroupMetadataKey } from "./Group";

export function group(name: string): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(GroupMetadataKey.GROUP_NAME, name, target);
  };
}

export function subscription(event: string): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (typeof descriptor.value !== "function") {
      throw new TypeError("The subscription decorator can only be called on methods.");
    }

    const subscriptions: Subscription[] = Reflect.getMetadata(GroupMetadataKey.SUBSCRIPTIONS, target.constructor) ?? [];
    subscriptions.push({ propertyKey, event, });

    Reflect.defineMetadata(GroupMetadataKey.SUBSCRIPTIONS, subscriptions, target.constructor);
  };
}

export interface Subscription {
  propertyKey: PropertyKey;
  event: string;
}
