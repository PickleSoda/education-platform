/**
 * Syllabus Seed Data
 * Shared data used by database seeding and OpenAPI documentation examples
 */

export interface SeedSyllabusItem {
  weekNumber?: number;
  title: string;
  description?: string;
  learningObjectives?: string[];
  sortOrder: number;
}

export interface CourseSyllabus {
  courseCode: string;
  items: SeedSyllabusItem[];
}

// ============================================================================
// CS-101: Introduction to Programming
// ============================================================================
const cs101Syllabus: SeedSyllabusItem[] = [
  {
    weekNumber: 1,
    title: 'Course Introduction & Programming Fundamentals',
    description:
      'Overview of the course structure, expectations, and learning outcomes. Introduction to programming concepts and Python environment setup.',
    learningObjectives: [
      'Understand the course structure and requirements',
      'Install and configure Python development environment',
      'Understand what is programming and its applications',
      'Learn about variables, data types, and basic syntax',
    ],
    sortOrder: 0,
  },
  {
    weekNumber: 2,
    title: 'Variables, Data Types, and Operations',
    description:
      'Deep dive into variables, different data types (int, float, string, bool), and arithmetic/comparison operations.',
    learningObjectives: [
      'Declare and use variables effectively',
      'Understand different data types and their uses',
      'Perform arithmetic and comparison operations',
      'Work with user input and output',
    ],
    sortOrder: 1,
  },
  {
    weekNumber: 3,
    title: 'Control Structures: Conditionals',
    description: 'Decision making with if, elif, and else statements. Boolean logic and conditional flow.',
    learningObjectives: [
      'Use if/elif/else statements',
      'Understand boolean logic and operators',
      'Implement decision-making in programs',
      'Create nested conditional structures',
    ],
    sortOrder: 2,
  },
  {
    weekNumber: 4,
    title: 'Control Structures: Loops',
    description:
      'Repetition with while and for loops. Loop control statements and nested loops.',
    learningObjectives: [
      'Use while and for loops effectively',
      'Understand loop iteration and counters',
      'Use break and continue statements',
      'Create nested loop structures',
    ],
    sortOrder: 3,
  },
  {
    weekNumber: 5,
    title: 'Functions and Code Organization',
    description:
      'Creating reusable code through functions, parameters, return values, and scope management.',
    learningObjectives: [
      'Define and call functions',
      'Work with parameters and return values',
      'Understand function scope and lifetime',
      'Create modular and reusable code',
    ],
    sortOrder: 4,
  },
  {
    weekNumber: 6,
    title: 'Data Structures: Lists and Tuples',
    description: 'Working with sequences, list operations, indexing, slicing, and list methods.',
    learningObjectives: [
      'Create and manipulate lists and tuples',
      'Use indexing and slicing operations',
      'Apply list methods and operations',
      'Understand mutability differences',
    ],
    sortOrder: 5,
  },
  {
    weekNumber: 7,
    title: 'Data Structures: Dictionaries and Sets',
    description: 'Working with key-value pairs and unique collections.',
    learningObjectives: [
      'Create and manipulate dictionaries',
      'Work with dictionary methods',
      'Use sets for unique collections',
      'Choose appropriate data structures',
    ],
    sortOrder: 6,
  },
  {
    weekNumber: 8,
    title: 'Midterm Review & Assessment',
    description: 'Review of concepts from weeks 1-7. Midterm examination.',
    learningObjectives: [
      'Consolidate learning from first half',
      'Review programming fundamentals',
      'Demonstrate understanding through assessment',
    ],
    sortOrder: 7,
  },
  {
    weekNumber: 9,
    title: 'String Manipulation and Regular Expressions',
    description: 'Advanced string operations, formatting, and pattern matching.',
    learningObjectives: [
      'Perform advanced string operations',
      'Use string formatting methods',
      'Understand regular expressions basics',
      'Process text data efficiently',
    ],
    sortOrder: 8,
  },
  {
    weekNumber: 10,
    title: 'File I/O and Exception Handling',
    description:
      'Reading and writing files, working with different file formats, and handling errors gracefully.',
    learningObjectives: [
      'Read and write files properly',
      'Work with different file formats (CSV, JSON, TXT)',
      'Handle exceptions and errors',
      'Implement robust error handling',
    ],
    sortOrder: 9,
  },
  {
    weekNumber: 11,
    title: 'Object-Oriented Programming Basics',
    description: 'Introduction to classes, objects, attributes, and methods.',
    learningObjectives: [
      'Understand OOP principles',
      'Define and instantiate classes',
      'Work with attributes and methods',
      'Use the __init__ method',
    ],
    sortOrder: 10,
  },
  {
    weekNumber: 12,
    title: 'OOP: Inheritance and Polymorphism',
    description: 'Advanced OOP concepts including inheritance, method overriding, and polymorphism.',
    learningObjectives: [
      'Implement class inheritance',
      'Override parent class methods',
      'Understand polymorphic behavior',
      'Design class hierarchies',
    ],
    sortOrder: 11,
  },
  {
    weekNumber: 13,
    title: 'Project Development & Best Practices',
    description: 'Putting it all together: writing complete programs, code organization, and best practices.',
    learningObjectives: [
      'Develop complete programs from scratch',
      'Follow Python coding conventions (PEP 8)',
      'Write documentation and comments',
      'Debug and optimize code',
    ],
    sortOrder: 12,
  },
  {
    weekNumber: 14,
    title: 'Final Review and Assessment',
    description: 'Comprehensive review of all course concepts and final examination.',
    learningObjectives: [
      'Synthesize all learned concepts',
      'Demonstrate programming competency',
      'Reflect on learning progress',
      'Plan next learning steps',
    ],
    sortOrder: 13,
  },
];

