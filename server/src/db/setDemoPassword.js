// Changes the password of the three demo accounts (admin, operative, client)
// and nothing else. It asks for the database address and the new password on
// screen, and hides what you type, so nothing secret is left in your command
// history or on the screen.
//
//   npm run db:demo-password
import bcrypt from 'bcryptjs';

const MIN_PASSWORD_LENGTH = 12;

// Reads lines from the keyboard without showing the characters. One steady
// listener collects every line, so it also works when several lines arrive
// at once (for example when text is pasted).
const typedLines = [];
let waitingForLine = null;
let currentLine = '';

const deliverLine = (line) => {
  if (waitingForLine) {
    const resolve = waitingForLine;
    waitingForLine = null;
    resolve(line);
  } else {
    typedLines.push(line);
  }
};

const startListening = () => {
  const { stdin } = process;

  stdin.setRawMode?.(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  stdin.on('data', (chunk) => {
    // Cursor keys and similar send a 3-character code starting with Escape.
    // Drop those so they do not end up inside the password.
    // eslint-disable-next-line no-control-regex -- the Escape character is the point
    const text = chunk.replace(/\u001b\[[0-9;]*[A-Za-z~]/g, '');

    for (const character of text) {
      if (character === '\r' || character === '\n') {
        deliverLine(currentLine.trim());
        currentLine = '';
      } else if (character === '\u0003') {
        // Ctrl+C
        process.stdout.write('\nCancelled.\n');
        process.exit(130);
      } else if (character === '\u007f' || character === '\b') {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else if (character >= ' ') {
        currentLine += character;
        // Show a star per character so you can SEE that typing/pasting works,
        // without revealing what it is.
        process.stdout.write('*');
      }
    }
  });

  // Keyboard closed before we got an answer: give back an empty answer.
  stdin.on('end', () => deliverLine(''));
};

const stopListening = () => {
  process.stdin.setRawMode?.(false);
  process.stdin.pause();
};

const askHidden = (question) => {
  process.stdout.write(question);

  return new Promise((resolve) => {
    if (typedLines.length > 0) {
      const line = typedLines.shift();

      process.stdout.write(`  (${line.length} characters received)\n`);
      resolve(line);
      return;
    }

    waitingForLine = (line) => {
      process.stdout.write(`  (${line.length} characters received)\n`);
      resolve(line);
    };
  });
};

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

console.log(
  'This changes the password of the three demo accounts only (admin, operative,\n' +
    'client). No other data is touched. What you type is hidden.\n'
);

startListening();

// If DATABASE_URL is already set in this window, use it; otherwise ask.
const databaseUrl =
  process.env.DATABASE_URL ||
  (await askHidden('1) Paste the Neon connection string and press Enter: '));

let databaseHost;

try {
  const parsed = new URL(databaseUrl);

  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('not a postgres address');
  }

  databaseHost = parsed.hostname;
} catch {
  fail(
    'That does not look like a database connection string. It should start with\n' +
      'postgresql:// and nothing has been changed.'
  );
}

console.log(`   Connecting to: ${databaseHost}`);

const password = await askHidden(
  `2) Type the new demo password (${MIN_PASSWORD_LENGTH}+ characters) and press Enter: `
);

if (password.length < MIN_PASSWORD_LENGTH) {
  fail(`The password must be at least ${MIN_PASSWORD_LENGTH} characters. Nothing was changed.`);
}

if (password.length > 128) {
  fail('The password must be 128 characters or fewer. Nothing was changed.');
}

const confirmation = await askHidden('3) Type it again to confirm and press Enter: ');

if (confirmation !== password) {
  fail('The two passwords did not match. Nothing was changed.');
}

stopListening();

// Set the address BEFORE the database code is loaded, so it connects to the
// database you typed and not to the one in server/.env.
process.env.DATABASE_URL = databaseUrl;

const { closePool, query } = await import('../config/db.js');
const { demoAccountEmails } = await import('../services/authService.js');

try {
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await query(
    `
      UPDATE users
      SET password_hash = $1
      WHERE LOWER(email) = ANY($2)
      RETURNING email
    `,
    [passwordHash, demoAccountEmails]
  );

  if (result.rowCount === 0) {
    console.error(
      '\nNo demo accounts were found in that database, so nothing was changed.\n' +
        'Run the seed first (npm run db:seed) or check you used the right connection string.'
    );
    process.exitCode = 1;
  } else {
    console.log(`\nDone. Changed the password of ${result.rowCount} demo account(s):`);
    result.rows.forEach((row) => console.log(`  - ${row.email}`));
  }
} catch (error) {
  console.error('\nCould not change the password. Nothing was changed.');
  console.error(
    error.code === '28P01'
      ? 'The database rejected the login (wrong password in the connection string).'
      : error.message
  );
  process.exitCode = 1;
} finally {
  await closePool();
}
