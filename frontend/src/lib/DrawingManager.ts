abstract class Shape {
    abstract draw(ctx: CanvasRenderingContext2D): void;
}

/*
class Point {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    distance(p: Point) {
        return Math.sqrt(Math.pow(this.x - p.x, 2) + Math.pow(this.y - p.y, 2))
    }
}
*/

type Point = {
    x: number;
    y: number;
}

/*
function distance(xA: number, yA: number, xB: number, yB: number) {
    return Math.sqrt(Math.pow(xA - xB, 2) + Math.pow(yA - yB, 2))
}
*/


class Rectangle extends Shape {
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private color: string;

    constructor(color: string, fX: number, fY: number, tX: number, tY: number) {
        super();

        const baseX = Math.min(fX, tX);
        const baseY = Math.min(fY, tY);
        const width = Math.abs(fX - tX);
        const height = Math.abs(fY - tY);

        this.x = baseX;
        this.y = baseY;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Circle extends Shape {
    private x: number;
    private y: number;
    private radius: number;
    private color: string;

    constructor(color: string, x: number, y: number, radius: number) {
        super();
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class Polygon extends Shape {
    private vertices: Point[];
    private color: string;

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
    private isDrawing: boolean
    private activeTool: Tool | null
    private selectedColor: string

    private fromCoords: [number, number] | null;
    private toCoords: [number, number] | null;

    private shapes: Shape[];

    private tempPolygon: Polygon | null;

    constructor() {
        this.isDrawing = false;
        this.activeTool = null;
        this.selectedColor = "#000000";
        this.fromCoords = null;
        this.toCoords = null;
        this.shapes = [];
        this.tempPolygon = null;

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

    private onContextMenu(e: MouseEvent) {
        e.preventDefault()

        console.log(this.isDrawing)
        console.log(this.activeTool)

        if (this.isDrawing && (this.activeTool === "polygon")) {
            this.tempPolygon?.popVertex();
            this.tempPolygon?.addVertex({ x: e.x, y: e.y })
            if (this.tempPolygon !== null) {
                this.shapes.push(this.tempPolygon);
            }
            this.tempPolygon = null;
            this.isDrawing = false;
        }
    }

    private onMouseDown(e: MouseEvent) {
        if (this.activeTool === null) return;

        if (this.isDrawing === false) {
            this.isDrawing = true;

            if (this.activeTool !== "polygon") {
                this.fromCoords = [e.x, e.y]
                this.toCoords = this.fromCoords
            } else {
                this.tempPolygon = new Polygon(this.selectedColor, [{ x: e.x, y: e.y }, { x: e.x, y: e.y }]);
            }
        } else {
            if (this.activeTool === "polygon") {
                this.tempPolygon?.addVertex({ x: e.x, y: e.y })
            }
        }
    }

    private onMouseUp() {
        if (this.fromCoords !== null && this.toCoords != null) {
            const [fX, fY] = this.fromCoords;
            const [tX, tY] = this.toCoords;


            if (this.activeTool === "rectangle") {
                this.shapes.push(new Rectangle(this.selectedColor, fX, fY, tX, tY))
            }

            if (this.activeTool === "circle") {
                const centerX = Math.floor(Math.abs(fX + tX) / 2);
                const centerY = Math.floor(Math.abs(fY + tY) / 2);
                const radius = Math.floor(Math.abs(fX - tX) / 2);

                this.shapes.push(new Circle(this.selectedColor, centerX, centerY, radius));
            }



            this.isDrawing = false;
            this.fromCoords = null;
            this.toCoords = null;
        }
    }

    private onMouseMove(e: MouseEvent) {
        if (this.isDrawing === true) {
            if (this.activeTool === "polygon") {
                this.tempPolygon?.popVertex();
                this.tempPolygon?.addVertex({ x: e.x, y: e.y })
            } else {
                this.toCoords = [e.x, e.y]
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

        if (this.tempPolygon !== null) {
            this.tempPolygon.draw(this.ctx)
        }

        if (this.fromCoords !== null && this.toCoords != null) {
            let tempShape;

            if (this.activeTool === "rectangle") {
                const [fX, fY] = this.fromCoords;
                const [tX, tY] = this.toCoords;

                tempShape = new Rectangle(this.selectedColor, fX, fY, tX, tY);
            }

            if (this.activeTool === "circle") {
                const [fX, fY] = this.fromCoords;
                const [tX, tY] = this.toCoords;

                const centerX = Math.floor(Math.abs(fX + tX) / 2);
                const centerY = Math.floor(Math.abs(fY + tY) / 2);
                const radius = Math.floor(Math.abs(fX - tX) / 2);

                tempShape = new Circle(this.selectedColor, centerX, centerY, radius);
            }

            if (tempShape !== undefined) {
                tempShape.draw(this.ctx);
            }
        }
        window.requestAnimationFrame(this.draw);
    }

    private resizeCanvas() {
        if (this.canvas === undefined) return
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}
