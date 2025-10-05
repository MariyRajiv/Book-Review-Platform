import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ detail: 'Name, email and password are required' });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ detail: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email: email.toLowerCase(), password: hashed });
    await user.save();
    const token = signToken(user._id.toString());
    return res.json({ access_token: token, user: { id: user._id.toString(), name: user.name, email: user.email, created_at: user.created_at } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ detail: 'Email and password required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ detail: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ detail: 'Invalid credentials' });
    const token = signToken(user._id.toString());
    return res.json({ access_token: token, user: { id: user._id.toString(), name: user.name, email: user.email, created_at: user.created_at } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const u = req.user;
    // Return user object expected by frontend
    return res.json({ id: u.id, name: u.name, email: u.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Server error' });
  }
};
