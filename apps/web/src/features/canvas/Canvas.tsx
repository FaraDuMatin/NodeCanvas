"use client";

import { useCallback } from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  SelectionMode,
  type NodeChange,
} from "@xyflow/react";
import { useCanvasCommands } from "./commands/useCanvasCommands";
import { useShortcuts } from "./commands/useShortcuts";
import { useConnectToCreate } from "./connect/useConnectToCreate";
import { ContextMenu } from "./context-menu/ContextMenu";
import { buildMenuItems } from "./context-menu/menuItems";
import { useContextMenu } from "./context-menu/useContextMenu";
import { edgeTypes } from "./edges/LabeledEdge";
import { useReparentOnDrop } from "./grouping/useReparentOnDrop";
import { HelperLinesOverlay } from "./helper-lines/HelperLinesOverlay";
import { useHelperLines } from "./helper-lines/useHelperLines";
import { useImageDrop } from "./images/useImageDrop";
import { nodeTypes } from "./nodes/nodeTypes";
import type { FlowEdge, FlowNode } from "./sync/flowTypes";
import { useGraphState } from "./sync/FlowGraphProvider";
import { Toolbar } from "./toolbar/Toolbar";
import { toolFlowProps, useToolMode } from "./tools/useToolMode";

const GRID = 16;

export function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeDragStart } = useGraphState();
  const { tool, setTool } = useToolMode();
  const commands = useCanvasCommands(setTool);
  const { guides, applyHelperLines } = useHelperLines(nodes);
  const contextMenu = useContextMenu();
  const onConnectEnd = useConnectToCreate();
  const onNodeDragStop = useReparentOnDrop();
  const imageDrop = useImageDrop();

  useShortcuts({ ...commands, newNode: () => commands.addText() });

  const handleNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => onNodesChange(applyHelperLines(changes)),
    [onNodesChange, applyHelperLines],
  );

  return (
    <div className="size-full" {...imageDrop}>
      <ReactFlow<FlowNode, FlowEdge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onNodeContextMenu={contextMenu.onNodeContextMenu}
        onEdgeContextMenu={contextMenu.onEdgeContextMenu}
        onPaneContextMenu={contextMenu.onPaneContextMenu}
        onSelectionContextMenu={contextMenu.onSelectionContextMenu}
        {...toolFlowProps(tool)}
        connectionMode={ConnectionMode.Loose}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={["Delete", "Backspace"]}
        panOnScroll
        zoomOnDoubleClick={false}
        snapToGrid
        snapGrid={[GRID, GRID]}
        minZoom={0.05}
        maxZoom={4}
        colorMode="dark"
        fitView
        fitViewOptions={{ maxZoom: 1, padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        className={tool === "hand" ? "cursor-grab" : undefined}
      >
        <Background variant={BackgroundVariant.Dots} gap={GRID * 2} size={1.2} />
        <MiniMap pannable zoomable className="!bg-card" />
        <Controls showInteractive={false} position="bottom-left" />
        <HelperLinesOverlay {...guides} />
      </ReactFlow>
      <Toolbar tool={tool} commands={commands} />
      {contextMenu.menu && (
        <ContextMenu
          menu={contextMenu.menu}
          items={buildMenuItems(contextMenu.menu, commands)}
          onClose={contextMenu.close}
        />
      )}
    </div>
  );
}