// ============================================================================
// CS-201: Data Structures and Algorithms
// ============================================================================
const cs201Syllabus: SeedSyllabusItem[] = [
  {
    weekNumber: 1,
    title: 'Course Overview & Algorithm Analysis',
    description: 'Course expectations and Big O notation for complexity analysis.',
    learningObjectives: [
      'Understand algorithm analysis concepts',
      'Use Big O notation effectively',
      'Analyze time and space complexity',
      'Compare algorithm efficiency',
    ],
    sortOrder: 0,
  },
  {
    weekNumber: 2,
    title: 'Stacks and Queues',
    description: 'LIFO and FIFO data structures, implementation, and applications.',
    learningObjectives: [
      'Implement stack data structure',
      'Implement queue data structure',
      'Understand LIFO and FIFO concepts',
      'Apply to real-world problems',
    ],
    sortOrder: 1,
  },
  {
    weekNumber: 3,
    title: 'Linked Lists',
    description:
      'Singly linked lists, doubly linked lists, operations, and performance characteristics.',
    learningObjectives: [
      'Implement singly linked lists',
      'Implement doubly linked lists',
      'Perform insertion and deletion operations',
      'Compare with array-based structures',
    ],
    sortOrder: 2,
  },
  {
    weekNumber: 4,
    title: 'Trees: Fundamentals and Binary Search Trees',
    description: 'Tree terminology, binary trees, and binary search tree operations.',
    learningObjectives: [
      'Understand tree concepts',
      'Implement binary search trees',
      'Perform tree traversals',
      'Maintain BST properties',
    ],
    sortOrder: 3,
  },
  {
    weekNumber: 5,
    title: 'Balanced Trees: AVL and Red-Black Trees',
    description: 'Self-balancing binary search trees and rotations for maintaining balance.',
    learningObjectives: [
      'Understand tree balancing concepts',
      'Implement AVL tree rotations',
      'Understand Red-Black tree properties',
      'Maintain tree balance during operations',
    ],
    sortOrder: 4,
  },
  {
    weekNumber: 6,
    title: 'Hash Tables and Hash Functions',
    description:
      'Hash functions, collision resolution, load factors, and practical hash table implementations.',
    learningObjectives: [
      'Design hash functions',
      'Handle hash collisions',
      'Understand load factors',
      'Implement hash tables',
    ],
    sortOrder: 5,
  },
  {
    weekNumber: 7,
    title: 'Graphs: Representation and Traversal',
    description:
      'Graph representations (adjacency list, adjacency matrix), DFS, and BFS algorithms.',
    learningObjectives: [
      'Represent graphs in code',
      'Implement depth-first search',
      'Implement breadth-first search',
      'Choose appropriate representations',
    ],
    sortOrder: 6,
  },
  {
    weekNumber: 8,
    title: 'Midterm Exam & Review',
    description: 'Comprehensive review of weeks 1-7 and midterm assessment.',
    learningObjectives: [
      'Consolidate first-half learning',
      'Demonstrate data structure knowledge',
      'Show algorithm analysis skills',
    ],
    sortOrder: 7,
  },
  {
    weekNumber: 9,
    title: 'Sorting Algorithms',
    description:
      'Comparison-based sorting (bubble, selection, insertion, merge, quick, heap sort) and their analysis.',
    learningObjectives: [
      'Implement various sorting algorithms',
      'Analyze sorting algorithm complexity',
      'Choose appropriate sorting methods',
      'Understand stable vs unstable sorts',
    ],
    sortOrder: 8,
  },
  {
    weekNumber: 10,
    title: 'Searching Algorithms & Optimization',
    description: 'Linear search, binary search, and search optimization techniques.',
    learningObjectives: [
      'Implement linear and binary search',
      'Analyze search algorithm performance',
      'Use binary search trees effectively',
      'Optimize search operations',
    ],
    sortOrder: 9,
  },
  {
    weekNumber: 11,
    title: 'Dynamic Programming',
    description:
      'Memoization, tabulation, and solving optimization problems with dynamic programming.',
    learningObjectives: [
      'Understand dynamic programming concepts',
      'Identify DP opportunities',
      'Implement memoization and tabulation',
      'Solve classic DP problems',
    ],
    sortOrder: 10,
  },
  {
    weekNumber: 12,
    title: 'Graph Algorithms: Shortest Path and Minimum Spanning Tree',
    description:
      'Dijkstra, Bellman-Ford, Floyd-Warshall algorithms; Kruskal and Prim for MST.',
    learningObjectives: [
      'Implement shortest path algorithms',
      'Implement minimum spanning tree algorithms',
      'Choose algorithms based on requirements',
      'Handle weighted graphs',
    ],
    sortOrder: 11,
  },
  {
    weekNumber: 13,
    title: 'Greedy Algorithms and Problem Solving Strategies',
    description: 'Greedy approach, divide and conquer, and backtracking strategies.',
    learningObjectives: [
      'Identify greedy algorithm opportunities',
      'Apply divide and conquer strategies',
      'Use backtracking for problems',
      'Select appropriate problem-solving approaches',
    ],
    sortOrder: 12,
  },
  {
    weekNumber: 14,
    title: 'Final Review and Project Presentations',
    description: 'Final review and presentation of course projects.',
    learningObjectives: [
      'Synthesize all algorithms and data structures',
      'Demonstrate algorithm selection skills',
      'Present solutions effectively',
      'Apply learning to new problems',
    ],
    sortOrder: 13,
  },
];

