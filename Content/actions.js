window.Actions = {
    damage1: {
        name: "Light Attack!",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}" },
            { type: "animation", animation: "spin" },
            { type: "stateChange", damage: 5 }
        ]
    },
    damage2: {
        name: "Tornado Kick!",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}" },
            { type: "animation", animation: "spin" },
            { type: "stateChange", damage: 10 }
        ]
    },
    damage3: {
        name: "Fury Attack!",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}" },
            { type: "animation", animation: "spin" },
            { type: "stateChange", damage: 20 }
        ]
    },
    damage4: {
        name: "Upper Cut!!",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}" },
            { type: "animation", animation: "spin" },
            { type: "stateChange", damage: 40 }
        ]
    },
    bite: {
        name: "Bite!",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}" },
            { type: "animation", animation: "spin" },
            { type: "stateChange", damage: 50 }
        ]
    },    
    lick: {
        name: "Lick!",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}" },
            { type: "animation", animation: "glob", color: "#800080" },
            { type: "stateChange", damage: 10 },
            { type: "stateChange", status: { type: "weaken", expiresIn: 3 } },
            { type: "textMessage", text: "{TARGET} is taken back by {ACTION}." },
        ]
    },
    empoweredStatus: {
        name: "Light Blessing!",
        targetType: "friendly",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}" },
            { type: "stateChange", status: { type: "empowered", expiresIn: 3 } }
        ]
    },
    weakStatus: {
        name: "Dark Curse!",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}" },
            { type: "animation", animation: "glob", color: "#dafd2a" },
            { type: "stateChange", status: { type: "weaken", expiresIn: 2 } },
            { type: "textMessage", text: "{TARGET} is taken back by {ACTION}." },
        ]
    },

    //Items Section

    item_recoverStatus: {
        name: "Antidote!",
        description: "Remove All Status Effects...",
        targetType: "friendly",
        success: [
            { type: "textMessage", text: "{CASTER} uses a {ACTION}" },
            { type: "stateChange", status: null },
            { type: "textMessage", text: "{CASTER} has recovered from all status effects!", },
        ]
    },
    
    item_recoverHp: {
        name: "Small Health Potion!",
        description: "Recover Small Amount of Health...",
        targetType: "friendly",
        success: [
            { type: "textMessage", text: "{CASTER} uses a {ACTION}", },
            { type: "stateChange", recover: 10, },
            { type: "textMessage", text: "{CASTER} recovers 10 HP!", },
        ]
    }
}

