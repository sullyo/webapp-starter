import { Hono } from "hono";

import { auth, getAuth, getUserId, requireAuth } from "@/pkg/middleware/clerk-auth";
import { postService } from "@/modules/posts";
import { zValidator } from "@/pkg/util/validator-wrapper";
import { postInsertSchema } from "@repo/db";

const postRoutes = new Hono()
  .use(auth())
  .get("/", async (c) => {
    const posts = await postService.getPosts();
    // This route means we can fetch user auth token if available, but its not required. Unauthorized users can still access this route.
    const auth = getAuth(c);

    /** Throw errors like this
     if (somethingWentWrong) {
       throw new HTTPException(401, { message: "Custom error message" });
     }
     */

    return c.json(posts);
  })
  .use(requireAuth)
  // Only authenticated users can create posts
  .post("/", zValidator("json", postInsertSchema), async (c) => {
    const insertPost = c.req.valid("json");
    const userId = getUserId(c);

    const newPost = await postService.createPost({ ...insertPost, userId });
    return c.json(newPost);
  });

export { postRoutes };
