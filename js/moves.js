/**
 * moves.js — 團體戰最佳配招
 *
 * 每隻寶可夢列出攻擊向的前兩名配招（一般招式 + 特殊招式）。
 *
 * ── 資料怎麼來的 ──
 * 招式清單與數值取自 PokeMiners 的官方 game master，
 * 由循環 DPS 公式計算排名，不是抄某個網站的推薦清單：
 *
 *   每次特殊招式需要的一般招式次數 n = 特殊招式耗能 / 一般招式集能
 *   循環傷害 = n × 一般招式威力 + 特殊招式威力
 *   循環時間 = n × 一般招式時間 + 特殊招式時間
 *   DPS = 循環傷害 / 循環時間
 *
 * 屬性一致（STAB）時威力乘 1.2。計算採中性對戰，
 * 不考慮特定王的屬性相剋、也不考慮閃避。
 *
 * ── 招式名稱 ──
 * 三語名稱取自遊戲內官方翻譯檔，不是自行翻譯。
 *
 * ── 何時要更新 ──
 * Niantic 調整招式數值或新增傳授招式後，排名可能改變。
 * 重新執行產生流程即可，或手動修改下方資料。
 *
 * ef / ec = 該招式為「傳授招式」（需使用招式學習器）
 */

export const MOVES = {
  AEROBLAST: { zh:"氣旋攻擊", ja:"エアロブラスト", en:"Aeroblast", type:"flying" },
  AIR_SLASH_FAST: { zh:"空氣斬", ja:"エアスラッシュ", en:"Air Slash", type:"flying" },
  ASTONISH_FAST: { zh:"驚嚇", ja:"おどろかす", en:"Astonish", type:"ghost" },
  AURA_SPHERE: { zh:"波導彈", ja:"はどうだん", en:"Aura Sphere", type:"fighting" },
  BITE_FAST: { zh:"咬住", ja:"かみつく", en:"Bite", type:"dark" },
  BLEAKWIND_STORM: { zh:"枯葉風暴", ja:"こがらしあらし", en:"Bleakwind Storm", type:"flying" },
  BLIZZARD: { zh:"暴風雪", ja:"ふぶき", en:"Blizzard", type:"ice" },
  BRAVE_BIRD: { zh:"勇鳥猛攻", ja:"ブレイブバード", en:"Brave Bird", type:"flying" },
  BREAKING_SWIPE: { zh:"廣域破壞", ja:"ワイドブレイカー", en:"Breaking Swipe", type:"dragon" },
  BRUTAL_SWING: { zh:"狂舞揮打", ja:"ぶんまわす", en:"Brutal Swing", type:"dark" },
  BUG_BITE_FAST: { zh:"蟲咬", ja:"むしくい", en:"Bug Bite", type:"bug" },
  BUG_BUZZ: { zh:"蟲鳴", ja:"むしのさざめき", en:"Bug Buzz", type:"bug" },
  BULLET_SEED_FAST: { zh:"種子機關槍", ja:"タネマシンガン", en:"Bullet Seed", type:"grass" },
  CHARGE_BEAM_FAST: { zh:"充電光束", ja:"チャージビーム", en:"Charge Beam", type:"electric" },
  CLOSE_COMBAT: { zh:"近身戰", ja:"インファイト", en:"Close Combat", type:"fighting" },
  CONFUSION_FAST: { zh:"念力", ja:"ねんりき", en:"Confusion", type:"psychic" },
  COUNTER_FAST: { zh:"雙倍奉還", ja:"カウンター", en:"Counter", type:"fighting" },
  CRUSH_GRIP: { zh:"捏碎", ja:"にぎりつぶす", en:"Crush Grip", type:"normal" },
  DISCHARGE: { zh:"放電", ja:"ほうでん", en:"Discharge", type:"electric" },
  DOUBLE_KICK_FAST: { zh:"二連踢", ja:"にどげり", en:"Double Kick", type:"fighting" },
  DRACO_METEOR: { zh:"流星群", ja:"りゅうせいぐん", en:"Draco Meteor", type:"dragon" },
  DRAGON_BREATH_FAST: { zh:"龍息", ja:"りゅうのいぶき", en:"Dragon Breath", type:"dragon" },
  DRAGON_CLAW: { zh:"龍爪", ja:"ドラゴンクロー", en:"Dragon Claw", type:"dragon" },
  DRAGON_ENERGY: { zh:"巨龍威能", ja:"ドラゴンエナジー", en:"Dragon Energy", type:"dragon" },
  DRAGON_TAIL_FAST: { zh:"龍尾", ja:"ドラゴンテール", en:"Dragon Tail", type:"dragon" },
  DRILL_PECK: { zh:"啄鑽", ja:"ドリルくちばし", en:"Drill Peck", type:"flying" },
  DYNAMIC_PUNCH: { zh:"爆裂拳", ja:"ばくれつパンチ", en:"Dynamic Punch", type:"fighting" },
  EARTH_POWER: { zh:"大地之力", ja:"だいちのちから", en:"Earth Power", type:"ground" },
  EXTRASENSORY_FAST: { zh:"神通力", ja:"じんつうりき", en:"Extrasensory", type:"psychic" },
  FAIRY_WIND_FAST: { zh:"妖精之風", ja:"ようせいのかぜ", en:"Fairy Wind", type:"fairy" },
  FIRE_BLAST: { zh:"大字爆炎", ja:"だいもんじ", en:"Fire Blast", type:"fire" },
  FIRE_FANG_FAST: { zh:"火焰牙", ja:"ほのおのキバ", en:"Fire Fang", type:"fire" },
  FIRE_SPIN_FAST: { zh:"火焰旋渦", ja:"ほのおのうず", en:"Fire Spin", type:"fire" },
  FLASH_CANNON: { zh:"加農光炮", ja:"ラスターカノン", en:"Flash Cannon", type:"steel" },
  FLY: { zh:"飛翔", ja:"そらをとぶ", en:"Fly", type:"flying" },
  FOCUS_BLAST: { zh:"真氣彈", ja:"きあいだま", en:"Focus Blast", type:"fighting" },
  FROST_BREATH_FAST: { zh:"冰息", ja:"こおりのいぶき", en:"Frost Breath", type:"ice" },
  FURY_CUTTER_FAST: { zh:"連斬", ja:"れんぞくぎり", en:"Fury Cutter", type:"bug" },
  FUSION_BOLT: { zh:"交錯閃電", ja:"クロスサンダー", en:"Fusion Bolt", type:"electric" },
  FUSION_FLARE: { zh:"交錯火焰", ja:"クロスフレイム", en:"Fusion Flare", type:"fire" },
  FUTURESIGHT: { zh:"預知未來", ja:"みらいよち", en:"Future Sight", type:"psychic" },
  GEOMANCY_FAST: { zh:"大地掌控", ja:"ジオコントロール", en:"Geomancy", type:"fairy" },
  GIGA_IMPACT: { zh:"終極衝擊", ja:"ギガインパクト", en:"Giga Impact", type:"normal" },
  GLACIATE: { zh:"冰封世界", ja:"こごえるせかい", en:"Glaciate", type:"ice" },
  GRASS_KNOT: { zh:"打草結", ja:"くさむすび", en:"Grass Knot", type:"grass" },
  GUNK_SHOT: { zh:"垃圾射擊", ja:"ダストシュート", en:"Gunk Shot", type:"poison" },
  GUST_FAST: { zh:"起風", ja:"かぜおこし", en:"Gust", type:"flying" },
  HEAVY_SLAM: { zh:"重磅衝撞", ja:"ヘビーボンバー", en:"Heavy Slam", type:"steel" },
  HIDDEN_POWER_FAST: { zh:"覺醒力量", ja:"めざめるパワー", en:"Hidden Power", type:"normal" },
  HURRICANE: { zh:"暴風", ja:"ぼうふう", en:"Hurricane", type:"flying" },
  HYDRO_PUMP: { zh:"水炮", ja:"ハイドロポンプ", en:"Hydro Pump", type:"water" },
  HYPER_BEAM: { zh:"破壞光線", ja:"はかいこうせん", en:"Hyper Beam", type:"normal" },
  INCINERATE_FAST: { zh:"燒盡", ja:"やきつくす", en:"Incinerate", type:"fire" },
  IRON_HEAD: { zh:"鐵頭", ja:"アイアンヘッド", en:"Iron Head", type:"steel" },
  LEAF_BLADE: { zh:"葉刃", ja:"リーフブレード", en:"Leaf Blade", type:"grass" },
  LOCK_ON_FAST: { zh:"鎖定", ja:"ロックオン", en:"Lock-On", type:"normal" },
  MAGMA_STORM: { zh:"熔岩風暴", ja:"マグマストーム", en:"Magma Storm", type:"fire" },
  MAGNET_BOMB: { zh:"磁鐵炸彈", ja:"マグネットボム", en:"Magnet Bomb", type:"steel" },
  METAL_CLAW_FAST: { zh:"金屬爪", ja:"メタルクロー", en:"Metal Claw", type:"steel" },
  MIND_BLOWN: { zh:"炸裂頭錘", ja:"ビックリヘッド", en:"Mind Blown", type:"fire" },
  MOONBLAST: { zh:"月亮之力", ja:"ムーンフォース", en:"Moonblast", type:"fairy" },
  MUD_SHOT_FAST: { zh:"泥巴射擊", ja:"マッドショット", en:"Mud Shot", type:"ground" },
  NATURES_MADNESS: { zh:"自然之怒", ja:"しぜんのいかり", en:"Nature’s Madness", type:"fairy" },
  OBLIVION_WING: { zh:"死亡之翼", ja:"デスウイング", en:"Oblivion Wing", type:"flying" },
  ORIGIN_PULSE: { zh:"根源波動", ja:"こんげんのはどう", en:"Origin Pulse", type:"water" },
  OUTRAGE: { zh:"逆麟", ja:"げきりん", en:"Outrage", type:"dragon" },
  OVERHEAT: { zh:"過熱", ja:"オーバーヒート", en:"Overheat", type:"fire" },
  PLAY_ROUGH: { zh:"嬉鬧", ja:"じゃれつく", en:"Play Rough", type:"fairy" },
  POISON_JAB_FAST: { zh:"毒擊", ja:"どくづき", en:"Poison Jab", type:"poison" },
  POWER_UP_PUNCH: { zh:"增強拳", ja:"グロウパンチ", en:"Power-Up Punch", type:"fighting" },
  POWER_WHIP: { zh:"強力鞭打", ja:"パワーウィップ", en:"Power Whip", type:"grass" },
  PRECIPICE_BLADES: { zh:"斷崖之劍", ja:"だんがいのつるぎ", en:"Precipice Blades", type:"ground" },
  PSYCHIC: { zh:"精神強念", ja:"サイコキネシス", en:"Psychic", type:"psychic" },
  PSYCHO_CUT_FAST: { zh:"精神利刃", ja:"サイコカッター", en:"Psycho Cut", type:"psychic" },
  PSYSTRIKE: { zh:"精神擊破", ja:"サイコブレイク", en:"Psystrike", type:"psychic" },
  QUICK_ATTACK_FAST: { zh:"電光一閃", ja:"でんこうせっか", en:"Quick Attack", type:"normal" },
  RAZOR_LEAF_FAST: { zh:"飛葉快刀", ja:"はっぱカッター", en:"Razor Leaf", type:"grass" },
  ROCK_THROW_FAST: { zh:"落石", ja:"いわおとし", en:"Rock Throw", type:"rock" },
  SACRED_SWORD: { zh:"聖劍", ja:"せいなるつるぎ", en:"Sacred Sword", type:"fighting" },
  SANDSEAR_STORM: { zh:"熱沙風暴", ja:"ねっさのあらし", en:"Sandsear Storm", type:"ground" },
  SHADOW_BALL: { zh:"暗影球", ja:"シャドーボール", en:"Shadow Ball", type:"ghost" },
  SHADOW_CLAW_FAST: { zh:"暗影爪", ja:"シャドークロー", en:"Shadow Claw", type:"ghost" },
  SHADOW_FORCE: { zh:"暗影潛襲", ja:"シャドーダイブ", en:"Shadow Force", type:"ghost" },
  SLUDGE_BOMB: { zh:"污泥炸彈", ja:"ヘドロばくだん", en:"Sludge Bomb", type:"poison" },
  SLUDGE_WAVE: { zh:"污泥波", ja:"ヘドロウェーブ", en:"Sludge Wave", type:"poison" },
  SMACK_DOWN_FAST: { zh:"擊落", ja:"うちおとす", en:"Smack Down", type:"rock" },
  SNARL_FAST: { zh:"大聲咆哮", ja:"バークアウト", en:"Snarl", type:"dark" },
  SOLAR_BEAM: { zh:"日光束", ja:"ソーラービーム", en:"Solar Beam", type:"grass" },
  STEEL_WING_FAST: { zh:"鋼翼", ja:"はがねのつばさ", en:"Steel Wing", type:"steel" },
  STONE_EDGE: { zh:"尖石攻擊", ja:"ストーンエッジ", en:"Stone Edge", type:"rock" },
  SUCKER_PUNCH_FAST: { zh:"突襲", ja:"ふいうち", en:"Sucker Punch", type:"dark" },
  SUPER_POWER: { zh:"蠻力", ja:"ばかぢから", en:"Superpower", type:"fighting" },
  TECHNO_BLAST_BURN: { zh:"高科技光炮", ja:"テクノバスター", en:"Techno Blast", type:"fire" },
  TECHNO_BLAST_CHILL: { zh:"高科技光炮", ja:"テクノバスター", en:"Techno Blast", type:"ice" },
  TECHNO_BLAST_NORMAL: { zh:"高科技光炮", ja:"テクノバスター", en:"Techno Blast", type:"normal" },
  TECHNO_BLAST_SHOCK: { zh:"高科技光炮", ja:"テクノバスター", en:"Techno Blast", type:"electric" },
  TECHNO_BLAST_WATER: { zh:"高科技光炮", ja:"テクノバスター", en:"Techno Blast", type:"water" },
  THUNDER: { zh:"打雷", ja:"かみなり", en:"Thunder", type:"electric" },
  THUNDERBOLT: { zh:"十萬伏特", ja:"１０まんボルト", en:"Thunderbolt", type:"electric" },
  THUNDER_CAGE: { zh:"雷電囚籠", ja:"サンダープリズン", en:"Thunder Cage", type:"electric" },
  THUNDER_PUNCH: { zh:"雷電拳", ja:"かみなりパンチ", en:"Thunder Punch", type:"electric" },
  THUNDER_SHOCK_FAST: { zh:"電擊", ja:"でんきショック", en:"Thunder Shock", type:"electric" },
  TRIPLE_AXEL: { zh:"三旋擊", ja:"トリプルアクセル", en:"Triple Axel", type:"ice" },
  VOLT_SWITCH_FAST: { zh:"伏特替換", ja:"ボルトチェンジ", en:"Volt Switch", type:"electric" },
  WATERFALL_FAST: { zh:"攀瀑", ja:"たきのぼり", en:"Waterfall", type:"water" },
  WATER_GUN_FAST: { zh:"水槍", ja:"みずでっぽう", en:"Water Gun", type:"water" },
  WILDBOLT_STORM: { zh:"鳴雷風暴", ja:"かみなりあらし", en:"Wildbolt Storm", type:"electric" },
  WING_ATTACK_FAST: { zh:"翅膀攻擊", ja:"つばさでうつ", en:"Wing Attack", type:"flying" },
  ZAP_CANNON: { zh:"電磁炮", ja:"でんじほう", en:"Zap Cannon", type:"electric" },
  ZEN_HEADBUTT_FAST: { zh:"意念頭錘", ja:"しねんのずつき", en:"Zen Headbutt", type:"psychic" },};

