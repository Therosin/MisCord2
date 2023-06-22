import { isNullishOrEmpty } from '@sapphire/utilities';

export function envParseArray(key: string, defaultValue?: string[]): string[] {
	const value = process.env[key];
	if (isNullishOrEmpty(value)) {
		if (defaultValue === undefined) throw new Error(`[ENV] ${key} - The key must be an array, but is empty or undefined.`);
		return defaultValue;
	}

	return value.split(' ');
}

export function envParseBoolean(key: string, defaultValue?: boolean): boolean {
	const value = process.env[key];
	if (isNullishOrEmpty(value)) {
		if (defaultValue === undefined) throw new Error(`[ENV] ${key} - The key must be a boolean, but is empty or undefined.`);
		return defaultValue;
	}

	return value === 'true';
}

export function envParseNumber(key: string, defaultValue?: number): number {
	const value = process.env[key];
	if (isNullishOrEmpty(value)) {
		if (defaultValue === undefined) throw new Error(`[ENV] ${key} - The key must be a number, but is empty or undefined.`);
		return defaultValue;
	}

	const parsed = Number(value);
	if (Number.isNaN(parsed)) throw new Error(`[ENV] ${key} - The key must be a number, but is NaN.`);
	return parsed;
}

export function envParseString(key: string, defaultValue?: string): string {
	const value = process.env[key];
	if (isNullishOrEmpty(value)) {
		if (defaultValue === undefined) throw new Error(`[ENV] ${key} - The key must be a string, but is empty or undefined.`);
		return defaultValue;
	}

	return value;
}
