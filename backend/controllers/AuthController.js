
const { admin } = require('../firebase/firebaseAdmin.js')
// const { signInWithEmailAndPassword } = require('firebase/auth');

// Register User using Firebase Admin
const registerUser = async (req, res) => {
  console.log(req.body);
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    console.log("empty fields")
    return res.status(400).json({
      message: 'Email, password, and name are required fields',
    });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });
    console.log("successful sign up")
     

    // Automatically add user profile to Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      name: name,
      email: userRecord.email,
      createdAt: new Date(),
    });

    console.log("successfully created in database")

    res.status(201).json({
      message: 'User created successfully',
      user: userRecord,
    });
  } catch (error) {
    handleAdminError(error);
  }
};
function handleAdminError(error) {
  if (error.code === 'auth/email-already-exists') {
    console.error("Email is already in use.");
  } else if (error.code === 'auth/invalid-password') {
    console.error("The password is invalid or does not meet security standards.");
  } else {
    console.error("Error creating user:", error.message);
  }
}
// Login User using Firebase Client SDK
// const loginUser = async (req, res) => {
//   console.log('Received login request with:', req.body);
//   const { email, password } = req.body;

//   try {
//     const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
//     const user = userCredential.user;
//     const token = await user.getIdToken();

//     res.status(200).json({
//       message: 'User logged in successfully',
//       uid: user.uid,
//       email: user.email,
//       token: token,
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// Logout User using Firebase Admin (example, typically handled by client)
const logoutUser = async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ message: 'UID is required for logout.' });
  }
  try {
    await admin.auth().revokeRefreshTokens(uid);
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Verify the token with Firebase Admin SDK
const verifyToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'No token provided' });
  }

  try {
    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Once verified, you can use the decoded information, for example, the user ID
    const user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };

    res.status(200).json({ valid: true, user });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
};

module.exports = {
  registerUser,
  // loginUser,
  logoutUser,
  verifyToken
};
