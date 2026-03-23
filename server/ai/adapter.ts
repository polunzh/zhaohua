export interface AiAdapter {
  name: string;
  generateText(prompt: string, systemPrompt?: string): Promise<string>;
}

interface AiConfig {
  model: string;
  apiKey: string;
  baseUrl: string;
}

export function createAiAdapter(config: AiConfig): AiAdapter {
  switch (config.model) {
    case "deepseek":
      return {
        name: "deepseek",
        async generateText(prompt: string, systemPrompt?: string): Promise<string> {
          const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
                { role: "user", content: prompt },
              ],
              max_tokens: 300,
              temperature: 0.8,
            }),
          });
          const data = (await response.json()) as any;
          return data.choices[0].message.content;
        },
      };
    default:
      throw new Error(`Unknown AI model: ${config.model}`);
  }
}
