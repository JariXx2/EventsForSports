<template lang="pug">
div
    
    div(style="display:flex; justify-content: space-between; background-color: #45cc45; padding:10px")
        div(style="display:flex")
            v-btn(
            @click="toEvents"
            class="m-5"
            ) События
            v-btn(
            disabled
            append-icon="mdi-account-circle"
            class="m-5"
            ) Пользователи
        div(style="display:flex; align-items: center;")
            v-btn(@click="logout" class="m-5") Выйти
    div(style="display:flex; justify-content: space-between;background-color: #df6900; padding:10px")
        div(style="display:flex;")
            v-btn(
                class="m-5"
                :disabled="disabledBut1" 
                @click="toggleBattonRad1"
                :class="{'red-button':disabledBut1}"
                :append-icon="disabledBut1 ? 'mdi-account-circle' : ''"
                ) Мои события
            v-btn(
                v-if="userRole>0"
                class="m-5"
                :disabled="disabledBut2" 
                @click="toggleBattonRad2"
                :class="{'red-button':disabledBut2}"
                :append-icon="disabledBut2 ? 'mdi-account-circle' : ''"
                ) Записались на события
        div(style="display:flex;")
            v-btn(v-if="userRole>1" class="m-5" @click="createUserDialog") Создать пользователя
            v-btn(class="m-5" @click="changeUserDialog") Редактировать пользователя
            v-btn(v-if="userRole==3" class="m-5" @click="delUserDialog") Удалить пользователя

    
    div
        div(v-if="selfUserCheck") 
            div(style="display:flex; justify-content: center;")
                v-date-input(label="Начало поиска" v-model="dateStartSerchS" class="w-200 m-5" @update:modelValue="getSelfInf")
                v-date-input(label="Конец поиска" v-model="dateEndSerchS" class="w-200 m-5" @update:modelValue="getSelfInf")
            v-container
                v-card
                    v-card-title {{selfInformation.name}} {{selfInformation.surname}}
                    v-card-subtitle {{selfInformation.email}} | {{selfInformation.phone}} | {{selfInformation.birthday}}
                    v-card-text
                        div
                            strong Записанные мероприятия:
                            v-list 
                                v-list-item(
                                    v-for="event in selfInformation.registeredEvents"
                                    :key="event.eventId"
                                )
                                    v-list-item-title {{event.eventName}} - {{event.eventDate}} в {{event.eventTime}}
                                    v-list-item
                                        div(style="white-space: normal;")
                                            div Тренер: {{event.trainer.name}} {{event.trainer.surname}}
                                            div(v-if="event.count > 1") Количество записей: {{event.count}}
                                            div Цена за событие: {{event.price}}
                                            div(v-if="event.count > 1") Общая сумма: {{event.price * event.count}}
                                    v-list-item-action(v-if="userRole>1")
                                        v-btn(
                                            @click="removeRegistration(selfInformation.id,event.eventId,event.registrationIds[0])"
                                            color="red"
                                            class="m-5"
                                            ) Удалить запись
                                        v-btn(
                                            v-if="event.count > 1"
                                            @click="removeAllRegistrations(selfInformation.id, event.eventId)"
                                            color="red"
                                            class="m-5"
                                        ) Удалить все записи
        div(v-else="selfUserCheck")
            div(style="display:flex; justify-content: center;")
                v-combobox(
                label="Поиск по пользователю"
                v-model="selectedUserA"
                @update:search="serchUsersOnDB"
                :items="searchResUser"
                item-title="name"
                item-value="id"
                class="w-200 m-5"
                )
                v-date-input(label="Начало поиска" v-model="dateStartSerchA" class="w-200 m-5" @update:modelValue="getAllInf")
                v-date-input(label="Конец поиска" v-model="dateEndSerchA" class="w-200 m-5" @update:modelValue="getAllInf")
                v-select(
                v-if="false"
                v-model="selectedTrainerSerch"
                :items="trainers"
                item-title="name"
                item-value="id"
                label="Выберите тренера"
                class="w-200 m-5"
                @update:modelValue="getAllInf")
                v-text-field(label="Название Мероприятия" v-model="eventNameSerchA" class="w-200 m-5" @update:modelValue="getAllInf")
            v-container
                v-row
                    v-col(
                        v-for="user in users"
                        :key="user.id"
                        cols='12'
                        md="6"
                    )
                        v-card
                            v-card-title {{user.name}} {{user.surname}}
                            v-card-subtitle {{user.email}} | {{user.phone}} | {{user.birthday}}
                            v-card-text
                                div
                                    strong Записанные мероприятия:
                                    v-list 
                                        v-list-item(
                                            v-for="event in user.registeredEvents"
                                            :key="event.eventId"
                                        )
                                            v-list-item-title {{event.eventName}} - {{event.eventDate}} в {{event.eventTime}}
                                            v-list-item
                                                div(style="white-space: normal;")
                                                    div Тренер: {{event.trainer.name}} {{event.trainer.surname}}
                                                    div(v-if="event.count > 1") Количество записей: {{event.count}}
                                                    div Цена за событие: {{event.price}}
                                                    div(v-if="event.count > 1") Общая сумма: {{event.price * event.count}}
                                            v-list-item-action
                                                v-btn(
                                                    @click="removeRegistration(user.id,event.eventId,event.registrationIds[0])"
                                                    color="red"
                                                    class="m-5"
                                                    ) Удалить запись
                                                v-btn(
                                                    v-if="event.count > 1"
                                                    @click="removeAllRegistrations(user.id, event.eventId)"
                                                    color="red"
                                                    class="m-5"
                                                ) Удалить все записи

    v-dialog(v-model="showDialogCreateUser" style="max-width:480px")
        v-card
            v-card-title
                span Создание карточки пользователя
            v-card-text
                v-text-field(label="Имя" v-model="nameUser")
                v-text-field(label="Файмилия" v-model="surnameUser")
                v-date-input(label="Дата рождения" v-model="birthday" class="w-200 m-5")
                v-text-field(label="Логин" v-model="loginUser")
                v-text-field(label="Email" v-model="emailUser")
                v-text-field(label="Телефон" v-model="phoneUser")
                v-text-field(label="Пароль" v-model="passUser")
                v-text-field(label="Повторите пароль" v-model="rePassUser")
                v-radio-group(v-model="radioUser")
                    v-radio(label="Пользователь" value="0")
                    v-radio(label="Тренер" value="1")
                    v-radio(label="Кассир" value="2")
                    v-radio(label="Администратор" value="3")
                v-textarea(v-if="radioUser=='1'" label="Описание" v-model="description")
                v-btn(@click="createUser") Создать

    v-dialog(v-model="showDialogChangeUser" style="max-width:480px")
        v-card
            v-card-title
                span Изменить карточку пользователя
            v-card-text
                v-combobox(v-if="userRole>=2"
                v-model="selectedUserCh"
                @update:modelValue="selectUs"
                @update:search="serchUs"
                :items="searchResUserCh"
                item-title="name"
                item-value="id"
                )
                div(v-if="changeUserSelect || userRole<=1")
                    v-text-field(label="Имя" v-model="nameUserCh")
                    v-text-field(label="Файмилия" v-model="surnameUserCh")
                    v-date-input(label="Дата рождения" v-model="birthdayCh" class="w-200 m-5")
                    v-text-field(label="Логин" v-model="loginUserCh")
                    v-text-field(label="Email" v-model="emailUserCh")
                    v-text-field(label="Телефон" v-model="phoneUserCh")
                    v-text-field(label="Пароль" v-model="passUserCh")
                    v-text-field(label="Повторите пароль" v-model="rePassUserCh")
                    v-radio-group(v-model="radioUserChange" v-if="userRole==3")
                        v-radio(label="Пользователь" value="0")
                        v-radio(label="Тренер" value="1")
                        v-radio(label="Кассир" value="2")
                        v-radio(label="Администратор" value="3")
                    v-textarea(v-if="radioUserChange=='1'" label="Описание" v-model="descriptionChange")
                    v-btn(@click="changeUser") Изменить
    v-dialog(v-model="showDialogDeleteUser" style="max-width:480px")
        v-card
            v-card-title
                span Удалить карточку пользователя
            v-card-text
                v-combobox(
                v-model="selectedUserDl"
                @update:modelValue="selectUsDl"
                @update:search="serchUsDl"
                :items="searchResUserDel"
                item-title="name"
                item-value="id"
                )
                div(v-if="deleteUserSelect")
                    v-card
                        v-card-item Имя: {{this.nameUs}}
                        v-card-item Фамилия: {{this.surnameUs}}
                        v-card-item Номер телефона: {{this.phoneUs}}
                        v-card-item Дата рождения: {{this.birthdayUs}}
                    v-btn(@click="deleteUser") Удалить
    
