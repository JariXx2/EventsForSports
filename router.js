import {createRouter, createWebHistory} from "vue-router";
import Events from "./views/Events.vue";
import Login from "./views/Login.vue";
import Users from "./views/Users.vue";

const isAuthenticated = () => {
    return !!localStorage.getItem("user");
};

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "login",
            component: Login,
        },
        {
            path: "/users",
            name: "users",
            component: Users,
            beforeEnter: (to, from, next) => {
                if (isAuthenticated()) {
                    next();
                } else {
                    next("/");
                }
            },
        },
        {
            path: "/events",
            name: "Events",
            component: Events,
            beforeEnter: (to, from, next) => {
                if (isAuthenticated()) {
                    next();
                } else {
                    next("/");
                }
            },
        },
    ],
});

export default router;
