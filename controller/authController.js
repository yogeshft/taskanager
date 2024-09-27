const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

function validateEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "2d" });
};

const createSendToken = (user, statusCode, res) => {
  // Generate tokens
  const token = signToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Define cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  // Set cookies
  res.cookie("jwt", token, cookieOptions);
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  });

  // Remove sensitive information
  user.password = undefined;

  // Send response
  return res.status(statusCode).json({
    status: "success",
    token,
    refreshToken,
    data: { user },
  });
};

// authentication
const protect = async (req, res, next) => {
  // 1. getting the token if there or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      res.status(403).json({
        success: false,
        data: "your are not logged in! login to get access",
      })
    );
  }
  try {
    // 2. token verification
    //
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3. check if the used exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        res.status(403).json({
          success: false,
          data: "the user belongs to the token does not exist",
        })
      );
    }
    //   // 4. check if user changed password after jwt token was issued

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: "Invalid token. Please log in again.",
    });
  }
};

// signup
const signup = async (req, res) => {
  const { email } = req.body;
  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      data: "please provide valid email",
    });
  }
  const isUserExist = await User.findOne({ email: email });
  if (isUserExist) {
    return res.status(403).json({
      success: false,
      data: "user is already exist with the email you have provided.",
    });
  }
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  createSendToken(newUser, 201, res);
};

// login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      data: "please provide valid email",
    });
  }
  const isUserExist = await User.findOne({ email: email });
  if (!isUserExist) {
    return res.status(403).json({
      success: false,
      data: "user does not exist.",
    });
  }
  //  check if user exist and password is correct
  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      success: false,
      data: "invalid credentials",
    });
  }
  createSendToken(user, 200, res);
};

// logout
const logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.cookie("refreshToken", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      data: "No refresh token provided",
    });
  }

  try {
    const decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        data: "The user belonging to this token no longer exists.",
      });
    }

    const newAccessToken = signToken(currentUser._id);
    res.cookie("jwt", newAccessToken, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({
      status: "success",
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: "Invalid refresh token. Please log in again.",
    });
  }
};

module.exports = { signup, login, protect, logout, refreshToken };
