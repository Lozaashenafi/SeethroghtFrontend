/**
 * Google Identity Services prompt helper.
 *
 * `promptGoogleSignIn()` resolves with the Google ID token, or throws a
 * `GoogleSignInError` whose `userMessage` is safe to show directly in a toast.
 *
 * It fails fast — within seconds — in the situations that used to leave the
 * button loading forever:
 * - the GSI script is blocked by an ad-blocker / never loads
 * - `VITE_GOOGLE_CLIENT_ID` is missing from the deployed build
 * - Google skips or refuses to display the One Tap prompt
 * - the user closes the prompt
 * - the whole flow takes too long (safety net timeout)
 */

const GSI_SCRIPT_TIMEOUT_MS = 8_000;
const PROMPT_TIMEOUT_MS = 45_000;

const EMAIL_FALLBACK_HINT = ' Please log in with your email and password instead.';

export class GoogleSignInError extends Error {
  /** Friendly, actionable message — safe to show in a toast. */
  readonly userMessage: string;

  constructor(userMessage: string, message?: string) {
    super(message ?? userMessage);
    this.name = 'GoogleSignInError';
    this.userMessage = userMessage;
  }
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface GooglePromptNotification {
  isNotDisplayed?: () => boolean;
  isSkippedMoment?: () => boolean;
  isDismissedMoment?: () => boolean;
}

interface GoogleIdApi {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  prompt(listener?: (notification: GooglePromptNotification) => void): void;
  cancel(): void;
}

type WindowWithGoogle = Window & {
  google?: { accounts?: { id?: GoogleIdApi } };
};

function getGoogleId(): GoogleIdApi | null {
  const google = (window as WindowWithGoogle).google;
  return google?.accounts?.id ?? null;
}

/** The GSI script is loaded with `async defer` — wait briefly for it. */
function waitForGoogleScript(timeoutMs: number): Promise<GoogleIdApi> {
  const existing = getGoogleId();
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      clearInterval(interval);
      reject(
        new GoogleSignInError(
          `Google Sign-In could not load. If you use an ad-blocker, allow this site, or${EMAIL_FALLBACK_HINT.replace(' Please', ' please')}`,
          'GSI script did not load in time (blocked by a browser extension?)',
        ),
      );
    }, timeoutMs);

    const interval = setInterval(() => {
      const id = getGoogleId();
      if (id) {
        clearTimeout(timer);
        clearInterval(interval);
        resolve(id);
      }
    }, 100);
  });
}

/**
 * Opens the Google One Tap / sign-in prompt and resolves with the ID token.
 * Throws `GoogleSignInError` on any failure — the promise never hangs.
 */
export async function promptGoogleSignIn(): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  if (!clientId) {
    // Deployed build is missing the env var — GSI logs
    // "Missing required parameter: client_id" and never shows anything.
    throw new GoogleSignInError(
      `Google sign-in is not configured right now.${EMAIL_FALLBACK_HINT}`,
      'VITE_GOOGLE_CLIENT_ID is not set',
    );
  }

  const googleId = await waitForGoogleScript(GSI_SCRIPT_TIMEOUT_MS);

  return new Promise<string>((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      googleId.cancel(); // close a prompt that is still open
      settle(() =>
        reject(
          new GoogleSignInError(
            `Google sign-in timed out. Please try again, or use your email and password.`,
            'Prompt timeout',
          ),
        ),
      );
    }, PROMPT_TIMEOUT_MS);

    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    googleId.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response.credential) {
          settle(() =>
            reject(
              new GoogleSignInError(
                `Google sign-in failed. Please try again or use your email and password.`,
              ),
            ),
          );
          return;
        }
        settle(() => resolve(response.credential!));
      },
    });

    googleId.prompt((notification) => {
      if (settled) return;

      if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
        // Google refused to show the prompt (browser settings, extensions,
        // or the client_id problem) — without this check the flow hung forever.
        settle(() =>
          reject(
            new GoogleSignInError(
              `Google sign-in is unavailable in this browser.${EMAIL_FALLBACK_HINT}`,
              'GSI prompt not displayed or skipped',
            ),
          ),
        );
        return;
      }

      if (notification.isDismissedMoment?.()) {
        settle(() =>
          reject(
            new GoogleSignInError(
              `Google sign-in was closed. Please try again or use your email and password.`,
              'GSI prompt dismissed',
            ),
          ),
        );
      }
    });
  });
}
