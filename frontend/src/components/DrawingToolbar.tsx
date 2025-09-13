import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import type DrawingManager from "@/lib/DrawingManager"
import { colors, type Tool } from "@/lib/DrawingManager"
import { Square, Circle, Hexagon as Polygon, Trash2, Palette } from "lucide-react"
import { useState } from "react"

type DrawingToolbarProps = {
  dm: DrawingManager
}

export function DrawingToolbar({ dm }: DrawingToolbarProps) {

  const [activeTool, setActiveTool] = useState<Tool>(null)
  const [selectedColor, setSelectedColor] = useState("#000000")

  function handleToolSelect(tool: Tool) {
    const newTool = activeTool === tool ? null : tool
    dm.setActiveTool(newTool)
    setActiveTool(newTool)
  }

  function handleColorSelect(color: string) {
    dm.setSelectedColor(color);
    setSelectedColor(color);
  }

  const handleDelete = () => {
    dm.clearCanvas();
  }

  return (
    <Card className="p-4 shadow-lg border-border/50 bg-card/95 backdrop-blur-sm">
      <div className="flex items-center gap-2">

        {/* Tool selector*/}
        <div className="flex items-center gap-1">
          <Button
            variant={activeTool === "rectangle" ? "default" : "outline"}
            size="sm"
            onClick={() => handleToolSelect("rectangle")}
            className="h-10 w-10 p-0 transition-all duration-200 hover:scale-105"
            title="Outil Rectangle"
          >
            <Square className="h-4 w-4" />
          </Button>

          <Button
            variant={activeTool === "circle" ? "default" : "outline"}
            size="sm"
            onClick={() => handleToolSelect("circle")}
            className="h-10 w-10 p-0 transition-all duration-200 hover:scale-105"
            title="Outil Cercle"
          >
            <Circle className="h-4 w-4" />
          </Button>

          <Button
            variant={activeTool === "polygon" ? "default" : "outline"}
            size="sm"
            onClick={() => handleToolSelect("polygon")}
            className="h-10 w-10 p-0 transition-all duration-200 hover:scale-105"
            title="Outil Polygone"
          >
            <Polygon className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Color selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-16 p-1 transition-all duration-200 hover:scale-105 bg-transparent"
              title="Sélecteur de couleur"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm border border-border" style={{ backgroundColor: selectedColor }} />
                <Palette className="h-3 w-3" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Choisir une couleur</h4>
              <div className="grid grid-cols-5 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorSelect(color.value)}
                    className={`w-8 h-8 rounded-md border-2 transition-all duration-200 hover:scale-110 ${color.class} ${selectedColor === color.value
                      ? "border-primary shadow-md ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                      }`}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Couleur personnalisée</label>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="w-full h-8 rounded border border-border cursor-pointer"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-8" />

        {/* Delete button */}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="h-10 w-10 p-0 transition-all duration-200 hover:scale-105"
          title="Supprimer le canvas"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {activeTool && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Outil actif: <span className="font-medium text-foreground capitalize">{activeTool}</span>
            {" • "}
            Couleur:{" "}
            <span
              className="inline-block w-3 h-3 rounded-sm border border-border ml-1 align-middle"
              style={{ backgroundColor: selectedColor }}
            />
          </p>

          {(activeTool === "polygon") && (
            <p className="text-xs text-muted-foreground">Effectue un clic droit pour terminer la forme</p>
          )}

        </div>
      )}
    </Card>
  )
}
