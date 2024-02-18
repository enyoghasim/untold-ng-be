export const forgotPasswordEmail = (email, token) => {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque&display=swap');

    body {
      font-family: 'Bricolage Grotesque', sans-serif;
      color: #000000;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .container {
      max-width: 600px;
      text-align: center;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 10px;
      margin: 0 auto;
    }

    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      color: #ffffff !important;
      background-color: #000000;
      text-decoration: none;
      border-radius: 5px;
    }

    .copy-link {
      margin-top: 20px;
      color: #000000;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Reset Your Password</h1>
    <p>Hello,</p>
    <p>We received a request to reset your password for your untold.ng account. Click the button below to reset it.</p>
    <a href="#" class="button">Reset Password</a>
    <p class="copy-link">Or copy and paste this link into your browser: <br><span>https://untold.ng/reset-password/123456</span></p>
    <p>If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next 15 minutes.</p>
    <p>Thanks,</p>
    <p>The untold.ng Team</p>
  </div>
</body>
</html>`;
};
