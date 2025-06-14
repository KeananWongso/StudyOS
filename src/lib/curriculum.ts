// Cambridge Lower Secondary Mathematics Curriculum Management

export interface LearningObjective {
  id: string;
  code: string; // e.g., "8Ma3.01"
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prerequisites: string[]; // IDs of prerequisite objectives
}

export interface Subtopic {
  id: string;
  name: string;
  description: string;
  learningObjectives: LearningObjective[];
  estimatedHours: number;
  priority: 1 | 2 | 3 | 4 | 5;
}

export interface Chapter {
  id: string;
  name: string;
  description: string;
  subtopics: Subtopic[];
  prerequisites: string[]; // IDs of prerequisite chapters
  priority: 1 | 2 | 3 | 4 | 5;
  estimatedHours: number;
}

export interface CurriculumStrand {
  id: string;
  name: string;
  description: string;
  chapters: Chapter[];
  color: string; // For UI visualization
}

export interface Curriculum {
  id: string;
  name: string;
  description: string;
  level: string; // e.g., "Cambridge Lower Secondary Year 8"
  strands: CurriculumStrand[];
  totalHours: number;
  lastUpdated: Date;
}

// Cambridge Lower Secondary Mathematics Curriculum (15-day crash course)
export const CAMBRIDGE_MATH_CURRICULUM: Curriculum = {
  id: "cambridge-lower-secondary-15day",
  name: "Cambridge Lower Secondary Mathematics - 15 Day Crash Course",
  description: "Intensive preparation covering essential topics for Cambridge Lower Secondary Mathematics",
  level: "Cambridge Lower Secondary (Ages 11-14)",
  totalHours: 45, // 3 hours per day for 15 days
  lastUpdated: new Date(),
  strands: [
    {
      id: "number",
      name: "Number",
      description: "Number operations, fractions, decimals, percentages, and ratio",
      color: "#3B82F6",
      chapters: [
        {
          id: "number_operations",
          name: "Number Operations",
          description: "Basic arithmetic operations with integers and rational numbers",
          priority: 5,
          estimatedHours: 6,
          prerequisites: [],
          subtopics: [
            {
              id: "integers",
              name: "Integers",
              description: "Operations with positive and negative integers",
              priority: 5,
              estimatedHours: 2,
              learningObjectives: [
                {
                  id: "int_01",
                  code: "8Ma1.01",
                  title: "Add and subtract integers",
                  description: "Perform addition and subtraction with positive and negative integers",
                  difficulty: 2,
                  prerequisites: []
                },
                {
                  id: "int_02",
                  code: "8Ma1.02", 
                  title: "Multiply and divide integers",
                  description: "Perform multiplication and division with positive and negative integers",
                  difficulty: 3,
                  prerequisites: ["int_01"]
                }
              ]
            },
            {
              id: "order_operations",
              name: "Order of Operations",
              description: "BIDMAS/PEMDAS rule application",
              priority: 4,
              estimatedHours: 2,
              learningObjectives: [
                {
                  id: "order_01",
                  code: "8Ma1.03",
                  title: "Apply order of operations",
                  description: "Use BIDMAS to solve complex expressions",
                  difficulty: 3,
                  prerequisites: ["int_01", "int_02"]
                }
              ]
            },
            {
              id: "estimation",
              name: "Estimation and Approximation",
              description: "Rounding and estimation techniques",
              priority: 3,
              estimatedHours: 2,
              learningObjectives: [
                {
                  id: "est_01",
                  code: "8Ma1.04",
                  title: "Round to significant figures",
                  description: "Round numbers to given number of significant figures",
                  difficulty: 2,
                  prerequisites: []
                }
              ]
            }
          ]
        },
        {
          id: "fractions_decimals",
          name: "Fractions and Decimals",
          description: "Operations with fractions, decimals, and percentages",
          priority: 4,
          estimatedHours: 6,
          prerequisites: ["number_operations"],
          subtopics: [
            {
              id: "fraction_operations",
              name: "Fraction Operations",
              description: "Add, subtract, multiply, and divide fractions",
              priority: 4,
              estimatedHours: 3,
              learningObjectives: [
                {
                  id: "frac_01",
                  code: "8Ma2.01",
                  title: "Add and subtract fractions",
                  description: "Perform addition and subtraction of fractions with different denominators",
                  difficulty: 3,
                  prerequisites: ["int_01"]
                },
                {
                  id: "frac_02",
                  code: "8Ma2.02",
                  title: "Multiply and divide fractions",
                  description: "Perform multiplication and division of fractions",
                  difficulty: 4,
                  prerequisites: ["frac_01"]
                }
              ]
            },
            {
              id: "decimal_operations",
              name: "Decimal Operations",
              description: "Operations with decimal numbers",
              priority: 3,
              estimatedHours: 2,
              learningObjectives: [
                {
                  id: "dec_01",
                  code: "8Ma2.03",
                  title: "Operations with decimals",
                  description: "Add, subtract, multiply, and divide decimal numbers",
                  difficulty: 2,
                  prerequisites: []
                }
              ]
            },
            {
              id: "percentages",
              name: "Percentages",
              description: "Percentage calculations and applications",
              priority: 3,
              estimatedHours: 1,
              learningObjectives: [
                {
                  id: "perc_01",
                  code: "8Ma2.04",
                  title: "Calculate percentages",
                  description: "Find percentages of quantities and percentage changes",
                  difficulty: 3,
                  prerequisites: ["dec_01"]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "algebra",
      name: "Algebra",
      description: "Algebraic expressions, equations, and sequences",
      color: "#10B981",
      chapters: [
        {
          id: "algebra_basics",
          name: "Algebraic Expressions",
          description: "Creating and manipulating algebraic expressions",
          priority: 4,
          estimatedHours: 6,
          prerequisites: ["number_operations"],
          subtopics: [
            {
              id: "expressions",
              name: "Expressions and Terms",
              description: "Understanding algebraic expressions and collecting like terms",
              priority: 4,
              estimatedHours: 3,
              learningObjectives: [
                {
                  id: "alg_01",
                  code: "8Ma3.01",
                  title: "Simplify algebraic expressions",
                  description: "Collect like terms and simplify expressions",
                  difficulty: 3,
                  prerequisites: ["int_01", "int_02"]
                }
              ]
            },
            {
              id: "equations",
              name: "Linear Equations",
              description: "Solving linear equations in one variable",
              priority: 4,
              estimatedHours: 3,
              learningObjectives: [
                {
                  id: "eq_01",
                  code: "8Ma3.02",
                  title: "Solve linear equations",
                  description: "Solve equations of the form ax + b = c",
                  difficulty: 4,
                  prerequisites: ["alg_01"]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "geometry",
      name: "Geometry and Measures",
      description: "Shape properties, area, volume, and coordinate geometry",
      color: "#F59E0B",
      chapters: [
        {
          id: "geometry_basics",
          name: "Properties of Shapes",
          description: "Angles, triangles, quadrilaterals, and circles",
          priority: 3,
          estimatedHours: 6,
          prerequisites: [],
          subtopics: [
            {
              id: "angles",
              name: "Angles",
              description: "Types of angles and angle relationships",
              priority: 3,
              estimatedHours: 2,
              learningObjectives: [
                {
                  id: "ang_01",
                  code: "8Ma4.01",
                  title: "Calculate angles",
                  description: "Find missing angles using angle properties",
                  difficulty: 3,
                  prerequisites: []
                }
              ]
            },
            {
              id: "triangles",
              name: "Triangles",
              description: "Triangle properties and calculations",
              priority: 3,
              estimatedHours: 2,
              learningObjectives: [
                {
                  id: "tri_01",
                  code: "8Ma4.02",
                  title: "Triangle angle sum",
                  description: "Use the fact that angles in a triangle sum to 180°",
                  difficulty: 2,
                  prerequisites: ["ang_01"]
                }
              ]
            }
          ]
        },
        {
          id: "measurement",
          name: "Area and Volume",
          description: "Calculating area and volume of 2D and 3D shapes",
          priority: 2,
          estimatedHours: 4,
          prerequisites: ["number_operations"],
          subtopics: [
            {
              id: "area",
              name: "Area Calculations",
              description: "Area of rectangles, triangles, and circles",
              priority: 3,
              estimatedHours: 2,
              learningObjectives: [
                {
                  id: "area_01",
                  code: "8Ma5.01",
                  title: "Calculate areas",
                  description: "Find areas of common 2D shapes",
                  difficulty: 2,
                  prerequisites: ["int_02"]
                }
              ]
            },
            {
              id: "volume",
              name: "Volume Calculations",
              description: "Volume of cubes, cuboids, and cylinders",
              priority: 2,
              estimatedHours: 2,
              learningObjectives: [
                {
                  id: "vol_01",
                  code: "8Ma5.02",
                  title: "Calculate volumes",
                  description: "Find volumes of common 3D shapes",
                  difficulty: 3,
                  prerequisites: ["area_01"]
                }
              ]
            }
          ]
        },
        {
          id: "coordinate_geometry",
          name: "Coordinate Geometry",
          description: "Plotting points and finding distances on coordinate grids",
          priority: 2,
          estimatedHours: 3,
          prerequisites: ["algebra_basics"],
          subtopics: [
            {
              id: "coordinates",
              name: "Coordinate Plotting",
              description: "Plotting and reading coordinates",
              priority: 2,
              estimatedHours: 1.5,
              learningObjectives: [
                {
                  id: "coord_01",
                  code: "8Ma6.01",
                  title: "Plot coordinates",
                  description: "Plot and read coordinates in all four quadrants",
                  difficulty: 2,
                  prerequisites: ["int_01"]
                }
              ]
            },
            {
              id: "gradients",
              name: "Gradients and Lines",
              description: "Finding gradients of lines",
              priority: 2,
              estimatedHours: 1.5,
              learningObjectives: [
                {
                  id: "grad_01",
                  code: "8Ma6.02",
                  title: "Calculate gradients",
                  description: "Find gradients of straight lines",
                  difficulty: 3,
                  prerequisites: ["coord_01", "alg_01"]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "statistics",
      name: "Statistics and Probability",
      description: "Data handling, statistics, and probability",
      color: "#8B5CF6",
      chapters: [
        {
          id: "statistics_probability",
          name: "Data Analysis",
          description: "Collecting, presenting, and interpreting data",
          priority: 3,
          estimatedHours: 6,
          prerequisites: ["fractions_decimals"],
          subtopics: [
            {
              id: "data_collection",
              name: "Data Collection",
              description: "Methods of collecting and organizing data",
              priority: 2,
              estimatedHours: 2,
              learningObjectives: [
                {
                  id: "data_01",
                  code: "8Ma7.01",
                  title: "Collect and organize data",
                  description: "Use appropriate methods to collect and present data",
                  difficulty: 2,
                  prerequisites: []
                }
              ]
            },
            {
              id: "averages",
              name: "Averages",
              description: "Mean, median, mode, and range",
              priority: 3,
              estimatedHours: 2,
              learningObjectives: [
                {
                  id: "avg_01",
                  code: "8Ma7.02",
                  title: "Calculate averages",
                  description: "Find mean, median, mode, and range of datasets",
                  difficulty: 3,
                  prerequisites: ["dec_01"]
                }
              ]
            },
            {
              id: "probability",
              name: "Basic Probability",
              description: "Probability of simple events",
              priority: 2,
              estimatedHours: 2,
              learningObjectives: [
                {
                  id: "prob_01",
                  code: "8Ma7.03",
                  title: "Calculate probabilities",
                  description: "Find probabilities of simple events",
                  difficulty: 3,
                  prerequisites: ["frac_01", "dec_01"]
                }
              ]
            }
          ]
        },
        {
          id: "ratio_proportion",
          name: "Ratio and Proportion",
          description: "Understanding and applying ratios and proportions",
          priority: 3,
          estimatedHours: 4,
          prerequisites: ["fractions_decimals"],
          subtopics: [
            {
              id: "ratios",
              name: "Ratios",
              description: "Expressing and simplifying ratios",
              priority: 3,
              estimatedHours: 2,
              learningObjectives: [
                {
                  id: "ratio_01",
                  code: "8Ma8.01",
                  title: "Simplify ratios",
                  description: "Express ratios in simplest form",
                  difficulty: 3,
                  prerequisites: ["frac_01"]
                }
              ]
            },
            {
              id: "proportion",
              name: "Direct Proportion",
              description: "Solving problems involving direct proportion",
              priority: 3,
              estimatedHours: 2,
              learningObjectives: [
                {
                  id: "prop_01",
                  code: "8Ma8.02",
                  title: "Solve proportion problems",
                  description: "Use direct proportion to solve problems",
                  difficulty: 4,
                  prerequisites: ["ratio_01", "eq_01"]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Utility functions for curriculum management
export class CurriculumManager {
  
  // Get all learning objectives in dependency order
  static getPrerequisiteOrder(curriculum: Curriculum): LearningObjective[] {
    const allObjectives: LearningObjective[] = [];
    
    curriculum.strands.forEach(strand => {
      strand.chapters.forEach(chapter => {
        chapter.subtopics.forEach(subtopic => {
          allObjectives.push(...subtopic.learningObjectives);
        });
      });
    });

    // Sort by prerequisites (topological sort)
    const sorted: LearningObjective[] = [];
    const visited = new Set<string>();
    
    const visit = (objective: LearningObjective) => {
      if (visited.has(objective.id)) return;
      
      // Visit prerequisites first
      objective.prerequisites.forEach(prereqId => {
        const prereq = allObjectives.find(obj => obj.id === prereqId);
        if (prereq) visit(prereq);
      });
      
      visited.add(objective.id);
      sorted.push(objective);
    };

    allObjectives.forEach(visit);
    return sorted;
  }

  // Get chapter by ID
  static getChapter(curriculum: Curriculum, chapterId: string): Chapter | null {
    for (const strand of curriculum.strands) {
      const chapter = strand.chapters.find(ch => ch.id === chapterId);
      if (chapter) return chapter;
    }
    return null;
  }

  // Get subtopic by ID
  static getSubtopic(curriculum: Curriculum, subtopicId: string): Subtopic | null {
    for (const strand of curriculum.strands) {
      for (const chapter of strand.chapters) {
        const subtopic = chapter.subtopics.find(st => st.id === subtopicId);
        if (subtopic) return subtopic;
      }
    }
    return null;
  }

  // Get learning objective by ID
  static getLearningObjective(curriculum: Curriculum, objectiveId: string): LearningObjective | null {
    for (const strand of curriculum.strands) {
      for (const chapter of strand.chapters) {
        for (const subtopic of chapter.subtopics) {
          const objective = subtopic.learningObjectives.find(obj => obj.id === objectiveId);
          if (objective) return objective;
        }
      }
    }
    return null;
  }

  // Calculate total hours for a strand/chapter/subtopic
  static calculateHours(curriculum: Curriculum, type: 'strand' | 'chapter' | 'subtopic', id: string): number {
    if (type === 'strand') {
      const strand = curriculum.strands.find(s => s.id === id);
      return strand ? strand.chapters.reduce((sum, ch) => sum + ch.estimatedHours, 0) : 0;
    }
    
    if (type === 'chapter') {
      const chapter = this.getChapter(curriculum, id);
      return chapter ? chapter.estimatedHours : 0;
    }
    
    if (type === 'subtopic') {
      const subtopic = this.getSubtopic(curriculum, id);
      return subtopic ? subtopic.estimatedHours : 0;
    }
    
    return 0;
  }

  // Get recommended study order based on prerequisites
  static getStudyOrder(curriculum: Curriculum): Chapter[] {
    const chapters = curriculum.strands.flatMap(strand => strand.chapters);
    const sorted: Chapter[] = [];
    const visited = new Set<string>();
    
    const visit = (chapter: Chapter) => {
      if (visited.has(chapter.id)) return;
      
      // Visit prerequisites first
      chapter.prerequisites.forEach(prereqId => {
        const prereq = chapters.find(ch => ch.id === prereqId);
        if (prereq) visit(prereq);
      });
      
      visited.add(chapter.id);
      sorted.push(chapter);
    };

    // Sort by priority, then visit
    chapters
      .sort((a, b) => b.priority - a.priority)
      .forEach(visit);
      
    return sorted;
  }
}

// Export the default curriculum
export default CAMBRIDGE_MATH_CURRICULUM;