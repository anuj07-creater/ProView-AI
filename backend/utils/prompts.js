const questionAnswerPrompt = (
  role,
  experience,
  topicsToFocus,
  numberOfQuestions
) => `
You are an expert technical interviewer and educator.

Task:
- Role: ${role}
- Candidate Experience: ${experience} years
- Focus Topics: ${topicsToFocus}
- Generate ${numberOfQuestions} realistic, high-impact interview questions tailored to this role and seniority.
- For each question, provide a detailed, comprehensive, yet beginner-friendly model answer.
- Where appropriate, include concise, clean code examples in markdown code blocks inside the answer.
- Ensure questions range from foundational concepts to architectural and performance trade-offs.

Return a valid JSON array of objects with the following schema:
[
  {
    "question": "Question text here?",
    "answer": "Detailed model answer with code if appropriate."
  }
]
`;

const conceptExplainPrompt = (question) => `
You are an expert software engineer and technical educator.

Task:
- Deeply explain the following technical interview question and its underlying concept for a software developer:
  "${question}"
- Provide a clear, short title summarizing the core concept.
- In the explanation, include:
  1. High-level concept summary
  2. How it works under the hood
  3. Practical code example or architectural diagram in markdown
  4. Best practices, common pitfalls, and what interviewers look for
- Keep formatting clean, engaging, and professional.

Return a valid JSON object in the following format:
{
  "title": "Short descriptive concept title",
  "explanation": "Comprehensive breakdown with markdown and code snippets"
}
`;

module.exports = { questionAnswerPrompt, conceptExplainPrompt };