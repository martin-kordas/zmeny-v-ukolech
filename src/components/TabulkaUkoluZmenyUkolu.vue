<script>
  import udaje from '../services/udaje'
  import TabulkaUkolu from './TabulkaUkolu.vue'
  
  export default {
    name: 'TabulkaUkoluZmenyUkolu',
    extends: TabulkaUkolu,
    data() {
      return {
        jenUkoly          : false,
        zpravaZadnyZaznam : 'Nebyly nalezeny žádné změny úkolů.',
        razenyUdaj        : 'od_ukolu',
      }
    },
    computed: {
      zmenyZobrazene() {
        // https://stackoverflow.com/a/62400741/14967413
        let filtrovaneEntries = Object.entries(this.zmenyUkolu?.zmeny ?? {})
          .filter(([idUkolu]) => idUkolu in this.ukolyZobrazene)
        return Object.fromEntries(filtrovaneEntries)
      },
      zmenyZobrazeneFormat() {
        let zmenyZobrazeneFormat = {}
        for (let idUkolu in this.zmenyZobrazene) {
          let zmenyFormat = {}
          for (let idZmeny in this.zmenyZobrazene[idUkolu]) {
            let zmena = this.zmenyZobrazene[idUkolu][idZmeny]
            let zmenaFormat = {
              ukol            : zmena.ukol            ? udaje.zformatujUkol(zmena.ukol)           : null,
              predchozi_ukol  : zmena.predchozi_ukol  ? udaje.zformatujUkol(zmena.predchozi_ukol) : null,
              komentare       : {}
            }
            for (let idZmenyKomentare in zmena.komentare) {
              let zmenaKomentare = zmena.komentare[idZmenyKomentare]
              let zmenaKomentareFormat = {
                komentar            : zmenaKomentare.komentar             ? udaje.zformatujKomentar(zmenaKomentare.komentar)            : null,
                predchozi_komentar  : zmenaKomentare.predchozi_komentar   ? udaje.zformatujKomentar(zmenaKomentare.predchozi_komentar)  : null,
              }
              zmenaFormat.komentare[idZmenyKomentare] = zmenaKomentareFormat
            }
            zmenyFormat[idZmeny] = zmenaFormat
          }
          zmenyZobrazeneFormat[idUkolu] = zmenyFormat
        }
        return zmenyZobrazeneFormat
      },
      /** změny úkolů jsou vraceny v objektu (pořadí vlastností objektu není definováno), proto je nutné ručně převést na setříděné pole
      *  [
      *    {
      *      idUkolu                 : idUkolu1,
      *      idsZmen                 : [idZmeny1, idZmeny2, ...],
      *      idZmeny_idsZmenKomentaru: {
      *        [idZmeny1]            : [idZmenyKomentare1, idZmenyKomentare2, ...],
      *        ...
      *      }
      *    },
      *    ...
      *  ]
      */
      setridenaIdZmenUkolu() {
        let idZmenUkolu = Object.keys(this.ukolyZobrazene ?? {})
          .map(idUkolu => {
            // seřazení klíčů jednotlivých změn úkolu
            let zmenyUkolu = this.zmenyUkolu.zmeny[idUkolu]
            let idsZmen = Object.keys(zmenyUkolu)
              .sort((idZmeny1, idZmeny2) => {
                let zmena1 = zmenyUkolu[idZmeny1]
                let zmena2 = zmenyUkolu[idZmeny2]
                return zmena1.od === zmena2.od ? 0
                  : zmena1.od < zmena2.od ? 1     // novější řadíme dříve
                  : -1
              })
            // seřazení klíčů jednotlivých komentářů ve změnách úkolu
            let idZmeny_idsZmenKomentaru = {}
            idsZmen.forEach(idZmeny => {
              let zmenyKomentare = this.zmenyUkolu?.zmeny?.[idUkolu]?.[idZmeny]?.komentare ?? {}
              let idsZmenKomentare = Object.keys(zmenyKomentare)
                .sort((idZmenyKomentare1, idZmenyKomentare2) => {
                  let zmena1 = zmenyKomentare[idZmenyKomentare1]
                  let zmena2 = zmenyKomentare[idZmenyKomentare2]
                  return zmena1.od === zmena2.od ? 0
                    : zmena1.od < zmena2.od ? 1     // novější řadíme dříve
                    : -1
                })
              idZmeny_idsZmenKomentaru[idZmeny] = idsZmenKomentare
            })
            return { idUkolu, idsZmen, idZmeny_idsZmenKomentaru }
          })
          // seřazení klíčů úkolů
          .sort((zmenyUkolu1, zmenyUkolu2) => {
            // řadíme podle údaje uvedeného v this.razenyUdaj
            if (this.razenyUdaj !== 'od_ukolu') {
              let ukol1 = this.zmenyUkolu.ukoly[zmenyUkolu1.idUkolu]
              let ukol2 = this.zmenyUkolu.ukoly[zmenyUkolu2.idUkolu]
              let ciselneRazeni = udaje.vratCiselneRazeni(this.razenyUdaj)
              let udaj1 = ukol1[this.razenyUdaj]
              let udaj2 = ukol2[this.razenyUdaj]
              if (ciselneRazeni) {
                udaj1 = parseInt(udaj1)
                udaj2 = parseInt(udaj2)
              }

              if (udaj1 !== udaj2) {
                return udaj1 < udaj2 ? -1 : 1        
              }
            }

            // sekundární řazení podle nejnovější změny úkolu (údaj odUkolu)
            const vratOd = (idUkolu, idsZmen) => {
              let idZmeny = idsZmen[0]
              let od = this.zmenyUkolu.zmeny[idUkolu][idZmeny].od
              return od
            }
            let od1 = vratOd(zmenyUkolu1.idUkolu, zmenyUkolu1.idsZmen)
            let od2 = vratOd(zmenyUkolu2.idUkolu, zmenyUkolu2.idsZmen)
            return od1 === od2 ? 0
              : od1 < od2 ? 1
              : -1
          })
        return idZmenUkolu
      },
      pocetZaznamu() {
        return Object.values(this.zmenyUkolu?.zmeny ?? {})
          .reduce((soucet, zmenyUkolu) => soucet + Object.keys(zmenyUkolu).length, 0)
      },
      // { [idUkolu1]: datum_a_cas_posledni_zmeny, ... }
      posledniOdZobrazenychUkolu() {
        let odUkolu = {}
        for (let idUkolu in this.ukolyZobrazene) {
          let setridenaIdZmen = this.setridenaIdZmenUkolu.find(setridenaIdZmen => setridenaIdZmen.idUkolu == idUkolu)
          let idZmenyPosledni = setridenaIdZmen.idsZmen[0]
          let posledniOd = this.zmenyUkolu.zmeny[idUkolu][idZmenyPosledni].od
          odUkolu[idUkolu] = posledniOd
        }
        return odUkolu
      },
      posledniIdUserZobrazenychUkolu() {
        let idUserUkolu = {}
        for (let idUkolu in this.ukolyZobrazene) {
          let setridenaIdZmen = this.setridenaIdZmenUkolu.find(setridenaIdZmen => setridenaIdZmen.idUkolu == idUkolu)
          let idZmenyPosledni = setridenaIdZmen.idsZmen[0]
          let posledniIdUser = this.zmenyUkolu.zmeny[idUkolu][idZmenyPosledni].id_uzivatele
          idUserUkolu[idUkolu] = posledniIdUser
        }
        return idUserUkolu
      }
    },
    methods: {
      vratSetridenaIdZmen(idUkolu) {
        return this.setridenaIdZmenUkolu
          .find(setridenaIdZmen => setridenaIdZmen.idUkolu == idUkolu)
      }
    }
  }
</script>
