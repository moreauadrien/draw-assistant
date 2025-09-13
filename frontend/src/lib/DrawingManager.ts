import { ShapesSchema, type Raw_Shape } from "./shape_validator";

abstract class Shape {
    abstract draw(ctx: CanvasRenderingContext2D): void;
}

type Point = {
    x: number;
    y: number;
}

function distance(a: Point, b: Point) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

class Rectangle extends Shape {
    readonly type = "rectangle"
    readonly color: string;
    readonly top_left: Point;
    private bottom_right: Point

    constructor(color: string, from: Point, to: Point) {
        super();

        this.top_left = from;
        this.bottom_right = to;
        this.color = color;
    }

    setTo(to: Point) {
        this.bottom_right = to;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;

        const baseX = Math.min(this.top_left.x, this.bottom_right.x);
        const baseY = Math.min(this.top_left.y, this.bottom_right.y);
        const width = Math.abs(this.top_left.x - this.bottom_right.x);
        const height = Math.abs(this.top_left.y - this.bottom_right.y);

        ctx.fillRect(baseX, baseY, width, height);
    }
}

class Circle extends Shape {
    readonly type = "circle"
    readonly color: string;
    readonly center: Point;
    private radius: number;

    constructor(color: string, center: Point, radius: number) {
        super();
        this.center = center;
        this.radius = radius;
        this.color = color;
    }

