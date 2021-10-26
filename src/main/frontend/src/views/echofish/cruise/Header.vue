<template>

  <div>
    <b-navbar class="content-header" toggleable="sm" type="dark" variant="blue">
<!--      <b-button class="show-hide-sidebar-button" id="infoPanelCollapse" variant="secondary" @click="toggleSidebar">-->
<!--        <span>Menu</span>-->
<!--        <font-awesome-icon class="expand-icon" icon="angle-double-right"/>-->
<!--      </b-button>-->
      <b-navbar-nav>
        <b-navbar-item style="color: blue"><router-link v-bind:to="{ name: 'map-view' }"><b>Echofish</b></router-link></b-navbar-item>
        <b-navbar-item class="show-hide-sidebar-button mr-2 ml-2" id="infoPanelCollapse" variant="secondary" @click="toggleSidebar">Cruise: <b>{{ cruise }}</b></b-navbar-item>
        <b-navbar-item class="mr-2">{{ storeIndex }}</b-navbar-item>
      </b-navbar-nav>
      <b-navbar-nav class="mr-2" >
        <b-nav-item-dropdown style="color: black" :text="`${selectedFrequency}`">
            <b-dropdown-item v-for="frequency in frequencies" :key="frequency" @click="() => setSelectedFrequency(frequency)">{{frequency}}</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown :text="selectedColorPalette">
            <b-dropdown-item v-for="colorPalette in colorPalettes" :key="colorPalette" @click="() => setSelectedColorPalette(colorPalette)">{{colorPalette}}</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown :text="`${sliderValues[0]} dB - ${sliderValues[1]} dB`" boundary="viewport">
            <b-dropdown-item style="width: 300px; height: 40px;">
              <vue-slider v-model="sliderValues" v-bind="sliderOptions"/>
            </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
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
import { colorPalettes } from './WaterColumnColors';

export default {
  components: {
    vueSlider,
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
    sliderValues: {
      get() {
        return this.storeSliderValues;
      },
      set(value) {
        this.setSliderValues(value);
      },
    },
  },
  methods: {
    ...mapMutations({
      // setSelectedFrequency: 'cruiseView/selectedFrequency',
      setSliderValues: 'cruiseView/sliderValues',
      setSelectedColorPalette: 'cruiseView/selectedColorPalette',
    }),
    ...mapActions({ toggleSidebar: 'infoPanel/toggleCollapsed' }),
    setSelectedFrequency(frequency) {
      this.$router.push({ name: 'cruise-view', params: { cruise: this.cruise, frequency, storeIndex: this.storeIndex } });
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
