import VueRouter from 'vue-router';
import { prefix } from './config';

const suffix = '/suffix';
const path = prefix + suffix;

const Foo = () => imports('/prefix/' + 'lazy');

new VueRouter({
  routes: [
    {
      path,
      component: Foo
    }
  ]
});
