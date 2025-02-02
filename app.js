const express = require("express");
const path = require("path");
const DB = require("./js/db");
const session = require("express-session");
const {result} = require("lodash");

const app = express();
const db = new DB();

app.use(express.static("public"));
app.use(express.json());

app.use(
    session({
        secret: "WRLE2aHyF4%e",
        resave: false,
        saveUninitialized: true,
        cookie: {secure: false, maxAge: 30 * 60 * 1000},
    })
);

app.post("/login", (req, res) => {
    const {login, password} = req.body;
    db.checkLogin(login, password)
    .then((result) => {
        if (result.count) {
            req.session.user = {
                role: result.role,
                hash: result.hash,
            };
            res.json({success: true, role: result.role, hash: result.hash});
        } else {
            res.json({success: false, message: result.errMes});
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({success: false, message: err});
    });
});

app.post("/register", (req, res) => {
    const {login, password, name, surname, phone, email} = req.body;
    db.registerUser(login, password, email, name, surname, phone)
    .then((result) => {
        if (result.count) {
            res.json({success: true});
        } else {
            res.json({success: false, message: result.errMes});
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({success: false, error: err});
    });
});

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            ;
            return res.status(500).send("Выйти не получилось");
        }
        res.redirect("/");
    });
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        return res.status(401).json({ success: false, message: "Не авторизован" });
    }
}

app.post("/getEvents", isAuthenticated, (req, res) => {
    const {startDate, endDate, trainerId, eventName} = req.body;
    db.getEvents(startDate, endDate, trainerId, eventName).then((result) => {
        if (result.count) {
            res.json({success: true, result: result.events});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});

app.post("/getSelf", isAuthenticated, (req, res) => {
    const {hash} = req.body;
    db.getSelf(hash).then((result) => {
        if (result.count) {
            res.json({success: true, result: result.user});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});

app.post("/getSelfInf", isAuthenticated, (req, res) => {
    const {id,startDate,endDate} = req.body;
    db.getSelfInf(id,startDate,endDate).then((result) => {
        if (result.count) {
            res.json({success: true, result: result.user});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});

app.post("/removeRegistration", isAuthenticated, (req, res) => {
    const {userId, eventId, registrationId} = req.body;
    db.removeRegistration(userId, eventId, registrationId).then((result) => {
        console.log(result)
        if (result.count) {
            res.json({success: true});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});

app.post("/removeAllRegistrations", isAuthenticated, (req, res) => {
    const {userId, eventId} = req.body;
    db.removeAllRegistrations(userId, eventId).then((result) => {
        console.log(result)
        if (result.count) {
            res.json({success: true});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});

app.post("/getAllInf", isAuthenticated, (req, res) => {
    const {startDate, endDate, userInfo, trainers,eventName} = req.body;
    db.getAllInf(startDate, endDate, userInfo, trainers,eventName).then((result) => {
        
        if (result.count) {
            res.json({success: true, result: result.result});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});

app.post("/createUser", isAuthenticated, (req, res) => {
    const {login, password, email, name, birthday, surname, phone, description , role} = req.body;
    db.registerUserForReg(login, password, email, name, birthday, surname, phone, description, role).then((result) => {
        console.log(result)
        if (result.count) {
            res.json({success: true, result: result.result});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});



app.post("/deleteUser", isAuthenticated, (req, res) => {
    const {id} = req.body;
    db.deleteUser(id).then((result) => {
        console.log(result)
        if (result.count) {
            res.json({success: true, result: result.result});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});

app.post("/updateUser", isAuthenticated, (req, res) => {
    const {id,login, password, email, name, birthday, surname, phone, description, role} = req.body;
    db.updateUser(id,login, password, email, name, birthday, surname, phone, description, role).then((result) => {
        console.log(result)
        if (result.count) {
            res.json({success: true, result: result.result});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});

app.post("/serchUsersOnDB", isAuthenticated, (req, res) => {
    const {serchString} = req.body;
    db.searchUsers(serchString).then((result) => {
        if (result.count) {
            res.json({success: true, result: result.users});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});

app.post("/getUsersForChange", isAuthenticated, (req, res) => {
    const {id} = req.body;
    db.getUsersForChange(id).then((result) => {
        if (result.count) {
            res.json({success: true, result: result.users});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});

app.post("/createEvent", isAuthenticated, (req, res) => {
    const {date, startTime, endTime, name, classSt, count, price, trainer} = req.body;
    db.insertEvent(date, startTime, endTime, name, classSt, count, price, trainer).then((result) => {
        ;
        if (result.count) {
            res.json({success: true});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});

app.post("/regEvent", isAuthenticated, (req, res) => {
    const {selectMassReg, usId} = req.body;
    db.regEvent(selectMassReg, usId).then((result) => {
        if (result.count) {
            res.json({success: true});
        } else {
            res.json({success: false, message: result.message});
        }
    });
});

app.post("/updateEvent", isAuthenticated, (req, res) => {
    const {id, date, startTime, endTime, name, classSt, count, price, trainer} = req.body;
    db.updateEvent(id, date, startTime, endTime, name, classSt, count, price, trainer).then((result) => {
        ;
        if (result.count) {
            res.json({success: true});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});

app.post("/getTrainers", isAuthenticated, (req, res) => {
    db.getTrainers().then((result) => {
        if (result.count) {
            res.json({success: true, result: result.events});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});

app.post("/delEvents", isAuthenticated, (req, res) => {
    const {delMass} = req.body;
    db.delEvents(delMass).then((result) => {
        ;
        if (result.count) {
            res.json({success: true});
        } else {
            res.json({success: false, message: result.errMes});
        }
    });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
    res.header("Cache-Control", "public, max-age=31536000");
});

const port = 3000;
app.listen(port, () => {
    ;
});
