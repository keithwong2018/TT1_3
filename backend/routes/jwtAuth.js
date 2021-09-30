const router = require("express").Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validinfo");
const authorize = require("../middleware/authorization");

//register

router.post("/register", async (req, res) => {
  const {
    customer_id,
    username,
    password,
    first_name,
    last_name,
    postal_code,
    gender,
    created_at,
  } = req.body;

  try {
    //check if user exists
    const user = await pool.query(
      "SELECT * FROM customer WHERE customer_id = $1",
      [customer_id]
    );
    if (user.rows.length !== 0)
      return res.status(401).json("User already exists");
    //Bcrypt user password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);
    //enter user to database
    const newUser = await pool.query(
      "INSERT INTO customer (customer_id,username,password,first_name,last_name,postal_code,gender,created_at) VALUES ($1, $2, $3,$4,$5,$6,$7,$8) RETURNING *",
      [
        customer_id,
        username,
        bcryptPassword,
        first_name,
        last_name,
        postal_code,
        gender,

        created_at,
      ]
    );
    //jwt token
    const token = jwtGenerator(newUser.rows[0].customer_id);

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//login route
router.post("/login", async (req, res) => {
  const { id, password } = req.body;

  try {
    //check if user exists
    const user = await pool.query(
      "SELECT * FROM customer WHERE customer_id = $1",
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(401).json("Password or Email is incorrect");
    }
    //check if password is same as db
    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(401).json("Invalid Credential");
    }
    const token = jwtGenerator(user.rows[0].customer_id);
    console.log(token.customer_id);
    return res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/test", async (req, res) => {
  const token = req.header("token");

  // Verify token
  try {
    //if not token
    if (!token) {
      return res.status(403).json("Not Authorized");
    }
    //it is going to give use the user id (user:{id: user.id})
    const payload = jwt.verify(token, process.env.jwtSecret);

    return res.json(payload.user);
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
});

router.get("/is-verify", authorize, (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;