// ============================================================================
// CS-301: Web Development Fundamentals
// ============================================================================
const cs301Syllabus: SeedSyllabusItem[] = [
  {
    weekNumber: 1,
    title: 'Web Fundamentals & HTML Introduction',
    description: 'How the web works, client-server architecture, HTTP protocol, and HTML basics.',
    learningObjectives: [
      'Understand web architecture',
      'Learn HTTP and HTTPS protocols',
      'Write semantic HTML',
      'Use common HTML elements',
    ],
    sortOrder: 0,
  },
  {
    weekNumber: 2,
    title: 'HTML Forms and Advanced Elements',
    description: 'Form elements, input types, validation, and semantic HTML5 features.',
    learningObjectives: [
      'Create and validate HTML forms',
      'Use all input types effectively',
      'Implement form validation',
      'Use semantic HTML5 elements',
    ],
    sortOrder: 1,
  },
  {
    weekNumber: 3,
    title: 'CSS Fundamentals: Selectors and Box Model',
    description: 'CSS selectors, properties, box model, margins, padding, and borders.',
    learningObjectives: [
      'Use CSS selectors effectively',
      'Understand the box model',
      'Style text and elements',
      'Work with spacing and sizing',
    ],
    sortOrder: 2,
  },
  {
    weekNumber: 4,
    title: 'CSS Layout: Flexbox and Grid',
    description: 'Flexbox layout model, CSS Grid system, responsive design fundamentals.',
    learningObjectives: [
      'Master flexbox layout',
      'Master CSS Grid',
      'Create responsive layouts',
      'Combine layout methods',
    ],
    sortOrder: 3,
  },
  {
    weekNumber: 5,
    title: 'Responsive Design and Mobile-First',
    description:
      'Media queries, mobile-first approach, viewport configuration, and responsive images.',
    learningObjectives: [
      'Design mobile-first',
      'Use media queries effectively',
      'Optimize responsive images',
      'Test on different devices',
    ],
    sortOrder: 4,
  },
  {
    weekNumber: 6,
    title: 'JavaScript Fundamentals',
    description: 'Variables, data types, operators, control structures, and functions in JavaScript.',
    learningObjectives: [
      'Write JavaScript fundamentally',
      'Understand scoping and hoisting',
      'Use functions and callbacks',
      'Work with objects and arrays',
    ],
    sortOrder: 5,
  },
  {
    weekNumber: 7,
    title: 'DOM Manipulation and Events',
    description: 'Selecting elements, modifying content, handling events, and dynamic updates.',
    learningObjectives: [
      'Select and modify DOM elements',
      'Handle various event types',
      'Create dynamic user interactions',
      'Use event delegation',
    ],
    sortOrder: 6,
  },
  {
    weekNumber: 8,
    title: 'Midterm Project & Review',
    description: 'Build a static website project combining HTML, CSS, and JavaScript.',
    learningObjectives: [
      'Create complete website projects',
      'Apply layout and styling',
      'Implement interactivity',
      'Ensure responsive design',
    ],
    sortOrder: 7,
  },
  {
    weekNumber: 9,
    title: 'Asynchronous JavaScript: Callbacks, Promises, and Async/Await',
    description:
      'Understanding asynchronous operations, callbacks, promises, and modern async/await patterns.',
    learningObjectives: [
      'Understand asynchronous concepts',
      'Use promises effectively',
      'Work with async/await',
      'Handle errors in async code',
    ],
    sortOrder: 8,
  },
  {
    weekNumber: 10,
    title: 'APIs and Data Fetching',
    description: 'Fetch API, HTTP requests, REST principles, and working with JSON data.',
    learningObjectives: [
      'Use Fetch API for HTTP requests',
      'Work with REST APIs',
      'Handle API responses',
      'Implement error handling',
    ],
    sortOrder: 9,
  },
  {
    weekNumber: 11,
    title: 'Introduction to React: Components and JSX',
    description: 'React basics, component architecture, JSX syntax, and props usage.',
    learningObjectives: [
      'Understand React fundamentals',
      'Create functional components',
      'Use JSX syntax',
      'Work with props',
    ],
    sortOrder: 10,
  },
  {
    weekNumber: 12,
    title: 'React: State Management and Hooks',
    description: 'State, useState hook, useEffect hook, and component lifecycle.',
    learningObjectives: [
      'Manage component state',
      'Use React hooks effectively',
      'Handle side effects',
      'Create custom hooks',
    ],
    sortOrder: 11,
  },
  {
    weekNumber: 13,
    title: 'Backend Basics and Deployment',
    description: 'Introduction to backend concepts, APIs, databases, and deployment.',
    learningObjectives: [
      'Understand server-side concepts',
      'Deploy static websites',
      'Understand API integration',
      'Learn about backend languages',
    ],
    sortOrder: 12,
  },
  {
    weekNumber: 14,
    title: 'Final Project & Course Wrap-up',
    description:
      'Complete web application project and course reflection on becoming a web developer.',
    learningObjectives: [
      'Build complete web applications',
      'Integrate frontend and backend',
      'Deploy applications',
      'Plan continued learning',
    ],
    sortOrder: 13,
  },
];

