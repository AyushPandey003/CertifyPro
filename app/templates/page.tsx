"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Palette, Sparkles } from "lucide-react"
import Link from "next/link"
import { TemplateGallery, type CertificateTemplate } from "@/components/template-gallery"

export default function TemplatesPage() {
	const router = useRouter()
	const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null)

	const handleTemplateSelect = (template: CertificateTemplate) => {
		setSelectedTemplate(template)
		// Build a minimal editor state using the selected template's image
		const canvasWidth = 800
		const canvasHeight = 600

		const backgroundImageUrl = template.image?.src?.landscape || template.image?.src?.large || template.image?.src?.large2x || ""

		const editorState = {
			elements: [
				{
					id: `bg-${Date.now()}`,
					type: "image",
					x: 0,
					y: 0,
					width: canvasWidth,
					height: canvasHeight,
					rotation: 0,
					properties: {
						src: backgroundImageUrl,
						alt: template.name,
					},
				},
				{
					id: `title-${Date.now()}`,
					type: "text",
					x: 80,
					y: 80,
					width: 640,
					height: 60,
					rotation: 0,
					properties: {
						text: template.name || "Certificate of Achievement",
						fontSize: 28,
						fontFamily: "Arial",
						fontWeight: "700",
						color: "#111111",
						textAlign: "center",
					},
				},
			],
			selectedElementId: null,
			canvasWidth,
			canvasHeight,
			zoom: 1,
		}

		try {
			localStorage.setItem("certifypro-import-template", JSON.stringify(editorState))
			router.push("/editor")
		} catch (err) {
			console.error("Failed to import template to editor:", err)
		}
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b border-border bg-card/50 backdrop-blur-sm">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link
							href="/dashboard"
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
						>
							<ArrowLeft className="h-4 w-4" />
							<span className="hidden sm:inline">Back to Dashboard</span>
						</Link>
						<div className="flex items-center gap-2">
							<Palette className="h-6 w-6 text-primary" />
							<h1 className="text-xl font-black text-foreground">Certificate Templates</h1>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Link href="/editor">
							<Button size="sm">Create Custom</Button>
						</Link>
					</div>
				</div>
			</header>

			<div className="container mx-auto px-4 py-8">
				{/* Hero Section */}
				<div className="text-center mb-12">
					<div className="flex items-center justify-center gap-2 mb-4">
						<Sparkles className="h-8 w-8 text-primary" />
						<h2 className="text-4xl font-black text-foreground">Professional Templates</h2>
						<Sparkles className="h-8 w-8 text-primary" />
					</div>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Choose from our curated collection of certificate templates, powered by high-quality 
						stock photos from Pexels. Start with a professional design and customize it to your needs.
					</p>
				</div>

				{/* Template Gallery */}
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h3 className="text-2xl font-bold">Choose Your Template</h3>
						<div className="text-sm text-muted-foreground">
							{selectedTemplate ? `Selected: ${selectedTemplate.name}` : "Click on a template to select it"}
						</div>
					</div>
					
					<TemplateGallery onTemplateSelect={handleTemplateSelect} />
				</div>
			</div>
		</div>
	)
}
