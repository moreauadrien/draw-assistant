import { z } from "zod";

const PointSchema = z.object({
    x: z.number(),
    y: z.number(),
});

const CircleSchema = z.object({
    type: z.literal("circle"),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    center: PointSchema,
    radius: z.number().positive(),
});

const RectangleWithWH = z.object({
    type: z.literal("rectangle"),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    top_left: PointSchema,
    width: z.number().positive(),
    height: z.number().positive(),
});

const RectangleWithBR = z.object({
    type: z.literal("rectangle"),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    top_left: PointSchema,
    bottom_right: PointSchema,
});

const RectangleSchema = z.union([RectangleWithWH, RectangleWithBR]);

const PolygonSchema = z.object({
    type: z.literal("polygon"),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    vertices: z.array(PointSchema).min(3),
});

export const ShapeSchema = z.union([CircleSchema, RectangleSchema, PolygonSchema]);
export const ShapesSchema = z.array(ShapeSchema);

export type Raw_Shape = z.infer<typeof ShapeSchema>;
