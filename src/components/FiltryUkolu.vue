<template>
  <div class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Filtry a&nbsp;hledání</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Zavřít"></button>
        </div>
        <div v-if="nacteno" class="modal-body">
          <div class="mb-3">
            <label for="popis_ukolu" class="form-label">Zadání úkolu nebo ID (nad)úkolu</label>
            <input v-model="popis_ukolu" type="text" class="form-control" id="popis_ukolu">
          </div>
          <div class="mb-3">
            <label for="idResitele" class="form-label">Řešitel</label>
            <select v-model="id_resitele" id="idResitele" class="form-select">
              <option value="">- Zvolte řešitele -</option>
              <option v-for="([idResitele, prezdivka]) in ciselniky.resiteleSetrideni" :key="idResitele" :value="idResitele">{{ prezdivka }}</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="idProcesnihoKroku" class="form-label">Procesní krok</label>
            <select v-model="id_procesniho_kroku" id="idProcesnihoKroku" class="form-select">
              <option value="">- Zvolte procesní krok -</option>
              <option v-for="([idProcesnihoKroku, nazev]) in ciselniky.procesniKrokyVcetneProcesuSetridene" :key="idProcesnihoKroku" :value="idProcesnihoKroku">{{ nazev }}</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="dokoncene" class="form-label">Dokončené</label>
            <select v-model="dokoncene" id="dokoncene" class="form-select">
              <option value="">- Nedokončené i dokončené úkoly -</option>
              <option v-for="({ nazev }, value) in Filtry.filtry.dokoncene" :key="value" :value="value">{{ nazev }}</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button id="filtry-ukolu-zavrit" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zavřít</button>
          <button type="button" class="btn btn-primary" @click="vyfiltruj">Zobrazit podle kritérií</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import * as utils from '../services/utils'
  import Filtry from '../services/filtry'
  import $ from 'jquery'

  export default {
    name: 'FiltryUkolu',
    props: {
      filtracniPravidla               : { type: Object, default: () => {} },
    },
    data() {
      return {
        popis_ukolu                   : '',
        id_resitele                   : '',
        id_procesniho_kroku           : '',
        dokoncene                     : '',

        ciselniky                     : {},
        nacteno                       : false,
        Filtry                        : Filtry,
      }
    },
    watch: {
      filtracniPravidla: {
        deep: true,   // zajistí, že se handler volá i při změně vlastností objektu
        handler(filtracniPravidla) {
          this.popis_ukolu          = filtracniPravidla.popis_ukolu ?? ''
          this.id_resitele          = filtracniPravidla.id_resitele ?? ''
          this.id_procesniho_kroku  = filtracniPravidla.id_procesniho_kroku ?? ''
          this.dokoncene            = filtracniPravidla.dokoncene ?? ''
        }
      }
    },
    computed: {
      filtracniPravidlaUpravena() {
        return {
          popis_ukolu         : this.popis_ukolu,
          id_resitele         : this.id_resitele,
          id_procesniho_kroku : this.id_procesniho_kroku,
          dokoncene           : this.dokoncene,
        }
      }
    },
    methods: {
      vyfiltruj() {
        this.$emit('zmena-filtru', this.filtracniPravidlaUpravena)
        $('#filtry-ukolu-zavrit').click()
      }
    },
    async created() {
      this.ciselniky = await utils.nactiCiselniky()
      this.nacteno = true
    },
  }
</script>

<style scoped>
  div.offcanvas-bottom {
    height: 50vh;
  }

  table th {
    min-width: 18em;
  }

  .offcanvas-header .btn-pridat-komentar {
    position: relative;
    top: 6px;
  }

</style>
