import { createStore } from 'vuex'
import getters from './getters'
import modules from './modules';

export default createStore({
    modules,
    getters
})