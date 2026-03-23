export interface AiAdapter {
  name: string;
  generateText(prompt: string, systemPrompt?: string): Promise<string>;
}

interface AiConfig {
  model: string;
  apiKey: string;
  baseUrl: string;
}

interface ProviderConfig {
  name: string;
  defaultBaseUrl: string;
  defaultModel: string;
  format: "openai" | "anthropic";
}

const providers: Record<string, ProviderConfig> = {
  deepseek: {
    name: "deepseek",
    defaultBaseUrl: "https://api.deepseek.com",
    defaultModel: "deepseek-chat",
    format: "openai",
  },
  kimi: {
    name: "kimi",
    defaultBaseUrl: "https://api.moonshot.cn",
    defaultModel: "moonshot-v1-8k",
    format: "openai",
  },
  minimax: {
    name: "minimax",
    defaultBaseUrl: "https://api.minimax.chat",
    defaultModel: "abab6.5-chat",
    format: "openai",
  },
  openai: {
    name: "openai",
    defaultBaseUrl: "https://api.openai.com",
    defaultModel: "gpt-4o-mini",
    format: "openai",
  },
  claude: {
    name: "claude",
    defaultBaseUrl: "https://api.anthropic.com",
    defaultModel: "claude-sonnet-4-20250514",
    format: "anthropic",
  },
};

export function createAiAdapter(config: AiConfig): AiAdapter {
  const provider = providers[config.model];
  if (!provider) throw new Error(`Unknown AI model: ${config.model}`);

  const baseUrl = config.baseUrl || provider.defaultBaseUrl;

  if (provider.format === "anthropic") {
    return createAnthropicAdapter(provider.name, baseUrl, config.apiKey, provider.defaultModel);
  }
  return createOpenAICompatAdapter(provider.name, baseUrl, config.apiKey, provider.defaultModel);
}

function createOpenAICompatAdapter(
  name: string,
  baseUrl: string,
  apiKey: string,
  model: string,
): AiAdapter {
  return {
    name,
    async generateText(prompt, systemPrompt) {
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt },
          ],
          max_tokens: 300,
          temperature: 0.8,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`AI API error (${response.status}): ${text}`);
      }
      const data = (await response.json()) as any;
      if (!data.choices?.length) {
        throw new Error(`AI API returned no choices: ${JSON.stringify(data)}`);
      }
      return data.choices[0].message.content;
    },
  };
}

function createAnthropicAdapter(
  name: string,
  baseUrl: string,
  apiKey: string,
  model: string,
): AiAdapter {
  return {
    name,
    async generateText(prompt, systemPrompt) {
      const response = await fetch(`${baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 300,
          ...(systemPrompt ? { system: systemPrompt } : {}),
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`AI API error (${response.status}): ${text}`);
      }
      const data = (await response.json()) as any;
      if (!data.content?.length) {
        throw new Error(`AI API returned no content: ${JSON.stringify(data)}`);
      }
      return data.content[0].text;
    },
  };
}
