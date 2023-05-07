import {createWebHistory, createRouter, createWebHashHistory} from "vue-router"
import Home from "./pages/Home.vue"
import Settings from "./pages/Settings.vue";
import ModpackModify from "./pages/ModpackModify.vue";

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/settings",
        name: "Settings",
        component: Settings,
    },
    {
        path: "/modpack/:id",
        name: "Mod pack info",
        component: ModpackModify,
    },
]

export default createRouter({
    history: createWebHashHistory(),
    routes,
})