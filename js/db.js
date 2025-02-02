const {Pool} = require("pg");
const bcrypt = require("bcrypt");
const {query} = require("express");
const {result} = require("lodash");

class DB {
    constructor() {
        this.Pool = new Pool({
            user: "postgres",
            host: "127.0.0.1",
            database: "vodnik29",
            password: "postgres",
            port: 5432,
        });
    }

    async checkLogin(login, password) {
        const fixedSalt = "$2b$10$abcdefghijklmnopqrstuv";
        var checkLogin = this.checkString(login, "sql");
        var checkPassword = this.checkString(password, "sql");
        if (checkLogin != "true") {
            return {count: false, errMes: checkLogin};
        }
        if (checkPassword != "true") {
            return {count: false, errMes: checkPassword};
        }
        const result = await this.Pool.query(`SELECT * FROM users WHERE (email = $1 OR login = $1) AND pass = $2`, [
            login,
            await bcrypt.hash(password, fixedSalt),
        ]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            return {
                count: true,
                role: user.rule,
                hash: user.pass,
            };
        } else {
            return {count: false, errMes: "Логин или пароль не верен"};
        }
    }

    async registerUser(login, password, email, name, surname, phone) {
        const fixedSalt = "$2b$10$abcdefghijklmnopqrstuv";
        if (
            this.checkString(password, "sql") != "true" ||
            this.checkString(login, "sql") != "true" ||
            this.checkString(email, "sql") != "true" ||
            this.checkString(name, "sql") != "true" ||
            this.checkString(surname, "sql") != "true" ||
            this.checkString(phone, "sql") != "true"
        ) {
            return {count: false, errMes: this.checkString(password, "sql")};
        }
        if (this.checkString(password, "pass") != "true") {
            return {count: false, errMes: this.checkString(password, "pass")};
        }
        if (this.checkString(email, "email") != "true") {
            return {count: false, errMes: this.checkString(email, "email")};
        }
        if (this.checkString(phone, "phone") != "true") {
            return {count: false, errMes: this.checkString(phone, "pass")};
        }
        const hash = await bcrypt.hash(password, fixedSalt);
        var result = await this.Pool.query(`SELECT * FROM users WHERE (email = $1 OR login = $1) AND pass = $2`, [
            login,
            password,
        ]);

        if (result.rows.length > 0) return {count: false, errMes: "Пользователь с такими данными зарегистрирован"};

        result = await this.Pool.query(`INSERT INTO clients (name,surname,phone) VALUES ($1, $2, $3) RETURNING *`, [
            name,
            surname,
            phone,
        ]);
        result = await this.Pool.query(
            `INSERT INTO users (login, pass, email,id_clients) VALUES ($1, $2, $3,$4) RETURNING *`,
            [login, hash, email, result.rows[0].id]
        );

        return {count: result.rows.length > 0, errMes: ""};
    }

