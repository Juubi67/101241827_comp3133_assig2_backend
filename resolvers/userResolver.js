const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ApolloError } = require("apollo-server-express");

const userResolver = {
  Mutation: {
    signup: async (_, { input }) => {
      try {
        // Check if the username or email is already taken
        const existingUser = await User.findOne({
          $or: [{ username: input.username }, { email: input.email }],
        });

        if (existingUser) {
          throw new ApolloError(
            "Username or email already taken",
            "DUPLICATE_USER"
          );
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Create a new user with the hashed password
        const newUser = new User({
          username: input.username,
          email: input.email,
          password: hashedPassword,
        });

        // Save the new user to the database
        const user = await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          password: user.password,
          token,
        };
      } catch (error) {
        throw new ApolloError(
          `Error during signup: ${error.message}`,
          "LOGIN_ERROR"
        );
      }
    },
  },
  Query: {
    login: async (_, { username, password }) => {
      try {
        // Find the user by username or email
        const user = await User.findOne({
          $or: [{ username }, { email: username }],
        });

        if (!user) {
          throw new ApolloError("User not found", "USER_NOT_FOUND");
        }

        // Verify the entered password against the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          throw new ApolloError("Invalid password", "INVALID_PASSWORD");
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, "your-secret-key", {
          expiresIn: "1h",
        });

        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          password: user.password,
          token,
        };
      } catch (error) {
        throw new ApolloError(
          `Error during login: ${error.message}`,
          "LOGIN_ERROR"
        );
      }
    },
  },
};

module.exports = userResolver;
