import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runAgent, runAgentStream } from '../src/index.js';

const mockClassifierResponse = {
    classification: 'patentability',
    reasoning: 'Query queries Ayurvedic extract eligibility under Section 3.'
};

const mockValidatorResponse = {
    validationPassed: true,
    feedback: '',
    citations: [
        {
            docId: 'Doc 1',
            source: 'Patents Act, 1970',
            section: 'Section 3(p)',
            snippet: 'Traditional knowledge is not patentable.'
        }
    ]
};

const mockGeneratorInvoke = {
    content: 'Traditional Ayurvedic neem formulations are generally not patentable [Doc 1].'
};

const mockGeneratorStream = (async function* () {
    yield { content: 'Traditional ' };
    yield { content: 'Ayurvedic ' };
    yield { content: 'neem ' };
    yield { content: 'formulations ' };
    yield { content: 'are ' };
    yield { content: 'not ' };
    yield { content: 'patentable ' };
    yield { content: '[Doc 1].' };
})();

vi.mock('@langchain/groq', () => {
    return {
        ChatGroq: vi.fn().mockImplementation(function (options) {
            return {
                withStructuredOutput: vi.fn().mockImplementation((schema) => {
                    const isClassifier = schema.shape && schema.shape.classification;
                    return {
                        invoke: vi.fn().mockResolvedValue(isClassifier ? mockClassifierResponse : mockValidatorResponse)
                    };
                }),
                invoke: vi.fn().mockResolvedValue(mockGeneratorInvoke),
                stream: vi.fn().mockReturnValue(mockGeneratorStream)
            };
        })
    };
});


vi.mock('../src/vectorstore/qdrant-client.js', () => {
    const mockPoints = [
        {
            id: 'test-doc-uuid-1',
            score: 0.85,
            payload: {
                text: 'Traditional knowledge is not patentable.',
                source: 'Patents Act, 1970',
                category: 'patent_doc',
                section: 'Section 3(p)',
                title: 'Inventions Not Patentable',
                sourceUrl: 'https://ipindia.gov.in/patents-act-1970.pdf',
                chunkIndex: 0
            }
        }
    ];

    return {
        qdrant: {
            search: vi.fn().mockResolvedValue(mockPoints),
            query: vi.fn().mockResolvedValue({ points: mockPoints })
        }
    };
});

vi.mock('../src/vectorstore/embeddings.js', () => {
    return {
        embedText: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
        embedDocuments: vi.fn().mockResolvedValue([[0.1, 0.2, 0.3]])
    };
});

describe('LangGraph Agent Workflow Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('runAgent API', () => {
        it('should complete the entire graph workflow returning final schema values', async () => {
            const response = await runAgent('Is synergistic neem extract patentable?');

            expect(response.result).toBe(mockGeneratorInvoke.content);
            expect(response.classification).toBe('patentability');
            expect(response.isValidated).toBe(true);
            expect(response.citations.length).toBe(1);

            const citation = response.citations[0];
            expect(citation.source).toBe('Patents Act, 1970');
            expect(citation.section).toBe('Section 3(p)');
            expect(citation.confidence).toBe('high');
            expect(citation.url).toBe('https://ipindia.gov.in/patents-act-1970.pdf');
        });
    });

    describe('runAgentStream API', () => {
        it('should stream response tokens and emit citations/done events in SSE format', async () => {
            const stream = runAgentStream({ query: 'Is synergistic neem extract patentable?' });
            const events = [];

            for await (const chunk of stream) {
                events.push(chunk);
            }

            const tokenEvents = events.filter(e => e.type === 'token');
            expect(tokenEvents.length).toBeGreaterThan(0);
            expect(tokenEvents.map(e => e.data).join('')).toBe('Traditional Ayurvedic neem formulations are not patentable [Doc 1].');

            const citationsEvent = events.find(e => e.type === 'citations');
            expect(citationsEvent).toBeDefined();
            expect(citationsEvent.data.length).toBe(1);
            expect(citationsEvent.data[0].confidence).toBe('high');

            const doneEvent = events.find(e => e.type === 'done');
            expect(doneEvent).toBeDefined();
            expect(events[events.length - 1]).toEqual({ type: 'done' });
        });
    });
});