    async registerUserForReg(login, password, email, name, birthday, surname, phone, description = "", role = 0) {
        try {
            const fixedSalt = "$2b$10$abcdefghijklmnopqrstuv";
            if (
                this.checkString(password, "sql") != "true" ||
                this.checkString(login, "sql") != "true" ||
                this.checkString(email, "sql") != "true" ||
                this.checkString(name, "sql") != "true" ||
                this.checkString(surname, "sql") != "true" ||
                this.checkString(phone, "sql") != "true" ||
                this.checkString(description, "sql") != "true" ||
                this.checkString(role, "sql") != "true" ||
                this.checkString(birthday, "sql") != "true"
            ) {
                return {count: false, errMes: "Одна из строк содержит недопустимые символы"};
            }
            if (this.checkString(password, "pass") != "true") {
                return {count: false, errMes: this.checkString(password, "pass")};
            }
            if (this.checkString(email, "email") != "true") {
                return {count: false, errMes: this.checkString(email, "email")};
            }
            if (this.checkString(phone, "phone") != "true") {
                return {count: false, errMes: this.checkString(phone, "pass")};
            }
            var hash = await bcrypt.hash(password, fixedSalt);

            var result = await this.Pool.query(`SELECT * FROM users WHERE email = $1 OR login = $2`, [email, login]);
            
            if (result.rows.length > 0) {
                return {count: false, errMes: "Пользователь с такими данными уже зарегистрирован"};
            }

            result = await this.Pool.query(
                `INSERT INTO clients (name, surname, phone, birthday) VALUES ($1, $2, $3, $4) RETURNING *`,

                [name, surname, phone, birthday]
            );

            if (result.rows.length === 0) {
                return {count: false, errMes: "Ошибка при создании клиента"};
            }

            result = await this.Pool.query(
                `INSERT INTO users (login, pass, email, id_clients, rule) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [login, hash, email, result.rows[0].id, role]
            );

            if (result.rows.length === 0) {
                return {count: false, errMes: "Ошибка при создании пользователя"};
            }

            if (role == "1") {
                await this.Pool.query(`INSERT INTO trainers (id_users, description) VALUES ($1, $2)`, [
                    result.rows[0].id,
                    description,
                ]);
            }

            return {count: true};
        } catch (error) {
            return {count: false, errMes: `Ошибка обновления данных о пользователе ${error.message}`};
        }
    }

    async updateUser(id,login, password, email, name, birthday, surname, phone, description = "", role = 0) {
        try {
            const fixedSalt = "$2b$10$abcdefghijklmnopqrstuv";
            if (
                this.checkString(password, "sql") != "true" ||
                this.checkString(login, "sql") != "true" ||
                this.checkString(email, "sql") != "true" ||
                this.checkString(name, "sql") != "true" ||
                this.checkString(surname, "sql") != "true" ||
                this.checkString(phone, "sql") != "true" ||
                this.checkString(description, "sql") != "true" ||
                this.checkString(role, "sql") != "true" ||
                this.checkString(birthday, "sql") != "true"
            ) {
                return {count: false, errMes: "Одна из строк содержит недопустимые символы"};
            }
            if (this.checkString(password, "pass") != "true") {
                return {count: false, errMes: this.checkString(password, "pass")};
            }
            if (this.checkString(email, "email") != "true") {
                return {count: false, errMes: this.checkString(email, "email")};
            }
            if (this.checkString(phone, "phone") != "true") {
                return {count: false, errMes: this.checkString(phone, "pass")};
            }
            const hash = await bcrypt.hash(password, fixedSalt);

            const clientQuery = `SELECT * FROM clients WHERE id = $1`;

            const clientResult = await this.Pool.query(clientQuery, [id]);

            if (clientResult.rows.length === 0) {
                return {count: false, errMes: "Клиент не найден"};
            }

            const clientUpdateQuery = `UPDATE clients SET name = $1, surname = $2, phone = $3, birthday = $4 WHERE id = $5 RETURNING *`;

            const clientUpdateResult = await this.Pool.query(clientUpdateQuery, [name, surname, phone, birthday, id]);

            const userQuery = `SELECT * FROM users WHERE id_clients = $1`;

            const userResult = await this.Pool.query(userQuery, [id]);

            if (userResult.rows.length === 0) {
                return {count: false, errMes: "Пользователь не найден"};
            }

            const userUpdateQuery = `UPDATE users SET login = $1, pass = $2, email = $3,rule=$5 WHERE id_clients = $4 RETURNING *`;
            const userUpdateResult = await this.Pool.query(userUpdateQuery, [login, hash, email, id,role]);
            if (role === "1") {
                const trainerQuery = `SELECT * FROM trainers WHERE id_users = $1`;
                const trainerResult = await this.Pool.query(trainerQuery, [userUpdateResult.rows[0].id]);
                if (trainerResult.rows.length === 0) {
                    const trainerInsertQuery = `INSERT INTO trainers (id_users, description) VALUES ($1, $2) RETURNING *`;
                    await this.Pool.query(trainerInsertQuery, [userUpdateResult.rows[0].id, description]);
                } else {
                    const trainerUpdateQuery = `UPDATE trainers SET description = $1 WHERE id_users = $2 RETURNING *`;
                    await this.Pool.query(trainerUpdateQuery, [description, userUpdateResult.rows[0].id]);
                }
            } else {
                const trainerQuery = `SELECT * FROM trainers WHERE id_users = $1`;
                const trainerResult = await this.Pool.query(trainerQuery, [userUpdateResult.rows[0].id]);
                if (trainerResult.rows.length > 0) {
                    const trainerDeleteQuery = `DELETE FROM trainers WHERE id_users = $1`;
                    await this.Pool.query(trainerDeleteQuery, [userUpdateResult.rows[0].id]);
                }
            }
            return {count: true};
        } catch (error) {
            return {count: false, errMes: `Ошибка обновления данных о пользователе ${error.message}`};
        }
    }

    deleteUser(id){
        return this.deleteDB('clients','id',id)
    }

    async deleteDB(table, column, id) {
        try {
            const result = await this.Pool.query(`DELETE FROM ${table} WHERE ${column} = $1 RETURNING *`, [id]);
            if (result.rows.length > 0) {
                return {count: true, message: `Запись с идентификатором ${id} удалена из таблицы ${table}`};
            } else {
                return {count: false, message: `Запись с идентификатором ${id} не найдена в таблице ${table}`};
            }
        } catch (error) {
            return {count: false, message: `Ошибка удаления записи из таблицы ${table}: ${error.message}`};
        }
    }

    async insertEvent(date, startTime, endTime, name, classSt, count, price, trainer) {
        try {
            if (
                this.checkString(date, "sql") != "true" ||
                this.checkString(startTime, "sql") != "true" ||
                this.checkString(endTime, "sql") != "true" ||
                this.checkString(name, "sql") != "true" ||
                this.checkString(classSt.id, "sql") != "true" ||
                this.checkString(trainer.id, "sql") != "true" ||
                this.checkString(count, "sql") != "true" ||
                this.checkString(price, "sql") != "true"
            )
                return {count: false, errMes: "Одна из строк содержит недопустимые символы"};

            var result = await this.Pool.query(
                `INSERT INTO events (name,id_trainers,year,month,date,timeStart,timeEnd,style,count,price) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
                [
                    name,
                    trainer.id,
                    date.split("-")[0],
                    date.split("-")[1],
                    date.split("-")[2],
                    startTime,
                    endTime,
                    classSt.id,
                    count,
                    price,
                ]
            );

            return {count: true};
        } catch (error) {
            return {count: false, message: `Ошибка добавления записи в таблицу событий ${error.message}`};
        }
    }

