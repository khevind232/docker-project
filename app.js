const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Load common passwords into memory
const BLOCKED_PASSWORDS = fs
  .readFileSync(path.join(__dirname, 'common-passwords.txt'), 'utf-8')
  .split('\n')
  .map(pw => pw.trim());

function isStrongPassword(password) {
  // OWASP C6: minimum 8 characters, uppercase, lowercase, number, symbol
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return regex.test(password) && !BLOCKED_PASSWORDS.includes(password.trim());
}

app.get('/', (req, res) => {
  const errorMsg = req.query.error
    ? `<p style="color:red;">❌ Password is not valid.</p>`
    : '';
  res.send(`
    <h1>Login</h1>
    ${errorMsg}
    <form method="POST">
      <input type="password" name="password" required />
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/', (req, res) => {
  const { password } = req.body;

  if (!isStrongPassword(password)) {
    return res.redirect('/?error=1');
  }

  res.send(`
    <h1>Welcome</h1>
    <p>Password: ${password}</p>
    <form action="/" method="GET">
      <button type="submit">Logout</button>
    </form>
  `);
});

app.listen(3000, () => {
  console.log('✅ Web server running at http://127.0.0.1:3000');
});
