<template>
  <div v-if="nacteno" class="zmeny-container">
    <transition-group name="zmeny" tag="div" class="list-group">
      <a
         v-for="idZmeny in setridenaIdZmen.idsZmen"
         :key="idZmeny"
         :class="['list-group-item', 'list-group-item-action', 'zmena', { zvoleny: idZmeny == idZmenyZvolene }]"
         @click="zobrazDiffUkolu(idUkolu, idZmeny)"
         :data-id-ukolu="idUkolu"
        >
        <div class="swipe" :data-id-zmeny="idZmeny">
          <div class="swipe-wrap">
            <div>
              <div class="info">
                <span class="badge bg-secondary">{{ ciselniky.resitele[zmeny[idZmeny].id_uzivatele] || '(neznámý řešitel)' }}</span>
                <span>{{ zmeny[idZmeny].od | formatDatumACasRelativni }}</span>
                <div class="btn-group btn-group-sm" role="group">
                  <button type="button" class="btn btn-secondary bi-eye" title="Označit změnu za přečtenou (Delete)" @click.stop="prectiZmenu(idZmeny)"><span class="d-none">Označit změnu za přečtenou</span></button>
                </div>
              </div>
              <strong>{{ dalsiUdajeZmen[idZmeny].nazev }}</strong>
              <div class="popis">
                <span v-for="([nazevUdaje, hodnota], i) in dalsiUdajeZmen[idZmeny].popis" :key="i">
                  <span v-if="i != 0"> | </span>
                  <strong v-if="dalsiUdajeZmen[idZmeny].popis.length > 1">{{ nazevUdaje }}</strong>
                  {{ hodnota }}
                </span>
              </div>
            </div>
            <div></div><!-- prázdný div kvůli swipe pluginu -->
          </div>
        </div>
      </a>
    </transition-group>
  </div>
</template>

