const User = require("../models/user");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const { v4: uuidv4 } = require("uuid");

module.exports = {
  signup,
  login,
};

async function signup(req, res) {
  const user = new User(req.body);
  try {
    await user.save();
    const token = createJWT(user); // user is the payload so this is the object in our jwt
    return res.json({ token });
  } catch (err) {
    // Probably a duplicate email
    res.status(400).json(err);
  }
};


async function login(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    console.log(user)
    console.log(user, " this user in login");
    if (!user) return res.status(401).json({ err: "bad credentials" });
    
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (isMatch) {
        const token = createJWT(user);
        res.json({ token });
      } else {
        return res.status(401).json({ err: "bad credentials" });
      }
    });
  } catch (err) {
    return res.status(401).json(err);
  }
}

/*----- Helper Functions -----*/
function createJWT(user) {
  return jwt.sign(
    { user }, // data payload
    SECRET,
    { expiresIn: "24h" }
  );
}
