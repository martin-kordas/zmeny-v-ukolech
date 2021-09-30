<template>
  <div :class="diffUkoluClass" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1">
    <div class="offcanvas-header">
      <h5 v-if="zobrazitNadpis" class="offcanvas-title" id="offcanvasBottomLabel">{{ nadpis }}</h5>
      <div>
        <button v-if="existujeUkol" type="button" class="btn btn-primary btn-pridat-komentar" data-bs-toggle="modal" data-bs-target="#modalKomentar" @click="pridejKomentar">Přidat komentář</button>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Zavřít"></button>
      </div>
    </div>
    <div :class="['offcanvas-body', { ['novy-ukol']: jeNovyUkol }]">
      <table class="table table-bordered table-sm tabulka-diff" v-if="zobrazitTabulku">
        <tr v-for="(udaj, i) in udajeProDiffTabulkuZobrazene" :key="i">
          <th>{{ nazvyUdaju[udaj] }}</th>
          <td v-if="udaj == 'komentar'" :class="['hodnota', udaj]">
            <div v-for="({ id_uzivatele, datum_a_cas, komentar }, idKomentare) in diffUkol.komentare" :key="idKomentare">
              <span :class="komentareIdUzivateleClass[idKomentare]">{{ ciselniky.resitele[id_uzivatele] }}</span>
              <span class="badge bg-secondary mx-1">{{ datum_a_cas | formatDatumACas }}</span>
              <span v-html="komentar"></span>
            </div>
          </td>
          <td v-else :class="['hodnota', udaj]" v-html="diffUkol[udaj]"></td>
        </tr>
      </table>
      <p v-else>Zvolte úkol, jehož údaje chcete zobrazit.</p>
    </div>
  </div>
</template>

