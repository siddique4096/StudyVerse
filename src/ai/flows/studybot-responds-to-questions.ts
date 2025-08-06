'use server';
/**
 * @fileoverview A flow that responds to questions about study topics.
 */

import {ai} from '@/ai/genkit';
import {
  studyBotRespondsToQuestionsInputSchema,
  studyBotRespondsToQuestionsOutputSchema,
  type StudyBotRespondsToQuestionsInput,
  type StudyBotRespondsToQuestionsOutput,
} from '@/ai/schemas/studybot';

const studyBotPrompt = ai.definePrompt({
  name: 'studyBotPrompt',
  input: {
    schema: studyBotRespondsToQuestionsInputSchema,
  },
  output: {
    schema: studyBotRespondsToQuestionsOutputSchema,
  },
  prompt: `You are StudyBot, an AI assistant for students. Your goal is to provide helpful, accurate, and concise explanations for a wide range of academic subjects.

You will receive a question from a student, along with the history of the conversation so far.

Based on the provided history:
{{#if history}}
<history>
{{#each history}}
  <turn role="{{role}}">
    {{#if content}}
      <message>{{content}}</message>
    {{/if}}
  </turn>
{{/each}}
</history>
{{/if}}

Please answer the following question:
<question>
{{question}}
</question>
`,
});

export async function studyBotRespondsToQuestions(
  input: StudyBotRespondsToQuestionsInput
): Promise<StudyBotRespondsToQuestionsOutput> {
  const llmResponse = await studyBotPrompt(input);
  const output = llmResponse.output;
  if (!output) {
    throw new Error('No output from prompt.');
  }
  return output;
}
