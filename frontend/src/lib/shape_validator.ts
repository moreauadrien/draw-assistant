import { z } from "zod";

const PointSchema = z.object({
    x: z.number(),
    y: z.number(),
});

const CircleSchema = z.object({
    type: z.literal("circle"),
    center: PointSchema,
    radius: z.number().positive(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

const RectangleSchema = z.object({
    type: z.literal("rectangle"),
    from: PointSchema,
    to: PointSchema,
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

const PolygonSchema = z.object({
    type: z.literal("polygon"),
    vertices: z.array(PointSchema).min(3),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const ShapeSchema = z.union([CircleSchema, RectangleSchema, PolygonSchema]);
export const ShapesSchema = z.array(ShapeSchema);

export type Raw_Shape = z.infer<typeof ShapeSchema>;
