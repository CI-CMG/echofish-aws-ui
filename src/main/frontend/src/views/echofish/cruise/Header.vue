<template>
  <div>
    <b-navbar class="content-header mr-2" toggleable="sm" type="light" >
      <b-navbar-brand class="echo-nav-brand" href="#">
        <EchoFishSvg viewBox="0 0 200 200" class="echo-nav-icon"/>
        <span>Echofish </span>
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"  aria-expanded="false" ></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav >
        <b-navbar-nav >
          <b-navbar-item class="mr-2" >Cruise: <b>{{ cruise }}</b></b-navbar-item>
        </b-navbar-nav>
        <b-navbar-nav>
          <b-button id="mapView" class="mr-2" size="sm"><router-link v-bind:to="{ name: 'map-view' }"> Map View </router-link></b-button>
          <b-button id="infoPanelCollapse" size="sm" @click="toggleSidebar" class="my-2 my-sm-0">Cruise Detail</b-button>
        </b-navbar-nav>
        <b-navbar-nav>
          <b-nav-item-dropdown :text="`Transducer Frequency: ${formattedSelectedFrequency}`">
              <b-dropdown-item v-for="{frequency, text} in formattedFrequencies" :key="frequency" @click="() => setSelectedFrequency(frequency)">{{text}}</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown :text="`Sv Range: ${sliderValues[0]} dB - ${sliderValues[1]} dB`" boundary="viewport">
              <b-dropdown-item style="width: 300px; height: 40px;">
                <vue-slider v-model="sliderValues" v-bind="sliderOptions"/>
              </b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown :text="`Color Palette: ${selectedColorPalette}`">
            <b-dropdown-item v-for="colorPalette in colorPalettes" :key="colorPalette" @click="() => setSelectedColorPalette(colorPalette)">{{colorPalette}}</b-dropdown-item>
          </b-nav-item-dropdown>
          <span>
            <ColorPalette :selectedColorPalette="selectedColorPalette" :min="min" :max="max"/>
          </span>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
<!--  <span>-->
<!--    <span style="color: blue"><router-link v-bind:to="{ name: 'map-view' }"><b>[ Echofish ]</b></router-link></span>-->
<!--    <span class="mr-2 ml-2">Cruise: <b>{{ cruise }}</b></span>-->
<!--    TODO remove me-->
<!--    <span class="mr-2">{{ storeIndex }}</span>-->
<!--    <b-dropdown :text="`${selectedFrequency}`">-->
<!--      <b-dropdown-item v-for="frequency in frequencies" :key="frequency" @click="() => setSelectedFrequency(frequency)">{{frequency}}</b-dropdown-item>-->
<!--    </b-dropdown>-->
<!--    <b-dropdown :text="selectedColorPalette">-->
<!--      <b-dropdown-item v-for="colorPalette in colorPalettes" :key="colorPalette" @click="() => setSelectedColorPalette(colorPalette)">{{colorPalette}}</b-dropdown-item>-->
<!--    </b-dropdown>-->
<!--    <b-dropdown :text="`${sliderValues[0]} dB - ${sliderValues[1]} dB`" boundary="viewport">-->
<!--      <b-dropdown-item style="width: 300px; height: 40px;">-->
<!--        <vue-slider v-model="sliderValues" v-bind="sliderOptions"/>-->
<!--      </b-dropdown-item>-->
<!--    </b-dropdown>-->

<!--  </span>-->
</template>

<script>
import * as d3 from 'd3';
import vueSlider from 'vue-slider-component';
import { mapMutations, mapGetters, mapActions } from 'vuex';
import EchoFishSvg from '@/assets/images/echofish.svg';
import { colorPalettes } from './WaterColumnColors';
import ColorPalette from './ColorPalette.vue';

export default {
  components: {
    vueSlider,
    EchoFishSvg,
  },
  computed: {
    ...mapGetters({
      frequencies: 'cruiseView/frequencies',
      selectedFrequency: 'cruiseView/selectedFrequency',
      storeSliderValues: 'cruiseView/sliderValues',
      selectedColorPalette: 'cruiseView/selectedColorPalette',
      storeIndex: 'cruiseView/storeIndex',
      cruise: 'cruiseView/cruise',
    }),
    formattedSelectedFrequency() {
      return this.formatFrequency(this.selectedFrequency).text;
    },
    formattedFrequencies() {
      return this.frequencies.map(this.formatFrequency);
    },
    sliderValues: {
      get() {
        return this.storeSliderValues;
      },
      set(value) {
        this.setSliderValues(value);
      },
    },
    min() {
      return this.sliderValues[0];
    },
    max() {
      return this.sliderValues[1];
    },
  },
  methods: {
    components: {
      ColorPalette,
    },
    ...mapMutations({
      // setSelectedFrequency: 'cruiseView/selectedFrequency',
      setSliderValues: 'cruiseView/sliderValues',
      setSelectedColorPalette: 'cruiseView/selectedColorPalette',
    }),
    ...mapActions({ toggleSidebar: 'infoPanel/toggleCollapsed' }),
    setSelectedFrequency(frequency) {
      this.$router.push({ name: 'cruise-view', params: { cruise: this.cruise, frequency, storeIndex: this.storeIndex } });
    },
    formatFrequency(frequency) {
      const formatted = { frequency };
      if (frequency > 1000) {
        formatted.text = `${frequency / 1000} kHz`;
      } else {
        formatted.text = `${frequency} Hz`;
      }
      return formatted;
    },
  },
  data() {
    return {
      colorPalettes: Object.keys(colorPalettes),
      sliderOptions: {
        contained: false,
        min: -100,
        max: 0,
        interval: 1,
        dotSize: 15,
        tooltipPlacement: 'top',
        useKeyboard: true,
        enableCross: false,
        marks: d3.range(-100, 10, 10),
      },
    };
  },

};
</script>