    async updateEvent(id, date, startTime, endTime, name, classSt, count, price, trainer) {
        try {
            if (classSt == undefined) classSt = {id: "event-purple"};

            if (
                this.checkString(id, "sql") != "true" ||
                this.checkString(date, "sql") != "true" ||
                this.checkString(startTime, "sql") != "true" ||
                this.checkString(endTime, "sql") != "true" ||
                this.checkString(name, "sql") != "true" ||
                this.checkString(classSt.id, "sql") != "true" ||
                this.checkString(trainer.id, "sql") != "true" ||
                this.checkString(count, "sql") != "true" ||
                this.checkString(price, "sql") != "true"
            )
                return {count: false, errMes: "Одна из строк содержит недопустимые символы"};

            var result = await this.Pool.query(
                `UPDATE events SET name=$1, id_trainers=$2, year=$3, month=$4, date=$5, timestart=$6, timeend=$7, style=$8, count=$9, price=$10 WHERE id=$11 RETURNING *`,
                [
                    name,
                    trainer.id,
                    date.split("-")[0],
                    date.split("-")[1],
                    date.split("-")[2],
                    startTime,
                    endTime,
                    classSt.id,
                    count,
                    price,
                    id,
                ]
            );
            return {count: true};
        } catch (error) {
            return {count: false, message: `Ошибка изменения записи в таблицу событий ${error.message}`};
        }
    }

    async getTrainers() {
        try {
            var query = `select users.name, trainers.id, trainers.description from (SELECT concat(clients."name",' ',clients.surname) as name , 
            users.id from clients inner join users on clients.id = users.id_clients) as users inner join trainers 
            on trainers.id_users = users.id`;
            var result = await this.Pool.query(query);
            if (result.rows.length > 0) return {count: true, events: result.rows};
            else return {count: false, errMes: "События по данным параметрам отсутствуют"};
        } catch (error) {
            return {count: false, message: `Ошибка получения списка тренеров ${error.message}`};
        }
    }

    async getSelf(hash) {
        try {
            var query =
                "SELECT clients.name as name, clients.surname as surname, clients.phone as phone, clients.birthday as birthday, clients.id as id from clients inner join users on clients.id = users.id_clients where users.pass='" +
                hash +
                "'";

            var result = await this.Pool.query(query);
            if (result.rows.length > 0) return {count: true, user: result.rows};
            else return {count: false, errMes: "Пользователь не был найден"};
        } catch (error) {
            return {count: false, errMes: `Ошибка чтения записей из таблицы user или clients ${error.message}`};
        }
    }

