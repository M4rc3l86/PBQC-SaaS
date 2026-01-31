/**
 * Password breach detection using HaveIBeenPwned Pwned Passwords API
 * Implements k-anonymity model for privacy-preserving password checks
 *
 * API Documentation: https://haveibeenpwned.com/API/v3#PwnedPasswords
 */

export interface BreachCheckResult {
  isBreached: boolean;
  count?: number;
  error?: string;
}

/**
 * Check if a password has been exposed in known data breaches
 *
 * Privacy: Uses k-anonymity model - only the first 5 characters of the
 * SHA-1 hash are sent to the HIBP API. The full password never leaves
 * the client.
 *
 * @param password - The password to check
 * @returns Result indicating if password is breached and how many times
 */
export async function checkPasswordBreach(password: string): Promise<BreachCheckResult> {
  if (!password) {
    return { isBreached: false };
  }

  try {
    // Generate SHA-1 hash of password using Web Crypto API
    const hashBuffer = await crypto.subtle.digest(
      'SHA-1',
      new TextEncoder().encode(password)
    );
    const hashArray = new Uint8Array(hashBuffer);
    const hashHex = Array.from(hashArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    // Split hash into prefix (first 5 chars) and suffix
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    // Request all hashes with this prefix from HIBP API
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'PBQC-SaaS-Auth',
          'Accept': 'text/plain',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      }
    );

    if (!response.ok) {
      // If API fails, allow registration (fallback strategy)
      console.warn(`HIBP API returned ${response.status}, allowing password`);
      return { isBreached: false };
    }

    // Parse response - format is "suffix:count" per line
    const text = await response.text();
    const lines = text.split('\n');

    // Check if our hash suffix is in the response
    for (const line of lines) {
      const [lineSuffix, countStr] = line.split(':');
      if (lineSuffix === suffix) {
        const count = parseInt(countStr, 10);
        return { isBreached: true, count };
      }
    }

    // Password not found in breach database
    return { isBreached: false };
  } catch (error) {
    // Network error, timeout, or other failure
    // Allow registration rather than blocking user
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        console.warn('HIBP API timeout, allowing password');
      } else {
        console.warn('HIBP API error:', error.message);
      }
    }
    return { isBreached: false };
  }
}
