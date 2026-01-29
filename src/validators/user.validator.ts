import * as z from "zod";

export const updateUserSchema = z
  .object({
    body: z.object({
      fullName: z.string().optional(),
    }),
  })
  .refine(({ body }) => Object.keys(body).length > 0, {
    error: "Update body cannot be empty",
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
