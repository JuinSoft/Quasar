import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { env } from '@/config/env';
import { contractTemplates } from '@/services/contracts/templates';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// System prompt for the contract generation assistant
const SYSTEM_PROMPT = `
You are a smart contract expert specializing in Solidity development for the Sonic blockchain.
Your task is to generate or modify smart contract code based on user requirements.

When generating or modifying contracts:
1. Follow best practices for security and gas optimization
2. Include detailed comments explaining the code
3. Use the latest Solidity version (^0.8.20)
4. Implement proper error handling and input validation
5. Follow the OpenZeppelin standards when applicable

Always provide complete, deployable contract code that compiles without errors.
`;

export async function POST(req: NextRequest) {
  try {
    const { contractType, description, parameters, template } = await req.json();

    // If a template is provided, use it as a base
    let baseTemplate = '';
    if (template) {
      baseTemplate = template;
    } else if (contractType && contractTemplates[contractType]) {
      baseTemplate = contractTemplates[contractType].template;
    }

    // Replace template parameters if provided
    let processedTemplate = baseTemplate;
    if (parameters && baseTemplate) {
      Object.entries(parameters).forEach(([key, value]) => {
        processedTemplate = processedTemplate.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
      });
    }

    // If no template or we need to generate from scratch
    if (!processedTemplate || description) {
      // Prepare the prompt for OpenAI
      const userPrompt = `
Generate a Solidity smart contract for the Sonic blockchain based on the following requirements:

${description || 'Create a basic smart contract'}

${contractType ? `Contract type: ${contractType}` : ''}
${parameters ? `Parameters: ${JSON.stringify(parameters, null, 2)}` : ''}
${baseTemplate ? `Use this as a starting point:\n\n${processedTemplate}` : ''}

Please provide the complete contract code.
`;

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const generatedCode = completion.choices[0]?.message?.content || '';
      
      // Extract the code from the response (in case it contains markdown)
      const codeMatch = generatedCode.match(/```solidity\n([\s\S]*?)```/) || 
                        generatedCode.match(/```\n([\s\S]*?)```/) ||
                        generatedCode.match(/```([\s\S]*?)```/);
      
      processedTemplate = codeMatch ? codeMatch[1] : generatedCode;
    }

    return NextResponse.json({ 
      contract: processedTemplate,
      message: 'Contract generated successfully'
    });
  } catch (error) {
    console.error('Error generating contract:', error);
    return NextResponse.json(
      { error: 'Failed to generate contract' },
      { status: 500 }
    );
  }
} 