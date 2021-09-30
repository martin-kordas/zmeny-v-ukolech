export default class Filtry {

  static filtry               = {
    dokoncene                 : {
      jen_dokoncene           : {
        nazev                 : 'Jen dokončené úkoly',
        filtrCb               : ukol => !!ukol.datum_ukonceni
      },
      jen_nedokoncene         : {
        nazev                 : 'Jen nedokončené úkoly',
        filtrCb               : ukol => !ukol.datum_ukonceni
      }
    }
  }

  static vratVychoziFiltrCb(udaj, hodnotaFiltru) {
    return ukol => {
      let hodnotaUdaje = typeof ukol[udaj] === 'string' ? ukol[udaj] : ''
      return hodnotaUdaje.toLowerCase().indexOf(hodnotaFiltru.toLowerCase()) !== -1
    }
  }

}
