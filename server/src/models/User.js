import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * @typedef {object} User
 * @property {string} name - The user's name.
 * @property {string} email - The user's email address.
 * @property {string} password - The user's hashed password.
 * @property {string} [resume] - The user's raw resume text.
 * @property {Date} createdAt - The timestamp when the user was created.
 * @property {Date} updatedAt - The timestamp when the user was last updated.
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  resume: {
    type: String,
    default: '',
  },
}, { timestamps: true });

/**
 * Pre-save hook to hash the password before saving a new user or when the password is modified.
 */
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compares a candidate password with the user's hashed password.
 * @param {string} candidatePassword - The password to compare.
 * @returns {Promise<boolean>} - True if the passwords match, false otherwise.
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
export default mongoose.model('User', UserSchema);
