import { IHttp, IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
const appConfig = require('./app.json');

export class GeminiCommand implements ISlashCommand {
	public command = 'gemini';
	public i18nParamsExample = 'your_prompt';
	public i18nDescription = 'gemini_command_description';
	public providesPreview = false;

	public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp): Promise<void> {
		const args = context.getArguments();
		const input = args.join(' ');

		// Get the API key and model from the environment variables
		const apiKey = await read.getEnvironmentReader().getSettings().getValueById('gemini_api_key');
		const geminiModel = await read.getEnvironmentReader().getSettings().getValueById('gemini_model');

		const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

		let geminiResponse: any;

		if (!apiKey) {
			geminiResponse = 'Invalid API key. Please enter a valid API key in the Apps (tab Settings).';
		} else {
			const result = await http.post(url, {
				headers: {
					'Content-Type': 'application/json',
				},
				data: {
					contents: [
						{
							role: 'user',
							parts: [
								{
									text: input,
								},
							],
						},
					],
					generationConfig: {
						temperature: 0.9,
						topK: 1,
						topP: 1,
						maxOutputTokens: 2048,
						stopSequences: [],
					},
					safetySettings: [
						{
							category: 'HARM_CATEGORY_HARASSMENT',
							threshold: 'BLOCK_MEDIUM_AND_ABOVE',
						},
						{
							category: 'HARM_CATEGORY_HATE_SPEECH',
							threshold: 'BLOCK_MEDIUM_AND_ABOVE',
						},
						{
							category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
							threshold: 'BLOCK_MEDIUM_AND_ABOVE',
						},
						{
							category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
							threshold: 'BLOCK_MEDIUM_AND_ABOVE',
						},
					],
				},
			});

			if (result.statusCode === 200) {
				const data = JSON.parse(result.content || '{}');
				geminiResponse = data.candidates[0].content.parts[0].text;
			} else {
				geminiResponse = 'An error occurred while processing your request. Please try again later.';
			}
		}

		// Create a message
		const user = await read.getUserReader().getByUsername(context.getSender().username);
		const userBuilder = modify.getCreator().startMessage().setSender(user).setRoom(context.getRoom()).setText(input);
		await modify.getCreator().finish(userBuilder);

		const botUser = await read.getUserReader().getByUsername(`${appConfig.nameSlug}.bot`);
		const botBuilder = modify.getCreator().startMessage().setSender(botUser).setRoom(context.getRoom()).setText(geminiResponse);
		await modify.getCreator().finish(botBuilder);
	}
}
