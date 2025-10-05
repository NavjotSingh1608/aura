export const DEFAULT_CONFIG = {
  confidenceThreshold: 0.7,
  maxSuggestions: 3,
  suggestionTimeout: 15000, // 15 seconds
  speechBufferDuration: 30000, // 30 seconds
  boardEventBufferDuration: 10000, // 10 seconds
  enableProactiveSuggestions: true,
  enableShapeCorrection: true,
}

// Keywords that trigger diagram suggestions
export const DIAGRAM_KEYWORDS: Record<string, string[]> = {
  chemistry: ["benzene", "molecule", "atom", "compound", "reaction", "periodic table"],
  biology: [
    "cell",
    "photosynthesis",
    "mitochondria",
    "DNA",
    "ecosystem",
    "organ",
    "apple",
    "fruit",
    "plant",
    "leaf",
    "tree",
  ],
  physics: ["circuit", "force", "energy", "wave", "atom", "electricity"],
  electronics: ["microcontroller", "arduino", "circuit", "transistor", "resistor", "capacitor"],
  mathematics: ["graph", "function", "triangle", "circle", "polygon", "coordinate"],
  computer_science: ["algorithm", "data structure", "flowchart", "binary tree", "network"],
}

// Shape regularity thresholds
export const SHAPE_REGULARITY_THRESHOLD = 0.85

// Confidence level thresholds
export const CONFIDENCE_LEVELS = {
  HIGH: 0.9,
  MEDIUM: 0.7,
  LOW: 0.5,
}

// Teaching phase keywords
export const PHASE_KEYWORDS = {
  introduction: ["today we will", "let's learn", "next topic", "now we'll discuss"],
  explanation: ["this means", "in other words", "for example", "because"],
  example: ["for instance", "let me show", "here's an example", "imagine"],
  review: ["remember", "as we learned", "to summarize", "in conclusion"],
  assessment: ["quiz", "test", "question", "what is", "can you tell me"],
}
