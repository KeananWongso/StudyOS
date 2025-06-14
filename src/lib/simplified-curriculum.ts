// Simplified Cambridge Mathematics Curriculum

export interface Subtopic {
  id: string;
  name: string;
  description: string;
}

export interface Chapter {
  id: string;
  name: string;
  description: string;
  subtopics: Subtopic[];
}

export interface Strand {
  id: string;
  name: string;
  description: string;
  color: string;
  chapters: Chapter[];
}

export interface SimplifiedCurriculum {
  id: string;
  name: string;
  description: string;
  level: string;
  strands: Strand[];
  lastUpdated: Date;
}

// Cambridge Mathematics - Simplified 15 Day Course
export const SIMPLIFIED_CAMBRIDGE_CURRICULUM: SimplifiedCurriculum = {
  id: "cambridge-math-15day",
  name: "Cambridge Mathematics - 15 Day Course",
  description: "Essential mathematics topics for Cambridge Lower Secondary",
  level: "Cambridge Lower Secondary (Ages 11-14)",
  lastUpdated: new Date(),
  strands: [
    {
      id: "number",
      name: "Number",
      description: "Number operations, fractions, decimals, and percentages",
      color: "#3B82F6",
      chapters: [
        {
          id: "number_operations",
          name: "Number Operations",
          description: "Basic arithmetic operations with integers",
          subtopics: [
            {
              id: "integers",
              name: "Integers",
              description: "Operations with positive and negative integers"
            },
            {
              id: "order_operations",
              name: "Order of Operations",
              description: "BIDMAS/PEMDAS rule application"
            },
            {
              id: "estimation",
              name: "Estimation and Approximation",
              description: "Rounding and estimation techniques"
            }
          ]
        },
        {
          id: "fractions_decimals",
          name: "Fractions and Decimals",
          description: "Operations with fractions, decimals, and percentages",
          subtopics: [
            {
              id: "fraction_operations",
              name: "Fraction Operations",
              description: "Add, subtract, multiply, and divide fractions"
            },
            {
              id: "decimal_operations",
              name: "Decimal Operations", 
              description: "Operations with decimal numbers"
            },
            {
              id: "percentages",
              name: "Percentages",
              description: "Percentage calculations and applications"
            },
            {
              id: "fractions_decimals_conversion",
              name: "Converting Between Forms",
              description: "Converting between fractions, decimals, and percentages"
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
          subtopics: [
            {
              id: "expressions",
              name: "Expressions and Terms",
              description: "Understanding algebraic expressions and collecting like terms"
            },
            {
              id: "substitution",
              name: "Substitution",
              description: "Substituting values into algebraic expressions"
            },
            {
              id: "expanding",
              name: "Expanding Brackets",
              description: "Expanding simple algebraic expressions"
            }
          ]
        },
        {
          id: "equations",
          name: "Linear Equations",
          description: "Solving linear equations and inequalities",
          subtopics: [
            {
              id: "linear_equations",
              name: "Linear Equations",
              description: "Solving equations of the form ax + b = c"
            },
            {
              id: "equation_problems",
              name: "Equation Word Problems",
              description: "Setting up and solving real-world problems"
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
          subtopics: [
            {
              id: "angles",
              name: "Angles",
              description: "Types of angles and angle relationships"
            },
            {
              id: "triangles",
              name: "Triangles",
              description: "Triangle properties and calculations"
            },
            {
              id: "quadrilaterals",
              name: "Quadrilaterals",
              description: "Properties of squares, rectangles, parallelograms"
            },
            {
              id: "circles",
              name: "Circles",
              description: "Circle properties and circumference"
            }
          ]
        },
        {
          id: "measurement",
          name: "Area and Volume",
          description: "Calculating area and volume of 2D and 3D shapes",
          subtopics: [
            {
              id: "area_2d",
              name: "Area of 2D Shapes",
              description: "Area of rectangles, triangles, and circles"
            },
            {
              id: "volume_3d",
              name: "Volume of 3D Shapes",
              description: "Volume of cubes, cuboids, and cylinders"
            },
            {
              id: "units_conversion",
              name: "Units and Conversion",
              description: "Converting between different units of measurement"
            }
          ]
        },
        {
          id: "coordinate_geometry",
          name: "Coordinate Geometry",
          description: "Plotting points and finding distances on coordinate grids",
          subtopics: [
            {
              id: "coordinates",
              name: "Coordinate Plotting",
              description: "Plotting and reading coordinates"
            },
            {
              id: "gradients",
              name: "Gradients and Lines",
              description: "Finding gradients of lines"
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
          id: "data_analysis",
          name: "Data Analysis",
          description: "Collecting, presenting, and interpreting data",
          subtopics: [
            {
              id: "data_collection",
              name: "Data Collection",
              description: "Methods of collecting and organizing data"
            },
            {
              id: "averages",
              name: "Averages",
              description: "Mean, median, mode, and range"
            },
            {
              id: "charts_graphs",
              name: "Charts and Graphs",
              description: "Creating and interpreting charts and graphs"
            }
          ]
        },
        {
          id: "probability",
          name: "Probability",
          description: "Basic probability and simple events",
          subtopics: [
            {
              id: "basic_probability",
              name: "Basic Probability",
              description: "Probability of simple events"
            },
            {
              id: "probability_experiments",
              name: "Probability Experiments",
              description: "Conducting and analyzing probability experiments"
            }
          ]
        },
        {
          id: "ratio_proportion",
          name: "Ratio and Proportion",
          description: "Understanding and applying ratios and proportions",
          subtopics: [
            {
              id: "ratios",
              name: "Ratios",
              description: "Expressing and simplifying ratios"
            },
            {
              id: "proportion",
              name: "Direct Proportion",
              description: "Solving problems involving direct proportion"
            },
            {
              id: "scale_maps",
              name: "Scale and Maps",
              description: "Using scale factors and reading maps"
            }
          ]
        }
      ]
    }
  ]
};

// Utility functions for simplified curriculum management
export class SimplifiedCurriculumManager {
  
  // Get chapter by ID
  static getChapter(curriculum: SimplifiedCurriculum, chapterId: string): Chapter | null {
    for (const strand of curriculum.strands) {
      const chapter = strand.chapters.find(ch => ch.id === chapterId);
      if (chapter) return chapter;
    }
    return null;
  }

  // Get subtopic by ID
  static getSubtopic(curriculum: SimplifiedCurriculum, subtopicId: string): Subtopic | null {
    for (const strand of curriculum.strands) {
      for (const chapter of strand.chapters) {
        const subtopic = chapter.subtopics.find(st => st.id === subtopicId);
        if (subtopic) return subtopic;
      }
    }
    return null;
  }

  // Get strand by ID
  static getStrand(curriculum: SimplifiedCurriculum, strandId: string): Strand | null {
    return curriculum.strands.find(s => s.id === strandId) || null;
  }

  // Get full topic path (strand/chapter/subtopic)
  static getTopicPath(curriculum: SimplifiedCurriculum, strandId: string, chapterId: string, subtopicId: string): string {
    return `${strandId}/${chapterId}/${subtopicId}`;
  }

  // Get display name for topic path
  static getTopicDisplayName(curriculum: SimplifiedCurriculum, topicPath: string): string {
    const [strandId, chapterId, subtopicId] = topicPath.split('/');
    
    const strand = this.getStrand(curriculum, strandId);
    const chapter = this.getChapter(curriculum, chapterId);
    const subtopic = this.getSubtopic(curriculum, subtopicId);
    
    if (strand && chapter && subtopic) {
      return `${strand.name} → ${chapter.name} → ${subtopic.name}`;
    }
    
    return topicPath.replace(/[_/]/g, ' ');
  }

  // Get all topic paths as options for selection
  static getAllTopicOptions(curriculum: SimplifiedCurriculum): Array<{value: string, label: string, strand: string, chapter: string}> {
    const options: Array<{value: string, label: string, strand: string, chapter: string}> = [];
    
    curriculum.strands.forEach(strand => {
      strand.chapters.forEach(chapter => {
        chapter.subtopics.forEach(subtopic => {
          const value = `${strand.id}/${chapter.id}/${subtopic.id}`;
          const label = `${strand.name} → ${chapter.name} → ${subtopic.name}`;
          options.push({
            value,
            label,
            strand: strand.name,
            chapter: chapter.name
          });
        });
      });
    });
    
    return options;
  }
}

// Export the simplified curriculum as default
export default SIMPLIFIED_CAMBRIDGE_CURRICULUM;