    async getAllInf(startDate, endDate, userInfo, trainers, eventName) {
        try {
            var userParams = userInfo.split(" ").filter((param) => param); // Убираем пустые значения
            var trainerData = await this.getTrainers();
            let name = "",
                surname = "",
                phone = "",
                birthday = "",
                trainerId = null;

            // Определяем, какие параметры присутствуют

            userParams.forEach((param) => {
                if (param.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    birthday = param; // Если это дата
                } else if (param.match(/^\d+$/) || param.startsWith("8")) {
                    phone = param; // Если это телефон
                } else {
                    if (!name) {
                        name = param; // Имя
                    } else {
                        surname = param; // Фамилия
                    }
                }
            });

            // Проверяем, есть ли тренеры и ищем id тренера

            if (trainers) {

                trainerId = trainers; // Сохраняем id тренера
            }

            // Формируем запрос для поиска пользователей

            let query = `SELECT clients.id AS id, users.id AS id_users, clients."name" AS name, clients.surname AS surname,
                     users.login AS login, users.email AS email, clients.phone AS phone, clients.birthday AS birthday 
                     FROM clients 
                     INNER JOIN users ON clients.id = users.id_clients 
                     WHERE 1=1`;

            // Добавляем условия для фильтрации по имени, фамилии, телефону и дате рождения

            var params = [];

            if (name) {
                query += ` AND (clients."name" ILIKE $${params.length + 1} OR clients.surname ILIKE $${
                    params.length + 1
                })`;
                params.push(`%${name}%`);
            }

            if (surname) {
                query += ` AND (clients.surname ILIKE $${params.length + 1} OR clients."name" ILIKE $${
                    params.length + 1
                })`;
                params.push(`%${surname}%`);
            }

            if (phone) {
                query += ` AND clients.phone ILIKE $${params.length + 1}`;
                params.push(`%${phone}%`);
            }

            if (birthday) {
                query += ` AND clients.birthday = $${params.length + 1}`;
                params.push(birthday);
            }

            if (trainerId) {
                query += ` AND users.id IN (SELECT id_users FROM trainers WHERE id = $${params.length + 1})`;
                params.push(trainerId);
            }
            // Выполняем запрос для получения пользователей
            let result = await this.Pool.query(query, params);
            var users = result.rows;
            // Массив для хранения пользователей с событиями
            var usersWithEvents = [];
            // Перебираем пользователей и ищем их события
            for (var user of users) {
                // Получаем события для каждого пользователя
                var eventsQuery = `SELECT 
                                    registration.id AS registrationIds, 
                                    events.id AS eventId,
                                    events."name" AS eventName, 
                                    events.id_trainers AS trainerId, 
                                    events.price AS price, 
                                    events."year" AS year,
                                    events."month" AS "month", 
                                    events."date" AS "date", 
                                    events.timestart, 
                                    events.timeend 
                                FROM 
                                    registration 
                                INNER JOIN 
                                    events ON registration.id_events = events.id 
                                WHERE 
                                    registration.id_clients = $1 
                                    AND (
                                        (events."year" > $2 OR (events."year" = $2 AND events."month" > $3) OR (events."year" = $2 AND events."month" = $3 AND events."date" >= $4))
                                        AND 
                                        (events."year" < $5 OR (events."year" = $5 AND events."month" < $6) OR (events."year" = $5 AND events."month" = $6 AND events."date" <= $7))
                                    )`;

                var eventParams = [
                    user.id,
                    startDate.split("-")[0],
                    startDate.split("-")[1],
                    startDate.split("-")[2],
                    endDate.split("-")[0],
                    endDate.split("-")[1],
                    endDate.split("-")[2],
                ];
                if (trainerId) {
                    eventsQuery += ` AND events.id_trainers = $${eventParams.length + 1}`;
                    eventParams.push(trainerId);
                }
                if (eventName) {
                    eventsQuery += ` AND events."name" ILIKE $${eventParams.length + 1}`;

                    eventParams.push(`%${eventName}%`);
                }
                var eventResult = await this.Pool.query(eventsQuery, eventParams);

                if (eventResult.rows.length > 0) {
                    trainers = trainerData.events;
                    var eventsMap = {};

                    for (var row of eventResult.rows) {
                        var trainer = trainers.find((t) => t.id === row.trainerid);
                        if (!eventsMap[row.eventid]) {
                            eventsMap[row.eventid] = {
                                eventId: row.eventid,
                                eventName: row.eventname,
                                trainer: {
                                    name: trainer ? trainer.name.split(" ")[0] : "Неизвестный тренер",
                                    surname: trainer ? trainer.name.split(" ")[1] : "",
                                },
                                eventDate: `${row.year}-${String(row.month).padStart(2, "0")}-${String(
                                    row.date
                                ).padStart(2, "0")}`,
                                eventTime: `${row.timestart} - ${row.timeend}`,
                                count: 0,
                                price: row.price,
                                total: 0,
                                registrationIds: [],
                            };
                        }
                        eventsMap[row.eventid].count += 1;
                        eventsMap[row.eventid].registrationIds.push(row.registrationids);
                        eventsMap[row.eventid].total = eventsMap[row.eventid].count * row.price;
                    }

                    user.registeredEvents = Object.values(eventsMap);
                    usersWithEvents.push(user);
                }
            }
            return {count: true, result: usersWithEvents};
        } catch (error) {
            return {count: false, message: `Ошибка получения информации о пользователях ${error.message}`};
        }
    }

