import { configDotenv } from "dotenv";
import User from "../models/User.js";

//@desc     Register user
//@route POST /api/v1/auth/register
//@access public
export const register = async (req, res, next) => {
  try {
    console.log("body", req.body);
    const { name, email, telephone, password, role } = req.body;

    //Create user
    const user = await User.create({
      name,
      email,
      telephone,
      password,
      role,
    });

    //Create Token
    sendTokenResponse(user, 200, res);
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
  const token = user.getSignedJwtToken;

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
      name: user.name,
      email: user.email,
      //end for frontend
      token,
    });
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
