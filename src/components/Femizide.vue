<template>
  <div>
    <h1>Femizide in Deutschland</h1>
    <div class="fem-intro">
      2021 sind laut Urteil durch<br /><br />
      <div class="fem-select">
        <select v-model="verdictOption" @change="filterThisFirst(verdictOption)">
          <option class="fem-option" disabled value="">Bitte auswählen</option>
          <option class="fem-option" v-for="(option, item) in verdictCategorys" :key="item" :value="option">
            {{ option }}
          </option>
          <option value="Alle Urteile">Alle Urteile</option>
        </select>
      </div>
      <div class="fem-filter">
        <li class="vue-list" v-for="item in verdictCategorys" :key="item">
          <div class="fem-filter-button verdict" v-bind:id="item" v-on:click="filterThisFirst(item)">
            {{ item }}
          </div>
        </li>
      </div>
      <br />begangen vom<br /><br />
      <div class="fem-select">
        <select v-model="perpOption" @change="filterThisSecond(perpOption)">
          <option disabled value="">Bitte auswählen</option>
          <option v-for="(option, item) in perpCategorys" :key="item" :value="option">{{ option }}</option>
          <option value="Alle Täter">Alle Täter</option>
        </select>
      </div>
      <div class="fem-filter">
        <li class="vue-list" v-for="item in perpCategorys" :key="item">
          <div class="fem-filter-button perp" v-bind:id="item" v-on:click="filterThisSecond(item)">
            {{ item }}
          </div>
        </li>
      </div>
      <br />
      <span v-if="isFiltered"
        ><span class="active" style="margin-right: 3px; font-weight: bold; font-size: 28px">{{ deaths }} </span>
        <span v-if="deaths == 0" class="active" style="margin-right: 3px; font-weight: bold; font-size: 28px"></span>
        <br />
        Mensch<span v-if="deaths !== 1">en</span> gestorben.<br /><br
      /></span>
      <span v-if="!isFiltered">
        <span style="margin-right: 3px; font-weight: bold; font-size: 28px">{{ deathsTotal }} </span> <br />
        Menschen gestorben.<br /><br
      /></span>
    </div>
    <svg id="femizide-icons"></svg>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  name: "Femizide",
  props: {
    msg: String,
  },
  data() {
    return {
      svgWidth: 600,
      svgHeight: 800,
      store: [],
      defaultgrey: "#bbbbbb",
      filterorange: "#F15E24",
      hoverwhite: "#ffffff",
      deaths: 0,
      deathsTotal: 0,
      verdictCategorys: [],
      perpCategorys: [],
      childrenPos: 0,
      otherpersonPos: 0,
      rowPos: 0,
      filteredFirst: [],
      filteredSecond: [],
      filteredMerged: [],
      isFiltered: false,
      perpOption: "",
      verdictOption: "",
    };
  },
  methods: {
    filterThisFirst(item) {
      // click to filter, change color of button and store filter ids -- first filter for verdicts
      let allButtons = document.getElementsByClassName("fem-filter-button verdict");
      //let clickedButton = document.getElementById(item);
      for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove("active");
      }

      let arrItemIds = this.store
        .filter((obj) => Object.values(obj).some((value) => value === item))
        .map((obj) => obj.index)
        .filter((index) => index !== undefined);

      if (item === "Alle Urteile") {
        arrItemIds = this.store.map((obj) => obj.index).filter((index) => index !== undefined);
      }

      if (JSON.stringify(this.filteredFirst) == JSON.stringify(arrItemIds)) {
        //clickedButton.classList.remove("active");
        //this.filteredFirst.length = 0;
      } else {
        this.filteredFirst = arrItemIds;
        //clickedButton.classList.add("active");
      }
      this.mergeFilter();
    },
    filterThisSecond(item) {
      // click to filter, change color of button and store filter ids -- second filter for perps
      let allButtons = document.getElementsByClassName("fem-filter-button perp");
      //let clickedButton = document.getElementById(item);
      for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove("active");
      }

      let arrItemIds = this.store
        .filter((obj) => Object.values(obj).some((value) => value === item))
        .map((obj) => obj.index)
        .filter((index) => index !== undefined);

        if (item === "Alle Täter") {
        arrItemIds = this.store.map((obj) => obj.index).filter((index) => index !== undefined);
      }

      if (JSON.stringify(this.filteredSecond) == JSON.stringify(arrItemIds)) {
        //clickedButton.classList.remove("active");
        //this.filteredSecond.length = 0;
      } else {
        this.filteredSecond = arrItemIds;
        //clickedButton.classList.add("active");
      }
      this.mergeFilter();
    },
    mergeFilter() {
      // use both filters to color the symbols
      let allSymbols = document.getElementsByClassName("fem-icon");
      let getOrange = [];
      if (this.filteredFirst.length > 0 && this.filteredSecond.length > 0) {
        //check if both filters are used
        getOrange = this.filteredFirst.filter((value) => this.filteredSecond.includes(value)); // merge both filter arrays
      } else {
        getOrange = [...this.filteredFirst, ...this.filteredSecond];
      }
      if (this.filteredFirst.length == 0 && this.filteredSecond.length == 0) {
        this.isFiltered = false;
      } else {
        this.isFiltered = true;
      }
      this.deaths = getOrange.length; //new death count

      for (let i = 0; i < allSymbols.length; i++) {
        //remove old filter colors
        allSymbols[i].setAttribute("fill", this.defaultgrey);
      }
      for (let i = 0; i < getOrange.length; i++) {
        // set new filter color
        let newOrange = document.getElementById(getOrange[i]);
        newOrange.setAttribute("fill", this.filterorange);
        for (let j = 1; j < 5; j++) {
          // if children
          let child = document.getElementById(getOrange[i] + "-0" + j);
          if (child) {
            child.setAttribute("fill", this.filterorange);
            this.deaths = this.deaths + 1;
          }
          // if other persons
          let person = document.getElementById(getOrange[i] + "-00" + j);
          if (person) {
            person.setAttribute("fill", this.filterorange);
            this.deaths = this.deaths + 1;
          }
        }
      }
    },
    getVerdictCategorys() {
      // all kind of verdicts out of femizide.json
      let arrAllVerdicts = this.store.map((obj) => obj.verdictCat);
      arrAllVerdicts = arrAllVerdicts.filter((cat) => cat !== "");
      this.verdictCategorys = [...new Set(arrAllVerdicts)];
      this.verdictOption = this.verdictCategorys[0];
    },

    getPerpCategorys() {
      // all kind of perps out of femizide.json
      let arrAllPerps = this.store.map((obj) => obj.perp);
      this.perpCategorys = [...new Set(arrAllPerps)];
      this.perpOption = this.perpCategorys[0];
    },

    filterList(searchTerm) {
      // Filter all femizides for special searchTerms
      let filteredArray = this.store.filter((obj) => Object.values(obj).some((value) => value === searchTerm));
      return filteredArray;
    },
    clearSVG: async function () {
      const svgNode = d3.select("#femizide-icons");
      svgNode.selectAll("*").remove();
      this.childrenPos = 0;
      this.otherpersonPos = 0;
    },
    // Timer vor handleResize:
    handleResizeEnd() {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.handleResize();
      }, 600);
    },
    async handleResize() {
      this.windowWidth = window.innerWidth;
      this.svgWidth = document.getElementById("femizide").clientWidth;
      // Clean svg and wait until it is empty
      await this.clearSVG();
      // Render woman icons and wait until they are displayed
      await this.renderAllWomen(this.store);
      // Then color filtered items
      this.mergeFilter();
    },
    renderPosition(index, children, otherpersons) {
      let symbWidth = 35;
      let scale = 0.2;

      if (document.getElementById("femizide").clientWidth < 450) {
        scale = 0.15;
        symbWidth = 25;
      }

      this.childrenPos = this.childrenPos + children * symbWidth;
      this.otherpersonPos = this.otherpersonPos + otherpersons * symbWidth;
      index = index - 1;
      let xpos = index * symbWidth + this.childrenPos + this.otherpersonPos;
      let ypos = 5;
      let numChilds = this.childrenPos / symbWidth;
      let numOthers = this.otherpersonPos / symbWidth;
      let numTotal = index + numChilds + numOthers;
      let numPerRow = Math.floor(this.svgWidth / symbWidth); // soviele passen in eine Reihe

      let row = Math.floor(numTotal / numPerRow);

      ypos = ypos + row * (3 * symbWidth);
      xpos = xpos - row * numPerRow * symbWidth;

      this.svgHeight = ypos + 200;

      let svg = d3.select("#femizide-icons");
      svg.attr("viewBox", "0 0 " + this.svgWidth + " " + this.svgHeight + "");
      return "translate(" + xpos + ", " + ypos + ") scale(" + scale + ", " + scale + ")";
    },
    renderAllWomen(data) {
      const svg = d3.select("#femizide-icons");
      svg.attr("viewBox", "0 0 " + this.svgWidth + " " + this.svgHeight + "").attr("width", this.svgWidth);
      const g = svg.append("g");
      g.attr("transform", "translate(20,0)");
      const dfem = // Frauenicon
        "M55.8,234.83c-1.66,19.37-2.83,26.34-5.66,53.17-.05.43.88,13.81.94,14.24,3.82,24.79-2.82,45.53-3.76,69.29-.32,8.17-1.5,15.49,1.59,23.71.49,1.3,2.85,6.16,1.41,6.53-4.76,1.24-3.88,2.65-10.41,2.29-1.13-.06-4.89-.26-5.47-1.24-1.64-2.76-7.91.93-8.29-4.59-4.35-4,5.65-4.59,8.47-8.35s1.72-12.07,1.18-16.82c-2.48-25.9-11.18-38-7.06-76.12.47-12.59-4.24-24.24-5.18-32-1.87-15.46-3.76-27.76-6.47-45.88-.81-5.42-.82-3.18-2-7.18-.4-1.36-1.53-1.77-1.53-.35,0,3.29-1.53,4.35-.97,7.09s.74,3.86,2.03,6.68c.44.97.35,2.82-1.53,4-.7.44-3.08-.63-3.76-1.53-4.47-5.88-5.41-7.29-8.24-12.47-1.94-3.55-.94-6.59.47-14.59.22-1.24,1.7-8.64,1.88-9.88,1.42-9.48,1.24-14.42,1.55-24.75.65-21.79,5.41-33.41,5.71-51.51,1.07-9.38.42-18.95,1.48-28.33.63-5.61,1.85-11.91,5.02-16.28,3.91-5.4,8.89-8.98,9.79-15.31,4.34-9.44,10.12-20.79,11.65-31.12C40.91,7.98,42.84.89,58.37,0M18.73,176.59l4.94-11.65,3.53-9.18c4.24-15.53.35-23.29-1.71-33.71-.52-2.65-1.45,10.13-4.06,25.24-1.76,10.24-5.71,21.08-6.53,25.59-1.41,7.76-1.59,13.76.18,24.71.7-10.51-.24-9.35,3.65-21ZM57.43.24c11.76,0,17,9.62,19.29,25.18,1.53,10.32,5.07,23.97,9.41,33.41.94,5.18,3.42,5.68,7.33,11.07,3.17,4.37,4.38,10.67,5.02,16.28,1.06,9.38.4,18.95,1.48,28.33.3,18.1,5.06,29.72,5.71,51.51.31,10.33.13,15.27,1.55,24.75.19,1.24,1.66,8.65,1.88,9.88,1.41,8,2.41,11.04.47,14.59-2.82,5.18-3.76,6.59-8.24,12.47-.68.9-3.06,1.97-3.76,1.53-1.88-1.18-1.97-3.03-1.53-4,1.29-2.82,1.5-4.06,2.03-6.68s-.97-3.79-.97-7.09c0-1.42-1.13-1.01-1.53.35-1.18,4-.75,1.84-2,7.18-4.02,17.23-4.14,27.82-7.9,48.76-1.02,5.68-.94,8-3.76,24,2.35,21.18,5.65,35.29-6.82,82.88-.59,6.27.24,6.29.94,10.53.02.13-.24,6.12,2.35,10.59.94,4.71-.24,5.18-2.59,6.82-.78.54-3,.71-5.88.71-4.94,0-6.82.71-8.71-2.12-.82-1.23-.59-3.94.47-8,1.41-3.88,2.61-14.46,1.76-22.59-1.94-18.64-7.26-46.33-1.76-79.29.94-5.65-.88-11.34-.94-11.76-3.29-21.65-6-38.71-5.41-60.94M94.85,198.59c1.76-10.94,2.31-18,.9-25.76-.82-4.51-4.88-15.33-6.53-25.59-2.6-16.18-3.06-31.2-3.43-28.53-2.47,18-6.32,19.36-4.59,34.94.71,6.35,4.95,12.73,8.82,20.47,1.53,3.06,2.94,8.71,2.94,8.71,1.18,7.29,1.18,5.26,1.88,15.76Z";
      const dchild = // Kindericon
        "M33.71,0c1.33,0,2.66,0,3.99,0,.15.11.29.28.46.32,10.56,2.32,16.04,9.04,16.24,19.78.03,1.45.48,2.93.91,4.34,1.03,3.37.29,6.33-1.79,9.08-2.08,2.75-4.11,5.53-6.58,8.87,4.26,1.7,8.12,3.42,12.11,4.78,3.83,1.32,6.52,3.78,7.41,7.59,1.49,6.45,2.53,13,3.75,19.5.44,2.32.72,4.67,1.32,6.94,1.61,6.02,2.19,12.08,1.66,18.3-.23,2.69-.65,5.59.08,8.08,1.62,5.48-1.85,10.57-6.53,13.1-1.59.86-2.17.07-1.99-1.41.18-1.47.59-2.91.87-4.27-1,.27-2.11.92-2.56.61-.59-.4-.96-1.58-.91-2.39.21-3.19.62-6.36.95-9.54.08-.75.3-1.56.1-2.24-1.23-4.2-2.56-8.37-3.86-12.54-.26-.02-.52-.04-.79-.06-.2,3.69-.83,7.42-.49,11.06.4,4.41,1.93,8.71,2.41,13.11.56,5.16.23,10.43.8,15.59,1.16,10.47-.29,20.57-3.6,30.46-2.34,7.02.19,9.02,4.6,12.5,3.25,6.27-1.62,7.19-4.53,7.69-3.23.56-9.1.9-11.95-.73-.16-.09-1.62-1.62-3.25-5.34-.86-1.96-.7-3.95-.68-5.83.03-3.67,1-7.29,1.31-10.95.34-4.04.49-8.1.7-12.16.04-.75.02-1.52-.13-2.25-.59-2.76-1.17-5.52-1.89-8.25-1.19-4.54-2.47-9.05-3.78-13.82-2-.58-3.15.01-3.12,2.74.02,1.54-2.3,7.6-2.39,9.21-.32,6.06-3.64,12.14-1.73,18.36.13.43.02.94.02,1.42.04,5.49-.34,11,1.57,16.34.65,1.82,2.1,3.87.14,4.96-2.32,5.11,1.62,6.27-7.66,7.43-.57,0-8.12,1.39-11.84-3.48.74-7.08,3.28-7.41,4.87-8.59.93-2.55.61-3.62-.48-6-4.38-9.56-5.46-19.79-5.39-30.17.02-3.12.17-6.25.47-9.36.64-6.48,1.16-13,2.22-19.42.8-4.86,1.02-9.49-1.16-14.3-1.26,4.59-2.45,8.9-3.6,13.23-.11.41.1.91.16,1.36.43,3.27.95,6.54,1.25,9.82.08.91-.25,2.09-.85,2.71-.31.32-1.61-.33-2.64-.58.29,1.24.66,2.42.8,3.62.08.67-.21,1.38-.33,2.07-.6-.15-1.26-.18-1.78-.46-5.54-2.96-7.3-6.91-6.27-13.15.39-2.4.5-4.94.17-7.33-.89-6.48-.74-12.83,1.23-19.11.53-1.71.87-3.5,1.09-5.27.62-4.88,1.12-9.78,1.69-14.67.92-7.91,4.59-13.41,12.8-15.39,2.75-.66,5.27-2.24,7.99-3.44-2.08-2.98-3.49-5.76-5.59-7.82-3.02-2.97-4.29-6.66-2.87-10.63.27-.75.27-1.67.17-2.48-1.19-8.96,3.69-17.2,12.09-20.24,1.49-.54,3.06-.88,4.59-1.31Z";

      const iconGroup = g
        .append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", (d, i, nodes) => {
          if (i > 0) {
            // vorherige Anzahl Kinder an renderPosition übergeben, damit xpos richtig berechnet werden kann
            var previousData = d3.select(nodes[i - 1]).datum();
            return this.renderPosition(d.index, previousData.children, previousData.morepersons);
          }
          return this.renderPosition(d.index, 0, 0);
        });

      // Woman
      iconGroup
        .append("path")
        .attr("fill", this.defaultgrey)
        .attr("class", "fem-icon")
        .attr("d", dfem)
        .attr("id", (d) => d.index);

      // if woman had children (first child)
      iconGroup
        .filter((d) => d.children > 0)
        .append("g")
        .attr("transform", "translate(200, 220)")
        .append("path")
        .attr("fill", this.defaultgrey)
        .attr("class", "fem-icon")
        .attr("id", (d) => d.index + "-01")
        .attr("d", dchild);

      // if woman had children (second child)
      iconGroup
        .filter((d) => d.children > 1)
        .append("g")
        .attr("transform", "translate(370, 220)")
        .append("path")
        .attr("fill", this.defaultgrey)
        .attr("class", "fem-icon")
        .attr("id", (d) => d.index + "-02")
        .attr("d", dchild);

      // if woman had children (third child)
      iconGroup
        .filter((d) => d.children > 2)
        .append("g")
        .attr("transform", "translate(540, 220)")
        .append("path")
        .attr("fill", this.defaultgrey)
        .attr("class", "fem-icon")
        .attr("id", (d) => d.index + "-03")
        .attr("d", dchild);

      // if woman had children (fourth child)
      iconGroup
        .filter((d) => d.children > 3)
        .append("g")
        .attr("transform", "translate(710, 220)")
        .append("path")
        .attr("fill", this.defaultgrey)
        .attr("class", "fem-icon")
        .attr("id", (d) => d.index + "-04")
        .attr("d", dchild);

      // if other persons are in group (first person)
      iconGroup
        .filter((d) => d.morepersons > 0)
        .append("g")
        .attr("transform", (d) => "translate(" + (d.children * 175 + 175) + ", 0)")
        .append("path")
        .attr("fill", this.defaultgrey)
        .attr("class", "fem-icon")
        .attr("id", (d) => d.index + "-001")
        .attr("d", dfem);

      // if other persons are in group (second person)
      iconGroup
        .filter((d) => d.morepersons > 1)
        .append("g")
        .attr("transform", (d) => "translate(" + (d.children * 175 + 350) + ", 0)")
        .append("path")
        .attr("fill", this.defaultgrey)
        .attr("class", "fem-icon")
        .attr("id", (d) => d.index + "-02")
        .attr("d", dfem);

      // Tooltip:
      let tooltip = g.append("g").attr("id", "tooltip").style("opacity", 0).style("pointer-events", "none");

      let tooltipbg = tooltip
        .append("rect")
        .attr("rx", 2)
        .attr("width", 450)
        .attr("height", 500)
        .attr("fill", "#eaeaea")
        .attr("x", 10)
        .attr("y", 10)
        .attr("id", "tooltip-background");

      let tooltipforeign = tooltip
        .append("foreignObject")
        .attr("width", 410)
        .attr("height", 600)
        .attr("x", 30)
        .attr("y", 30);

      let tooltiptext = tooltipforeign
        .append("xhtml:div")
        .attr("class", "layer-text")
        .html("<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eu enim quam. ");

      let tooltipclose = tooltip.append("g").attr("id", "tooltip-close").style("cursor", "pointer");

      tooltipclose
        .append("rect")
        .attr("rx", 2)
        .attr("width", 30)
        .attr("height", 30)
        .attr("fill", "#eaeaea")
        .attr("x", 290)
        .attr("y", 10)
        .attr("id", "closer-background");

      tooltipclose
        .append("line")
        .attr("stroke", "#333333")
        .attr("stroke-width", "1")
        .attr("x1", "290")
        .attr("y1", "20")
        .attr("x2", "310")
        .attr("y2", "40");

      tooltipclose
        .append("line")
        .attr("stroke", "#333333")
        .attr("stroke-width", "1")
        .attr("x1", "310")
        .attr("y1", "20")
        .attr("x2", "290")
        .attr("y2", "40");
      tooltipclose.style("opacity", 0).style("pointer-events", "none"); // only acitvating if mobile

      // Hovering Tooltip if not mobile
      if (document.getElementById("femizide").clientWidth > 450) {
        let svgWidth = this.svgWidth;
        let svgHeight = this.svgHeight;
        iconGroup.on("mouseover", function (e, d) {
          if (d3.select(this).selectAll("path").attr("fill") != "#F15E24") {
            d3.select(this).selectAll("path").attr("fill", "#ffffff");
          }

          tooltiptext.html(
            "<b>"+ d.age + "-jährige Frau, getötet am " + d.date +" in " + d.location + "</b><br><br>" +
            "Täter: " + d.perp + "<br>Urteil: " + d.verdict + "<br>Strafmaß: " + d.penalty + "<br><br>" + d.text
          );
          //Tooltipheight depends on text height:
          let tooltiptextHeight = tooltiptext.node().clientHeight;
          tooltipforeign.attr("height", tooltiptextHeight + 20);
          tooltipbg.attr("height", tooltiptextHeight + 40);

          // Tooltip Position:
          let a = d3.select(this).attr("transform").indexOf("scale"); // transform von iconGroup
          let transform = d3.select(this).attr("transform").slice(0, a);
          let transx = transform.split("(")[1].split(",")[0].replace(")", "");
          let transy = transform.split("(")[1].split(",")[1].replace(")", "");

          if (transx > svgWidth - 320) {
            transx = transx - 400;
          }
          if (transy > svgHeight - 300) {
            transy = svgHeight - 300;
          }
          tooltip.attr("transform", "translate(" + transx + "," + transy + ")");
          // Tooltip einblenden:
          tooltip.transition().duration(200).style("opacity", 1);
        });
        // mouseout:
        iconGroup.on("mouseout", function () {
          if (d3.select(this).selectAll("path").attr("fill") != "#F15E24") {
            d3.select(this).selectAll("path").attr("fill", "#bbbbbb");
          }

          tooltip.transition().duration(200).style("opacity", 0);
        });
        // for mobile
      } else {
        var mobWidth = this.svgWidth;
        iconGroup.on("click", function (e, d) {
          tooltip.transition().duration(200).style("opacity", 0);
          let a = d3.select(this).attr("transform").indexOf("scale");
          let transform = d3.select(this).attr("transform").slice(0, a);
          let transy = transform.split("(")[1].split(",")[1].replace(")", "");
          tooltip.attr("transform", "translate(-20," + transy + ")");
          tooltipbg.attr("width", mobWidth - 2);
          tooltipforeign.attr("width", mobWidth - 50);
          tooltiptext.attr("width", mobWidth - 30);
          tooltipclose.attr("transform", "translate(" + (mobWidth - 312) + ",0)");
          tooltipclose.style("opacity", 1).style("pointer-events", "auto");
          
          tooltiptext.html(
            "<b>"+ d.age + "-jährige Frau, getötet am " + d.date +" in " + d.location + "</b><br><br>" +
            "Täter: " + d.perp + "<br>Urteil: " + d.verdict + "<br>Strafmaß: " + d.penalty + "<br><br>" + d.text
          );
          // Tooltiptheight depends on textlength:
          let tooltiptextHeight = tooltiptext.node().clientHeight;
          tooltipforeign.attr("height", tooltiptextHeight + 20);
          tooltipbg.attr("height", tooltiptextHeight + 20);

          tooltip.transition().duration(200).style("opacity", 1);
          //iconGroup.style("pointer-events", "none");
        });

        tooltipclose.on("click", function (e) {
          iconGroup.style("pointer-events", "auto");
          tooltip.transition().duration(200).style("opacity", 0);
        });
      }
     
    },
  },
  mounted() {
    const jsonFilePath = process.env.VUE_APP_PUBLIC_PATH + "data/femizide.json";
    //const jsonFilePath = "data/femizide.json";
    this.svgWidth = document.getElementById("femizide").clientWidth;

    fetch(jsonFilePath) // fetch data and store
      .then((response) => response.json())
      .then((results) => {
        let arrObjects = [];
        let numChildren = 0;
        let numMorePersons = 0;
        for (let i = 1; i < results.length; i++) {
          let newObject = {
            [String(results[0][0])]: results[i][0],
            [String(results[0][1])]: results[i][1],
            [String(results[0][2])]: results[i][2],
            [String(results[0][3])]: results[i][3],
            [String(results[0][4])]: results[i][4],
            [String(results[0][5])]: results[i][5],
            [String(results[0][6])]: results[i][6],
            [String(results[0][7])]: results[i][7],
            [String(results[0][8])]: results[i][8],
            [String(results[0][9])]: results[i][9],
            [String(results[0][10])]: results[i][10],
          };
          arrObjects.push(newObject);
          numChildren = numChildren + results[i][8];
          numMorePersons = numMorePersons + results[i][9];
        }

        this.store = arrObjects;
        this.deathsTotal = arrObjects.length + numChildren + numMorePersons; // add Children and other Persons
        this.renderAllWomen(this.store); // render Women Icons
        this.getPerpCategorys();
        this.getVerdictCategorys();
        this.filterThisFirst("Mord");
        this.filterThisSecond("Ehemann");
      });
  },
  created() {
    this.resizeTimer = null;
    window.addEventListener("resize", this.handleResizeEnd);
  },
  destroyed() {
    window.removeEventListener("resize", this.handleResizeEnd);
  },
};
</script>
