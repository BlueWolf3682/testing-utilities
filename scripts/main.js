const teams = [Team.derelict, Team.sharded, Team.crux, Team.green, Team.purple, Team.blue];
const mainTeams = [0, 1, 2, 3, 4, 5];
const titleList = ["[#4d4e58]Derelict[]", "[accent]Sharded[]", "[#f25555]Crux[]", "[#54d67d]Green[]", "[#995bb0]Purple[]", "[#5a4deb]Blue[]"];
const abbreList = ["[#4d4e58]D[]", "[accent]S[]", "[#f25555]C[]", "[#54d67d]G[]", "[#995bb0]P[]", "[#5a4deb]B[]"];
var mode = 1;
var curTeam = Team.sharded;
const timers = new Interval(4);
var TCOffset =  Core.settings.getBool("mod-time-control-enabled", false) ? 64 : 0;

var folded = false;
const longPress = 30;

const healEffect = new Effect(60, e => {
  var rise = e.finpow() * 28;
  var opacity = Mathf.curve(e.fin(), 0, 0.2) - Mathf.curve(e.fin(), 0.9, 1);
  Draw.alpha(opacity);
  Draw.rect(Core.atlas.find("test-utils-heal"), e.x, e.y + rise);
});

const invincibilityEffect = new Effect(60, e => {
  var rise = e.finpow() * 28;
  var opacity = Mathf.curve(e.fin(), 0, 0.2) - Mathf.curve(e.fin(), 0.9, 1);
  Draw.alpha(opacity);
  Draw.rect(Core.atlas.find("test-utils-invincibility"), e.x, e.y + rise);
});

function addSingle(t, team, num, mobile){
  var b = new Button(Styles.logict);
  var h = 0;
  if(mobile){
    b.label(prov(() => (abbreList[teams.indexOf(team)])));
  }else{
    b.label(prov(() => (titleList[teams.indexOf(team)])));
  }
  
  b.clicked(() => {
    if(h > longPress) return;
    mode = num;
    curTeam = team;
    Vars.player.team(team);
  });
  
  b.update(() => {
    if(b.isPressed()){
      h += Core.graphics.getDeltaTime() * 60;
      if(h > longPress){
        folded = true;
      }
    }
    else{
      h = 0;
    }
  });
  return t.add(b).size(40, 40).color(team.color).pad(1);
}

function addMini(t, teamList, mobile){
  var b = new Button(Styles.logict);
  var h2 = 0;
  if(mobile){
    b.label(prov(() => (abbreList[teams.indexOf(curTeam)])));
  }else{
    b.label(prov(() => (titleList[teams.indexOf(curTeam)])));
  }
  
  b.clicked(() => {
    if(h2 > longPress) return;
    do{
      mode++;
      if(mode > teamList[teamList.length - 1]) mode = teamList[0];
    }while(teamList.indexOf(mode) == -1);
    curTeam = teams[mode];
    Vars.player.team(curTeam);
  });
  
  b.update(() => {
    if(b.isPressed()){
      h2 += Core.graphics.getDeltaTime() * 60;
      if(h2 > longPress) folded = false;
    }
    else{
      h2 = 0;
    }
    b.setColor(curTeam.color);
  });
  return t.add(b).size(40, 40).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}

function addKill(t, mobile){
  var b = new ImageButton(new TextureRegionDrawable(UnitTypes.gamma.icon(Cicon.full)), Styles.logici);
  b.style.down = Styles.flatDown;
  b.style.over = Styles.flatOver;
  b.style.disabled = Styles.black8;
  b.style.imageDisabledColor = Color.lightGray;
  b.style.imageUpColor = Color.white;
  
  var offset = mobile ? 0 : -5;
  b.style.pressedOffsetX = offset;
  b.style.unpressedOffsetX = offset;
  b.style.checkedOffsetX = offset;
  
  b.image(Core.atlas.find("test-utils-seppuku")).size(40).padLeft(-60);
  if(!mobile) b.label(prov(() => ("Seppuku"))).padLeft(-8);
  
  var h3 = 0;
  b.clicked(() => {
    if(h3 > longPress) return;
    var playerU = Vars.player.unit();
    var type = playerU.type;
    if(type != null){
      Effect.shake(type.hitSize / 1.5, Mathf.pow(type.hitSize, 3.5), playerU);
      Fx.dynamicExplosion.at(playerU.x, playerU.y, type.hitSize / 5);
    }
    playerU.elevation = 0;
    playerU.health = -1;
    playerU.dead = true;
    playerU.destroy(); // I n s t a n t l y    d i e
  });
  
  b.update(() => {
    if(b.isPressed()){
      h3 += Core.graphics.getDeltaTime() * 60;
      if(h3 > longPress && timers.get(0, 5) && Vars.player.unit() != null){
        var playerU = Vars.player.unit();
        var type = playerU.type;
        if(type != null){
          Effect.shake(type.hitSize / 1.5, Mathf.pow(type.hitSize, 3.5), playerU);
          Fx.dynamicExplosion.at(playerU.x, playerU.y, type.hitSize / 5);
        }
        playerU.elevation = 0;
        playerU.health = -1;
        playerU.dead = true;
        playerU.destroy(); // I n s t a n t l y    d i e
      }
    }
    else{
      h3 = 0;
    }
    b.setColor(curTeam.color);
    if(!Vars.player.unit().dead && Vars.player.unit().health > 0){
      if(timers.get(1, 20)){
        var kIcon = Vars.player.unit().type != null ? new TextureRegionDrawable(Vars.player.unit().type.icon(Cicon.full)) : Vars.ui.getIcon("cancel");
        b.style.imageUp = kIcon;
      }
    }
  });
  return t.add(b).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}

