"use client";

import { motion } from "motion/react";
import { Frame, Hand, ImagePlus, MousePointer2, Redo2, SquarePen, Undo2, Workflow } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { CanvasCommands } from "../commands/useCanvasCommands";
import type { ToolMode } from "../tools/useToolMode";
import { ToolbarButton } from "./ToolbarButton";

export function Toolbar({ tool, commands: c }: { tool: ToolMode; commands: CanvasCommands }) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl border bg-card/90 p-1 shadow-lg backdrop-blur"
    >
      <ToolbarButton icon={MousePointer2} label="Select" shortcut="V" active={tool === "select"} onClick={c.selectTool} />
      <ToolbarButton icon={Hand} label="Hand" shortcut="H" active={tool === "hand"} onClick={c.handTool} />
      <Separator orientation="vertical" className="mx-1 !h-6" />
      <ToolbarButton icon={SquarePen} label="Text node" shortcut="N" onClick={() => c.addText()} />
      <ToolbarButton icon={Frame} label="Group" onClick={() => c.addGroup()} />
      <ToolbarButton icon={ImagePlus} label="Image" onClick={() => void c.addImages()} />
      <Separator orientation="vertical" className="mx-1 !h-6" />
      <ToolbarButton icon={Undo2} label="Undo" shortcut="Ctrl+Z" disabled={!c.canUndo} onClick={c.undo} />
      <ToolbarButton icon={Redo2} label="Redo" shortcut="Ctrl+Shift+Z" disabled={!c.canRedo} onClick={c.redo} />
      <Separator orientation="vertical" className="mx-1 !h-6" />
      <ToolbarButton icon={Workflow} label="Auto-layout" onClick={() => void c.autoLayout("RIGHT")} />
    </motion.div>
  );
}
