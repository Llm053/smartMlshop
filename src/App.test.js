import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page by default', () => {
  render(<App />);
  const loginElement = screen.getByText(/connexion/i);
  expect(loginElement).toBeInTheDocument();
});
