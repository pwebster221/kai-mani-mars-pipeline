# Model Configuration

**CRITICAL RULE - DO NOT CHANGE THE ANTHROPIC MODEL:**
The user has strictly requested that the Anthropic model MUST remain locked to Opus 4-7. 
When editing `server.ts` or any file that uses the Anthropic API, **do not** change the model from `claude-opus-4-7`. Do not update it to Sonnet, Haiku, or any other model. Keep it explicitly as "claude-opus-4-7".
