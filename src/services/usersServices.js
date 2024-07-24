const jwt = require("jsonwebtoken");
const { Storage } = require("@google-cloud/storage");
const User = require("../models/User");

const storage = new Storage({
  keyFilename: "../back/myKey.json",
  projectId: "caramel-granite-427322-e7",
});
const bucket = storage.bucket("lingo-academy-avatar");

require('dotenv').config();

const secret = process.env.JWT_SECRET;


module.exports = {
  getUser: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }
      const isCorrectPassword = await user.isCorrectPassword(password);
      if (!isCorrectPassword) {
        throw new Error("Password is incorrect");
      }
      // Issue token
      const payload = { email };
      const token = jwt.sign(payload, secret, {
        expiresIn: "1h",
      });
      return { token, user };
    } catch (error) {
      console.log("The service had an error:", error);
      throw error;
    }
  },
  
  addUser: async (user) => {
    try {
      const newUser = await User.create(user);
      // After creating the user, generate a token
      const payload = { email: newUser.email };
      const token = jwt.sign(payload, secret, {
        expiresIn: "1h",
      });
      return { token, user: newUser }; // Return both the token and the user
    } catch (error) {
      console.log("The service had an error creating the user:", error);
      throw error; // Rethrow the error to be handled by the controller
    }
  },

  getUserData: async (token) => {
    try {
      const decoded = jwt.verify(token, secret);
      const { email } = decoded;
      const userData = await User.findOne({ email });
      return userData;
    } catch (error) {
      console.log("The service had an error getting the user data:", error);
      throw error;
    }
  },

  uploadAvatar: async (file, token) => {
    try {
      const decoded = jwt.decode(token, secret);
      const { email } = decoded;

      const user = await User.findOne({ email: email });
      if (!user) throw new Error("User not found");

      const currentAvatarUrl = user.avatarUrl;
      let currentAvatarFileName = null;

      if (currentAvatarUrl) {
        const urlParts = new URL(currentAvatarUrl).pathname.split("/");
        currentAvatarFileName = urlParts[urlParts.length - 1];
      }

      const blob = bucket.file(file.originalname);
      const blobStream = blob.createWriteStream();

      return new Promise((resolve, reject) => {
        blobStream.on("error", (err) => reject(err));
        blobStream.on("finish", async () => {
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          try {
            await User.findOneAndUpdate(
              { email: email },
              { $set: { avatarUrl: publicUrl } },
              { new: true }
            );
            if (currentAvatarFileName) {
              const oldBlob = bucket.file(currentAvatarFileName);
              await oldBlob.delete();
            }

            resolve(publicUrl);
          } catch (error) {
            reject(error);
          }
        });
        blobStream.end(file.buffer);
      });
    } catch (error) {
      console.log("The service had an error uploading the avatar:", error);
      throw error;
    }
  },

  updateUserService: async (user) => {
    const { email, ...updateData } = user;

    try {
      const updatedUser = await User.findOneAndUpdate(
        { email: email },
        updateData,
        { new: true }
      );
      if (!updatedUser) {
        console.log("No user found with the provided email:", email);
        throw new Error("No user found");
      }
      return updatedUser;
    } catch (error) {
      console.log("The service had an error updating the user:", error);
      throw error;
    }
  },

  deleteUserService: async (body) => {
    const { email } = body;
    try {
      const deletedUser = await User.findOneAndDelete({ email: email });
      if (!deletedUser) {
        console.log("No user found with the provided email:", email);
        throw new Error("No user found");
      }
      return deletedUser;
    } catch (error) {
      console.log("The service had an error deleting the user:", error);
      throw error;
    }
  }
};