    setRadius(radius: number) {
        this.radius = radius;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class Polygon extends Shape {
    readonly type = "polygon"
    readonly color: string;
    private vertices: Point[];

    constructor(color: string, vertices: Point[]) {
        if (vertices.length === 0) {
            throw new Error("Unable to create a polygon without vertices");
        }

        super();
        this.color = color;
        this.vertices = vertices;
    }

    addVertex(p: Point) {
        this.vertices.push(p)
    }

    popVertex() {
        this.vertices.pop()
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;

        const from = this.vertices[0];
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        for (const v of this.vertices) {
            ctx.lineTo(v.x, v.y);
        }

        ctx.closePath()
        ctx.fill();
        ctx.stroke();
    }
}


export type Tool = "rectangle" | "circle" | "polygon" | null

export const colors = [
    { name: "Noir", value: "#000000", class: "bg-black" },
    { name: "Blanc", value: "#ffffff", class: "bg-white" },
    { name: "Rouge", value: "#ef4444", class: "bg-red-500" },
    { name: "Vert", value: "#22c55e", class: "bg-green-500" },
    { name: "Bleu", value: "#3b82f6", class: "bg-blue-500" },
    { name: "Jaune", value: "#eab308", class: "bg-yellow-500" },
    { name: "Violet", value: "#a855f7", class: "bg-purple-500" },
    { name: "Cyan", value: "#06b6d4", class: "bg-cyan-500" },
    { name: "Orange", value: "#f97316", class: "bg-orange-500" },
    { name: "Rose", value: "#ec4899", class: "bg-pink-500" },
    { name: "Indigo", value: "#6366f1", class: "bg-indigo-500" },
    { name: "Emeraude", value: "#10b981", class: "bg-emerald-500" },
    { name: "Gris", value: "#6b7280", class: "bg-gray-500" },
]

export default class DrawingManager {
    private canvas: HTMLCanvasElement | undefined
    private ctx: CanvasRenderingContext2D | undefined
    private activeTool: Tool | null
    private selectedColor: string


    private shapes: Shape[];

    private tempShape: Shape | null;

    constructor() {
        this.activeTool = null;
        this.selectedColor = "#000000";
        this.shapes = [];
        this.tempShape = null;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
        this.draw = this.draw.bind(this);
        this.resizeCanvas = this.resizeCanvas.bind(this);
    }

    setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas

        const ctx = canvas.getContext("2d");
        if (ctx === null) {
            throw new Error('Context "2d" is not supported');
        }

        this.ctx = ctx;


        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("contextmenu", this.onContextMenu);
        window.addEventListener("resize", this.resizeCanvas);

        this.resizeCanvas()
        window.requestAnimationFrame(this.draw);
    }

    private updateTempShape(e: MouseEvent) {
        if (this.tempShape === null) return;

        let newShape: Shape | null = null;
        let final = false;

        const p = { x: e.x, y: e.y };

        if (this.tempShape instanceof Rectangle) {
            newShape = this.tempShape;
            if (e.type === "mousemove") {
                this.tempShape.setTo(p);
            } else if ((e.type === "mouseup") && (e.button === 0)) {
                this.tempShape.setTo(p);
                final = true;
            }

        } else if (this.tempShape instanceof Circle) {
            const radius = Math.floor(distance(this.tempShape.center, p));
            newShape = this.tempShape;

            if (e.type === "mousemove") {
                this.tempShape.setRadius(radius)
            } else if ((e.type === "mouseup") && (e.button === 0)) {
                this.tempShape.setRadius(radius)
                final = true;
            }
        } else if (this.tempShape instanceof Polygon) {
            newShape = this.tempShape;

            if (e.type === "mousemove") {
                this.tempShape.popVertex();
                this.tempShape.addVertex(p);
            } else if ((e.type === "mouseup") && (e.button === 0)) {
                this.tempShape.popVertex();
                this.tempShape.addVertex(p);
                this.tempShape.addVertex(p);
            } else if ((e.type === "mouseup") && (e.button === 2)) {
                this.tempShape.popVertex();
                this.tempShape.addVertex(p);
                final = true;
            }
        }


        if (newShape !== null) {
            if (final) {
                this.tempShape = null;
                this.shapes.push(newShape);
            } else {
                this.tempShape = newShape;
            }
        }
    }

    private onMouseDown(e: MouseEvent) {
        const p = { x: e.x, y: e.y };

        if ((this.tempShape === null) && (e.button === 0)) {
            if (this.activeTool === "polygon") {
                this.tempShape = new Polygon(this.selectedColor, [p, p]);
            } else if (this.activeTool === "circle") {
                this.tempShape = new Circle(this.selectedColor, p, 0);
            } else if (this.activeTool === "rectangle") {
                this.tempShape = new Rectangle(this.selectedColor, p, p);
            }
        } else {
            this.updateTempShape(e)
        }
    }

    private onMouseUp(e: MouseEvent) {
        this.updateTempShape(e);
    }

    private onMouseMove(e: MouseEvent) {
        this.updateTempShape(e)
    }

    private onContextMenu(e: MouseEvent) {
        e.preventDefault()
    }

    async sendPrompt(prompt: string) {
        if (this.canvas === undefined) return;
        if (prompt.trim().length === 0) return

        const response = await fetch("/api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: prompt,
                width: this.canvas.width,
                height: this.canvas.height,
                current_canvas: JSON.stringify(this.shapes)
            }),
        });

        const resp_json = await response.json()

        try {
            const shapes: Raw_Shape[] = ShapesSchema.parse(resp_json);
            this.loadJsonShapes(shapes)
        } catch (e) {
            console.error("Erreur de validation des 'shapes':", e);
        }

    }

    private loadJsonShapes(shapes: Raw_Shape[]) {
        this.shapes = []

        for (const s of shapes) {
            if (s.type === "rectangle") {
                if ("bottom_right" in s) {
                    this.shapes.push(new Rectangle(s.color, s.top_left, s.bottom_right))
                } else {
                    this.shapes.push(new Rectangle(s.color, s.top_left, { x: s.top_left.x + s.width, y: s.top_left.y + s.height }))
                }
            } else if (s.type === "circle") {
                this.shapes.push(new Circle(s.color, s.center, s.radius))
            } else if (s.type === "polygon") {
                this.shapes.push(new Polygon(s.color, s.vertices))
            }
        }
    }

    setActiveTool(tool: Tool) {
        this.activeTool = tool;
    }

    setSelectedColor(color: string) {
        this.selectedColor = color
    }

    clearCanvas() {
        this.shapes = [];
    }

    draw() {
        if (this.ctx === undefined || this.canvas === undefined) return;


        const { width: cW, height: cH } = this.canvas;
        this.ctx.clearRect(0, 0, cW, cH);


        for (const s of this.shapes) {
            s.draw(this.ctx);
        }

        if (this.tempShape !== null) {
            this.tempShape.draw(this.ctx);
        }

        window.requestAnimationFrame(this.draw);
    }

    private resizeCanvas() {
        if (this.canvas === undefined) return
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}
