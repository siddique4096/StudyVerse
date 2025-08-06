'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * @fileOverview A StudyBot that responds to questions from students using Gemini.
 *
 * - studyBotRespondToQuestions - A function that handles the StudyBot's response to student questions.
 * - StudyBotRespondToQuestionsInput - The input type for the studyBotRespondToQuestions function.
 * - StudyBotRespondToQuestionsOutput - The return type for the studyBotRespondToQuestions function.
 */

const StudyBotRespondToQuestionsInputSchema = z.object({
  question: z.string().describe('The question asked by the student.'),
});

export type StudyBotRespondToQuestionsInput = z.infer<typeof StudyBotRespondToQuestionsInputSchema>;

const StudyBotRespondToQuestionsOutputSchema = z.object({
  response: z.string().describe('The response from the StudyBot.'),
});

export type StudyBotRespondToQuestionsOutput = z.infer<typeof StudyBotRespondToQuestionsOutputSchema>;

export async function studyBotRespondToQuestions(input: StudyBotRespondToQuestionsInput): Promise<StudyBotRespondToQuestionsOutput> {
  return studyBotRespondToQuestionsFlow(input);
}

const studyBotPrompt = ai.definePrompt({
  name: 'studyBotPrompt',
  input: {schema: StudyBotRespondToQuestionsInputSchema},
  prompt: `You are StudyBot, a friendly and helpful study assistant. A student has asked you a question.

Question: {{{question}}}

Provide a concise and helpful answer to the student's question.`,
});


const studyBotRespondToQuestionsFlow = ai.defineFlow(
  {
    name: 'studyBotRespondToQuestionsFlow',
    inputSchema: StudyBotRespondToQuestionsInputSchema,
    outputSchema: StudyBotRespondToQuestionsOutputSchema,
  },
  async (input) => {
    const llmResponse = await studyBotPrompt(input);
    const textResponse = llmResponse.text;
    
    if (textResponse === undefined) {
      return { response: "Sorry, I couldn't generate a response." };
    }

    return { response: textResponse };
  }
);
