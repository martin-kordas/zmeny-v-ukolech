<template>
  <div>
    <h1>Úkoly</h1>
    <div v-if="nacteno">
      <TabulkaUkoluUkoly
        :ciselniky="ciselniky"
        :zmenyUkolu="zmenyUkolu"
        :hledanyVyraz="hledanyVyraz"
        :navigace="navigace"
        :typZobrazeni="typZobrazeni"
        @zmena-hledaneho-vyrazu="onZmenaHledanehoVyrazu"
        @zmena-poctu-zaznamu="onZmenaPoctuZaznamu"
        @prepnuta-aktivita="$emit('prepnuta-aktivita', arguments[0])"
      />
    </div>
    <p class="zadny_zaznam" v-else>Probíhá načítání...</p>
  </div>
</template>

<script>
  // TODO: vždy načítá celou sadu nedokončených úkolů, neřeší relativní aktualizaci (stažení nových a změněných úkolů, odstranění dokončených úkolů)

  import Api from '../services/Api'
  import * as utils from '../services/utils'
  import config from '../services/config'
  import udaje from '../services/udaje'
  import TabulkaUkoluUkoly from './TabulkaUkoluUkoly.vue'

  export default {
    name: 'ZmenyUkolu',
    components: {
      TabulkaUkoluUkoly
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
        zmenyUkolu    : {},
      }
    },
    methods: {
      nactiZmeny() {
        return Api.get("/servis/ukoly/ukoly")
          .then(response => {
            this.zmenyUkolu = response.data
            this.ulozZmenyLocalStorage()
          })
      },
      async nactiZmenyLocalStorage() {
        let whoami = await utils.nactiWhoami()
        if (utils.vratLocalStorage('idUzivateleUkoly') === whoami.id) {
          this.zmenyUkolu = utils.vratLocalStorage('zmenyUkoluUkoly')
        }
      },
      async ulozZmenyLocalStorage() {
        let whoami = await utils.nactiWhoami()
        let data = {
          zmenyUkoluUkoly     : this.zmenyUkolu,
          idUzivateleUkoly    : whoami.id,
        }
        utils.zapisLocalStorage(data)
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
      this.nactiZmenyLocalStorage()
      this.nactiZmeny(), setInterval(() => this.nactiZmeny(), config.intervalAktualizaceUkoly)
      this.nacteno = true
    }
  }
</script>

<style scoped>
  h1 {
    display: none
  }

</style>
