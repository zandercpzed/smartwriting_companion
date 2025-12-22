export interface SmartWriteSettings {
	dailyGoal: number;
	readingSpeed: number;
}

export const DEFAULT_SETTINGS: SmartWriteSettings = {
	dailyGoal: 2000,
	readingSpeed: 200,
};