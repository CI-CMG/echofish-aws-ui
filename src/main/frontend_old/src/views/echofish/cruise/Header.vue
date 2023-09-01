<template>
  <div>
    <b-navbar class="content-header mr-2" toggleable="md" type="light" >
      <b-navbar-brand class="echo-nav-brand" href="#">
        <EchoFishSvg viewBox="0 0 200 200" class="echo-nav-icon"/>
        <span>Echofish </span>
      </b-navbar-brand>
      <b-navbar-nav >
        <b-navbar-item class="mr-2" >Cruise: <b>{{ cruise }}</b></b-navbar-item>
      </b-navbar-nav>
      <b-navbar-toggle target="nav-collapse"  aria-expanded="false" ></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav >
        <b-navbar-nav>
          <b-button id="mapView" class="mr-2" size="sm"><router-link v-bind:to="{ name: 'map-view' }"> Map View </router-link></b-button>
          <b-button id="infoPanelCollapse" size="sm" @click="toggleSidebar" class="my-2 my-sm-0">Cruise Detail</b-button>
        </b-navbar-nav>
        <b-navbar-nav>
          <b-nav-item-dropdown v-b-popover.hover.bottom="'Transducer Frequency'">
            <template slot="button-content">
              <b-icon class="mr-2" :icon="'soundwave'"/>
              {{formattedSelectedFrequency}}
            </template>
              <b-dropdown-item v-for="{frequency, text} in formattedFrequencies" :key="frequency" @click="() => setSelectedFrequency(frequency)">{{text}}</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown v-b-popover.hover.bottom="'Color Map'">
            <template slot="button-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brush-fill" viewBox="0 0 16 16">
                <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.067 6.067 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.118 8.118 0 0 1-3.078.132 3.659 3.659 0 0 1-.562-.135 1.382 1.382 0 0 1-.466-.247.714.714 0 0 1-.204-.288.622.622 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896.126.007.243.025.348.048.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04z"/>
              </svg>
              {{selectedColorPalette}}
            </template>
            <b-dropdown-item v-for="colorPalette in colorPalettes" :key="colorPalette" @click="() => setSelectedColorPalette(colorPalette)">{{colorPalette}}</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item>Sv:</b-nav-item>
          <template>
            <b-container fluid>
              <b-row>
                <b-col cols="2">
                  <b-form-group
                    id="sv-min"
                    label="Min"
                    label-for="svMin"
                    label-cols="3"
                  >
                    <b-form-input id="svMin" v-model.number="svMin" type="number" debounce="1000"></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col cols="auto">
                  <ColorPalette :selectedColorPalette="selectedColorPalette" :min="min" :max="max"/>
                </b-col>
                <b-col cols="2">
                  <b-form-group
                    id="sv-max"
                    label="Max"
                    label-for="svMax"
                    label-cols="3"
                  >
                    <b-form-input id="svMax" v-model.number="svMax" type="number" debounce="1000"></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>
            </b-container>
          </template>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { mapMutations, mapGetters, mapActions } from 'vuex';
import EchoFishSvg from '@/assets/images/echofish.svg';
import ColorPalette from './ColorPalette.vue';
import { colorPalettes } from './WaterColumnColors';

export default {
  components: {
    EchoFishSvg,
    ColorPalette,
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
    svMin: {
      get() {
        return this.sliderValues[0];
      },
      set(value) {
        let values = [value, this.sliderValues[1]];
        if (value > this.sliderValues[1]) {
          values = [this.sliderValues[1], value];
        }
        this.setSliderValues(values);
      },
    },
    svMax: {
      get() {
        return this.sliderValues[1];
      },
      set(value) {
        let values = [this.sliderValues[0], value];
        if (value < this.sliderValues[0]) {
          values = [value, this.sliderValues[0]];
        }
        this.setSliderValues(values);
      },
    },
  },
  methods: {
    ...mapMutations({
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
    togglesidebar() {
      this.toggleSidebar();
      if (this.isCollapsedOpen) {
        this.$root.$emit('bv::toggle::collapse', 'nav-collapse');
      }
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
      isCollapsedOpen: false,
    };
  },

};
</script>
