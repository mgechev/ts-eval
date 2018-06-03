import VueRouter from 'vue-router';
import { prefix } from './config';

const suffix = '/suffix';
const path = prefix + suffix;

const Foo = () => import('/prefix/' + 'lazy');

new VueRouter({
  routes: [
    {
      path,
      component: Foo
    }
  ]
});
