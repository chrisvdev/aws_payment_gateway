import { lambda } from "../lib/lambda.ts";
import { routes } from "./routes.ts";
import { productsGet } from "./handlers/products_get.ts";
import { purchasePatch } from "./handlers/purchase_patch.ts";
import { purchasePost } from "./handlers/purchase_post.ts";
import { purchaseGet } from "./handlers/purchase_get.ts";

const router = lambda.getRouter(routes);

router["/api/v1/operations/products"]["GET"] = productsGet;
router["/api/v1/operations/purchase"]["PATCH"] = purchasePatch;
router["/api/v1/operations/purchase"]["POST"] = purchasePost;
router["/api/v1/operations/purchase"]["GET"] = purchaseGet;

export const handler = lambda.RouterHandler(router);