<template>
  <div class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Přidat komentář</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Zavřít"></button>
        </div>
        <div class="modal-body">
          <textarea id="komentar" v-model="komentar" placeholder="Napište svůj komentář" required></textarea>
        </div>
        <div class="modal-footer">
          <button id="komentar-zavrit" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zavřít</button>
          <button type="button" class="btn btn-primary" @click="ulozKomentar">Uložit komentář</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import $ from 'jquery'
  import Api from '../services/Api'

  export default {
    name: 'Komentar',
    props: {
      idUkolu       : { type: [Number, String], default: null },
    },
    data() {
      return {
        komentar: ""
      }
    },
    methods: {
      ulozKomentar() {
        Api.post(`/servis/ukoly/${this.idUkolu}/komentar/`, { komentar: this.komentar })
          .then(({ data }) => {
            this.$emit('komentar-pridan', this.idUkolu, data.id_komentare, this.komentar)
            $('#komentar-zavrit').click()
            this.komentar = ""
          })
      }
    },
    mounted() {
      $('#modalKomentar')[0].addEventListener('shown.bs.modal', function () {
        $('#komentar').focus()
      })
    }
  }
  
</script>

<style scoped>
  textarea {
    width: 100%;
    min-height: 35vh;
  }
  textarea:invalid {
    border-color: orange;
  }

</style>
