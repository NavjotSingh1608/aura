import type { Point, ShapeType, ShapeAnalysis, SmartBoardShape } from "@/lib/types"

export class ShapeAnalyzer {
  /**
   * Calculate the regularity of a polygon (0-1, where 1 is perfect)
   */
  static calculateRegularity(points: Point[]): number {
    if (points.length < 3) return 0

    // Calculate all side lengths
    const sides = this.calculateSideLengths(points)

    // Calculate all angles
    const angles = this.calculateAngles(points)

    // Calculate variance in side lengths
    const sideVariance = this.calculateVariance(sides)
    const avgSide = sides.reduce((a, b) => a + b, 0) / sides.length
    const sideRegularity = 1 - Math.min(sideVariance / (avgSide * avgSide), 1)

    // Calculate variance in angles
    const angleVariance = this.calculateVariance(angles)
    const expectedAngle = ((points.length - 2) * 180) / points.length
    const angleRegularity = 1 - Math.min(angleVariance / (expectedAngle * expectedAngle), 1)

    // Combined regularity score
    return sideRegularity * 0.6 + angleRegularity * 0.4
  }

  /**
   * Calculate side lengths of a polygon
   */
  private static calculateSideLengths(points: Point[]): number[] {
    const sides: number[] = []
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i]
      const p2 = points[(i + 1) % points.length]
      const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
      sides.push(distance)
    }
    return sides
  }

  /**
   * Calculate angles of a polygon
   */
  private static calculateAngles(points: Point[]): number[] {
    const angles: number[] = []
    for (let i = 0; i < points.length; i++) {
      const p1 = points[(i - 1 + points.length) % points.length]
      const p2 = points[i]
      const p3 = points[(i + 1) % points.length]

      const angle = this.calculateAngle(p1, p2, p3)
      angles.push(angle)
    }
    return angles
  }

  /**
   * Calculate angle between three points
   */
  private static calculateAngle(p1: Point, p2: Point, p3: Point): number {
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y }
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y }

    const dot = v1.x * v2.x + v1.y * v2.y
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)

    const cosAngle = dot / (mag1 * mag2)
    return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI)
  }

  /**
   * Calculate variance of an array of numbers
   */
  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  }

  /**
   * Detect shape type from points
   */
  static detectShapeType(points: Point[]): ShapeType {
    const numPoints = points.length

    if (numPoints < 3) return "line"
    if (numPoints === 3) return "triangle"
    if (numPoints === 4) return "rectangle"
    if (numPoints === 6) return "hexagon"
    if (this.isCircle(points)) return "circle"

    return "polygon"
  }

  /**
   * Check if points form a circle
   */
  private static isCircle(points: Point[]): boolean {
    if (points.length < 8) return false

    // Calculate center
    const center = {
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
    }

    // Calculate distances from center
    const distances = points.map((p) => Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2)))

    // Check if all distances are similar
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length
    const variance = this.calculateVariance(distances)

    return variance / (avgDistance * avgDistance) < 0.1
  }

  /**
   * Analyze a shape and provide feedback
   */
  static analyzeShape(shape: SmartBoardShape, context?: string): ShapeAnalysis {
    const regularity = this.calculateRegularity(shape.points)
    const detectedType = this.detectShapeType(shape.points)

    let suggestedCorrection: string | undefined
    let confidence = 0.8

    // Context-aware suggestions
    if (context?.toLowerCase().includes("benzene") && detectedType === "hexagon") {
      if (regularity < 0.85) {
        suggestedCorrection = "Show perfect benzene structure"
        confidence = 0.94
      }
    } else if (context?.toLowerCase().includes("circle") && detectedType === "circle") {
      if (regularity < 0.85) {
        suggestedCorrection = "Show perfect circle"
        confidence = 0.9
      }
    }

    return {
      regularity,
      shapeType: detectedType,
      suggestedCorrection,
      confidence,
    }
  }
}