<script>
  import * as Diff from 'diff'
  import $ from 'jquery'
  import * as utils from '../services/utils'
  import udaje from '../services/udaje'

  /**
   *  - tabulka s diffem obsahující údaje změněné ve všech předaných změnách (zmenyFormat)
   *  - je-li předán i úkol (ukolFormat), převezme údaje chybějící ve změnách z tohoto úkolu (tak, aby tabulka obsahovala všechny údaje úkolu, i ty nezměněné)
   */
  export default {
    name: 'DiffUkolu',
    props: {
      idUkolu           : { type: [Number, String], default: null },
      zmeny             : { type: Object, default: () => {} },
      zmenyFormat       : { type: Object, default: () => {} },
      setridenaIdZmen   : { type: Object, default: () => {} },
      ukol              : { type: Object, default: null },
      ukolFormat        : { type: Object, default: null },
      pouzitUdajeUkolu  : { type: Boolean, default: false },
      typZobrazeni      : { type: String, default: 'horizontalni' },
    },
    data() {
      return {
        udajeProDiffTabulku   : udaje.udajeProDiffTabulku,
        nazvyUdaju            : udaje.vratNazvyUdaju(),
        ciselniky             : {},
        nacteno               : false,
        idAktualnihoUzivatele : null,
      }
    },
    computed: {
      zobrazitTabulku() {
        return this.nacteno && (this.existujiZmeny || this.existujeUkol)
      },
      zobrazitNadpis() {
        return this.zobrazitTabulku
      },
      existujeUkol() {
        return this.ukolFormat && this.pouzitUdajeUkolu
      },
      existujiZmeny() {
        return Object.keys(this.zmenyFormat ?? {}).length > 0
      },
      jeNovyUkol() {
        let jeNovyUkol = false
        if (this.setridenaIdZmen) {
          let idZmenyPrvni = this.setridenaIdZmen.idsZmen.slice().reverse()[0]
          if (utils.jeZmenaNovyUkol(this.zmeny[idZmenyPrvni])) jeNovyUkol = true
        }
        return jeNovyUkol
      },
      nadpis() {
        let nadpis
        if (!this.existujiZmeny) nadpis = 'Úkol'
        else {
          if (this.jeNovyUkol) nadpis = 'Nový úkol'
          else nadpis = 'Změny úkolu'
        }
        nadpis += ` č. ${this.idUkolu}`
        return nadpis
      },
      komentareIdUzivateleClass() {
        let obj = {}
        for (let idKomentare in this.ukol.komentare) {
          let { id_uzivatele } = this.ukol.komentare[idKomentare]
          let bgTypClass = id_uzivatele == this.idAktualnihoUzivatele ? 'bg-primary' : 'bg-secondary'
          obj[idKomentare] = ['badge', bgTypClass]
        }
        return obj
      },
      /** porovnávané 2 porovnávané verze úkolu */
      diffUkoly() {
        let setridenaIdZmen = this.setridenaIdZmen ? this.setridenaIdZmen.idsZmen.slice().reverse() : []
        let diff1 = {}, diff2 = {}
        diff1.komentare = {}, diff2.komentare = {}

        for (let idZmeny of setridenaIdZmen) {
          let zmena = this.zmenyFormat[idZmeny]
          let zmenaRaw = this.zmeny[idZmeny]
          let predchoziUkol = zmena.predchozi_ukol
          let ukol = zmena.ukol
          for (let udaj in ukol) {
            if (!(udaj in diff1)) diff1[udaj] = predchoziUkol?.[udaj] ?? false
            diff2[udaj] = ukol[udaj]
          }
          for (let idZmenyKomentare in zmena.komentare) {
            let zmenaKomentare = zmena.komentare[idZmenyKomentare]
            let zmenaKomentareRaw = zmenaRaw.komentare[idZmenyKomentare]
            let idKomentare = zmenaKomentareRaw.id_komentare
            if (!(idKomentare in diff1.komentare)) diff1.komentare[idKomentare] = zmenaKomentare.predchozi_komentar?.komentar ?? false
            diff2.komentare[idKomentare] = zmenaKomentare.komentar.komentar
          }
        }
        if (this.existujeUkol) {
          for (let udaj in this.ukolFormat) {
            if (udaj === 'komentare') {
              for (let idKomentare in this.ukolFormat.komentare) {
                if (!(idKomentare in diff2.komentare)) {
                  let komentar = this.ukolFormat.komentare[idKomentare]
                  diff1.komentare[idKomentare] = diff2.komentare[idKomentare] = komentar.komentar
                }
              }
            }
            else {
              if (!(udaj in diff2)) diff1[udaj] = diff2[udaj] = this.ukolFormat[udaj]
            }
          }
        }
        return { diff1, diff2 }
      },
      /** 
       *  vrací strukturu úkolu, kde pod každým údajem je již uložen string s HTML diffem
       *    - HTML escapování údajů provádí automaticky this.vratHtmlDiff, kterým prochází všechny údaje,
       *      tedy není nebezpečné vypisovat diff úkolu jako v-html
       */
      diffUkol() {
        let diff = {}
        let { diff1, diff2 } = this.diffUkoly
        for (let udaj in diff1) {
          let diffTyp = udaje.vratDiffTypUdaje(udaj)
          if (udaj === 'komentare') {
            diff.komentare = {}
            for (let idKomentare in diff1.komentare) {
              let komentar = this.ukol.komentare[idKomentare]
              let komentar1 = diff1.komentare[idKomentare]
              let komentar2 = diff2.komentare[idKomentare]
              let diffKomentar = { ...komentar }
              diffKomentar.komentar = this.vratHtmlDiff(komentar1, komentar2, diffTyp)
              diff.komentare[idKomentare] = diffKomentar
            }
            if (Object.keys(diff.komentare).length) {
              // vlastnost, kde jsou komentář nestrukturovaně zřetězeny
              diff.komentar = Object.values(diff.komentare).join('\n')
            }
          }
          else {
            diff[udaj] = this.vratHtmlDiff(diff1[udaj], diff2[udaj], diffTyp)
          }
        }
        return diff
      },
      diffUkoluClass() {
        let poleClass = ['diff-ukolu-container']
        if (this.typZobrazeni == 'vertikalni') {
          poleClass.push('col')
        }
        else poleClass.push('offcanvas', 'offcanvas-bottom')
        return poleClass
      },
      udajeProDiffTabulkuZobrazene() {
        return this.udajeProDiffTabulku.filter(udaj => udaj in this.diffUkol)
      }
    },
    watch: {
      zobrazitTabulku(val) {
        if (val) {
          if (!Object.keys(this.zmenyFormat ?? {}) && !this.existujeUkol) {
            throw new Error('Musí být předány změny nebo úkol.')
          }
        } 
      }
    },
    methods: {
      vratHtmlDiff(str1, str2, diffTyp = 'character') {
        let diffFunc
        switch (diffTyp) {
          case 'character': diffFunc = Diff.diffChars; break
          case 'word': diffFunc = Diff.diffWords; break
          case 'line': diffFunc = Diff.diffLines; break
          default: throw new Error()
        }
        // ošetření případu, kdy jsou hodnoty null/false
        if (typeof str1 !== 'string') str1 = ''
        if (typeof str2 !== 'string') str2 = ''
        let diff = diffFunc(str1, str2)
        //let diff = diffFunc('yy', 'yx')
        let container = $('<span></span>')
        diff.forEach((part) => {
          let elem = $('<span></span>').text(part.value)
          if (part.added || part.removed) {
            elem = elem.wrapInner('<strong class="zmeny-pridano"></strong>')
            if (part.removed) elem = elem.wrapInner('<strike class="zmeny-smazano"></strike>')
          }
          container.append(elem[0])
        });
        return container.html()
      },
      pridejKomentar() {
        this.$emit('pridani-komentare', this.idUkolu)
      }
    },
    async created() {
      this.ciselniky = await utils.nactiCiselniky()
      this.idAktualnihoUzivatele = (await utils.nactiWhoami()).id
      this.nacteno = true
    },
  }
