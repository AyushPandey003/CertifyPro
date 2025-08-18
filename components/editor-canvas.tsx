"use client"

import React from "react"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import type { EditorState, EditorElement } from "@/app/editor/page"
import Image from "next/image"

interface EditorCanvasProps {
  editorState: EditorState
  onSelectElement: (id: string | null) => void
  onUpdateElement: (id: string, updates: Partial<EditorElement>) => void
  /** Optional: receive the DOM node of the white canvas so parent can export it */
  onCanvasNode?: (node: HTMLDivElement | null) => void
}


export function EditorCanvas({ editorState, onSelectElement, onUpdateElement, onCanvasNode }: EditorCanvasProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = React.useRef<HTMLDivElement | null>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      e.stopPropagation()
      onSelectElement(elementId)
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    },
    [onSelectElement],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !editorState.selectedElementId) return

      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      const element = editorState.elements.find((el) => el.id === editorState.selectedElementId)
      if (element) {
        onUpdateElement(editorState.selectedElementId, {
          x: element.x + deltaX / editorState.zoom,
          y: element.y + deltaY / editorState.zoom,
        })
      }

      setDragStart({ x: e.clientX, y: e.clientY })
    },
    [isDragging, editorState.selectedElementId, editorState.elements, editorState.zoom, dragStart, onUpdateElement],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onSelectElement(null)
      }
    },
    [onSelectElement],
  )

  const setCanvasNode = useCallback((node: HTMLDivElement | null) => {
    canvasRef.current = node
    if (onCanvasNode) onCanvasNode(node)
  }, [onCanvasNode])

  const renderElement = (element: EditorElement) => {
    const isSelected = element.id === editorState.selectedElementId
    const style = {
      position: "absolute" as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      cursor: "move",
      border: isSelected ? "2px solid #0891b2" : "1px solid transparent",
      borderRadius: "2px",
    }

    switch (element.type) {
      case "text":
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="flex items-center justify-center bg-white/80 hover:bg-white/90 transition-colors"
          >
            <span
              style={{
                fontSize: element.properties.fontSize as string | number | undefined,
                fontFamily: element.properties.fontFamily as string | undefined,
                fontWeight: element.properties.fontWeight as React.CSSProperties["fontWeight"] | undefined,
                color: element.properties.color as string | undefined,
                textAlign: element.properties.textAlign as React.CSSProperties["textAlign"] | undefined,
              }}
              className="select-none"
            >
              {String(element.properties.text)}
            </span>
          </div>
        )

      case "qr-code":
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="flex items-center justify-center bg-white border-2 border-dashed border-gray-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-black mx-auto mb-2 grid grid-cols-4 gap-px">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={`${Math.random() > 0.5 ? "bg-white" : "bg-black"}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500">QR Code</span>
            </div>
          </div>
        )

      case "image":
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="overflow-hidden bg-gray-100 border border-gray-300"
          >
            {typeof element.properties.src === "string" && element.properties.src ? (
              <Image
                src={element.properties.src}
                alt={String(element.properties.alt)}
                className="w-full h-full object-cover"
                draggable={false}
                width={element.width || 300}
                height={element.height || 200}
                onError={(e) => {
                  // Handle broken images
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center ${element.properties.src ? 'hidden' : ''}`}>
              <div className="text-center text-gray-500">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs">No Image</p>
                <p className="text-xs">Select image in properties</p>
              </div>
            </div>
          </div>
        )

      case "shape":
        return (
          <div
            key={element.id}
            style={{
              ...style,
              backgroundColor: element.properties.fill as string,
              border: `${element.properties.strokeWidth}px solid ${element.properties.stroke}`,
              borderRadius: element.properties.shape === "circle" ? "50%" : "0",
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Canvas Controls */}
      <div className="p-4 border-b border-border bg-card/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ZoomOut className="h-4 w-4 mr-2" />
              {Math.round(editorState.zoom * 100)}%
            </Button>
            <Button variant="outline" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {editorState.canvasWidth} × {editorState.canvasHeight}px
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-8 bg-gray-50 overflow-auto">
        <div className="flex items-center justify-center min-h-full">
          <Card className="shadow-lg">
            <div
              ref={setCanvasNode}
              className="relative bg-white"
              style={{
                width: editorState.canvasWidth * editorState.zoom,
                height: editorState.canvasHeight * editorState.zoom,
                transform: `scale(${editorState.zoom})`,
                transformOrigin: "top left",
              }}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {editorState.elements.map(renderElement)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
