<template lang="pug">
    div
      div(style="display:flex; justify-content: space-between; background-color: #45cc45; padding:10px")
        div(style="display:flex")
          v-btn(
            disabled
            append-icon="mdi-account-circle"
            class="m-5"
          ) События
          v-btn(
            @click="toUsers"
            class="m-5"
            ) Пользователи
        div(style="display:flex; align-items: center;")
          div(class="checkbox m-5")
            input(v-model="selectionMode" type="checkbox" id="cb" name="cb" )
            label(for="cb")
              span(class="text") Выбрать несколько событий
          v-btn(v-if="userRole==3" @click="createEventDialog" class="m-5") Создать событие
          v-btn(@click="logout" class="m-5") Выйти
      div
        div(class="m-5") Поиск по событиям
        div(style="display:flex")
          v-date-input(label="Начало поиска" v-model="dateStartSerch" class="w-200 m-5" @update:modelValue="searchEvent")
          v-date-input(label="Конец поиска" v-model="dateEndSerch" class="w-200 m-5" @update:modelValue="searchEvent")
          v-select(
            v-model="selectedTrainerSerch"
            :items="trainers"
            item-title="name"
            item-value="id"
            label="Выберите тренера"
            class="w-200 m-5"
            @update:modelValue="searchEvent")
          v-text-field(label="Название" v-model="eventNameSerch" class="w-200 m-5" @update:modelValue="searchEvent")
      div.cal(style="margin:10px")
        vue-cal(
          :events="events"
          :on-event-click="handleEventClick"
          :on-event-dblclick="userRole==3 ? handleEventDblClick : ''"
          :time-from="8 * 60"
          :time-to="23 * 60"
          :disable-views="['year', 'years',]"
          :editable="true"
          :multiple-selection="true"
          events-on-month-view="short"
          locale="ru"
          style="height:750px;"
          active-view="month"
        )
        div.info(style="margin:10px")
          v-btn(v-if="userRole==3" @click="eventDelete" class="m-5") Удалить
          v-btn(@click="eventReg" class="m-5") Записаться
          div(v-if="!this.selectionMode")
            v-card
              v-card-title {{this.eventTitle}} {{this.eventPrice}}
              v-card-subtitle {{this.eventDate}}
              v-card-text Тренер:{{this.eventTrainer}}
              v-card-subtitle Оставшееся количество мест {{this.eventCount}}
              br
          div(v-else="this.selectionMode")
            h2 Выбранные события
            v-card(v-for="event in selectedEvents" class="m-5")
              v-card-title {{event.title}} Цена:{{event.price}} руб.
              v-card-subtitle {{this.formatDate(event.start).split(" ")[0]+"   "+this.formatDate(event.start).split(" ")[1]+"-"+this.formatDate(event.end).split(" ")[1]}}
              v-card-text Тренер:{{this.trainers.find(trainer => trainer.id === event.trainer).name}}
              v-card-subtitle Оставшееся количество мест {{event.count}} 
              br
    v-dialog(v-model="showDialogChange" style="max-width:50%")
      v-card 
        v-card-title
          span Изменение события
        v-card-text
          v-text-field(label="Название" v-model="eventNameEd")
          div(class="d-flex justify-space-between")
            v-date-input(label="Дата события" v-model="dateEd" class="w-200 m-5")
            v-text-field(
              class="w-200 m-5"
              v-model="startTimeEd"
              :active="modalStartEd"
              :focused="modalStartEd"
              label="Начало"
              prepend-icon="mdi-clock-time-four-outline"
              readonly
              )
              v-dialog(
                v-model="modalStartEd"
                activator="parent"
                width="auto"
                )
                v-time-picker(
                  v-if="modalStartEd"
                  v-model="startTimeEd"
                  format="24hr"
                  )
            v-text-field(
              class="w-200 m-5"
              v-model="endTimeEd"
              :active="modalEndEd"
              :focused="modalEndEd"
              label="Конец"
              prepend-icon="mdi-clock-time-four-outline"
              readonly
              )
              v-dialog(
                v-model="modalEndEd"
                activator="parent"
                width="auto"
                )
                v-time-picker(
                  v-if="modalEndEd"
                  v-model="endTimeEd"
                  format="24hr"
                  ) 
          v-combobox(
            label="Тренер" 
            v-model="trainersEd" 
            :items="trainersOne"
            item-title="name"
            item-value="id"
            )
          v-text-field(label="Цена" v-model="eventPriceEd")
          v-number-input(
            v-model="countEd"
            :reverse="false"
            controlVariant="stacked"
            label="Количество мест"
            :hideInput="false"
            :inset="false")
          v-combobox(
            label="Стиль для события" 
            v-model="classEd" 
            :items="classStyle"
            item-title="name"
            item-value="id"
            ) 
          v-btn(@click="changeEvents") Изменить
    v-dialog(v-model="showDialogCreate" style="max-width:50%")
      v-card 
        v-card-title
          span Создать событие
        v-card-text
          v-text-field(label="Название" v-model="eventNameCr")
          div(class="d-flex justify-space-between")
            v-date-input(label="Дата события" v-model="dateCr" class="w-200 m-5")
            v-text-field(
              class="w-200 m-5"
              v-model="startTimeCr"
              :active="modalStartCr"
              :focused="modalStartCr"
              label="Начало"
              prepend-icon="mdi-clock-time-four-outline"
              readonly
              )
              v-dialog(
                v-model="modalStartCr"
                activator="parent"
                width="auto"
                )
                v-time-picker(
                  v-if="modalStartCr"
                  v-model="startTimeCr"
                  format="24hr"
                  )
            v-text-field(
              class="w-200 m-5"
              v-model="endTimeCr"
              :active="modalEndCr"
              :focused="modalEndCr"
              label="Конец"
              prepend-icon="mdi-clock-time-four-outline"
              readonly
              )
              v-dialog(
                v-model="modalEndCr"
                activator="parent"
                width="auto"
                )
                v-time-picker(
                  v-if="modalEndCr"
                  v-model="endTimeCr"
                  format="24hr"
                  ) 
          v-combobox(
            label="Тренер" 
            v-model="trainersCr" 
            :items="trainersOne"
            item-title="name"
            item-value="id"
            )
          v-text-field(label="Цена" v-model="eventPriceCr") 
          v-number-input(
            v-model="countCr"
            :reverse="false"
            controlVariant="stacked"
            label="Количество мест"
            :hideInput="false"
            :inset="false")
          v-combobox(
            label="Стиль для события" 
            v-model="classCr" 
            :items="classStyle"
            item-title="name"
            item-value="id"
            ) 
          v-btn(@click="createEvent") Создать
    v-dialog(v-model="showDialogRegistr" style="max-width:50%")
      v-card 
        v-card-title
          span Записаться на мероприятие
        v-card-text
          div(v-if="userRole>1" class="checkbox m-5")
            input(v-model="selectionModeRegis" type="checkbox" id="cb1" name="cb1" )
            label(for="cb1")
              span(class="text") Записать себя
          div(v-if="!selectionModeRegis")
            v-combobox(
              v-model="selectedUser"
              @update:modelValue="selectUs"
              @update:search="serchUs"
              :items="searchResUser"
              item-title="name"
              item-value="id"
            )
            v-card
              v-card-item Имя: {{this.nameUs}}
              v-card-item Фамилия: {{this.surnameUs}}
              v-card-item Номер телефона: {{this.phoneUs}}
              v-card-item Дата рождения: {{this.birthdayUs}}
          div(v-else="!selectionModeRegis")
            v-card
              v-card-item Имя: {{this.nameUsSelf}}
              v-card-item Фамилия: {{this.surnameUsSelf}}
              v-card-item Номер телефона: {{this.phoneUsSelf}}
              v-card-item Дата рождения: {{this.birthdayUsSelf}}
  
          v-btn(@click="regEvent" style="margin-top:5px") Записаться
  
  
  </template>
  
  <script>
  import VueCal from 'vue-cal';
  import 'vue-cal/dist/vuecal.css'
  import { VTimePicker } from 'vuetify/labs/components';
  import { VDateInput } from 'vuetify/labs/VDateInput'
  import { VNumberInput } from 'vuetify/labs/VNumberInput'
  import { toast } from "vue3-toastify";
  import "vue3-toastify/dist/index.css";
  
  export default {
    components: {
      VueCal,
      VTimePicker,
      VDateInput,
      VNumberInput,
    },
    data() {
      return {
        selectionModeRegis: true,
        nameUs: '',
        phoneUs: '',
        birthdayUs: '',
        surnameUs: '',
        nameUsSelf: '',
        phoneUsSelf: '',
        idUsSelf: '',
        birthdayUsSelf: '',
        surnameUsSelf: '',
        selectedUser: '',
        searchResUser: [],
        events: [
        ],
        trainers: [
        ],
        trainersOne: [],
        classStyle: [
          { id: 'event-purple', name: 'Фиолетовый' },
          { id: 'event-oronge', name: 'Оранжевый' },
          { id: 'event-ocean', name: 'Океан' },
          { id: 'event-yellow', name: 'Желтый' },
          { id: 'event-green', name: 'Зеленый' },
          { id: 'event-blue', name: 'Синий' }
        ],
        trainersEd: "",
        selectedEvents: [],
        selectedEvent: "",
        changeEvent: {
          id: 6,
          start: '2024-12-02 15:00',
          end: '2024-12-02 18:00',
          title: 'Событие 5',
          class: 'event-purple',
          trainer: 1
        },
        selectionMode: false,
        eventDate: "Время события",
        eventTrainer: "Тренер",
        eventTitle: "Название события",
        showDialogChange: false,
        eventNameEd: "",
        startTimeEd: "00:00",
        modalStartEd: false,
        modalEndEd: false,
        endTimeEd: "00:00",
        dateEd: null,
        classEd: "",
        showDialogCreate: false,
        showDialogRegistr: false,
        eventNameCr: "",
        startTimeCr: "12:00",
        modalStartCr: false,
        modalEndCr: false,
        endTimeCr: "13:00",
        dateCr: null,
        classCr: "",
        trainersCr: "",
        countCr: 0,
        countEd: 0,
        eventCount: "",
        eventPrice: "",
        eventPriceCr: 0,
        eventPriceEd: 0,
        dateStartSerch: false,
        dateEndSerch: false,
        selectedTrainerSerch: null,
        eventNameSerch: '',
        userRole: 0,
      };
    },
    async mounted() {
  
      try {
        const currentDate = new Date();
        var startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
        var endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
  
        this.dateStartSerch = startDate
        this.dateEndSerch = endDate
  
        var year = startDate.getFullYear();
        var month = String(startDate.getMonth() + 1).padStart(2, '0');
        var day = String(startDate.getDate()).padStart(2, '0');
        startDate = `${year}-${month}-${day}`
  
        year = endDate.getFullYear();
        month = String(endDate.getMonth() + 1).padStart(2, '0');
        day = String(endDate.getDate()).padStart(2, '0');
        endDate = `${year}-${month}-${day}`
  
        this.userRole = localStorage.getItem('role');
  
        var response = await fetch('/getEvents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate: startDate, endDate: endDate, trainerId: false, eventName: "" })
        });
  
        if (response.status === 401) {
          this.$router.push('/');
          return;
        }
  
        var result = await response.json()
        if (result.success) {
          this.events = []
          result.result.forEach(
            (event) => {
              if (event.count <= 0) event.style = "event-red"
              this.events.push({
                id: event.id,
                start: `${event.year}-${String(event.month).padStart(2, '0')}-${String(event.date).padStart(2, '0')} ${event.timestart}`,
                end: `${event.year}-${String(event.month).padStart(2, '0')}-${String(event.date).padStart(2, '0')} ${event.timeend}`,
                title: event.name,
                class: event.style,
                trainer: event.id_trainers,
                count: event.count,
                price: event.price,
              })
            }
          )
          
        } else {
          
        }
  
        response = await fetch('/getTrainers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
  
        result = await response.json()
        if (result.success) {
          this.trainers = [{
            id: null,
            name: "Все"
          }]
          this.trainersOne = []
          result.result.forEach(
            (trainer) => {
              this.trainers.push({
                id: trainer.id,
                name: trainer.name,
                description: trainer.description,
              })
              this.trainersOne.push({
                id: trainer.id,
                name: trainer.name,
                description: trainer.description,
              })
            }
          )
          
        } else {
          
        }
  
        response = await fetch('/getSelf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hash: localStorage.getItem('user') })
        });
  
        result = await response.json()
        if (result.success) {
          var user = result.result[0]
          this.nameUsSelf = user.name
          this.phoneUsSelf = user.phone
          this.birthdayUsSelf = user.birthday
          this.surnameUsSelf = user.surname
          this.idUsSelf = user.id
        } else {
          
        }
  
      } catch (err) {
        ;
      }
  
    },
    methods: {
      async eventReg() {
        this.searchResUser = []
        this.serchUsersOnDB("")
        this.selectedUser = ""
        this.nameUs = ""
        this.surnameUs = ""
        this.phoneUs = ""
        this.birthdayUs = ""
        this.showDialogRegistr = true
      },
  
      serchUs(query) {
        this.serchUsersOnDB(query)
      },
      selectUs() {
        var spl = this.selectedUser.name.split(" ")
        this.nameUs = spl[0]
        this.surnameUs = spl[1]
        this.phoneUs = spl[2]
        this.birthdayUs = spl[3]
        
      },
      toUsers(){
        this.$router.push('/users');
      },
  
      async logout() {
        var response = await fetch("/logout", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        this.$router.push('/');
        return;
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
          console.log(err)
        }
      },
  
      async regEvent() {
        try {
          var selectMassReg = []
          if (!this.selectionMode) {
            selectMassReg.push(this.selectedEvent.id)
          } else {
            this.selectedEvents.forEach(
              (event) => {
                var index = event.id
                
                selectMassReg.push(index)
              }
            )
          }
  
          if (selectMassReg.length > 0) {
            var usId = ""
            if (this.selectionModeRegis) {
              usId = this.idUsSelf
            } else {
              usId = this.selectedUser.id
            }
            if (usId == undefined) {
              this.toastMess("Пользователь не выбран", 0)
            }
            var response = await fetch('/regEvent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ selectMassReg: selectMassReg, usId: usId })
            });
  
            var result = await response.json();
  
            if (result.success) {
              this.toastMess("Запись на события прошла успешно", 1)
              if (!this.selectionMode) {
                this.selectedEvent = []
                this.eventDate = "Время события"
                this.eventTrainer = "Тренер"
                this.eventTitle = "Название события"
                this.eventCount = ""
                this.eventPrice = ""
              } else {
                this.selectedEvents = []
                this.selectedEvent = !this.selectedEvent
              }
              this.showDialogRegistr = false
              this.reloadEvent()
            } else {
              
              this.toastMess(result.message, 0)
            }
  
          } else {
            this.toastMess("Нет выбранных событий", 0)
          }
        }
        catch (err) {
          
          this.toastMess(err.message, 0)
        }
  
      },
  
      async reloadEvent() {
        try {
          const currentDate = new Date();
          var startDate = this.dateStartSerch
          var endDate = this.dateEndSerch
  
          startDate = this.formatDate(startDate).split(" ")[0]
          endDate = this.formatDate(endDate).split(" ")[0]
  
          var response = await fetch('/getEvents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: startDate, endDate: endDate, trainerId: this.selectedTrainerSerch, eventName: this.eventNameSerch })
          });
          
          
          var result = await response.json()
          if (result.success) {
            this.events = []
            result.result.forEach(
              (event) => {
                if (event.count <= 0) event.style = "event-red"
                this.events.push({
                  id: event.id,
                  start: `${event.year}-${String(event.month).padStart(2, '0')}-${String(event.date).padStart(2, '0')} ${event.timestart}`,
                  end: `${event.year}-${String(event.month).padStart(2, '0')}-${String(event.date).padStart(2, '0')} ${event.timeend}`,
                  title: event.name,
                  class: event.style,
                  trainer: event.id_trainers,
                  count: event.count,
                  price: event.price,
                })
              }
            )
          } else {
            this.events = []
            this.toastMess(result.message, 0)
          }
  
          response = await fetch('/getTrainers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
  
          result = await response.json()
          if (result.success) {
            this.trainers = [{
              id: null,
              name: "Все"
            }]
            this.trainersOne = []
            result.result.forEach(
              (trainer) => {
                this.trainers.push({
                  id: trainer.id,
                  name: trainer.name,
                  description: trainer.description,
                })
                this.trainersOne.push({
                  id: trainer.id,
                  name: trainer.name,
                  description: trainer.description,
                })
              }
            )
          } else {
            this.toastMess(result.message, 0)
          }
  
        } catch (err) {
          this.toastMess(err.message, 0)
        }
      },
      searchEvent() {
        this.reloadEvent()
      },
      handleEventClick(event) {
        if (!this.selectionMode) {
          this.eventDate = this.formatDate(event.start).split(" ")[0] + "   " + this.formatDate(event.start).split(" ")[1] + "-" + this.formatDate(event.end).split(" ")[1]
          this.eventTrainer = this.trainers.find(trainer => trainer.id === event.trainer).name
          this.eventTitle = event.title
          this.selectedEvent = event
          this.eventCount = event.count
          this.eventPrice = "Цена: " + event.price + " руб."
        } else {
          this.toggleEventSelection(event);
        }
      },
      async eventDelete() {
        try {
          var selectMassDel = []
          if (!this.selectionMode) {
            const index = this.selectedEvent.id
            if (index != -1)
              selectMassDel.push(index)
            this.selectedEvent = []
            this.eventDate = "Время события"
            this.eventTrainer = "Тренер"
            this.eventTitle = "Название события"
            this.eventCount = ""
            this.eventPrice = ""
          } else {
            this.selectedEvents.forEach(
              (event) => {
                const index = event.id
                selectMassDel.push(index)
              }
            )
            this.selectedEvents = []
            this.selectedEvent = !this.selectedEvent
          }
          if (selectMassDel.length > 0) {
            const response = await fetch('/delEvents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ delMass: selectMassDel })
            });
            
            const result = await response.json()
            if (result.success) {
              this.toastMess("Удаление прошло успешно")
              this.reloadEvent()
            }
            else {
              this.toastMess(result.message, 0)
            }
          }
        } catch (err) {
          this.toastMess(err.message, 0)
        }
      },
      async createEvent() {
        try {
          const [startHours, startMinutes] = this.startTimeCr.split(":").map(Number)
          const [endHours, endMinutes] = this.endTimeCr.split(":").map(Number)
          const startTimeInMinutes = startHours * 60 + startMinutes
          const endTimeInMinutes = endHours * 60 + endMinutes
  
          const workStart = 8 * 60
          const workEnd = 22 * 60
          if (startTimeInMinutes < workStart || startTimeInMinutes > workEnd) {
            this.toastMess("Начало занятия должно быть между 8:00 и 22:00", 0)
            return
          }
          if (endTimeInMinutes < workStart || endTimeInMinutes > workEnd) {
            this.toastMess("Окончание занятия должно быть между 8:00 и 22:00", 0)
            return
          }
          if (startTimeInMinutes > endTimeInMinutes) {
            this.toastMess("Начало занятия должно быть раньше окончания", 0)
            return
          }
          if (this.classCr == "" || this.eventNameCr == "" || this.trainersCr == "") {
            this.toastMess("Пожалуйста, заполните все поля", 0)
            return
          }
          if (Number(this.countCr) <= 0) {
            this.toastMess("Количество мест должно быть больше 0", 0)
            return
          }
  
          var response = await fetch('/createEvent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: this.formatDate(this.dateCr).split(" ")[0],
              startTime: this.startTimeCr,
              endTime: this.endTimeCr,
              name: this.eventNameCr,
              classSt: this.classCr,
              count: Number(this.countCr),
              price: this.eventPriceCr,
              trainer: this.trainersCr
            })
          });
  
          var result = await response.json()
          if (result.success) {
            this.toastMess("Событие создано")
            this.reloadEvent()
            this.showDialogCreate = false
          } else {
            this.toastMess(result.message, 0)
          }
  
        } catch (err) {
          this.toastMess(err.message, 0)
        }
  
  
      },
      handleEventDblClick(event, e) {
        this.classEd = this.classStyle.find(clas => clas.id === event.class)
        this.changeEvent.class = event.class
        this.trainersMass = []
        this.trainers.forEach(trainer => {
          this.trainersMass.push(trainer.name)
        })
        this.trainersEd = this.trainers.find(trainer => trainer.id === event.trainer)
        this.changeEvent.id = event.id
        this.changeEvent.start = this.formatDate(event.start)
        this.changeEvent.end = this.formatDate(event.end)
        this.startTimeEd = this.changeEvent.start.split(" ")[1]
        this.endTimeEd = this.changeEvent.end.split(" ")[1]
        this.dateEd = new Date(this.changeEvent.end.split(" ")[0])
        this.changeEvent.title = event.title
        this.changeEvent.class = event.class
        this.eventNameEd = event.title
        this.countEd = event.count
        this.eventPriceEd = event.price
        this.showDialogChange = true
        e.stopPropagation()
      },
      async changeEvents() {
  
        var response = await fetch('/updateEvent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: this.changeEvent.id,
            date: this.formatDate(this.dateEd).split(" ")[0],
            startTime: this.startTimeEd,
            endTime: this.endTimeEd,
            name: this.eventNameEd,
            classSt: this.classEd,
            count: Number(this.countEd),
            price: this.eventPriceEd,
            trainer: this.trainersEd
          })
        });
  
        var result = await response.json()
        if (result.success) {
          this.toastMess("Событие изменено")
          this.reloadEvent()
          this.showDialogChange = false
        } else {
          this.toastMess(result.message, 0)
        }
  
      },
      toggleSelectionMode() {
        this.selectionMode = !this.selectionMode;
        if (!this.selectionMode) {
          this.selectedEvents = []; // Сбросить выбранные события при выходе из режима выбора
        } else {
          this.eventDate = "Время события"
          this.eventTrainer = "Тренер"
          this.eventTitle = "Название события"
          this.eventCount = ""
          this.eventPrice = ""
        }
      },
      toggleEventSelection(event) {
        const index = this.selectedEvents.findIndex(e => e.id === event.id);
        if (index === -1) {
          this.selectedEvents.push(event);
        } else {
          this.selectedEvents.splice(index, 1);
        }
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
      createEventDialog() {
        this.eventNameCr = ""
        this.trainersCr = ""
        this.classCr = ""
        this.startTimeCr = "12:00"
        this.endTimeCr = "13:00"
        this.dateCr = new Date(`${(new Date()).getFullYear()}-${String((new Date()).getMonth() + 1).padStart(2, '0')}-${String((new Date()).getDate()).padStart(2, '0')}`)
        this.showDialogCreate = true
        this.trainersMass = []
        this.trainers.forEach(trainer => {
          this.trainersMass.push(trainer.name);
        })
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
  @mixin transition($transition...) {
    -moz-transition: $transition;
    -o-transition: $transition;
    -webkit-transition: $transition;
    transition: $transition;
  }
  
  @mixin transition-property($property...) {
    -moz-transition-property: $property;
    -o-transition-property: $property;
    -webkit-transition-property: $property;
    transition-property: $property;
  }
  
  @mixin transition-duration($duration...) {
    -moz-transition-property: $duration;
    -o-transition-property: $duration;
    -webkit-transition-property: $duration;
    transition-property: $duration;
  }
  
  @mixin transition-timing-function($timing...) {
    -moz-transition-timing-function: $timing;
    -o-transition-timing-function: $timing;
    -webkit-transition-timing-function: $timing;
    transition-timing-function: $timing;
  }
  
  @mixin transition-delay($delay...) {
    -moz-transition-delay: $delay;
    -o-transition-delay: $delay;
    -webkit-transition-delay: $delay;
    transition-delay: $delay;
  }
  
  @mixin keyframes($name) {
    @-webkit-keyframes #{$name} {
      @content;
    }
  
    @-moz-keyframes #{$name} {
      @content;
    }
  
    @-ms-keyframes #{$name} {
      @content;
    }
  
    @keyframes #{$name} {
      @content;
    }
  }
  
  @mixin animation($prop) {
    -webkit-animation: $prop;
    -moz-animation: $prop;
    -o-animation: $prop;
    animation: $prop;
  }
  
  @include keyframes(check) {
    0% {
      height: 0;
      width: 0;
    }
  
    25% {
      height: 0;
      width: 4px;
    }
  
    50% {
      height: 8px;
      width: 4px;
    }
  }
  
  .info {
    width: 20%;
  }
  
  .w-200 {
    max-width: 200px;
  }
  
  .m-5 {
    margin: 5px;
  }
  
  .cal {
    display: flex;
    justify-content: space-between;
  }
  
  .selected-events {
    margin-top: 20px;
  }
  
  input[type="checkbox"] {
    display: none;
  }
  
  .checkbox {
    position: relative;
    margin-bottom: 16px;
  
    label {
      display: block;
  
      &:before {
        content: '';
        display: inline-block;
        width: 20px;
        height: 20px;
        background-image: linear-gradient(-180deg, #FFFFFF 0, #EBEBEB 100%);
        box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.15);
        margin-right: 8px;
      }
  
      &:after {
        content: '';
        display: block;
        width: 6px;
        height: 12px;
        position: absolute;
        top: 9px;
        left: 5px;
        border-right: 3px solid transparent;
        border-top: 3px solid transparent;
        transform: scaleX(-1) rotate(135deg); // Adjusted here
        transform-origin: left top;
        transition: all .1s ease-out;
      }
    }
  
    input:checked[type="checkbox"]+label:after {
      border-color: #333;
    }
  }
  
  .event-red {
    background-color: #FF0000;
    color: white
  }
  
  .event-blue {
    background-color: #0000CD;
    color: white
  }
  
  .event-green {
    background-color: #32CD32;
    color: black
  }
  
  .event-yellow {
    background-color: #FFFF00;
    color: black
  }
  
  .event-purple {
    background-color: #8A2BE2;
    color: black
  }
  
  .event-ocean {
    background-color: #0ABAB5;
    color: black
  }
  
  .event-oronge {
    background-color: #FFAA00;
    color: black
  }
  
  .vuecal__menu,
  .vuecal__cell-events-count {
    background-color: #45cc45;
  }
  
  .vuecal__title-bar {
    background-color: #e4f5ef;
  }
  
  .vuecal__cell--today,
  .vuecal__cell--current {
    background-color: rgba(240, 240, 255, 0.4);
  }
  
  .vuecal:not(.vuecal--day-view) .vuecal__cell--selected {
    background-color: rgba(122, 231, 208, 0.4);
  }
  
  .vuecal__cell--selected:before {
    border-color: rgba(66, 185, 102, 0.5);
  }
  </style>