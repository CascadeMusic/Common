import { Amqp, AmqpResponseOptions } from "@spectacles/brokers";
import type { Subscription } from "./decorators";

export enum GroupMetadataKey {
  GROUP_NAME = "groupName",
  SUBSCRIPTIONS = "subscriptions"
}

export class Group {
  /**
   * The amqp broker for this group.
   */
  broker: Amqp<NodeJS.Dict<any>, NodeJS.Dict<any>>;

  constructor() {
    const group = Reflect.getMetadata(GroupMetadataKey.GROUP_NAME, this.constructor),
      subscriptions = Reflect.getMetadata(GroupMetadataKey.SUBSCRIPTIONS, this.constructor) as Subscription[];

    this.broker = new Amqp(group);
    this.broker.subscribe([ ...subscriptions.reduce((a, { event }) => a.add(event), new Set<string>()) ]);

    for (const subscription of subscriptions) {
      this.broker.on(subscription.event, (data: NodeJS.Dict<any>, options: AmqpResponseOptions) => {
        const fun = Reflect.get(this, subscription.propertyKey) as Function;
        Reflect.apply(fun, this, [ data, options ]);
      });
    }
  }
}
