export interface Option {
	id: string;
	text: string;
}

export interface Question {
	id: string;
	type: "multiple_choice" | "checkbox" | "short_answer" | "paragraph";
	text: string;
	points: number;
	options?: Option[];
	correctAnswer?: string[]; // Array of option IDs or text matches
}

export interface FormAttachment {
	type: "form";
	id: string;
	title?: string;
	questions: Question[];
}

export interface FileAttachment {
	type: "file";
	id: string;
	name: string;
	url: string;
	mimeType?: string;
}

export type Attachment = FileAttachment | FormAttachment;

// Student submission types
export interface QuestionAnswer {
	questionId: string;
	answer: string[]; // For multiple choice/checkbox: option IDs, for text: single string
}

export interface FormSubmission {
	formId: string;
	answers: QuestionAnswer[];
}

// Grading types
export interface QuestionGrade {
	questionId: string;
	pointsAwarded: number;
	maxPoints: number;
	isCorrect?: boolean;
}

export interface FormGrade {
	formId: string;
	questionGrades: QuestionGrade[];
	totalPoints: number;
	maxTotalPoints: number;
}