</script>

<style>
  table.tabulka-diff .zmeny-pridano {
    background-color: yellow;
  }
  table.tabulka-diff .zmeny-smazano .zmeny-pridano {
    background-color: #ffcccc;
  }
</style>

<style scoped lang="scss">
  div.offcanvas-bottom {
    height: auto;
    min-height: 20vh;
    max-height: 40vh;
  }

  div.offcanvas-end {
    width: 40vw;
  }

  table tr, table td {
    vertical-align: top;
  }

  .offcanvas-body.novy-ukol td {
    background: yellow;
  }

  table td.hodnota {
    &.poznamky, &.duvod_pro_termin_splneni, &.komentar, &.odkaz { white-space: pre-line; }
  }

  table.tabulka-diff {
    table-layout: fixed;
  }

  table.tabulka-diff th {
    white-space: nowrap;
    padding-right: 0.75em;
    font-weight: bolder;
    font-style: italic;
    /* nefunguje dobře s žádnými jednotkami - vh, em, rem, px - vždy se chová jinak u úkolu s malým a velkým množstvím údajů */
    /*max-width: 250px;*/
    width: 15em;
  }

  .offcanvas-header .btn-pridat-komentar {
    position: relative;
    top: 3px;
    right: 4px;
  }

  @import "/node_modules/bootstrap/scss/functions";
  @import "/node_modules/bootstrap/scss/variables";

  .diff-ukolu-container {
    position: sticky;
    top: 3.5rem;
    overflow: auto;
    resize: vertical;
    &.offcanvas {
      box-shadow: 0 5px 46px #888;
      background-color: $light;
      height: 40vh;
      max-height: 75vh;
    }
    &:not(.offcanvas) {
      height: calc(100vh - 3.5rem);
      overflow-y: scroll;
      .btn-close {
        display: none;
      }
      .offcanvas-body {
        overflow: visible;
      }
    }
  }

</style>
