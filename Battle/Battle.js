    class Battle {
        constructor({ enemy, onComplete }) {
            this.enemy = enemy;
            this.onComplete = onComplete;

            this.combatants = {
                // "player1": new Combatant({
                //     ...Creatures.s001,
                //     team: "player",
                //     hp: 150,
                //     maxHp: 200,
                //     xp: 95,
                //     maxXp: 100,
                //     level: 1,
                //     //status: null,
                //     status: { type: "empowered"},
                //     isPlayerControlled: true
                // }, this),
                // "player2": new Combatant({
                //     ...Creatures.s002,
                //     team: "player",
                //     hp: 150,
                //     maxHp: 150,
                //     xp: 0,
                //     maxXp: 100,
                //     level: 2,
                //     //status: null,
                //     status: null,
                //     isPlayerControlled: true
                // }, this),
                // "enemy1": new Combatant({
                //     ...Creatures.r001,
                //     team: "enemy",
                //     hp: 1,
                //     maxHp: 150,
                //     xp: 20,
                //     maxXp: 100,
                //     level: 2,
                //     status: null
                // }, this),
                // "enemy2": new Combatant({
                //     ...Creatures.b001,
                //     team: "enemy",
                //     hp: 1,
                //     maxHp: 200,
                //     xp: 50,
                //     maxXp: 50,
                //     level: 2,
                //     status: null
                // }, this)
            }

            this.activeCombatants = {
                player: null, //"player1",
                enemy: null, //"enemy1",
            }

            // Dynamically Add Player Team
            window.playerState.lineup.forEach(id => {
                this.addCombatant(id, "player", window.playerState.creatures[id])
            });           
            // Dynamically Add Enemy Team
            Object.keys(this.enemy.creatures).forEach(key => {
                this.addCombatant("e_"+key, "enemy", this.enemy.creatures[key])
            })

            this.items = []
            // Add in player items
            window.playerState.items.forEach(item => {
                this.items.push({
                    ...item,
                    team: "player"
                })
            })
            this.usedInstanceIds = {};
        }

        addCombatant(id, team, config) { 
                this.combatants[id] = new Combatant({
                    ...Creatures[config.creatureId],
                    ...config,
                    team,
                    isPlayerControlled: team === "player"
                }, this)
            this.activeCombatants[team] = this.activeCombatants[team] || id
        }

        createElement() {
            this.element = document.createElement("div");
            this.element.classList.add("Battle");
            this.element.innerHTML = (`
            <div class="Battle_hero">
                <img src="${'/WastelandChronicles/images/characters/people/hero.png'}" alt="Hero" />
            </div>
            <div class="Battle_enemy">
                <img src="${this.enemy.src}" alt="${this.enemy.name}" />
            </div>            
            `)
        }

        init(container) {
            this.createElement();
            container.appendChild(this.element);

            this.playerTeam = new Team("player", "Hero");
            this.enemyTeam = new Team("enemy", "Bob");

            Object.keys(this.combatants).forEach(key => {
                let combatant = this.combatants[key];
                combatant.id = key;
                combatant.init(this.element)

                if (combatant.team === "player") {
                    this.playerTeam.combatants.push(combatant);
                } else if (combatant.team === "enemy") {
                    this.enemyTeam.combatants.push(combatant);
                }
            })

            this.playerTeam.init(this.element);
            this.enemyTeam.init(this.element);

            this.turnCycle = new TurnCycle({
                battle: this,
                onNewEvent: event => {
                    return new Promise(resolve => {
                        const battleEvent = new BattleEvent(event, this)
                        battleEvent.init(resolve);
                    })
                },
                onWinner: winner => {
                    if (winner === "player") {
                        const playerState = window.playerState;
                        Object.keys(playerState.creatures).forEach(id => {
                            const playerStateCreature = playerState.creatures[id];
                            const combatant = this.combatants[id];
                            if (combatant) {
                                playerStateCreature.hp = combatant.hp;
                                playerStateCreature.xp = combatant.xp;
                                playerStateCreature.maxXp = combatant.maxXp;
                                playerStateCreature.level = combatant.level;
                            }
                        })
                        // Remove Used Items
                        playerState.items = playerState.items.filter(item => {
                            return !this.usedInstanceIds[item.instanceId]
                        })

                        utils.emitEvent("PlayerStateUpdated");

                    }
                    this.element.remove();
                    this.onComplete(winner === "player");
                }
            })
            this.turnCycle.init();
        }

    }