function addClone(t, mobile){
  var b = new ImageButton(Vars.ui.getIcon("units", "copy"), Styles.logici);
  b.style.down = Styles.flatDown;
  b.style.over = Styles.flatOver;
  b.style.disabled = Styles.black8;
  b.style.imageDisabledColor = Color.lightGray;
  b.style.imageUpColor = Color.white;
  
  var offset = mobile ? 0 : -4;
  b.style.pressedOffsetX = offset;
  b.style.unpressedOffsetX = offset;
  b.style.checkedOffsetX = offset;
  
  b.image(Core.atlas.find("test-utils-clone")).size(40).padLeft(-60);
  if(!mobile) b.label(prov(() => ("Clone"))).padLeft(-8);
  
  var h4 = 0;
  b.clicked(() => {
    if(h4 > longPress) return;
    if(Vars.player.unit().type != null){
      var unit = Vars.player.unit().type.create(Vars.player.team());
      Tmp.v1.rnd(Mathf.random(Vars.player.unit().type.hitSize * 3));
      
      unit.set(Vars.player.getX()+ Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);
      unit.rotation = Mathf.random(360);
      unit.add();
      Fx.spawn.at(Vars.player.getX()+ Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);
    }
  });
  
  b.update(() => {
    if(b.isPressed()){
      h4 += Core.graphics.getDeltaTime() * 60;
      if(h4 > longPress && timers.get(2, 5) && Vars.player.unit().type != null){
        var unit = Vars.player.unit().type.create(Vars.player.team());
        Tmp.v1.rnd(Mathf.random(Vars.player.unit().type.hitSize * 3));
        
        unit.set(Vars.player.getX()+ Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);
        unit.rotation = Mathf.random(360);
        unit.add();
        Fx.spawn.at(Vars.player.getX()+ Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);
      }
    }
    else{
      h4 = 0;
    }
    b.setColor(curTeam.color);
    if(!Vars.player.unit().dead && Vars.player.unit().health > 0){
      if(timers.get(3, 20)){
        var dIcon = Vars.player.unit().type != null ? new TextureRegionDrawable(Vars.player.unit().type.icon(Cicon.full)) : Vars.ui.getIcon("cancel");
        b.style.imageUp = dIcon;
      }
    }
  });
  return t.add(b).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}

function addHeal(t, mobile){
  var b = new ImageButton(Core.atlas.find("test-utils-heal"), Styles.logici);
  b.style.down = Styles.flatDown;
  b.style.over = Styles.flatOver;
  b.style.disabled = Styles.black8;
  b.style.imageDisabledColor = Color.lightGray;
  b.style.imageUpColor = Color.white;
  
  var offset = mobile ? 0 : -4;
  b.style.pressedOffsetX = offset;
  b.style.unpressedOffsetX = offset;
  b.style.checkedOffsetX = offset;
  
  if(!mobile){
    b.label(prov(() => ("Heal"))).padLeft(0);
  }
  
  b.clicked(() => {
    var player = Vars.player;
    player.unit().health = Vars.player.unit().maxHealth;
    healEffect.at(player.getX(), player.getY());
  });
  
  return t.add(b).color(Color.valueOf("84F491")).pad(1).padLeft(0).padRight(0);
}

function addInvincibility(t, mobile){
  var b = new ImageButton(Core.atlas.find("test-utils-invincibility"), Styles.logici);
  b.style.down = Styles.flatDown;
  b.style.over = Styles.flatOver;
  b.style.disabled = Styles.black8;
  b.style.imageDisabledColor = Color.lightGray;
  b.style.imageUpColor = Color.white;
  
  var offset = mobile ? 0 : -4;
  b.style.pressedOffsetX = offset;
  b.style.unpressedOffsetX = offset;
  b.style.checkedOffsetX = offset;
  
  if(!mobile){
    b.label(prov(() => ("\"Invincibility\""))).padLeft(0);
  }
  
  b.clicked(() => {
    var player = Vars.player;
    player.unit().health = Number.MAX_VALUE;
    invincibilityEffect.at(player.getX(), player.getY());
  });
  
  return t.add(b).color(Color.valueOf("F3E979")).pad(1).padLeft(0).padRight(0);
}