</template>
<script>
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css'
import { VTimePicker } from 'vuetify/labs/components';
import { VDateInput } from 'vuetify/labs/VDateInput'
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { result } from 'lodash';

export default {
    components: {
        VueCal,
        VTimePicker,
        VDateInput,
        VNumberInput,
    },
    data() {
        return {
            nameUs: "",
            surnameUs: "",
            phoneUs: "",
            birthdayUs: "",
            selectedUserDl: "",
            serchUserForChange: [],
            searchResUserDel: [],
            showDialogDeleteUser: false,
            nameUserCh: "",
            surnameUserCh: "",
            birthdayCh: null,
            loginUserCh: "",
            emailUserCh: "",
            phoneUserCh: "",
            passUserCh: "",
            rePassUserCh: "",
            radioUserChange: 0,
            descriptionChange: "",
            selectedUserCh: '',
            searchResUserCh: [],
            changeUserSelect: false,
            deleteUserSelect: false,
            selectedUserA: '',
            dateStartSerchA: new Date((new Date()).getFullYear(), (new Date()).getMonth() - 1, (new Date()).getDate()),
            dateEndSerchA: new Date((new Date()).getFullYear(), (new Date()).getMonth() + 1, (new Date()).getDate()),
            eventNameSerchA: '',
            dateStartSerchS: new Date((new Date()).getFullYear(), (new Date()).getMonth() - 1, (new Date()).getDate()),
            dateEndSerchS: new Date((new Date()).getFullYear(), (new Date()).getMonth() + 1, (new Date()).getDate()),
            selectedTrainerSerch: null,
            querSerch: '',
            users: [],
            selfUserCheck: true,
            showDialogCreateUser: false,
            showDialogCreateTrainers: false,
            showDialogChangeUser: false,
            nameUser: "",
            surnameUser: "",
            loginUser: "",
            emailUser: "",
            phoneUser: "",
            passUser: "",
            rePassUser: "",
            description: "",
            descriptionChange: "",
            radioUser: '0',
            birthday: null,
            nameUserCh: "",
            surnameUserCh: "",
            loginUserCh: "",
            emailUserCh: "",
            phoneUserCh: "",
            passUserCh: "",
            rePassUserCh: "",
            idUsSelf: "",
            disabledBut2: false,
            disabledBut1: true,
            selfInformation: [],
            trainers: [],
            searchResUser: [],
            userRole: 0,
        };
    },
    async mounted() {

        try {
            var response = await fetch('/getSelf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hash: localStorage.getItem('user') })
            });

            this.userRole = localStorage.getItem('role');

            if (response.status === 401) {
                this.$router.push('/');
                return;
            }

            var result = await response.json()
            if (result.success) {
                var user = result.result[0]
                this.idUsSelf = user.id
            }

            const currentDate = new Date();
            var startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
            var endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());

            var year = startDate.getFullYear();
            var month = String(startDate.getMonth() + 1).padStart(2, '0');
            var day = String(startDate.getDate()).padStart(2, '0');
            startDate = `${year}-${month}-${day}`

            year = endDate.getFullYear();
            month = String(endDate.getMonth() + 1).padStart(2, '0');
            day = String(endDate.getDate()).padStart(2, '0');
            endDate = `${year}-${month}-${day}`

            response = await fetch('/getSelfInf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: this.idUsSelf, startDate: startDate, endDate: endDate })
            })
            result = await response.json()
            if (result.success)
                this.selfInformation = result.result
            else
                console.log(result.message)

            response = await fetch('/getAllInf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate: startDate, endDate: endDate, userInfo: '', trainers: null, eventName: null })
            })
            result = await response.json()
            if (result.success)
                this.users = result.result
            else
                console.log(result.message)

        } catch (err) {
            console.log(err);
        }

    },
    methods: {
        async deleteUser() {
            try {
                var response = await fetch("/deleteUser", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: this.selectedUserDl.id })
                })
                var result = await response.json()
                if (result.success) {
                    this.toastMess("Пользователь успешно удален")
                    this.showDialogDeleteUser = false
                } else {
                    this.toastMess(result.message, 0)
                }
            }
            catch (err) {
                console.log(err);
            }
        },
        async serchUsDl(query) {
            try {
                var response = await fetch('/serchUsersOnDB', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serchString: query })
                });

                var result = await response.json()
                if (result.success) {
                    this.searchResUserDel = []
                    result.result.forEach(
                        (user) => {
                            this.searchResUserDel.push({
                                id: user.id,
                                name: `${user.name} ${user.surname} ${user.phone} ${user.birthday}`,
                            })
                        }
                    )
                } else {
                    this.toastMess(result.message, 0)
                }
            }
            catch (err) {
                console.log("test")
                this.toastMess(err.message, 0)
            }
        },
        async selectUsDl() {
            try {
                this.deleteUserSelect = true
                var spl = this.selectedUserDl.name.split(" ")
                this.nameUs = spl[0]
                this.surnameUs = spl[1]
                this.phoneUs = spl[2]
                this.birthdayUs = spl[3]
            } catch (err) {
                this.deleteUserSelect = false
                console.log(err)
            }
        },
        async delUserDialog() {
            try {
                var response = await fetch('/serchUsersOnDB', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serchString: "" })
                });

                var result = await response.json()
                if (result.success) {
                    this.searchResUserDel = []
                    result.result.forEach(
                        (user) => {
                            this.searchResUserDel.push({
                                id: user.id,
                                name: `${user.name} ${user.surname} ${user.phone} ${user.birthday}`,
                            })
                        }
                    )
                    this.selectedUserDl = ""
                    this.showDialogDeleteUser = true
                    this.deleteUserSelect = false
                    this.dialogDeleteUser = true
                } else {
                    this.toastMess(result.message, 0)
                }
            }
            catch (err) {
                console.log("test")
                this.toastMess(err.message, 0)
            }
        },

        async createUser() {
            try {
                if (this.rePassUser != this.passUser)
                    this.toastMess("Пароли не совпадают")
                var response = await fetch("/createUser", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ login: this.loginUser, password: this.passUser, email: this.emailUser, name: this.nameUser, birthday: this.formatDate(this.birthday).split(" ")[0], surname: this.surnameUser, phone: this.phoneUser, description: this.description, role: Number(this.radioUser) })
                })
                var result = await response.json()
                if (result.success) {
                    this.toastMess("Пользователь успешно добавлен")
                    this.showDialogCreateUser = false
                } else {
                    this.toastMess(result.message, 0)
                }
            } catch (err) {
                console.log(err);
            }
        },
        async changeUser() {
            try {
                if (this.rePassUserCh != this.passUserCh)
                    this.toastMess("Пароли не совпадают")
                var response = await fetch("/updateUser", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: this.serchUserForChange.client.id, login: this.loginUserCh, password: this.passUserCh, email: this.emailUserCh, name: this.nameUserCh, birthday: this.formatDate(this.birthdayCh).split(" ")[0], surname: this.surnameUserCh, phone: this.phoneUserCh, description: this.descriptionChange, role: Number(this.radioUserChange) })
                })
                var result = await response.json()
                if (result.success) {
                    this.toastMess("Данные успешно изменены")
                    this.showDialogChangeUser = false
                } else {
                    this.toastMess(result.message, 0)
                }
            } catch (err) {
                console.log(err);
            }
        },
        async serchUs(query) {
            try {
                var response = await fetch('/serchUsersOnDB', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serchString: query })
                });

                var result = await response.json()
                if (result.success) {
                    this.searchResUserCh = []
                    result.result.forEach(
                        (user) => {
                            this.searchResUserCh.push({
                                id: user.id,
                                name: `${user.name} ${user.surname} ${user.phone} ${user.birthday}`,
                            })
                        }
                    )
                } else {
                    this.toastMess(result.message, 0)
                }
            }
            catch (err) {
                console.log("test")
                this.toastMess(err.message, 0)
            }
        },
        async selectUs() {
            try {
                this.changeUserSelect = true
                var response = await fetch('/getUsersForChange', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: this.selectedUserCh.id })
                })
                var result = await response.json()
                if (result.success) {

                    this.nameUserCh = result.result.client.name
                    this.surnameUserCh = result.result.client.surname
                    this.phoneUserCh = result.result.client.phone
                    this.birthdayCh = new Date(result.result.client.birthday)

                    this.emailUserCh = result.result.user.email
                    this.loginUserCh = result.result.user.login
                    console.log(result.result.user.rule)
                    this.radioUserChange = String(result.result.user.rule)
                    if (this.radioUserChange == "1")
                        this.descriptionChange = result.result.trainer.description

                    this.serchUserForChange = result.result
                    console.log(this.serchUserForChange)
                } else {
                    console.log(result.message)
                }
            }
            catch (err) {
                this.toastMess(err.message, 0)
            }
        },
        async serchUsersOnDB(text) {
            try {
                var response = await fetch('/serchUsersOnDB', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serchString: text })
                });

                var result = await response.json()
                if (result.success) {
                    this.querSerch = text
                    this.getAllInf()
                    this.searchResUser = []
                    result.result.forEach(
                        (user) => {
                            this.searchResUser.push({
                                id: user.id,
                                name: `${user.name} ${user.surname} ${user.phone} ${user.birthday}`,
                            })
                        }
                    )
                } else {
                    this.toastMess(result.message, 0)
                }
            }
            catch (err) {
                console.log("test")
                this.toastMess(err.message, 0)
            }
        },
        async toggleBattonRad2() {
            this.disabledBut2 = !this.disabledBut2
            this.disabledBut1 = !this.disabledBut1

            var response = await fetch('/getTrainers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            var result = await response.json()
            if (result.success) {
                this.trainers = [{
                    id: null,
                    name: "Все"
                }]
                console.log(result.result)
                result.result.forEach(
                    (trainer) => {
                        console.log(trainer)
                        this.trainers.push({
                            id: trainer.id,
                            name: trainer.name,
                            description: trainer.description,
                        })
                    })
            }

            this.selfUserCheck = false;
        },

        async getSelfInf() {
            try {
                var startDate = this.dateStartSerchS
                var endDate = this.dateEndSerchS

                startDate = this.formatDate(startDate).split(" ")[0]
                endDate = this.formatDate(endDate).split(" ")[0]

                var response = await fetch('/getSelfInf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: this.idUsSelf, startDate: startDate, endDate: endDate })
                })
                var result = await response.json()
                if (result.success)
                    this.selfInformation = result.result
                else
                    this.toastMess(result.message, 0)
            }
            catch (err) {
                this.toastMess(err.message, 0)
            }
        },

        async getAllInf() {
            try {
                var startDate = this.dateStartSerchA
                var endDate = this.dateEndSerchA

                startDate = this.formatDate(startDate).split(" ")[0]
                endDate = this.formatDate(endDate).split(" ")[0]
                
                var response = await fetch('/getAllInf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ startDate: startDate, endDate: endDate, userInfo: this.querSerch, trainers: this.selectedTrainerSerch, eventName: this.eventNameSerchA })
                })
                var result = await response.json()
                if (result.success)
                    this.users = result.result
                else
                    console.log(result.message)
            }
            catch (err) {
                console.log("test1")
                this.toastMess(err.message, 0)
            }

        },

        toggleBattonRad1() {
            this.disabledBut2 = !this.disabledBut2
            this.disabledBut1 = !this.disabledBut1
            this.selfUserCheck = true;
        },
        toEvents() {
            this.$router.push('/events');
        },
        async logout() {
            var response = await fetch("/logout", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            this.$router.push('/');
            return;
        },

        async removeRegistration(userId, eventId, registrationId) {
            // Логика для удаления одной записи
            console.log("test")
            try {
                var response = await fetch('/removeRegistration', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userId, eventId: eventId, registrationId: registrationId })
                })
                var result = await response.json()
                if (result.success) {
                    this.toastMess("Удаление прошло успешно")
                    if (this.selfUserCheck) {
                        this.getSelfInf()
                    } else {
                        this.getAllInf()
                    }
                } else {
                    this.toastMess(result.message, 0)
                }
            }
            catch (err) {
                this.toastMess(err.message, 0)
            }
            console.log(`Удаление записи ${registrationId} для пользователя ${userId} на событие ${eventId}`);
            // Здесь вы можете обновить массив пользователей, чтобы удалить запись
        },

        async removeAllRegistrations(userId, eventId) {
            // Логика для удаления всех записей
            try {
                var response = await fetch('/removeAllRegistrations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userId, eventId: eventId })
                })
                var result = await response.json()
                if (result.success) {
                    this.toastMess("Удаление прошло успешно")
                    if (this.selfUserCheck) {
                        this.getSelfInf()
                    } else {
                        this.getAllInf()
                    }
                } else {
                    this.toastMess(result.message, 0)
                }
            }
            catch (err) {
                this.toastMess(err.message, 0)
            }

            console.log(`Удаление всех записей для пользователя ${userId} на событие ${eventId}`);
            // Здесь вы можете обновить массив пользователей, чтобы удалить все записи
        },

        async changeUserDialog() {
            if (this.userRole <= 1) {
                var response = await fetch('/getUsersForChange', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: this.idUsSelf })
                })
                var result = await response.json()
                if (result.success) {

                    this.nameUserCh = result.result.client.name
                    this.surnameUserCh = result.result.client.surname
                    this.phoneUserCh = result.result.client.phone
                    this.birthdayCh = new Date(result.result.client.birthday)

                    this.emailUserCh = result.result.user.email
                    this.loginUserCh = result.result.user.login
                    console.log(result.result.user.rule)
                    this.radioUserChange = String(result.result.user.rule)
                    if (this.radioUserChange == "1")
                        this.descriptionChange = result.result.trainer.description

                    this.serchUserForChange = result.result
                    this.showDialogChangeUser = true
                }
            } else {

                this.showDialogChangeUser = true
                this.changeUserSelect = false
                this.selectedUserCh = ''
                this.rePassUserCh = ''
                this.searchResUserCh = []
                this.nameUserCh = ""
                this.surnameUserCh = ""
                this.phoneUserCh = ""
                this.birthdayCh = null
                this.emailUserCh = ""
                this.loginUserCh = ""
                if (this.radioUserChange == "1")
                    this.descriptionChange = ""
                this.radioUserChange = String(0)
                this.serchUserForChange = []
            }

        },
        createUserDialog() {
            this.nameUser = ""
            this.surnameUser = ""
            this.loginUser = ""
            this.emailUser = ""
            this.phoneUser = ""
            this.passUser = ""
            this.rePassUser = ""
            this.birthday = null
            this.description = ""
            this.radioUser = 0
            this.showDialogCreateUser = true
        },
        createTrainerDialog() {
            this.nameUser = ""
            this.surnameUser = ""
            this.loginUser = ""
            this.emailUser = ""
            this.phoneUser = ""
            this.passUser = ""
            this.rePassUser = ""
            this.description = ""
            this.showDialogCreateTrainers = true
        },
        formatDate(date) {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        },
        toastMess(message, mode = 1) {
            if (mode == 1)
                toast(message, {
                    "theme": "auto",
                    "type": "success",
                    "position": "bottom-right",
                    "dangerouslyHTMLString": true
                })
            else
                toast(message, {
                    "theme": "auto",
                    "type": "error",
                    "position": "bottom-right",
                    "dangerouslyHTMLString": true
                })

        },
    },
};
</script>
<style>
.w-200 {
    max-width: 200px;
}

.m-5 {
    margin: 5px;
}
</style>