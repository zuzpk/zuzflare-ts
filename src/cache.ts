import { PubSub } from "@zuzjs/core";

export const pubsub = new PubSub({
    prefixOnEmit: true
})