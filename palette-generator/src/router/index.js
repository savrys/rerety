import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LibraryView from '../views/LibraryView.vue'
import ExportView from '../views/ExportView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: 'Генератор палитр'
    }
  },
  {
    path: '/library',
    name: 'Library',
    component: LibraryView,
    meta: {
      title: 'Библиотека палитр'
    }
  },
  {
    path: '/export',
    name: 'Export',
    component: ExportView,
    meta: {
      title: 'Экспорт палитр'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: {
      title: 'Настройки'
    }
  },
  {
    path: '/palette/:id',
    name: 'PaletteDetail',
    component: () => import('../views/PaletteDetailView.vue'),
    meta: {
      title: 'Палитра'
    },
    props: true
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Динамически меняем заголовок страницы
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} • Генератор цветов` : 'Генератор цветов'
  next()
})

export default router