    async getUsersForChange(id) {
        try {
            const clientQuery = `SELECT * FROM clients WHERE id = $1`;
            const clientResult = await this.Pool.query(clientQuery, [id]);

            if (clientResult.rows.length === 0) {
                return {count: false, message: "Пользователь не найден"};
            }

            const client = clientResult.rows[0];

            const userQuery = `SELECT * FROM users WHERE id_clients = $1`;
            const userResult = await this.Pool.query(userQuery, [client.id]);
            let user = null;
            if (userResult.rows.length > 0) {
                user = userResult.rows[0];
            }

            let trainer = null;
            if (user) {
                const trainerQuery = `SELECT * FROM trainers WHERE id_users = $1`;
                const trainerResult = await this.Pool.query(trainerQuery, [user.id]);

                if (trainerResult.rows.length > 0) {
                    trainer = trainerResult.rows[0];
                }
            }

            return {
                count: true,
                users: {
                    client: client,
                    user: user,
                    trainer: trainer,
                },
            };
        } catch (error) {
            return {count: false, message: `Ошибка получения информации о пользователях ${error.message}`};
        }
    }

    async getSelfInf(id, startDate, endDate) {
        try {
            var user = {
                id: id,
                id_users: "",
                name: "",
                surname: "",
                login: "",
                email: "",
                phone: "",
                birthday: "",
                registeredEvents: [],
            };
            var query = `select clients.id as id, users.id as id_users, clients."name" as name,clients.surname as surname,
            users.login as login, users.email as email, clients.phone as phone, clients.birthday as birthday from 
            clients inner join users on clients.id  = users.id_clients where clients.id=$1`;
            var result = await this.Pool.query(query, [id]);
            if (result.rows.length > 0) {
                user.id = result.rows[0].id;
                user.id_users = result.rows[0].id_users;
                user.name = result.rows[0].name;
                user.surname = result.rows[0].surname;
                user.login = result.rows[0].login;
                user.email = result.rows[0].email;
                user.phone = result.rows[0].phone;
                user.birthday = result.rows[0].birthday;
                query = `SELECT 
                registration.id AS registrationIds, 
                events.id AS eventId,
                events."name" AS eventName, 
                events.id_trainers AS trainerId, 
                events.price AS price, 
                events."year" AS year,
                events."month" AS "month", 
                events."date" AS "date", 
                events.timestart, 
                events.timeend 
            FROM 
                registration 
            INNER JOIN 
                events ON registration.id_events = events.id 
            WHERE 
                registration.id_clients = $1 
                AND (
                    (events."year" > $2 OR (events."year" = $2 AND events."month" > $3) OR (events."year" = $2 AND events."month" = $3 AND events."date" >= $4))
                    AND 
                    (events."year" < $5 OR (events."year" = $5 AND events."month" < $6) OR (events."year" = $5 AND events."month" = $6 AND events."date" <= $7))
                );`;
                var param = [
                    id,
                    startDate.split("-")[0],
                    startDate.split("-")[1],
                    startDate.split("-")[2],
                    endDate.split("-")[0],
                    endDate.split("-")[1],
                    endDate.split("-")[2],
                ];
                result = await this.Pool.query(query, param);
                if (result.rows.length > 0) {
                    var trainerData = await this.getTrainers();
                    var trainers = trainerData.events;
                    var eventsMap = {};

                    for (const row of result.rows) {
                        const trainer = trainers.find((t) => t.id === row.trainerid);

                        if (!eventsMap[row.eventid]) {
                            eventsMap[row.eventid] = {
                                eventId: row.eventid,
                                eventName: row.eventname,
                                trainer: {
                                    name: trainer ? trainer.name.split(" ")[0] : "Неизвестный тренер",
                                    surname: trainer ? trainer.name.split(" ")[1] : "",
                                },
                                eventDate: `${row.year}-${String(row.month).padStart(2, "0")}-${String(
                                    row.date
                                ).padStart(2, "0")}`,
                                eventTime: `${row.timestart} - ${row.timeend}`,
                                count: 0,
                                price: row.price,
                                total: 0,
                                registrationIds: [],
                            };
                        }

                        eventsMap[row.eventid].count += 1;

                        eventsMap[row.eventid].registrationIds.push(row.registrationids);

                        eventsMap[row.eventid].total = eventsMap[row.eventid].count * row.price;
                    }
                    user.registeredEvents = Object.values(eventsMap);
                }
                return {count: true, user: user};
            } else {
                return {count: false, errMes: "Пользователь не был найден"};
            }
        } catch (error) {
            return {count: false, errMes: `Ошибка получения информации о пользователе ${error.message}`};
        }
    }