export const BEST_MOVESETS = {
  p000: [{ f:"FROST_BREATH_FAST", c:"BLIZZARD" }, { f:"FROST_BREATH_FAST", c:"TRIPLE_AXEL" }],
  p001: [{ f:"THUNDER_SHOCK_FAST", c:"ZAP_CANNON", ef:1 }, { f:"THUNDER_SHOCK_FAST", c:"DRILL_PECK", ef:1 }],
  p002: [{ f:"FIRE_SPIN_FAST", c:"FLY" }, { f:"WING_ATTACK_FAST", c:"FLY" }],
  p003: [{ f:"CONFUSION_FAST", c:"PSYSTRIKE", ec:1 }, { f:"PSYCHO_CUT_FAST", c:"PSYSTRIKE", ec:1 }],
  p004: [{ f:"VOLT_SWITCH_FAST", c:"AURA_SPHERE" }, { f:"THUNDER_SHOCK_FAST", c:"AURA_SPHERE" }],
  p005: [{ f:"FIRE_SPIN_FAST", c:"OVERHEAT" }, { f:"FIRE_FANG_FAST", c:"OVERHEAT" }],
  p006: [{ f:"SNARL_FAST", c:"HYDRO_PUMP" }, { f:"WATER_GUN_FAST", c:"HYDRO_PUMP" }],
  p007: [{ f:"EXTRASENSORY_FAST", c:"AEROBLAST", ec:1 }, { f:"EXTRASENSORY_FAST", c:"FLY" }],
  p008: [{ f:"INCINERATE_FAST", c:"BRAVE_BIRD" }, { f:"EXTRASENSORY_FAST", c:"BRAVE_BIRD" }],
  p009: [{ f:"ROCK_THROW_FAST", c:"STONE_EDGE" }, { f:"ROCK_THROW_FAST", c:"ZAP_CANNON" }],
  p010: [{ f:"LOCK_ON_FAST", c:"BLIZZARD" }, { f:"FROST_BREATH_FAST", c:"BLIZZARD" }],
  p011: [{ f:"METAL_CLAW_FAST", c:"FLASH_CANNON" }, { f:"METAL_CLAW_FAST", c:"FOCUS_BLAST" }],
  p012: [{ f:"DRAGON_BREATH_FAST", c:"AURA_SPHERE" }, { f:"ZEN_HEADBUTT_FAST", c:"AURA_SPHERE" }],
  p013: [{ f:"DRAGON_BREATH_FAST", c:"AURA_SPHERE" }, { f:"ZEN_HEADBUTT_FAST", c:"AURA_SPHERE" }],
  p014: [{ f:"WATERFALL_FAST", c:"ORIGIN_PULSE", ec:1 }, { f:"WATERFALL_FAST", c:"HYDRO_PUMP" }],
  p015: [{ f:"DRAGON_TAIL_FAST", c:"PRECIPICE_BLADES", ec:1 }, { f:"MUD_SHOT_FAST", c:"PRECIPICE_BLADES", ec:1 }],
  p016: [{ f:"DRAGON_TAIL_FAST", c:"BREAKING_SWIPE", ec:1 }, { f:"DRAGON_TAIL_FAST", c:"OUTRAGE" }],
  p017: [{ f:"CONFUSION_FAST", c:"FUTURESIGHT" }, { f:"EXTRASENSORY_FAST", c:"FUTURESIGHT" }],
  p018: [{ f:"CONFUSION_FAST", c:"FUTURESIGHT" }, { f:"EXTRASENSORY_FAST", c:"FUTURESIGHT" }],
  p019: [{ f:"CONFUSION_FAST", c:"FUTURESIGHT" }, { f:"EXTRASENSORY_FAST", c:"FUTURESIGHT" }],
  p020: [{ f:"METAL_CLAW_FAST", c:"DRACO_METEOR" }, { f:"DRAGON_BREATH_FAST", c:"DRACO_METEOR" }],
  p021: [{ f:"METAL_CLAW_FAST", c:"DRACO_METEOR" }, { f:"DRAGON_BREATH_FAST", c:"DRACO_METEOR" }],
  p022: [{ f:"DRAGON_TAIL_FAST", c:"DRACO_METEOR" }, { f:"DRAGON_TAIL_FAST", c:"HYDRO_PUMP" }],
  p023: [{ f:"DRAGON_TAIL_FAST", c:"DRACO_METEOR" }, { f:"DRAGON_TAIL_FAST", c:"HYDRO_PUMP" }],
  p024: [{ f:"FIRE_SPIN_FAST", c:"MAGMA_STORM", ec:1 }, { f:"FIRE_SPIN_FAST", c:"FIRE_BLAST" }],
  p025: [{ f:"HIDDEN_POWER_FAST", c:"CRUSH_GRIP", ec:1 }, { f:"ZEN_HEADBUTT_FAST", c:"CRUSH_GRIP", ec:1 }],
  p026: [{ f:"DRAGON_BREATH_FAST", c:"SHADOW_FORCE", ec:1 }, { f:"SHADOW_CLAW_FAST", c:"SHADOW_FORCE", ec:1 }],
  p027: [{ f:"DRAGON_TAIL_FAST", c:"SHADOW_FORCE", ec:1 }, { f:"DRAGON_TAIL_FAST", c:"SHADOW_BALL" }],
  p028: [{ f:"CONFUSION_FAST", c:"FUTURESIGHT" }, { f:"CONFUSION_FAST", c:"GRASS_KNOT", ec:1 }],
  p029: [{ f:"DOUBLE_KICK_FAST", c:"SACRED_SWORD", ec:1 }, { f:"METAL_CLAW_FAST", c:"SACRED_SWORD", ec:1 }],
  p030: [{ f:"DOUBLE_KICK_FAST", c:"SACRED_SWORD", ec:1 }, { f:"SMACK_DOWN_FAST", c:"SACRED_SWORD", ec:1 }],
  p031: [{ f:"DOUBLE_KICK_FAST", c:"SACRED_SWORD", ec:1 }, { f:"QUICK_ATTACK_FAST", c:"SACRED_SWORD", ec:1 }],
  p032: [{ f:"AIR_SLASH_FAST", c:"GRASS_KNOT" }, { f:"AIR_SLASH_FAST", c:"HURRICANE" }],
  p033: [{ f:"GUST_FAST", c:"BLEAKWIND_STORM", ec:1 }, { f:"ASTONISH_FAST", c:"BLEAKWIND_STORM", ec:1 }],
  p034: [{ f:"THUNDER_SHOCK_FAST", c:"THUNDER" }, { f:"THUNDER_SHOCK_FAST", c:"THUNDER_PUNCH" }],
  p035: [{ f:"VOLT_SWITCH_FAST", c:"WILDBOLT_STORM", ec:1 }, { f:"BITE_FAST", c:"WILDBOLT_STORM", ec:1 }],
  p036: [{ f:"FIRE_FANG_FAST", c:"FUSION_FLARE", ec:1 }, { f:"FIRE_FANG_FAST", c:"DRACO_METEOR" }],
  p037: [{ f:"CHARGE_BEAM_FAST", c:"FUSION_BOLT", ec:1 }, { f:"DRAGON_BREATH_FAST", c:"FUSION_BOLT", ec:1 }],
  p038: [{ f:"MUD_SHOT_FAST", c:"EARTH_POWER" }, { f:"ROCK_THROW_FAST", c:"EARTH_POWER" }],
  p039: [{ f:"EXTRASENSORY_FAST", c:"SANDSEAR_STORM", ec:1 }, { f:"MUD_SHOT_FAST", c:"SANDSEAR_STORM", ec:1 }],
  p040: [{ f:"DRAGON_BREATH_FAST", c:"GLACIATE", ec:1 }, { f:"STEEL_WING_FAST", c:"GLACIATE", ec:1 }],
  p041: [{ f:"GEOMANCY_FAST", c:"GIGA_IMPACT", ef:1 }, { f:"GEOMANCY_FAST", c:"MOONBLAST", ef:1 }],
  p042: [{ f:"SNARL_FAST", c:"OBLIVION_WING", ec:1 }, { f:"GUST_FAST", c:"OBLIVION_WING", ec:1 }],
  p043: [{ f:"VOLT_SWITCH_FAST", c:"NATURES_MADNESS", ec:1 }, { f:"QUICK_ATTACK_FAST", c:"NATURES_MADNESS", ec:1 }],
  p044: [{ f:"CONFUSION_FAST", c:"NATURES_MADNESS", ec:1 }, { f:"ASTONISH_FAST", c:"NATURES_MADNESS", ec:1 }],
  p045: [{ f:"BULLET_SEED_FAST", c:"NATURES_MADNESS", ec:1 }, { f:"BULLET_SEED_FAST", c:"GRASS_KNOT" }],
  p046: [{ f:"WATER_GUN_FAST", c:"NATURES_MADNESS", ec:1 }, { f:"HIDDEN_POWER_FAST", c:"NATURES_MADNESS", ec:1 }],
  p047: [{ f:"ZEN_HEADBUTT_FAST", c:"SOLAR_BEAM" }, { f:"FIRE_SPIN_FAST", c:"SOLAR_BEAM" }],
  p048: [{ f:"CONFUSION_FAST", c:"SHADOW_BALL" }, { f:"CONFUSION_FAST", c:"PSYCHIC" }],
  p049: [{ f:"POISON_JAB_FAST", c:"SLUDGE_BOMB" }, { f:"POISON_JAB_FAST", c:"GUNK_SHOT" }],
  p050: [{ f:"COUNTER_FAST", c:"SUPER_POWER" }, { f:"COUNTER_FAST", c:"POWER_UP_PUNCH" }],
  p051: [{ f:"BUG_BITE_FAST", c:"FOCUS_BLAST" }, { f:"BUG_BITE_FAST", c:"BUG_BUZZ" }],
  p052: [{ f:"THUNDER_SHOCK_FAST", c:"DISCHARGE" }, { f:"THUNDER_SHOCK_FAST", c:"POWER_WHIP" }],
  p053: [{ f:"AIR_SLASH_FAST", c:"HEAVY_SLAM" }, { f:"AIR_SLASH_FAST", c:"IRON_HEAD" }],
  p054: [{ f:"FURY_CUTTER_FAST", c:"LEAF_BLADE" }, { f:"RAZOR_LEAF_FAST", c:"LEAF_BLADE" }],
  p055: [{ f:"SNARL_FAST", c:"BRUTAL_SWING" }, { f:"DRAGON_TAIL_FAST", c:"BRUTAL_SWING" }],
  p056: [{ f:"PSYCHO_CUT_FAST", c:"FUTURESIGHT" }, { f:"METAL_CLAW_FAST", c:"FUTURESIGHT" }],
  p057: [{ f:"POISON_JAB_FAST", c:"SLUDGE_BOMB" }, { f:"POISON_JAB_FAST", c:"SLUDGE_WAVE" }],
  p058: [{ f:"POISON_JAB_FAST", c:"SLUDGE_BOMB" }, { f:"POISON_JAB_FAST", c:"DRAGON_CLAW" }],
  p059: [{ f:"ROCK_THROW_FAST", c:"STONE_EDGE" }, { f:"ROCK_THROW_FAST", c:"FLASH_CANNON" }],
  p060: [{ f:"INCINERATE_FAST", c:"MIND_BLOWN", ec:1 }, { f:"ASTONISH_FAST", c:"MIND_BLOWN", ec:1 }],
  p061: [{ f:"SNARL_FAST", c:"PLAY_ROUGH" }, { f:"QUICK_ATTACK_FAST", c:"PLAY_ROUGH" }],
  p062: [{ f:"SNARL_FAST", c:"CLOSE_COMBAT" }, { f:"QUICK_ATTACK_FAST", c:"CLOSE_COMBAT" }],
  p063: [{ f:"COUNTER_FAST", c:"DYNAMIC_PUNCH" }, { f:"SUCKER_PUNCH_FAST", c:"DYNAMIC_PUNCH" }],
  p064: [{ f:"COUNTER_FAST", c:"DYNAMIC_PUNCH" }, { f:"WATERFALL_FAST", c:"DYNAMIC_PUNCH" }],
  p065: [{ f:"LOCK_ON_FAST", c:"THUNDER_CAGE", ec:1 }, { f:"THUNDER_SHOCK_FAST", c:"THUNDER_CAGE", ec:1 }],
  p066: [{ f:"DRAGON_BREATH_FAST", c:"DRAGON_ENERGY", ef:1, ec:1 }, { f:"BITE_FAST", c:"DRAGON_ENERGY", ec:1 }],
  p067: [{ f:"FAIRY_WIND_FAST", c:"FLY" }, { f:"ASTONISH_FAST", c:"FLY" }],
  p068: [{ f:"FAIRY_WIND_FAST", c:"FLY" }, { f:"EXTRASENSORY_FAST", c:"FLY" }],
  p069: [{ f:"ZEN_HEADBUTT_FAST", c:"HYPER_BEAM" }, { f:"ZEN_HEADBUTT_FAST", c:"THUNDERBOLT" }],
  p070: [{ f:"ZEN_HEADBUTT_FAST", c:"ZAP_CANNON" }, { f:"POISON_JAB_FAST", c:"ZAP_CANNON" }],
  p071: [{ f:"ZEN_HEADBUTT_FAST", c:"THUNDERBOLT" }, { f:"COUNTER_FAST", c:"THUNDERBOLT" }],
  p072: [{ f:"ZEN_HEADBUTT_FAST", c:"THUNDERBOLT" }, { f:"CHARGE_BEAM_FAST", c:"THUNDERBOLT" }],
  p073: [{ f:"SNARL_FAST", c:"SHADOW_BALL" }, { f:"SNARL_FAST", c:"FOCUS_BLAST" }],
  p074: [{ f:"METAL_CLAW_FAST", c:"TECHNO_BLAST_NORMAL", ec:1 }, { f:"METAL_CLAW_FAST", c:"MAGNET_BOMB" }],
  p075: [{ f:"METAL_CLAW_FAST", c:"TECHNO_BLAST_BURN", ec:1 }, { f:"METAL_CLAW_FAST", c:"MAGNET_BOMB" }],
  p076: [{ f:"METAL_CLAW_FAST", c:"TECHNO_BLAST_CHILL", ec:1 }, { f:"METAL_CLAW_FAST", c:"MAGNET_BOMB" }],
  p077: [{ f:"METAL_CLAW_FAST", c:"TECHNO_BLAST_WATER", ec:1 }, { f:"METAL_CLAW_FAST", c:"MAGNET_BOMB" }],
  p078: [{ f:"METAL_CLAW_FAST", c:"TECHNO_BLAST_SHOCK", ec:1 }, { f:"METAL_CLAW_FAST", c:"MAGNET_BOMB" }],};

/**
 * 取得某隻寶可夢的最佳配招
 * @returns {Array<{fast, charged, eliteFast, eliteCharged}>}
 */
export function movesetsFor(pokemonId, lang) {
  const sets = BEST_MOVESETS[pokemonId];
  if (!sets) return [];
  return sets.map((s) => {
    const f = MOVES[s.f];
    const c = MOVES[s.c];
    return {
      fast: f ? { name: f[lang] || f.en, type: f.type } : { name: s.f, type: "normal" },
      charged: c ? { name: c[lang] || c.en, type: c.type } : { name: s.c, type: "normal" },
      eliteFast: !!s.ef,
      eliteCharged: !!s.ec,
    };
  });
}
