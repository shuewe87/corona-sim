<template>
  <div id="app">
    <h2>{{ days }} Tage</h2>

    <div class="row">
      <div class="col col-button">
        <SimContainer
          :width="widthStr"
          :height="heightStr"
          v-bind:humans="humans"
          ref="simcontainer"
        />
      </div>
    </div>
    <div class="setting">
      <div class="row">
        <div class="col">Legende</div>
      </div>
      <div class="row">
        <div class="col col-help">
          <Human v-bind:cx="10" v-bind:cy="10" v-bind:health="100" v-bind:timeInfected="0" />
          <p>Nicht infiziert</p>
        </div>
        <div class="col col-help">
          <Human v-bind:cx="10" v-bind:cy="10" v-bind:health="0" v-bind:timeInfected="0" />
          <p>Krank</p>
        </div>
        <div class="col col-help">
          <Human v-bind:cx="10" v-bind:cy="10" v-bind:health="100" v-bind:timeInfected="10" />
          <p>Geheilt</p>
        </div>
        <div class="col col-help">
          <Human v-bind:cx="10" v-bind:cy="10" v-bind:health="-100" v-bind:timeInfected="10" />
          <p>Tod</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col col-button">
        <button :disabled="isDisabled" v-on:click="start(10)">10 Tage</button>
      </div>
      <div class="col col-button">
        <button :disabled="isDisabled" v-on:click="start(20)">20 Tage</button>
      </div>
      <div class="col col-button">
        <button :disabled="isDisabled" v-on:click="start(30)">30 Tage</button>
      </div>
    </div>
    <div class="setting">
      <div class="row">
        <div class="col">Antsteckungsrate</div>
      </div>
      <div class="row">
        <div class="col">
          <input type="radio" id="low" value="0.25" v-model="factor" />
          <label>Sehr Niedrig (0.25)</label>
        </div>
        <div class="col">
          <input type="radio" id="low" value="0.5" v-model="factor" />
          <label>Niedrig (0.5)</label>
        </div>
        <div class="col">
          <input type="radio" id="medium" value="0.75" v-model="factor" />
          <label>Mittel (0.75)</label>
        </div>
        <div class="col">
          <input type="radio" id="high" value="1" v-model="factor" />
          <label>Unverändert (1)</label>
        </div>
      </div>
    </div>
    <div class="row stats">
      <div class="col">
        <div class="stats-label">Infiziert:</div>
        <div
          class="stats-value"
        >{{ this.infected.length }} ({{ 100*this.infected.length / this.humans.length | formatDec }}%)</div>
      </div>
      <div class="col">
        <div class="stats-label">Geheilt:</div>
        <div
          class="stats-value"
        >{{ this.survived.length }} ({{ 100*this.survived.length / this.humans.length | formatDec }}%)</div>
      </div>
      <div class="col">
        <div class="stats-label">Tod:</div>
        <div
          class="stats-value"
        >{{ this.dead.length }} ({{ 100*this.dead.length / this.humans.length |formatDec }}%)</div>
      </div>
      <div class="col">
        <div class="stats-label">Grundvermehrungsrate r0:</div>
        <div class="stats-value">{{ this.maxAvgInfectRate/100 | formatDec }}</div>
      </div>
    </div>
    <div class="row">
      <div class="col col-button">
        <button :disabled="isDisabled" v-on:click="resetHumans()">Zurück setzen</button>
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
    var humanDens = 0.0045;
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

    this.timeStep = 0.5;

    return {
      humans: getHumansList(this.count, this.width, this.height),
      infected: [],
      healthy: [],
      dead: [],
      survived: [],
      widthStr: this.width + "px",
      heightStr: this.height + "px",
      days: 0,
      remSteps: 0,
      maxAvgInfectRate: 0,
      factor: 1
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
     /**Performs the next time step. */
    update: function() {
      this.days += this.timeStep;
      this.humansCopy = [];
      this.humans.forEach(human =>
        this.humansCopy.push(movedHuman(human, this.width, this.height))
      );
      this.populateLists();
      this.humansCopy.forEach(human => this.changeHealth(human));
      var newAvgInfectRate = this.getAvgAffect();
      if (newAvgInfectRate > this.maxAvgInfectRate) {
        this.maxAvgInfectRate = newAvgInfectRate;
      }
      this.humans = this.humansCopy;
    },
    /**
     * Change health of given human.<p>
     * Death rate: 0.7%
     * @property human to change health for
     */
    changeHealth: function(human) {
      if (isDead(human) || hasSurvived(human)) {
        return;
      }
      if (isHealthy(human)) {
        this.infected.forEach(infected =>
          infectHuman(human, infected, this.factor)
        );
      } else {
        human.timeInfected += this.timeStep;
        human.timeIll += -this.timeStep;
        if (human.timeIll < 0) {
          if (Math.random() > 0.007) {
            human.health = 100;
          } else {
            human.health = -100;
          }
        }
      }
    },
    /** Populate lists for healthy, infected, dead and survived people. */
    populateLists: function() {
      this.infected = [];
      this.healthy = [];
      this.dead = [];
      this.survived = [];
      for (var i = 0; i < this.humansCopy.length; i++) {
        if (isHealthy(this.humansCopy[i])) {
          this.healthy.push(this.humansCopy[i]);
          if (hasSurvived(this.humansCopy[i])) {
            this.survived.push(this.humansCopy[i]);
          }
        } else {
          if (isDead(this.humansCopy[i])) {
            this.dead.push(this.humansCopy[i]);
          } else {
            this.infected.push(this.humansCopy[i]);
          }
        }
      }
    },
    /**Gets the average affect of infected humans on others. */
    getAvgAffect: function() {
      if (this.survived.length < 20) {
        return 0;
      }
      var sanAffect = 0;
      this.survived.forEach(human => (sanAffect += human.affectedhealth));
      return sanAffect / this.survived.length;
    },
    /**
     * Starts the simulation for given number of days.<p>
     * @property days to be simulated
     */
    start: function(days) {
      this.remSteps = days / this.timeStep;
      setTimeout(this.run, 1);
    },
    /**Runs the simulation until remSteps == 0. */
    run: function() {
      this.update();
      this.remSteps += -1;
      if (this.remSteps > 0) {
        setTimeout(this.run, 1000);
      }
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
    /**Resets human list. */
    resetHumans: function() {
      this.humans = getHumansList(this.count, this.width, this.height);
      this.populateLists();
      this.days = 0;
    }
  },
  created: function() {
    this.humansCopy = this.humans;
    this.populateLists();
  }
};