    async regEvent(selectMassReg, usId) {
        try {
            for (const id of selectMassReg) {
                var query = `Select * from events where id=$1`;
                var result = await this.Pool.query(query, [id]);

                if (result.rows[0].count <= 0) {
                    return {count: false, message: `Свободных мест на ${result.rows[0].name} нет`};
                }
                query = `update  events set count=count-1 where id=$1`;
                result = await this.Pool.query(query, [id]);
                query = `INSERT INTO registration (id_events,id_clients) VALUES ($1,$2)`;
                result = await this.Pool.query(query, [id, usId]);
            }
            return {count: true};
        } catch (error) {
            return {count: false, message: `Ошибка запись события ${error.message}`};
        }
    }

    async removeRegistration(userId, eventId, registrationId) {
        try {
            const deleteQuery = `DELETE FROM registration WHERE id = $1 AND id_clients = $2 RETURNING id_events`;
            const deleteResult = await this.Pool.query(deleteQuery, [registrationId, userId]);

            if (deleteResult.rows.length > 0) {
                const deletedEventId = deleteResult.rows[0].id_events;
                const updateQuery = `UPDATE events SET count = count + 1 WHERE id = $1`;
                await this.Pool.query(updateQuery, [deletedEventId]);
                return {count: true};
            } else {
                return {count: false, message: "Запись не найдена"};
            }
        } catch (error) {
            return {count: false, message: `Ошибка удаления записи ${error.message}`};
        }
    }

    async removeAllRegistrations(userId, eventId) {
        try {
            const selectQuery = `SELECT COUNT(*) AS count FROM registration WHERE id_clients = $1 AND id_events = $2`;
            const selectResult = await this.Pool.query(selectQuery, [userId, eventId]);
            const countToRemove = parseInt(selectResult.rows[0].count, 10);

            if (countToRemove > 0) {
                const deleteQuery = `DELETE FROM registration WHERE id_clients = $1 AND id_events = $2`;
                await this.Pool.query(deleteQuery, [userId, eventId]);
                const updateQuery = `UPDATE events SET count = count + $1 WHERE id = $2`;
                await this.Pool.query(updateQuery, [countToRemove, eventId]);
                return {count: true};
            } else {
                return {count: false, message: "Записи не найдены"};
            }
        } catch (error) {
            return {count: false, message: `Ошибка удаления записи ${error.message}`};
        }
    }

