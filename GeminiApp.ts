import { IConfigurationExtend, IAppAccessors, ILogger } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { GeminiCommand } from './commands/GeminiCommand';

export class GeminiApp extends App {
	constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
		super(info, logger, accessors);
	}

	public async extendConfiguration(configuration: IConfigurationExtend) {
		await configuration.settings.provideSetting({
			id: 'gemini_api_key',
			type: SettingType.STRING,
			packageValue: '',
			required: true,
			public: false,
			i18nLabel: 'gemini_api_key_label',
			i18nDescription: 'gemini_api_key_description',
			i18nPlaceholder: 'gemini_api_key_placeholder',
		});

		await configuration.settings.provideSetting({
			id: 'gemini_model',
			type: SettingType.SELECT,
			packageValue: 'gemini-1.0-pro',
			values: [
				{ key: 'gemini-1.0-pro', i18nLabel: 'gemini-1.0-pro' },
				{ key: 'gemini-1.5-pro-latest', i18nLabel: 'gemini-1.5-pro-latest' },
				{ key: 'gemini-1.5-flash-latest', i18nLabel: 'gemini-1.5-flash-latest' },
			],
			required: true,
			public: false,
			i18nLabel: 'gemini_model_label',
			i18nDescription: 'gemini_model_description',
		});

		configuration.slashCommands.provideSlashCommand(new GeminiCommand());
	}
}
