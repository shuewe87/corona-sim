<template>
  <div id="app">
    <h2>{{ i18nNumberString("days",days) }}</h2>

    <div class="row">
      <div class="col col-button">
        <SimContainer
          :width="widthStr"
          :height="heightStr"
          v-bind:humans="humans"
          v-bind:radius="radius*Math.sqrt(factor)*Math.sqrt(scaleHuman)"
          ref="simcontainer"
        />
      </div>
    </div>
    <div id="settings-and-stats">
      <div class="row stats withIcon">
        <div class="col">
          <div class="stats-label">
            <Human
              v-bind:cx="10"
              v-bind:cy="10"
              v-bind:health="100"
              v-bind:timeInfected="0"
              v-bind:radius="5"
            />
            <p>{{ $t("status.notInfected") }}</p>
          </div>
          <div
            class="stats-value"
          >{{ this.humans.length - this.infected.length - this.survived.length - this.dead.length }} ({{ 100*(this.humans.length - this.infected.length - this.survived.length - this.dead.length) / this.humans.length | formatDec }}%)</div>
        </div>
        <div class="col">
          <div class="stats-label">
            <Human
              v-bind:cx="10"
              v-bind:cy="10"
              v-bind:health="0"
              v-bind:timeInfected="10"
              v-bind:radius="5"
            />
            <p>{{ $t("status.ill") }}</p>
          </div>
          <div
            class="stats-value"
          >{{ this.infected.length }} ({{ 100*this.infected.length / this.humans.length | formatDec }}%)</div>
        </div>
        <div class="col">
          <div class="stats-label">
            <Human
              v-bind:cx="10"
              v-bind:cy="10"
              v-bind:health="100"
              v-bind:timeInfected="10"
              v-bind:radius="5"
            />
            <p>{{ $t("status.survived") }}</p>
          </div>
          <div
            class="stats-value"
          >{{ this.survived.length }} ({{ 100*this.survived.length / this.humans.length | formatDec }}%)</div>
        </div>
        <div class="col">
          <div class="stats-label">
            <Human
              v-bind:cx="10"
              v-bind:cy="10"
              v-bind:health="-100"
              v-bind:timeInfected="10"
              v-bind:radius="5"
            />
            <p>{{ $t("status.dead") }}</p>
          </div>
          <div
            class="stats-value"
          >{{ this.dead.length }} ({{ 100*this.dead.length / this.humans.length |formatDec }}%)</div>
        </div>
      </div>
      <div class="row stats">
        <div class="col">
          <div class="stats-label">{{ $t("maxInfected") }}</div>
          <div class="stats-value">{{ this.maxInfectedRate | formatDec }}%</div>
        </div>
        <div class="col">
          <div class="stats-label">{{ $t("avgAffect") }}</div>
          <div class="stats-value">{{ this.getAvgAffect()/100 | formatDec }}</div>
        </div>
      </div>
      <div class="row">
        <div class="col col-button">
          <button :disabled="isDisabled" v-on:click="start(1)">{{ $t("days",[1]) }}</button>
        </div>
        <div class="col col-button">
          <button :disabled="isDisabled" v-on:click="start(5)">{{ $t("days",[5]) }}</button>
        </div>
        <div class="col col-button">
          <button :disabled="isDisabled" v-on:click="start(10)">{{ $t("days",[10]) }}</button>
        </div>
        <div class="col col-button">
          <button :disabled="isDisabled" v-on:click="start(20)">{{ $t("days",[20]) }}</button>
        </div>
      </div>
      <div class="setting">
        <div class="row">
          <div class="col">{{ $t("infectionRate.title") }}</div>
        </div>
        <div class="row">
          <div class="col">
            <input type="radio" id="low" value="0.25" v-model="factor" />
            <label>{{ $t("infectionRate.veryLow",[0.25]) }}</label>
          </div>
          <div class="col">
            <input type="radio" id="low" value="0.5" v-model="factor" />
            <label>{{ $t("infectionRate.low",[0.5]) }}</label>
          </div>
          <div class="col">
            <input type="radio" id="medium" value="0.75" v-model="factor" />
            <label>{{ $t("infectionRate.medium",[0.75]) }}</label>
          </div>
          <div class="col">
            <input type="radio" id="high" value="1" v-model="factor" />
            <label>{{ $t("infectionRate.initial",[1]) }}</label>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col col-button">
          <button :disabled="isDisabled" v-on:click="resetHumans()">{{ $t("reset") }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SimContainer from "./components/SimContainer.vue";
import Human from "./components/Human.vue";

export default {
  name: "App",
  components: {
    SimContainer,
    Human
  },
  data: function() {
    console.log("simWidth");
    var w = 800;
    if (window.simWidth != undefined) {
      w = window.simWidth;
    }
    console.log(w);
    var ratio = 1;
    var r0 = 3;
    if (window.r0 != undefined) {
      r0 = window.r0;
    }
    var humanDens = 0.00075;
    if (window.humanDense != undefined) {
      humanDens = window.humanDense;
    }

    this.setVars();
    var radi = getRadius(r0, 5, this.timeStep, humanDens); //0.0035 //0.0045
    this.handleResize();
    console.log("Window size");
    console.log(this.width);
    if (this.width > w) {
      this.width = w;
    }
    if (this.width < w) {
      ratio = (1 * w) / this.width;
      console.log("ratio");
      console.log(ratio);
    }

    this.height = this.width * ratio;
    this.count = humanDens * this.height * this.width;
    console.log("Count:");
    console.log(this.count);
    console.log("Density:");
    console.log(this.count / (this.width * this.height));
    console.log("Width: " + this.width + ", Height: " + this.height);

    var humanList = getHumansList(
      this.count,
      this.width,
      this.height,
      radi,
      this.timeStep,
      this.initialRate
    );

    return {
      humans: humanList,
      infected: [],
      neverInfected: [],
      healthy: [],
      infectable: [],
      dead: [],
      survived: [],
      widthStr: this.width + "px",
      heightStr: this.height + "px",
      days: 0,
      remSteps: 0,
      maxAvgInfectRate: 0,
      maxInfectedRate: 0,
      factor: 1,
      radius: radi
    };
  },
  computed: {
    isDisabled: function() {
      return this.remSteps > 0;
    }
  },
  filters: {
    formatDec: function(value) {
      var numeral = require("numeral");
      return numeral(value).format("0.0");
    }
  },
  methods: {
    /**
     * Calculates the distance between two humans.<p>
     * 
     * @param human1
     * @param human2
     */
    calcDistance: function(human1, human2) {
      return Math.sqrt(
        (human1.x - human2.x) * (human1.x - human2.x) +
          (human1.y - human2.y) * (human1.y - human2.y)
      );
    },
    /**
     * Change health of given human.<p>
     * Death rate: 0.7%
     * @param human to change health for
     */
    changeHealthy: function(human) {
      if (window.debugInfect) {
        console.log("Change health of " + human.id);
      }
      if (isDead(human) || hasSurvived(human) || !isHealthy(human)) {
        if (window.debugInfect) {
          console.log("skip because dead or immun.. should never be reached");
        }
        return;
      }
      if (window.debugInfect) {
        console.log("Iterate over infected..");
      }
      this.infectable.forEach(
        infected => this.infectHuman(human, infected) //Checks timeInfected (ignored if timeInfected < 4)
      );
    },
    /**
     * Change health of given human.<p>
     * Death rate: 0.7%
     * @param human to change health for
     */
    changeInfected: function(human) {
      if (window.debugInfect) {
        console.log("Change health of " + human.id);
      }
      if (isDead(human) || hasSurvived(human) || isHealthy(human)) {
        return;
      }

      if (window.debugInfect) {
        console.log("change infected");
      }
      if (human.timeIll <= this.timeStep) {
        if (Math.random() > 0.007) {
          human.health = 100;
        } else {
          human.health = -100;
        }
      }
      human.timeInfected += this.timeStep;
      human.timeIll += -this.timeStep;
    },
    /**Gets the average affect of infected humans on others. */
    getAvgAffect: function() {
      if (this.survived.length == 0) {
        return 0;
      }
      var sanAffect = 0;
      this.survived.forEach(human => (sanAffect += human.affectedhealth));
      this.dead.forEach(human => (sanAffect += human.affectedhealth));
      return sanAffect / (this.survived.length + this.dead.length);
    },
    getHumanById: function(id) {
      for (var i = 0; this.humans; i++) {
        if (this.humans[i].id == id) {
          return this.humans[i];
        }
      }
      return {};
    },
    /**Sets the available width from window size or js variable (set outside of App). */
    handleResize() {
      if (window.maxWinWidth != undefined) {
        this.width = window.maxWinWidth;
        this.height = this.width;
      } else {
        this.width = window.innerWidth - 20;
        this.height = window.innerHeight - 20;
      }
    },
    /**
     * Formats a i18n key with given number value.<p>
     * 
     * @param key to be resolved in i18n
     * @param val number value to be formatted
     */
    i18nNumberString: function(key, val) {
      var numeral = require("numeral");
      var res = numeral(val).format("0.0");
      return this.$t(key, [res]);
    },
    /**
     * The infect logic.<p>
     * Called for every infected human and affects given human, if distance is < 5 pixels.<p>
     * @param human The human to be infected
     * @param infected An infected human
     * @param probability to be infected (0..1) 0 -> no infection, 1 -> 100% will be infected
     */
    infectHuman: function(human, infected) {
      if (window.debugInfect) {
        console.log(
          "Try infect " +
            human.id +
            " from " +
            infected.id +
            " (timeInf: " +
            infected.timeInfected +
            ")"
        );
      }
      if (!isInfectable(infected)) {
        return;
      }
      if (
        this.calcDistance(human, infected) >
        2 * this.radius * Math.sqrt(this.factor)
      ) {
        if (window.debugInfect) {
          console.log(
            "not infected. Dist: " +
              Math.sqrt(
                (human.x - infected.x) * (human.x - infected.x) +
                  (human.y - infected.y) * (human.y - infected.y)
              )
          );
          console.log(
            "Infected id: " + human.id + " (" + human.x + ", " + human.y + ")"
          );
        }
        return;
      }
      if (window.debugInfect) {
        console.log("infect!");
      }
      if (!isHealthy(human)) {
        console.log("Double infect");
        return;
      }
      human.health = human.health - 100;
      infected.affectedhealth += 100;
      if (human.health <= 0) {
        human.health = 0;
      }
    },
    /** Populate lists for healthy, infected, dead and survived people. */
    populateLists: function() {
      this.infected.length = 0;
      this.infectable.length = 0;
      this.healthy.length = 0;
      this.dead.length = 0;
      this.survived.length = 0;
      this.neverInfected.length = 0;
      for (var i = 0; i < this.humans.length; i++) {
        if (isHealthy(this.humans[i])) {
          this.healthy.push(this.humans[i]);
          if (hasSurvived(this.humans[i])) {
            this.survived.push(this.humans[i]);
          } else {
            this.neverInfected.push(this.humans[i]);
          }
        } else {
          if (isDead(this.humans[i])) {
            this.dead.push(this.humans[i]);
          } else {
            this.infected.push(this.humans[i]);
            if (isInfectable(this.humans[i])) {
              this.infectable.push(this.humans[i]);
            }
          }
        }
      }
    },
    /**Runs the simulation until remSteps == 0. */
    run: function() {
      var startTime = Date.now();
      this.update();
      this.remSteps += -1;
      var endTime = Date.now();
      var waitTime = 700 - (endTime - startTime);
      if (waitTime < 0) {
        waitTime = 0;
      }
      console.log("Time to wait between frames " + waitTime);
      if (this.remSteps > 0) {
        setTimeout(this.run, waitTime);
      }
    },
    /**Resets human list. */
    resetHumans: function() {
      this.maxInfectedRate = 0;
      this.infected.length = 0;
      this.healthy.length = 0;
      this.infectable.length = 0;
      this.dead.length = 0;
      this.survived.length = 0;
      this.setVars();
      this.humans = getHumansList(
        this.count,
        this.width,
        this.height,
        this.radius,
        this.timeStep,
        this.initialRate
      );
      this.populateLists();
      this.days = 0;
      this.maxAvgInfectRate = 0;
    },
    setVars: function() {
      this.initialRate = 0.005;
      if (window.initialRate != undefined) {
        this.initialRate = window.initialRate;
      }

      this.scaleHuman = 1;

      if (window.scaleHuman != undefined) {
        this.scaleHuman = window.scaleHuman;
      }
      this.timeStep = 0.333;
      if (window.timeStep != undefined) {
        this.timeStep = window.timeStep;
      }
    },
    /**
     * Starts the simulation for given number of days.<p>
     * @param days to be simulated
     */
    start: function(days) {
      this.remSteps = days / this.timeStep;
      setTimeout(this.run, 1);
    },
    /**Performs the next time step. */
    update: function() {
      this.humans.forEach(human => moveHuman(human, this.width, this.height));
      this.neverInfected.forEach(human => this.changeHealthy(human));
      this.infected.forEach(human => this.changeInfected(human));

      var newAvgInfectRate = this.getAvgAffect();
      if (newAvgInfectRate > this.maxAvgInfectRate) {
        this.maxAvgInfectRate = newAvgInfectRate;
      }
      var newInfectedRate = (100 * this.infected.length) / this.humans.length;
      if (newInfectedRate > this.maxInfectedRate) {
        this.maxInfectedRate = newInfectedRate;
      }

      this.days += this.timeStep;
      this.populateLists();
      if (window.debug) {
        console.log("Time: " + this.days);
        console.log("Infected: " + this.infected.length);
        console.log("Survived: " + this.survived.length);
        console.log("Dead: " + this.dead.length);
      }
    }
  },
  created: function() {
    this.populateLists();
  }
};



/**
 * Creates the initial list of humans with 0.1% infected people.<p>
 * @param count The number of humans to be simulated
 * @param width The width of the enclosing div
 * @param height The height of the enclosing div
 */
function getHumansList(count, width, height, radius, timeStep, initialRate) {
  var jsonArr = [];
  var oneInfected = false;
  for (var i = 0; i < count; i++) {
    var s = 100;
    if (Math.random() < initialRate) {
      s = 0;
      oneInfected = true;
    }
    var sigmaX = Math.random() > 0.5 ? 1 : -1;
    var sigmaY = Math.random() > 0.5 ? 1 : -1;
    jsonArr.push({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      timeInfected: 0,
      timeIll: 9 + (Math.random() - 0.5) * 1,
      health: s,
      dx: 25 * (sigmaX * radius * timeStep + (Math.random() - 0.5)),
      dy: 25 * (sigmaY * radius * timeStep + (Math.random() - 0.5)),
      affectedhealth: 0
    });
  }
  if (!oneInfected) {
    jsonArr[0].health = 0;
  }
  return jsonArr;
}



/**
 * Calculates a radius for humans to realize the given infection rate r0.<p>
 * 
 * @param r0 infection rate
 * @param infectedTime time a human can infect other people
 * @param timeStep time step
 * @param dens dense of humans
 */
function getRadius(r0, infectedTime, timeStep, dens) {
  var timeSteps = infectedTime / timeStep;
  return Math.sqrt(r0 / (timeSteps * dens * 4 * Math.PI));
}

/**
 * Checks if human has survived infect.<p>
 * 
 * @param human the human to check
 */
function hasSurvived(human) {
  return human.timeInfected > 0 && human.health == 100;
}

/**
 * Checks if given human is dead.<p>
 * 
 * @param human the human to check
 */
function isDead(human) {
  return human.health == -100;
}

/**
 * Checks if human is healthy.<p>
 * 
 * @param human the human to check
 */
function isHealthy(human) {
  return human.health > 0;
}

/**
 * Checks if human is infectable.<p>
 * 
 * @param human the human to check
 */
function isInfectable(human) {
  return human.timeInfected >= 4;
}

/**
 * Move a human.<p>
 * 
 * @param maxWidth maxWidth in simulation
 * @param maxHeight maxHeight in simulation
 */
function moveHuman(human, maxWidth, maxHeight) {
  if (isDead(human)) {
    return;
  }
  human.x = human.x + human.dx;
  human.y = human.y + human.dy;
  if (human.x < 0) {
    human.x = maxWidth + human.x;
  }
  if (human.y < 0) {
    human.y = maxHeight + human.y;
  }
  if (human.x > maxWidth) {
    human.x = maxWidth - human.x;
  }
  if (human.y > maxHeight) {
    human.y = maxHeight - human.y;
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  margin-left: 0px;
  margin-right: 0px;
  width: 100%;
  display: inline-block;
  text-align: center;
}
button {
  padding: 10px;
  background-color: gray;
  width: 200px;
  margin: 10px;
  float: left;
  cursor: pointer;
}

.col-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

button:disabled {
  cursor: none;
  background-color: lightgray;
}

.stats .col {
  background-color: lightgray;
  margin: 10px;
  padding: 10px;
}

.stats.withIcon .stats-label p {
  padding-left: 20px;
}
.col-help {
  position: relative;
  width: 200px;
}

.col-help p {
  padding-left: 20px;
}
.setting {
  background-color: lightgray;
  padding: 10px 0px;
  margin: 10px 0px;
}
</style>

