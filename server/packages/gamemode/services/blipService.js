const buildBlipService = ({ config }) => {
  const shops = config.shops || [];
  const jobs = config.jobs || [];
  const territories = config.territories || [];

  const getBlipPayload = () => ({
    shops: shops.map((shop) => ({
      code: shop.code,
      name: shop.name,
      position: shop.position,
      blip: shop.blip,
      marker: shop.marker
    })),
    jobs: jobs.map((job) => ({
      code: job.code,
      name: job.name,
      description: job.description,
      startPosition: job.startPosition,
      blip: job.blip,
      route: job.route
    })),
    territories: territories.map((territory) => ({
      code: territory.code,
      name: territory.name,
      position: territory.position,
      radius: territory.radius,
      color: territory.color
    }))
  });

  return {
    getBlipPayload
  };
};

module.exports = { buildBlipService };
