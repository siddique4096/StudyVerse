import {z} from 'zod';

export const StudyBotHistorySchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const studyBotRespondsToQuestionsInputSchema = z.object({
  history: z.array(StudyBotHistorySchema),
  question: z.string().describe('The user question about a study topic.'),
});

export type StudyBotRespondsToQuestionsInput = z.infer<
  typeof studyBotRespondsToQuestionsInputSchema
>;

export const studyBotRespondsToQuestionsOutputSchema = z.object({
  response: z.string().describe('The response to the user question.'),
});
export type StudyBotRespondsToQuestionsOutput = z.infer<
  typeof studyBotRespondsToQuestionsOutputSchema
>;
