const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');
const { createIncrementArray } = require('../helper/utils');

const CONFIG = {
  ethereum: {
    factories: [
      {
        factory: '0xa03492A9A663F04c51684A3c172FC9c4D7E02eDc',
        version: '0.5.0',
      },
      {
        factory: '0x89E583A67B5FA1B39b8CE7E77654071c3a34cc48',
        version: '0.6.0',
      },
    ],
    startBlock: 13234803,
    gasToken: ADDRESSES.ethereum.WETH,
  },
  avax: {
    factories: [
      {
        factory: '0x18aB6357f673696375018f006B86fE44F195DE1f',
        version: '0.5.1',
      },
    ],
    startBlock: 16037331,
    gasToken: ADDRESSES.avax.WAVAX,
  },
  polygon: {
    factories: [
      {
        factory: '0xb4FD0Ce108e196d0C9844c48174d4C32Cd42F7bC',
        version: '0.5.1',
      },
    ],
    startBlock: 32245577,
    gasToken: ADDRESSES.polygon.WMATIC_2,
  },
  bsc: {
    factories: [
      {
        factory: '0xb4FD0Ce108e196d0C9844c48174d4C32Cd42F7bC',
        version: '0.5.1',
      },
    ],
    startBlock: 20928838,
    gasToken: ADDRESSES.bsc.WBNB,
  },
  fantom: {
    factories: [
      {
        factory: '0xb4FD0Ce108e196d0C9844c48174d4C32Cd42F7bC',
        version: '0.5.1',
      },
    ],
    startBlock: 46604874,
    gasToken: ADDRESSES.fantom.WFTM,
  },
  optimism: {
    factories: [
      {
        factory: '0xb4FD0Ce108e196d0C9844c48174d4C32Cd42F7bC',
        version: '0.5.2',
      },
      {
        factory: '0x4f2be0244146b4408154504a481c799ba1a9a355',
        version: '0.6.0',
      },
    ],
    startBlock: 39240199,
    gasToken: ADDRESSES.tombchain.FTM,
  },
  arbitrum: {
    factories: [
      {
        factory: '0xb4FD0Ce108e196d0C9844c48174d4C32Cd42F7bC',
        version: '0.5.2',
      },
    ],
    startBlock: 33495774,
    gasToken: ADDRESSES.arbitrum.WETH,
  },
  aurora: {
    factories: [
      {
        factory: '0xb4FD0Ce108e196d0C9844c48174d4C32Cd42F7bC',
        version: '0.5.2',
      },
    ],
    startBlock: 80670441,
    gasToken: '0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb',
  },
};

Object.keys(CONFIG).forEach((chain) => {
  const { factories } = CONFIG[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      let currentRes;
      const pools = [];
      let tokens = [nullAddress];
      let i = 0;
      const length = 10

      for (const factory of factories) {
        if (factory.version >= '0.6') {
          const controller = await api.call({ target: factory.factory, abi: abis.getController, });
          const allowedTokens = await api.call({ target: controller, abi: abis.getAllowedTokens, });
          tokens.push(...allowedTokens);
        }
        do {
          const calls = createIncrementArray(length).map((j) => ({ params: j + i * length, }));
          const res = await api.multiCall({
            target: factory.factory,
            abi: abis.allPools,
            calls,
            permitFailure: true,
          });

          currentRes = res.filter((i) => i)
          pools.push(...currentRes);
          i++;
        } while (currentRes.length === length);
      }
      return sumTokens2({ tokens, owners: pools, api });
    },
  };
});

const abis = {
  allPools: 'function allPools(uint256) view returns (address)',
  getController: 'function controller() view returns (address)',
  getAllowedTokens: 'function getAllowedTokens() view returns (address[])',
};
