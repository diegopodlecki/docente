const express = require("express");
const { oauth2Client, getAuthUrl } = require("./authGoogle");
const { google } = require("googleapis");

const app = express();
const port = process.env.PORT || 3000;

// parse JSON bodies (if you ever send JSON from frontend)
app.use(express.json());

// classroom endpoints
const classroomRoutes = require('./routes/classroomRoutes');
app.use('/classroom', classroomRoutes);

// redirect the user to Google's OAuth consent screen
app.get("/auth/google", (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// callback endpoint that Google will redirect back to
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.send("Autenticación exitosa con Google");
  } catch (err) {
    console.error("Error exchanging code for tokens", err);
    res.status(500).send("Error en la autenticación");
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
