import Vue from "vue";
import Router from "vue-router";
import ZmenyUkolu from "./components/ZmenyUkolu";
import Ukoly from "./components/Ukoly";
import config from "./services/config";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: config.publicPath,
  routes: [
    {
      path: "/",
      redirect: "/zmeny_ukolu"
    },
    {
      path: "*",
      redirect: "/zmeny_ukolu"
    },
    {
      default: true,
      path: "/zmeny_ukolu",
      name: "zmenyUkolu",
      component: ZmenyUkolu,
      meta: { title: "Změny v úkolech" }
    },
    {
      path: "/ukoly",
      name: "ukoly",
      component: Ukoly,
      meta: { title: "Úkoly" }
    }
  ]
})
router.afterEach(to => {
  Vue.nextTick(() => {
    document.title = config.titleStrany
    if (to.meta.title) document.title += ' - ' + to.meta.title
  });
});

export default router
