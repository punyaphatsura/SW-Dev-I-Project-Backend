import User from "../models/User.js";
import { initializeAdmin } from "../config/firebaseConfig.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "../config/config.env" });
//@desc     Register user
//@route POST /api/v1/auth/register
//@access public
export const register = async (req, res, next) => {
  try {
    console.log("body", req.body);
    const { email, phoneNumber, uid, role } = req.body;

    //Create user
    const user = await User.create({
      email,
      phoneNumber,
      uid,
      role,
    });

    //Create Token
    // sendTokenResponse(user, 200, res);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err.stack);
    res
      .status(400)
      .json({ success: false, msg: "Please provide all infomation" });
  }
};

//desc     Login user
//@route POST /api/v1/auth/login
//@access public
export const login = async (req, res, next) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    //validate email&password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Please provide an email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "User not found",
      });
    }

    //check password match
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Password is not correct",
      });
    }

    //Create token
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err.stack);
    res.status(401).json({
      success: false,
      msg: "Cannot convert email or password to string",
    });
  }
};

//Get token from model, create token and send password
const sendTokenResponse = (user, statusCode, res) => {
  //Create token
  const token = user.getSignedJwtToken();
  console.log("token", token);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    /*.cookie("token", token, options)*/
    .json({
      success: true,
      //add for frontend
      _id: user._id,
      email: user.email,
      //end for frontend
      token,
    });
};

export const checkIsTokenValid = async (req, res, next) => {
  try {
    const { token } = req.body;
    // const token = req.headers.authorization;
    // console.log(req.body);
    if (!token || token === "null") {
      return res.status(401).json({
        success: false,
        message: "No token found",
      });
    }
    const decoded = await getUserFromToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    const user = await User.findOne({ uid: decoded.uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        data: { message: "User not found", token: decoded },
      });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err.stack);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

//@desc   Get current logged in User
//@route  POST /api/v1/auth/me
//@access private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
};

export const createUserWithToken = async (req, res, next) => {
  try {
    if (!req.headers.authorization)
      res.status(401).json({ success: false, msg: "No token found" });
    const decoded = await getUserFromToken(req.headers.authorization);
    const user = await User.findOne({ uid: decoded.uid });

    if (user)
      res.status(400).json({ success: false, msg: "User already", user });
    console.log(decoded);
    await User.create({
      email: decoded.email,
      uid: decoded.user_id,
      role: "user",
    })
      .then((user) => {
        res.status(200).json({ success: true, msg: user });
      })
      .catch((error) => {
        console.error(error.stack);
        res
          .status(400)
          .json({ success: false, msg: "create user error " + error });
      });
  } catch (err) {
    res.status(400).json({ success: false, msg: `error: ${err}` });
  }

  // let token;

  // if (
  //   req.headers.authorization &&
  //   req.headers.authorization.startsWith("Bearer")
  // ) {
  //   token = req.headers.authorization.split(" ")[1];
  // }

  // // Make sure token exists
  // if (!token || token === "null") {
  //   return res.status(401).json({
  //     success: false,
  //     message: "No token found",
  //   });
  // }

  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //   console.log(decoded);
  //   req.user = await User.findById(decoded.id);
  //   if (req.user) res.status(200).json({ success: true, msg: req.user });
  // } catch (err) {
  //   console.error(err.stack);
  //   try {
  //     const user = await getUserFromToken(req.headers.authorization);
  //     console.log(user);
  //     if (user) res.status(200).json({ success: true, msg: user });
  //     else res.status(400).json({ success: false, msg: "invalid token" });
  //   } catch (err) {
  //     res.status(400).json({ success: true, msg: err });
  //   }
  // }
};

export const checkPhoneNumber = async (req, res) => {
  // Get the phone number from query string
  const { phoneNumber } = req.body;

  try {
    // Validate the input
    if (!phoneNumber) {
      return res
        .status(400)
        .json({ success: false, msg: "No phone number provided" });
    }

    // Check if phone number already exists in the database
    const user = await User.findOne({ phoneNumber });

    if (user) {
      return res
        .status(200)
        .json({ success: true, msg: "Phone number is already used" });
    } else {
      return res
        .status(404)
        .json({ success: true, msg: "Phone number is available" });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};

export const checkEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate the input
    if (!email) {
      return res.status(400).json({ success: false, msg: "No email provided" });
    }

    // Check if email already exists in the database
    const user = await User.findOne({ email });

    if (user) {
      return res
        .status(200)
        .json({ success: true, msg: "Email is already used" });
    } else {
      return res.status(404).json({ success: true, msg: "Email is available" });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};

const getUserFromToken = async (idToken) => {
  try {
    const app = await initializeAdmin();
    const decodedToken = await app.auth().verifyIdToken(idToken.split(" ")[1]);
    return decodedToken;
  } catch (error) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (err) {
      return null;
    }
  }
};

//@desc   Log user out / clear cookie
//@route  GET /api/v1/auth/logout
//@access Private
export const logout = async (req, res, next) => {
  try {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
};
