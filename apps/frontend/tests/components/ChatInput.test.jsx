import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatInput } from '../../src/components/chat/ChatInput';

vi.mock('../../src/hooks/useChatStream', () => ({
  useChatStream: () => ({
    submitQuery: vi.fn(),
    isStreaming: false,
  }),
}));

describe('ChatInput Component', () => {
  it('renders input field and send button correctly', () => {
    render(<ChatInput />);
    const textarea = screen.getByPlaceholderText(/Ask a legal query/i);
    expect(textarea).toBeInTheDocument();

    const submitBtn = screen.getByLabelText(/Send query/i);
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  it('enables send button when text is typed', () => {
    render(<ChatInput />);
    const textarea = screen.getByPlaceholderText(/Ask a legal query/i);
    fireEvent.change(textarea, { target: { value: 'Is neem patentable?' } });

    const submitBtn = screen.getByLabelText(/Send query/i);
    expect(submitBtn).not.toBeDisabled();
  });
});
