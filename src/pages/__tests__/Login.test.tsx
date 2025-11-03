/// <reference types="@testing-library/jest-dom" />

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from '../Login';

// Mock the useAuth hook
const mockLogin = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    isLoading: false,
    username: null,
    logout: vi.fn(),
  }),
}));

// Mock the useToast hook
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login form', () => {
    renderLogin();
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    const { container } = renderLogin();
    
    // Find the form by its class name
    const form = container.querySelector('form');
    if (!form) throw new Error('Form not found');
    
    // Submit the form directly
    fireEvent.submit(form);

    // Check if the toast was shown with the validation error
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Validation Error',
        description: 'Please enter both username and password.',
        variant: 'destructive',
      });
    });
  });

  it('calls login function with correct credentials', async () => {
    mockLogin.mockResolvedValueOnce({});
    
    renderLogin();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'testpass' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check if login was called with correct credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass',
      });
    });
  });

  it('shows loading state during form submission', async () => {
    // Create a promise that we can resolve later
    let resolveLogin: (value?: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    mockLogin.mockReturnValueOnce(loginPromise);
    
    renderLogin();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'testpass' },
    });
    
    // Submit the form
    const button = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(button);
    
    // Check if button is in loading state and shows "Signing in..."
    const loadingButton = await screen.findByRole('button', { name: /signing in.../i });
    expect(loadingButton).toBeDisabled();
    
    // Resolve the login promise
    resolveLogin!({});
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled();
    });
  });

  it('navigates to /chat on successful login', async () => {
    mockLogin.mockResolvedValueOnce({});
    
    renderLogin();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'testpass' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if navigation occurred
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/chat');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    });
  });

  it('shows error message when login fails', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));
    
    renderLogin();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'wronguser' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpass' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if error toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    });
  });

  it('preserves whitespace in username and password', async () => {
    mockLogin.mockResolvedValueOnce({});
    
    renderLogin();
    
    const username = '  testuser  ';
    const password = '  testpass  ';
    
    // Fill in the form with extra whitespace
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: username },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: password },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check that login was called with the exact values (no trimming)
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username,
        password,
      });
    });
  });
});
