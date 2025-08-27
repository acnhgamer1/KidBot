import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the fetch API
globalThis.fetch = vi.fn() as unknown as typeof fetch;

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders KidBot AI chat interface correctly', () => {
    render(<App />);

    // Check for main heading
    expect(screen.getByText('KidBot AI')).toBeInTheDocument();

    // Check for welcome message
    expect(screen.getByText('Welcome to KidBot AI! 🤖')).toBeInTheDocument();

    // Check for mode toggle buttons
    expect(screen.getByText('💭 Normal')).toBeInTheDocument();
    expect(screen.getByText('💬 Text')).toBeInTheDocument();
    expect(screen.getByText('🗑️ Clear')).toBeInTheDocument();

    // Check for input placeholder
    expect(
      screen.getByPlaceholderText('Type your message...')
    ).toBeInTheDocument();
  });

  it('toggles between normal and deep think modes', async () => {
    const user = userEvent.setup();
    render(<App />);

    const deepThinkButton = screen.getByText('💭 Normal');

    // Click to toggle to deep think mode
    await user.click(deepThinkButton);

    expect(screen.getByText('🧠 Deep Think')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        'Ask me something complex for deep thinking...'
      )
    ).toBeInTheDocument();
  });

  it('toggles between text and image modes', async () => {
    const user = userEvent.setup();
    render(<App />);

    const imageButton = screen.getByText('💬 Text');

    // Click to toggle to image mode
    await user.click(imageButton);

    expect(screen.getByText('🎨 Image')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Describe the image you want to generate...')
    ).toBeInTheDocument();
  });

  it('sends a chat message successfully', async () => {
    const user = userEvent.setup();

    // Mock successful API response from Pollinations AI
    (globalThis.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('Hello! How can I help you?'),
    });

    render(<App />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: '➤' });

    // Type a message
    await user.type(input, 'Hello');

    // Send the message
    await user.click(sendButton);

    // Check that fetch was called with Pollinations AI endpoint
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://text.pollinations.ai/',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Hello'),
      })
    );
  });

  it('handles chat API error gracefully', async () => {
    const user = userEvent.setup();

    // Mock API error
    (globalThis.fetch as unknown as Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<App />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: '➤' });

    // Type and send a message
    await user.type(input, 'Test message');
    await user.click(sendButton);

    // Should show error message in chat
    expect(
      await screen.findByText(
        'Sorry, I encountered an error. Please try again.'
      )
    ).toBeInTheDocument();
  });
});
