<template>
  <div id="app" @keydown="onKeydown($event)" tabindex="-1">
    <nav class="navbar sticky-top navbar-light bg-light">
      <div class="container-fluid">
        <div class="navbar-menu">
          <span class="navbar-brand">iZUŠ přehled úkolů</span>
          <div class="nav nav-pills">
            <router-link
              to="/zmeny_ukolu"
              :class="['nav-link', { active: routeName == 'zmenyUkolu' }]"
            >
              <span v-if="pocetZaznamu.zmenyUkolu" class="pocet-zaznamu position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{ pocetZaznamu.zmenyUkolu }}
                <span class="visually-hidden">počet změn v úkolech</span>
              </span>
              Změny v&nbsp;úkolech
            </router-link>
            <router-link
              to="/ukoly"
              :class="['nav-link', { active: routeName == 'ukoly' }]"
            >
              <span v-if="pocetZaznamu.ukoly" class="pocet-zaznamu position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary">
                {{ pocetZaznamu.ukoly }}
                <span class="visually-hidden">počet změn v úkolech</span>
              </span>
              Moje nedokončené úkoly
            </router-link>
          </div>
        </div>
        <div class="navbar-hledat d-flex">
          <div v-if="ukolAktivity" class="id-aktivity">
            Úkol aktivity:
            <span><a href="#" @click.stop="otevriUkol(ukolAktivity.id_ukolu)" title="Zobrazit úkol v iZUŠ">{{ ukolAktivity.id_ukolu }}</a></span>
            <span class="ukol-aktivity-popis-container">(<span class="ukol-aktivity-popis">{{ ukolAktivity.popis_ukolu }}</span>)</span>
          </div>
          <button
            :class="['btn', 'btn-primary', 'me-3', 'bi', zmenTypZobrazeniClass]"
            :title="`Změnit zobrazení na ${typZobrazeni == 'vertikalni' ? 'horizontální' : 'vertikální'}`"
            @click="zmenTypZobrazeni">
            <span class="d-none">Změnit zobrazení</span>
          </button>
          <button class="btn btn-primary me-2 bi bi-chevron-left" title="Přejít na předchozí úkol nebo změnu úkolu (J)" @click="navigace[$route.name].predchozi++">
            <span class="d-none">Předchozí</span>
          </button>
          <button class="btn btn-primary me-2 bi bi-chevron-right" title="Přejít na další úkol nebo změnu úkolu (K)" @click="navigace[$route.name].dalsi++">
            <span class="d-none">Další</span>
          </button>
          <input id="hledat-input" class="form-control me-2 hledat" type="search" v-model.trim="hledanyVyraz" placeholder="Hledat zadání nebo ID úkolu... (Ctrl+/)" aria-label="Hledat" autofocus>
          <button class="btn btn-primary" type="button" data-bs-toggle="modal" :data-bs-target="'#'+filtryUkoluId">Filtry a&nbsp;hledání</button>
        </div>
      </div>
    </nav>
    <transition name="component-fade" mode="out-in">
      <keep-alive>
        <router-view
          :hledanyVyraz="hledanyVyraz"
          :navigace="navigace[$route.name]"
          :typZobrazeni="typZobrazeni"
          @zmena-hledaneho-vyrazu="onZmenaHledanehoVyrazu"
          @zmena-poctu-zaznamu="onZmenaPoctuZaznamu"
          @prepnuta-aktivita="prepniAktivitu"
        />
      </keep-alive>
    </transition>
  </div>
</template>

<script>
  import $ from 'jquery'
  import axios from "axios";
  import * as utils from './services/utils'

  export default {
    name: 'App',
    data() {
      // navigování formou signálů podřízeným komponentám předávaným pomocí props
      //  - číselné hodnoty slouží jen pro předání signálu, nemají reálný význam
      let navigaceVychozi     = {
        predchozi             : 0,
        dalsi                 : 0,
        prectiZmenu           : 0,
        zobrazSkryjZmenyUkolu : 0,
      }

      return {
        hledanyVyraz          : null,
        pocetZaznamu          : {},
        ukolAktivity          : null,
        navigace              : {
          ukoly               : { ...navigaceVychozi },
          zmenyUkolu          : { ...navigaceVychozi },
        },
        typZobrazeni          : 'vertikalni',
      }
    },
    computed: {
      routeName() {
        return this.$route.name
      },
      filtryUkoluId() {
        return `filtry-ukolu-${this.$route.name}`
      },
      zmenTypZobrazeniClass() {
        return this.typZobrazeni == 'vertikalni' ? 'bi-hr' : 'bi-vr'
      }
    },
    methods: {
      onKeydown(e) {
        //console.log(e.code)
        let ignorovat = ['input', 'textarea'].includes(e.target.tagName.toLowerCase())
        if (!ignorovat) {
          if (e.ctrlKey && e.code === 'BracketLeft') {
            $('#hledat-input').focus()
          }
          else if (e.code == 'KeyJ') this.navigace[this.$route.name].predchozi++
          else if (e.code == 'KeyK') this.navigace[this.$route.name].dalsi++
          else if (e.code == 'Delete') this.navigace[this.$route.name].prectiZmenu++
          else if (e.code == 'ArrowLeft' || e.code == 'ArrowRight') this.navigace[this.$route.name].zobrazSkryjZmenyUkolu++
        }
      },
      onZmenaHledanehoVyrazu(hledanyVyraz) {
        this.hledanyVyraz = hledanyVyraz
      },
      onZmenaPoctuZaznamu(pocetZaznamu) {
        this.$set(this.pocetZaznamu, this.$route.name, pocetZaznamu)
      },
      otevriUkol(idUkolu) {
        utils.otevriUkol(idUkolu)
      },
      prepniAktivitu(ukol) {
        let bodyFormData = new FormData();
        bodyFormData.append('ajax', 1);
        bodyFormData.append('id_typu_aktivity', 6);
        bodyFormData.append('id_ukolu', ukol.id_ukolu);
        axios({
          method: 'post',
          url: '/lib/ajax/aktivity_zamestnance.ajax.php',
          data: bodyFormData
        }).then(() => {
          this.ukolAktivity = ukol
        })
      },
      zmenTypZobrazeni() {
        this.typZobrazeni = this.typZobrazeni == 'vertikalni' ? 'horizontalni' : 'vertikalni';
      }
    },
    created() {

    }
  }
</script>

<style scoped lang="scss">
  div.navbar-menu {
    display: flex;
  }

  .nav-link {
    position: relative;
  }

  .component-fade-enter-active, .component-fade-leave-active {
    transition: opacity .3s ease;
  }

  .component-fade-enter, .component-fade-leave-to {
    opacity: 0;
  }

  input.hledat {
    width: 22em;
  }

  span.pocet-zaznamu {
    z-index: 999;
  }

  div.navbar-menu, div.navbar-hledat {
    font-size: 1rem;
  }

  div.id-aktivity {
    padding: .3125rem 1rem .3125rem 0;
  }

  span.ukol-aktivity-popis-container {
    margin-left: 0.5em;
    display: inline-flex;
  }

  span.ukol-aktivity-popis {
    display: block;
    max-width: 25em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

</style>