    async getEvents(startDate, endDate, trainerId, eventName) {
        try {
            var query = `SELECT * FROM events WHERE 1=1`;
            var params = [];

            if (startDate && endDate && startDate > endDate) {
                return {count: false, errMes: "Дата начала не может быть позже даты окончания"};
            }

            if (startDate) {
                const [startYear, startMonth, startDay] = startDate.split("-");
                query += ` AND (year > $${params.length + 1} OR (year = $${params.length + 1} AND month > $${
                    params.length + 2
                }) OR (year = $${params.length + 1} AND month = $${params.length + 2} AND date >= $${
                    params.length + 3
                }))`;
                params.push(startYear, startMonth, startDay);
            }

            if (endDate) {
                const [endYear, endMonth, endDay] = endDate.split("-");
                query += ` AND (year < $${params.length + 1} OR (year = $${params.length + 1} AND month < $${
                    params.length + 2
                }) OR (year = $${params.length + 1} AND month = $${params.length + 2} AND date <= $${
                    params.length + 3
                }))`;
                params.push(endYear, endMonth, endDay);
            }

            if (trainerId) {
                query += ` AND id_trainers = $${params.length + 1}`;
                params.push(trainerId);
            }

            if (eventName) {
                query += ` AND name ILIKE $${params.length + 1}`;
                params.push(`%${eventName}%`);
            }
            const result = await this.Pool.query(query, params);
            if (result.rows.length > 0) return {count: true, events: result.rows};
            else return {count: false, errMes: "События по данным параметрам отсутствуют"};
        } catch (error) {
            return {count: false, errMes: `Ошибка чтения записей из таблицы событий ${error.message}`};
        }
    }

    async registerUserToEvents(idUser, idEvents) {
        try {
            if (!idUser || !idEvents.length) {
                return {count: false, errMes: "Некорректные данные"};
            }

            const noPlacesEvents = [];

            for (const idEvent of idEvents) {
                const result = await this.Pool.query(`SELECT count FROM events WHERE id = $1`, [idEvent]);

                if (result.rows[0].count === 0) {
                    noPlacesEvents.push(idEvent);
                } else {
                    await this.Pool.query(`UPDATE events SET count = count - 1 WHERE id = $1`, [idEvent]);
                    await this.Pool.query(`INSERT INTO registration (id_users, id_events) VALUES ($1, $2)`, [
                        idUser,
                        idEvent,
                    ]);
                }
            }

            return {count: true, noPlacesEvents};
        } catch (error) {
            return {count: false, errMes: `Ошибка при записи в таблицу registration: ${error.message}`};
        }
    }

    async delEvents(delMass) {
        try {
            await delMass.forEach((id) => {
                this.deleteDB("events", "id", id);
            });
            return {count: true};
        } catch (error) {
            return {count: false, errMes: `Ошибка при удалении записей из таблицы ${error.message}`};
        }
    }

    async searchUsers(searchString) {
        try {
            if (this.checkString(searchString, "sql") != "true")
                return {count: false, errMes: "Одна из строк содержит недопустимые символы"};

            var query, result;
            if (searchString.length > 0) {
                const searchTerms = searchString.split(" ").filter((term) => term.trim() !== "");

                const queryParts = [];

                const values = [];

                searchTerms.forEach((term, index) => {
                    const placeholder = `$${index + 1}`;

                    queryParts.push(
                        `(name ILIKE ${placeholder} OR surname ILIKE ${placeholder} OR phone ILIKE ${placeholder} OR birthday::text ILIKE ${placeholder})`
                    );

                    values.push(`%${term}%`);
                });

                query = `SELECT * FROM clients WHERE ${queryParts.join(" OR ")}`;

                result = await this.Pool.query(query, values);
            } else {
                query = `SELECT * FROM clients`;
                result = await this.Pool.query(query);
            }

            if (result.rows.length > 0) return {count: true, users: result.rows};
            else return {count: false, errMes: "Пользователь с такими данными не найден"};
        } catch (error) {
            return {count: false, errMes: `Ошибка при поиске в таблице пользователей: ${error.message}`};
        }
    }

    checkString(string, mode = "") {
        if (mode == "email") {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(string)) {
                return "Некорректный адрес электронной почты.";
            }
        }
        if (mode == "pass") {
            if (string.length < 8 || string.length > 30) {
                return "Пароль должен содержать от 8 до 30 символов.";
            }
            // Проверка на наличие хотя бы одной заглавной буквы, одной строчной буквы, одной цифры и одного специального символа
            const hasUpperCase = /[A-Z]/.test(string);
            const hasLowerCase = /[a-z]/.test(string);
            const hasNumber = /\d/.test(string);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(string);

            if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
                return "Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву, одну цифру и один специальный символ.";
            }
        }
        if (mode == "login") {
            if (string.length < 8 || string.length > 30) {
                return "Логин должен содержать от 8 до 30 символов.";
            }
        }
        if (mode == "sql") {
            const forbiddenCharsPattern = /['";\\]/;
            if (forbiddenCharsPattern.test(string)) {
                return "Строка содержит недопустимые символы.";
            }
        }
        return "true";
    }
}

module.exports = DB;
