import moment from 'moment'
import Api from '../services/Api'
import config from './config'

export function formatDatum(date) {
  return moment(date).format('D. M. YYYY');
}

export function formatCas(cas, sekundy = true) {
  // https://stackoverflow.com/a/41453922/14967413
  let duration = moment.duration(cas)
  let format = sekundy ? 'H:mm.ss' : 'H:mm'
  return moment.utc(duration.as('milliseconds')).format(format)
}

export function formatDatumACas(date, povolitRelativni = false) {
  let momentDate = moment(date)
  if (povolitRelativni && momentDate.toDate() > moment().subtract(30, 'minutes')) {
    return moment(date).locale('cs').fromNow();
  }
  else {
    let momentDateDnes = moment()
    let momentDateVcera = moment().subtract(1, 'days')
    if (momentDate.isSame(momentDateDnes, 'day')) return `dnes ${moment(date).format('H.mm')}`;
    else if (momentDate.isSame(momentDateVcera, 'day')) return `včera ${moment(date).format('H.mm')}`;
    else return moment(date).format('D. M. YYYY H.mm');
  }
}

export function formatDatumACasDb(date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

export function formatProcento(procento) {
  return Intl.NumberFormat(config.locale, { style: 'percent' }).format(procento / 100)
}

export const nactiWhoami = (() => {
  let whoami = null
  return () => whoami ? Promise.resolve(whoami) : (whoami = Api.get("/whoami").then(response => response.data))
})()

export const nactiCiselniky = (() => {
  let ciselniky = null
  return () => {
    if (ciselniky) return Promise.resolve(ciselniky)
    ciselniky = Promise
      .all([
        Api.get("/servis/ukoly/ciselniky"),
        Api.get("/skoly")
      ])
      .then((res) => {
        let [resCiselniky, resSkoly] = res
        let ciselniky = resCiselniky.data
        ciselniky.skoly = resSkoly.data

        ciselniky.resiteleSetrideni = Object.entries(ciselniky.resitele)
          .sort((resitel1, resitel2) => {
            if (resitel1[1] === resitel2[1]) return 0
            else return (resitel1[1] > resitel2[1]) ? 1 : -1
          })
        ciselniky.procesniKrokyVcetneProcesuSetridene = Object.entries(ciselniky.procesni_kroky_vcetne_procesu)
          .sort((procesniKrok1, procesniKrok2) => {
            return procesniKrok1[1].localeCompare(procesniKrok2[1], undefined, {numeric: true, sensitivity: 'base'})
          })

        return ciselniky
      })
    return ciselniky
  }
})()

export function otevriUkol(idUkolu, hotovo = false) {
  let url = `/servis/ukoly/?id_ukolu=${idUkolu}`
  if (hotovo) url += '&hotovo=1'
  window.open(url, '_blank').focus();
}

export function zkopirujOdkazNaUkol(idUkolu) {
  zkopirujText(`https://www.example.com/servis/ukoly/?id_ukolu=${idUkolu}`)
}

export function zkopirujText(text) {
  navigator.clipboard.writeText(text)
}

export function jeZmenaNovyUkol(zmena) {
  return zmena.predchozi_ukol === false
}

export function zapisLocalStorage(vlastnost, hodnota) {
  if (typeof vlastnost === 'object') {
    let vlastnosti = vlastnost
    for (let vlastnost1 in vlastnosti) zapisLocalStorage(vlastnost1, vlastnosti[vlastnost1])
  }
  else localStorage.setItem(`${config.localStorageNamespace}.${vlastnost}`, JSON.stringify(hodnota))
}

export function vratLocalStorage(vlastnost) {
  let res = localStorage.getItem(`${config.localStorageNamespace}.${vlastnost}`)
  return res !== null ? JSON.parse(res) : res
}

