import type { FusedContext, SuggestionAction, DiagramData, SmartBoardShape } from "@/lib/types"
import { ShapeAnalyzer } from "@/lib/shape-analyzer"
import { SHAPE_REGULARITY_THRESHOLD } from "@/lib/constants"

export class AISuggestionService {
  private activeSuggestions: SuggestionAction[] = []
  private diagramLibrary: DiagramData[] = []
  private suggestionIdCounter = 0

  constructor() {
    this.initializeDiagramLibrary()
  }

  private initializeDiagramLibrary() {
    // Sample diagram library - in production, this would be loaded from a database
    this.diagramLibrary = [
      {
        id: "apple-fruit",
        title: "Apple Fruit",
        description: "Realistic apple with stem and leaf",
        category: "biology",
        tags: ["apple", "fruit", "biology", "plant"],
        imageUrl: "/realistic-red-apple-with-stem-and-leaf.jpg",
      },
      {
        id: "benzene-structure",
        title: "Benzene Ring Structure",
        description: "Perfect hexagonal benzene molecule with alternating double bonds",
        category: "chemistry",
        tags: ["benzene", "organic chemistry", "aromatic", "hexagon"],
        imageUrl: "/benzene-ring-structure-diagram.jpg",
      },
      {
        id: "cell-structure",
        title: "Animal Cell Structure",
        description: "Detailed diagram of animal cell with organelles",
        category: "biology",
        tags: ["cell", "biology", "organelles", "mitochondria"],
        imageUrl: "/animal-cell-structure-diagram.jpg",
      },
      {
        id: "circuit-diagram",
        title: "Basic Circuit Diagram",
        description: "Simple electrical circuit with battery, resistor, and LED",
        category: "electronics",
        tags: ["circuit", "electronics", "electricity", "resistor"],
        imageUrl: "/basic-electrical-circuit-diagram.jpg",
      },
      {
        id: "photosynthesis",
        title: "Photosynthesis Process",
        description: "Visual representation of photosynthesis in plants",
        category: "biology",
        tags: ["photosynthesis", "plants", "biology", "chloroplast"],
        imageUrl: "/photosynthesis-process-diagram.jpg",
      },
      {
        id: "water-cycle",
        title: "Water Cycle",
        description: "Complete water cycle showing evaporation, condensation, and precipitation",
        category: "science",
        tags: ["water", "cycle", "evaporation", "precipitation"],
        imageUrl: "/water-cycle-diagram.png",
      },
    ]
  }

  generateSuggestions(context: FusedContext): SuggestionAction[] {
    console.log("[v0] Generating suggestions for context:", {
      hasSpeech: !!context.speech.intent,
      hasShapes: context.board.currentShapes.length,
      topic: context.speech.currentTopic,
    })

    const suggestions: SuggestionAction[] = []

    // 1. Check for diagram suggestions based on speech
    const diagramSuggestion = this.checkDiagramSuggestion(context)
    if (diagramSuggestion) {
      suggestions.push(diagramSuggestion)
    }

    // 2. Check for shape correction suggestions
    const shapeSuggestions = this.checkShapeCorrections(context)
    suggestions.push(...shapeSuggestions)

    // 3. Check for example suggestions
    const exampleSuggestion = this.checkExampleSuggestion(context)
    if (exampleSuggestion) {
      suggestions.push(exampleSuggestion)
    }

    // 4. Check for clarification suggestions
    const clarificationSuggestion = this.checkClarificationSuggestion(context)
    if (clarificationSuggestion) {
      suggestions.push(clarificationSuggestion)
    }

    // Sort by urgency and confidence
    suggestions.sort((a, b) => {
      const urgencyOrder = { immediate: 3, helpful: 2, optional: 1 }
      const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
      if (urgencyDiff !== 0) return urgencyDiff
      return b.confidence - a.confidence
    })

    console.log("[v0] Generated", suggestions.length, "suggestions")
    // Update active suggestions
    this.activeSuggestions = suggestions.slice(0, 3)
    return this.activeSuggestions
  }

