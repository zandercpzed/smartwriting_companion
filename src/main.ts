import { Plugin } from 'obsidian';

export default class SmartWriteCompanion extends Plugin {
	async onload() {
		console.log('SmartWrite Companion plugin loaded');
	}

	onunload() {
		console.log('SmartWrite Companion plugin unloaded');
	}
}