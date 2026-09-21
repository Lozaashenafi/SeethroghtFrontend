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
 * - Google skips or refuses to display the One Tap prompt (e.g. no Google
 *   session in the browser)
 * - the user closes the prompt
 * - the whole flow takes too long (safety net timeout)
 *
 * FedCM: Google Identity Services is migrating the One Tap prompt onto the
 * browser-native FedCM API (mandatory in upcoming Chrome versions). We opt in
 * with `use_fedcm_for_prompt: true` so the prompt keeps working and the
 * deprecation warnings for the display/skipped status methods go away on
 * migrated flows. See:
 * https://developers.google.com/identity/gsi/web/guides/fedcm-migration
 */

const GSI_SCRIPT_TIMEOUT_MS = 8_000;
const PROMPT_TIMEOUT_MS = 45_000;

/**
 * Google OAuth Client ID. This is a public identifier (it ends up in the page's
 * HTML source either way — that is how Google's script uses it), so embedding it
 * here is safe. VITE_GOOGLE_CLIENT_ID, when set at build time, takes precedence.
 *
 * The associated Client Secret is never used in the browser and must NOT be
 * committed anywhere.
 */
const FALLBACK_GOOGLE_CLIENT_ID =
  '78904496968-j4q5rkvameb1k2ksb7t9n0hv17qck9cl.apps.googleusercontent.com';

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
  /** FedCM mode reports why the prompt went away. */
  getDismissedReason?: () => string;
}

interface GoogleIdApi {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    /** Opt the One Tap prompt into the browser-native FedCM flow. */
    use_fedcm_for_prompt?: boolean;
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
          'Google Sign-In could not load. If you use an ad-blocker, allow this site, or please log in with your email and password instead.',
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

// Google warns when `initialize()` is called more than once ("only the last
// initialized instance will be used"), so we initialize exactly once per page
// load and route incoming credentials to whichever promptGoogleSignIn() call
// is currently pending.
let initialized = false;
let active: {
  resolve: (credential: string) => void;
  reject: (error: GoogleSignInError) => void;
} | null = null;

function ensureInitialized(googleId: GoogleIdApi, clientId: string): void {
  if (initialized) return;

  googleId.initialize({
    client_id: clientId,
    use_fedcm_for_prompt: true,
    callback: (response) => {
      const pending = active;
      active = null;
      if (!pending) return; // Timed-out or superseded request — ignore.

      if (response.credential) {
        pending.resolve(response.credential);
      } else {
        pending.reject(
          new GoogleSignInError(
            `Google sign-in failed. Please try again or use your email and password.`,
          ),
        );
      }
    },
  });

  initialized = true;
}

/**
 * Opens the Google One Tap / sign-in prompt and resolves with the ID token.
 * Throws `GoogleSignInError` on any failure — the promise never hangs.
 */
export async function promptGoogleSignIn(): Promise<string> {
  const clientId =
    (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ||
    FALLBACK_GOOGLE_CLIENT_ID;

  if (!clientId) {
    // Deployed build is missing the env var — GSI logs
    // "Missing required parameter: client_id" and never shows anything.
    throw new GoogleSignInError(
      `Google sign-in is not configured right now.${EMAIL_FALLBACK_HINT}`,
      'VITE_GOOGLE_CLIENT_ID is not set',
    );
  }

  const googleId = await waitForGoogleScript(GSI_SCRIPT_TIMEOUT_MS);
  ensureInitialized(googleId, clientId);

  // If a previous prompt is somehow still pending (double click, page navigated
  // back and forth), close it and release the stale caller so its loading
  // state clears instead of waiting for the timeout.
  if (active) {
    const stale = active;
    active = null;
    googleId.cancel();
    stale.reject(
      new GoogleSignInError(
        `Google sign-in was closed. Please try again or use your email and password.`,
        'Superseded by a newer prompt request',
      ),
    );
  }

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
      if (active === slot) active = null;
      fn();
    };

    const slot = {
      resolve: (credential: string) => settle(() => resolve(credential)),
      reject: (error: GoogleSignInError) => settle(() => reject(error)),
    };

    active = slot;

    googleId.prompt((notification) => {
      if (settled) return;

      if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
        // Google refused to show the prompt. The most common causes: the
        // browser has no active Google session ("Not signed in with the
        // identity provider"), third-party cookies/prompt suppression, or
        // extensions. Without this check the flow hung forever.
        settle(() =>
          reject(
            new GoogleSignInError(
              "Google sign-in couldn't open. Sign in to your Google account in this browser first, then try again — or use your email and password.",
              'GSI prompt not displayed or skipped',
            ),
          ),
        );
        return;
      }

      if (notification.isDismissedMoment?.()) {
        const reason = notification.getDismissedReason?.();
        // FedCM reports 'credential_returned' when the token is on its way —
        // the callback will resolve shortly; don't reject.
        if (reason === 'credential_returned' || reason === 'shared_credential_returned') {
          return;
        }
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
