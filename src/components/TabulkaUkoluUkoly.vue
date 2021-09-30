<script>
  import udaje from '../services/udaje'
  import TabulkaUkolu from './TabulkaUkolu.vue'
  
  export default {
    name: 'TabulkaUkoluUkoly',
    extends: TabulkaUkolu,
    data() {
      return {
        jenUkoly          : true,
        zpravaZadnyZaznam : 'Nebyly nalezeny žádné úkoly',
        razenyUdaj        : 'termin_splneni',
      }
    },
    computed: {
      /** úkoly jsou vraceny v objektu (pořadí vlastností objektu není definováno), proto je nutné ručně převést na setříděné pole
       *  [
       *    {
       *      idUkolu                 : idUkolu1,
       *    },
       *    ...
       *  ]
       */
      setridenaIdZmenUkolu() {
        let idZmenUkolu = Object.keys(this.ukolyZobrazene ?? {})
          .sort((idUkolu1, idUkolu2) => {
            let ukol1 = this.zmenyUkolu.ukoly[idUkolu1]
            let ukol2 = this.zmenyUkolu.ukoly[idUkolu2]
            let ciselneRazeni = udaje.vratCiselneRazeni(this.razenyUdaj)
            let udaj1 = ukol1[this.razenyUdaj]
            let udaj2 = ukol2[this.razenyUdaj]
            if (ciselneRazeni) {
              udaj1 = parseInt(udaj1)
              udaj2 = parseInt(udaj2)
            }

            return udaj1 === udaj2 ? 0
              : udaj1 < udaj2 ? -1
              : 1        
          })
          .map(idUkolu => { return { idUkolu } })
        return idZmenUkolu
      },
      pocetZaznamu() {
        return Object.keys(this.zmenyUkolu?.ukoly ?? {}).length
      }
    }
  }
</script>