function addTable(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    if(Vars.mobile){
      for(var i = 0; i < teams.length; i++){
        addSingle(t, teams[i], i, true).width(24);
      }
    }else{
      var widths = [100, 100, 60, 68, 70, 60];
      for(var i = 0; i < teams.length; i++){
        addSingle(t, teams[i], i, false).width(widths[i]);
      }
    }
  })).padBottom(TCOffset);
  table.fillParent = true;
  var schem = Boolp(() => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty());
  table.visibility = () => !folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

function addMiniT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge1);
    if(Vars.mobile){
      addMini(t, mainTeams, true).width(24);
    }else{
      addMini(t, mainTeams, false).width(100);
    }
  })).padBottom(TCOffset);
  table.fillParent = true;
  var schem = Boolp(() => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty());
  table.visibility = () => folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

const mobileWidth = 56;
const iconWidth = 40;

function addSecondT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    if(Vars.mobile){
      addClone(t, true).size(mobileWidth, 40);
      addKill(t, true).size(mobileWidth, 40);
    }else{
      addClone(t, false).size(104, 40);
      addKill(t, false).size(140, 40);
    }
  })).padBottom((Vars.mobile ? 62 : 124) + TCOffset);
  table.fillParent = true;
  var schem = Boolp(() => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty());
  table.visibility = () => !folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

function addMiniSecondT(table){
  var healWidth = iconWidth * 2 + 20
  var xOff = healWidth + (Vars.mobile ? 44 : 120);
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    addClone(t, true).size(mobileWidth, 40);
    addKill(t, true).size(mobileWidth, 40);
  })).padBottom(TCOffset).padLeft(xOff);
  table.fillParent = true;
  var schem = Boolp(() => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty());
  table.visibility = () => folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

function addThirdT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    if(Vars.mobile){
      addHeal(t, true).size(iconWidth, 40);
      addInvincibility(t, true).size(iconWidth, 40);
    }else{
      addHeal(t, false).size(96, 40);
      addInvincibility(t, false).size(180, 40);
    }
  })).padBottom((Vars.mobile ? 124 : 62) + TCOffset);
  table.fillParent = true;
  var schem = Boolp(() => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty());
  table.visibility = () => !folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

function addMiniThirdT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.pane);
    addHeal(t, true).size(iconWidth, 40);
    addInvincibility(t, true).size(iconWidth, 40);
  })).padBottom(TCOffset).padLeft(Vars.mobile ? 44 : 120);
  table.fillParent = true;
  var schem = Boolp(() => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty());
  table.visibility = () => folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

if(!Vars.headless){
  var tt = new Table();
  var ktt = new Table();
  var mt = new Table();
  var mkt = new Table();
  var ht = new Table();
  var mht = new Table();
  
  Events.on(ClientLoadEvent, () => {
    tt.bottom().left();
    ktt.bottom().left();
    mt.bottom().left();
    mkt.bottom().left();
    ht.bottom().left();
    mht.bottom().left();
    addTable(tt);
    addSecondT(ktt);
    addMiniT(mt);
    addMiniSecondT(mkt);
    addThirdT(ht);
    addMiniThirdT(mht);
    Vars.ui.hudGroup.addChild(tt);
    Vars.ui.hudGroup.addChild(ktt);  
    Vars.ui.hudGroup.addChild(mt);
    Vars.ui.hudGroup.addChild(mkt); 
    Vars.ui.hudGroup.addChild(ht);
    Vars.ui.hudGroup.addChild(mht);
  });
  
  Events.on(WorldLoadEvent, () => {
    folded = false;
    curTeam = Vars.player.team();
    mode = teams.indexOf(curTeam);
  });
  
  Core.app.post(() => {
    const meta = Vars.mods.locateMod("test-utils").meta;
    meta.displayName = "[#FCC21B]Testing Utilities";
    meta.author = "[#FCC21B]MEEP of Faith";
    meta.description = "Utilities for testing stuff.\n\n[#FCC21B]Team Changer:[] Change teams easilty. Hold to collapse or expand the list.\n[#FCC21B]Seppuku Button:[] Instantly kill yourself. Press and hold to commit crawler.\n[#FCC21B]Clone Button:[] Instantly clones your player unit. Press and hold to mass clone.\n[#FCC21B]Heal Button:[] Resets your player unit's hp to its max.\n[#FCC21B]\"Invincibility\" Button:[] Sets your player unit's hp to 1000000."
  });
}
