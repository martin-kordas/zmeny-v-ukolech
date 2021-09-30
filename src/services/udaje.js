import * as utils from './utils'
import Filtry from './filtry'

class Udaje {

  #ciselniky                  = {}
  #nactenoPromise             = null
  #diffTypVychozi             = "word"

  #udaje                      = {
    id_ukolu                  : {
      nazev                   : "ID úkolu",
      ciselneRazeni           : true,
    },
    popis_ukolu               : {
      nazev                   : "Zadání",
      vratFiltrCb             : hodnotaFiltru => {
        // v rámci popisu úkolu hledáme i ID úkolu
        return ukol => {
          const filtrCb = Filtry.vratVychoziFiltrCb('popis_ukolu', hodnotaFiltru)
          return filtrCb(ukol) || ukol.id_ukolu == hodnotaFiltru || ukol.id_nadukolu == hodnotaFiltru
        }
      }
    },
    id_resitele               : {
      nazev                   : "Řešitel",
      formatCb                : val => this.#ciselniky?.resitele?.[val] ?? '(neznámý řešitel)'
    },
    termin_splneni            : {
      nazev                   : "Termín splnění",
      formatCb                : val => utils.formatDatum(val),
      diffTyp                 : 'line'
    },
    datum_ukonceni            : {
      nazev                   : "Datum ukončení",
      formatCb                : val => val ? utils.formatDatum(val) : '',
      diffTyp                 : 'line'
    },
    stav                      : {
      nazev                   : "Stav",
      formatCb                : val => utils.formatProcento(val),
      diffTyp                 : 'line'
    },
    id_priority: {
      nazev                   : "Priorita",
      formatCb                : val => this.#ciselniky?.priority?.[val]
    },
    odhadovane_hodiny         : {
      nazev                   : "Odh. hodiny",
      formatCb                : val => utils.formatCas(val, false),
      diffTyp                 : 'line'
    },
    odkaz                     : "Odkaz",
    duvod_pro_termin_splneni  : "Důvod pro Termín splnění",
    poznamky                  : "Poznámky",
    id_nadukolu               : "ID nadúkolu",
    skoly                     : {
      nazev                   : "Školy",
      formatCb                : val => val?.id_skoly ? this.#vratSkolyTextove(val.id_skoly) : ''
    },

    // komentáře
    komentar                  : "Komentáře",
    id_uzivatele              : "Uživatel",
    datum_a_cas               : "Datum a čas",
  }

  // údaje v pořadí, jak se zobrazují v diff tabulce
  #udajeProDiffTabulku        = [
    'popis_ukolu', 'duvod_pro_termin_splneni', 'odkaz', 'poznamky', 'komentar', 'id_priority', 
    'id_resitele', 'odhadovane_hodiny', 'termin_splneni', 'stav', 'skoly'
  ]


  constructor() {
    this.#nactenoPromise = (async () => {
      let ciselniky = await utils.nactiCiselniky()
      this.#ciselniky = ciselniky
    })()
  }

  /**
   * signalizuje, že se načetla asynchronní data nutná k výpočtu
   */
  get nactenoPromise() {
    return this.#nactenoPromise
  }

  get udajeProDiffTabulku() {
    return this.#udajeProDiffTabulku
  }

  vratNazevUdaje(udaj, jednotneCislo = false) {
    if (jednotneCislo && udaj == 'komentar') return 'Komentář'
    let nazev = this.#udaje[udaj]
    if (typeof nazev === 'object') nazev = nazev.nazev
    return nazev
  }

  vratNazvyUdaju() {
    let nazvyUdaju = {}
    for (let udaj in this.#udaje) {
      nazvyUdaju[udaj] = this.vratNazevUdaje(udaj)
    }
    return nazvyUdaju
  }

  vratFiltrCb(udaj, hodnotaFiltru) {
    return this.#udaje[udaj]?.vratFiltrCb?.(hodnotaFiltru) ?? Filtry.vratVychoziFiltrCb(udaj, hodnotaFiltru)
  }

  vratDiffTypUdaje(udaj) {
    return this.#udaje[udaj]?.diffTyp ?? this.#diffTypVychozi
  }

  vratCiselneRazeni(udaj) {
    return this.#udaje[udaj]?.ciselneRazeni ?? false
  }

  zformatujHodnotuUdaje(udaj, hodnota) {
    let formatCb = this.#udaje[udaj]?.formatCb
    let hodnotaFormat = formatCb ? formatCb(hodnota) : hodnota
    return hodnotaFormat
  }

  zformatujUkol(ukol) {
    let ukolZformatovany = {}
    for (let udaj in ukol) {
      ukolZformatovany[udaj] = this.zformatujHodnotuUdaje(udaj, ukol[udaj])
    }
    return ukolZformatovany
  }

  zformatujKomentar(komentar) {
    // názvy údajů komentáře a úkolu jsou disjunktní a metoda úkolu formátuje i údaje komentáře
    return this.zformatujUkol(komentar)
  }

  #vratSkolyTextove(idsSkoly) {
    return idsSkoly
      .map(idSkoly => {
        let skola = this.#ciselniky?.skoly?.[idSkoly] ?? null
        if (!skola) return '\u2013'
        return `${skola.obec} (${skola.id_skoly} \u2013 ${skola.nazev_zkracene})`
      })
      .join(', ')
  }

}

export default new Udaje
