<template lang="pug">
.login-container
  .login-background
    img(src="./../data/nordArena.jpg")
  Transition(name="switchingForm")
    .login-form(v-if="!showRegister")
      form(@submit.prevent="autorization")
        label Логин или почта
        input(type="text", v-model="login")
        br
        label Пароль
        input(type="password", v-model="password")
        br
        button(type="submit") Войти
      button(@click="showRegistrForm" style="margin-top: 10px") Зарегистрироваться
    .register-form(v-else)
      form(@submit.prevent="registration")
        label Имя
        input(type="text", v-model="name")
        label Фамилия
        input(type="text", v-model="surname")
        label Логин
        input(type="text", v-model="loginReg")
        label Email
        input(type="text", v-model="email")
        label Телефон
        input(type="tel", v-model="phone")
        label Пароль
        input(type="password", v-model="passwordReg")
        label Подтверждение пароля
        input(type="password", v-model="passwordConfirm")
        button(type="submit", @click="register") Зарегистрироваться
      button(@click="showLoginForm" style="margin-top: 10px") Вернуться к авторизации
</template>
<script>
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
export default {
  data() {
    return {
      name: "",
      surname: "",
      login: "",
      loginReg: "",
      email: "",
      phone: "",
      password: "",
      passwordReg: "",
      passwordConfirm: "",
      showRegister: false,
    };
  },
  methods: {
    async autorization() {
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: this.login, password: this.password }),
        });
        const result = await response.json();
        if (result.success) {
          localStorage.setItem('user',result.hash)
          localStorage.setItem('role',result.role)
          this.$router.push('/events');
        } else {
          this.error(result.message)
        }
      } catch (err) {
        ;
      }
    },
    showRegistrForm() {
      this.showRegister = true;
      this.login=""
      this.password=""
    },
    showLoginForm() {
      this.showRegister = false;
      this.loginReg=""
      this.passwordConfirm=""
      this.passwordReg=""
      this.name=""
      this.surname=""
      this.email=""
      this.phone=""
    },
    async registration() {
      try {
        if(this.passwordReg.length<=0||this.loginReg.length<=0||this.surname.length<=0||this.name.length<=0||this.email.length<=0||this.phone.length<=0){
          this.error("Одно из полей регистрации пустое")
          return
        }
        if(this.passwordReg!=this.passwordConfirm){
          this.error("Пароли не совпадают")
          return
        }
        const response = await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: this.passwordReg, login: this.loginReg, name: this.name, surname: this.surname, email: this.email, phone: this.phone }),
        });
        const result = await response.json();
        ;
        if (result.success) {
          toast("Регистрация прошла успешно",{
            "theme":"auto",
            "type":"success",
            "position":"bottom-right",
            "dangerouslyHTMLString": true
          })
          this.showLoginForm()
        } else {
          this.error(result.message)
        }
      } catch (err) {
        
      }
    },
    error(message) {
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
<style lang="scss" scoped>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.login-container {
  height: 100vh;
  overflow: hidden;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.login-form,
.register-form {
  background-color: #87cff0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 0;
  left: 0;
  width: 30%;
  height: 100vh;
  transition: all 0.5s;
}

.login-form {
  transform: translateX(0);
}

.register-form {
  transform: translateX(0);
  z-index: 1;
}

.switchingForm-enter-active {
  animation: switching-in 0.5s;
}

.switchingForm-leave-active {
  animation: switching-out 0.5s;
}

@keyframes switching-in {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(0);
  }
}

@keyframes switching-out {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-100%);
  }
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

label {
  margin-bottom: 10px;
}

input[type="text"],
input[type="password"],
input[type="tel"],
input[type="email"] {
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #fff;
  border-radius: 10px;
  width: 100%;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background-color: #003399;
  color: #ffffff;
  cursor: pointer;
}

button:hover {
  background-color: #002266;
}

button.return-button {
  margin-top: 20px;
  background-color: #fff;
  color: #333;
  cursor: pointer;
}

button.return-button:hover {
  background-color: #aaaaaa;
}
</style>