import Vue from 'vue';
import * as utils from '../services/utils'

Vue.filter("formatProcento", function (procento) {
  return utils.formatProcento(procento)
})

Vue.filter("formatDatumACas", function (date) {
  return utils.formatDatumACas(date)
})

Vue.filter("formatDatumACasRelativni", function (date) {
  return utils.formatDatumACas(date, true)
})
