module.exports = {
  spawnPoints: [
    { x: -425.517, y: 1123.62, z: 325.854, heading: 90 },
    { x: -1034.62, y: -2732.53, z: 13.77, heading: 60 },
    { x: -75.34, y: -818.49, z: 326.17, heading: 180 },
    { x: 152.18, y: -1040.57, z: 29.37, heading: 0 },
    { x: -550.12, y: -206.56, z: 38.23, heading: 270 },
    { x: 721.46, y: -967.23, z: 24.13, heading: 135 },
    { x: -1147.22, y: -1602.63, z: 4.4, heading: 45 }
  ],

  shops: [
    {
      code: 'ls_grocery_1',
      name: 'Downtown Convenience',
      blip: { sprite: 52, color: 2 },
      marker: { type: 1, scale: 1.2, color: { r: 0, g: 255, b: 128, a: 128 } },
      position: { x: 373.875, y: 326.91, z: 103.566 },
      items: [
        { code: 'water', label: 'Bottle of Water', price: 15, stackable: true, quantity: 1 },
        { code: 'sandwich', label: 'Sandwich', price: 35, stackable: true, quantity: 1 },
        { code: 'medkit', label: 'Med Kit', price: 250, stackable: false, quantity: 1 }
      ]
    },
    {
      code: 'ls_weapon_1',
      name: 'Paleto Ammu-Nation',
      blip: { sprite: 110, color: 1 },
      marker: { type: 1, scale: 1.2, color: { r: 255, g: 64, b: 64, a: 128 } },
      position: { x: -331.351, y: 6084.613, z: 31.454 },
      items: [
        { code: 'pistol_ammo', label: 'Pistol Ammo (x30)', price: 500, stackable: true, quantity: 1 },
        { code: 'armor_light', label: 'Light Armor', price: 750, stackable: false, quantity: 1 }
      ]
    }
  ],

  jobs: [
    {
      code: 'courier',
      name: 'Courier',
      description: 'Deliver packages around the city.',
      startPosition: { x: 82.84, y: -1961.66, z: 20.94 },
      blip: { sprite: 478, color: 46 },
      payment: { cash: 250, bank: 50 },
      route: [
        { x: -297.23, y: -1355.67, z: 31.3 },
        { x: 428.56, y: -806.21, z: 29.5 },
        { x: -712.25, y: -911.32, z: 19.02 }
      ]
    },
    {
      code: 'taxi',
      name: 'Taxi Driver',
      description: 'Pick up citizens and drop them off at destinations.',
      startPosition: { x: 903.24, y: -174.36, z: 74.08 },
      blip: { sprite: 198, color: 46 },
      payment: { cash: 350, bank: 100 },
      route: [
        { x: -41.32, y: -1098.52, z: 26.42 },
        { x: 256.41, y: -375.92, z: 44.08 },
        { x: 1200.52, y: -1275.13, z: 35.23 }
      ]
    }
  ],

  territories: [
    {
      code: 'los_santos_docks',
      name: 'Los Santos Docks',
      position: { x: -179.13, y: -2470.42, z: 6.0 },
      radius: 120,
      color: { r: 255, g: 165, b: 0 },
      rewardCash: 500,
      captureTime: 120
    },
    {
      code: 'vinewood_hills',
      name: 'Vinewood Hills',
      position: { x: -560.12, y: 619.21, z: 137.0 },
      radius: 150,
      color: { r: 64, g: 196, b: 255 },
      rewardCash: 650,
      captureTime: 150
    },
    {
      code: 'sandy_shores',
      name: 'Sandy Shores',
      position: { x: 1849.32, y: 3691.23, z: 33.27 },
      radius: 160,
      color: { r: 154, g: 205, b: 50 },
      rewardCash: 600,
      captureTime: 140
    }
  ]
};
