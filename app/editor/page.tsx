
"use client"
// Accepts TemplateData | null to match EditorToolbarProps
export interface TemplateData {
	elements: EditorElement[];
	canvasWidth: number;
	canvasHeight: number;
}

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Award, ArrowLeft, Save, Eye, Download, Settings, ChevronDown } from "lucide-react"
import Link from "next/link"
import * as htmlToImage from "html-to-image"
import jsPDF from "jspdf"

import { EditorToolbar } from "@/components/editor-toolbar"
import { EditorCanvas } from "@/components/editor-canvas"
import { EditorProperties } from "@/components/editor-properties"
import { EditorLayers } from "@/components/editor-layers"
import { EditorSettings } from "@/components/editor-settings"

export interface EditorElement {
	id: string
	type: "text" | "qr-code" | "image" | "shape"
	x: number
	y: number
	width: number
	height: number
	rotation: number
	properties: Record<string, unknown>
	hidden?: boolean
}

export interface EditorState {
	elements: EditorElement[];
	selectedElementId: string | null;
	canvasWidth: number;
	canvasHeight: number;
	zoom: number;
	backgroundImage?: string; // dataUrl or image src
}

export default function EditorPage() {
       const [editorState, setEditorState] = useState<EditorState>({
	       elements: [],
	       selectedElementId: null,
	       canvasWidth: 800,
	       canvasHeight: 600,
	       zoom: 1,
	       backgroundImage: undefined,
       });

       // Load template from localStorage if present (from dashboard-templates)
       useEffect(() => {
	       if (typeof window === "undefined") return;
	       const imported = localStorage.getItem("certifypro-import-template");
	       if (imported) {
		       try {
			       const template = JSON.parse(imported);
			       // If the template has an image as the first element, set as background
			       let backgroundImage = undefined;
			       if (template.elements && template.elements.length > 0 && template.elements[0].type === "image") {
				       backgroundImage = template.elements[0].properties.src;
			       }
			       setEditorState((prev) => ({
				       ...prev,
				       ...template,
				       backgroundImage: backgroundImage || prev.backgroundImage,
			       }));
		       } catch {}
		       localStorage.removeItem("certifypro-import-template");
	       }
       }, []);
	const [showExportMenu, setShowExportMenu] = useState(false)
	const canvasNodeRef = useRef<HTMLDivElement | null>(null)

	const [showSettings, setShowSettings] = useState(false)

	// useEffect hooks will be re-added after all function declarations


// Accepts TemplateData | null to match EditorToolbarProps

	const loadTemplate = (templateData: TemplateData | null) => {
		if (templateData && templateData.elements) {
			setEditorState({
				...editorState,
				elements: templateData.elements,
				canvasWidth: templateData.canvasWidth || 800,
				canvasHeight: templateData.canvasHeight || 600,
			})
		}
	}

	const handleImageUpload = async (file: File) => {
		try {
			// Convert file to data URL for immediate use
			const reader = new FileReader()
			reader.onload = (e) => {
				const dataUrl = e.target?.result as string
				const newImageElement: EditorElement = {
					id: `element-${Date.now()}`,
					type: "image",
					x: 100,
					y: 100,
					width: 200,
					height: 150,
					rotation: 0,
					properties: {
						src: dataUrl,
						alt: file.name,
						opacity: 1,
						borderRadius: 0,
						objectFit: "cover",
					},
				}
				setEditorState((prev) => ({
					...prev,
					elements: [...prev.elements, newImageElement],
					selectedElementId: newImageElement.id,
				}))
			}
			reader.readAsDataURL(file)
		} catch (error) {
			console.error('Error uploading image:', error)
		}
	}

	const selectedElement = editorState.elements.find((el) => el.id === editorState.selectedElementId);
	const canSetAsBackground = !!selectedElement && selectedElement.type === "image";

       const addElement = (type: EditorElement["type"]) => {
	       const newElement: EditorElement = {
		       id: `element-${Date.now()}`,
		       type,
		       x: 100,
		       y: 100,
		       width: type === "text" ? 200 : type === "qr-code" ? 100 : 150,
		       height: type === "text" ? 40 : type === "qr-code" ? 100 : 150,
		       rotation: 0,
		       properties: getDefaultProperties(type),
	       };
	       setEditorState((prev) => ({
		       ...prev,
		       elements: [...prev.elements, newElement],
		       selectedElementId: newElement.id,
	       }));
       };

       // Set an image as background
       const setImageAsBackground = (imageSrc: string) => {
	       setEditorState((prev) => ({ ...prev, backgroundImage: imageSrc }));
       };
		

	const updateElement = (id: string, updates: Partial<EditorElement>) => {
		setEditorState((prev) => ({
			...prev,
			elements: prev.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
		}))
	}

	const toggleElementVisibility = (id: string) => {
		setEditorState((prev) => ({
			...prev,
			elements: prev.elements.map((el) => (el.id === id ? { ...el, hidden: !el.hidden } : el)),
		}))
	}

	const deleteElement = (id: string) => {
		setEditorState((prev) => ({
			...prev,
			elements: prev.elements.filter((el) => el.id !== id),
			selectedElementId: prev.selectedElementId === id ? null : prev.selectedElementId,
		}))
	}

	const selectElement = (id: string | null) => {
		setEditorState((prev) => ({ ...prev, selectedElementId: id }))
	}


	const handleSave = async () => {
		// Check if we're editing an existing project
		const urlParams = new URLSearchParams(window.location.search)
		const projectId = urlParams.get('projectId')
		
		if (projectId) {
			// Save to project
			try {
				const response = await fetch(`/api/projects/${projectId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						editorData: editorState,
					}),
				})
				
				if (response.ok) {
					alert('Project saved successfully!')
				} else {
					alert('Failed to save project')
				}
			} catch (error) {
				console.error('Error saving project:', error)
				alert('Error saving project')
			}
		} else {
			// Save as template (existing functionality)
			const snapshot = {
				...editorState,
				savedAt: new Date().toISOString(),
			}
			localStorage.setItem("certifypro-template", JSON.stringify(snapshot))

			// Append to templates list (multi-save)
			try {
				const listRaw = localStorage.getItem("certifypro-templates")
				const list = listRaw ? JSON.parse(listRaw) : []
				const name = prompt("Template name", `Template ${new Date().toLocaleString()}`) || `Template ${new Date().toLocaleString()}`
				list.unshift({ id: `tpl-${Date.now()}`, name, snapshot })
				localStorage.setItem("certifypro-templates", JSON.stringify(list))
				alert("Template saved successfully!")
			} catch {
				alert("Template saved (single)")
			}
		}
	}

	const handleLoad = () => {
		const saved = localStorage.getItem('certifypro-template')
		if (saved) {
			try {
				const template = JSON.parse(saved)
				setEditorState(template)
				alert('Template loaded successfully!')
			} catch {
				alert('Failed to load template')
			}
		} else {
			alert('No saved template found')
		}
	}

	const downloadDataUrl = (dataUrl: string, filename: string) => {
		const a = document.createElement('a')
		a.href = dataUrl
		a.download = filename
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
	}

	const exportAsImage = async (format: 'png' | 'jpeg' | 'webp' | 'avif') => {
		if (!canvasNodeRef.current) return alert('Nothing to export')
		try {
			let dataUrl = ''
			if (format === 'png') {
				dataUrl = await htmlToImage.toPng(canvasNodeRef.current, { pixelRatio: 2 })
			} else if (format === 'jpeg') {
				dataUrl = await htmlToImage.toJpeg(canvasNodeRef.current, { pixelRatio: 2, quality: 0.95 })
			} else if (format === 'webp') {
				dataUrl = await htmlToImage.toJpeg(canvasNodeRef.current, { pixelRatio: 2, quality: 0.95 })
				// Convert JPEG dataURL to WEBP by drawing to canvas
				const img = new Image()
				img.src = dataUrl
				await img.decode()
				const canvas = document.createElement('canvas')
				canvas.width = img.width
				canvas.height = img.height
				const ctx = canvas.getContext('2d')!
				ctx.drawImage(img, 0, 0)
				dataUrl = canvas.toDataURL('image/webp', 0.95)
			} else if (format === 'avif') {
				// Fallback: create WEBP and rename if AVIF not supported by canvas
				const jpegUrl = await htmlToImage.toJpeg(canvasNodeRef.current, { pixelRatio: 2, quality: 0.95 })
				const img = new Image()
				img.src = jpegUrl
				await img.decode()
				const canvas = document.createElement('canvas')
				canvas.width = img.width
				canvas.height = img.height
				const ctx = canvas.getContext('2d')!
				ctx.drawImage(img, 0, 0)
				// Many browsers don't support toDataURL('image/avif') yet; try, else fallback to webp
				try {
					dataUrl = canvas.toDataURL('image/avif')
					if (!dataUrl || dataUrl === 'data:,') {
						dataUrl = canvas.toDataURL('image/webp', 0.95)
					}
				} catch {
					dataUrl = canvas.toDataURL('image/webp', 0.95)
				}
			}
			const ts = new Date().toISOString().replace(/[:.]/g, '-')
			downloadDataUrl(dataUrl, `certifypro-export-${ts}.${format}`)
		} catch {
			alert('Failed to export image')
		}
	}

	const exportAsPdf = async () => {
		if (!canvasNodeRef.current) return alert('Nothing to export')
		try {
			const dataUrl = await htmlToImage.toPng(canvasNodeRef.current, { pixelRatio: 2 })
			const pdf = new jsPDF({ orientation: editorState.canvasWidth >= editorState.canvasHeight ? 'l' : 'p', unit: 'pt', format: [editorState.canvasWidth, editorState.canvasHeight] })
			pdf.addImage(dataUrl, 'PNG', 0, 0, editorState.canvasWidth, editorState.canvasHeight)
			const ts = new Date().toISOString().replace(/[:.]/g, '-')
			pdf.save(`certifypro-export-${ts}.pdf`)
		} catch {
			alert('Failed to export PDF')
		}
	}

	const handleExportClick = () => setShowExportMenu((s) => !s)

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<header className="border-b border-border bg-card/50 backdrop-blur-sm">
				<div className="container mx-auto px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link
							href="/dashboard"
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
						>
							<ArrowLeft className="h-4 w-4" />
							<span className="hidden sm:inline">Back to Dashboard</span>
						</Link>
						<Separator orientation="vertical" className="h-6" />
						<div className="flex items-center gap-2">
							<Award className="h-6 w-6 text-primary" />
							<h1 className="text-lg font-black text-foreground">Template Editor</h1>
						</div>
					</div>

					<div className="flex items-center gap-2 relative">
						<Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
							<Settings className="h-4 w-4 mr-2" />
							<span className="hidden sm:inline">Settings</span>
						</Button>
						<Button variant="ghost" size="sm">
							<Eye className="h-4 w-4 mr-2" />
							<span className="hidden sm:inline">Preview</span>
						</Button>
						<Button variant="outline" size="sm" onClick={handleSave}>
							<Save className="h-4 w-4 mr-2" />
							<span className="hidden sm:inline">Save</span>
						</Button>
						<Button variant="outline" size="sm" onClick={handleLoad}>
							Load
						</Button>
						<div>
							<Button size="sm" onClick={handleExportClick}>
								<Download className="h-4 w-4 mr-2" />
								<span className="hidden sm:inline">Export</span>
								<ChevronDown className="h-4 w-4 ml-2" />
							</Button>
							{showExportMenu && (
								<div className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-md shadow-md z-50">
									<button className="w-full text-left px-3 py-2 hover:bg-muted" onClick={() => { setShowExportMenu(false); exportAsImage('png') }}>Export as PNG</button>
									<button className="w-full text-left px-3 py-2 hover:bg-muted" onClick={() => { setShowExportMenu(false); exportAsImage('jpeg') }}>Export as JPEG</button>
									<button className="w-full text-left px-3 py-2 hover:bg-muted" onClick={() => { setShowExportMenu(false); exportAsImage('webp') }}>Export as WEBP</button>
									<button className="w-full text-left px-3 py-2 hover:bg-muted" onClick={() => { setShowExportMenu(false); exportAsImage('avif') }}>Export as AVIF</button>
									<hr className="border-border" />
									<button className="w-full text-left px-3 py-2 hover:bg-muted" onClick={() => { setShowExportMenu(false); exportAsPdf() }}>Export as PDF</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</header>

			<div className="flex-1 flex">
				{/* Left Sidebar - Tools */}
				<div className="w-64 border-r border-border bg-card/30 flex flex-col">
					<EditorToolbar 
						onAddElement={addElement} 
						onLoadTemplate={loadTemplate}
						onImageUpload={handleImageUpload}
					/>
					<Separator />
					<EditorLayers
						elements={editorState.elements}
						selectedElementId={editorState.selectedElementId}
						onSelectElement={selectElement}
						onDeleteElement={deleteElement}
						onToggleVisibility={toggleElementVisibility}
					/>
				</div>

				{/* Main Canvas Area */}
				   <div className="flex-1 flex flex-col">
					   <EditorCanvas
						   editorState={editorState}
						   onSelectElement={selectElement}
						   onUpdateElement={updateElement}
						   onCanvasNode={(node) => { canvasNodeRef.current = node }}
						   backgroundImage={editorState.backgroundImage}
						   onChangeZoom={(zoom) => setEditorState((prev) => ({ ...prev, zoom }))}
					   />
				   </div>

				{/* Right Sidebar - Properties */}
		       <div className="w-80 border-l border-border bg-card/30">
			       <EditorProperties 
				       selectedElement={selectedElement} 
				       onUpdateElement={updateElement}
				       onDeleteElement={deleteElement}
			       />
			       {/* Set as background button for image */}
			       {canSetAsBackground && (
				       <div className="p-4">
					       <Button
						       variant="secondary"
						       className="w-full"
						       onClick={() => setImageAsBackground(selectedElement.properties.src as string)}
					       >
						       Set as Background
					       </Button>
				       </div>
			       )}
		       </div>
			</div>

			{/* Settings Modal */}
			{showSettings && <EditorSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />}
		</div>
	)
}

function getDefaultProperties(type: EditorElement["type"]): Record<string, unknown> {
	switch (type) {
		case "text":
			return {
				text: "Sample Text",
				fontSize: 16,
				fontFamily: "Arial",
				fontWeight: "normal",
				color: "#000000",
				textAlign: "left",
			}
		case "qr-code":
			return {
				data: "{{hash}}",
				backgroundColor: "#ffffff",
				foregroundColor: "#000000",
			}
		case "image":
			return {
				src: "",
				alt: "Image",
				opacity: 1,
				borderRadius: 0,
				objectFit: "cover",
			}
		case "shape":
			return {
				shape: "rectangle",
				fill: "#3b82f6",
				stroke: "#000000",
				strokeWidth: 1,
			}
		default:
			return {}
	}
}
