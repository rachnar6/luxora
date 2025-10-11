import jwt from 'jsonwebtoken';

// CHANGED: This function now accepts the full user object
const generateToken = (user) => {
  return jwt.sign(
    {
      // ADDED: Include name, email, and role in the token's payload
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

export default generateToken;