<script>
  import Swipe from 'swipejs'
  import $ from 'jquery'
  import * as utils from '../services/utils'
  import udaje from '../services/udaje'

  let prioritniUdaj = 'id_resitele'

  export default {
    name: 'TabulkaZmenUkolu',
    props: {
      idUkolu         : { type: [Number, String], required: true },
      zmeny           : { type: Object, required: true },
      zmenyFormat     : { type: Object, required: true },
      setridenaIdZmen : { type: Object, required: true },
      idZmenyZvolene  : { type: [Number, String], default: null },
    },
    data() {
      return {
        nacteno       : false,
        ciselniky     : {},
      }
    },
    computed: {
      dalsiUdajeZmen() {
        let dalsiUdajeZmen = {}
        for (let idZmeny in this.zmeny) {
          let zmena = this.zmeny[idZmeny]
          let zmenaFormat = this.zmenyFormat[idZmeny]
          let nazvyUdajuZmeny = this.vratNazvyUdajuZmeny(zmena)
          let nazev
            = utils.jeZmenaNovyUkol(zmena) ? 'Nový úkol'                                    // nový úkol
            : nazvyUdajuZmeny.length ? `Změna úkolu \u2013 ${nazvyUdajuZmeny.join(', ')}`   // změna 1 údaje
            : 'Žádné změny'                                                                 // nemělo by nastat
          let popis
            // nový úkol: v popisu bude zadání úkolu
            = utils.jeZmenaNovyUkol(zmena) ? [[udaje.vratNazevUdaje('popis_ukolu'), zmenaFormat.ukol.popis_ukolu]]
            // změněný úkol: v popisu budou hodnoty změněných údajů
            : this.vratPopisZmeny(zmenaFormat, idZmeny)
          dalsiUdajeZmen[idZmeny] = { nazev, popis }
        }
        return dalsiUdajeZmen
      }
    },
    watch: {
      ['setridenaIdZmen.idsZmen']() {
        this.$nextTick(() => this.initSwipe())
      }
    },
    methods: {
      vratNazvyUdajuZmeny(zmena) {
        let nazvy = Object.keys(zmena?.ukol ?? {})
          .filter(udaj => udaje.udajeProDiffTabulku.includes(udaj))
          .map(udaj => udaje.vratNazevUdaje(udaj, true))
        if (Object.keys(zmena.komentare).length) nazvy.push(udaje.vratNazevUdaje('komentar', true))
        // změna řešitele je zásadní změna, proto ji řadíme jako první
        nazvy.sort((udaj1, udaj2) => {
          if (udaj1 === prioritniUdaj && udaj2 === prioritniUdaj) return 0
          else return udaj1 === prioritniUdaj ? -1 : 1
        })
        return nazvy
      },
      /**
       * [
       *  [udaj1, hodnota1],
       *  ...
       * ]
       */
      vratUdajeZmeny(zmena, idZmeny) {
        let udajeZmeny = Object.entries(zmena?.ukol ?? {}).filter(udajZmeny => {
          let [udaj] = udajZmeny
          return udaje.udajeProDiffTabulku.includes(udaj)
        })
        let idsZmenKomentaru = this.setridenaIdZmen.idZmeny_idsZmenKomentaru[idZmeny]
        if (idsZmenKomentaru.length) {
          let idZmenyKomentare = idsZmenKomentaru[0]    // komentářů může být více, ale zvolíme ten nejnovější
          let komentar = this.zmeny[idZmeny].komentare[idZmenyKomentare]?.komentar?.komentar ?? null
          if (komentar) udajeZmeny.push(['komentar', komentar])
        }
        udajeZmeny.sort((udaj1, udaj2) => {
          if (udaj1[0] === prioritniUdaj && udaj2[0] === prioritniUdaj) return 0
          else return udaj1[0] === prioritniUdaj ? -1 : 1
        })
        return udajeZmeny
      },
      vratPopisZmeny(zmena, idZmeny) {
        let udajeZmeny = this.vratUdajeZmeny(zmena, idZmeny)
        return udajeZmeny
          .map(udajZmeny => {
            let [udaj, hodnota] = udajZmeny
            return [udaje.vratNazevUdaje(udaj, true), hodnota]
          })
      },
      prectiZmenu(idZmeny) {
        if (this.zmeny[idZmeny]?.od) {
          let od = this.zmeny[idZmeny].od
          this.$emit('precteni-zmeny', this.idUkolu, od)
        }
      },
      initSwipe() {
        this.$nextTick(() => {
          let selector = `.list-group-item.zmena[data-id-ukolu=${this.idUkolu}] .swipe`
          $(selector).each((_i, el) => {
            let idZmeny = $(el).data('id-zmeny')
            new Swipe(el, {
              draggable: true,
              callback: () => this.prectiZmenu(idZmeny)
            })
          })
        })
      },
      zobrazDiffUkolu(idUkolu, idZmeny) {
        // pokud už změna neexistuje, byla metoda vyvolána událostí click při drag&drop (swipe), který potvrdil přečtení a změnu odstranil 
        if (idZmeny in this.zmeny) {
          this.$emit('zobrazeni-diffu-ukolu', idUkolu, idZmeny)
        }
      }
    },
    async created() {
      this.ciselniky = await utils.nactiCiselniky()
      await udaje.nactenoPromise
      this.nacteno = true
    }
  }
</script>

<style scoped lang="scss">
  @import "/node_modules/bootstrap/scss/functions";
  @import "/node_modules/bootstrap/scss/variables";

  .swipe {
    overflow: hidden;
    visibility: hidden;
    position: relative;
  }

  .swipe-wrap {
    overflow: hidden;
    position: relative;
  }

  .swipe-wrap > div {
    float: left;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  /* stylování swipe pluginu uvnitř tabulky působí značné potíže (např. swipe vytvoří velmi široký div a roztahuje sloupec tabulky) */
  /*  - HACK: následující styly řeší tuto situaci */
  .swipe-wrap > div:not([data-index="0"]) {
    display: none;
  }
  .swipe-wrap, .list-group-item {
    width: auto !important;
  }

  .zmeny-item {
    display: inline-block;
    margin-right: 10px;
  }
  .zmeny-enter-active, .zmeny-leave-active {
    transition: all 1s;
  }
  .zmeny-enter, .zmeny-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }

  a.zmena {
    cursor: pointer;
  }

  div.info > * {
    float: right;
    margin-left: 3em;
  }

  .list-group {
    font-size: 0.85em;
    width: 100%;
    padding-top: .5rem;
    padding-bottom: .5rem;
  }

  .list-group-item {
    background-color: $light;
    &:hover {
      background-color: var(--bs-table-hover-bg);
    }
    &.zvoleny {
      background-color: #e1e6ea;
    }
  }

  div.popis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

</style>
