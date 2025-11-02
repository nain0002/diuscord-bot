const HELP_TEXT_COLOR = [255, 255, 255, 200];

const toVector3 = (position) => new mp.Vector3(position.x, position.y, position.z);

const drawText = (text, position, font = 0, scale = [0.35, 0.35], color = HELP_TEXT_COLOR, center = true) => {
  mp.game.graphics.drawText(text, position, {
    scale,
    font,
    colour: color,
    outline: true,
    centre: center
  });
};

let blipHandles = [];
let markerHandles = [];
let territoryZones = [];
let shops = [];
let jobs = [];
let territories = [];
let activePrompt = null;
let activeJob = null;
let activeJobDefinition = null;
let jobProgressPending = false;

const clearWorldMarkers = () => {
  blipHandles.forEach((blip) => blip && blip.destroy());
  markerHandles.forEach((marker) => marker && marker.destroy());
  territoryZones.forEach((zone) => zone && zone.destroy());
  blipHandles = [];
  markerHandles = [];
  territoryZones = [];
};

const createBlip = (data, position) => {
  const blip = mp.blips.new(data.sprite || 1, toVector3(position), {
    name: data.name || 'Location',
    color: data.color != null ? data.color : 0,
    shortRange: true
  });
  blipHandles.push(blip);
  return blip;
};

const createMarker = (markerConfig, position) => {
  const marker = mp.markers.new(markerConfig?.type || 1, toVector3(position), markerConfig?.scale || 1.0, {
    color: markerConfig?.color || { r: 255, g: 255, b: 255, a: 100 }
  });
  markerHandles.push(marker);
  return marker;
};

const refreshWorld = (payload) => {
  clearWorldMarkers();
  shops = payload.shops || [];
  jobs = payload.jobs || [];
  territories = payload.territories || [];

  shops.forEach((shop) => {
    if (shop.blip) {
      createBlip({ ...shop.blip, name: shop.name }, shop.position);
    }
    if (shop.marker) {
      createMarker(shop.marker, shop.position);
    }
  });

  jobs.forEach((job) => {
    if (job.blip) {
      createBlip({ ...job.blip, name: job.name }, job.startPosition);
    }
    createMarker({ type: 1, scale: 1.0, color: { r: 77, g: 208, b: 225, a: 150 } }, job.startPosition);
  });

  territories.forEach((territory) => {
    const colshape = mp.colshapes.newCircle(territory.position.x, territory.position.y, territory.radius);
    colshape.customData = { type: 'territory', code: territory.code };
    territoryZones.push(colshape);
  });
};

const getDistance = (posA, posB) => {
  const dx = posA.x - posB.x;
  const dy = posA.y - posB.y;
  const dz = posA.z - posB.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

const detectPrompt = () => {
  const player = mp.players.local;
  const position = player.position;
  let prompt = null;

  const nearShop = shops.find((shop) => getDistance(position, shop.position) < 2.5);
  if (nearShop) {
    prompt = { type: 'shop', code: nearShop.code, label: `Press ~g~E~s~ to browse ${nearShop.name}` };
  }

  if (!prompt) {
    const nearJob = jobs.find((job) => getDistance(position, job.startPosition) < 3.0);
    if (nearJob) {
      prompt = { type: 'job', code: nearJob.code, label: `Press ~g~E~s~ to start ${nearJob.name}` };
    }
  }

  if (!prompt) {
    const nearTerritory = territories.find((territory) => getDistance(position, territory.position) < territory.radius);
    if (nearTerritory) {
      prompt = { type: 'territory', code: nearTerritory.code, label: 'Press ~g~E~s~ to capture territory' };
    }
  }

  activePrompt = prompt;
};

mp.events.add('render', () => {
  detectPrompt();

  if (activePrompt) {
    const { label } = activePrompt;
    drawText(label, [0.5, 0.88], 4, [0.45, 0.45], [255, 255, 255, 220], true);
  }

  if (activeJob && activeJobDefinition) {
    const routeIndex = activeJob.payload?.routeIndex || 0;
    const route = activeJobDefinition.route || [];
    if (route[routeIndex]) {
      const target = route[routeIndex];
      const position = new mp.Vector3(target.x, target.y, target.z);
      mp.game.graphics.drawMarker(1, position.x, position.y, position.z - 1.0, 0, 0, 0, 0, 0, 0, 1.5, 1.5, 1.5, 0, 200, 255, 120, false, false, 2, false, null, null, false);

      const distance = getDistance(mp.players.local.position, target);
      if (distance < 5 && !jobProgressPending) {
        jobProgressPending = true;
        mp.events.callRemote('job:progress');
      }
    }
  }
});

mp.keys.bind(0x45, true, () => {
  if (!activePrompt) return;
  if (mp.gui.cursor.visible) return;

  switch (activePrompt.type) {
    case 'shop':
      mp.events.callRemote('shop:list', JSON.stringify({ shopCode: activePrompt.code }));
      break;
    case 'job':
      mp.events.callRemote('job:start', JSON.stringify({ jobCode: activePrompt.code }));
      break;
    case 'territory':
      mp.events.callRemote('territory:capture', JSON.stringify({ code: activePrompt.code }));
      break;
    default:
      break;
  }
});

mp.events.add('gameplay:data', (payload) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  refreshWorld({
    shops: data.shops || [],
    jobs: data.jobs || [],
    territories: data.territories || []
  });
  territories = (data.territories || []).map((territory) => ({ ...territory }));
  shops = data.shops || [];
  jobs = data.jobs || [];
});