// ============================================================================
// CS-302: Database Systems
// ============================================================================
const cs302Syllabus: SeedSyllabusItem[] = [
  {
    weekNumber: 1,
    title: 'Database Fundamentals & Relational Model',
    description:
      'Database concepts, relational model, tables, tuples, attributes, and keys.',
    learningObjectives: [
      'Understand database fundamentals',
      'Grasp relational model concepts',
      'Learn about keys and relationships',
      'Design basic database schemas',
    ],
    sortOrder: 0,
  },
  {
    weekNumber: 2,
    title: 'SQL: Data Definition Language (DDL)',
    description: 'CREATE, ALTER, DROP operations for managing database structure.',
    learningObjectives: [
      'Create tables and databases',
      'Define constraints and keys',
      'Modify schema structures',
      'Drop and manage objects',
    ],
    sortOrder: 1,
  },
  {
    weekNumber: 3,
    title: 'SQL: Data Manipulation Language (DML)',
    description: 'INSERT, UPDATE, DELETE operations for managing data.',
    learningObjectives: [
      'Insert data into tables',
      'Update existing data',
      'Delete data safely',
      'Use transactions',
    ],
    sortOrder: 2,
  },
  {
    weekNumber: 4,
    title: 'SQL: Querying with SELECT',
    description:
      'SELECT queries, WHERE clauses, filtering, and basic query operations.',
    learningObjectives: [
      'Write SELECT queries',
      'Filter data with WHERE',
      'Use comparison and logical operators',
      'Sort and limit results',
    ],
    sortOrder: 3,
  },
  {
    weekNumber: 5,
    title: 'Advanced SQL: Joins and Relationships',
    description:
      'INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN, and self-joins.',
    learningObjectives: [
      'Understand join types',
      'Combine data from multiple tables',
      'Use ON conditions correctly',
      'Handle complex relationships',
    ],
    sortOrder: 4,
  },
  {
    weekNumber: 6,
    title: 'Database Normalization',
    description:
      'Normal forms (1NF, 2NF, 3NF, BCNF), reducing redundancy, and improving data integrity.',
    learningObjectives: [
      'Understand normalization concepts',
      'Identify normal forms',
      'Normalize schemas',
      'Balance normalization with performance',
    ],
    sortOrder: 5,
  },
  {
    weekNumber: 7,
    title: 'Query Optimization and Performance',
    description: 'Indexing, execution plans, query optimization, and performance analysis.',
    learningObjectives: [
      'Create and use indexes',
      'Read execution plans',
      'Optimize slow queries',
      'Understand query costs',
    ],
    sortOrder: 6,
  },
  {
    weekNumber: 8,
    title: 'Midterm Exam',
    description: 'Assessment of database concepts and SQL skills from weeks 1-7.',
    learningObjectives: [
      'Demonstrate database knowledge',
      'Write complex SQL queries',
      'Show normalization understanding',
      'Optimize database designs',
    ],
    sortOrder: 7,
  },
  {
    weekNumber: 9,
    title: 'Advanced SQL: Aggregation and Grouping',
    description:
      'GROUP BY, HAVING, aggregate functions (COUNT, SUM, AVG, MAX, MIN).',
    learningObjectives: [
      'Use aggregate functions',
      'Group and filter with GROUP BY/HAVING',
      'Calculate statistics',
      'Analyze grouped data',
    ],
    sortOrder: 8,
  },
  {
    weekNumber: 10,
    title: 'Transactions and ACID Properties',
    description: 'ACID properties, transaction control, locks, and handling concurrency.',
    learningObjectives: [
      'Understand ACID properties',
      'Control transactions',
      'Handle concurrent access',
      'Implement proper locking',
    ],
    sortOrder: 9,
  },
  {
    weekNumber: 11,
    title: 'NoSQL Databases Introduction',
    description:
      'Introduction to document databases, key-value stores, and MongoDB basics.',
    learningObjectives: [
      'Understand NoSQL concepts',
      'Learn MongoDB fundamentals',
      'Compare SQL vs NoSQL',
      'Choose appropriate database types',
    ],
    sortOrder: 10,
  },
  {
    weekNumber: 12,
    title: 'Database Security and Backup',
    description:
      'User management, authentication, authorization, encryption, and backup strategies.',
    learningObjectives: [
      'Manage database users',
      'Implement access control',
      'Encrypt sensitive data',
      'Create backup and recovery plans',
    ],
    sortOrder: 11,
  },
  {
    weekNumber: 13,
    title: 'Advanced Topics and Real-World Applications',
    description: 'Replication, sharding, data warehousing, and cloud databases.',
    learningObjectives: [
      'Understand critical replication and sharding',
      'Learn about data warehouses',
      'Explore cloud database options',
      'Plan scalable systems',
    ],
    sortOrder: 12,
  },
  {
    weekNumber: 14,
    title: 'Final Project & Review',
    description: 'Design and implement a complete database system with optimization.',
    learningObjectives: [
      'Design normalized databases',
      'Implement complex queries',
      'Optimize performance',
      'Present database solutions',
    ],
    sortOrder: 13,
  },
];

