import { createLogger } from "@zuzjs/logger";
import { APP_NAME } from "./config";

const log = createLogger({
    name: APP_NAME,
    tags: [
        { label: `auth`, color: `cyan` }
    ]
})

export default log