mp.events.add('gameplay:data:error', (payload) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  mp.gui.chat.push(`!{#ff4444}Gameplay sync failed: ${data.message}`);
});

mp.events.add('job:started', (payload) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  activeJob = data.job;
  activeJobDefinition = data.definition;
  jobProgressPending = false;
  if (activeJobDefinition?.route?.length) {
    const first = activeJobDefinition.route[0];
    mp.game.ui.setNewWaypoint(first.x, first.y);
  }
  mp.gui.chat.push(`!{#4dd0e1}Job ${activeJobDefinition?.name || ''} started. Follow the checkpoints!`);
});

mp.events.add('job:progress', (payload) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  activeJob = data.job;
  activeJobDefinition = data.definition;
  jobProgressPending = false;
  const index = data.job?.payload?.routeIndex;
  const route = activeJobDefinition?.route || [];
  if (route[index]) {
    mp.game.ui.setNewWaypoint(route[index].x, route[index].y);
  }
  mp.gui.chat.push('!{#4dd0e1}Checkpoint reached. Keep going!');
});

mp.events.add('job:completed', (payload) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  activeJob = null;
  activeJobDefinition = null;
  jobProgressPending = false;
  mp.gui.chat.push('!{#44ff44}Job complete! Payment processed.');
});

mp.events.add('job:abandoned', () => {
  activeJob = null;
  activeJobDefinition = null;
  jobProgressPending = false;
  mp.gui.chat.push('!{#ffcc00}Job abandoned.');
});

mp.events.add('shop:purchase:success', (payload) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  mp.gui.chat.push(`!{#81c784}Purchased ${data.item?.label || 'item'} successfully.`);
});

mp.events.add('job:error', (payload) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  jobProgressPending = false;
  mp.gui.chat.push(`!{#ff4444}Job error: ${data.message}`);
});

mp.events.add('shop:list', (payload) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  mp.gui.chat.push(`!{#81c784}${data.shop?.name || 'Shop'} inventory:`);
  (data.items || []).forEach((item) => {
    mp.gui.chat.push(
      ` - !{#ffffff}${item.label}!{#81c784} (${item.code}) for $${item.price}`
    );
  });
  mp.gui.chat.push('Use !{#81c784}/buy [shopCode] [itemCode]!{#ffffff} to purchase.');
});

mp.events.add('shop:purchase:error', (payload) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  mp.gui.chat.push(`!{#ff4444}Purchase failed: ${data.message}`);
});

mp.events.add('territory:capture:started', (payload) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  mp.gui.chat.push('!{#fbc02d}Capture initiated. Hold your ground!');
});

mp.events.add('territory:capture:error', (payload) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  mp.gui.chat.push(`!{#ff4444}Territory capture failed: ${data.message}`);
});

mp.events.add('territory:capture', (payload) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  if (data.territory) {
    territories = territories.map((territory) =>
      territory.code === data.territory.code ? { ...territory, owner_name: data.territory.owner_name } : territory
    );
  }
});

mp.events.add('job:setWaypoint', (positionJSON) => {
  try {
    const position = typeof positionJSON === 'string' ? JSON.parse(positionJSON) : positionJSON;
    if (position && position.x != null && position.y != null) {
      mp.game.ui.setNewWaypoint(position.x, position.y);
    }
  } catch (error) {
    mp.gui.chat.push('!{#ff4444}Failed to set waypoint.');
  }
});

mp.events.add('gameplay:territories:update', (payload) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  territories = data || territories;
});

// request initial data once the script loads (server may ignore if not logged in)
mp.events.callRemote('gameplay:requestData');
