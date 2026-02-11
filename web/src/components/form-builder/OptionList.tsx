import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Icon } from "@/components/icon";
import { Checkbox } from "@/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Label } from "@/ui/label";
import type { Option } from "./types";

interface OptionListProps {
	options: Option[];
	correctAnswer: string[];
	questionType: "multiple_choice" | "checkbox";
	onOptionsChange: (options: Option[]) => void;
	onCorrectAnswerChange: (correctAnswer: string[]) => void;
}

export function OptionList({
	options,
	correctAnswer,
	questionType,
	onOptionsChange,
	onCorrectAnswerChange,
}: OptionListProps) {
	const addOption = () => {
		const newOption: Option = {
			id: `opt_${Date.now()}`,
			text: "",
		};
		onOptionsChange([...options, newOption]);
	};

	const updateOption = (index: number, text: string) => {
		const updated = [...options];
		updated[index] = { ...updated[index], text };
		onOptionsChange(updated);
	};

	const removeOption = (index: number) => {
		const optionId = options[index].id;
		const updated = options.filter((_, i) => i !== index);
		onOptionsChange(updated);

		// Remove from correct answer if it was selected
		const updatedCorrectAnswer = correctAnswer.filter((id) => id !== optionId);
		onCorrectAnswerChange(updatedCorrectAnswer);
	};

	const handleCorrectAnswerChange = (optionId: string, checked: boolean) => {
		if (questionType === "multiple_choice") {
			// Single selection for multiple choice
			onCorrectAnswerChange(checked ? [optionId] : []);
		} else if (questionType === "checkbox") {
			// Multiple selection for checkbox
			if (checked) {
				onCorrectAnswerChange([...correctAnswer, optionId]);
			} else {
				onCorrectAnswerChange(correctAnswer.filter((id) => id !== optionId));
			}
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-medium">Options</Label>
				<Button type="button" variant="outline" size="sm" onClick={addOption}>
					<Icon icon="solar:add-circle-bold-duotone" size={16} className="mr-1" />
					Add Option
				</Button>
			</div>

			<div className="space-y-2">
				{options.map((option, index) => (
					<div key={option.id} className="flex items-center gap-3 p-3 border rounded-lg">
						{/* Correct answer selector */}
						<div className="flex-shrink-0">
							{questionType === "multiple_choice" ? (
								<RadioGroup
									value={correctAnswer.includes(option.id) ? option.id : ""}
									onValueChange={(value) => handleCorrectAnswerChange(option.id, value === option.id)}
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value={option.id} id={`correct-${option.id}`} />
										<Label htmlFor={`correct-${option.id}`} className="text-xs text-text-secondary">
											Correct
										</Label>
									</div>
								</RadioGroup>
							) : (
								<div className="flex items-center space-x-2">
									<Checkbox
										id={`correct-${option.id}`}
										checked={correctAnswer.includes(option.id)}
										onCheckedChange={(checked) => handleCorrectAnswerChange(option.id, checked === true)}
									/>
									<Label htmlFor={`correct-${option.id}`} className="text-xs text-text-secondary">
										Correct
									</Label>
								</div>
							)}
						</div>

						{/* Option text input */}
						<Input
							value={option.text}
							onChange={(e) => updateOption(index, e.target.value)}
							placeholder={`Option ${index + 1}`}
							className="flex-1"
						/>

						{/* Remove button */}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => removeOption(index)}
							disabled={options.length <= 2}
							className="text-error hover:text-error"
						>
							<Icon icon="solar:trash-bin-minimalistic-bold-duotone" size={16} />
						</Button>
					</div>
				))}
			</div>

			{options.length < 2 && <p className="text-xs text-text-secondary">At least 2 options are required.</p>}
		</div>
	);
}
