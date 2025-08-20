"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, Loader2, Download, Eye, Star } from "lucide-react"
import Image from "next/image"

interface TemplateGalleryProps {
	onTemplateSelect: (template: CertificateTemplate) => void
}

export interface CertificateTemplate {
	id: string
	name: string
	category: string
	description: string
	image: {
		url: string
		width: number
		height: number
		alt: string
	}
	tags: string[]
	difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export function TemplateGallery({ onTemplateSelect }: TemplateGalleryProps) {
	const [templates, setTemplates] = useState<CertificateTemplate[]>([])
	const [loading, setLoading] = useState(true)
	const [activeCategory, setActiveCategory] = useState("all")
	const [error, setError] = useState("")

	const categories = [
		{ id: "all", label: "All Templates", icon: "🎨" },
		{ id: "academic", label: "Academic", icon: "🎓" },
		{ id: "business", label: "Business", icon: "💼" },
		{ id: "achievement", label: "Achievement", icon: "🏆" },
		{ id: "event", label: "Event", icon: "🎉" },
		{ id: "professional", label: "Professional", icon: "👔" },
	]

	const fetchTemplates = useCallback(async () => {
		try {
			setLoading(true)
			setError("")
			// Build templates with placeholder images (replace with Cloudinary resources if desired)
			const placeholder = createPlaceholderImage()
			const templateData: CertificateTemplate[] = [
				// Academic Templates
				{
					id: "academic-1",
					name: "Classic Diploma",
					category: "academic",
					description: "Traditional academic certificate with elegant typography",
					image: placeholder,
					tags: ["academic", "diploma", "traditional", "elegant"],
					difficulty: "beginner"
				},
				{
					id: "academic-2",
					name: "Modern Achievement",
					category: "academic",
					description: "Contemporary design for academic accomplishments",
					image: placeholder,
					tags: ["academic", "modern", "achievement", "clean"],
					difficulty: "intermediate"
				},
				// Business Templates
				{
					id: "business-1",
					name: "Professional Recognition",
					category: "business",
					description: "Corporate certificate for professional achievements",
					image: placeholder,
					tags: ["business", "professional", "corporate", "recognition"],
					difficulty: "intermediate"
				},
				{
					id: "business-2",
					name: "Executive Award",
					category: "business",
					description: "Premium design for executive-level recognition",
					image: placeholder,
					tags: ["business", "executive", "premium", "award"],
					difficulty: "advanced"
				},
				// Achievement Templates
				{
					id: "achievement-1",
					name: "Excellence Certificate",
					category: "achievement",
					description: "Celebrate outstanding performance and excellence",
					image: placeholder,
					tags: ["achievement", "excellence", "performance", "celebration"],
					difficulty: "beginner"
				},
				{
					id: "achievement-2",
					name: "Innovation Award",
					category: "achievement",
					description: "Recognize innovative thinking and creativity",
					image: placeholder,
					tags: ["achievement", "innovation", "creativity", "award"],
					difficulty: "intermediate"
				},
				// Event Templates
				{
					id: "event-1",
					name: "Event Participation",
					category: "event",
					description: "Certificate for event participation and engagement",
					image: placeholder,
					tags: ["event", "participation", "engagement", "celebration"],
					difficulty: "beginner"
				},
				{
					id: "event-2",
					name: "Workshop Completion",
					category: "event",
					description: "Professional workshop completion certificate",
					image: placeholder,
					tags: ["event", "workshop", "completion", "professional"],
					difficulty: "intermediate"
				},
			]

			setTemplates(templateData)
		} catch (err) {
			setError("Failed to load templates")
			console.error("Template loading error:", err)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchTemplates()
	}, [fetchTemplates])

	const createPlaceholderImage = () => ({
		url: "",
		width: 800,
		height: 600,
		alt: "Template placeholder"
	})

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case 'beginner': return 'bg-green-100 text-green-800'
			case 'intermediate': return 'bg-yellow-100 text-yellow-800'
			case 'advanced': return 'bg-red-100 text-red-800'
			default: return 'bg-gray-100 text-gray-800'
		}
	}

	const filteredTemplates = activeCategory === "all" 
		? templates 
		: templates.filter(t => t.category === activeCategory)

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (error) {
		return (
			<div className="text-center text-red-600 py-8">
				<ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
				<p>{error}</p>
				<Button variant="outline" onClick={fetchTemplates} className="mt-2">
					Try Again
				</Button>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Category Tabs */}
			<Tabs value={activeCategory} onValueChange={setActiveCategory}>
				<TabsList className="grid w-full grid-cols-6">
					{categories.map((category) => (
						<TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
							<span>{category.icon}</span>
							<span className="hidden sm:inline">{category.label}</span>
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value={activeCategory} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredTemplates.map((template) => (
							<Card 
								key={template.id} 
								className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
								onClick={() => onTemplateSelect(template)}
							>
								<CardHeader className="p-0">
									<div className="relative aspect-video overflow-hidden rounded-t-lg">
										{template.image.url ? (
											<Image
												src={template.image.url}
												alt={template.image.alt || template.name}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
												width={template.image.width}
												height={template.image.height}
											/>
										) : (
											<div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
												<ImageIcon className="h-12 w-12 text-blue-400" />
											</div>
										)}
										<div className="absolute top-2 right-2">
											<Badge className={getDifficultyColor(template.difficulty)}>
												{template.difficulty}
											</Badge>
										</div>
									</div>
								</CardHeader>
								<CardContent className="p-4">
									<div className="space-y-3">
										<div>
											<CardTitle className="text-lg group-hover:text-primary transition-colors">
												{template.name}
											</CardTitle>
											<CardDescription className="text-sm">
												{template.description}
											</CardDescription>
										</div>
										
										<div className="flex flex-wrap gap-1">
											{template.tags.slice(0, 3).map((tag) => (
												<Badge key={tag} variant="secondary" className="text-xs">
													{tag}
												</Badge>
											))}
										</div>

										<div className="flex items-center justify-between pt-2">
											<div className="flex items-center gap-1 text-xs text-muted-foreground">
												<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
												<span>Free</span>
											</div>
											<div className="flex gap-2">
												<Button 
													variant="outline" 
													size="sm" 
													className="h-8"
													onClick={(e) => { e.stopPropagation(); /* Preview could be implemented here */ }}
												>
													<Eye className="h-3 w-3 mr-1" />
													Preview
												</Button>
												<Button 
													size="sm" 
													className="h-8"
													onClick={(e) => { e.stopPropagation(); onTemplateSelect(template); }}
												>
													<Download className="h-3 w-3 mr-1" />
													Use
												</Button>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
