<template>
  <div :class="containerClass">
    <div :class="rowClass">
      <div :class="colClass">
        <table v-if="zobrazitTabulkuUkolu" class="table table-hover table-sm tabulka-ukolu">
          <thead>
            <tr>
              <th :class="thClass.id_ukolu"><a href="#" @click.prevent="raditPodle('id_ukolu')">ID</a></th>
              <th :class="thClass.id_priority" title="Priorita"><a href="#" @click.prevent="raditPodle('id_priority')">P</a></th>
              <th :class="thClass.termin_splneni"><a href="#" @click.prevent="raditPodle('termin_splneni')">Termín splnění</a></th>
              <th :class="thClass.popis_ukolu"><a href="#" @click.prevent="raditPodle('popis_ukolu')">Zadání úkolu</a></th>
              <th>&nbsp;</th>
              <th :class="thClass.id_resitele" v-if="!jenUkoly"><a href="#" @click.prevent="raditPodle('id_resitele')">Řešitel</a></th>
              <th :class="thClass.stav"><a href="#" @click.prevent="raditPodle('stav')">Stav</a></th>
              <th :class="thClass.odhadovane_hodiny" title="Odhadované hodiny"><a href="#" @click.prevent="raditPodle('odhadovane_hodiny')">Odh.</a></th>
              <th :class="thClass.datum_ukonceni" v-if="!jenUkoly"><a href="#" @click.prevent="raditPodle('datum_ukonceni')">Datum ukončení</a></th>
              <th :class="thClass.od_ukolu" v-if="!jenUkoly"><a href="#" @click.prevent="raditPodle('od_ukolu')">Čas notifikace</a></th>
              <th :class="thClass.id_user_ukolu" v-if="!jenUkoly">Od</th>
              <th v-if="!jenUkoly">&nbsp;</th>
            </tr>
          </thead>
            <transition-group name="ukoly" tag="tbody">
              <template v-for="({ idUkolu }) in setridenaIdZmenUkolu">
                <tr :key="`${idUkolu}-ukol`" :class="trUkoluClass[idUkolu]" @click="zobrazDiffUkolu(idUkolu)">
                  <td class="text-end">{{ idUkolu }}</td>
                  <td>{{ ukolyZobrazeneFormat[idUkolu].id_priority.substr(0, 1) }}</td>
                  <td class="text-end termin_splneni">{{ ukolyZobrazeneFormat[idUkolu].termin_splneni }}</td>
                  <td class="popis_ukolu">
                    <span v-if="ukolyZobrazene[idUkolu].id_nadukolu">
                      <a href="#" @click.stop="otevriUkol(ukolyZobrazene[idUkolu].id_nadukolu)" title="Zobrazit nadúkol v iZUŠ">(↑{{ ukolyZobrazene[idUkolu].id_nadukolu }})</a>
                    </span>
                    {{ ukolyZobrazeneFormat[idUkolu].popis_ukolu }}
                    <span class="procesni-krok" v-if="ukolyZobrazene[idUkolu].id_procesniho_kroku">
                      {{ '\u2014' }} {{ciselniky.procesni_kroky[ukolyZobrazene[idUkolu].id_procesniho_kroku] || '(neznámý procesní krok)' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button type="button" class="btn btn-secondary bi-eye" title="Označit všechny změny úkolu za přečtené (Delete)" v-if="!jenUkoly" @click.stop="prectiZmenu(idUkolu, posledniOdZobrazenychUkolu[idUkolu])"><span class="d-none">Označit všechny změny úkolu za přečtené</span></button>
                      <button type="button" class="btn btn-secondary bi-folder2-open" :id="`otevri-ukol-${idUkolu}`" title="Zobrazit úkol v iZUŠ (Enter)" @click.stop="otevriUkol(idUkolu)"><span class="d-none">Zobrazit úkol v iZUŠ</span></button>
                      <button type="button" class="btn btn-secondary" title="Přepnout na aktivitu" @click.stop="prepniAktivitu(ukolyZobrazene[idUkolu])"><span>A</span></button>
                      <div class="btn-group btn-group-sm" role="group">
                        <button
                          :id="`ukolDalsiAkce-${idUkolu}`" type="button" data-bs-toggle="dropdown" aria-expanded="false"
                          class="btn btn-secondary dropdown-toggle dropdown-toggle-split" @click.stop
                        >
                          <span class="visually-hidden">Další</span>
                        </button>
                        <ul class="dropdown-menu" :aria-labelledby="`ukolDalsiAkce-${idUkolu}`">
                          <li><a class="dropdown-item" href="#" @click.stop.prevent="zkopirujOdkazNaUkol(idUkolu)"><span class="bi bi-link-45deg"></span> Zkopírovat odkaz na úkol</a></li>
                          <li><a class="dropdown-item" href="#" @click.stop.prevent="zkopirujText(idUkolu)"><span class="bi bi-link-45deg invisible"></span> Zkopírovat ID úkolu</a></li>
                          <li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#modalKomentar" @click.stop="pridejKomentar(idUkolu)"><span class="bi bi-chat-text"></span> Přidat komentář</a></li>
                          <li v-if="!dalsiUdajeUkolu[idUkolu].dokonceny"><a class="dropdown-item" href="#" @click.stop.prevent="otevriUkol(idUkolu, true)"><span class="bi bi-link-45deg invisible"></span> Nastavit úkol jako dokončený</a></li>
                        </ul>
                      </div>
                    </div>
                  </td>
                  <td class="text-center" v-if="!jenUkoly">
                    <span :class="['badge', ukolyZobrazene[idUkolu].id_resitele == idAktualnihoUzivatele ? 'bg-primary' : 'bg-secondary']">
                      {{ ukolyZobrazeneFormat[idUkolu].id_resitele }}
                    </span>
                  </td>
                  <td class="text-end">{{ ukolyZobrazeneFormat[idUkolu].stav }}</td>
                  <td class="text-end">{{ ukolyZobrazeneFormat[idUkolu].odhadovane_hodiny }}</td>
                  <td class="text-end datum_ukonceni" v-if="!jenUkoly">{{ ukolyZobrazeneFormat[idUkolu].datum_ukonceni }}</td>
                  <td class="text-end od_ukolu" v-if="!jenUkoly">{{ posledniOdZobrazenychUkolu[idUkolu] | formatDatumACasRelativni }}</td>
                  <td class="text-center id_user_ukolu" v-if="!jenUkoly">
                    <span class="badge bg-secondary">{{ ciselniky.resitele[posledniIdUserZobrazenychUkolu[idUkolu]] || '(neznámý)' }}</span>
                  </td>
                  <td v-if="!jenUkoly">
                    <button
                      data-bs-toggle="collapse"
                      class="btn btn-secondary bi bi-chevron-double-down"
                      title="Zobrazit/skrýt změny úkolu (šipka vpravo)"
                      @click.stop="zobrazSkryjZmenyUkolu(idUkolu)"
                    >
                      <span class="d-none">Zobrazit změny</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="!jenUkoly" :key="`${idUkolu}-zmeny`" :class="['zmeny', { zvoleny: diffUkoluParametry.idUkolu == idUkolu }]">
                  <td :colspan="pocetSloupcu" class="tabulka-zmen-ukolu-td">
                    <TabulkaZmenUkolu
                      :zmeny="zmenyZobrazene[idUkolu]"
                      :zmenyFormat="zmenyZobrazeneFormat[idUkolu]"
                      :setridenaIdZmen="vratSetridenaIdZmen(idUkolu)"
                      :idZmenyZvolene="diffUkoluParametry.idZmeny"
                      :ref="`tabulkaZmenUkolu${idUkolu}`"
                      :class="['collapse', 'zmeny-tr', { show: zobrazitZmeny[idUkolu] }]"
                      :id="`ukol${idUkolu}-zmeny`"
                      :idUkolu="idUkolu"
                      :style="{ display: zobrazitZmenyVychozi ? 'block' : 'none' }"
                      @precteni-zmeny="prectiZmenu"
                      @zobrazeni-diffu-ukolu="zobrazDiffUkolu"
                    />
                  </td>
                </tr>
              </template>
            </transition-group>
        </table>
        <p v-else class="zadny_zaznam">
          {{ zpravaZadnyZaznam }}
        </p>
        <FiltryUkolu
          :id="filtryUkoluId"
          :filtracniPravidla="filtracniPravidla"
          @zmena-filtru="onZmenaFiltru"
        />
        <Komentar
          id="modalKomentar"
          :idUkolu="idUkoluKomentar"
          @komentar-pridan="onKomentarPridan"
        />
      </div>
      <DiffUkolu
        :id="diffUkoluId"
        :idUkolu="diffUkoluParametry.idUkolu"
        :zmeny="diffUkoluParametry.zmeny"
        :zmenyFormat="diffUkoluParametry.zmenyFormat"
        :setridenaIdZmen="diffUkoluParametry.setridenaIdZmen"
        :ukol="diffUkoluParametry.ukol"
        :ukolFormat="diffUkoluParametry.ukolFormat"
        :pouzitUdajeUkolu="diffUkoluParametry.pouzitUdajeUkolu"
        :typZobrazeni="typZobrazeni"
        @pridani-komentare="pridejKomentar"
      />
    </div>
  </div>
</template>

<script>
  /* eslint-disable */
  import $ from 'jquery'
  import moment from 'moment'
  import { Offcanvas, Dropdown } from 'bootstrap'
  import udaje from '../services/udaje'
  import * as utils from '../services/utils'
  import Filtry from '../services/filtry'
  import TabulkaZmenUkolu from './TabulkaZmenUkolu.vue'
  import DiffUkolu from './DiffUkolu.vue'
  import FiltryUkolu from './FiltryUkolu.vue'
  import Komentar from './Komentar.vue'
  
  export default {
    name: 'TabulkaUkolu',
    components: {
      TabulkaZmenUkolu,
      DiffUkolu,
      FiltryUkolu,
      Komentar,
    },
    props: {
      ciselniky       : { type: Object, default: () => {} },
      zmenyUkolu      : { type: Object, default: () => {} },
      hledanyVyraz    : { type: String, default: null },
      navigace        : { type: Object, required: true },
      typZobrazeni    : { type: String, default: 'horizontalni' },
    },
    data() {
      return {
        zobrazitZmeny         : {},
        zobrazitZmenyVychozi  : false,
        diffUkoluParametry    : {},
        idUkoluKomentar       : undefined,
        filtracniPravidla     : {},
        idAktualnihoUzivatele : null,
      }
    },
    offcanvas: null,
    offcanvasElem: null,
    watch: {
      // nově přidané úkoly budou mít změny nezobrazeny
      zmenyUkolu(zmenyUkolu) {
        let idsUkolu = Object.keys(zmenyUkolu.zmeny ?? {})
        idsUkolu.forEach(idUkolu => {
          if (!(idUkolu in this.zobrazitZmeny)) {
            this.$set(this.zobrazitZmeny, idUkolu, this.zobrazitZmenyVychozi)
          }
        })
      },
      hledanyVyraz(hledanyVyraz) {
        this.$set(this.filtracniPravidla, 'popis_ukolu', hledanyVyraz)
      },
      pocetZaznamu: {
        immediate: true,
        handler(pocetZaznamu) {
          this.$emit('zmena-poctu-zaznamu', pocetZaznamu)
        }
      },
      typZobrazeni(typZobrazeni) {
        if (typZobrazeni == 'horizontalni') {
          this.zavedOffcanvas()
          // ve vertikálním zobrazení je kontejner tabulky resizable
          // změnou velikosti se nastavuje styl width, který by v horizontálním zobrazení působil problémy, proto jej odstraníme
          $('.tabulka-col-container').css('width', '')
        }
      },
      ['navigace.predchozi']() {
        this.naviguj(-1)
      },
      ['navigace.dalsi']() {
        this.naviguj(1)
      },
      ['navigace.prectiZmenu']() {
        if (!this.jenUkoly) {
          let idUkolu = this.diffUkoluParametry.idUkolu
          if (idUkolu) {
            let idZmeny = this.diffUkoluParametry.idZmeny
            let od, krok
            // a) jsme na změně
            if (idZmeny) {
              od = this.zmenyUkolu.zmeny[idUkolu][idZmeny].od
              let setridenaIdZmen = this.setridenaIdZmenUkolu.find(setridenaIdZmen => setridenaIdZmen.idUkolu == idUkolu)
              let iZmeny = setridenaIdZmen.idsZmen.findIndex(idZmeny1 => idZmeny1 == idZmeny)
              // jsme na první změně: přečtením změny jsou přečteny všechny změny úkolu, přejdeme proto na další úkol
              if (iZmeny == 0) krok = setridenaIdZmen.idsZmen.length - iZmeny
              // jsme na ne-první změně: přejdeme na předchozí změnu
              else krok = -1
            }
            // b) jsme na úkolu: po přečtení změn přejdeme na další úkol
            else {
              od = this.posledniOdZobrazenychUkolu[idUkolu]
              if (this.zobrazitZmeny[idUkolu] ?? this.zobrazitZmenyVychozi) krok = Object.keys(this.zmenyUkolu.zmeny[idUkolu]).length + 1
              else krok = 1
            }
            this.naviguj(krok)
            this.prectiZmenu(idUkolu, od)
          }
        }
      },
      ['navigace.zobrazSkryjZmenyUkolu']() {
        if (!this.jenUkoly) {
          let idUkolu = this.diffUkoluParametry.idUkolu
          if (idUkolu) this.zobrazSkryjZmenyUkolu(idUkolu)
        }
      },
    },
    computed: {
      zobrazitTabulkuUkolu() {
        return this.setridenaIdZmenUkolu.length > 0
      },
      ukolyZobrazene() {
        let ukolyZobrazene
        if (Object.keys(this.filtracniPravidla).length) {
          ukolyZobrazene = {}
          for (let idUkolu in this.zmenyUkolu.ukoly) {
            let ukol = this.zmenyUkolu.ukoly[idUkolu]
            let ukolVyhovuje = true
            for (let udaj in this.filtracniPravidla) {
              let hodnotaFiltru = this.filtracniPravidla[udaj]
              if (hodnotaFiltru) {
                const filtrCb = Filtry.filtry?.[udaj]?.[hodnotaFiltru]?.filtrCb ?? udaje.vratFiltrCb(udaj, hodnotaFiltru)
                if (!filtrCb(ukol)) {
                  ukolVyhovuje = false
                  break
                }
              }
            }
            if (ukolVyhovuje) ukolyZobrazene[idUkolu] = ukol
          }
        }
        else ukolyZobrazene = this.zmenyUkolu.ukoly
        return ukolyZobrazene
      },
      ukolyZobrazeneFormat() {
        let ukolyFormat = {}
        for (let idUkolu in this.ukolyZobrazene) {
          let ukol = this.ukolyZobrazene[idUkolu]
          let ukolFormat = udaje.zformatujUkol(ukol)
          for (let idKomentare in ukol.komentare) {
            let komentarFormat = udaje.zformatujKomentar(ukol.komentare[idKomentare])
            ukolFormat.komentare[idKomentare] = komentarFormat
          }
          ukolyFormat[idUkolu] = ukolFormat
        }
        return ukolyFormat
      },
      pocetSloupcu() {
        return this.jenUkoly ? 7 : 11;
      },
      dalsiUdajeUkolu() {
        let dalsiUdajeUkolu = {}
        for (let idUkolu in this.zmenyUkolu.ukoly) {
          let ukol            = this.zmenyUkolu.ukoly[idUkolu]
          let dnes            = moment(Date.now()).startOf('day').toDate()
          let poTerminu       = moment(ukol.termin_splneni).toDate() < dnes
          let dokonceny       = !!ukol.datum_ukonceni
          let vysokaPriorita  = ["1", "2"].includes(ukol.id_priority)
          let zvoleny         = this.diffUkoluParametry.idUkolu == idUkolu && !this.diffUkoluParametry.idZmeny
          dalsiUdajeUkolu[idUkolu] = { poTerminu, dokonceny, vysokaPriorita, zvoleny }
        }
        return dalsiUdajeUkolu
      },
      thClass() {
        let obj = {
          id_ukolu          : ['text-end'],
          id_priority       : [],
          termin_splneni    : ['text-end'],
          popis_ukolu       : [],
          id_resitele       : ['text-center'],
          stav              : ['text-end'],
          odhadovane_hodiny : ['text-end'],
          datum_ukonceni    : ['text-end'],
          od_ukolu          : ['text-end'],
          id_user_ukolu     : ['text-center'],
        }
        if (this.razenyUdaj) obj[this.razenyUdaj].push('razeny-udaj')
        return obj
      },
      trUkoluClass() {
        let trUkoluClass = {}
        for (let idUkolu in this.zmenyUkolu.ukoly) {
          let udaje = this.dalsiUdajeUkolu[idUkolu]
          let poleClass = ['ukol']
          if (this.zobrazitZmeny[idUkolu]) poleClass.push('zobrazeny-zmeny')
          if (udaje.dokonceny) poleClass.push('dokonceny')
          if (udaje.poTerminu) poleClass.push('po-terminu')
          if (udaje.vysokaPriorita) poleClass.push('vysoka-priorita')
          if (udaje.zvoleny) poleClass.push('zvoleny')
          trUkoluClass[idUkolu] = poleClass
        }
        return trUkoluClass
      },
      containerClass() {
        let poleClass = ['kontejner', this.typZobrazeni]
        if (this.typZobrazeni == 'vertikalni') {
          poleClass.push('tabulka-container', 'container-fluid')
        }
        return poleClass
      },
      rowClass() {
        let poleClass = []
        if (this.typZobrazeni == 'vertikalni') {
          poleClass.push('row')
        }
        return poleClass
      },
      colClass() {
        let poleClass = ['tabulka-col-container']
        if (this.typZobrazeni == 'vertikalni') {
          poleClass.push('col-7', 'tabulka-col')
        }
        return poleClass
      },
      diffUkoluId() {
        return `diff-ukolu-${this.$route.name}`
      },
      filtryUkoluId() {
        return `filtry-ukolu-${this.$route.name}`
      }
    },
    methods: {
      // metoda je navázána na click, Bootstrap události shown.bs.collapse aj. se nepodařilo zprovoznit ani ruční registrací přes DOM/jQuery
      zobrazSkryjZmenyUkolu(idUkolu) {
        let zobrazit = !this.zobrazitZmeny[idUkolu]
        this.$set(this.zobrazitZmeny, idUkolu, zobrazit)
        // řeším přes jQuery, protože u Bootstrap Collapse nefungovalo skrytí po importu z npm modulu 'bootstrap'
        let slidOpts = {
          complete: () => {
            // byl-li swipe plugin inicializován jako skrytý, nefunguje, po rozkrytí jej tedy inicializujeme znovu
            if (zobrazit) this.$refs[`tabulkaZmenUkolu${idUkolu}`][0].initSwipe()
          }
        }
        const slideFun = zobrazit ? $.prototype.slideDown : $.prototype.slideUp
        slideFun.call($(`#ukol${idUkolu}-zmeny`), slidOpts)
        
        // pokud se změny skrývají a je zobrazen diff změny, přejdeme na úkol
        if (!zobrazit) {
          if (this.diffUkoluParametry.idUkolu && this.diffUkoluParametry.idZmeny) {
            this.zobrazDiffUkolu(this.diffUkoluParametry.idUkolu, null)
          }
        }
      },
      zobrazDiffUkolu(idUkolu, idZmeny = null, autoSchovat = true) {
        let parametry = {}
        if (autoSchovat && idUkolu == this.diffUkoluParametry.idUkolu && idZmeny == (this.diffUkoluParametry.idZmeny ?? null)) {
          this.offcanvas.hide()
        }
        else {
          this.offcanvas.show()
          $(this.offcanvasElem).find('.offcanvas-body').scrollTop(0)

          parametry.idUkolu = idUkolu
          parametry.ukol              = this.ukolyZobrazene[idUkolu]
          parametry.ukolFormat        = this.ukolyZobrazeneFormat[idUkolu]
          parametry.pouzitUdajeUkolu  = !idZmeny
        
          if (!this.jenUkoly) {
            let zmeny = this.zmenyZobrazene[idUkolu]
            let zmenyFormat = this.zmenyZobrazeneFormat[idUkolu]
            if (idZmeny) {
              zmeny         = { [idZmeny]: zmeny[idZmeny] }
              zmenyFormat   = { [idZmeny]: zmenyFormat[idZmeny] }
            }
            parametry.zmeny       = zmeny
            parametry.zmenyFormat = zmenyFormat
            parametry.idZmeny     = idZmeny

            let setridenaIdZmen = { ...this.setridenaIdZmenUkolu.find(setridenaIdZmen => setridenaIdZmen.idUkolu == idUkolu) }
            if (idZmeny) setridenaIdZmen.idsZmen = setridenaIdZmen.idsZmen.filter(idZmeny1 => idZmeny1 == idZmeny)
            parametry.setridenaIdZmen = setridenaIdZmen
          }

          if (this.ciselniky.prepinat_automaticky_na_aktivitu) {
            this.prepniAktivitu(this.ukolyZobrazene[idUkolu])
          }
          $(`#otevri-ukol-${idUkolu}`).focus()
        }
        this.diffUkoluParametry = parametry
      },
      naviguj(krok) {
        let krok1 = krok > 0 ? 1 : -1
        for (let i = 0; i < Math.abs(krok); i++) {
          this.naviguj1(krok1)
        }
      },
      naviguj1(krok) {
        // navigace se řídí podle aktuálně zobrazeného úkolu v DiffUkolu
        let idUkolu = this.diffUkoluParametry.idUkolu
        if (idUkolu) {
          let idZmeny           = this.diffUkoluParametry.idZmeny
          let idUkoluNove       = idUkolu
          let idZmenyNove       = idZmeny
          let setridenaIdZmen   = this.setridenaIdZmenUkolu.find(idZmenUkolu => idZmenUkolu.idUkolu == idUkolu)
          let prepnoutUkol      = true

          let iUkolu                      = this.setridenaIdZmenUkolu.findIndex(idZmenUkolu => idZmenUkolu.idUkolu == idUkolu)
          let setridenaIdZmenNovehoUkolu  = this.setridenaIdZmenUkolu[iUkolu + krok]
          let idUkoluNove1                = setridenaIdZmenNovehoUkolu && setridenaIdZmenNovehoUkolu.idUkolu

          // a) jsme na změně
          if (idZmeny) {
            let iZmeny = setridenaIdZmen.idsZmen.findIndex(idZmeny1 => idZmeny1 == idZmeny)
            // jsme na první změně: krok zpět přechází na tento úkol
            if (iZmeny == 0 && krok < 0) idZmenyNove = undefined, prepnoutUkol = false
            // jsme na poslední změně: krok vpřed přechází na další úkol (existuje-li)
            else if (iZmeny == setridenaIdZmen.idsZmen.length - 1 && krok > 0) {
              if (idUkoluNove1) idZmenyNove = undefined
            }
            // jinak
            else idZmenyNove = setridenaIdZmen.idsZmen[iZmeny + krok], prepnoutUkol = false
          }
          // b) jsme na úkolu
          else {
            // krok vpřed: má-li úkol otevřené změny, přecházíme na první změnu
            if (krok > 0) {
              let zobrazenyZmeny = this.zobrazitZmeny[idUkolu] ?? this.zobrazitZmenyVychozi
              if (zobrazenyZmeny) idZmenyNove = setridenaIdZmen.idsZmen[0], prepnoutUkol = false
            }
            // krok zpět: má-li předchozí úkol otevřené změny, přecházíme na poslední změnu předchozího úkolu
            else if (krok < 0 && idUkoluNove1) {
              let zobrazenyZmenyNovehoUkolu = this.zobrazitZmeny[idUkoluNove1] ?? this.zobrazitZmenyVychozi
              let idsZmenNovehoUkolu = setridenaIdZmenNovehoUkolu.idsZmen
              if (zobrazenyZmenyNovehoUkolu) idZmenyNove = idsZmenNovehoUkolu[idsZmenNovehoUkolu.length - 1]
            }
          }

          if (prepnoutUkol && idUkoluNove1) idUkoluNove = idUkoluNove1
          this.zobrazDiffUkolu(idUkoluNove, idZmenyNove, false)
        }
      },
      raditPodle(udaj) {
        this.razenyUdaj = udaj
      },
      prectiZmenu() {
        this.$emit('precteni-zmeny', ...arguments)
      },
      onKomentarPridan() {
        this.$emit('komentar-pridan', ...arguments)
      },
      onZmenaFiltru(filtracniPravidla) {
        this.filtracniPravidla = filtracniPravidla
        this.$emit('zmena-hledaneho-vyrazu', filtracniPravidla.popis_ukolu)
      },
      pridejKomentar(idUkolu) {
        this.idUkoluKomentar = idUkolu
      },
      otevriUkol(idUkolu, hotovo = false) {
        utils.otevriUkol(idUkolu, hotovo)
      },
      zkopirujOdkazNaUkol(idUkolu) {
        utils.zkopirujOdkazNaUkol(idUkolu)
      },
      zkopirujText(idUkolu) {
        utils.zkopirujText(idUkolu)
      },
      prepniAktivitu(ukol) {
        this.$emit('prepnuta-aktivita', ukol)
      },
      zavedOffcanvas() {
        // .$nextTick() garantuje, že i všechny child komponenty jsou načteny
        this.$nextTick(() => {
          this.offcanvasElem = $('#'+this.diffUkoluId)[0]
          this.offcanvas = new Offcanvas(this.offcanvasElem)
        })
      }
    },
    mounted() {
      this.zavedOffcanvas()
    },
    async created() {
      this.idAktualnihoUzivatele = (await utils.nactiWhoami()).id
    }
  }
</script>

<style scoped lang="scss">
  /* zrušení animace - v tabulce nefunguje */
  tr.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
  }

  table {
    th.razeny-udaj:after {
      content: '\25B2';
    }
    tr.ukol {
      cursor: pointer;
    }
    tr.zmeny:hover td {
      --bs-table-accent-bg: white;
    }
    tr.zmeny td {
      padding-top: 0;
      padding-bottom: 0;
    }
    tr.ukol td {
      border-bottom: none;
    }
    tr.ukol {
      &.dokonceny {
        color: grey;
        text-decoration: line-through;
      }
      &.po-terminu:not(.dokonceny) td.termin_splneni {
        background: red;
        color: white;
        font-weight: bold;
      }
      &.vysoka-priorita {
        background-color: orange;
      }
      &.zvoleny {
        background-color: #e1e6ea;
      }
    }
    td {
      &.datum_ukonceni, &.od_ukolu, &.termin_splneni {
        white-space: nowrap;
      }
      &.popis_ukolu span.procesni-krok {
        font-style: italic;
        float: right;
      }
    }
    &:hover {
      color: inherit;
    }
  }

  .tabulka-col {
    max-height: calc(100vh - 3.5rem);
    overflow-y: scroll;
  }

  .kontejner.vertikalni .tabulka-col {
    resize: horizontal;
  }

  .ukoly-item {
    display: inline-block;
    margin-right: 10px;
  }
  .ukoly-enter-active, .zmeny-leave-active {
    transition: all 1s;
  }
  .ukoly-enter, .zmeny-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }

  p.zadny_zaznam {
    padding: 1em;
    text-align: center;
    font-size: 1.3em;
  }

</style>
