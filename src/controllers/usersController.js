const usersServices = require("../services/usersServices");

module.exports = {
  registerController: async (req, res) => {
    try {
      const { token, user } = await usersServices.addUser(req.body);
      // Send both the user info and token to the client
      return res.status(201).json({ user, token });
    } catch (error) {
      return res.status(400).json({ error: "User not created" });
    }
  },
  loginController: async (req, res) => {
    try {
      const { name, lastName, email, password } = req.body;
      const user = await usersServices.getUser({
        name,
        lastName,
        email,
        password,
      });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(401).json({ error: "No user found" });
    }
  },

  userDataController: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;

      // Check if the Authorization header is present and correctly formatted
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Authorization token missing or malformed" });
      }

      // Extract the token from the Authorization header
      const token = authHeader.split(" ")[1];
      const user = await usersServices.getUserData(token);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(404).json({ error: "No user found" });
    }
  },
  avatarController: async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    // Extract token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Assuming Bearer token

    if (!token) {
      return res.status(401).send("Token is missing.");
    }

    try {
      // Pass the token along with the file to the uploadAvatar function
      const publicUrl = await usersServices.uploadAvatar(req.file, token);
      res.status(200).send({ url: publicUrl });
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  updateUserController: async (req, res) => {
    try {
      const updatedUser = await usersServices.updateUserService(req.body);
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update user" });
    }
  },

  deleteUserController: async (req, res) => {
    try {
      const deletedUser = await usersServices.deleteUserService(req.body);
      return res.status(200).json(deletedUser);
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete user" });
    }
  },
};