// ============================================================================
// CS-401: Software Engineering Practices
// ============================================================================
const cs401Syllabus: SeedSyllabusItem[] = [
  {
    weekNumber: 1,
    title: 'Software Development Lifecycle and Methodologies',
    description:
      'SDLC phases, Waterfall, Agile, Scrum, and Kanban methodologies.',
    learningObjectives: [
      'Understand SDLC phases',
      'Compare development methodologies',
      'Learn Agile principles',
      'Understand Scrum framework',
    ],
    sortOrder: 0,
  },
  {
    weekNumber: 2,
    title: 'Requirements Gathering and Analysis',
    description:
      'User stories, use cases, functional/non-functional requirements, and specification documents.',
    learningObjectives: [
      'Write effective user stories',
      'Create use case diagrams',
      'Define requirements clearly',
      'Manage requirement changes',
    ],
    sortOrder: 1,
  },
  {
    weekNumber: 3,
    title: 'Software Design Principles and Patterns',
    description:
      'SOLID principles, design patterns, UML diagrams, and architectural design.',
    learningObjectives: [
      'Apply SOLID principles',
      'Use common design patterns',
      'Create UML diagrams',
      'Design system architecture',
    ],
    sortOrder: 2,
  },
  {
    weekNumber: 4,
    title: 'Code Quality and Best Practices',
    description:
      'Code review, refactoring, technical debt, clean code principles, and coding standards.',
    learningObjectives: [
      'Write clean, readable code',
      'Perform effective code reviews',
      'Identify and manage technical debt',
      'Apply boy scout rule',
    ],
    sortOrder: 3,
  },
  {
    weekNumber: 5,
    title: 'Version Control and Collaboration',
    description:
      'Git fundamentals, branching strategies, merge conflicts, and collaborative workflows.',
    learningObjectives: [
      'Master Git workflows',
      'Use branching effectively',
      'Resolve merge conflicts',
      'Collaborate on code',
    ],
    sortOrder: 4,
  },
  {
    weekNumber: 6,
    title: 'Testing Strategies and Test-Driven Development',
    description:
      'Unit testing, integration testing, TDD, test coverage, and quality metrics.',
    learningObjectives: [
      'Write unit tests',
      'Understand TDD process',
      'Measure test coverage',
      'Implement testing strategies',
    ],
    sortOrder: 5,
  },
  {
    weekNumber: 7,
    title: 'Continuous Integration and Continuous Deployment',
    description:
      'CI/CD pipelines, automation, build systems, and deployment strategies.',
    learningObjectives: [
      'Set up CI/CD pipelines',
      'Automate testing and builds',
      'Implement continuous deployment',
      'Monitor and maintain systems',
    ],
    sortOrder: 6,
  },
  {
    weekNumber: 8,
    title: 'Midterm Project Kickoff',
    description: 'Team project planning and architecture design.',
    learningObjectives: [
      'Plan team projects',
      'Design system architecture',
      'Establish development workflows',
      'Set quality standards',
    ],
    sortOrder: 7,
  },
  {
    weekNumber: 9,
    title: 'Communication and Documentation',
    description:
      'Technical documentation, API documentation, communication skills, and knowledge sharing.',
    learningObjectives: [
      'Write technical documentation',
      'Create API documentation',
      'Communicate effectively',
      'Share knowledge with teams',
    ],
    sortOrder: 8,
  },
  {
    weekNumber: 10,
    title: 'Risk Management and Project Management',
    description:
      'Risk identification, mitigation, project planning, estimation, and timeline management.',
    learningObjectives: [
      'Identify and mitigate risks',
      'Estimate task effort',
      'Plan and schedule projects',
      'Manage stakeholder expectations',
    ],
    sortOrder: 9,
  },
  {
    weekNumber: 11,
    title: 'Debugging, Profiling, and Performance Optimization',
    description:
      'Debugging techniques, profiling tools, performance analysis, and optimization.',
    learningObjectives: [
      'Debug efficiently',
      'Profile applications',
      'Identify bottlenecks',
      'Optimize performance',
    ],
    sortOrder: 10,
  },
  {
    weekNumber: 12,
    title: 'Security in Software Development',
    description:
      'OWASP top 10, secure coding practices, vulnerability testing, and security reviews.',
    learningObjectives: [
      'Understand security vulnerabilities',
      'Apply secure coding practices',
      'Perform security testing',
      'Implement security measures',
    ],
    sortOrder: 11,
  },
  {
    weekNumber: 13,
    title: 'Software Maintenance and Legacy Systems',
    description:
      'Maintenance strategies, handling legacy code, refactoring, and system evolution.',
    learningObjectives: [
      'Maintain software systems',
      'Work with legacy code',
      'Plan refactoring efforts',
      'Handle system evolution',
    ],
    sortOrder: 12,
  },
  {
    weekNumber: 14,
    title: 'Final Project Presentations and Course Reflection',
    description: 'Present team projects and reflect on software engineering practices.',
    learningObjectives: [
      'Present work professionally',
      'Critique other solutions',
      'Reflect on engineering practices',
      'Plan professional growth',
    ],
    sortOrder: 13,
  },
];

