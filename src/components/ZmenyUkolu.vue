<template>
  <div>
    <h1>Změny v&nbsp;úkolech</h1>
    <div v-if="nacteno">
      <TabulkaUkoluZmenyUkolu
        :ciselniky="ciselniky"
        :zmenyUkolu="zmenyUkolu"
        :hledanyVyraz="hledanyVyraz"
        :navigace="navigace"
        :typZobrazeni="typZobrazeni"
        @precteni-zmeny="prectiZmenu"
        @komentar-pridan="onKomentarPridan"
        @zmena-hledaneho-vyrazu="onZmenaHledanehoVyrazu"
        @zmena-poctu-zaznamu="onZmenaPoctuZaznamu"
        @prepnuta-aktivita="$emit('prepnuta-aktivita', arguments[0])"
      />
    </div>
    <p class="zadny_zaznam" v-else>Probíhá načítání...</p>
  </div>
</template>

<script>
  import Api from '../services/Api'
  import * as utils from '../services/utils'
  import config from '../services/config'
  import udaje from '../services/udaje'
  import TabulkaUkoluZmenyUkolu from './TabulkaUkoluZmenyUkolu'

  export default {
    name: 'ZmenyUkolu',
    components: {
      TabulkaUkoluZmenyUkolu
    },
    props: {
      hledanyVyraz    : { type: String, default: null },
      navigace        : { type: Object, required: true },
      typZobrazeni    : { type: String, default: 'horizontalni' },
    },
    data() {
      return {
        nacteno       : false,
        ciselniky     : {},
        od            : null,
        zmenyUkolu    : {},
        precteneZmeny : [],
      }
    },
    methods: {
      nactiZmeny() {
        let params = {}
        let vsechnyZmeny = this.od === null
        let noveOd = utils.formatDatumACasDb()
        if (!vsechnyZmeny) params.od = this.od
        return Api.get("/servis/ukoly/zmeny", { params })
          .then(response => {
            let zmenyUkolu = response.data
            let nastalyZmeny
            if (vsechnyZmeny) {
              this.zmenyUkolu = zmenyUkolu
              nastalyZmeny = true
            }
            else {
              this.pridejZmeny(zmenyUkolu, vsechnyZmeny)
              nastalyZmeny = Object.keys(zmenyUkolu.zmeny).length > 0
            }
            this.od = noveOd
            nastalyZmeny && this.ulozZmenyLocalStorage()
          })
      },
      pridejZmeny(zmenyUkolu) {
        for (const [idUkolu, zmeny] of Object.entries(zmenyUkolu.zmeny)) {
          if (!(idUkolu in this.zmenyUkolu.zmeny)) this.$set(this.zmenyUkolu.zmeny, idUkolu, {})
          this.$set(this.zmenyUkolu.zmeny, idUkolu, { ...this.zmenyUkolu.zmeny[idUkolu], ...zmeny })
          this.$set(this.zmenyUkolu.ukoly, idUkolu, zmenyUkolu.ukoly[idUkolu])
        }
      },
      prectiZmenu(idUkolu, od) {
        let zmeny = this.zmenyUkolu.zmeny[idUkolu]
        for (let idZmeny in zmeny) {
          let zmena = zmeny[idZmeny]
          if (zmena.od <= od) this.$delete(this.zmenyUkolu.zmeny[idUkolu], idZmeny)
        }
        // pokud zmizely všechny změny úkolu, můžeme smazat i celý úkol
        if (!Object.keys(zmeny).length) {
          this.$delete(this.zmenyUkolu.zmeny, idUkolu)
          this.$delete(this.zmenyUkolu.ukoly, idUkolu)
        }
        this.ulozPrectenouZmenu(idUkolu, od)
      },
      ulozPrectenouZmenu(idUkolu, od) {
        // pokud už úkol v seznamu přečtených změn je, pouze aktualizujeme datum od
        let ulozitNove = true
        for (let i = 0; i < this.precteneZmeny.length; i++) {
          let prectenaZmena = this.precteneZmeny[i]
          if (prectenaZmena.idUkolu == idUkolu) {
            ulozitNove = false
            if (prectenaZmena.od < od) this.precteneZmeny[i].od = od
            break
          }
        }
        if (ulozitNove) this.precteneZmeny.push({
          id_ukolu: idUkolu,
          od      : od,
        })
        // do localStorage ukládáme vše (ne jenPrecteneZmeny), protože přečtením změny se změnily i this.zmenyUkolu (ubyl řádek v tabulce)
        this.ulozZmenyLocalStorage()
        this.ulozPrecteneZmeny()
      },
      ulozPrecteneZmeny() {
        if (this.precteneZmeny.length) {
          return Api.post('/servis/ukoly/zmeny/precteno', { precteno: this.precteneZmeny })
            .then(() => {
              // TODO: toto může přepsat změny, které mezitím přibyly
              this.precteneZmeny = []
              this.ulozZmenyLocalStorage(true)
            })
        }
      },
      async nactiZmenyLocalStorage() {
        let whoami = await utils.nactiWhoami()
        if (utils.vratLocalStorage('idUzivatele') == whoami.id) {
          this.od             = utils.vratLocalStorage('od')
          this.zmenyUkolu     = utils.vratLocalStorage('zmenyUkolu')
          this.precteneZmeny  = utils.vratLocalStorage('precteneZmeny')
        }
      },
      async ulozZmenyLocalStorage(jenPrecteneZmeny) {
        let whoami = await utils.nactiWhoami()
        let data = { precteneZmeny: this.precteneZmeny }
        if (!jenPrecteneZmeny) {
          let data1 = {
            idUzivatele   : whoami.id,
            od            : this.od,
            zmenyUkolu    : this.zmenyUkolu,
          }
          data = { ...data, ...data1 }
        }
        utils.zapisLocalStorage(data)
      },
      async onKomentarPridan(idUkolu, idKomentare, komentar) {
        // uložíme nově přidaný komentář do struktury úkolů, aby byl čitelný v diffu úkolu
        let whoami = await utils.nactiWhoami()
        let komentarData = {
          komentar          : komentar,
          id_uzivatele      : whoami.id,
          datum_a_cas       : utils.formatDatumACasDb(Date.now())
        }
        this.$set(this.zmenyUkolu.ukoly[idUkolu].komentare, idKomentare, komentarData)
      },
      onZmenaHledanehoVyrazu() {
        this.$emit('zmena-hledaneho-vyrazu', ...arguments)
      },
      onZmenaPoctuZaznamu() {
        this.$emit('zmena-poctu-zaznamu', ...arguments)
      }
    },
    async created() {
      this.ciselniky = await utils.nactiCiselniky()
      await udaje.nactenoPromise
      await this.nactiZmenyLocalStorage()
      this.nactiZmeny(), setInterval(() => this.nactiZmeny(), config.intervalAktualizace)
      this.ulozPrecteneZmeny(), setInterval(() => this.ulozPrecteneZmeny(), config.intervalUlozeni)
      this.nacteno = true
    },
  }
</script>

<style scoped>
  h1 {
    display: none
  }

</style>