/**
 * Creates the initial list of humans with 0.1% infected people.<p>
 * @property count The number of humans to be simulated
 * @property width The width of the enclosing div
 * @property height The height of the enclosing div
 */
function getHumansList(count, width, height) {
  var jsonArr = [];
  var oneInfected = false;
  for (var i = 0; i < count; i++) {
    var s = 100;
    if (Math.random() < 0.001) {
      s = 0;
      oneInfected = true;
    }
    jsonArr.push({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      timeInfected: 0,
      timeIll: 10 + (Math.random() - 0.5) * 5,
      health: s,
      dx: Math.random() * 10 - 5,
      dy: Math.random() * 10 - 5,
      affectedhealth: 0
    });
  }
  if (!oneInfected) {
    jsonArr[0].health = 0;
  }
  return jsonArr;
}

/**
 * Checks if given human is dead.<p>
 */
function isDead(human) {
  return human.health == -100;
}

/**
 * Checks if human has survived infect.<p>
 */
function hasSurvived(human) {
  return human.timeInfected > 0 && human.health == 100;
}

/**
 * The infect logic.<p>
 * Called for every infected human and affects given human, if distance is < 5 pixels.<p>
 * @property human The human to be infected
 * @property infected An infected human
 * @property probability to be infected (0..1) 0 -> no infection, 1 -> 100% will be infected
 */
function infectHuman(human, infected, probability) {
  if (
    Math.sqrt(
      (human.x - infected.x) * (human.x - infected.x) +
        (human.y - infected.y) * (human.y - infected.y)
    ) > 5
  ) {
    return;
  }
  if (Math.random() > probability) {
    return;
  }
  human.health = human.health - 50;
  infected.affectedhealth += 50;
  if (human.health <= 0) {
    human.health = 0;
  }
}

/**
 * Checks if human is healthy.<p>
 */
function isHealthy(human) {
  return human.health > 0;
}

/**
 * Move a human.<p>
 */
function movedHuman(human, maxWidth, maxHeight) {
  if (isDead(human)) {
    return human;
  }
  human.x = human.x + human.dx;
  human.y = human.y + human.dy;
  var changed = false;
  if (human.x < 0) {
    human.x = maxWidth;
    changed = true;
  }
  if (human.y < 0) {
    human.y = maxHeight;
    changed = true;
  }
  if (human.x > maxWidth) {
    human.x = 0;
    changed = true;
  }
  if (human.y > maxHeight) {
    human.y = 0;
    changed = true;
  }
  if (changed) {
    human.dx = human.dx * (1 + (Math.random() - 0.5) * 0.1);
    human.dy = human.dy * (1 + (Math.random() - 0.5) * 0.1);
  }
  return human;
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