// ============================================================================
// CS-450: Introduction to Machine Learning
// ============================================================================
const cs450Syllabus: SeedSyllabusItem[] = [
  {
    weekNumber: 1,
    title: 'Machine Learning Fundamentals and Types',
    description:
      'Introduction to ML, supervised vs unsupervised learning, regression vs classification.',
    learningObjectives: [
      'Understand ML fundamentals',
      'Learn types of machine learning',
      'Understand supervised learning',
      'Understand unsupervised learning',
    ],
    sortOrder: 0,
  },
  {
    weekNumber: 2,
    title: 'Data Preparation and Exploration',
    description: 'Data collection, cleaning, exploration, visualization, and feature scaling.',
    learningObjectives: [
      'Load and explore datasets',
      'Clean and preprocess data',
      'Visualize data patterns',
      'Handle missing values',
    ],
    sortOrder: 1,
  },
  {
    weekNumber: 3,
    title: 'Linear Regression',
    description:
      'Simple and multiple linear regression, least squares, and evaluation metrics.',
    learningObjectives: [
      'Implement linear regression',
      'Understand mathematical concepts',
      'Evaluate model performance',
      'Make predictions',
    ],
    sortOrder: 2,
  },
  {
    weekNumber: 4,
    title: 'Logistic Regression and Classification',
    description:
      'Logistic regression, classification metrics, confusion matrix, precision, recall, F1-score.',
    learningObjectives: [
      'Implement logistic regression',
      'Evaluate classification models',
      'Understand classification metrics',
      'Handle imbalanced data',
    ],
    sortOrder: 3,
  },
  {
    weekNumber: 5,
    title: 'Decision Trees and Random Forests',
    description:
      'Decision tree construction, pruning, ensemble methods, and random forests.',
    learningObjectives: [
      'Build decision trees',
      'Understand tree-based models',
      'Use random forests',
      'Handle feature importance',
    ],
    sortOrder: 4,
  },
  {
    weekNumber: 6,
    title: 'Support Vector Machines and Kernel Methods',
    description: 'SVM fundamentals, kernel trick, and applications.',
    learningObjectives: [
      'Understand SVM concepts',
      'Use kernel methods',
      'Apply SVM to problems',
      'Tune SVM parameters',
    ],
    sortOrder: 5,
  },
  {
    weekNumber: 7,
    title: 'Neural Networks Basics',
    description:
      'Perceptron, multi-layer networks, activation functions, and backpropagation.',
    learningObjectives: [
      'Understand neural network architecture',
      'Learn activation functions',
      'Understand backpropagation',
      'Build simple networks',
    ],
    sortOrder: 6,
  },
  {
    weekNumber: 8,
    title: 'Midterm Exam and Project',
    description:
      'Assessment and start supervised learning project.',
    learningObjectives: [
      'Demonstrate ML fundamentals',
      'Build supervised learning models',
      'Evaluate model performance',
      'Solve real-world problems',
    ],
    sortOrder: 7,
  },
  {
    weekNumber: 9,
    title: 'Unsupervised Learning: Clustering',
    description: 'K-means, hierarchical clustering, and DBSCAN.',
    learningObjectives: [
      'Implement clustering algorithms',
      'Choose appropriate k',
      'Evaluate clustering quality',
      'Interpret clusters',
    ],
    sortOrder: 8,
  },
  {
    weekNumber: 10,
    title: 'Unsupervised Learning: Dimensionality Reduction',
    description: 'PCA, feature selection, and visualization techniques.',
    learningObjectives: [
      'Apply PCA',
      'Reduce feature dimensions',
      'Visualize high-dimensional data',
      'Improve computational efficiency',
    ],
    sortOrder: 9,
  },
  {
    weekNumber: 11,
    title: 'Model Validation and Hyperparameter Tuning',
    description:
      'Cross-validation, overfitting, underfitting, grid search, and random search.',
    learningObjectives: [
      'Use cross-validation',
      'Detect and address overfitting',
      'Tune hyperparameters',
      'Select best models',
    ],
    sortOrder: 10,
  },
  {
    weekNumber: 12,
    title: 'Feature Engineering and Selection',
    description:
      'Creating new features, selecting important features, and domain knowledge application.',
    learningObjectives: [
      'Engineer meaningful features',
      'Select relevant features',
      'Handle categorical variables',
      'Apply domain knowledge',
    ],
    sortOrder: 11,
  },
  {
    weekNumber: 13,
    title: 'Advanced Topics and Real-World Applications',
    description:
      'Ensemble methods, deep learning overview, and production ML systems.',
    learningObjectives: [
      'Use ensemble techniques',
      'Understand deep learning basics',
      'Learn about ML in production',
      'Deploy ML models',
    ],
    sortOrder: 12,
  },
  {
    weekNumber: 14,
    title: 'Final Project Presentation and Review',
    description: 'Present ML projects and reflect on learning.',
    learningObjectives: [
      'Present ML solutions',
      'Critique methodologies',
      'Evaluate model selections',
      'Plan advanced ML learning',
    ],
    sortOrder: 13,
  },
];

// ============================================================================
// EXPORT ALL SYLLABUS DATA
// ============================================================================

export const seedSyllabuses: CourseSyllabus[] = [
  {
    courseCode: 'CS-101',
    items: cs101Syllabus,
  },
  {
    courseCode: 'CS-201',
    items: cs201Syllabus,
  },
  {
    courseCode: 'CS-301',
    items: cs301Syllabus,
  },
  {
    courseCode: 'CS-302',
    items: cs302Syllabus,
  },
  {
    courseCode: 'CS-401',
    items: cs401Syllabus,
  },
  {
    courseCode: 'CS-450',
    items: cs450Syllabus,
  },
];
