const detector = require("disposable-email-domains");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { History, User } = require("./db");
const session = require("express-session");
const store = require("connect-mongodb-session")(session);
const cors = require("cors");
const path = require("path");
const hbs = require("hbs");
const nodemailer = require("nodemailer");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.set("view engine", "hbs");
const static_path = path.join(__dirname, "../", "public");

app.use(express.static(static_path));
const server = http.createServer(app);

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let Mongo_URI =
  "mongodb+srv://darkidentity2002:SnD6GnqBsVL9gwRC@cluster0.pgbeavw.mongodb.net/?retryWrites=true&w=majority";
let PORT = process.env.PORT || 3001;

mongoose
  .connect(Mongo_URI)
  .then(function (db) {
    console.log("dtabse connected");
    server.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

const one_day = 1000 * 60 * 60 * 100;

let mongodb_store = new store({
  uri: Mongo_URI,
  databaseName: "transfer",
  collection: "sessions",
  ttl: one_day,
  cookie: { maxAge: one_day },
  autoRemove: "native",
});

app.use(
  session({
    secret: "xyz@234",
    resave: false,
    saveUninitialized: false,
    store: mongodb_store,
  })
);

const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("sender-join", (data) => {
    console.log(data.uid);
    socket.join(data.uid);
  });

  socket.on("receiver-join", (data) => {
    socket.join(data.uid);
    socket.in(data.sender_uid).emit("init", data.uid);
  });

  socket.on("file-meta", (data) => {
    socket.in(data.uid).emit("fs-meta", data.metadata);
  });

  socket.on("fs-start", (data) => {
    socket.in(data.uid).emit("fs-share", {});
  });

  socket.on("file-raw", (data) => {
    socket.in(data.uid).emit("fs-share", data.buffer);
  });

  socket.on("initiating_receiver_send", (data) => {
    socket.in(data.uid).emit("initiate_receiving", data.metadata);
  });

  socket.on("start_receiving", (data) => {
    socket.in(data.uid).emit("start_share", {});
  });

  socket.on("raw_file_from_receiver", (data) => {
    socket.in(data.uid).emit("start_share", data.buffer);
  });
});

function isAuthenticated(req, res, next) {
  if (typeof req.session.user_id !== "undefined") {
    next();
  } else {
    res.redirect("/login");
  }
}

app.get("/sender", isAuthenticated, (req, res) => res.render("home"));
app.get("/receive", isAuthenticated, (req, res) => res.render("receiver"));
app.get("/history", isAuthenticated, (req, res) => res.render("history"));
app.get("/help", (req, res) => res.render("help"));
app.get("/creators", (req, res) => res.render("creator"));
app.get("/login", (req, res) => res.render("login"));

app.post("/transfer_data", async (req, res) => {
  let data = req.body;

  let item_id = Math.floor(Math.random() * 90000 + 10000);
  let nDate = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Calcutta",
  });
  let today = new Date(nDate);
  let date = `${today.getDate()}/${
    today.getMonth() + 1
  }/${today.getFullYear()}`;

  await History.create({
    user_id: req.session.user_id,
    file_name: data.file_name,
    time: data.time,
    type: data.type,
    item_id: item_id,
    size: data.size,
    date: date,
  });
  return res.send({ status: "ok" });
});

app.post("/signup", async (req, res) => {
  let { email, name, otp, password } = req.body;
  if (
    typeof email === "undefined" ||
    typeof name === "undefined" ||
    typeof otp === "undefined"
  ) {
    return res.send({ status: "invalid data" });
  } else {
    let savedOTP = req.session.OTP;
    if (
      typeof savedOTP === "undefined" ||
      parseInt(savedOTP) !== parseInt(otp)
    ) {
      req.session["OTP"] = "";
      return res.send({ status: "invalid OTP" });
    } else {
      let created = await User.create({
        user_id: email,
        name: name,
        password: password,
      });
      if (typeof created !== undefined && created) {
        req.session.OTP = "";
        req.session["user_id"] = email;
        return res.send({ status: 1 });
      }
      req.session.OTP = "";
      return res.send({ status: "something went wrong" });
    }
  }
});

app.post("/generate_OTP", async (req, res) => {
  let { email } = req.body;

  if (typeof email !== "undefined") {
    const domain = email.split("@")[1];
    if (!detector.includes(domain)) {
      let is_mail_sent = await sendOTP(req, email);
      if (is_mail_sent) {
        return res.send({ status: "check your email" });
      } else {
        return res.send({ status: "something went wrong" });
      }
    } else {
      return res.send({ status: "disposable mails not allowed" });
    }
  } else {
    return res.send({ status: "invalid email" });
  }
});

app.post("/login", async (req, res) => {
  let { user_id, password } = req.body;
  if (typeof user_id === "undefined" || typeof password === "undefined") {
    return res.send({ status: "enter valid details" });
  } else {
    let user_data = await User.findOne({ user_id: user_id });
    if (typeof user_data !== "undefined" && user_data) {
      if (!user_data["password"].toLocaleString().localeCompare(password)) {
        req.session["user_id"] = user_id;
        return res.send({ status: 1 });
      } else {
        return res.send({ status: "invalid creadentials." });
      }
    } else {
      return res.send({ status: "invalid details" });
    }
  }
});

app.get("/user_history_data", isAuthenticated, async (req, res) => {
  let user_id = req.session.user_id;
  let data = await History.find({ user_id: user_id });

  if (data) {
    return res.send({ status: 1, data: data });
  } else {
    return res.send({ status: 0 });
  }
});

app.post("/delete_history", isAuthenticated, async (req, res) => {
  let { item_id } = req.body;
  if (!item_id || typeof item_id === "undefined") {
    return res.send({ status: "invalid id" });
  } else {
    let is_deleted = await History.findOneAndDelete({ item_id: item_id });
    if (is_deleted && typeof is_deleted !== "undefined") {
      return res.send({ status: 1 });
    } else {
      return res.send({ status: "something went wrong" });
    }
  }
});

async function sendOTP(req, email) {
  let otp = Math.floor(Math.random() * 9000 + 1000);
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "vkv9162871357@gmail.com",
      pass: "kahsizmojovvmsio",
    },
  });

  let mailOptions = {
    from: "vkv9162871357@gmail.com",
    to: email,
    subject: "Transferer",
    html: `<h2>WELCOME TO OUR FILE TRANSFER WEBSITE</h2><br><h3>Your OTP for registration is ${otp}</h3> `,
  };
  try {
    await transporter.sendMail(mailOptions);
    req.session["OTP"] = otp;
    return true;
  } catch (error) {
    req.session["OTP"] = "";
    return false;
  }
}