  private checkDiagramSuggestion(context: FusedContext): SuggestionAction | null {
    const intent = context.speech.intent

    console.log("[v0] Checking diagram suggestion, intent:", intent)

    if (!intent || intent.visualAidSuggestion.type !== "diagram") {
      console.log("[v0] No diagram suggestion needed")
      return null
    }

    console.log("[v0] Visual aid suggestion:", intent.visualAidSuggestion)

    // Search for relevant diagrams
    const searchTerm = intent.visualAidSuggestion.specificContent.toLowerCase()
    console.log("[v0] Searching for diagrams matching:", searchTerm)

    const keywords = searchTerm.split(" ")
    const matchingDiagrams = this.diagramLibrary.filter((diagram) =>
      keywords.some(
        (keyword) =>
          diagram.tags.includes(keyword) ||
          diagram.title.toLowerCase().includes(keyword) ||
          diagram.description.toLowerCase().includes(keyword),
      ),
    )

    console.log("[v0] Found", matchingDiagrams.length, "matching diagrams")

    let bestMatch: DiagramData
    let isDynamicImage = false

    if (matchingDiagrams.length === 0) {
      console.log("[v0] No library match found, generating dynamic image for:", searchTerm)

      // Generate a dynamic diagram using placeholder image service
      const imageQuery = `realistic ${searchTerm} illustration for teaching`
      const imageUrl = `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(imageQuery)}`

      bestMatch = {
        id: `dynamic-${Date.now()}`,
        title: searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1),
        description: `AI-generated image of ${searchTerm}`,
        category: "dynamic",
        tags: keywords,
        imageUrl: imageUrl,
      }
      isDynamicImage = true

      console.log("[v0] Generated dynamic image URL:", imageUrl)
    } else {
      bestMatch = matchingDiagrams[0]
      console.log("[v0] Best match from library:", bestMatch.title)
    }

    const confidence = intent.visualAidSuggestion.confidence

    return {
      id: `suggestion-${this.suggestionIdCounter++}`,
      type: "diagram",
      message: isDynamicImage ? `Generate ${bestMatch.title} image?` : `Show ${bestMatch.title}?`,
      confidence,
      urgency: intent.visualAidSuggestion.urgency,
      timestamp: Date.now(),
      actions: [
        {
          label: isDynamicImage ? "Generate Image" : "Show Diagram",
          action: `display-diagram:${bestMatch.id}`,
          primary: true,
        },
        {
          label: "Dismiss",
          action: "dismiss",
        },
      ],
      reasoning: isDynamicImage
        ? `I can generate a ${searchTerm} image to help visualize this concept.`
        : `Detected "${intent.visualAidSuggestion.specificContent}" in speech. This diagram could help visualize the concept.`,
      metadata: {
        diagram: bestMatch,
        isDynamic: isDynamicImage,
      },
    }
  }

  private checkShapeCorrections(context: FusedContext): SuggestionAction[] {
    const suggestions: SuggestionAction[] = []
    const shapes = context.board.currentShapes

    for (const shape of shapes) {
      const analysis = ShapeAnalyzer.analyzeShape(shape as SmartBoardShape, context.speech.currentTopic)

      if (analysis.regularity < SHAPE_REGULARITY_THRESHOLD && analysis.suggestedCorrection) {
        suggestions.push({
          id: `suggestion-${this.suggestionIdCounter++}`,
          type: "correction",
          message: `Improve ${analysis.shapeType} shape?`,
          confidence: analysis.confidence,
          urgency: "helpful",
          timestamp: Date.now(),
          actions: [
            {
              label: "Perfect Shape",
              action: `correct-shape:${shape.timestamp}`,
              primary: true,
            },
            {
              label: "Keep As Is",
              action: "dismiss",
            },
          ],
          reasoning: `The ${analysis.shapeType} appears irregular (${Math.round(analysis.regularity * 100)}% regular). A perfect shape would be clearer for students.`,
        })
      }
    }

    return suggestions
  }

  private checkExampleSuggestion(context: FusedContext): SuggestionAction | null {
    const intent = context.speech.intent

    if (!intent || intent.visualAidSuggestion.type !== "example") {
      return null
    }

    return {
      id: `suggestion-${this.suggestionIdCounter++}`,
      type: "example",
      message: "Add a visual example?",
      confidence: intent.visualAidSuggestion.confidence,
      urgency: intent.visualAidSuggestion.urgency,
      timestamp: Date.now(),
      actions: [
        {
          label: "Generate Example",
          action: "generate-example",
          primary: true,
        },
        {
          label: "Not Now",
          action: "dismiss",
        },
      ],
      reasoning: "You mentioned providing an example. A visual aid could make it more concrete for students.",
    }
  }

  private checkClarificationSuggestion(context: FusedContext): SuggestionAction | null {
    const intent = context.speech.intent

    if (!intent || intent.visualAidSuggestion.type !== "clarification") {
      return null
    }

    return {
      id: `suggestion-${this.suggestionIdCounter++}`,
      type: "clarification",
      message: "Add clarifying diagram?",
      confidence: intent.visualAidSuggestion.confidence,
      urgency: intent.visualAidSuggestion.urgency,
      timestamp: Date.now(),
      actions: [
        {
          label: "Show Diagram",
          action: "show-clarification",
          primary: true,
        },
        {
          label: "Skip",
          action: "dismiss",
        },
      ],
      reasoning: "A visual explanation could help clarify this concept for students.",
    }
  }

  getDiagramById(id: string): DiagramData | undefined {
    return this.diagramLibrary.find((d) => d.id === id)
  }

  getActiveSuggestions(): SuggestionAction[] {
    return this.activeSuggestions
  }

  dismissSuggestion(id: string) {
    this.activeSuggestions = this.activeSuggestions.filter((s) => s.id !== id)
  }
}
