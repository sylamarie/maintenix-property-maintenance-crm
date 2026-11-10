import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const demoLoginMock = vi.hoisted(() => vi.fn());
vi.mock('../../../auth/AuthContext.jsx', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    login: vi.fn(),
    demoLogin: demoLoginMock
  })
}));

const { default: LoginPage } = await import('../LoginPage.jsx');

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/operative/dashboard" element={<p>Operative home</p>} />
        <Route path="/admin/dashboard" element={<p>Admin home</p>} />
      </Routes>
    </MemoryRouter>
  );

// What axios gives us when the server answers with an error status.
const serverError = (status, message = 'x') =>
  Object.assign(new Error(message), { response: { status, data: { message } } });

beforeEach(() => {
  demoLoginMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('LoginPage one-click demo sign-in', () => {
  it('signs in straight away when a role is clicked, and opens that role workspace', async () => {
    demoLoginMock.mockResolvedValue({ role: 'operative' });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /operative/i }));

    expect(demoLoginMock).toHaveBeenCalledWith('operative@maintenix.com');
    expect(await screen.findByText('Operative home')).toBeInTheDocument();
  });

  it('never needs a password for the one-click sign-in', async () => {
    demoLoginMock.mockResolvedValue({ role: 'admin' });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /admin/i }));

    expect(demoLoginMock).toHaveBeenCalledTimes(1);
    expect(demoLoginMock.mock.calls[0]).toEqual(['admin@maintenix.com']);
  });

  it('shows the server message for other errors (such as too many attempts)', async () => {
    demoLoginMock.mockRejectedValue(serverError(429, 'Too many demo sign-ins.'));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /client/i }));

    expect(await screen.findByText('Too many demo sign-ins.')).toBeInTheDocument();
    expect(screen.queryByText(/switched off/i)).not.toBeInTheDocument();
  });

  it('on a server with demo sign-in OFF (live site): fills in the email and asks for the password', async () => {
    vi.stubEnv('DEV', false);
    demoLoginMock.mockRejectedValue(serverError(403, 'Demo sign-in is not enabled.'));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /client/i }));

    await waitFor(() =>
      expect(screen.getByLabelText('Email address')).toHaveValue('client@maintenix.com')
    );
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveFocus();
    expect(screen.getByText(/switched off here/i)).toBeInTheDocument();
  });

  it('on your own computer with demo sign-in OFF: falls back to the local demo password', async () => {
    vi.stubEnv('DEV', true);
    demoLoginMock.mockRejectedValue(serverError(403, 'Demo sign-in is not enabled.'));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /operative/i }));

    await waitFor(() =>
      expect(screen.getByLabelText('Email address')).toHaveValue('operative@maintenix.com')
    );
    expect(screen.getByLabelText('Password')).toHaveValue('Password123');
    expect(screen.queryByText(/switched off here/i)).not.toBeInTheDocument();
  });

  it('on the live site the password box starts empty with a neutral placeholder', () => {
    vi.stubEnv('DEV', false);
    renderPage();

    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveAttribute('placeholder', 'Demo password');
  });
});
